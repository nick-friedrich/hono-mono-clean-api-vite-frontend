import { UserService } from "../user/user.service";
import { generateRandomPassword, hashPassword, verifyPassword } from "../../../utils/password";
import { generateJWT } from "../../../utils/jwt";
import { db } from "@packages/prisma";

/**
 * Auth service
 * 
 * @author Nick Friedrich
 * 
 */
export class AuthService {

  /**
   * Login
   * @param email - User email
   * @param password - User password
   * @returns Token
   * @throws Error if user not found or password is incorrect
   */
  static async login(email: string, password: string): Promise<string> {
    const user = await UserService.getUserByEmail(email)
    if (!user) {
      throw new Error("Invalid email or password")
    }

    const isPasswordValid = await verifyPassword(password, user.password)
    if (!isPasswordValid) {
      throw new Error("Invalid email or password")
    }

    // Generate JWT token
    const token = await generateJWT({
      sub: user.id,
      email: user.email
    })

    return token
  }

  /**
   * Register a new user
   * @param email - User email
   * @param password - User password
   * @param name - User name (optional)
   * @returns Token
   * @throws Error if user already exists
   */
  static async register(email: string, password: string, name?: string): Promise<string> {
    // Check if user already exists
    const existingUser = await UserService.getUserByEmail(email)
    if (existingUser) {
      throw new Error("User already exists")
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await UserService.createUser({
      email,
      password: hashedPassword,
      name: name || email.split('@')[0],
      createdAt: new Date(),
      updatedAt: new Date(),
      id: crypto.randomUUID()
    })

    // Generate JWT token
    const token = await generateJWT({
      sub: user.id,
      email: user.email
    })

    return token
  }
}