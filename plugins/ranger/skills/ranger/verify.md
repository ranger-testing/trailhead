# Verifying Scenarios

## One-shot: creds + goal in, verification out

When the user gives you credentials and a goal (e.g. "use alice@example.com / hunter2 and check the dashboard renders"), run `go` directly with env vars inline — no `create`, no `profile add`, no ceremony:

```bash
RANGER_TEST_USERNAME='alice@example.com' RANGER_TEST_PASSWORD='hunter2' \
  ranger-cli go --base-url <target-url> --notes '<the goal verbatim>'
```

If credentials already live in a nearby `.env`, source it inline before running `go` instead of typing values (`set -a; source ./.env; set +a`).

The CLI:

- Materializes a profile from `RANGER_TEST_USERNAME` if one doesn't exist
- Runs the configured login if no session is cached
- Creates a feature review automatically when one is needed
- Captures a trace + screenshots you can link to

This works for any login flow Ranger has set up with the customer — username/password, SSO, OAuth, MFA, passkeys. Don't worry about the auth shape; if the user gave you creds, try this path first.

Do **not** run `ranger-cli create` first unless the user explicitly asks for a structured feature review with multiple scenarios.

### Fallback when the one-shot path fails

If `go` returns a 422 / login-failed, automated login probably isn't set up for this account. Fall back in this order:

1. **Active profile** — `ranger-cli go` with no env vars (works if a human ran `profile add` for this app)
2. **Interactive setup** — ask the user to run `ranger-cli profile add <name>`
3. **For CI / background-agent flows**: automated login is set up per-app with the Ranger team — point the user at https://docs.ranger.net/main/concepts/profiles#automated-login

If the user did NOT give you credentials, skip the env-var path entirely and go straight to fallback #1 or #2.

## Scenario-driven verification

After implementing code against a scenario in an active feature review, verify it:

```bash
ranger-cli go --scenario <N> --notes "<what to verify>"
```

## Profile resolution order

1. `--profile <name>` flag (or `RANGER_PROFILE` env var)
2. Saved active profile (`ranger-cli profile use <name>`)
3. `RANGER_TEST_USERNAME` (reuses or creates a matching profile)
4. The org's sole profile when exactly one exists

## Active feature review (only needed for scenario-driven runs)

If you're verifying a scenario (not a one-shot):

```bash
ranger-cli list                # Find feature reviews to resume
ranger-cli resume <id>         # Resume a specific feature review
```

For a one-shot `go --base-url ... --notes '...'`, the CLI handles feature-review creation for you.

## The Verification Flow

1. **Select scenario** - CLI prompts which scenario this verifies
2. **Fetch reviewer feedback** - If the scenario has unaddressed comments or a parent scenario, reviewer comments are automatically injected into the verification prompt
3. **Run browser verification** - Agent executes the task in a real browser
4. **Evaluate results** - Agent determines if the scenario is satisfied (including whether reviewer concerns were addressed)
5. **Update status** - Scenario is marked verified, partial, blocked, or failed
6. **Link evidence** - Session trace is attached to the scenario

### Reviewer Feedback Auto-Injection

When verifying scenarios that have reviewer comments (v2+ scenarios or scenarios with unaddressed comments), the verification agent automatically receives a **"Reviewer Feedback to Address"** section in its prompt. This includes:
- Each reviewer comment with author and date
- The previous version's description
- The canonical flow from prior verification (if available)

You do NOT need to manually include reviewer feedback in your `--notes` description — it's handled automatically. Just make sure you've addressed the feedback in your code before verifying.

## Options

| Option | Required | Description |
|--------|----------|-------------|
| `--profile` | No | Profile to use. Equivalent to `RANGER_PROFILE` env var. Defaults to active profile, or to the user keyed by `RANGER_TEST_USERNAME` if set. |
| `--notes` | No | What to verify (defaults to scenario description) |
| `--scenario` | No | Scenario index to verify (skips selection prompt) |
| `--start-path` | No | Path to start on (appended to base URL, e.g., `/dashboard`) |
| `--headed` | No | Force headed browser for this run only (does not modify profile config). This forces the user's system focus to the browser, so only use this if explicitly directed to do so. |

## Writing Good Task Descriptions

The `--notes` is what the verification agent will actually do. Be VERY specific:

**Bad:**
```bash
--notes "Test login"
```

**Good:**
```bash
--notes "Navigate to /login. Enter test@example.com in email field and password123 in password field. Click the Submit button. Verify a loading spinner appears. Verify redirect to /dashboard within 5 seconds. Verify the user's name appears in the header."
```

## Using Scenario Description as Task

If your scenario has a detailed description, you can omit `--notes`:

```bash
# Scenario 1: "User can log in with valid credentials - sees loading state - redirects to dashboard"
ranger-cli go --scenario 1
```

The scenario description becomes the task automatically.

## Evaluation Results

After verification, the agent evaluates if the result satisfies the scenario:

| Result | Meaning | Scenario Status |
|--------|---------|-------------|
| **Verified** | Task completed, requirements met | ✅ Verified |
| **Partial** | Some aspects work, others don't | ⬜ Pending (session linked) |
| **Blocked** | Bug or error prevents completion | 🛑 Blocked |
| **Failed** | Task couldn't be executed | ⬜ Pending (issues documented) |

## Parallel Verification

Run multiple non-conflicting verifications in parallel using background execution.

### How to Run

Use Bash with `run_in_background: true`:

```
[Bash: ranger-cli go --scenario 1, run_in_background: true] → task_abc
[Bash: ranger-cli go --scenario 2, run_in_background: true] → task_def
```

Poll with TaskOutput, report results as they complete.

### Safe to Parallelize

- Viewing pages, checking UI elements, navigation tests
- Read-only operations that don't modify shared state

### Do NOT Parallelize

- Logout tests (affects auth state for other sessions)
- Create/delete operations on shared data
- Tests with dependencies on each other

### CRITICAL: No Code Edits During Verification

File watchers (Next.js, Vite) will restart the dev server and break active browser sessions. Finish all code changes before running verifications.

## Examples

### Basic Verification

```bash
ranger-cli go --scenario 1 --notes "Log in with test@example.com / password123, verify redirect to dashboard"
```

### Verify Specific Scenario

```bash
# Skip the selection prompt, verify scenario 2 directly
ranger-cli go --notes "Complete signup flow with new email" --scenario 2
```

### Verify with Specific Profile

```bash
# Use staging profile instead of active profile
ranger-cli go --profile staging --scenario 1 --notes "Verify login works in staging"
```

### Start on a Specific Page

```bash
# Start verification at /settings instead of base URL
ranger-cli go --start-path /settings --scenario 1 --notes "Verify user can update their profile"

# Start at /admin/users
ranger-cli go --start-path /admin/users --scenario 2 --notes "Verify admin can see user list"
```

## After Verification

Check progress:

```bash
ranger-cli show
```

If all non-closed scenarios are verified, the feature review auto-completes:

```
✅ User Authentication (feat_abc123)
   Status: completed
   ...
```

## Evidence Captured

Each verification creates:
- **Playwright trace** - Full browser session replay
- **Screenshots** - Captured during execution
- **Conversation log** - Agent's reasoning and actions
- **Session summary** - What was done and found

Access evidence via the report or dashboard.

Always end the conversational turn by sharing the dashboard link whenever you run `ranger-cli go ...`:

> Here is the link to the Feature Review in Ranger. Leave comments in the dashboard and then resume the feature review in your agent.
> https://dashboard.ranger.net/features/{feature_id}

## Troubleshooting

### "No active feature review"
Run `ranger-cli list` to find feature reviews, then `ranger-cli resume <id>` to resume one.

### "No active profile"
Either set `RANGER_TEST_USERNAME` (and `RANGER_TEST_PASSWORD` for first-time login) and re-run, or pin one explicitly with `ranger-cli profile use <profile-name>`.

### Verification times out
The agent has 59 minutes max. For very long flows, break into smaller scenarios.

### Wrong scenario marked
Reset the scenario via the dashboard, then re-verify.
