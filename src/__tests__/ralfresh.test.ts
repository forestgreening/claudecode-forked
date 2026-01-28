import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

import {
  readRalfreshState,
  writeRalfreshState,
  clearRalfreshState,
  isRalfreshActive,
  initRalfresh,
  clearAllRalfreshSubModes,
  transitionRalfreshPhase,
  incrementRalfreshIteration,
  addRalfreshLearning,
  addRalfreshIssue,
  MAX_LEARNINGS,
  MAX_ISSUES,
  MAX_ENTRY_LENGTH
} from '../hooks/ralfresh/index.js';

// Mock mode-registry to avoid side effects
vi.mock('../hooks/mode-registry/index.js', () => ({
  canStartMode: vi.fn(() => ({ allowed: true, message: '' }))
}));

// Mock notepad-wisdom to avoid file system side effects
vi.mock('../features/notepad-wisdom/index.js', () => ({
  initPlanNotepad: vi.fn(),
  addLearning: vi.fn(),
  addIssue: vi.fn(),
  readPlanWisdom: vi.fn(() => null)
}));

describe('Ralfresh State Management', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'ralfresh-test-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  describe('readRalfreshState', () => {
    it('returns null when no state file exists', () => {
      expect(readRalfreshState(tempDir)).toBeNull();
    });

    it('reads existing state correctly', () => {
      const state = initRalfresh(tempDir, 'test prompt');
      const read = readRalfreshState(tempDir);
      expect(read).not.toBeNull();
      expect(read?.prompt).toBe('test prompt');
    });

    it('returns null for corrupted state file', () => {
      const stateDir = join(tempDir, '.omc', 'state');
      mkdirSync(stateDir, { recursive: true });
      writeFileSync(join(stateDir, 'ralfresh-state.json'), 'invalid json');
      expect(readRalfreshState(tempDir)).toBeNull();
    });
  });

  describe('writeRalfreshState', () => {
    it('creates state file', () => {
      const state = initRalfresh(tempDir, 'test');
      expect(state).not.toBeNull();
      const read = readRalfreshState(tempDir);
      expect(read).toEqual(state);
    });

    it('creates directories if they do not exist', () => {
      const state = initRalfresh(tempDir, 'test');
      expect(state).not.toBeNull();
      expect(existsSync(join(tempDir, '.omc', 'state'))).toBe(true);
    });
  });

  describe('clearRalfreshState', () => {
    it('removes state file', () => {
      initRalfresh(tempDir, 'test');
      expect(isRalfreshActive(tempDir)).toBe(true);
      clearRalfreshState(tempDir);
      expect(isRalfreshActive(tempDir)).toBe(false);
    });

    it('returns true when no state file exists', () => {
      expect(clearRalfreshState(tempDir)).toBe(true);
    });

    it('returns true after successfully deleting state', () => {
      initRalfresh(tempDir, 'test');
      expect(clearRalfreshState(tempDir)).toBe(true);
    });
  });

  describe('isRalfreshActive', () => {
    it('returns false when no state', () => {
      expect(isRalfreshActive(tempDir)).toBe(false);
    });

    it('returns true when active', () => {
      initRalfresh(tempDir, 'test');
      expect(isRalfreshActive(tempDir)).toBe(true);
    });

    it('returns false when state exists but active is false', () => {
      const state = initRalfresh(tempDir, 'test');
      if (state) {
        state.active = false;
        writeRalfreshState(tempDir, state);
      }
      expect(isRalfreshActive(tempDir)).toBe(false);
    });
  });

  describe('initRalfresh', () => {
    it('creates state with correct initial values', () => {
      const state = initRalfresh(tempDir, 'test task');
      expect(state).not.toBeNull();
      expect(state?.active).toBe(true);
      expect(state?.iteration).toBe(1);
      expect(state?.phase).toBe('planning');
      expect(state?.prompt).toBe('test task');
      expect(state?.learnings).toEqual([]);
      expect(state?.issues).toEqual([]);
    });

    it('respects skipPlanning config', () => {
      const state = initRalfresh(tempDir, 'test', undefined, { skipPlanning: true });
      expect(state?.phase).toBe('execution');
      expect(state?.phases.execution.status).toBe('in_progress');
    });

    it('respects maxIterations config', () => {
      const state = initRalfresh(tempDir, 'test', undefined, { maxIterations: 10 });
      expect(state?.maxIterations).toBe(10);
    });

    it('sets sessionId when provided', () => {
      const state = initRalfresh(tempDir, 'test', 'session-123');
      expect(state?.sessionId).toBe('session-123');
    });

    it('initializes all phases as pending except first', () => {
      const state = initRalfresh(tempDir, 'test');
      expect(state?.phases.planning.status).toBe('in_progress');
      expect(state?.phases.execution.status).toBe('pending');
      expect(state?.phases.review.status).toBe('pending');
      expect(state?.phases.assess.status).toBe('pending');
      expect(state?.phases.complete.status).toBe('pending');
      expect(state?.phases.failed.status).toBe('pending');
    });

    it('sets startedAt timestamp for initial phase', () => {
      const state = initRalfresh(tempDir, 'test');
      expect(state?.phases.planning.startedAt).toBeTruthy();
      expect(state?.startedAt).toBeTruthy();
    });

    it('sets completedAt to null initially', () => {
      const state = initRalfresh(tempDir, 'test');
      expect(state?.completedAt).toBeNull();
    });

    it('generates unique notepad name', async () => {
      const state1 = initRalfresh(tempDir, 'test');
      clearRalfreshState(tempDir);
      // Add small delay to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 1100));
      const state2 = initRalfresh(tempDir, 'test');
      expect(state1?.notepadName).not.toBe(state2?.notepadName);
    });
  });

  describe('transitionRalfreshPhase', () => {
    beforeEach(() => {
      initRalfresh(tempDir, 'test');
    });

    it('transitions planning -> execution', () => {
      const newState = transitionRalfreshPhase(tempDir, 'execution');
      expect(newState?.phase).toBe('execution');
      expect(newState?.phases.planning.status).toBe('complete');
      expect(newState?.phases.execution.status).toBe('in_progress');
    });

    it('rejects invalid transitions', () => {
      // planning cannot go directly to complete
      const result = transitionRalfreshPhase(tempDir, 'complete');
      expect(result).toBeNull();
    });

    it('transitions execution -> review', () => {
      transitionRalfreshPhase(tempDir, 'execution');
      const result = transitionRalfreshPhase(tempDir, 'review');
      expect(result?.phase).toBe('review');
    });

    it('transitions review -> assess', () => {
      transitionRalfreshPhase(tempDir, 'execution');
      transitionRalfreshPhase(tempDir, 'review');
      const result = transitionRalfreshPhase(tempDir, 'assess');
      expect(result?.phase).toBe('assess');
    });

    it('transitions assess -> complete', () => {
      transitionRalfreshPhase(tempDir, 'execution');
      transitionRalfreshPhase(tempDir, 'review');
      transitionRalfreshPhase(tempDir, 'assess');
      const final = transitionRalfreshPhase(tempDir, 'complete');
      expect(final?.phase).toBe('complete');
      expect(final?.active).toBe(false);
      expect(final?.completedAt).not.toBeNull();
    });

    it('transitions assess -> failed', () => {
      transitionRalfreshPhase(tempDir, 'execution');
      transitionRalfreshPhase(tempDir, 'review');
      transitionRalfreshPhase(tempDir, 'assess');
      const final = transitionRalfreshPhase(tempDir, 'failed');
      expect(final?.phase).toBe('failed');
      expect(final?.active).toBe(false);
      expect(final?.completedAt).not.toBeNull();
    });

    it('sets completedAt timestamp for previous phase', () => {
      const newState = transitionRalfreshPhase(tempDir, 'execution');
      expect(newState?.phases.planning.completedAt).toBeTruthy();
    });

    it('returns null when no active state', () => {
      clearRalfreshState(tempDir);
      const result = transitionRalfreshPhase(tempDir, 'execution');
      expect(result).toBeNull();
    });

    it('returns null when state is inactive', () => {
      const state = readRalfreshState(tempDir);
      if (state) {
        state.active = false;
        writeRalfreshState(tempDir, state);
      }
      const result = transitionRalfreshPhase(tempDir, 'execution');
      expect(result).toBeNull();
    });

    it('rejects transition from complete phase', () => {
      transitionRalfreshPhase(tempDir, 'execution');
      transitionRalfreshPhase(tempDir, 'review');
      transitionRalfreshPhase(tempDir, 'assess');
      transitionRalfreshPhase(tempDir, 'complete');

      // Try to transition from complete (should fail)
      const result = transitionRalfreshPhase(tempDir, 'planning');
      expect(result).toBeNull();
    });

    it('rejects transition from failed phase', () => {
      transitionRalfreshPhase(tempDir, 'execution');
      transitionRalfreshPhase(tempDir, 'review');
      transitionRalfreshPhase(tempDir, 'assess');
      transitionRalfreshPhase(tempDir, 'failed');

      // Try to transition from failed (should fail)
      const result = transitionRalfreshPhase(tempDir, 'planning');
      expect(result).toBeNull();
    });
  });

  describe('incrementRalfreshIteration', () => {
    beforeEach(() => {
      initRalfresh(tempDir, 'test');
      // Move through phases to assess (required before increment)
      transitionRalfreshPhase(tempDir, 'execution');
      transitionRalfreshPhase(tempDir, 'review');
      transitionRalfreshPhase(tempDir, 'assess');
    });

    it('increments iteration counter', () => {
      const newState = incrementRalfreshIteration(tempDir);
      expect(newState?.iteration).toBe(2);
      expect(newState?.phase).toBe('planning');
    });

    it('resets phases on increment', () => {
      const newState = incrementRalfreshIteration(tempDir);
      expect(newState?.phases.planning.status).toBe('in_progress');
      expect(newState?.phases.execution.status).toBe('pending');
      expect(newState?.phases.review.status).toBe('pending');
      expect(newState?.phases.assess.status).toBe('pending');
    });

    it('fails when max iterations reached', () => {
      const state = readRalfreshState(tempDir);
      if (state) {
        state.iteration = state.maxIterations;
        writeRalfreshState(tempDir, state);
      }
      const result = incrementRalfreshIteration(tempDir);
      expect(result?.phase).toBe('failed');
      expect(result?.active).toBe(false);
    });

    it('returns null when no active state', () => {
      clearRalfreshState(tempDir);
      const result = incrementRalfreshIteration(tempDir);
      expect(result).toBeNull();
    });

    it('sets startedAt for new planning phase', () => {
      const newState = incrementRalfreshIteration(tempDir);
      expect(newState?.phases.planning.startedAt).toBeTruthy();
    });

    it('preserves prompt and sessionId', () => {
      const originalState = readRalfreshState(tempDir);
      const newState = incrementRalfreshIteration(tempDir);
      expect(newState?.prompt).toBe(originalState?.prompt);
      expect(newState?.sessionId).toBe(originalState?.sessionId);
    });
  });

  describe('addRalfreshLearning', () => {
    beforeEach(() => {
      initRalfresh(tempDir, 'test');
    });

    it('adds learning to state', () => {
      addRalfreshLearning(tempDir, 'learned something');
      const state = readRalfreshState(tempDir);
      expect(state?.learnings).toContain('learned something');
    });

    it('truncates long entries', () => {
      const longEntry = 'x'.repeat(5000);
      addRalfreshLearning(tempDir, longEntry);
      const state = readRalfreshState(tempDir);
      expect(state?.learnings[0].length).toBeLessThanOrEqual(MAX_ENTRY_LENGTH);
      expect(state?.learnings[0].endsWith('...')).toBe(true);
    });

    it('caps array at MAX_LEARNINGS', () => {
      for (let i = 0; i < MAX_LEARNINGS + 10; i++) {
        addRalfreshLearning(tempDir, `learning ${i}`);
      }
      const state = readRalfreshState(tempDir);
      expect(state?.learnings.length).toBe(MAX_LEARNINGS);
      // Should keep most recent (highest numbers)
      expect(state?.learnings[MAX_LEARNINGS - 1]).toBe(`learning ${MAX_LEARNINGS + 9}`);
    });

    it('returns false when no state exists', () => {
      clearRalfreshState(tempDir);
      const result = addRalfreshLearning(tempDir, 'test');
      expect(result).toBe(false);
    });

    it('preserves existing learnings when adding new ones', () => {
      addRalfreshLearning(tempDir, 'first learning');
      addRalfreshLearning(tempDir, 'second learning');
      const state = readRalfreshState(tempDir);
      expect(state?.learnings).toContain('first learning');
      expect(state?.learnings).toContain('second learning');
      expect(state?.learnings.length).toBe(2);
    });

    it('handles empty string learning', () => {
      const result = addRalfreshLearning(tempDir, '');
      expect(result).toBe(true);
      const state = readRalfreshState(tempDir);
      expect(state?.learnings).toContain('');
    });
  });

  describe('addRalfreshIssue', () => {
    beforeEach(() => {
      initRalfresh(tempDir, 'test');
    });

    it('adds issue to state', () => {
      addRalfreshIssue(tempDir, 'found an issue');
      const state = readRalfreshState(tempDir);
      expect(state?.issues).toContain('found an issue');
    });

    it('truncates long entries', () => {
      const longEntry = 'y'.repeat(5000);
      addRalfreshIssue(tempDir, longEntry);
      const state = readRalfreshState(tempDir);
      expect(state?.issues[0].length).toBeLessThanOrEqual(MAX_ENTRY_LENGTH);
      expect(state?.issues[0].endsWith('...')).toBe(true);
    });

    it('caps array at MAX_ISSUES', () => {
      for (let i = 0; i < MAX_ISSUES + 10; i++) {
        addRalfreshIssue(tempDir, `issue ${i}`);
      }
      const state = readRalfreshState(tempDir);
      expect(state?.issues.length).toBe(MAX_ISSUES);
      // Should keep most recent (highest numbers)
      expect(state?.issues[MAX_ISSUES - 1]).toBe(`issue ${MAX_ISSUES + 9}`);
    });

    it('returns false when no state exists', () => {
      clearRalfreshState(tempDir);
      const result = addRalfreshIssue(tempDir, 'test');
      expect(result).toBe(false);
    });

    it('preserves existing issues when adding new ones', () => {
      addRalfreshIssue(tempDir, 'first issue');
      addRalfreshIssue(tempDir, 'second issue');
      const state = readRalfreshState(tempDir);
      expect(state?.issues).toContain('first issue');
      expect(state?.issues).toContain('second issue');
      expect(state?.issues.length).toBe(2);
    });

    it('handles empty string issue', () => {
      const result = addRalfreshIssue(tempDir, '');
      expect(result).toBe(true);
      const state = readRalfreshState(tempDir);
      expect(state?.issues).toContain('');
    });
  });

  describe('clearAllRalfreshSubModes', () => {
    it('returns true when no files to delete', () => {
      expect(clearAllRalfreshSubModes(tempDir)).toBe(true);
    });

    it('clears sub-mode state files', () => {
      const stateDir = join(tempDir, '.omc', 'state');
      mkdirSync(stateDir, { recursive: true });

      // Create fake sub-mode files
      writeFileSync(join(stateDir, 'plan-consensus.json'), '{}');
      writeFileSync(join(stateDir, 'ultrawork-state.json'), '{}');
      writeFileSync(join(stateDir, 'ralph-state.json'), '{}');

      expect(existsSync(join(stateDir, 'plan-consensus.json'))).toBe(true);
      expect(clearAllRalfreshSubModes(tempDir)).toBe(true);
      expect(existsSync(join(stateDir, 'plan-consensus.json'))).toBe(false);
    });

    it('returns true even if some files fail to delete', () => {
      // Even if errors occur, function should return success/failure status
      const result = clearAllRalfreshSubModes(tempDir);
      expect(typeof result).toBe('boolean');
    });
  });
});

describe('Ralfresh Constants', () => {
  it('has correct MAX_LEARNINGS value', () => {
    expect(MAX_LEARNINGS).toBe(100);
  });

  it('has correct MAX_ISSUES value', () => {
    expect(MAX_ISSUES).toBe(100);
  });

  it('has correct MAX_ENTRY_LENGTH value', () => {
    expect(MAX_ENTRY_LENGTH).toBe(4096);
  });
});

describe('Ralfresh Integration Scenarios', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'ralfresh-test-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('completes full happy path: planning -> execution -> review -> assess -> complete', () => {
    // Initialize
    const state0 = initRalfresh(tempDir, 'build a feature');
    expect(state0?.phase).toBe('planning');
    expect(state0?.iteration).toBe(1);

    // Execute planning
    const state1 = transitionRalfreshPhase(tempDir, 'execution');
    expect(state1?.phase).toBe('execution');

    // Execute implementation
    const state2 = transitionRalfreshPhase(tempDir, 'review');
    expect(state2?.phase).toBe('review');

    // Review by architect
    const state3 = transitionRalfreshPhase(tempDir, 'assess');
    expect(state3?.phase).toBe('assess');

    // Assess and complete
    const state4 = transitionRalfreshPhase(tempDir, 'complete');
    expect(state4?.phase).toBe('complete');
    expect(state4?.active).toBe(false);
    expect(state4?.completedAt).not.toBeNull();
  });

  it('handles iteration loop: assess -> planning (new iteration)', () => {
    // Initialize and move to assess phase
    initRalfresh(tempDir, 'build a feature');
    transitionRalfreshPhase(tempDir, 'execution');
    transitionRalfreshPhase(tempDir, 'review');
    const assessState = transitionRalfreshPhase(tempDir, 'assess');
    expect(assessState?.iteration).toBe(1);

    // Add some learnings before incrementing
    addRalfreshLearning(tempDir, 'Use TypeScript interfaces');
    addRalfreshIssue(tempDir, 'Missing error handling');

    // Increment iteration (simulate architect rejection)
    const newIterState = incrementRalfreshIteration(tempDir);
    expect(newIterState?.iteration).toBe(2);
    expect(newIterState?.phase).toBe('planning');
    expect(newIterState?.learnings).toContain('Use TypeScript interfaces');
    expect(newIterState?.issues).toContain('Missing error handling');
  });

  it('fails after max iterations', () => {
    // Initialize with maxIterations=2
    initRalfresh(tempDir, 'build a feature', undefined, { maxIterations: 2 });

    // Complete first iteration
    transitionRalfreshPhase(tempDir, 'execution');
    transitionRalfreshPhase(tempDir, 'review');
    transitionRalfreshPhase(tempDir, 'assess');
    incrementRalfreshIteration(tempDir);

    // Complete second iteration
    transitionRalfreshPhase(tempDir, 'execution');
    transitionRalfreshPhase(tempDir, 'review');
    transitionRalfreshPhase(tempDir, 'assess');

    // Try to increment beyond max (should fail)
    const failState = incrementRalfreshIteration(tempDir);
    expect(failState?.phase).toBe('failed');
    expect(failState?.active).toBe(false);
  });

  it('accumulates learnings across iterations', () => {
    initRalfresh(tempDir, 'build a feature');

    // Add learning in iteration 1
    addRalfreshLearning(tempDir, 'Learning from iteration 1');

    // Move to assess and increment
    transitionRalfreshPhase(tempDir, 'execution');
    transitionRalfreshPhase(tempDir, 'review');
    transitionRalfreshPhase(tempDir, 'assess');
    incrementRalfreshIteration(tempDir);

    // Add learning in iteration 2
    addRalfreshLearning(tempDir, 'Learning from iteration 2');

    const state = readRalfreshState(tempDir);
    expect(state?.learnings).toContain('Learning from iteration 1');
    expect(state?.learnings).toContain('Learning from iteration 2');
    expect(state?.iteration).toBe(2);
  });

  it('supports skip planning configuration', () => {
    const state = initRalfresh(tempDir, 'build a feature', undefined, { skipPlanning: true });
    expect(state?.phase).toBe('execution');
    expect(state?.phases.execution.status).toBe('in_progress');
    expect(state?.phases.planning.status).toBe('pending');
  });
});
