/**
 * Session Recovery Hook
 *
 * Helps recover session state when Claude Code restarts or crashes.
 * Detects and fixes various error conditions that can cause session failures.
 *
 * Adapted from oh-my-opencode's session-recovery hook for Claude Code's
 * shell hook system.
 *
 * Recovery Strategies:
 * 1. Tool Result Missing: Inject cancelled tool results for orphaned tool_use
 * 2. Thinking Block Order: Fix messages where thinking isn't first
 * 3. Thinking Disabled: Strip thinking blocks when model doesn't support them
 * 4. Empty Content: Add placeholder text to empty messages
 */
import type { MessageData, RecoveryErrorType, RecoveryResult, SessionRecoveryConfig } from "./types.js";
/**
 * Detect the type of recoverable error
 */
export declare function detectErrorType(error: unknown): RecoveryErrorType;
/**
 * Check if an error is recoverable
 */
export declare function isRecoverableError(error: unknown): boolean;
/**
 * Main recovery handler
 */
export declare function handleSessionRecovery(sessionID: string, error: unknown, failedMessage?: MessageData, config?: SessionRecoveryConfig): Promise<RecoveryResult>;
/**
 * Create session recovery hook for Claude Code
 */
export declare function createSessionRecoveryHook(config?: SessionRecoveryConfig): {
    /**
     * Check for errors during tool execution or message processing
     */
    onError: (input: {
        session_id: string;
        error: unknown;
        message?: MessageData;
    }) => Promise<RecoveryResult>;
    /**
     * Check if an error is recoverable
     */
    isRecoverable: (error: unknown) => boolean;
    /**
     * Get recovery message for an error type
     */
    getRecoveryMessage: (errorType: RecoveryErrorType) => string | undefined;
};
export type { MessageData, RecoveryErrorType, RecoveryResult, SessionRecoveryConfig, StoredMessageMeta, StoredPart, StoredTextPart, StoredToolPart, } from "./types.js";
export { RECOVERY_MESSAGES, PLACEHOLDER_TEXT, } from "./constants.js";
export { findEmptyMessages, findMessagesWithThinkingBlocks, findMessagesWithOrphanThinking, readMessages, readParts, } from "./storage.js";
//# sourceMappingURL=index.d.ts.map