import { OpenAPIHono } from '@hono/zod-openapi'
import { createRoute } from '@hono/zod-openapi'
import { UserResponseSchema } from './types'
import { UserController } from './user.controller'

const user = new OpenAPIHono()

const userRoute = createRoute({
  method: 'get',
  path: '/user/{id}',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: UserResponseSchema
        }
      },
      description: 'User information'
    }
  },
  tags: ['User'],
  summary: 'Get user information',
  description: 'Get user information'
})

user.openapi(userRoute, async (c) => {
  const result = await UserController.handleGetUser(c)
  return c.json(result)
})

export default user