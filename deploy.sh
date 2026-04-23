#!/usr/bin/env bash
# -----------------------------------------------------------------
# Deploy script for the monkvan Hugo site
# -----------------------------------------------------------------
# Usage: ./deploy.sh [commit message]
# If no message is supplied a default one with a timestamp is used.
# -----------------------------------------------------------------

set -euo pipefail

# ----------------------------------------
# Configuration
# ----------------------------------------
REMOTE_URL="https://github.com/vanvj00001/monkvan.git"
GH_PAGES_BRANCH="gh-pages"
COMMIT_MSG="${1:-Deploy: $(date '+%Y-%m-%d %H:%M:%S')}"

# ----------------------------------------
# 1. Build the site
# ----------------------------------------
echo "=========================================="
echo "Building Hugo site …"
echo "=========================================="

hugo --minify   # generates ./public

# ----------------------------------------
# 2. Prepare a temporary work‑tree on gh‑pages
# ----------------------------------------
TMP_WT=$(mktemp -d)

# If gh‑pages exists locally, use it; otherwise create it from the remote (or as new)
if git rev-parse --verify "$GH_PAGES_BRANCH" >/dev/null 2>&1; then
    git worktree add -B "$GH_PAGES_BRANCH" "$TMP_WT" "$GH_PAGES_BRANCH"
else
    # Try to fetch the branch from remote; if that fails we create a fresh orphan branch
    git fetch "$REMOTE_URL" "$GH_PAGES_BRANCH":"$GH_PAGES_BRANCH" 2>/dev/null || true
    git worktree add -B "$GH_PAGES_BRANCH" "$TMP_WT"
fi

# ----------------------------------------
# 3. Copy site files into the work‑tree
# ----------------------------------------
echo "[3/4] Copying site files to $GH_PAGES_BRANCH …"
# Remove everything in the work‑tree except its own .git directory
find "$TMP_WT" -mindepth 1 -maxdepth 1 ! -name ".git" -exec rm -rf {} +

# Copy the freshly built site
cp -r public/* "$TMP_WT/"
# Ensure GitHub Pages skips Jekyll processing
touch "$TMP_WT/.nojekyll"

# ----------------------------------------
# 4. Commit & push the gh‑pages branch
# ----------------------------------------
cd "$TMP_WT"

echo "[4/4] Committing and pushing $GH_PAGES_BRANCH …"

git add -A
if git commit -m "$COMMIT_MSG"; then
    echo "Commit created."
else
    echo "No changes to commit."
fi

git push "$REMOTE_URL" "$GH_PAGES_BRANCH"

# ----------------------------------------
# 5. Clean up temporary work‑tree
# ----------------------------------------
cd -
git worktree remove "$TMP_WT"

echo "=========================================="
echo "Deploy finished!"
echo "Site is live at: https://vanvj00001.github.io/monkvan/"
echo "=========================================="
