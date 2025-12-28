"use client";

import { getCsrfToken } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, useRef } from "react";
import { AlertCircle, Loader2, BookOpen, Users, School, Shield } from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Provider {
  id: string;
  name: string;
  isDev?: boolean;
}

// Dev role configurations
const DEV_ROLES = [
  {
    role: "learner",
    label: "Learner",
    description: "Student dashboard & lessons",
    icon: BookOpen,
    color: "bg-role-learner hover:bg-role-learner/90",
  },
  {
    role: "parent",
    label: "Parent",
    description: "Monitor child's progress",
    icon: Users,
    color: "bg-role-parent hover:bg-role-parent/90",
  },
  {
    role: "teacher",
    label: "Teacher",
    description: "Classroom management",
    icon: School,
    color: "bg-role-teacher hover:bg-role-teacher/90",
  },
  {
    role: "admin",
    label: "Admin",
    description: "Full system access",
    icon: Shield,
    color: "bg-role-admin hover:bg-role-admin/90",
  },
] as const;

const providerConfig: Record<string, {
  icon: React.ReactNode;
  bgColor: string;
}> = {
  google: {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="currentColor"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="currentColor"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="currentColor"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
    ),
    bgColor: "bg-card hover:bg-muted text-foreground border border-border",
  },
  "microsoft-entra-id": {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#F25022" d="M1 1h10v10H1z" />
        <path fill="#00A4EF" d="M1 13h10v10H1z" />
        <path fill="#7FBA00" d="M13 1h10v10H13z" />
        <path fill="#FFB900" d="M13 13h10v10H13z" />
      </svg>
    ),
    bgColor: "bg-card hover:bg-muted text-foreground border border-border",
  },
  facebook: {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    bgColor: "bg-[#1877F2] hover:bg-[#166FE5] text-white",
  },
  apple: {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
      </svg>
    ),
    bgColor: "bg-foreground hover:bg-foreground/90 text-background",
  },
};

function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/auth/redirect";
  const error = searchParams.get("error");
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState<string>("");
  const formRef = useRef<HTMLFormElement>(null);
  const roleInputRef = useRef<HTMLInputElement>(null);

  const isDev = providers.some(p => p.isDev);

  useEffect(() => {
    async function init() {
      try {
        const [providersRes, token] = await Promise.all([
          fetch("/api/auth/providers"),
          getCsrfToken(),
        ]);

        if (providersRes.ok) {
          const data = await providersRes.json();
          setProviders(data.providers);
        }

        if (token) {
          setCsrfToken(token);
        }
      } catch (err) {
        console.error("Failed to initialize login:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const handleSignIn = (providerId: string) => {
    if (formRef.current) {
      formRef.current.action = `/api/auth/signin/${providerId}`;
      formRef.current.submit();
    }
  };

  const handleDevSignIn = (role: string) => {
    // Set cookie with the role before OAuth flow
    document.cookie = `dev-oauth-role=${role}; path=/; max-age=300; samesite=lax`;
    handleSignIn("dev-oauth");
  };

  // Filter out dev-oauth from regular providers (we'll show it separately)
  const regularProviders = providers.filter(p => !p.isDev);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Hidden form for OAuth submission */}
      <form ref={formRef} method="POST" className="hidden">
        <input type="hidden" name="csrfToken" value={csrfToken} />
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <input ref={roleInputRef} type="hidden" name="role" value="" />
      </form>

      <Card className="w-full max-w-md border shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto mb-4">
            <Image
              src="/icons/icon.svg"
              alt="Kaelyn's Academy"
              width={64}
              height={64}
              className="rounded-2xl"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Welcome to Kaelyn&apos;s Academy
          </CardTitle>
          <CardDescription>
            Sign in to continue your learning journey
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                {error === "OAuthSignin" && "Error starting sign in. Please try again."}
                {error === "OAuthCallback" && "Error during sign in. Please try again."}
                {error === "OAuthAccountNotLinked" && "This email is already associated with another account."}
                {error === "Configuration" && "There is a problem with the server configuration."}
                {error === "AccessDenied" && "You do not have permission to sign in."}
                {error === "Verification" && "The verification link has expired or has already been used."}
                {!["OAuthSignin", "OAuthCallback", "OAuthAccountNotLinked", "Configuration", "AccessDenied", "Verification"].includes(error) &&
                  "An error occurred during sign in."}
              </span>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : providers.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No authentication providers are configured.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Please contact an administrator.
              </p>
            </div>
          ) : (
            <>
              {/* Dev Login Section */}
              {isDev && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Development Login</span>
                    <Badge variant="outline" className="text-amber-600 border-amber-300 text-xs">
                      DEV ONLY
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {DEV_ROLES.map(({ role, label, description, icon: Icon, color }) => (
                      <Button
                        key={role}
                        variant="outline"
                        className={`h-auto py-3 flex flex-col items-center gap-1 text-white hover:text-white border-0 ${color}`}
                        onClick={() => handleDevSignIn(role)}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{label}</span>
                        <span className="text-xs opacity-80">{description}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Regular OAuth Providers */}
              {regularProviders.length > 0 && (
                <>
                  {isDev && (
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="px-2 bg-card text-muted-foreground">
                          Or continue with
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="space-y-3">
                    {regularProviders.map((provider) => {
                      const config = providerConfig[provider.id];
                      if (!config) return null;

                      return (
                        <Button
                          key={provider.id}
                          variant="outline"
                          className={`w-full h-12 text-base font-medium gap-3 ${config.bgColor}`}
                          onClick={() => handleSignIn(provider.id)}
                        >
                          {config.icon}
                          Continue with {provider.name}
                        </Button>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">
                For students, parents, and teachers
              </span>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            By signing in, you agree to our{" "}
            <a href="/terms" className="text-primary hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </a>
            .
          </p>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Need help?{" "}
            <a href="/support" className="text-primary hover:underline">
              Contact Support
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
