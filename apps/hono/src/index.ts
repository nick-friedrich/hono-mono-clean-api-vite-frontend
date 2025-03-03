import { Hono } from 'hono'
import health from './modules/v1/health'
import auth from './modules/v1/auth'

const app = new Hono()
const api = app.basePath('/api')
const v1 = api.basePath('/v1')

/**
 * Modules
 */
v1.route('/health', health)
v1.route('/auth', auth)


/**
 * Export
 */
export * from './modules/types'
export default app
