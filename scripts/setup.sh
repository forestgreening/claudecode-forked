#!/usr/bin/env bash
# setup.sh - One-command setup for oh-my-claude-sisyphus on a new PC
# Usage: bash scripts/setup.sh

set -euo pipefail

# ── Colors ────────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

# ── Helpers ───────────────────────────────────────────────────────────────────
info()    { echo -e "${CYAN}[setup]${RESET}  $*"; }
success() { echo -e "${GREEN}[ok]${RESET}     $*"; }
warn()    { echo -e "${YELLOW}[warn]${RESET}   $*"; }
error()   { echo -e "${RED}[error]${RESET}  $*" >&2; }
step()    { echo -e "\n${BOLD}$*${RESET}"; }

# ── Detect repo root ──────────────────────────────────────────────────────────
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"
info "Repo root: $REPO_ROOT"

# Convert to forward slashes for Node.js compatibility
REPO_ROOT_POSIX="${REPO_ROOT//\\//}"

# ── Summary state ─────────────────────────────────────────────────────────────
DID_INSTALL=false
DID_BUILD=false
DID_HOOK=false
DID_HUD=false
DID_SETTINGS=false
DID_REMOTE=false

# ── Step 1: npm install ───────────────────────────────────────────────────────
step "1/6  Installing dependencies..."
npm install
DID_INSTALL=true
success "npm install complete."

# ── Step 2: npm run build ─────────────────────────────────────────────────────
step "2/6  Building..."
npm run build
DID_BUILD=true
success "Build complete."

# ── Step 3: Install post-merge hook ──────────────────────────────────────────
step "3/6  Installing post-merge git hook..."
HOOK_SRC="$REPO_ROOT/scripts/hooks/post-merge"
HOOK_DST="$REPO_ROOT/.git/hooks/post-merge"

if [[ ! -f "$HOOK_SRC" ]]; then
  error "Hook source not found: $HOOK_SRC"
  exit 1
fi

cp "$HOOK_SRC" "$HOOK_DST"
chmod +x "$HOOK_DST"
DID_HOOK=true
success "post-merge hook installed."

# ── Step 4: Set up HUD wrapper ────────────────────────────────────────────────
step "4/6  Setting up HUD wrapper..."
HUD_DIR="$HOME/.claude/hud"
HUD_WRAPPER="$HUD_DIR/omc-hud.mjs"

mkdir -p "$HUD_DIR"

cat > "$HUD_WRAPPER" << HUDEOF
#!/usr/bin/env node
/**
 * OMC HUD - Statusline Script
 * Wrapper that imports from dev paths, plugin cache, or npm package
 */

import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

async function main() {
  const home = homedir();
  let pluginCacheVersion = null;
  let pluginCacheDir = null;

  // 0. Local repo (always checked first for fork/dev setups)
  const localRepoPaths = [
    "${REPO_ROOT_POSIX}/dist/hud/index.js",
  ];

  for (const localPath of localRepoPaths) {
    if (existsSync(localPath)) {
      try {
        await import(pathToFileURL(localPath).href);
        return;
      } catch { /* continue */ }
    }
  }

  // 1. Development paths (only when OMC_DEV=1)
  if (process.env.OMC_DEV === "1") {
    const devPaths = [
      join(home, "Workspace/oh-my-claudecode/dist/hud/index.js"),
      join(home, "workspace/oh-my-claudecode/dist/hud/index.js"),
      join(home, "projects/oh-my-claudecode/dist/hud/index.js"),
    ];

    for (const devPath of devPaths) {
      if (existsSync(devPath)) {
        try {
          await import(pathToFileURL(devPath).href);
          return;
        } catch { /* continue */ }
      }
    }
  }

  // 2. Plugin cache (for production installs)
  // Respect CLAUDE_CONFIG_DIR so installs under a custom config dir are found
  const configDir = process.env.CLAUDE_CONFIG_DIR || join(home, ".claude");
  const pluginCacheBase = join(configDir, "plugins", "cache", "omc", "oh-my-claudecode");
  if (existsSync(pluginCacheBase)) {
    try {
      const versions = readdirSync(pluginCacheBase);
      if (versions.length > 0) {
        // Filter to only versions with built dist/hud/index.js
        // This prevents picking an unbuilt new version after plugin update
        const builtVersions = versions.filter(version => {
          const pluginPath = join(pluginCacheBase, version, "dist/hud/index.js");
          return existsSync(pluginPath);
        });

        if (builtVersions.length > 0) {
          const latestVersion = builtVersions.sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).reverse()[0];
          pluginCacheVersion = latestVersion;
          pluginCacheDir = join(pluginCacheBase, latestVersion);
          const pluginPath = join(pluginCacheDir, "dist/hud/index.js");
          await import(pathToFileURL(pluginPath).href);
          return;
        }
      }
    } catch { /* continue */ }
  }

  // 3. npm package (global or local install)
  try {
    await import("oh-my-claudecode/dist/hud/index.js");
    return;
  } catch { /* continue */ }

  // 4. Fallback: provide detailed error message with fix instructions
  if (pluginCacheDir && existsSync(pluginCacheDir)) {
    // Plugin exists but dist/ folder is missing - needs build
    const distDir = join(pluginCacheDir, "dist");
    if (!existsSync(distDir)) {
      console.log(\`[OMC HUD] Plugin installed but not built. Run: cd "\${pluginCacheDir}" && npm install && npm run build\`);
    } else {
      console.log(\`[OMC HUD] Plugin dist/ exists but HUD not found. Run: cd "\${pluginCacheDir}" && npm run build\`);
    }
  } else if (existsSync(pluginCacheBase)) {
    // Plugin cache directory exists but no versions
    console.log(\`[OMC HUD] Plugin cache found but no versions installed. Run: /oh-my-claudecode:omc-setup\`);
  } else {
    // No plugin installation found at all
    console.log("[OMC HUD] Plugin not installed. Run: /oh-my-claudecode:omc-setup");
  }
}

main();
HUDEOF

DID_HUD=true
success "HUD wrapper written: $HUD_WRAPPER"

# ── Step 5: Update ~/.claude/settings.json ────────────────────────────────────
step "5/6  Updating ~/.claude/settings.json..."
SETTINGS_FILE="$HOME/.claude/settings.json"
HUD_WRAPPER_POSIX="${HUD_WRAPPER//\\//}"

if [[ ! -f "$SETTINGS_FILE" ]]; then
  # Create minimal settings.json with just the statusLine entry
  cat > "$SETTINGS_FILE" << EOF
{
  "statusLine": {
    "type": "command",
    "command": "node $HUD_WRAPPER_POSIX"
  }
}
EOF
  DID_SETTINGS=true
  success "settings.json created with statusLine entry."
else
  # Merge statusLine into existing settings.json using node
  node -e "
    const fs = require('fs');
    const path = '$SETTINGS_FILE';
    let settings = {};
    try {
      settings = JSON.parse(fs.readFileSync(path, 'utf8'));
    } catch (e) {
      settings = {};
    }
    settings.statusLine = { type: 'command', command: 'node $HUD_WRAPPER_POSIX' };
    fs.writeFileSync(path, JSON.stringify(settings, null, 2) + '\n');
    console.log('statusLine updated.');
  "
  DID_SETTINGS=true
  success "settings.json updated (existing settings preserved)."
fi

# ── Step 6: Set up upstream remote ────────────────────────────────────────────
step "6/6  Checking upstream remote..."
if git remote get-url upstream &>/dev/null; then
  info "upstream already configured: $(git remote get-url upstream)"
else
  git remote add upstream https://github.com/Yeachan-Heo/oh-my-claude-sisyphus.git
  DID_REMOTE=true
  success "upstream remote added: https://github.com/Yeachan-Heo/oh-my-claude-sisyphus.git"
fi

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}─────────────── Setup Summary ───────────────${RESET}"

if [[ "$DID_INSTALL" == true ]]; then
  echo -e "  ${GREEN}installed${RESET}  npm packages"
fi

if [[ "$DID_BUILD" == true ]]; then
  echo -e "  ${GREEN}built${RESET}      dist/ (agents, skills, HUD)"
fi

if [[ "$DID_HOOK" == true ]]; then
  echo -e "  ${GREEN}installed${RESET}  .git/hooks/post-merge"
else
  echo -e "  ${CYAN}skipped${RESET}    post-merge hook (already present)"
fi

if [[ "$DID_HUD" == true ]]; then
  echo -e "  ${GREEN}wrote${RESET}      ~/.claude/hud/omc-hud.mjs"
fi

if [[ "$DID_SETTINGS" == true ]]; then
  echo -e "  ${GREEN}updated${RESET}    ~/.claude/settings.json (statusLine)"
fi

if [[ "$DID_REMOTE" == true ]]; then
  echo -e "  ${GREEN}added${RESET}      upstream remote"
else
  echo -e "  ${CYAN}ok${RESET}         upstream remote already exists"
fi

echo -e "${BOLD}─────────────────────────────────────────────${RESET}"
echo ""
success "Setup complete. Run 'npm run update' to pull the latest changes."
