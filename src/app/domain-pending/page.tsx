/**
 * Domain Pending Verification Page
 *
 * Shown when a custom domain is registered but not yet verified or enabled.
 */

import { headers } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Shield, Mail } from "lucide-react";

export default async function DomainPendingPage() {
  const headersList = await headers();
  const customDomain = headersList.get("x-custom-domain") || "this domain";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
            <Clock className="h-6 w-6 text-amber-600" />
          </div>
          <CardTitle className="text-2xl">Domain Setup in Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground">
            The domain <strong className="text-foreground">{customDomain}</strong> is
            registered with Kaelyn's Academy but is still being configured.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <Shield className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Domain Verification</p>
                <p className="text-xs text-muted-foreground">
                  The organization administrator needs to verify domain ownership
                  through DNS configuration.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <Mail className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Need Help?</p>
                <p className="text-xs text-muted-foreground">
                  Contact your organization administrator or reach out to{" "}
                  <a
                    href="mailto:support@kaelyns.academy"
                    className="text-primary hover:underline"
                  >
                    support@kaelyns.academy
                  </a>{" "}
                  for assistance.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Looking for the main site?{" "}
              <a
                href="https://kaelyns.academy"
                className="text-primary hover:underline"
              >
                Visit Kaelyn's Academy
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
