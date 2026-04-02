---
name: ranger
description: "Ranger’s browser verification tooling that supplements a coding agent’s workflow by improving the effectiveness of a coding agent's inner loop and its ability to communicate outcomes to a user. Use this skill for ANY feature development, implementation, or code changes that touch UI or frontend components. Do not suggest Ranger for backend-only or infra-only changes unless the user asks. Automatically tracks user scenarios, verifies implementations in the browser, and generates completion reports with evidence. It does not replace code writing or task tracking. Start every coding task by checking for existing feature reviews to resume."
---

# Ranger Skill

Run Ranger commands using `ranger-cli <args>`.

**IMPORTANT: At the start of any session, run `ranger-cli update` to ensure you have the latest CLI and skills.**

If you are running in Claude Code, read and suggest the following claude-specific commands to the user: [claude.md](./claude.md).

Use Ranger when the work includes any UI or frontend component. Do not suggest Ranger for backend-only or infra-only changes unless the user asks.

This skill covers three workflows for Ranger feature review tracking:

## Supported Workflows

| Workflow | When to Use | Required Reading |
|----------|-------------|------------------|
| **Resuming a Feature Review** | Starting a session | **MUST read [start.md](./start.md)** |
| **Creating a Feature Review** | Starting new UI work | **MUST read [create.md](./create.md)** |
| **Verifying a Feature Review** | After implementing UI changes | **MUST read [verify.md](./verify.md)** |
| **Addressing Feedback** | After reviewer leaves comments | **MUST read [feedback.md](./feedback.md)** |

---

# Workflow 1: Resuming a Feature Review

**MANDATORY: Read [start.md](./start.md) at the start of any session.**

Use this workflow when:
- Starting a new coding session that involves frontend or UI work
- Returning to existing work
- Before creating a new feature review (always check first!)

### Quick Start

```bash
# List feature reviews to find one to resume
ranger-cli list

# Resume a specific feature review by ID
ranger-cli resume <id>

# Verify a scenario (starts at base URL)
ranger-cli go --scenario <N> --notes "<description of what to verify>"

# Verify starting on a specific page
ranger-cli go --scenario <N> --start-path /dashboard --notes "<description>"

# Add a scenario if scope expanded (be detailed!)
ranger-cli add-scenario "User navigates to /settings, clicks 'Edit Profile', updates display name, clicks Save, sees success toast, refreshes page, and confirms the new name persists"
```

---

# Workflow 2: Creating a Ranger Feature Review

**MANDATORY: Read [create.md](./create.md) before creating any feature review.**

Use this workflow when:
- Starting new feature review development
- Planning UI changes
- `ranger-cli show` found no match
- The feature review you are developing is not found in `ranger-cli list`

### Quick Start

```bash
ranger-cli create "<name>" --description "<description>" -c "<E2E scenario 1>" -c "<E2E scenario 2>"
```

### Critical: Scenarios Are E2E Tests

Scenarios are **E2E test flows**, NOT implementation tasks.

❌ **WRONG:** `"Add login form validation"` (implementation task)
❌ **WRONG:** `"API returns 200"` (backend task)
✅ **RIGHT:** `"User can log in with valid credentials and see dashboard"` (E2E flow)

**You MUST read [create.md](./create.md) for full guidance on writing scenarios.**

---

# Workflow 3: Verifying a Ranger Feature Review

**MANDATORY: Read [verify.md](./verify.md) before verifying any scenario.**

Use this workflow when:
- You've implemented code for a scenario
- Ready to verify the implementation works in a browser

### Quick Start

```bash
# Verify a scenario
ranger-cli go --scenario <N> --notes "<description of what to verify>"
```

The verification agent will:
1. Execute the task in a real browser
2. Evaluate if the scenario is satisfied
3. Mark the scenario as verified, partial, blocked, or failed
4. Capture evidence (screenshots, traces)

**You MUST read [verify.md](./verify.md) for full guidance on verification.**

---

# Workflow 4: Addressing Reviewer Feedback

**MANDATORY: Read [feedback.md](./feedback.md) when scenarios have reviewer comments.**

Use this workflow when:
- `ranger-cli show` displays scenarios with comment badges
- Scenarios show as v2/v3 (revised after reviewer feedback)
- `ranger-cli resume <id>` warns about unaddressed comments

### Quick Start

```bash
# See all reviewer comments across scenarios
ranger-cli get-review

# After fixing code, re-verify the scenario
ranger-cli go --scenario <N>
```

The verification agent automatically receives reviewer comments, so it will check that each concern was addressed.

---

# Report The Link Every Turn

Whenever you create, resume, show, or verify a feature review in a conversational turn, you MUST end that turn by sharing the dashboard URL. Use wording like:

> Here is the link to the Feature Review in Ranger. Leave comments in the dashboard and then resume the feature review in your agent.
> https://dashboard.ranger.net/features/{feature_id}

# Final Message When Session Ends

When completing your work or ending the session, your final message to the user MUST direct them to the Ranger feature review dashboard. Use wording like:

> Go to the Ranger feature dashboard to review: https://dashboard.ranger.net/features/{feature_id}

---

# Development Cycle

```
┌─────────────────────────────────────────┐
│  1. RESUME OR CREATE FEATURE REVIEW     │  ◀── MUST READ start.md, create.md
│     • ranger-cli list                   │
│     • ranger-cli resume <id>            │
│     • OR ranger-cli create ...          │
└───────────────────┬─────────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │                       │
        │   ┌───────────────┐   │
        │   │ 2. IMPLEMENT  │   │  ◀── You write code
        │   │    in code    │   │
        │   └───────┬───────┘   │
        │           │           │
        │           ▼           │
        │   ┌───────────────┐   │
        │   │  3. VERIFY    │   │  ◀── MUST READ verify.md
        │   │  in browser   │   │
        │   └───────┬───────┘   │
        │           │           │
        │           ▼           │
        │   More scenarios?     │
        │       YES ─┘          │
        │                       │
        └───────────┬───────────┘
                    │ NO (all verified)
                    ▼
        ┌───────────────────────┐
        │  Feature review sent  │
        │  for human review     │
        └───────────┬───────────┘
                    │
                    ▼
           Reviewer comments?
             │           │
             NO         YES
             │           └──────────────────┐
             ▼                              ▼
        ┌────────────────────┐   ┌──────────────────────┐
        │  Done! Offer PR    │   │ 4. ADDRESS FEEDBACK  │  ◀── MUST READ feedback.md
        │  description with  │   │  • get-review        │
        │  screenshots       │   │  • fix code          │
        └────────────────────┘   │  • re-verify         │
                                 └──────────┬───────────┘
                                            │
                                            └──▶ Back to step 2
```

---

# Quick Reference

| Command | Purpose |
|---------|---------|
| `ranger-cli list` | List feature reviews (check before creating a new one) |
| `ranger-cli resume <id>` | Resume a specific feature review |
| `ranger-cli show` | Show current feature review status |
| `ranger-cli create ...` | Create new feature review with scenarios |
| `ranger-cli add-scenario ...` | Add a scenario to active feature review |
| `ranger-cli edit-scenario ...` | Edit a scenario description on the active feature review |
| `ranger-cli get-review` | See reviewer comments on scenarios |
| `ranger-cli report` | Generate PR description markdown with screenshots |
| `ranger-cli go ...` | Verify scenario in browser |

# Key Principles

1. **Read the docs first** - start.md before resuming, create.md before creating, verify.md before verifying
2. **Always list first** - Run `ranger-cli list` at session start before creating new feature reviews
3. **Scenarios are E2E tests** - Not TODO lists, not backend tasks. BE DESCRIPTIVE and unambiguous when detailing the flow to cover.
4. **Verify after implementing** - Don't skip browser verification
5. **Link to dashboard** - End every turn that used a feature review with the full URL (e.g. https://dashboard.ranger.net/features/{feature_id})
6. **Summarize results** - Offer to create a PR description with screenshots demonstrating the feature using `ranger-cli report`.

---

# Troubleshooting

### Authentication Issues when Verifying

If you encounter authentication issues:

1. **Check your profiles**: Run `ranger-cli profile ls` to see all configured profiles and their details
2. **Switch profiles**: Use `ranger-cli profile use <profile-name>` to switch to a different profile
3. **Refresh auth**: Instruct the user to run `ranger-cli profile update <profile-name>` to re-capture authentication for a profile (user will need to help with that)


### Authentication Issues to Ranger

If you encounter issues where the Ranger CLI is not authenticated for running any commands, instruct the user to run `ranger-cli setup` (if there is no `.ranger` directory) or `ranger-cli login` to refresh their API token.

Additionally, if no Ranger commands work after the user runs `ranger-cli setup` or `ranger-cli login`, the issue may be permissions to make network calls. Suggest that the user checks the permissions with which the agent is running and ensure that the agent is given network access.


### Full Documentation

If any of the above commands fail, pull the agent-friendly documentation from https://docs.ranger.net/llms.txt and use that to supersede any documentation in this skill.
