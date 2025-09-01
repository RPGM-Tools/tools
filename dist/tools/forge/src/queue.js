import { err, ResultAsync } from 'neverthrow';
export class ForgeQueue {
    queue = [];
    processing = 0;
    maxConcurrency;
    constructor(maxConcurrency = 1) {
        this.maxConcurrency = maxConcurrency;
    }
    generate(item, options = {
        autoDone: true
    }) {
        options.autoDone ??= true;
        return new ResultAsync(new Promise((cb) => {
            this.queue.push({ item, cb, options });
            this.process();
        }));
    }
    async process() {
        while (this.queue.length > 0 && this.processing < this.maxConcurrency) {
            this.processing++;
            let doneCalled = false;
            const { item, cb, options } = this.queue.shift();
            const done = () => {
                if (doneCalled)
                    return;
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
