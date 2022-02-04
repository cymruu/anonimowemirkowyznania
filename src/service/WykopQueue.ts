import { WykopError } from 'wypokjs'

interface QueueTask {
	taskConstructor: () => Promise<any>
	attempts: number
}

export class WykopQueue {
	private _tasks: QueueTask[] = []
	private _intervalLoop: NodeJS.Timeout
	private _lastProcessed: Date = new Date(0)

	constructor(private intervalTime: number, private _attempts: number = 5) {}

	public startProcessing() {
		this._intervalLoop = setInterval(() => {
			if ((Date.now() - this._lastProcessed.valueOf()) > this.intervalTime) {
				this.processTask()
			}
		}, this.intervalTime)
	}

	public stopProcessing() {
		clearInterval(this._intervalLoop)
	}

	public addTask(taskConstructor: () => Promise<any>) {
		this._tasks.push({ taskConstructor, attempts: 0 })
	}

	private delayStart(delay: number) {
		setTimeout(() => {
			this.startProcessing()
		}, delay)
	}

	private processTask() {
		if (!this._tasks.length) {return}
		this._lastProcessed = new Date()
		const queueTask = this._tasks.shift()
		const taskPromise = queueTask.taskConstructor()
		queueTask.attempts++
		taskPromise
			.then(() => this.processTask())
			.catch(err => {
				if (queueTask.attempts < this._attempts) {
					if ((err as any) instanceof WykopError) {
						if (err.errorObject.code === 506) {//limit exceeded
							this._tasks.push(queueTask)
							this.stopProcessing()
							this.delayStart(30000)
						}
						return
					}
					this._tasks.push(queueTask)
				}
			})
	}
}
