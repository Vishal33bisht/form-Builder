import { db } from "@repo/database";
import { usersTable, type InsertUser, type SelectUser } from "@repo/database/schema";
import { eq } from "@repo/database";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { env } from "../env";
import { createGoogleOAuth2Client } from "../clients/google-oauth";

const SALT_ROUNDS = 10;

interface JWTPayload {
  id: string;
  email: string;
  role: string;
}

interface RegisterInput {
  email: string;
  fullName: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };
}

class AuthService {
  public async register(input: RegisterInput): Promise<AuthResponse> {
    const { email, fullName, password } = input;

    // Check if user already exists
    const existingUser = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, email),
    });

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const [newUser] = await db
      .insert(usersTable)
      .values({
        email,
        fullName,
        passwordHash,
        role: "creator",
        emailVerified: false,
      })
      .returning();

    if (!newUser) {
      throw new Error("Failed to create user");
    }

    // Generate JWT
    const token = this.generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role!,
    });

    return {
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role!,
      },
    };
  }

  public async login(input: LoginInput): Promise<AuthResponse> {
    const { email, password } = input;

    // Find user
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, email),
    });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    if (!user.passwordHash) {
      throw new Error("Password authentication not enabled for this account");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Generate JWT
    const token = this.generateToken({
      id: user.id,
      email: user.email,
      role: user.role!,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role!,
      },
    };
  }

  public async loginWithGoogle(code: string): Promise<AuthResponse> {
    const googleOAuth2Client = createGoogleOAuth2Client();
    const { tokens } = await googleOAuth2Client.getToken(code);

    if (!tokens.id_token) {
      throw new Error("Google did not return an identity token");
    }

    const ticket = await googleOAuth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: env.GOOGLE_OAUTH_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload?.email;

    if (!email) {
      throw new Error("Google account email is unavailable");
    }

    const fullName = payload.name || email.split("@")[0] || "Google User";
    const existingUser = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, email),
    });

    const user =
      existingUser ||
      (
        await db
          .insert(usersTable)
          .values({
            email,
            fullName,
            emailVerified: payload.email_verified ?? true,
            profileImageUrl: payload.picture,
            role: "creator",
          })
          .returning()
      )[0];

    if (!user) {
      throw new Error("Failed to authenticate with Google");
    }

    if (existingUser) {
      await db
        .update(usersTable)
        .set({
          fullName: existingUser.fullName || fullName,
          emailVerified: existingUser.emailVerified || payload.email_verified,
          profileImageUrl: payload.picture || existingUser.profileImageUrl,
        })
        .where(eq(usersTable.id, existingUser.id));
    }

    const token = this.generateToken({
      id: user.id,
      email: user.email,
      role: user.role!,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role!,
      },
    };
  }

  public verifyToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
      return decoded;
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  public async getUserById(userId: string): Promise<SelectUser | undefined> {
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, userId),
    });

    return user;
  }

  private generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: "7d",
    });
  }
}

export default AuthService;
