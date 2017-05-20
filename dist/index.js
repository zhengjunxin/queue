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
        this.concurrency = checkConcurrency(concurrency);

        this._workers = [];
        this._workersList = [];

        setTimeout(() => {
            this.bulk();
        }, 0);
    }
    bulk() {
        const bulkNum = Math.min(this.concurrency, this._workers.length);
        for (let i = 0; i < bulkNum; i++) {
            const worker = this.next();
            console.log(worker);
        }
    }
    run(worker) {
        this._workersList.push(worker);
        this.queue(worker.task, (...args) => {
            this.pull(worker);

            if (typeof worker.callback === 'function') {
                worker.callback(...args);
            }
            if (this._workersList.length === 0 && this._workers.length === 0 && typeof this.drain === 'function') {
                this.drain();
            }
            this.next();
        });
    }
    push(task, callback) {
        const worker = {task, callback};
        this._workers.push(worker);
    }
    next() {
        if (this.concurrency > this._workersList.length && this._workers.length) {
            const worker = this._workers.shift();

            if (worker) {
                this.run(worker);
                return worker
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
}

function queue(...args) {
    return new Queue(...args)
}

exports.queue = queue;

Object.defineProperty(exports, '__esModule', { value: true });

})));
