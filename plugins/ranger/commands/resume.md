---
description: "Resume work on a Ranger feature review by ID. Usage: /ranger:resume <feature_id>"
allowed-tools: ["Bash(ranger feature resume *)", "Bash(ranger feature get-feedback)", "Bash(ranger verify-feature *)", "Bash(ranger resume *)", "Bash(ranger show)", "Bash(ranger get-review)", "Bash(ranger go *)"]
---

# Resume Feature Review

Resume work on the feature specified by the user's argument (the feature ID, e.g. `feat_XXXXX`).

## Instructions

1. Run `ranger feature resume <feature_id>` to set the active feature
2. Run `ranger feature get-feedback` to see reviewer comments on items
3. Implement the pending/blocked items, addressing any reviewer feedback
4. After each implementation, verify with:
   `ranger verify-feature --item <number>`

Use the /ranger skill to manage this workflow.
