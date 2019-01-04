const _ = require('lodash')
const ms = require('ms')

module.exports = logger => {
  if (!logger) throw Error('Missing logger')

  return async (ctx, next) => {
    const headers = ctx.request.headers

    const start = Date.now()

    await next()

    const end = Date.now()
    const duration = ms(end - start)

    if (ctx.status >= 400) {
      const { error, stack } = ctx.body || {}

      logger.error(
        _.omitBy(
          {
            headers,
            duration,
            error,
            stack,
            method: ctx.method,
            path: ctx.path,
            status: ctx.status,
            params: _.isEmpty(ctx.params) ? null : ctx.params,
            query: _.isEmpty(ctx.query) ? null : ctx.query,
            body: _.isEmpty(ctx.request.body) ? null : ctx.request.body,
          },
          _.isNil,
        ),
        'Request error',
      )
    } else {
      logger.info(
        _.omitBy(
          {
            headers,
            duration,
            method: ctx.method,
            path: ctx.path,
            status: ctx.status,
            params: _.isEmpty(ctx.params) ? null : ctx.params,
            query: _.isEmpty(ctx.query) ? null : ctx.query,
            body: _.isEmpty(ctx.request.body) ? null : ctx.request.body,
          },
          _.isNil,
        ),
        'Request success',
      )
    }
  }
}
