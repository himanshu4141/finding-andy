# GitHub Project Board Setup Guide

This document provides step-by-step instructions for setting up the "Finding Andy Development" GitHub Project board as specified in [Issue #4](https://github.com/himanshu4141/finding-andy/issues/4).

## Overview

The GitHub Project board will organize all development tasks for the Finding Andy game with a clear workflow from conception to completion.

## Project Board Configuration

### Board Name
**Finding Andy Development**

### Columns Structure

| Column | Purpose | Automation Rules |
|--------|---------|------------------|
| **Backlog** | New issues and future features | Newly created issues auto-move here |
| **In Progress** | Currently being worked on | Issues moved here when assigned or PR opened |
| **Review** | Code review and testing phase | PRs auto-move here when opened |
| **Done** | Completed and merged tasks | PRs auto-move here when merged/closed |

## Step-by-Step Setup Instructions

### 1. Create New Project Board

1. Navigate to the repository: `https://github.com/himanshu4141/finding-andy`
2. Click on the **"Projects"** tab
3. Click **"New project"** (green button)
4. Select **"Board"** template
5. Name the project: **"Finding Andy Development"**
6. Add description: *"Development tracking for Finding Andy game - a pixel-art Where's Waldo game"*
7. Set visibility to **"Private"** or **"Public"** as preferred
8. Click **"Create project"**

### 2. Configure Columns

#### Delete Default Columns (if any)
- Remove any default columns that don't match our structure

#### Create Required Columns
Add the following columns in order:

**Column 1: Backlog**
- Name: `Backlog`
- Description: `New issues and planned features waiting to be started`

**Column 2: In Progress**
- Name: `In Progress` 
- Description: `Issues currently being worked on by team members`

**Column 3: Review**
- Name: `Review`
- Description: `Pull requests and completed work awaiting review and testing`

**Column 4: Done**
- Name: `Done`
- Description: `Completed tasks that have been merged and closed`

### 3. Link Existing Issues

The following issues should be added to the project board:

#### Issues to Add to Backlog
- [Issue #1: Project Setup - React + TypeScript + Canvas Foundation](https://github.com/himanshu4141/finding-andy/issues/1)
- [Issue #2: Implement Zoom Lens and Mouse Drag Navigation](https://github.com/himanshu4141/finding-andy/issues/2)
- [Issue #5: Victory Animations & Fun Feedback](https://github.com/himanshu4141/finding-andy/issues/5)
- [Issue #6: Character Placement & Game Logic: Find Andy and Lady](https://github.com/himanshu4141/finding-andy/issues/6)
- [Issue #7: Crowd Graphics & Arena Design](https://github.com/himanshu4141/finding-andy/issues/7)

#### Issues to Add to In Progress
- [Issue #4: Set Up Project Board & Issue Links](https://github.com/himanshu4141/finding-andy/issues/4) *(this issue)*

#### Pull Requests to Add to Review
- [PR #3: Complete React + TypeScript + Canvas Foundation](https://github.com/himanshu4141/finding-andy/pull/3)
- [PR #8: [WIP] Set Up Project Board & Issue Links](https://github.com/himanshu4141/finding-andy/pull/8)

**To add issues/PRs to the board:**
1. In the project board view, click **"Add items"**
2. Search for and select each issue/PR by number
3. Drag items to the appropriate columns

### 4. Configure Automation

#### Built-in Workflows (Recommended)
Enable the following built-in automation workflows:

**For "In Progress" Column:**
- Auto-move when issue is assigned
- Auto-move when PR is opened from linked branch

**For "Review" Column:**
- Auto-move PR when it's ready for review
- Auto-move when PR is marked as "Ready for review" (if draft)

**For "Done" Column:**
- Auto-move when PR is merged
- Auto-move when issue is closed

#### To Set Up Automation:
1. In the project board, click the **"⚙️ Settings"** (three dots menu)
2. Select **"Workflows"**
3. Click **"Add workflow"**
4. Choose from built-in workflows:
   - **"Item added to project"**: Auto-move new items to Backlog
   - **"Item reopened"**: Move back to Backlog
   - **"Pull request merged"**: Move to Done
   - **"Issue closed"**: Move to Done

## Issue Categories and Priorities

### Development Phases

| Phase | Issues | Priority |
|-------|--------|----------|
| **Foundation** | #1, #3 | High |
| **Core Mechanics** | #2, #6 | High |
| **Graphics & Assets** | #7 | Medium |
| **Polish & UX** | #5 | Medium |
| **Project Management** | #4, #8 | Medium |

### Labels for Better Organization

Consider adding these labels to issues for better filtering:

- `foundation` - Core project setup
- `mechanics` - Game logic and interaction
- `graphics` - Visual assets and design
- `mobile` - Mobile-specific features
- `performance` - Optimization tasks
- `bug` - Bug fixes
- `enhancement` - New features

## Board Maintenance

### Regular Reviews
- **Weekly**: Review In Progress column for blocked items
- **Sprint Planning**: Move items from Backlog to In Progress
- **PR Review**: Ensure Review column doesn't get stale

### Best Practices
- Keep In Progress column limited (max 3-4 items per person)
- Add detailed descriptions to cards when moving them
- Use comments for status updates
- Link related issues using GitHub's keyword syntax (e.g., "Related to #2")

## Access and Permissions

Ensure the following team members have appropriate access:
- Repository owner: Admin access
- Active contributors: Write access
- External reviewers: Read access

## Success Metrics

The project board setup will be considered successful when:
- ✅ All existing issues are properly categorized
- ✅ New issues automatically appear in Backlog
- ✅ PR workflows move items through Review to Done
- ✅ Team members can easily see project status at a glance
- ✅ Issue movement automation reduces manual overhead

---

*This setup guide ensures the Finding Andy Development project board provides clear visibility into the game's development progress and streamlines the workflow from concept to completion.*