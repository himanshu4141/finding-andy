# Issue Categorization Guide

Quick reference for organizing Finding Andy development issues in the project board.

## Column Assignments

### 🎯 Backlog
**New issues and planned features**
- [Issue #1: Project Setup - React + TypeScript + Canvas Foundation](https://github.com/himanshu4141/finding-andy/issues/1)
- [Issue #2: Implement Zoom Lens and Mouse Drag Navigation](https://github.com/himanshu4141/finding-andy/issues/2)
- [Issue #5: Victory Animations & Fun Feedback](https://github.com/himanshu4141/finding-andy/issues/5)
- [Issue #6: Character Placement & Game Logic: Find Andy and Lady](https://github.com/himanshu4141/finding-andy/issues/6)
- [Issue #7: Crowd Graphics & Arena Design](https://github.com/himanshu4141/finding-andy/issues/7)

### 🚧 In Progress
**Currently being worked on**
- [Issue #4: Set Up Project Board & Issue Links](https://github.com/himanshu4141/finding-andy/issues/4) *(this issue)*

### 👀 Review
**Code review and testing phase**
- [PR #3: Complete React + TypeScript + Canvas Foundation](https://github.com/himanshu4141/finding-andy/pull/3)
- [PR #8: [WIP] Set Up Project Board & Issue Links](https://github.com/himanshu4141/finding-andy/pull/8)

### ✅ Done
**Completed and merged**
*(Will be populated as issues are completed)*

## Priority Classification

### 🔥 High Priority (Foundation)
Critical for basic game functionality:
- Issue #1: Project Setup 
- Issue #3: React Foundation (PR)
- Issue #2: Core Navigation

### 🟡 Medium Priority (Features)
Important game features:
- Issue #6: Game Logic & Characters
- Issue #7: Graphics & Assets

### 🟢 Low Priority (Polish)
Enhancement and user experience:
- Issue #5: Victory Animations
- Issue #4: Project Management

## Development Phases

### Phase 1: Foundation ⭐
- Issues #1, #3: Core project setup
- **Goal**: Working React/TypeScript/Canvas base

### Phase 2: Core Mechanics ⭐⭐
- Issues #2, #6: Navigation and game logic
- **Goal**: Playable game with basic finding mechanics

### Phase 3: Visual Polish ⭐⭐⭐
- Issues #7, #5: Graphics and animations
- **Goal**: Complete game ready for release

### Phase 4: Project Management 📋
- Issue #4: Development workflow optimization
- **Goal**: Streamlined development process

## Labels Reference

| Label | Color | Issues | Purpose |
|-------|-------|--------|---------|
| `foundation` | Blue | #1, #3 | Core setup tasks |
| `mechanics` | Purple | #2, #6 | Game logic & interaction |
| `graphics` | Light Blue | #7, #5 | Visual design & assets |
| `mobile` | Green | TBD | Mobile-specific features |
| `performance` | Red | TBD | Optimization tasks |
| `enhancement` | Blue-Grey | TBD | New feature additions |

## Automation Rules

| Trigger | Action | Target Column |
|---------|--------|---------------|
| Issue opened | Auto-move | Backlog |
| Issue assigned | Auto-move | In Progress |
| PR opened | Auto-move | Review |
| PR merged | Auto-move | Done |
| Issue closed | Auto-move | Done |

---

*This guide helps maintain consistent project board organization as the Finding Andy game develops.*