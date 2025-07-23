# Branch Protection Setup for ESLint Enforcement

This document explains how to configure branch protection rules to enforce ESLint checks on pull requests.

## Current ESLint Integration

The repository already has ESLint integrated into CI workflows:

- **Main Branch**: `deploy.yml` runs ESLint before building and deploying
- **Pull Requests**: `pr-preview.yml` runs ESLint before building PR previews

## Required Branch Protection Configuration

To prevent merging PRs with ESLint errors, configure the following branch protection rules for the `main` branch:

### Steps to Configure Branch Protection

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Branches**
3. Click **Add rule** or edit the existing rule for `main` branch
4. Configure the following settings:

#### Required Status Checks
- ✅ Enable "Require status checks to pass before merging"
- ✅ Enable "Require branches to be up to date before merging"
- ✅ Add the following required status checks:
  - `build-and-deploy / build-and-deploy` (from deploy.yml)
  - `build-and-deploy-preview / build-and-deploy-preview` (from pr-preview.yml)

#### Additional Recommended Settings
- ✅ "Restrict pushes that create files that exceed 100MB"
- ✅ "Require a pull request before merging"
- ✅ "Require approvals" (set to 1 or more)
- ✅ "Dismiss stale reviews when new commits are pushed"

## How It Works

With these settings:
1. All PRs must pass ESLint checks (via CI workflows) before merging
2. If ESLint fails, the PR cannot be merged until issues are fixed
3. The main branch deployment will continue to run ESLint and fail if issues exist

## ESLint Configuration

The project uses the following ESLint configuration:
- Config file: `eslint.config.js`
- Rules include TypeScript, React, and code quality checks
- The `prefer-const` rule enforces using `const` for variables that are never reassigned

## Current Status

✅ **ESLint Error Fixed**: Changed `let drawX = x` to `const drawX = x` in `src/game/GameEngine.ts`  
✅ **CI Integration**: ESLint runs on both main branch and PR workflows  
⚠️ **Branch Protection**: Needs to be configured manually in GitHub repository settings  

The repository is now ready for ESLint enforcement once branch protection rules are applied.