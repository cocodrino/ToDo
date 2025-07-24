import { performance } from 'node:perf_hooks';
import log from "encore.dev/log";

export function trace<T>(name: string, fn: () => T): T;
export function trace<T>(name: string, fn: () => Promise<T>): Promise<T>;
export function trace<T>(name: string, fn: () => T | Promise<T>) {
    const start = performance.now();
    const res = fn();
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    if (res && typeof res === 'object' && typeof (res as any).then === 'function') {
        // for promise
        return (res as Promise<T>).finally(() => {
            log.trace(`[trace] ${name} → ${(performance.now() - start).toFixed(2)} ms`);
        });
    }
    // for sync
    const end = performance.now();
    log.trace(`[trace] ${name} → ${(end - start).toFixed(2)} ms`);
    return res as T;
}