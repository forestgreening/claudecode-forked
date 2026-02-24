/**
 * Context Window Limit Recovery Constants
 *
 * Messages and prompts for recovery from context limit errors.
 *
 * Adapted from oh-my-opencode's anthropic-context-window-limit-recovery hook.
 */
/**
 * Recovery message when context window limit is hit
 */
export declare const CONTEXT_LIMIT_RECOVERY_MESSAGE = "CONTEXT WINDOW LIMIT REACHED - IMMEDIATE ACTION REQUIRED\n\nThe conversation has exceeded the model's context window limit. To continue working effectively, you must take one of these actions:\n\n1. SUMMARIZE THE CONVERSATION\n   - Use the /compact command if available\n   - Or provide a concise summary of what has been accomplished so far\n   - Include key decisions, code changes, and remaining tasks\n\n2. START A FRESH CONTEXT\n   - If summarization isn't sufficient, suggest starting a new session\n   - Provide a handoff message with essential context\n\n3. REDUCE OUTPUT SIZE\n   - When showing code, show only relevant portions\n   - Use file paths and line numbers instead of full code blocks\n   - Be more concise in explanations\n\nIMPORTANT: Do not attempt to continue without addressing this limit.\nThe API will reject further requests until the context is reduced.\n\nCurrent Status:\n- Context limit exceeded\n- Further API calls will fail until context is reduced\n- Action required before continuing\n";
/**
 * Short notification for context limit
 */
export declare const CONTEXT_LIMIT_SHORT_MESSAGE = "Context window limit reached. Please use /compact to summarize the conversation or start a new session.";
/**
 * Recovery message for non-empty content errors
 */
export declare const NON_EMPTY_CONTENT_RECOVERY_MESSAGE = "API ERROR: Non-empty content validation failed.\n\nThis error typically occurs when:\n- A message has empty text content\n- The conversation structure is invalid\n\nSuggested actions:\n1. Continue with a new message\n2. If the error persists, start a new session\n\nThe system will attempt automatic recovery.\n";
/**
 * Recovery message when truncation was applied
 */
export declare const TRUNCATION_APPLIED_MESSAGE = "CONTEXT OPTIMIZATION APPLIED\n\nSome tool outputs have been truncated to fit within the context window.\nThe conversation can now continue normally.\n\nIf you need to see the full output of a previous tool call, you can:\n- Re-run the specific command\n- Ask to see a particular file or section\n\nContinuing with the current task...\n";
/**
 * Message when recovery fails
 */
export declare const RECOVERY_FAILED_MESSAGE = "CONTEXT RECOVERY FAILED\n\nAll automatic recovery attempts have been exhausted.\nPlease start a new session to continue.\n\nBefore starting a new session:\n1. Note what has been accomplished\n2. Save any important code changes\n3. Document the current state of the task\n\nYou can copy this conversation summary to continue in a new session.\n";
//# sourceMappingURL=constants.d.ts.map