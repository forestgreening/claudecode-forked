---
name: bizplan
description: Business validation loop — Service Planner → Business Analyst → Business Critic consensus
triggers:
  - "bizplan"
  - "비즈니스 검증"
  - "사업 검증"
  - "수익성 검증"
argument-hint: "<product idea or CLAUDE.md path>"
---

# Bizplan (Business Validation Consensus Loop)

Bizplan is the business counterpart of ralplan. It runs an iterative consensus loop of **Service Planner → Business Analyst → Business Critic** to validate a product idea's business viability before any engineering effort begins.

## Usage

```
/oh-my-claudecode:bizplan "product idea description"
/oh-my-claudecode:bizplan --interactive "product idea description"
```

## Flags

- `--interactive`: Enables user prompts at key decision points (after Service Planner draft and after final verdict). Without this flag the workflow runs fully automated and outputs the final verdict.
- `--deep`: Forces comprehensive mode. Adds deeper competitor research (5+ competitors), sensitivity analysis on unit economics, and expanded go-to-market channel evaluation.

## Purpose

Validate whether a product idea is worth building BEFORE writing any code. The loop produces:
1. A complete product concept (personas, value prop, MVP scope, pricing, go-to-market)
2. Financial analysis (TAM/SAM/SOM, unit economics, revenue projections)
3. Stress-tested verdict (Go / Conditional-Go / Pivot / No-Go)

## Use_When

- A new micro-SaaS or product idea needs validation
- Before committing engineering time to an idea
- When choosing between multiple product ideas
- After a pivot, to validate the new direction

## Do_Not_Use_When

- The product is already launched with real user data (use actual metrics instead)
- For technical architecture decisions (use ralplan)
- For implementation planning (use ralplan or plan)

## Why_This_Exists

Most solo developers and small teams skip business validation and jump straight to coding. This wastes weeks or months building products nobody will pay for. Bizplan forces a structured, adversarial evaluation of the business model before any code is written. It is 100x cheaper to kill a bad idea in a 30-minute bizplan loop than after 30 days of development.

## Behavior

The bizplan consensus workflow:

### Step 1: Service Planner — Product Concept Design

Launch the `service-planner` agent (Opus) with the product idea.

The Service Planner produces:
- Target personas (minimum 2, with names and specific situations)
- Value proposition (one-liner + core differentiation + 10x test)
- User journey (discovery → first use → aha moment → habit → payment → referral)
- MVP feature set (3-5 features maximum, justified by user journey)
- Pricing model (grounded in comparable products)
- Go-to-market channels (specific platforms with estimated reach)
- Core assumptions as falsifiable hypotheses

**Output is saved to**: `.omc/plans/bizplan-concept.md`

### Step 2: User Feedback (--interactive only)

If `--interactive` is set, present the product concept to the user with options:
- **Proceed to analysis**: Send to Business Analyst
- **Request changes**: Revise the concept
- **Skip to analysis**: Accept as-is and move on

Without `--interactive`, automatically proceed to Step 3.

### Step 3: Business Analyst — Financial Analysis

Launch the `business-analyst` agent (Opus) with the product concept from Step 1.

The Business Analyst produces:
- TAM/SAM/SOM with calculation methodology
- Competitive landscape (minimum 3 competitors with pricing and market share)
- Unit economics (ARPU, variable cost/user, gross margin, CAC, LTV, LTV/CAC)
- Pricing assessment (willingness-to-pay evidence, competitor comparison)
- Revenue projection (pessimistic / realistic / optimistic, 12-month horizon)
- Top 3 riskiest assumptions with validation methods
- Preliminary assessment (Go / Conditional-Go / No-Go)

**Input**: Product concept from Step 1 + project context (CLAUDE.md)
**Output is saved to**: `.omc/plans/bizplan-analysis.md`

> **Important:** Step 3 MUST complete fully before Step 4 begins. Do NOT run Steps 3 and 4 in parallel.

### Step 4: Business Critic — Stress Test & Verdict

Launch the `business-critic` agent (Opus) with both the concept (Step 1) and analysis (Step 3).

The Business Critic produces:
- Assumption stress test (each key assumption challenged with counter-scenario)
- Killer scenarios (minimum 2 realistic paths to failure)
- Moat assessment (network effects, switching costs, data moat, brand)
- Unit economics under stress (2x cost, 0.5x revenue scenario)
- Pricing reality check (current alternatives cost, free plan cannibalization risk)
- **Final verdict**: GO / CONDITIONAL-GO / PIVOT / NO-GO

**Input**: Concept from Step 1 + Analysis from Step 3
**Output is saved to**: `.omc/plans/bizplan-verdict.md`

### Step 5: Re-review Loop (max 3 iterations)

If the Business Critic verdict is **CONDITIONAL-GO** or **PIVOT**:

a. Collect Business Analyst + Business Critic feedback
b. Service Planner revises the concept based on feedback (adjust personas, pricing, features, go-to-market)
c. Business Analyst re-analyzes the revised concept
d. Business Critic re-evaluates
e. Repeat until **GO** or **NO-GO** is reached, or 3 iterations complete

If the verdict is **GO** or **NO-GO**, skip directly to Step 6.

If 3 iterations are reached without convergence, present the best version with accumulated feedback to the user.

### Step 6: Final Output

Produce a consolidated Business Validation Report:

```markdown
## Business Validation Report: [Product Name]

### Verdict: [GO / CONDITIONAL-GO / PIVOT / NO-GO]
### Iterations: [N]

### Product Concept (Final)
[Summary from Service Planner]

### Financial Summary
[Key metrics from Business Analyst]

### Risk Assessment
[Key findings from Business Critic]

### Conditions (if CONDITIONAL-GO)
1. [Condition] — Validate by: [method] within [timeframe]

### Recommended Next Steps
- If GO: proceed to ralplan for technical implementation planning
- If CONDITIONAL-GO: run validation experiments first
- If PIVOT: rerun bizplan with revised concept
- If NO-GO: move to next idea
```

**Output is saved to**: `.omc/plans/bizplan-report.md`

### Step 7: Post-Verdict Actions (--interactive only)

If `--interactive` is set, present the verdict with options:
- **Accept and plan (ralplan)**: Invoke `/oh-my-claudecode:ralplan` for technical planning
- **Accept and execute (ralph)**: Invoke `/oh-my-claudecode:ralph` for direct execution
- **Revise concept**: Loop back to Step 1 with specific changes
- **Try different idea**: Start fresh with a new product idea
- **Reject**: End the workflow

Without `--interactive`, output the final report and stop.

## Tool_Usage

- Use `Agent(subagent_type="oh-my-claudecode:service-planner")` for product concept design
- Use `Agent(subagent_type="oh-my-claudecode:business-analyst")` for financial analysis
- Use `Agent(subagent_type="oh-my-claudecode:business-critic")` for stress-testing
- Use `Write` tool to save outputs to `.omc/plans/bizplan-*.md`
- Use `Read` tool to load project context (CLAUDE.md) and pass between agents

## Execution_Policy

- Default effort: high (thorough analysis at each stage)
- Steps 3 and 4 MUST run sequentially. NEVER run Business Analyst and Business Critic in parallel.
- Each agent receives the FULL output of previous agents, not a summary.
- All intermediate outputs are persisted to `.omc/plans/` for traceability.
- If any agent fails or times out, retry once. If it fails again, present partial results to the user.

## Examples

<Good>
User: `/bizplan "PDF를 넣으면 AI가 플래시카드를 만들어주는 한국어 학습 도구"`

1. Service Planner: 김지수(행시 준비생)와 이민준(경영학과 3학년) 두 페르소나 정의. MVP 3개 기능(텍스트→카드, 플립UI, 이메일수집). 고시생 네이버 카페와 에브리타임을 GTM 채널로 특정.
2. Business Analyst: 한국 학습도구 TAM $120M, SAM $28M, SOM Year1 $42K. Claude API 비용 기반 단위 경제학 모델링. LTV/CAC 2.1x로 위험 신호 식별.
3. Business Critic: 학생 churn 15%로 스트레스 테스트 시 LTV $19로 하락. CONDITIONAL-GO — 조건: 50명 베타에서 churn 12% 이하 검증 필요.
4. Re-loop: Service Planner가 직장인 페르소나 추가, 가격 $12/월로 상향. Business Analyst 재분석: LTV/CAC 2.8x로 개선. Business Critic: CONDITIONAL-GO 유지, 조건 완화.
5. Final: CONDITIONAL-GO with 2 conditions.
</Good>

<Bad>
User: `/bizplan "AI study tool"`

Service Planner: "Students will love this." Business Analyst: "EdTech market is huge, GO." Business Critic: "Looks good, GO."
No personas, no numbers, no stress-testing. This is rubber-stamping, not validation.
</Bad>

## Escalation_And_Stop_Conditions

- **Stop immediately** if Service Planner identifies no real pain point (no viable persona willing to pay). Report NO-GO without running Business Analyst.
- **Stop** after 3 iterations without convergence. Present best version with accumulated feedback.
- **Escalate to user** if Business Analyst cannot find any market data (market too niche or too new for estimation).
- **Never** proceed to ralplan/ralph without an explicit GO or user-approved CONDITIONAL-GO.

## Final_Checklist

- [ ] Service Planner produced specific personas (names, situations, not demographics)?
- [ ] Business Analyst provided TAM/SAM/SOM with calculation methodology?
- [ ] Business Analyst modeled unit economics with concrete numbers?
- [ ] Business Critic challenged every key assumption?
- [ ] Business Critic identified at least 2 killer scenarios?
- [ ] Business Critic stress-tested unit economics under pessimistic conditions?
- [ ] Final verdict is one of: GO / CONDITIONAL-GO / PIVOT / NO-GO?
- [ ] If CONDITIONAL-GO, conditions are specific, measurable, and time-bound?
- [ ] All outputs saved to `.omc/plans/bizplan-*.md`?
- [ ] Steps 3 and 4 ran sequentially (not parallel)?
