# Ranger OpenCode Plugin

Ranger hooks for OpenCode sessions. Use this plugin to track features and run browser verification from OpenCode.

## Install

1. Install the Ranger CLI.

```bash
npm install -g @ranger-testing/ranger-cli
```

2. Run setup from your project root.

```bash
ranger setup --opencode
```

This writes `opencode.json` with the plugin entry and completes authentication.

3. Start OpenCode and run the `ranger_enable` tool to enable hooks.

## Manual config

If you prefer to edit the config yourself, add this to `opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["@ranger-testing/opencode-plugin"]
}
```
