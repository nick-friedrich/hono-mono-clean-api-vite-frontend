import { OpenAPIHono } from '@hono/zod-openapi'
import { createRoute } from '@hono/zod-openapi'
import { UserCurrentResponseSchema, UserResponseSchema } from './types'
import { UserController } from './user.controller'
import { authMiddleware } from '../auth/auth.middleware'

const user = new OpenAPIHono()

const userRoute = createRoute({
  method: 'get',
  path: '/id/{id}',
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

const currentUserRoute = createRoute({
  method: 'get',
  path: '/current',
  responses: {
    401: {
      description: 'Unauthorized'
    },
    200: {
      content: {
        'application/json': {
          schema: UserCurrentResponseSchema
        }
      },
      description: 'Current user information'
    }
  },
  // This is a protected route, so we need to use the authMiddleware
  middleware: [authMiddleware] as const,
  tags: ['User'],
  summary: 'Get current user information',
  description: 'Get current user information'
})

user.openapi(userRoute, async (c) => {
  const result = await UserController.handleGetUser(c)
  return c.json(result)
})

// Middleware is applied to the currentUserRoute
user.openapi(
  currentUserRoute,
  async (c) => {
    const result = await UserController.handleGetCurrentUser(c)
    return c.json(result)
  }
)

export default user