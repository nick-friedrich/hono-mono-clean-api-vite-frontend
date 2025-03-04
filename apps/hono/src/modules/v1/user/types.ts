import { z } from "@hono/zod-openapi";

export const UserResponseSchema = z.object({
  id: z.string().describe('User ID'),
  email: z.string().describe('User email'),
  name: z.string().describe('User name'),
})

export const UserCurrentResponseSchema = z.object({
  id: z.string().describe('User ID'),
  email: z.string().describe('User email'),
  name: z.string().describe('User name'),
})

export type RouteUserResponse = z.infer<typeof UserResponseSchema>
export type RouteUserCurrentResponse = z.infer<typeof UserCurrentResponseSchema>
