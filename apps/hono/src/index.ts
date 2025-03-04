import { Hono } from 'hono'
import health from './modules/v1/health'
import auth from './modules/v1/auth'
import user from './modules/v1/user'
import { getMailService } from './utils/email/email'
import { ConsoleMailAdapter } from './utils/email/email'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'

const app = new Hono()

// Middlewares
app.use('*', logger())
app.use('*', cors())

const api = app.basePath('/api')
const v1 = api.basePath('/v1')

/**
 * Mail service
 */
const mailService = getMailService()
mailService.initializeWith(new ConsoleMailAdapter())

/**
 * Modules
 */
v1.route('/health', health)
v1.route('/auth', auth)
v1.route('/user', user)


/**
 * Export
 */
export * from './modules/types'
export default app
