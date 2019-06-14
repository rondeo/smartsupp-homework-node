import { Container } from 'node-injectable'
import { createClient, createContainer, startServer, stopServer } from '../support/helpers'
import { AxiosInstance } from 'axios'

describe('api', () => {
	let container: Container
	let client: AxiosInstance
	let accessToken: string

	beforeAll(async () => {
		container = await createContainer()
		await startServer(container)
		client = createClient()
		await client.post('/clients/5', { secret: 'secretKey', redirectUri: 'www.google.sk' })
		const authorizeResponse = await client.get('/oauth/authorize?id=5&redirectUri=www.google.sk&responseType=code')
		const code = authorizeResponse.data.code
		const tokenResponse = await client.get(`/oauth/token?id=5&redirectUri=www.google.sk&secret=secretKey&code=${code}`)
		accessToken = tokenResponse.data.accessToken
	})

	test('should get validation error without access token', async () => {
		const res = await client.get('/api/test')
		expect(res.status).toBe(400)
	})

	test('should get access denied when incorrect access token', async () => {
		const res = await client.get('/api/test?accessToken=incorrect')
		expect(res.status).toBe(403)
	})

	test('should get access successful when correct access token', async () => {
		const res = await client.get(`/api/test?accessToken=${accessToken}`)
		expect(res.status).toBe(200)
	})

	afterAll(async () => {
		await stopServer(container)
	})
})
