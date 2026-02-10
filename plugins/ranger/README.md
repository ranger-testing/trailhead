# Ranger Plugin for Claude Code

Automated browser verification and feature review for AI-assisted development. Ranger lets your coding agent verify UI features in a real browser and gives your team a dashboard to review the results.

## Getting Started

### 1. Install and set up the Ranger CLI

```bash
npm install -g @ranger-testing/ranger-cli
ranger start
```

`ranger start` walks you through authentication, browser setup, plugin installation, environment configuration, and skill installation interactively.

### 2. Enable Ranger in Claude Code

At the start of your session:

```
/ranger:enable
```

Ranger stays enabled on your branch across sessions. Use `/ranger:disable` to turn it off.

## What Happens

With Ranger enabled, Claude will:

1. Create a **feature** with checklist items describing what to verify
2. Implement the code
3. Run **browser verification** -- a separate agent tests the feature in Chromium
4. Fix issues and re-verify until everything passes
5. Share a link to the **feature review dashboard** where you can review screenshots, video, leave comments, and approve

## Plugin Commands

- `/ranger:enable` -- Enable Ranger hooks for this session and branch
- `/ranger:disable` -- Disable Ranger hooks

## Skills

- `/ranger` -- Invokes the Ranger skill for creating, verifying, and managing features (installed via `ranger skillup`)

## Hooks

Hooks fire automatically at key points in the Claude Code session. They only activate after you run `/ranger:enable`.

| When               | What happens                                             |
| ------------------ | -------------------------------------------------------- |
| Entering plan mode | Reminds Claude to include a Ranger Feature Specification |
| During plan mode   | Periodic reminders to add checklist items                |
| Exiting plan mode  | Prompts to create a Ranger feature from the plan         |
| After file edits   | Suggests using /ranger for UI work                       |
| Before compaction  | Reminds Claude to preserve feature specifications        |
| Session ending     | Concludes active feature session                         |

## Learn More

- [Ranger CLI README](https://www.npmjs.com/package/@ranger-testing/ranger-cli) -- Full CLI documentation
- [Feature Review Dashboard](https://dashboard.ranger.net) -- Review verified features with your team
