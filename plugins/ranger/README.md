# Ranger Plugin for Claude Code

E2E testing and feature development tools for Claude Code.

## Required Setup

**Step 1:** Install the Ranger CLI
```bash
npm install -g @ranger-testing/ranger-cli
```

**Step 2:** Get your token from [dashboard.ranger.net/cli](https://dashboard.ranger.net/cli)

**Step 3:** Initialize Ranger in your project
```bash
ranger start <your-token>
```

**Step 4:** (Optional) Add a browser environment for UI testing
```bash
ranger add env local
```

## Plugin Commands

- `/ranger:enable` - Enable Ranger hooks for this session (required before using the /ranger skill)
- `/ranger:disable` - Disable Ranger hooks for this session

## Available Skills

- `/ranger` - Track feature development with browser-verified checklist items (installed via `ranger skillup`)

## Hooks

This plugin runs hooks at key points in the Claude Code session. Hooks only fire when enabled via `/ranger:enable`.

| When | What happens |
|------|--------------|
| Entering plan mode | Reminds Claude to include a Ranger Feature Specification |
| During plan mode | Periodic reminders to add checklist items |
| Exiting plan mode | Prompts to create a Ranger feature from the plan |
| After file edits | Suggests using /ranger for UI work |
| Before compaction | Reminds Claude to preserve feature specifications |
| Session ending | Concludes active feature session |

## Workflow

1. Run `/ranger:enable` at the start of your session
2. When working on UI features, use `/ranger`
3. In plan mode, include a Ranger Feature Specification
4. Run `ranger feature create` to track progress
5. Use `ranger verify-feature` to verify checklist items in the browser
