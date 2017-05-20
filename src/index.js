class Queue {
    constructor(queue, concurrency = 1) {
        this.queue = queue
        this.concurrency = concurrency

        this._workers = []
        this._workersList = []

        setTimeout(() => {
            this.bulk()
        }, 0)
    }
    bulk() {
        const bulkNum = Math.min(this.concurrency, this._workers.length)
        for (let i = 0; i < bulkNum; i++) {
            const worker = this.next()
            console.log(worker)
        }
    }
    run(worker) {
        this._workersList.push(worker)
        this.queue(worker.task, (...args) => {
            this.pull(worker)

            if (typeof worker.callback === 'function') {
                worker.callback(...args)
            }
            if (this._workersList.length === 0 && this._workers.length === 0 && typeof this.drain === 'function') {
                this.drain()
            }
            this.next()
        })
    }
    push(task, callback) {
        const worker = {task, callback}
        this._workers.push(worker)
    }
    next() {
        if (this.concurrency > this._workersList.length && this._workers.length) {
            const worker = this._workers.shift()

            if (worker) {
                this.run(worker)
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
        const index = this._workersList.indexOf(worker)
        if (index !== -1) {
            this._workersList.splice(index, 1)
        }
    }
}

export function queue(...args) {
    return new Queue(...args)
}
