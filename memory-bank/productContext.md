# Product Context: Pathverse Status Page

## Purpose
Provide transparent, real-time visibility into Pathverse service health for users and stakeholders, with automated monitoring and incident tracking.

## Problems Solved

### 1. Service Transparency
**Problem**: Users need to know if services are operational or experiencing issues  
**Solution**: Public status page displaying current health and historical uptime for API and Webapp

### 2. Incident Communication
**Problem**: Need to communicate outages and maintenance without manual updates  
**Solution**: Automated synchronization from GitHub issues to public status page with two display modes (announcements vs critical outages)

### 3. Historical Tracking
**Problem**: Users want to see service reliability over time  
**Solution**: 5-point rolling uptime history displayed as interactive graphs with time-based x-axis

### 4. Manual Monitoring Overhead
**Problem**: Manually checking service health and updating status is time-consuming  
**Solution**: Automated health checks every 30 minutes with degradation scoring from tracked issues

## How It Works

### User Experience Flow
1. **User visits status page** → Sees current service status at a glance
2. **Views graphs** → Understands recent uptime patterns with 30-minute intervals
3. **Reads announcements** → Informed about planned maintenance or minor issues (top section)
4. **Sees critical alerts** → Immediately aware of service outages (below graphs, red indicators)

### Issue-Based Degradation System
- GitHub issues with special labels track service problems
- Each issue includes a degradation score: `(degrade: 20)` means 20% impact
- Multiple issues stack: 3 issues × 20% = 60% degradation
- Final status: `100 - total_degradation` (unless health check fails → 0)
- Issues with `format_down` label display below graphs for visibility

### Status States
- **Up (100%)**: Green indicator, all systems operational
- **Degraded (1-99%)**: Yellow indicator, partial functionality
- **Down (0%)**: Red indicator, service unavailable

## User Goals
1. **Quickly assess** if services are operational
2. **Understand impact** of any current issues
3. **Plan around outages** by seeing maintenance windows
4. **Trust reliability** through historical uptime data
5. **Get updates automatically** without refreshing/manual checks

## Design Principles
- **Clarity**: Status should be obvious at a glance
- **Honesty**: Show real data, don't hide degradation
- **Automation**: Zero manual updates required
- **Simplicity**: Clean interface without unnecessary complexity
- **Transparency**: Historical data shows reliability trends
