import { OpenAPIHono } from '@hono/zod-openapi'
import { createRoute } from '@hono/zod-openapi'
import { LoginResponseSchema, LoginRequestSchema, RegisterRequestSchema, VerifyEmailRequestSchema, VerifyEmailResponseSchema } from './types'
import { AuthController } from './auth.controller'
import { authMiddleware } from './auth.middleware'

const auth = new OpenAPIHono()

const loginRoute = createRoute({
  method: 'post',
  path: '/login',
  request: {
    body: {
      content: {
        'application/json': {
          schema: LoginRequestSchema
        }
      }
    }
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: LoginResponseSchema
        }
      },
      description: 'Login information'
    }
  },
  tags: ['Auth'],
  summary: 'Login',
  description: 'Login to the system'
})

const registerRoute = createRoute({
  method: 'post',
  path: '/register',
  request: {
    body: {
      content: {
        'application/json': {
          schema: RegisterRequestSchema
        }
      }
    }
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: LoginResponseSchema
        }
      },
      description: 'Registration information'
    }
  },
  tags: ['Auth'],
  summary: 'Register',
  description: 'Register a new user'
})


auth.openapi(loginRoute, async (c) => {
  const result = await AuthController.handleLogin(c)
  return c.json(result)
})

auth.openapi(registerRoute, async (c) => {
  const result = await AuthController.handleRegister(c)
  return c.json(result)
})

// Use regular route instead of openapi for verify email
auth.get('/verify-email', async (c) => {
  const result = await AuthController.handleVerifyEmail(c)
  if (result.success) {
    if (process.env.FRONTEND_URL) {
      return c.redirect(`${process.env.FRONTEND_URL}/?verify-email-success=true`)
    }
  }
  return c.json(result)
})

// Add current user route
// WE use this route for testing purposes
// Usually we use the middleware in front of a route
auth.get('/current', authMiddleware, async (c) => {
  // User is already attached to context by authMiddleware
  const user = c.get('user');

  // Return user info without sensitive data
  return c.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  });
});

export default auth