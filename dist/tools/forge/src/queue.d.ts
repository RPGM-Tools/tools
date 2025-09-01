import type { Result } from 'neverthrow';
import { ResultAsync } from 'neverthrow';
export type QueueOptions = Partial<{
    autoDone: boolean;
}>;
export declare class ForgeQueue {
    private queue;
    private processing;
    private maxConcurrency;
    constructor(maxConcurrency?: number);
    generate<R, E>(item: (done: () => void) => PromiseLike<Result<R, E>>, options?: QueueOptions): ResultAsync<R, E>;
    private process;
}
