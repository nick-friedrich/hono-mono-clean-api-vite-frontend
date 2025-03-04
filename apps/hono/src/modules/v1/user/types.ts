import { z } from "@hono/zod-openapi";
import { UserRole } from "@packages/prisma";

export const UserResponseSchema = z.object({
  id: z.string().describe('User ID'),
  email: z.string().describe('User email'),
  name: z.string().describe('User name'),
  role: z.nativeEnum(UserRole).describe('User role'),
})

export const UserCurrentResponseSchema = z.object({
  id: z.string().describe('User ID'),
  email: z.string().describe('User email'),
  name: z.string().describe('User name'),
  role: z.nativeEnum(UserRole).describe('User role'),
})

export type RouteUserResponse = z.infer<typeof UserResponseSchema>
export type RouteUserCurrentResponse = z.infer<typeof UserCurrentResponseSchema>
