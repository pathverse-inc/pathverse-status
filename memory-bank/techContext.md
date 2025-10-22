# Tech Context: Pathverse Status Page

## Technology Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Geist Font**: Sans and mono fonts from Vercel

### Automation
- **GitHub Actions**: Workflow automation
- **actions/github-script@v7**: JavaScript execution in workflows
- **actions/checkout@v4**: Repository checkout
- **peter-evans/create-pull-request@v6**: PR automation
- **juliangruber/approve-pull-request-action@v2**: PR approval

### Data Storage
- **JSON Files**: Flat file storage (no database)
  - `public/status.json`: Service uptime arrays
  - `public/issues.json`: Active incident data

## Development Setup

### Project Structure
```
pathverse-status/
├── app/
│   ├── page.tsx          # Main status page (orchestration)
│   ├── layout.tsx        # Root layout
│   ├── globals.css       # Global styles
│   └── coms/             # Reusable UI components
│       ├── IssueAlert.tsx    # Issue display component
│       └── ServiceChart.tsx  # Chart component with graph
├── public/
│   ├── status.json       # Uptime data
│   └── issues.json       # Issues data
├── .github/
│   ├── workflows/
│   │   ├── api-health-check.yml
│   │   ├── webapp-health-check.yml
│   │   ├── compute-degradation.yml
│   │   ├── health-updater.yml
│   │   ├── create-deploy-pr.yml
│   │   └── auto-label-issues.yml
│   └── ISSUE_TEMPLATE/
│       ├── api-issue.yml
│       └── webapp-issue.yml
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
└── package.json
```

### Key Dependencies
```json
{
  "dependencies": {
    "next": "15.1.4",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}
```

## Technical Constraints

### GitHub Actions Limitations
1. **Workflow Call Syntax**: Cannot use matrix strategy with reusable workflows
   - Must create separate jobs for each workflow call
   - Cannot use `uses:` inside steps, only at job level

2. **Output Passing**: Job outputs must be explicitly declared
   - Reusable workflows define outputs in `workflow_call`
   - Calling workflow accesses via `needs.<job>.outputs.<name>`

3. **Context Interpolation**: GitHub context variables need proper escaping
   - Array outputs: Direct interpolation `${{ outputs.array_name }}`
   - No need for `JSON.parse()` wrapper when properly formatted

4. **Permissions**: Each job needs explicit permissions
   - `issues: read` for reading issue data
   - `contents: write` for committing files
   - `pull-requests: write` for creating PRs

### Next.js Constraints
1. **App Router**: Server components by default
   - Data imported directly at build time
   - No client-side fetching needed for static JSON

2. **Static Generation**: JSON files must be in `public/`
   - Can be imported with `@/public/` alias
   - Bundled at build time

3. **Component Organization**: Components in `app/coms/` directory
   - Co-located with pages for easy imports
   - Modular architecture for maintainability
   - TypeScript for type safety

## Tool Usage Patterns

### Health Check Pattern
```yaml
# Reusable workflow with workflow_call trigger
on:
  workflow_dispatch: {}
  workflow_call:
    outputs:
      status:
        value: ${{ jobs.check.outputs.status }}

jobs:
  check:
    runs-on: ubuntu-latest
    outputs:
      status: ${{ steps.health.outputs.status }}
    steps:
      - name: Check Health
        id: health
        run: |
          # 0 = down, 1 = up
          echo "status=1" >> $GITHUB_OUTPUT
```

### Issue Parsing Pattern
```bash
# Extract degradation score using grep with Perl regex
SCORE=$(echo "$body" | grep -oiP '\(degrade:\s*\K\d+(?=\))')

# Extract text between boundaries
startMarker='<!-- START: Write your issue description here'
endMarker='<!-- END: Issue description boundary'
extracted=$(echo "$body" | sed -n "/$startMarker/,/$endMarker/p")
```

### JSON Update Pattern
```javascript
// Read, modify, write in one script
const fs = require('fs');
let data = JSON.parse(fs.readFileSync('./public/status.json', 'utf8'));

// Update array with shift/push
data.api.shift();
data.api.push(newValue);

fs.writeFileSync('./public/status.json', JSON.stringify(data, null, 4));
```

### Git Automation Pattern
```bash
git config --local user.email "github-actions[bot]@users.noreply.github.com"
git config --local user.name "github-actions[bot]"
git add public/*.json
git diff --staged --quiet || git commit -m "chore: update status [skip ci]"
git push
```

## Build & Deployment
- **Build Command**: `npm run build` (Next.js build)
- **Dev Command**: `npm run dev` (local development server)
- **Deployment**: PR to `deploy` branch triggers deployment
- **Branch Strategy**:
  - `main`: Source of truth
  - `deploy`: Deployment branch (auto-updated via PR)

## Environment Requirements
- Node.js 20+ (for Next.js 15)
- GitHub repository with Actions enabled
- GitHub permissions for bot to create PRs
- No external services or databases needed
