import type { Plugin } from '@opencode-ai/plugin';
import { tool } from '@opencode-ai/plugin/tool';
import { createRequire } from 'node:module';
import * as path from 'node:path';

type ShellFn = Parameters<Plugin>[0]['$'];

const require = createRequire(import.meta.url);
const resolveRangerCommand = (): string => {
    try {
        const pkgPath =
            require.resolve('@ranger-testing/ranger-cli/package.json');
        const pkg = require(pkgPath) as {
            bin?: string | Record<string, string>;
        };
        const binEntry =
            typeof pkg.bin === 'string'
                ? pkg.bin
                : (pkg.bin?.ranger ?? Object.values(pkg.bin ?? {})[0]);
        if (!binEntry) {
            return 'ranger';
        }
        return path.resolve(path.dirname(pkgPath), binEntry);
    } catch {
        return 'ranger';
    }
};
const rangerCommand = resolveRangerCommand();

async function runHook(
    $: ShellFn,
    name: string,
    sessionId: string,
    onError?: (name: string, error: unknown) => void,
): Promise<string> {
    try {
        const result =
            await $`${rangerCommand} hook --name=${name} --session-id=${sessionId}`
                .quiet()
                .text();
        return result.trim();
    } catch (error) {
        onError?.(name, error);
        return '';
    }
}

async function runEnable(
    $: ShellFn,
    sessionId: string,
): Promise<{ ok: boolean; output: string }> {
    try {
        const result =
            await $`${rangerCommand} hook enable --session-id=${sessionId}`
                .quiet()
                .text();
        return { ok: true, output: result.trim() };
    } catch {
        return {
            ok: false,
            output:
                'Failed to enable Ranger. Make sure @ranger-testing/ranger-cli ' +
                'is installed.',
        };
    }
}

async function runDisable(
    $: ShellFn,
    sessionId: string,
): Promise<{ ok: boolean; output: string }> {
    try {
        const result =
            await $`${rangerCommand} hook disable --session-id=${sessionId}`
                .quiet()
                .text();
        return { ok: true, output: result.trim() };
    } catch {
        return { ok: false, output: 'Failed to disable Ranger.' };
    }
}

export const RangerPlugin: Plugin = async ({ $ }) => {
    let enabled = false;
    let currentSessionId = '';
    let lastEditEventAt = 0;
    let lastEditHookOutput: string | null = null;
    let hookErrorLogged = false;
    const editDedupeWindowMs = 2000;

    const logHookError = (name: string, error: unknown) => {
        if (hookErrorLogged) return;
        hookErrorLogged = true;
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`[ranger] hook "${name}" failed: ${message}`);
    };

    return {
        tool: {
            ranger_enable: tool({
                description:
                    'Enable Ranger feature tracking hooks for this session. ' +
                    'Call this when the user asks to enable ranger or use the /ranger workflow.',
                args: {},
                async execute(_args, ctx) {
                    const sid = ctx.sessionID || currentSessionId;
                    if (!sid) return 'No session ID available.';
                    const result = await runEnable($, sid);
                    if (result.ok) {
                        enabled = true;
                        currentSessionId = sid;
                    }
                    return result.output || 'Ranger enabled.';
                },
            }),

            ranger_disable: tool({
                description:
                    'Disable Ranger feature tracking hooks for this session. ' +
                    'Call this when the user asks to disable ranger.',
                args: {},
                async execute(_args, ctx) {
                    const sid = ctx.sessionID || currentSessionId;
                    if (!sid) return 'No session ID available.';
                    const result = await runDisable($, sid);
                    if (result.ok) enabled = false;
                    return result.output || 'Ranger disabled.';
                },
            }),
        },

        event: async ({ event }) => {
            switch (event.type) {
                case 'session.created': {
                    currentSessionId = event.properties.info.id;
                    lastEditEventAt = 0;
                    lastEditHookOutput = null;
                    hookErrorLogged = false;
                    try {
                        const result =
                            await $`${rangerCommand} hook --name=session-start --session-id=${currentSessionId}`
                                .quiet()
                                .nothrow()
                                .text();
                        enabled = result.length > 0;
                    } catch {
                        enabled = false;
                    }
                    break;
                }

                case 'session.idle':
                    if (!enabled || !currentSessionId) return;
                    await runHook($, 'stop', currentSessionId, logHookError);
                    await runHook(
                        $,
                        'session-end',
                        currentSessionId,
                        logHookError,
                    );
                    enabled = false;
                    currentSessionId = '';
                    lastEditEventAt = 0;
                    lastEditHookOutput = null;
                    break;

                case 'file.edited':
                    if (!enabled || !currentSessionId) return;
                    lastEditEventAt = Date.now();
                    lastEditHookOutput = await runHook(
                        $,
                        'post-edit',
                        currentSessionId,
                        logHookError,
                    );
                    await runHook(
                        $,
                        'plan-reminder',
                        currentSessionId,
                        logHookError,
                    );
                    break;

                case 'message.updated':
                    if (!enabled || !currentSessionId) return;
                    await runHook(
                        $,
                        'plan-reminder',
                        currentSessionId,
                        logHookError,
                    );
                    break;
            }
        },

        'experimental.session.compacting': async ({ sessionID }, output) => {
            if (!enabled) return;
            const sid = sessionID || currentSessionId;
            if (!sid) return;
            const context = await runHook($, 'pre-compact', sid, logHookError);
            if (context) {
                output.context.push(context);
            }
        },

        'tool.execute.after': async ({ tool: toolName, sessionID }, output) => {
            if (!enabled) return;
            const sid = sessionID || currentSessionId;
            if (!sid) return;

            const editTools = ['file_edit', 'edit', 'write', 'multi_edit'];
            if (editTools.includes(toolName)) {
                const now = Date.now();
                const isRecentEditEvent =
                    lastEditEventAt > 0 &&
                    now - lastEditEventAt < editDedupeWindowMs;
                const hookOutput = isRecentEditEvent
                    ? lastEditHookOutput || ''
                    : await runHook($, 'post-edit', sid, logHookError);
                if (!isRecentEditEvent) {
                    await runHook($, 'plan-reminder', sid, logHookError);
                }
                lastEditEventAt = 0;
                lastEditHookOutput = null;
                if (hookOutput) {
                    output.output = [output.output, hookOutput]
                        .filter(Boolean)
                        .join('\n');
                }
                return;
            }

            await runHook($, 'plan-reminder', sid, logHookError);
        },
    };
};
