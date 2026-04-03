---
allowed-tools: Bash(git fetch:*), Bash(git merge:*), Bash(git stash:*), Bash(git status:*), Bash(git log:*), Bash(npm install:*), Bash(node dist/cli/index.js setup:*), Bash(cp:*), Bash(mkdir:*), Bash(ls:*), Bash(grep:*), Read
description: Upgrade OMC by pulling from upstream and syncing all components
---

## OMC Upgrade Skill

Upgrade oh-my-claudecode from the upstream repository (Yeachan-Heo/oh-my-claudecode).

### Steps

1. **Fetch upstream**
   ```
   git fetch upstream
   ```

2. **Check for local changes and stash if needed**
   ```
   git status
   git stash --include-untracked  # only if dirty
   ```

3. **Merge upstream/main**
   ```
   git merge upstream/main --no-edit
   ```
   - Resolve conflicts: prefer upstream (`git checkout --theirs`) for `dist/`, `bridge/`, `SECURITY.md` files
   - For source files with custom changes, resolve manually

4. **Install dependencies and build**
   ```
   npm install
   ```

5. **Run setup --force** (syncs hooks, agents, skills, version marker to ~/.claude/)
   ```
   node dist/cli/index.js setup --force
   ```

6. **Copy hooks lib** (setup bug workaround: lib/ not copied automatically)
   ```
   mkdir -p ~/.claude/hooks/lib
   cp templates/hooks/lib/*.mjs ~/.claude/hooks/lib/
   ```

7. **Update plugin cache** (HUD reads version from here)
   ```
   # Get new version from package.json
   NEW_VER=$(node -p "require('./package.json').version")
   
   # Create new version in plugin cache
   CACHE=~/.claude/plugins/cache/omc/oh-my-claudecode
   mkdir -p "$CACHE/$NEW_VER/dist"
   cp -r dist/* "$CACHE/$NEW_VER/dist/"
   cp package.json "$CACHE/$NEW_VER/package.json"
   ```

8. **Verify**
   - Check `package.json` version matches expected
   - Check `~/.claude/CLAUDE.md` has correct `OMC:VERSION` marker
   - Check plugin cache has new version directory with `dist/hud/index.js`

9. **Clean up stash** (if stashed in step 2)
   ```
   git stash drop  # if stashed build artifacts only
   # or: git stash pop  # if stashed custom changes
   ```

### Post-upgrade

Report the version change (old -> new) and confirm HUD version is correct.
