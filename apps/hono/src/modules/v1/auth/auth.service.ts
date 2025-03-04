import { UserService } from "../user/user.service";
import { generateRandomPassword, hashPassword, verifyPassword } from "../../../utils/password";
import { generateJWT } from "../../../utils/jwt";
import { db, User } from "@packages/prisma";

/**
 * Auth service
 * 
 * @author Nick Friedrich
 * 
 */
export class AuthService {

  /**
   * Email verification needed
   */
  static EMAIL_VERIFICATION_NEEDED = process.env.EMAIL_VERIFICATION_NEEDED ? process.env.EMAIL_VERIFICATION_NEEDED === "true" : false;

  /**
   * Login
   * @param email - User email
   * @param password - User password
   * @returns Token
   * @throws Error if user not found or password is incorrect
   */
  static async loginWithEmailPassword(email: string, password: string): Promise<string> {
    const user = await UserService.getUserByEmail(email)
    if (!user) {
      throw new Error("Invalid email or password")
    }

    if (AuthService.EMAIL_VERIFICATION_NEEDED && !user.emailVerifiedAt) {
      throw new Error("Email not verified")
    }

    if (!user.password) {
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
  static async signUpWithEmailPassword(email: string, password: string, name?: string): Promise<{ token: string | undefined, emailVerificationNeeded: boolean }> {
    // Check if user already exists
    const existingUser = await UserService.getUserByEmail(email)
    if (existingUser) {
      throw new Error("User already exists")
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    let newUser: Partial<User> = {
      email,
      password: hashedPassword,
      name: name || email.split('@')[0],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // If email verification is needed, add email verification token and expiration date
    if (AuthService.EMAIL_VERIFICATION_NEEDED) {
      newUser.emailVerificationToken = crypto.randomUUID()
      newUser.emailVerificationTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24) // 1 day
      newUser.emailVerifiedAt = null
    }

    // Create user
    const user = await UserService.createUser(newUser)


    if (AuthService.EMAIL_VERIFICATION_NEEDED) {
      // TODO: Send verification email
      return {
        token: undefined,
        emailVerificationNeeded: true
      }
    }

    // If email verification is not needed, generate JWT token

    const token = await generateJWT({
      sub: user.id,
      email: user.email
    })

    return {
      token,
      emailVerificationNeeded: false
    }
  }
}