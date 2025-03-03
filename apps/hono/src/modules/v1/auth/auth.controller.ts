import { Context } from "hono";
import { LoginRequestSchema, RegisterRequestSchema, RouteLoginResponse } from "./types";
import { AuthService } from "./auth.service";
import { ZodError } from "zod";

// Known business errors that don't need full error logging
const EXPECTED_ERROR_MESSAGES = [
  "User already exists",
  "Invalid email or password"
];

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
      const token = await AuthService.login(email, password)

      return { token }
    } catch (error) {
      return AuthController.handleError(error, "Authentication failed")
    }
  }

  /**
   * Handle register
   * @param c - Context
   * @returns Login response with token
   */
  static async handleRegister(c: Context): Promise<RouteLoginResponse> {
    try {
      // Parse request body
      const body = await c.req.json()
      const { email, password, name } = RegisterRequestSchema.parse(body)

      // Register user
      const token = await AuthService.register(email, password, name)

      return { token }
    } catch (error) {
      return AuthController.handleError(error, "Registration failed")
    }
  }

  /**
   * Handle errors consistently across controller methods
   * @param error - The caught error
   * @param defaultMessage - Default message if error is not an instance of Error
   * @returns Error response object
   */
  private static handleError(error: unknown, defaultMessage: string): RouteLoginResponse {
    // Get error message
    const errorMessage = error instanceof Error ? error.message : defaultMessage;

    // Only log unexpected errors or validation errors
    if (error instanceof ZodError) {
      // For validation errors, format them nicely but still log
      console.warn('Validation error:', error.format());
    } else if (error instanceof Error && !EXPECTED_ERROR_MESSAGES.includes(error.message)) {
      // Log unexpected errors with stack trace
      console.error(`Unexpected error: ${errorMessage}`, error.stack);
    }

    // Return consistent error response to client
    return { error: errorMessage };
  }
}