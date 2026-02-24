#!/usr/bin/env bash
# pull-update.sh - Pulls latest changes and rebuilds if needed
# Usage: bash scripts/pull-update.sh [--force] [--origin] [--branch <name>]

set -euo pipefail

# ── Colors ────────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

# ── Helpers ───────────────────────────────────────────────────────────────────
info()    { echo -e "${CYAN}[update]${RESET} $*"; }
success() { echo -e "${GREEN}[ok]${RESET}    $*"; }
warn()    { echo -e "${YELLOW}[warn]${RESET}  $*"; }
error()   { echo -e "${RED}[error]${RESET} $*" >&2; }
step()    { echo -e "\n${BOLD}$*${RESET}"; }

# ── Argument parsing ──────────────────────────────────────────────────────────
FORCE=false
REMOTE="upstream"
BRANCH="main"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --force)         FORCE=true; shift ;;
    --origin)        REMOTE="origin"; shift ;;
    --branch)        BRANCH="${2:?--branch requires a value}"; shift 2 ;;
    -h|--help)
      echo "Usage: bash scripts/pull-update.sh [--force] [--origin] [--branch <name>]"
      echo ""
      echo "  --force          Always run npm install + npm run build"
      echo "  --origin         Pull from origin instead of upstream"
      echo "  --branch <name>  Branch to pull (default: main)"
      exit 0
      ;;
    *) error "Unknown flag: $1"; exit 1 ;;
  esac
done

# ── Change to repo root ───────────────────────────────────────────────────────
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# ── Summary state ─────────────────────────────────────────────────────────────
DID_PULL=false
DID_INSTALL=false
DID_BUILD=false
BEFORE_SHA=""
AFTER_SHA=""

# ── Step 1: Verify remote exists ──────────────────────────────────────────────
step "1/5  Checking remote '$REMOTE'..."
if ! git remote get-url "$REMOTE" &>/dev/null; then
  error "Remote '$REMOTE' does not exist."
  error "Available remotes: $(git remote | tr '\n' ' ')"
  exit 1
fi
info "Remote: $(git remote get-url "$REMOTE")"
info "Branch: $BRANCH"

# ── Step 2: Git pull ──────────────────────────────────────────────────────────
step "2/5  Pulling from $REMOTE/$BRANCH..."
BEFORE_SHA="$(git rev-parse HEAD)"
DID_STASH=false

# Auto-stash local changes to avoid merge conflicts
if ! git diff --quiet 2>/dev/null || ! git diff --cached --quiet 2>/dev/null; then
  info "Local changes detected - stashing..."
  git stash push -m "pull-update: auto-stash before merge" --quiet
  DID_STASH=true
  success "Stashed local changes."
fi

# Fetch first so we can inspect what changed even before merging
git fetch "$REMOTE" "$BRANCH"

REMOTE_SHA="$(git rev-parse "$REMOTE/$BRANCH")"

if [[ "$BEFORE_SHA" == "$REMOTE_SHA" ]]; then
  success "Already up to date."
else
  git merge --ff-only "$REMOTE/$BRANCH" || {
    warn "Fast-forward not possible. Attempting merge..."
    git merge "$REMOTE/$BRANCH" -m "chore: merge $REMOTE/$BRANCH"
  }
  AFTER_SHA="$(git rev-parse HEAD)"
  DID_PULL=true
  success "Pulled $(git log --oneline "${BEFORE_SHA}..${AFTER_SHA}" | wc -l | tr -d ' ') new commit(s)."
  git log --oneline "${BEFORE_SHA}..${AFTER_SHA}" | head -10 | while read -r line; do
    info "  $line"
  done
fi

AFTER_SHA="$(git rev-parse HEAD)"

# Restore stashed changes
if [[ "$DID_STASH" == true ]]; then
  info "Restoring stashed changes..."
  if git stash pop --quiet 2>/dev/null; then
    success "Stash restored."
  else
    warn "Stash pop had conflicts. Resolve manually with: git stash pop"
  fi
fi

# ── Helper: detect changed files ──────────────────────────────────────────────
files_changed_between() {
  local from="$1" to="$2" pattern="$3"
  git diff --name-only "${from}" "${to}" 2>/dev/null | grep -qE "$pattern"
}

INSTALL_PATTERNS='^(package\.json|package-lock\.json)$'
BUILD_PATTERNS='^(src/|agents/|skills/|scripts/|bridge/)'

# ── Step 3: npm install (if needed) ───────────────────────────────────────────
step "3/5  Checking if npm install is needed..."

NEED_INSTALL=false
if [[ "$FORCE" == true ]]; then
  NEED_INSTALL=true
  info "  --force flag set."
elif [[ "$DID_PULL" == true ]] && files_changed_between "$BEFORE_SHA" "$AFTER_SHA" "$INSTALL_PATTERNS"; then
  NEED_INSTALL=true
  info "  package.json or package-lock.json changed."
fi

if [[ "$NEED_INSTALL" == true ]]; then
  info "Running npm install..."
  npm install || { error "npm install failed."; exit 1; }
  DID_INSTALL=true
  success "npm install complete."
else
  info "No package changes - skipping npm install."
fi

# ── Step 4: npm run build (if needed) ─────────────────────────────────────────
step "4/5  Checking if build is needed..."

NEED_BUILD=false
if [[ "$FORCE" == true ]]; then
  NEED_BUILD=true
  info "  --force flag set."
elif [[ "$DID_INSTALL" == true ]]; then
  NEED_BUILD=true
  info "  Dependencies changed - rebuild required."
elif [[ "$DID_PULL" == true ]] && files_changed_between "$BEFORE_SHA" "$AFTER_SHA" "$BUILD_PATTERNS"; then
  NEED_BUILD=true
  info "  Source files changed."
fi

if [[ "$NEED_BUILD" == true ]]; then
  info "Running npm run build..."
  npm run build || { error "npm run build failed."; exit 1; }
  DID_BUILD=true
  success "Build complete."
else
  info "No source changes - skipping build."
fi

# ── Step 5: Verify HUD ───────────────────────────────────────────────────────
step "5/5  Verifying HUD statusline..."

HUD_OK=false
HUD_ENTRY="$REPO_ROOT/dist/hud/index.js"
HUD_WRAPPER="$HOME/.claude/hud/omc-hud.mjs"
SETTINGS_FILE="$HOME/.claude/settings.json"

if [[ -f "$HUD_ENTRY" ]]; then
  success "HUD entry found: dist/hud/index.js"
  HUD_OK=true
else
  warn "HUD entry missing: dist/hud/index.js"
  warn "Build may have failed. Try: npm run build"
fi

# Ensure settings.json points to the wrapper, not the direct dist path
if [[ -f "$SETTINGS_FILE" ]]; then
  if grep -q "omc-hud.mjs" "$SETTINGS_FILE"; then
    success "settings.json uses HUD wrapper (omc-hud.mjs)."
  elif grep -q "dist.*hud.*index.js" "$SETTINGS_FILE"; then
    warn "settings.json points directly to dist/hud/index.js (fragile)."
    warn "Consider updating to use the wrapper: omc-hud.mjs"
  fi
fi

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}─────────────── Summary ───────────────${RESET}"
if [[ "$DID_PULL" == true ]]; then
  echo -e "  ${GREEN}pulled${RESET}    $REMOTE/$BRANCH  (${BEFORE_SHA:0:7} → ${AFTER_SHA:0:7})"
else
  echo -e "  ${CYAN}up-to-date${RESET}  no new commits"
fi

if [[ "$DID_INSTALL" == true ]]; then
  echo -e "  ${GREEN}installed${RESET} npm packages"
else
  echo -e "  ${CYAN}skipped${RESET}   npm install"
fi

if [[ "$DID_BUILD" == true ]]; then
  echo -e "  ${GREEN}built${RESET}     npm run build"
else
  echo -e "  ${CYAN}skipped${RESET}   npm run build"
fi

if [[ "$HUD_OK" == true ]]; then
  echo -e "  ${GREEN}hud${RESET}       active"
else
  echo -e "  ${RED}hud${RESET}       broken - run 'npm run build'"
fi
echo -e "${BOLD}────────────────────────────────────────${RESET}"
echo ""
success "Done."
