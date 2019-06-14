import { Container } from 'node-injectable'
import { createClient, createContainer, startServer, stopServer } from '../support/helpers'
import { AxiosInstance } from 'axios'

describe('oauth', () => {
	let container: Container
	let client: AxiosInstance
	let code: string

	beforeAll(async () => {
		container = await createContainer()
		await startServer(container)
		client = createClient()
		await client.post('/clients/5', { secret: 'secretKey', redirectUri: 'www.google.sk' })
		const authorizeResponse = await client.get('/oauth/authorize?id=5&redirectUri=www.google.sk&responseType=code')
		code = authorizeResponse.data.code
	})

	test('should get validation error without required parameters', async () => {
		const res = await client.get('/oauth/authorize')
		expect(res.status).toBe(400)
	})

	test('should get not found response type error when response type is not "code"', async () => {
		const res = await client.get('/oauth/authorize?id=5&redirectUri=www.google.sk&responseType=badType')
		expect(res.status).toBe(404)
	})

	test('should get client not found when client id does not exists', async () => {
		const res = await client.get('/oauth/authorize?id=999&redirectUri=www.google.sk&responseType=code')
		expect(res.status).toBe(404)
	})

	test('should get client not found when bad redirectUri', async () => {
		const res = await client.get('/oauth/authorize?id=5&redirectUri=www.test.test&responseType=code')
		expect(res.status).toBe(404)
	})

	test('should get code when id,redirectUri and responsType are correct', async () => {
		const res = await client.get('/oauth/authorize?id=5&redirectUri=www.google.sk&responseType=code')
		expect(res.status).toBe(200)
		expect(res.data.code).toBeDefined()
	})

	test('should get validation error without required parameters to receive token', async () => {
		const res = await client.get('/oauth/token')
		expect(res.status).toBe(400)
	})

	test('should get client not found when id does not exists', async () => {
		const res = await client.get(`/oauth/token?id=999&redirectUri=www.google.sk&secret=secretKey&code=${code}`)
		expect(res.status).toBe(404)
	})

	test('should get client not found when redirectUri is not correct', async () => {
		const res = await client.get(`/oauth/token?id=5&redirectUri=www.test.test&secret=secretKey&code=${code}`)
		expect(res.status).toBe(404)
	})

	test('should get access forbidden when secret is not correct', async () => {
		const res = await client.get(`/oauth/token?id=5&redirectUri=www.google.sk&secret=notCorrectSecret&code=${code}`)
		expect(res.status).toBe(403)
	})

	test('should get access forbidden when code is not correct', async () => {
		const res = await client.get(`/oauth/token?id=5&redirectUri=www.google.sk&secret=secretKey&code=notCorrectCode`)
		expect(res.status).toBe(403)
	})

	test('should get access token when parameters are correct', async () => {
		const res = await client.get(`/oauth/token?id=5&redirectUri=www.google.sk&secret=secretKey&code=${code}`)
		expect(res.status).toBe(200)
		expect(res.data.accessToken).toBeDefined()
	})

	afterAll(async () => {
		await stopServer(container)
	})
})
