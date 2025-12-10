import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { connectToDatabase } from "./db";
import { User, IUser } from "@/models/User";

const SESSION_COOKIE_NAME = "iap_session";

interface SessionPayload {
  userId: string;
  role: IUser["role"];
}

export async function getCurrentUser(): Promise<IUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is not configured");
  }

  try {
    const decoded = jwt.verify(token, secret) as SessionPayload;
    await connectToDatabase();
    const user = await User.findById(decoded.userId);
    return user;
  } catch {
    return null;
  }
}

export async function createSession(user: IUser) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is not configured");
  }

  const payload: SessionPayload = {
    userId: user._id.toString(),
    role: user.role
  };

  const token = jwt.sign(payload, secret, { expiresIn: "7d" });
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
}


