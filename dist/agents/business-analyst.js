/**
 * Business Analyst Agent
 *
 * Business viability analyst for market sizing, unit economics,
 * and competitive positioning.
 */
import { loadAgentPrompt } from './utils.js';
export const BUSINESS_ANALYST_PROMPT_METADATA = {
    category: 'planner',
    cost: 'EXPENSIVE',
    promptAlias: 'business-analyst',
    triggers: [
        {
            domain: 'Business Analysis',
            trigger: 'Market sizing, unit economics, competitive analysis, pricing strategy',
        },
    ],
    useWhen: [
        'Before committing engineering effort to a new product idea',
        'When evaluating business viability of a SaaS/micro-SaaS concept',
        'To estimate TAM/SAM/SOM for a target market',
        'To model unit economics (CAC, LTV, margins)',
        'When comparing against competitors',
        'To validate pricing strategy',
    ],
    avoidWhen: [
        'During implementation phase',
        'For technical architecture decisions',
        'When business model is already validated with real data',
    ],
};
export const businessAnalystAgent = {
    name: 'business-analyst',
    description: `Business viability analyst for market sizing, unit economics, and competitive positioning (Opus, READ-ONLY). Use before committing engineering effort to evaluate whether a product idea can generate sustainable revenue.`,
    prompt: loadAgentPrompt('business-analyst'),
    model: 'opus',
    defaultModel: 'opus',
    metadata: BUSINESS_ANALYST_PROMPT_METADATA,
};
