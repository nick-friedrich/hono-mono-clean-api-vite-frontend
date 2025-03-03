import { Hono } from 'hono'
import health from './modules/v1/health'

const app = new Hono()
const api = app.basePath('/api')
const v1 = api.basePath('/v1')

/**
 * Modules
 */
v1.route('/health', health)

/**
 * Export
 */
export * from './modules/types'
export default app
