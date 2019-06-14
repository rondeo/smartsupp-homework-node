import * as Koa from 'koa'

export default () => {

	function formatCode(status) {
		switch (status) {
			case 404:
				return 'not_found'
			case 403:
				return 'access_forbidden'
			case 400:
				return 'bad_request'
			default:
				return 'unknown_error'
		}
	}

	return async (ctx: Koa.Context, next) => {
		try {
			await next()
		} catch (err) {
			if (err.expose) {
				ctx.status = err.status
				if (err.isJoi) {
					ctx.body = {
						code: 'validation_error',
						message: err.message,
						details: err.details,
					}
				} else {
					ctx.body = {
						code: err.code || formatCode(err.status),
						message: err.message || formatCode(err.status),
					}
				}
			} else {
				ctx.status = 500
				ctx.body = {
					code: 'server_error',
					message: 'Internal server error',
				}
				ctx.app.emit('error', err, ctx)
			}
		}
	}

}
