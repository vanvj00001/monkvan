#!/usr/bin/env bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

function echo_info() { echo -e "${GREEN}✓ $1${NC}"; }
function echo_error() { echo -e "${RED}✗ $1${NC}"; }
function echo_blue() { echo -e "${BLUE}→ $1${NC}"; }
function echo_yellow() { echo -e "${YELLOW}⚠ $1${NC}"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

BUILD_SCRIPT="$SCRIPT_DIR/build-both-themes.sh"
BUILD_DIR="$SCRIPT_DIR/public"
TARGET_BRANCH="main"

function require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo_error "命令 '$1' 不存在，请先安装它。"
    exit 1
  fi
}

require_command git
require_command hugo

if [ ! -x "$BUILD_SCRIPT" ]; then
  echo_error "找不到可执行的构建脚本：$BUILD_SCRIPT"
  exit 1
fi

if [ ! -d "themes/hugo-book" ] || [ ! -d "themes/PaperMod" ]; then
  echo_error "缺少主题目录，请先确保 themes/hugo-book 和 themes/PaperMod 已安装。"
  exit 1
fi

echo_blue "1/3 构建双主题站点"
"$BUILD_SCRIPT"

echo_blue "2/3 检查当前分支"
CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [ "$CURRENT_BRANCH" != "$TARGET_BRANCH" ]; then
  echo_yellow "当前分支为 $CURRENT_BRANCH，将切换到 $TARGET_BRANCH"
  git checkout "$TARGET_BRANCH"
fi

echo_blue "3/3 同步并推送 main"
# 将所有源代码更改加入暂存区，剔除旧的 themes 和工作树目录
git add -A -- .
set +e
git reset -- themes .gh-pages-worktree >/dev/null 2>&1
set -e

# 检查并提交改动
if git diff --cached --quiet; then
  echo_info "没有新的提交内容"
else
  git commit -m "Deploy: $(date +'%Y-%m-%d %H:%M:%S')"
fi

# 推送 main 分支
git push origin "$TARGET_BRANCH"

echo_info "部署完成：已推送到 origin/$TARGET_BRANCH"
