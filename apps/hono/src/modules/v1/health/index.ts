import { OpenAPIHono } from '@hono/zod-openapi'
import { createRoute } from '@hono/zod-openapi'
import { HealthResponseSchema } from './types'
import { getHealth } from './controller'

const health = new OpenAPIHono()

const route = createRoute({
  method: 'get',
  path: '/api/v1/health',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: HealthResponseSchema
        }
      },
      description: 'System health information'
    }
  },
  tags: ['System'],
  summary: 'Get system health status',
  description: 'Returns the current health status of the system'
})

health.openapi(route, async (c) => {
  const response = await getHealth()
  return c.json(response)
})

export default health

