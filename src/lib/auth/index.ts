import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import Apple from "next-auth/providers/apple";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { accounts, sessions, users, verificationTokens } from "@/lib/db/schema";
import type { Role } from "./rbac";

const isDev = process.env.NODE_ENV === "development";

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

// Development-only OAuth provider (local mock)
if (isDev) {
  const port = process.env.PORT || "3000";
  const baseUrl = process.env.NEXTAUTH_URL || `http://localhost:${port}`;
  providers.push({
    id: "dev-oauth",
    name: "Development",
    type: "oauth",
    authorization: {
      url: `${baseUrl}/api/dev-oauth/authorize`,
      params: { scope: "openid profile email" },
    },
    token: {
      url: `${baseUrl}/api/dev-oauth/token`,
    },
    userinfo: {
      url: `${baseUrl}/api/dev-oauth/userinfo`,
    },
    clientId: "dev-oauth-client",
    clientSecret: "dev-oauth-secret",
    checks: ["state"], // Only use state check, not PKCE (our mock doesn't support PKCE)
    profile(profile) {
      return {
        id: profile.sub,
        email: profile.email,
        name: profile.name,
        image: profile.picture,
        role: (profile.role || "learner") as Role,
      };
    },
  });
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
    async session({ session, user }) {
      // Add user ID and role to session
      if (session.user && user) {
        session.user.id = user.id;
        session.user.role = user.role;
        session.user.organizationId = user.organizationId;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // For dev-oauth provider, update user's role from the profile
      if (isDev && account?.provider === "dev-oauth" && profile?.role && user?.id) {
        const role = profile.role as Role;
        await db
          .update(users)
          .set({ role, updatedAt: new Date() })
          .where(eq(users.id, user.id));
      }
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
    strategy: "database",
  },
  debug: process.env.NODE_ENV === "development",
});

// Helper to get available providers for UI
export function getAvailableProviders() {
  const available: { id: string; name: string; isDev?: boolean }[] = [];

  // Development-only provider (shown first for convenience)
  if (isDev) {
    available.push({ id: "dev-oauth", name: "Development", isDev: true });
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
