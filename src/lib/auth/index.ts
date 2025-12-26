import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import Apple from "next-auth/providers/apple";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import { db } from "@/lib/db";
import { accounts, sessions, users, verificationTokens } from "@/lib/db/schema";

// Build providers array based on configured environment variables
const providers = [];

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
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role;
        session.user.organizationId = user.organizationId;
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
    strategy: "database",
  },
  debug: process.env.NODE_ENV === "development",
});

// Helper to get available providers for UI
export function getAvailableProviders() {
  const available = [];

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
