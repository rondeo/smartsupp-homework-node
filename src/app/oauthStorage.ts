import Redis = require('ioredis')

export class OauthStorage {

	/**
	 * @injectable(app.oauthStorage)
	 * @param redis @inject(redis)
	 */
	constructor(
		private redis: Redis.Redis,
	) {
	}

	async addCode(code: string,  data: any): Promise<any> {
		await this.redis.set(`code:${code}`, JSON.stringify(data))
	}

	async getClientByCode(code: string): Promise<any> {
		const res = await this.redis.get(`code:${code}`)
		return res ? JSON.parse(res) : null
	}

	async addAccessToken(accessToken: string): Promise<any> {
		await this.redis.sadd(`accessTokens`, accessToken)
	}

	async isValidAccessToken(accessToken: string): Promise<any> {
		return await this.redis.sismember(`accessTokens`, accessToken)
	}
}


