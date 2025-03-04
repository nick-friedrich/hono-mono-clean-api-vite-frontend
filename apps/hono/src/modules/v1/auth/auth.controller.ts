import { Context } from "hono";
import { LoginRequestSchema, RegisterRequestSchema, RouteLoginResponse, RouteRegisterResponse, RouteVerifyEmailResponse, VerifyEmailRequestSchema } from "./types";
import { AuthService } from "./auth.service";
import { ZodError } from "zod";

/**
 * Auth controller
 * 
 * @author Nick Friedrich
 * 
 */
export class AuthController {

  /**
   * Handle login
   * @param c - Context
   * @returns Login response
   */
  static async handleLogin(c: Context): Promise<RouteLoginResponse> {
    try {
      // Parse request body with zod
      const body = await c.req.json()
      const { email, password } = LoginRequestSchema.parse(body)

      // Authenticate user
      const token = await AuthService.loginWithEmailPassword(email, password)

      return { token }
    } catch (error) {
      if (error instanceof ZodError) {
        return { error: error.issues.map(issue => issue.path + ": " + issue.message).join(", ") }
      }
      return { error: error instanceof Error ? error.message : "Authentication failed" }
    }
  }

  /**
   * Handle register
   * @param c - Context
   * @returns Login response with token
   */
  static async handleRegister(c: Context): Promise<RouteRegisterResponse> {
    try {
      // Parse request body
      const body = await c.req.json()
      const { email, password, name } = RegisterRequestSchema.parse(body)

      // Register user
      const { token, emailVerificationNeeded } = await AuthService.signUpWithEmailPassword(email, password, name)

      return {
        token: token,
        emailVerificationNeeded
      }
    } catch (error) {
      if (error instanceof ZodError) {
        return { error: error.issues.map(issue => issue.path + ": " + issue.message).join(", ") }
      }
      return { error: error instanceof Error ? error.message : "Registration failed" }
    }
  }


  /**
   * Handle verify email
   * @param c - Context
   * @returns Verify email response
   */
  static async handleVerifyEmail(c: Context): Promise<RouteVerifyEmailResponse> {
    try {
      // Parse request body
      const token = c.req.query('token')
      if (!token) {
        return { success: false, error: "Token is required" }
      }

      // Verify email
      const success = await AuthService.verifyEmail(token)

      return { success }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Verification failed" }
    }
  }
}