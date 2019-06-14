import * as Joi from '@hapi/joi'
import { ClientStorage } from '@src/app/clientStorage'
import * as koaBody from 'koa-body'
import { Context } from 'koa'
import * as Router from 'koa-router'
import { validate } from '../validator'

/**
 * @injectable(http.routers.clients)
 * @param clientStorage @inject(app.clientStorage)
 */
export function createRouter(clientStorage: ClientStorage) {
	const router = new Router()
	router.use(koaBody())

	router.get('/clients/:id', async (ctx: Context) => {
		const client = await clientStorage.getClient(ctx.params.id)
		if (!client) {
			ctx.throw('Client not found', 404)
		}

		ctx.body = client
	})

	router.post('/clients/:id', validate({
		params: {
			id: Joi.string().required(),
		},
		body: {
			secret: Joi.string().required(),
			redirectUri: Joi.string().required(),
		}
	}), async (ctx: Context) => {
		await clientStorage.addClient(ctx.params.id, ctx.request.body)

		ctx.body = {ok: true}
	})

	router.delete('/clients/:id', validate({
		params: {
			id: Joi.string().required(),
		},
	}), async (ctx: Context) => {
		await clientStorage.deleteClient(ctx.params.id)

		ctx.body = {ok: true}
	})

	return router
}
