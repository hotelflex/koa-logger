const _ = require('lodash')
const ms = require('ms')
const calcObjSize = require('./lib/calcObjSize')

module.exports = (logger, opts={}) => {
  if (!logger) throw Error('Missing logger')

  return async (ctx, next) => {
    const headers = ctx.request.headers

    const start = Date.now()

    await next()

    const end = Date.now()
    const duration = ms(end - start)

    let body = ctx.request.body
    const bodySize = calcObjSize(ctx.request.body)
    if(bodySize > 9.9 * 1000) { //logdna body limit
      body = { message: 'request body too large', bodySize }
    }

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
            body: opts.noBody ? null : _.isEmpty(body) ? null : body,
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
            body: opts.noBody ? null : _.isEmpty(body) ? null : body,
          },
          _.isNil,
        ),
        'Request success',
      )
    }
  }
}
