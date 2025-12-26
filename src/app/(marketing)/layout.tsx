import Link from "next/link";
import Image from "next/image";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <nav
        aria-label="Main navigation"
        className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/icons/icon.svg"
                alt="Kaelyn's Academy"
                width={36}
                height={36}
                className="rounded-lg"
              />
              <span className="text-xl font-bold text-foreground">
                Kaelyn&apos;s Academy
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/about"
                className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
              >
                About
              </Link>
              <Link
                href="/schools"
                className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
              >
                For Schools
              </Link>
              <Link
                href="/pricing"
                className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/blog"
                className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
              >
                Blog
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log In
                </Button>
              </Link>
              <Link href="/login">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer
        role="contentinfo"
        aria-label="Site footer"
        className="py-12 px-4 sm:px-6 lg:px-8 border-t bg-muted/30"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <Image
                  src="/icons/icon.svg"
                  alt="Kaelyn's Academy"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <span className="font-bold text-foreground">
                  Kaelyn&apos;s Academy
                </span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Making K-12 education personal, engaging, and effective for
                every student.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/#features"
                    className="hover:text-foreground transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#subjects"
                    className="hover:text-foreground transition-colors"
                  >
                    Subjects
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="hover:text-foreground transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/schools"
                    className="hover:text-foreground transition-colors"
                  >
                    For Schools
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-foreground transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-foreground transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="hover:text-foreground transition-colors"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-foreground transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-foreground transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-foreground transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/coppa"
                    className="hover:text-foreground transition-colors"
                  >
                    COPPA Compliance
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <Separator className="my-8" />
          <div className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Kaelyn&apos;s Academy. All rights
            reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
