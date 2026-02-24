/**
 * Session Recovery Constants
 *
 * Constants for session recovery including storage paths and recovery messages.
 * Adapted from oh-my-opencode's session-recovery hook.
 */
export declare const CLAUDE_CODE_STORAGE: string;
export declare const MESSAGE_STORAGE: string;
export declare const PART_STORAGE: string;
/**
 * Part type sets for categorization
 */
export declare const THINKING_TYPES: Set<string>;
export declare const META_TYPES: Set<string>;
export declare const CONTENT_TYPES: Set<string>;
/**
 * Recovery messages
 */
export declare const RECOVERY_RESUME_TEXT = "[session recovered - continuing previous task]";
export declare const PLACEHOLDER_TEXT = "[user interrupted]";
/**
 * Toast/notification messages for recovery
 */
export declare const RECOVERY_MESSAGES: {
    readonly tool_result_missing: {
        readonly title: "Tool Crash Recovery";
        readonly message: "Injecting cancelled tool results...";
    };
    readonly thinking_block_order: {
        readonly title: "Thinking Block Recovery";
        readonly message: "Fixing message structure...";
    };
    readonly thinking_disabled_violation: {
        readonly title: "Thinking Strip Recovery";
        readonly message: "Stripping thinking blocks...";
    };
    readonly empty_content: {
        readonly title: "Empty Content Recovery";
        readonly message: "Adding placeholder content...";
    };
};
/**
 * Recovery error patterns
 */
export declare const ERROR_PATTERNS: {
    readonly tool_result_missing: readonly ["tool_use", "tool_result"];
    readonly thinking_block_order: readonly ["thinking", "first block", "must start with", "preceeding", "final block", "cannot be thinking"];
    readonly thinking_disabled_violation: readonly ["thinking is disabled", "cannot contain"];
    readonly empty_content: readonly ["empty", "content", "message"];
};
/**
 * Debug logging configuration
 */
export declare const DEBUG: boolean;
export declare const DEBUG_LOG_PATH: string;
//# sourceMappingURL=constants.d.ts.map