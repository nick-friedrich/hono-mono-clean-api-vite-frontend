import { UserService } from "./user.service"
import { Context } from "hono"
import { RouteUserResponse } from "./types"

/**
 * User controller
 * Handles all user related http requests
 * @author Nick Friedrich
 */
export class UserController {

  /**
   * Get user by id
   * @param c - Context
   * @returns User
   */
  static async handleGetUser(c: Context): Promise<RouteUserResponse> {
    const user = await UserService.getUserById(c.req.param('id'))
    if (!user) throw new Error('User not found')

    return {
      id: user.id,
      email: user.email,
      name: user.name || user.email.split('@')[0] // Fallback if name not set
    }
  }

}