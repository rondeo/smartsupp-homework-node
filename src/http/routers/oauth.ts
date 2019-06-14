import * as koaBody from 'koa-body'
import * as Router from 'koa-router'
import {validate} from "@src/http/validator";
import * as Joi from '@hapi/joi'
import { Context } from "koa";
import { ClientStorage } from '@src/app/clientStorage'
import { OauthStorage } from '@src/app/oauthStorage'
const utils = require('../../utils')

/**
 * @injectable(http.routers.oauth)
 * @param clientStorage @inject(app.clientStorage)
 * @param oauthStorage @inject(app.oauthStorage)
 */
export function createRouter(clientStorage: ClientStorage, oauthStorage: OauthStorage) {
	const router = new Router()
	router.use(koaBody())

	router.get('/oauth/authorize', validate({
		query: {
			id: Joi.string().required(),
			redirectUri: Joi.string().required(),
			responseType: Joi.string().required(),
		}
	}), async (ctx: Context) => {
		const redirectUri = ctx.query.redirectUri
		const clientId = ctx.query.id
		const responseType = ctx.query.responseType
		const client = await clientStorage.getClient(clientId)

		if (!client || client.redirectUri != redirectUri) {
			ctx.throw('Client not found', 404)
		}

		// response type has to be 'code', if you want to get the code
		if (responseType != 'code') {
			ctx.throw('Wrong response type', 404)
		}

		const code = utils.generateRandomString()
		await oauthStorage.addCode(code, {clientId})

		ctx.body = {code}
	})

	router.get('/oauth/token', validate({
		query: {
			id: Joi.string().required(),
			redirectUri: Joi.string().required(),
			secret: Joi.string().required(),
			code: Joi.string().required(),
		}
	}), async (ctx: Context) => {
		const clientId = ctx.query.id
		const { redirectUri, secret, code } = ctx.query

		const client = await clientStorage.getClient(clientId)
		if (!client || client.redirectUri != redirectUri) {
			ctx.throw('Client not found', 404)
		}

		const authClient = await oauthStorage.getClientByCode(code)
		if (!authClient) {
			ctx.throw('Wrong code', 403)
		}

		if (authClient.clientId != clientId || secret != client.secret) {
			ctx.throw('Wrong secret or client ID.', 403)
		}

		const accessToken = utils.generateRandomString()
		await oauthStorage.addAccessToken(accessToken)
		ctx.body = {accessToken}
	})

	return router
}
