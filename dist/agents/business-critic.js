/**
 * Business Critic Agent
 *
 * Business model stress-tester and devil's advocate
 * for Go/No-Go decisions.
 */
import { loadAgentPrompt } from './utils.js';
export const BUSINESS_CRITIC_PROMPT_METADATA = {
    category: 'reviewer',
    cost: 'EXPENSIVE',
    promptAlias: 'business-critic',
    triggers: [
        {
            domain: 'Business Review',
            trigger: 'Stress-test business model, Go/No-Go decision, assumption challenge',
        },
    ],
    useWhen: [
        'After business-analyst produces a viability analysis',
        'Before making a Go/No-Go decision on a product idea',
        'To stress-test unit economics under pessimistic conditions',
        'To evaluate competitive defensibility (moats)',
        'When challenging pricing assumptions',
    ],
    avoidWhen: [
        'When no business analysis exists to review',
        'During implementation phase',
        'For technical code review',
    ],
};
export const businessCriticAgent = {
    name: 'business-critic',
    description: `Business model stress-tester and devil's advocate for Go/No-Go decisions (Opus, READ-ONLY). Use after business-analyst to challenge assumptions and render a final verdict.`,
    prompt: loadAgentPrompt('business-critic'),
    model: 'opus',
    defaultModel: 'opus',
    metadata: BUSINESS_CRITIC_PROMPT_METADATA,
};
