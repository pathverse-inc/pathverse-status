# Project Brief: Pathverse Status Page

## Overview
A Next.js-based status page system for monitoring Pathverse service uptime (API and Webapp) with automated GitHub Actions workflows for health checking, issue tracking, and deployment.

## Core Requirements

### 1. Status Page Display
- Display real-time service health for API and Webapp
- Show 5-point uptime history as line graphs with plotted points
- Support three status states: Up (100%), Degraded (1-99%), Down (0%)
- Display time-based x-axis (30-minute intervals) and y-axis scale (0-100)
- Dark theme optimized with explicit hex colors

### 2. Issues Display System
- Show active incidents and announcements from `issues.json`
- Two positioning modes:
  - **Top issues**: Regular announcements displayed above status cards
  - **Down issues**: Critical incidents (with `down: true`) displayed below graphs
- Support three issue types: error (red), warning (yellow), info (blue)
- Parse issue descriptions from GitHub issues using boundary markers

### 3. GitHub Actions Automation
- **Health Checks**: Monitor API (401 = healthy with auth) and Webapp (200 = healthy) endpoints
- **Degradation Computation**: Parse GitHub issues for degradation scores using `(degrade: XX)` pattern
- **Issue Templates**: Standardized templates with auto-labeling (project_api, project_webapp, issue_error/warning/info, format_down)
- **Health Updater**: 30-minute cron job that:
  - Runs health checks for both services
  - Computes degradation from open GitHub issues
  - Updates `status.json` with new uptime values (shift first, push last)
  - Updates `issues.json` by syncing with GitHub issues
  - Creates deploy PR to deploy branch

### 4. Data Flow
```
GitHub Issues (with templates)
    ↓
Health Check Workflows (every 30 min)
    ↓
Compute Degradation (parse issues)
    ↓
Health Updater (sync data)
    ↓
Update status.json & issues.json
    ↓
Create Deploy PR
    ↓
Status Page Display (Next.js)
```

## Success Criteria
- Automated monitoring with no manual intervention
- Accurate uptime tracking with 5-point rolling history
- Real-time issue synchronization from GitHub
- Clean, responsive dark theme interface
- Automated deployment pipeline

## Constraints
- Must use GitHub Actions for all automation
- Data stored in JSON files (status.json, issues.json)
- No database required
- Must support reusable workflows for modularity
