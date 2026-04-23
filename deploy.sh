#!/usr/bin/env bash

set -euo pipefail

# ---------------------------------------------------------------------------
# Deploy script for the monkvan site
# ---------------------------------------------------------------------------
# Expected usage:
#   ./deploy.sh [commit message]
# If no commit message is supplied a default one with the current timestamp is used.
# ---------------------------------------------------------------------------

# Repository root (the directory containing this script)
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Commit message – optionally supplied as the first argument
COMMIT_MSG="${1:-Deploy: $(date '+%Y-%m-%d %H:%M:%S')}"

# Remote repository – make sure we push to the correct repo
REMOTE_URL="https://github.com/vanvj00001/monkvan.git"

# The branch GitHub Pages expects
GH_PAGES_BRANCH="gh-pages"

# ---------------------------------------------------------------------------
# 1. Build the site
# ---------------------------------------------------------------------------
cd "$REPO_DIR"

echo "=========================================="
echo "发布博客到 https://vanvj00001.github.io/monkvan/"
echo "=========================================="

echo "[1/4] 清理旧构建..."
rm -rf public resources/_gen

echo "[2/4] 构建博客..."
hugo --minify

# ---------------------------------------------------------------------------
# 2. Prepare the gh‑pages branch
# ---------------------------------------------------------------------------
# If the branch does not exist locally we create it and set it to track the
# remote one.  Afterwards we reset the working tree to a clean state that only
# contains the generated site files.

echo "[3/4] 切换到 $GH_PAGES_BRANCH 分支并准备发布..."
if git rev-parse --verify "$GH_PAGES_BRANCH" >/dev/null 2>&1; then
  git checkout "$GH_PAGES_BRANCH"
else
  git checkout -b "$GH_PAGES_BRANCH"
fi

# Ensure we are up‑to‑date with the remote branch (if it already exists)
git pull "$REMOTE_URL" "$GH_PAGES_BRANCH" --ff-only || true

# Remove everything except .git (and the .nojekyll file if it exists)
find . -maxdepth 1 -not -name ".git" -not -name ".nojekyll" -not -name "." -exec rm -rf {} +

# Copy the freshly built site into the repository root
cp -r public/* .
# GitHub Pages should ignore Jekyll processing for Hugo output
touch .nojekyll

# ---------------------------------------------------------------------------
# 3. Commit and push
# ---------------------------------------------------------------------------

echo "[4/4] 提交更改并推送到 $GH_PAGES_BRANCH..."
git add -A
# If there is nothing new, the commit will fail – we treat that as a non‑error.
if git commit -m "$COMMIT_MSG"; then
  echo "提交成功"
else
  echo "没有新更改需要提交"
fi

git push "$REMOTE_URL" "$GH_PAGES_BRANCH"

# ---------------------------------------------------------------------------
# 4. Finish
# ---------------------------------------------------------------------------

echo "=========================================="
echo "发布完成！"
echo "博客地址：https://vanvj00001.github.io/monkvan/"
echo "=========================================="
