/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Result } from 'neverthrow';
import { err, ResultAsync } from 'neverthrow';

export type QueueOptions = Partial<{
	autoDone: boolean
}>;

type QueueItem<T = any, E = any> = {
	item: (done: () => void) => PromiseLike<Result<T, E>>;
	cb: (result: Result<T, E>) => void;
	options: QueueOptions;
};

export class ForgeQueue {
	private queue: QueueItem[] = [];
	private processing = 0;
	private maxConcurrency: number;

	constructor(maxConcurrency = 1) {
		this.maxConcurrency = maxConcurrency;
	}

	generate<R, E>(item: (done: () => void) => PromiseLike<Result<R, E>>, options: QueueOptions = {
		autoDone: true
	}) {
		options.autoDone ??= true;
		return new ResultAsync<R, E>(new Promise<Result<R, E>>((cb) => {
			this.queue.push({ item, cb, options });
			this.process();
		}));
	}

	private async process() {
		while (this.queue.length > 0 && this.processing < this.maxConcurrency) {
			this.processing++;
			let doneCalled = false;
			const { item, cb, options } = this.queue.shift()!;
			const done = () => {
				if (doneCalled) return;
				doneCalled = true;
				this.processing--;
				this.process();
			};
			item(done).then((r) => {
				cb(r);
				if (options.autoDone)
					done();
			}, (e) => {
				cb(err(e));
				if (options.autoDone)
					done();
			});
		}
	}
}
