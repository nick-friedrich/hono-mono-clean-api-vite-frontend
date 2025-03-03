import { db, User } from "@packages/prisma"

/**
 * User service
 * 
 * Single responsibility, one function, one purpose
 * 
 * @author Nick Friedrich
 * 
 */
export class UserService {

  /**
   * Get user by id
   * @param id - User id
   * @returns User
   */
  static async getUserById(id: string) {
    const user = await db.user.findUnique({
      where: { id },
    })
    return user
  }

  /**
   * Get user by email
   * @param email - User email
   * @returns User
   */
  static async getUserByEmail(email: string) {
    const user = await db.user.findUnique({
      where: { email },
    })
    return user
  }

  /**
   * Create user
   * @param user - User
   * @returns User
   */
  static async createUser(user: User) {
    const newUser = await db.user.create({
      data: user,
    })
    return newUser
  }
}
