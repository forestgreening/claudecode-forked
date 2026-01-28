/**
 * Ralfresh State Management
 *
 * Extracted from index.ts to break circular dependency with loop.ts.
 * Provides: read/write/clear state, active check, sub-mode cleanup.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import type { RalfreshState } from './types.js';

/**
 * Get the state file path for ralfresh
 */
function getStateFilePath(directory: string): string {
  return join(directory, '.omc', 'state', 'ralfresh-state.json');
}

/**
 * Ensure the .omc/state directory exists
 */
function ensureStateDir(directory: string): void {
  const stateDir = join(directory, '.omc', 'state');
  if (!existsSync(stateDir)) {
    mkdirSync(stateDir, { recursive: true });
  }
}

/**
 * Read ralfresh state from disk
 */
export function readRalfreshState(directory: string): RalfreshState | null {
  const stateFile = getStateFilePath(directory);

  if (!existsSync(stateFile)) {
    return null;
  }

  try {
    const content = readFileSync(stateFile, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Write ralfresh state to disk
 *
 * CONCURRENCY NOTE: This function performs a file write without locking.
 * It assumes a single-writer model where only one process/thread modifies
 * ralfresh state at a time. This is safe in the Claude Code context where
 * hooks run synchronously within a single session.
 *
 * If concurrent access is ever needed, consider:
 * - File locking with `proper-lockfile` package
 * - Atomic writes via temp file + rename
 */
export function writeRalfreshState(directory: string, state: RalfreshState): boolean {
  try {
    ensureStateDir(directory);
    const stateFile = getStateFilePath(directory);
    writeFileSync(stateFile, JSON.stringify(state, null, 2));
    return true;
  } catch {
    return false;
  }
}

/**
 * Clear ralfresh state
 */
export function clearRalfreshState(directory: string): boolean {
  const stateFile = getStateFilePath(directory);

  if (!existsSync(stateFile)) {
    return true;
  }

  try {
    unlinkSync(stateFile);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if ralfresh is currently active
 */
export function isRalfreshActive(directory: string): boolean {
  const state = readRalfreshState(directory);
  return state?.active === true;
}

/**
 * Clear all sub-mode states associated with ralfresh
 * Follows the same cleanup pattern as the cancel skill
 *
 * @param directory Working directory
 * @param sessionId Optional session ID to verify ownership before clearing global state
 */
export function clearAllRalfreshSubModes(directory: string, sessionId?: string): boolean {
  const stateDir = join(directory, '.omc', 'state');
  let success = true;

  // Files to clean up (local only - safe to delete)
  const localFilesToDelete = [
    // Ralplan / plan consensus
    'plan-consensus.json',
    // Swarm (SQLite + marker)
    'swarm.db',
    'swarm.db-wal',
    'swarm.db-shm',
    'swarm-active.marker',
    // Ultrawork
    'ultrawork-state.json',
    // Ralph (ralfresh may have spawned ralph as sub-mode)
    'ralph-state.json',
    'ralph-verification.json'
  ];

  for (const file of localFilesToDelete) {
    const filePath = join(stateDir, file);
    if (existsSync(filePath)) {
      try {
        unlinkSync(filePath);
      } catch {
        success = false;
      }
    }
  }

  // Global state files - only clear if session matches
  const homeDir = process.env.HOME || process.env.USERPROFILE;
  if (!homeDir) {
    console.warn('[Ralfresh] HOME/USERPROFILE not set, skipping global state cleanup');
    return success;  // Skip global cleanup, still return local success status
  }

  const globalStateDir = join(homeDir, '.claude');
  const globalFiles = ['ultrawork-state.json', 'ralph-state.json'];

  for (const file of globalFiles) {
    const filePath = join(globalStateDir, file);  // USE the variable
    if (existsSync(filePath)) {
      try {
        // Verify ownership before deleting
        const content = readFileSync(filePath, 'utf-8');
        const state = JSON.parse(content);

        // Only delete if sessionId matches or no sessionId provided (force clean)
        if (!sessionId || state.session_id === sessionId || state.sessionId === sessionId) {
          unlinkSync(filePath);
        }
      } catch {
        success = false;
      }
    }
  }

  return success;
}
