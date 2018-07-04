const _ = require('lodash')
const bunyan = require('bunyan')
const os = require('os')
const ms = require('ms')

const hostname = os.hostname()
const resolveIp = ip => (ip.slice(0, 7) === '::ffff:' ? ip.slice(7) : ip)

module.exports = ({ name, environment } = {}) => {
  const log = bunyan.createLogger({ name })

  return async (ctx, next) => {
    const headers = _.omit(ctx.request.headers, ['authorization'])
    const ip = resolveIp(ctx.request.ip)

    const start = Date.now()

    await next()

    const end = Date.now()
    const duration = ms(end - start)

    if (ctx.status >= 400) {
      const { error, stack } = ctx.body || {}

      log.error(
        _.omitBy(
          {
            environment,
            headers,
            hostname,
            ip,
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
      log.info(
        _.omitBy(
          {
            environment,
            headers,
            hostname,
            ip,
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
