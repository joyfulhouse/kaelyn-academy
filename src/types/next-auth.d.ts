/**
 * NextAuth Type Extensions
 * Extends the default NextAuth types to include custom session properties
 */

import "next-auth";
import type { Role } from "@/lib/auth/rbac";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    role: Role;
    organizationId?: string | null;
  }

  interface Session {
    user: User;
  }
}

declare module "@auth/core/adapters" {
  interface AdapterUser {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    role: Role;
    organizationId?: string | null;
  }
}
