import { AuthService } from "@repo/services";
const authService = new AuthService();
interface CreateContextOptions {
  req?: {
    headers: {
      authorization?: string;
    };
    ip?: string;
    get?: (header: string) => string | undefined;
  };
}
export async function createContext({ req }: CreateContextOptions) {
  const authHeader = req?.headers?.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : null;

  let user: {
    id: string;
    email: string;
    role: string;
  } | null = null;

  if (token) {
    try {
      const payload = authService.verifyToken(token);
      user = {
        id: payload.id,
        email: payload.email,
        role: payload.role,
      };
    } catch (error) {
      console.warn("Invalid token:", error);
    }
  }
  const ip = req?.ip || req?.get?.("x-forwarded-for") || "unknown";
  const userAgent = req?.get?.("user-agent") || "unknown";

  return {
    user,
    ip,
    userAgent,
  };
}
export type Context = Awaited<ReturnType<typeof createContext>>;
