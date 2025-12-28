import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ConsentSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-success/5 to-background flex items-center justify-center px-4">
      <Card className="max-w-md border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">
            Consent Submitted Successfully!
          </h1>
          <p className="text-muted-foreground mb-6">
            Thank you for providing parental consent. Your child&apos;s account is now active and ready to use.
          </p>
          <div className="bg-success/10 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-medium text-success mb-2">What&apos;s Next?</h3>
            <ul className="text-sm text-success/90 space-y-1">
              <li>• Your child can now log in and start learning</li>
              <li>• You&apos;ll receive progress reports via email</li>
              <li>• Access parent dashboard to monitor progress</li>
            </ul>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/parent">
              <Button className="w-full bg-success hover:bg-success/90">
                Go to Parent Dashboard
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">
                Return Home
              </Button>
            </Link>
          </div>
          <p className="text-xs text-muted-foreground mt-6">
            A confirmation email has been sent to your registered email address.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
