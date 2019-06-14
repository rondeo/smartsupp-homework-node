import Redis = require('ioredis')

export class ClientStorage {

	/**
	 * @injectable(app.clientStorage)
	 * @param redis @inject(redis)
	 */
	constructor(
		private redis: Redis.Redis,
	) {
	}

	async addClient(id: string, data: any): Promise<any> {
		await this.redis.set(`client:${id}`, JSON.stringify(data))
	}

	async getClient(id: string): Promise<any> {
		const res = await this.redis.get(`client:${id}`)
		return res ? JSON.parse(res) : null
	}

	async deleteClient(id: string): Promise<any> {
		await this.redis.del(`client:${id}`)
	}
}


