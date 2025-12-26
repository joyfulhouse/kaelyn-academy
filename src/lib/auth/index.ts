import NextAuth from "next-auth";
import type { User, NextAuthConfig } from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import Apple from "next-auth/providers/apple";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { accounts, sessions, users, verificationTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { Role } from "./rbac";

const isDev = process.env.NODE_ENV === "development";

// Dev user configuration
const DEV_USER = {
  email: "dev@kaelyns.academy",
  name: "Dev User",
  role: "admin" as Role,
};

// Build providers array based on configured environment variables
const providers: NonNullable<NextAuthConfig["providers"]> = [];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })
  );
}

if (process.env.AUTH_FACEBOOK_ID && process.env.AUTH_FACEBOOK_SECRET) {
  providers.push(
    Facebook({
      clientId: process.env.AUTH_FACEBOOK_ID,
      clientSecret: process.env.AUTH_FACEBOOK_SECRET,
    })
  );
}

if (process.env.AUTH_APPLE_ID && process.env.AUTH_APPLE_SECRET) {
  providers.push(
    Apple({
      clientId: process.env.AUTH_APPLE_ID,
      clientSecret: process.env.AUTH_APPLE_SECRET,
    })
  );
}

if (process.env.AUTH_MICROSOFT_ENTRA_ID && process.env.AUTH_MICROSOFT_ENTRA_SECRET) {
  providers.push(
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_SECRET,
    })
  );
}

// Development-only credentials provider
if (isDev) {
  providers.push(
    Credentials({
      id: "dev-credentials",
      name: "Development",
      credentials: {
        // No credentials needed - just click to sign in
      },
      async authorize(): Promise<User | null> {
        // Find or create dev user in database
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.email, DEV_USER.email))
          .limit(1);

        if (existingUser.length > 0) {
          return {
            id: existingUser[0].id,
            email: existingUser[0].email,
            name: existingUser[0].name,
            role: existingUser[0].role as Role,
            organizationId: existingUser[0].organizationId,
          };
        }

        // Create dev user if it doesn't exist
        const newUser = await db
          .insert(users)
          .values({
            email: DEV_USER.email,
            name: DEV_USER.name,
            role: DEV_USER.role,
            emailVerified: new Date(),
          })
          .returning();

        return {
          id: newUser[0].id,
          email: newUser[0].email,
          name: newUser[0].name,
          role: newUser[0].role as Role,
          organizationId: newUser[0].organizationId,
        };
      },
    })
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers,
  pages: {
    signIn: "/login",
    signOut: "/logout",
    error: "/auth/error",
    verifyRequest: "/auth/verify",
    newUser: "/onboarding",
  },
  callbacks: {
    async jwt({ token, user }) {
      // For credentials provider, we need to store user data in JWT
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.organizationId = user.organizationId;
      }
      return token;
    },
    async session({ session, user, token }) {
      // Add user ID and role to session
      if (session.user) {
        // Database sessions have user object, JWT sessions have token
        if (user) {
          session.user.id = user.id;
          session.user.role = user.role;
          session.user.organizationId = user.organizationId;
        } else if (token) {
          session.user.id = token.id as string;
          session.user.role = token.role as Role;
          session.user.organizationId = token.organizationId as string | null;
        }
      }
      return session;
    },
    async signIn() {
      // Allow sign in
      // Additional checks can be added here for COPPA compliance
      return true;
    },
  },
  events: {
    async createUser({ user }) {
      // When a new user is created, we could:
      // 1. Create a default organization for them
      // 2. Send a welcome email
      // 3. Log the event for analytics
      console.log("New user created:", user.email);
    },
  },
  session: {
    // Use JWT in development (for credentials provider), database in production
    strategy: isDev ? "jwt" : "database",
  },
  debug: process.env.NODE_ENV === "development",
});

// Helper to get available providers for UI
export function getAvailableProviders() {
  const available: { id: string; name: string; isDev?: boolean }[] = [];

  // Development-only provider (shown first for convenience)
  if (isDev) {
    available.push({ id: "dev-credentials", name: "Development", isDev: true });
  }

  if (process.env.AUTH_GOOGLE_ID) {
    available.push({ id: "google", name: "Google" });
  }
  if (process.env.AUTH_FACEBOOK_ID) {
    available.push({ id: "facebook", name: "Facebook" });
  }
  if (process.env.AUTH_APPLE_ID) {
    available.push({ id: "apple", name: "Apple" });
  }
  if (process.env.AUTH_MICROSOFT_ENTRA_ID) {
    available.push({ id: "microsoft-entra-id", name: "Microsoft" });
  }

  return available;
}
