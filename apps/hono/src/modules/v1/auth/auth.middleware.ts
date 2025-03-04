import { Context, Next } from 'hono';
import { UserService } from '../user/user.service';
import { verifyJWT } from '../../../utils/jwt';
import { UserRole } from '@packages/prisma';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
}

declare module 'hono' {
  interface ContextVariableMap {
    user: AuthUser;
  }
}

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ message: 'Unauthorized: Missing or invalid token' }, 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = await verifyJWT(token);

    const user = await UserService.getUserById(decoded.sub);

    if (!user) {
      return c.json({ message: 'Unauthorized: User not found' }, 401);
    }

    // Attach user to context
    c.set('user', user);

    await next();
  } catch (error) {
    return c.json({ message: 'Unauthorized: Invalid token' }, 401);
  }
};

