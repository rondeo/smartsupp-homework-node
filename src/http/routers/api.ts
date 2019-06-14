import * as koaBody from 'koa-body'
import * as Router from 'koa-router'
import {Context} from "koa";
import {validate} from "@src/http/validator";
import * as Joi from '@hapi/joi'
import {OauthStorage} from "@src/app/oauthStorage";

/**
 * @injectable(http.routers.api)
 * @param oauthStorage @inject(app.oauthStorage)
 */
export function createRouter(oauthStorage: OauthStorage) {
	const router = new Router()
	router.use(koaBody())

	router.get('/api/test', validate({
		query: {
			accessToken: Joi.string().required(),
		}
	}), async (ctx: Context) => {
		const accessToken = ctx.query.accessToken

		if (!await oauthStorage.isValidAccessToken(accessToken)) {
			ctx.throw('Access denied', 403)
		}

		ctx.body = 'Welcome, successful access.'
	})

	return router
}
