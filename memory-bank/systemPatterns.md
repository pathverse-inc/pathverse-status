# System Patterns: Pathverse Status Page

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions (Cron)                     │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ API Health  │  │ Webapp Health│  │ Compute          │   │
│  │ Check       │  │ Check        │  │ Degradation      │   │
│  └──────┬──────┘  └──────┬───────┘  └────────┬─────────┘   │
│         │                │                    │             │
│         └────────────────┴────────────────────┘             │
│                          │                                   │
│                  ┌───────▼────────┐                         │
│                  │ Health Updater │                         │
│                  └───────┬────────┘                         │
└──────────────────────────┼──────────────────────────────────┘
                           │
                  ┌────────▼─────────┐
                  │ Update JSON Files│
                  │ - status.json    │
                  │ - issues.json    │
                  └────────┬─────────┘
                           │
                  ┌────────▼─────────┐
                  │ Create Deploy PR │
                  └────────┬─────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    Next.js Status Page                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Service Cards (API, Webapp)                          │   │
│  │  - Status badge (Up/Degraded/Down)                   │   │
│  │  - SVG Line graph (5 data points)                    │   │
│  │  - Time-based x-axis, 0-100 y-axis                   │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Issues Display                                       │   │
│  │  - Top: Announcements (down: false or undefined)     │   │
│  │  - Bottom: Critical outages (down: true)             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Key Technical Decisions

### 1. Reusable Workflow Pattern
**Decision**: Use GitHub Actions `workflow_call` for modularity  
**Rationale**: Health checks and degradation computation are reused across services  
**Implementation**: 
- Separate workflows for health checks (api, webapp)
- Single compute-degradation workflow with label parameter
- Health updater orchestrates all workflows

### 2. Rolling Array for Uptime History
**Decision**: Fixed 5-element array with shift/push pattern  
**Rationale**: Simple, predictable, no database needed  
**Implementation**:
```javascript
status.api.shift();      // Remove oldest
status.api.push(newVal); // Add newest
```

### 3. Issue Boundary Markers
**Decision**: HTML comments as boundaries in issue templates  
**Rationale**: Users can't accidentally break parsing, clean extraction  
**Pattern**:
```html
<!-- START: Write your issue description here -->
User content here with (degrade: 20)
<!-- END: Issue description boundary -->
```

### 4. Status Calculation Formula
**Decision**: `status = (health_check === 0) ? 0 : (100 - degradation_score)`  
**Rationale**: Health check failure overrides degradation (total outage), otherwise degrade from 100%  
**Examples**:
- Health=1, degradation=0 → 100 (fully operational)
- Health=1, degradation=25 → 75 (degraded)
- Health=0 → 0 (down, regardless of issues)

### 5. Label-Based Routing
**Decision**: Use GitHub labels for service/type identification  
**Labels**:
- `project_api` / `project_webapp` → Which service
- `issue_error` / `issue_warning` / `issue_info` → Issue severity
- `format_down` → Display below graphs (critical)

### 6. SVG for Graphs
**Decision**: Server-side SVG rendering instead of chart library  
**Rationale**: 
- No client-side JavaScript needed
- Full control over styling
- Works perfectly with SSR/SSG
- Minimal bundle size

### 7. Component Modularization
**Decision**: Extract UI components into separate files in `app/coms/`  
**Rationale**: 
- Eliminates code duplication (issues rendered twice)
- Single responsibility per component
- Easier to test and maintain
- Clearer page structure
**Implementation**:
- `IssueAlert.tsx`: Handles all issue type rendering
- `ServiceChart.tsx`: Self-contained chart with all graph logic

## Component Relationships

### Frontend Component Hierarchy
```
app/page.tsx (Main Page)
├── Imports: IssueAlert component
├── Imports: ServiceChart component
├── Renders: Top issues section
│   └── Maps: IssueAlert for each top issue
├── Renders: Service grid
│   └── Maps: ServiceChart for each service
└── Renders: Bottom issues section
    └── Maps: IssueAlert for each down issue

app/coms/IssueAlert.tsx
├── Props: issue, index
├── Logic: Type-based styling (error/warning/info)
└── Renders: Styled alert with icon and message

app/coms/ServiceChart.tsx
├── Props: serviceName, uptimeData
├── Logic: Status calculation, time labels, graph points
└── Renders: Card with status badge and SVG graph
```

### Workflow Dependencies
```
health-updater.yml
├── Calls: api-health-check.yml
├── Calls: webapp-health-check.yml  
├── Calls: compute-degradation.yml (× 2, different labels)
└── Calls: create-deploy-pr.yml

compute-degradation.yml
├── Input: issue_label (project_api or project_webapp)
├── Outputs: 
│   ├── degradation_score (total %)
│   ├── open_ids (array)
│   ├── closed_ids (array)
│   ├── format_down_ids (array)
│   └── issue_descriptions (JSON array)
```

### Data Flow
```
GitHub Issues
    ↓ (parsed)
compute-degradation.yml outputs
    ↓ (consumed by)
health-updater.yml
    ↓ (writes to)
status.json + issues.json
    ↓ (imported by)
app/page.tsx
    ↓ (renders)
Status Page HTML
```

## Critical Implementation Paths

### Path 1: Health Check → Status Update
1. Cron triggers `health-updater.yml` every 30 minutes
2. Parallel calls to health check workflows
3. Each returns `status: 0 or 1`
4. If 0 → set service status to 0
5. If 1 → compute `100 - degradation`
6. Shift first value, push new value
7. Commit changes

### Path 2: Issue Creation → Display
1. User creates issue from template
2. Auto-label action applies labels based on selections
3. Next health updater run:
   - `compute-degradation` finds issue by label
   - Parses description between boundaries
   - Extracts `(degrade: XX)`
   - Adds to `format_down_ids` if labeled
4. `health-updater` syncs to `issues.json`
5. Next page load displays issue

### Path 3: Issue Closure → Removal
1. Issue closed on GitHub
2. Next health updater run:
   - `compute-degradation` finds in recently closed
   - Returns in `closed_ids` array
3. `health-updater` filters out from `issues.json`
4. Next page load removes from display

## Design Pattern: Idempotent Updates
All workflow operations are idempotent:
- Health check: Always returns current state
- Degradation: Recalculates from scratch each time
- JSON updates: Full replace, not append
- Result: Safe to run multiple times, self-healing
