import { db } from "@repo/database";
import { usersTable, type InsertUser, type SelectUser } from "@repo/database/schema";
import { eq } from "@repo/database";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { env } from "../env";

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