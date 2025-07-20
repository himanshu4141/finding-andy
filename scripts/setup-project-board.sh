#!/bin/bash

# GitHub Project Board Setup Script for Finding Andy Development
# This script helps set up the project board using GitHub CLI (gh)
# 
# Prerequisites:
# 1. GitHub CLI installed: https://cli.github.com/
# 2. Authenticated with GitHub: gh auth login
# 3. Repository access permissions

set -e

REPO="himanshu4141/finding-andy"
PROJECT_NAME="Finding Andy Development"
PROJECT_DESC="Development tracking for Finding Andy game - a pixel-art Where's Waldo game"

echo "🚀 Setting up GitHub Project Board: $PROJECT_NAME"
echo "Repository: $REPO"
echo

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo "Please install it from: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub CLI."
    echo "Please run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI is ready"

# Note: GitHub CLI currently has limited project v2 support
# This script provides the commands that would need to be run
echo
echo "📋 Manual Setup Required"
echo "GitHub CLI doesn't fully support Projects v2 yet. Please use the GitHub web interface:"
echo
echo "1. Go to: https://github.com/$REPO"
echo "2. Click 'Projects' tab"
echo "3. Click 'New project'"
echo "4. Select 'Board' template"
echo "5. Name: $PROJECT_NAME"
echo "6. Description: $PROJECT_DESC"
echo

echo "📝 Column Setup Commands (for reference):"
echo "After creating the project, add these columns:"
echo
echo "Column 1: Backlog"
echo "  Description: New issues and planned features waiting to be started"
echo
echo "Column 2: In Progress" 
echo "  Description: Issues currently being worked on by team members"
echo
echo "Column 3: Review"
echo "  Description: Pull requests and completed work awaiting review and testing"
echo
echo "Column 4: Done"
echo "  Description: Completed tasks that have been merged and closed"
echo

echo "🔗 Issues to Add to Board:"
echo

# Get issues using GitHub CLI
echo "Fetching current issues..."
gh issue list --repo "$REPO" --state all --json number,title,state --jq '.[] | "Issue #\(.number): \(.title) (\(.state))"'

echo
echo "📁 Files Created:"
echo "- PROJECT_BOARD_SETUP.md (detailed setup guide)"
echo "- .github/project-board-config.json (configuration reference)"
echo "- .github/workflows/project-board-automation.yml (automation workflow)"
echo
echo "📖 Next Steps:"
echo "1. Follow the manual setup instructions above"
echo "2. Read PROJECT_BOARD_SETUP.md for detailed guidance"
echo "3. Update the project URL in .github/workflows/project-board-automation.yml"
echo "4. Create a PROJECT_TOKEN secret for automation (if desired)"
echo
echo "✨ Project board setup files are ready!"