# Ranger Plugin for Claude Code

E2E testing and feature development tools for Claude Code.

## Getting Started

### Step 1: Install Ranger

```bash
npm install -g @ranger-testing/ranger-cli
```

### Step 2: Get Your Token

Go to [dashboard.ranger.net/cli](https://dashboard.ranger.net/cli) to get your API token.

### Step 3: Initialize Your Project

```bash
ranger start <your-token>
```

This will guide you through setup. If you skipped any steps, run them manually:

- Add a browser environment for verification:
  ```bash
  ranger add env local
  ```
- Install Claude Code skills:
  ```bash
  ranger skillup
  ```
- Install the Claude Code plugin:
  ```bash
  claude plugin marketplace add ranger-testing/trailhead
  claude plugin install ranger@trailhead --scope user
  ```

## Using Ranger with Claude

Once set up, here's the typical workflow:

1. Start a Claude Code session in your project
2. Run `/ranger:enable` to activate Ranger
3. Enter plan mode with `/plan` to begin planning your feature
4. Accept the plan - Ranger tracks your feature automatically
5. Watch Ranger verify your feature in the browser

Ranger stays enabled on your branch across sessions. Use `/ranger:disable` to turn it off.

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
