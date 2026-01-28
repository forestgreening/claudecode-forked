---
name: ralfresh
description: "Ultimate persistence loop - combines ralplan planning, parallel execution, architect verification, and context refresh with accumulated learnings across iterations"
user_invocable: true
---

# Ralfresh - Ultimate Persistence Loop

Ralfresh is the most powerful execution mode, combining:
- **Ralplan** - Planning consensus between Planner, Architect, and Critic
- **Ultrawork/Swarm** - Parallel execution with maximum throughput
- **Architect Verification** - Quality gate with rejection feedback
- **Context Refresh** - Fresh iterations with accumulated learnings

## Usage

```
/oh-my-claudecode:ralfresh <task description>
ralfresh: <task description>
```

## Configuration

| Option | Default | Description |
|--------|---------|-------------|
| max-iterations | 5 | Maximum planning→execution→review cycles |
| swarm-agents | 3 | Number of parallel agents in execution phase |
| skip-planning | false | Skip planning and go directly to execution |

## Phase Cycle

```
┌─────────────┐
│  PLANNING   │ ← ralplan consensus
└──────┬──────┘
       ▼
┌─────────────┐
│  EXECUTION  │ ← ultrawork/swarm parallel
└──────┬──────┘
       ▼
┌─────────────┐
│   REVIEW    │ ← architect verification
└──────┬──────┘
       ▼
┌─────────────┐     ┌──────────┐
│   ASSESS    │────►│ COMPLETE │ (if approved)
└──────┬──────┘     └──────────┘
       │
       │ (if rejected + iterations remaining)
       ▼
┌─────────────┐
│  PLANNING   │ ← new iteration with learnings
└─────────────┘
```

## How It Works

### Initialization
When activated, ralfresh:
1. Checks mutual exclusion (cannot run with autopilot, ultrapilot, swarm, pipeline)
2. Creates state at `.omc/state/ralfresh-state.json`
3. Initializes notepad wisdom at `.omc/notepads/ralfresh-{timestamp}/`
4. Begins the planning phase

### Phase Details

**Planning** - Uses ralplan skill for consensus between Planner, Architect, and Critic agents. The plan incorporates learnings and issues from previous iterations.

**Execution** - Activates ultrawork or swarm for parallel task execution. Follows the plan from the planning phase.

**Review** - Spawns an architect agent to verify all work against requirements. Checks: build passes, tests pass, functionality works.

**Assess** - Evaluates the architect's verdict:
- APPROVED → Transition to complete
- REJECTED + iterations remaining → Record issues, increment iteration, fresh planning
- REJECTED + no iterations → Transition to failed

### State Management
All state is managed by the hook module at `src/hooks/ralfresh/`:
- `initRalfresh()` - Initialize with mutual exclusion check
- `transitionRalfreshPhase()` - Move between phases
- `incrementRalfreshIteration()` - Start new iteration cycle
- `addRalfreshLearning()` / `addRalfreshIssue()` - Accumulate wisdom
- `checkRalfreshLoop()` - Stop hook enforcement (blocks stop during active phases)

### Context Refresh
Between iterations, ralfresh preserves:
- All learnings from previous iterations
- Issues identified by architect
- Notepad wisdom (learnings, decisions, issues, problems)

This accumulated context is injected into each new planning phase, ensuring each iteration builds on previous knowledge.

## Smart Model Routing

| Phase | Agent | Model |
|-------|-------|-------|
| Planning | planner, architect, critic | opus |
| Execution | executor, executor-high | sonnet, opus |
| Review | architect | opus |
| Assess | (conductor) | - |

## Cancellation

Use `/oh-my-claudecode:cancel` or say "stop"/"cancel" to terminate ralfresh. The cancel skill automatically:
- Detects active ralfresh state
- Clears ralfresh state file
- Cleans up all sub-mode states (ralplan, swarm, ultrawork, ralph)
- Preserves notepad wisdom for reference

## Template Variables

- `{{PROMPT}}` - Original user request
- `{{ITERATION}}` - Current iteration number
- `{{MAX}}` - Maximum iterations
- `{{PHASE}}` - Current phase name
