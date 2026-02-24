/**
 * Edit Error Recovery Hook
 *
 * Detects Edit tool errors caused by AI mistakes and injects
 * a recovery reminder to guide corrective action.
 *
 * Common Edit tool failures:
 * - oldString and newString must be different (trying to "edit" to same content)
 * - oldString not found (wrong assumption about file content)
 * - oldString found multiple times (ambiguous match, need more context)
 *
 * Ported from oh-my-opencode's edit-error-recovery hook.
 */
/**
 * Known Edit tool error patterns that indicate the AI made a mistake
 */
export declare const EDIT_ERROR_PATTERNS: readonly ["oldString and newString must be different", "oldString not found", "oldString found multiple times", "old_string not found", "old_string and new_string must be different"];
/**
 * System reminder injected when Edit tool fails due to AI mistake
 * Short, direct, and commanding - forces immediate corrective action
 */
export declare const EDIT_ERROR_REMINDER = "\n[EDIT ERROR - IMMEDIATE ACTION REQUIRED]\n\nYou made an Edit mistake. STOP and do this NOW:\n\n1. READ the file immediately to see its ACTUAL current state\n2. VERIFY what the content really looks like (your assumption was wrong)\n3. APOLOGIZE briefly to the user for the error\n4. CONTINUE with corrected action based on the real file content\n\nDO NOT attempt another edit until you've read and verified the file state.\n";
/**
 * Check if an output contains an edit error pattern
 */
export declare function detectEditError(output: string): boolean;
/**
 * Inject the edit error recovery reminder into the output
 */
export declare function injectEditErrorRecovery(output: string): string;
/**
 * Hook input interface for tool execution
 */
export interface ToolExecuteInput {
    tool: string;
    sessionId: string;
    callId: string;
}
/**
 * Hook output interface for tool execution
 */
export interface ToolExecuteOutput {
    title: string;
    output: string;
    metadata?: unknown;
}
/**
 * Creates the edit error recovery hook for Claude Code.
 * This is the main export for hook registration.
 */
export declare function createEditErrorRecoveryHook(): {
    /**
     * After tool execution, check for Edit errors and inject recovery reminder.
     */
    afterToolExecute: (input: ToolExecuteInput, output: ToolExecuteOutput) => ToolExecuteOutput;
};
/**
 * Process edit tool output and inject recovery if needed.
 * Simplified function for direct use without hook context.
 */
export declare function processEditOutput(toolName: string, output: string): string;
//# sourceMappingURL=index.d.ts.map