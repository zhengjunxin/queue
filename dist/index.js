(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.queue = global.queue || {})));
}(this, (function (exports) { 'use strict';

const checkConcurrency = (concurrency = 1) => {
    if (concurrency == null) {
        concurrency = 1;
    }
    else if (concurrency === 0) {
        throw new Error('Concurrency must not be zero')
    }
    return concurrency
};

class Queue {
    constructor(queue, concurrency) {
        this.queue = queue;
        this._concurrency = checkConcurrency(concurrency);

        Object.defineProperty(this, 'concurrency', {
            get: () => {
                return this._concurrency
            },
            set: (value) => {
                console.log('set', value);
                this._concurrency = value;
                this.bulk();
            }
        });
        this._workers = [];
        this._workersList = [];
        this._idle = true;
        this.paused = false;

        this.bulk();
    }
    bulk() {
        setTimeout(() => {
            const bulkNum = Math.min(this._concurrency, this._workers.length);
            for (let i = 0; i < bulkNum; i++) {
                const worker = this.next();
            }
        }, 0);
    }
    run(worker) {
        this._workersList.push(worker);
        function done(...args) {
            if (done.called) {
                throw new Error('Callback was already called')
            }
            done.called = true;
            this.pull(worker);

            if (typeof worker.callback === 'function') {
                worker.callback(...args);
            }
            if (this._workersList.length === 0 && this._workers.length === 0 && typeof this.drain === 'function') {
                this._idle = true;
                this.drain();
            }
            this.next();
        }
        this.queue(worker.task, done.bind(this));
    }
    push(task, callback) {
        const worker = {task, callback};
        this._idle = false;
        this._workers.push(worker);
    }
    next() {
        if (!this.paused && this.concurrency > this._workersList.length && this._workers.length) {
            const worker = this._workers.shift();

            if (worker) {
                this.run(worker);
            }
        }
    }
    length() {
        return this._workers.length
    }
    workersList() {
        return this._workersList
    }
    pull(worker) {
        const index = this._workersList.indexOf(worker);
        if (index !== -1) {
            this._workersList.splice(index, 1);
        }
    }
    running() {
        return this._workersList.length
    }
    unshift(task, callback) {
        const worker = {task, callback};
        this._idle = false;
        this._workers.unshift(worker);
    }
    idle() {
        return this._idle
    }
    pause() {
        this.paused = true;
    }
    resume() {
        this.paused = false;

        this.bulk();
    }
    kill() {
        this._workers.length = 0;
        this._idle = true;
    }
}

function queue(...args) {
    return new Queue(...args)
}

exports.queue = queue;

Object.defineProperty(exports, '__esModule', { value: true });

})));
