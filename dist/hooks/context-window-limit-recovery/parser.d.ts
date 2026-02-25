/**
 * Context Window Limit Error Parser
 *
 * Parses error responses to detect token/context limit errors.
 *
 * Adapted from oh-my-opencode's anthropic-context-window-limit-recovery hook.
 */
import type { ParsedTokenLimitError } from './types.js';
/**
 * Patterns to extract token counts from error messages
 */
declare const TOKEN_LIMIT_PATTERNS: RegExp[];
/**
 * Keywords indicating token limit errors
 */
declare const TOKEN_LIMIT_KEYWORDS: string[];
/**
 * Patterns indicating thinking block structure errors (NOT token limit)
 * These should be handled differently
 */
declare const THINKING_BLOCK_ERROR_PATTERNS: RegExp[];
/**
 * Parse an error to detect if it's a token limit error
 */
export declare function parseTokenLimitError(err: unknown): ParsedTokenLimitError | null;
/**
 * Check if a string contains a token limit error indication
 */
export declare function containsTokenLimitError(text: string): boolean;
export { TOKEN_LIMIT_PATTERNS, TOKEN_LIMIT_KEYWORDS, THINKING_BLOCK_ERROR_PATTERNS, };
//# sourceMappingURL=parser.d.ts.map