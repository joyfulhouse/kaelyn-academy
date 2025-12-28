import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-destructive/5 to-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">🚫</div>
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Access Denied
        </h1>
        <p className="text-muted-foreground mb-8">
          You don&apos;t have permission to access this page. If you believe this is an error, please contact your administrator.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button variant="outline">
              Go Home
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button>
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
