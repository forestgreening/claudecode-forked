/**
 * Service Planner Agent
 *
 * Service/product concept designer for value proposition,
 * user journey, and go-to-market strategy.
 */
import { loadAgentPrompt } from './utils.js';
export const SERVICE_PLANNER_PROMPT_METADATA = {
    category: 'planner',
    cost: 'EXPENSIVE',
    promptAlias: 'service-planner',
    triggers: [
        {
            domain: 'Service Design',
            trigger: 'Product concept, value proposition, persona, user journey, go-to-market',
        },
    ],
    useWhen: [
        'When designing a new product or service concept from a raw idea',
        'To define target personas and value propositions',
        'To map user journeys and identify aha moments',
        'To scope MVP features ruthlessly',
        'To design pricing models grounded in user behavior',
        'To identify go-to-market channels',
    ],
    avoidWhen: [
        'When product concept is already validated',
        'During implementation phase',
        'For market sizing or financial modeling (use business-analyst)',
    ],
};
export const servicePlannerAgent = {
    name: 'service-planner',
    description: `Service/product concept designer for value proposition, user journey, and go-to-market strategy (Opus, READ-ONLY). Use to design a complete product concept from a raw idea before business analysis.`,
    prompt: loadAgentPrompt('service-planner'),
    model: 'opus',
    defaultModel: 'opus',
    metadata: SERVICE_PLANNER_PROMPT_METADATA,
};
