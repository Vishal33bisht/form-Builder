import { z, zodUndefinedModel } from "../../schema";
import { userService } from "../../services";
import { getAuthenticationMethodOutputSchema } from "@repo/services/user/model";
import { publicProcedure,protectedProcedure,router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { AuthService } from "@repo/services";

const TAGS = ["Authentication"];
const getPath = generatePath("/authentication");
const authService = new AuthService();

export const authRouter = router({
  getAuthenticationMethods: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/auth/methods",
        tags: TAGS,
        summary: "Get supported authentication methods",
      },
    })
    .input(zodUndefinedModel)
    .output(z.array(getAuthenticationMethodOutputSchema))
    .query(async () => {
      return userService.getAuthenticationMethods();
    }),

  register: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/auth/register",
        tags: ["Authentication"],
        summary: "Register a new user",
      },
    })
    .input(
      z.object({
        email: z.string().email(),
        fullName: z.string().min(2).max(80),
        password: z.string().min(8),
      })
    )
    .output(
      z.object({
        token: z.string(),
        user: z.object({
          id: z.string(),
          email: z.string(),
          fullName: z.string(),
          role: z.string(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      const result = await authService.register(input);
      return result;
    }),

  login: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/auth/login",
        tags: ["Authentication"],
        summary: "Login with email and password",
      },
    })
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .output(
      z.object({
        token: z.string(),
        user: z.object({
          id: z.string(),
          email: z.string(),
          fullName: z.string(),
          role: z.string(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      const result = await authService.login(input);
      return result;
    }),

  googleCallback: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/auth/google/callback",
        tags: TAGS,
        summary: "Exchange a Google OAuth code for an application token",
      },
    })
    .input(
      z.object({
        code: z.string().min(1),
      })
    )
    .output(
      z.object({
        token: z.string(),
        user: z.object({
          id: z.string(),
          email: z.string(),
          fullName: z.string(),
          role: z.string(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      return authService.loginWithGoogle(input.code);
    }),

  me: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/auth/me",
        tags: ["Authentication"],
        summary: "Get current user",
        protect: true,
      },
    })
    .input(zodUndefinedModel)
    .output(
      z.object({
        id: z.string(),
        email: z.string(),
        fullName: z.string(),
        role: z.string(),
        emailVerified: z.boolean(),
        profileImageUrl: z.string().nullable(),
        createdAt: z.date().nullable(),
      })
    )
    .query(async ({ ctx }) => {
      const user = await authService.getUserById(ctx.user.id);
      
      if (!user) {
        throw new Error("User not found");
      }

      return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role || "creator",
        emailVerified: user.emailVerified || false,
        profileImageUrl: user.profileImageUrl,
        createdAt: user.createdAt,
      };
    }),
});
