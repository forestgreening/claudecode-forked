/**
 * Context Window Limit Recovery Hook
 *
 * Detects context window limit errors and injects recovery messages
 * to help Claude recover gracefully.
 *
 * Adapted from oh-my-opencode's anthropic-context-window-limit-recovery hook.
 *
 * Note: This is a simplified version for Claude Code's shell hook system.
 * The original uses OpenCode's plugin event system for more sophisticated
 * recovery like automatic summarization and truncation.
 */
import type { ParsedTokenLimitError, RecoveryResult } from './types.js';
/**
 * Configuration for context limit recovery hook
 */
export interface ContextLimitRecoveryConfig {
    /** Whether to show detailed recovery messages */
    detailed?: boolean;
    /** Custom recovery message */
    customMessage?: string;
    /** Whether to enable the hook */
    enabled?: boolean;
}
/**
 * Create context window limit recovery hook
 *
 * This hook monitors for token/context limit errors and injects
 * helpful recovery messages when detected.
 */
export declare function createContextLimitRecoveryHook(config?: ContextLimitRecoveryConfig): {
    /**
     * PostToolUse - Check for context limit errors in tool responses
     */
    postToolUse: (input: {
        tool_name: string;
        session_id: string;
        tool_input: Record<string, unknown>;
        tool_response?: string;
    }) => string | null;
    /**
     * Notification - Check for error notifications
     * (Called when errors are passed through notification system)
     */
    onError: (input: {
        session_id: string;
        error: unknown;
    }) => RecoveryResult;
};
/**
 * Check if text contains a context limit error
 */
export declare function detectContextLimitError(text: string): boolean;
/**
 * Parse error to get detailed token limit info
 */
export declare function parseContextLimitError(error: unknown): ParsedTokenLimitError | null;
export type { ParsedTokenLimitError, RetryState, TruncateState, RecoveryResult, } from './types.js';
export { RETRY_CONFIG, TRUNCATE_CONFIG } from './types.js';
export { CONTEXT_LIMIT_RECOVERY_MESSAGE, CONTEXT_LIMIT_SHORT_MESSAGE, NON_EMPTY_CONTENT_RECOVERY_MESSAGE, TRUNCATION_APPLIED_MESSAGE, RECOVERY_FAILED_MESSAGE, } from './constants.js';
export { parseTokenLimitError, containsTokenLimitError, TOKEN_LIMIT_PATTERNS, TOKEN_LIMIT_KEYWORDS, } from './parser.js';
//# sourceMappingURL=index.d.ts.map