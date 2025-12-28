import { Metadata } from "next";
import Link from "next/link";
import { FileText, AlertTriangle, Scale, UserCheck, Shield, Ban, Gavel, HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const metadata: Metadata = {
  title: "Terms of Service | Kaelyn's Academy",
  description:
    "Read the terms and conditions for using Kaelyn's Academy K-12 educational platform.",
};

export default function TermsOfServicePage() {
  const lastUpdated = "December 26, 2025";
  const effectiveDate = "December 26, 2025";

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FileText className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Terms of Service
          </h1>
          <p className="text-muted-foreground">
            Last Updated: {lastUpdated} | Effective Date: {effectiveDate}
          </p>
        </div>

        {/* Important Notice */}
        <Alert className="mb-12 border-warning/30 bg-warning/10">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <AlertDescription className="text-warning-foreground">
            <strong>Important:</strong> If you are under 18 years of age, please
            review these Terms with a parent or guardian. Children under 13 must
            have verifiable parental consent to use Kaelyn&apos;s Academy.
          </AlertDescription>
        </Alert>

        {/* Key Points Summary */}
        <Card className="mb-12 border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Key Points
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <UserCheck className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Age Requirements</p>
                  <p className="text-sm text-muted-foreground">
                    Adults 18+, or minors with parental consent
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Educational Use</p>
                  <p className="text-sm text-muted-foreground">
                    Platform is for educational purposes only
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Ban className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Prohibited Conduct</p>
                  <p className="text-sm text-muted-foreground">
                    No cheating, harassment, or misuse
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Gavel className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Dispute Resolution</p>
                  <p className="text-sm text-muted-foreground">
                    Governed by California law
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Full Terms */}
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-muted-foreground mb-4">
              Welcome to Kaelyn&apos;s Academy. By accessing or using our K-12
              educational platform (&quot;Service&quot;), you agree to be bound
              by these Terms of Service (&quot;Terms&quot;). If you do not agree
              to these Terms, you may not use the Service.
            </p>
            <p className="text-muted-foreground mb-4">
              These Terms constitute a legally binding agreement between you and
              Kaelyn&apos;s Academy (&quot;we,&quot; &quot;us,&quot; or
              &quot;our&quot;). If you are using the Service on behalf of an
              organization (such as a school or school district), you represent
              that you have authority to bind that organization to these Terms.
            </p>
          </section>

          <Separator className="my-8" />

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              2. Eligibility and Account Registration
            </h2>

            <h3 className="text-xl font-semibold text-foreground mb-3">
              2.1 Age Requirements
            </h3>
            <p className="text-muted-foreground mb-4">
              The Service is designed for K-12 education and may be used by:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li>
                <strong>Adults (18+):</strong> Parents, guardians, teachers, and
                administrators may create accounts directly
              </li>
              <li>
                <strong>Children under 13:</strong> May only use the Service
                with verifiable parental consent, as required by COPPA
              </li>
              <li>
                <strong>Teens 13-17:</strong> May use the Service with parental
                awareness and consent as required by their school or household
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3">
              2.2 Account Responsibilities
            </h3>
            <p className="text-muted-foreground mb-4">
              You are responsible for:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Providing accurate and complete registration information</li>
              <li>Updating your information to keep it current</li>
              <li>Notifying us immediately of any unauthorized use</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3">
              2.3 Parent/Guardian Responsibilities
            </h3>
            <p className="text-muted-foreground mb-4">
              Parents and guardians who create learner accounts for children are
              responsible for:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li>Supervising their child&apos;s use of the Service</li>
              <li>Ensuring the child understands appropriate use</li>
              <li>Managing parental controls and settings</li>
              <li>Reviewing their child&apos;s progress and communications</li>
            </ul>
          </section>

          <Separator className="my-8" />

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              3. Use of the Service
            </h2>

            <h3 className="text-xl font-semibold text-foreground mb-3">
              3.1 Permitted Use
            </h3>
            <p className="text-muted-foreground mb-4">
              You may use the Service for:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li>Personal educational purposes (learning, practicing, studying)</li>
              <li>Classroom instruction and educational administration (for schools)</li>
              <li>Monitoring and supporting children&apos;s educational progress (for parents)</li>
              <li>Creating and managing educational content (for teachers)</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3">
              3.2 Prohibited Conduct
            </h3>
            <p className="text-muted-foreground mb-4">
              You agree NOT to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li>
                <strong>Cheating:</strong> Use external tools, AI assistance, or
                other methods to artificially complete assessments or
                misrepresent progress
              </li>
              <li>
                <strong>Sharing Accounts:</strong> Allow others to use your
                account or use another person&apos;s account
              </li>
              <li>
                <strong>Harassment:</strong> Engage in bullying, harassment, or
                inappropriate communications with other users
              </li>
              <li>
                <strong>Unauthorized Access:</strong> Attempt to access areas of
                the Service you are not authorized to use
              </li>
              <li>
                <strong>Reverse Engineering:</strong> Decompile, reverse
                engineer, or attempt to extract source code from the Service
              </li>
              <li>
                <strong>Automated Access:</strong> Use bots, scrapers, or
                automated tools to access the Service
              </li>
              <li>
                <strong>Circumvention:</strong> Bypass or circumvent security
                features, parental controls, or access restrictions
              </li>
              <li>
                <strong>Impersonation:</strong> Misrepresent your identity or
                affiliation with any person or organization
              </li>
              <li>
                <strong>Commercial Use:</strong> Use the Service for commercial
                purposes not authorized by us
              </li>
              <li>
                <strong>Illegal Activity:</strong> Use the Service for any
                unlawful purpose or in violation of any applicable laws
              </li>
            </ul>
          </section>

          <Separator className="my-8" />

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              4. Content and Intellectual Property
            </h2>

            <h3 className="text-xl font-semibold text-foreground mb-3">
              4.1 Our Content
            </h3>
            <p className="text-muted-foreground mb-4">
              All content provided through the Service, including but not
              limited to educational materials, lessons, assessments, 3D
              visualizations, graphics, logos, and software, is owned by
              Kaelyn&apos;s Academy or our licensors and is protected by
              copyright, trademark, and other intellectual property laws.
            </p>
            <p className="text-muted-foreground mb-4">
              We grant you a limited, non-exclusive, non-transferable license to
              access and use our content solely for personal, non-commercial
              educational purposes.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">
              4.2 User Content
            </h3>
            <p className="text-muted-foreground mb-4">
              You may submit content to the Service, such as:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li>Questions to AI tutors</li>
              <li>Answers to assessments</li>
              <li>Teacher-created assignments (for educators)</li>
              <li>Profile information and preferences</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              You retain ownership of your content. By submitting content, you
              grant us a non-exclusive license to use, store, and process that
              content solely to provide and improve the Service. We will not use
              children&apos;s content for marketing purposes.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">
              4.3 Feedback
            </h3>
            <p className="text-muted-foreground mb-4">
              If you provide feedback, suggestions, or ideas about the Service,
              you grant us the right to use such feedback without restriction or
              compensation.
            </p>
          </section>

          <Separator className="my-8" />

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              5. AI Tutoring Features
            </h2>
            <p className="text-muted-foreground mb-4">
              Our Service includes AI-powered tutoring features. By using these
              features, you acknowledge and agree that:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li>
                <strong>Educational Tool:</strong> AI tutors are educational
                aids, not substitutes for professional instruction or advice
              </li>
              <li>
                <strong>Accuracy:</strong> While we strive for accuracy, AI
                responses may occasionally contain errors. Users should verify
                important information
              </li>
              <li>
                <strong>Content Moderation:</strong> AI responses are filtered
                for age-appropriateness, but we cannot guarantee perfect
                filtering
              </li>
              <li>
                <strong>Limitations:</strong> AI tutors cannot provide medical,
                legal, psychological, or other professional advice
              </li>
              <li>
                <strong>Data Processing:</strong> Conversations with AI tutors
                are processed by third-party AI providers as described in our{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </section>

          <Separator className="my-8" />

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              6. Subscription and Payments
            </h2>

            <h3 className="text-xl font-semibold text-foreground mb-3">
              6.1 Free and Paid Services
            </h3>
            <p className="text-muted-foreground mb-4">
              Kaelyn&apos;s Academy offers:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li>
                <strong>Free Access for Families:</strong> Individual families
                may use core educational features at no cost
              </li>
              <li>
                <strong>School Subscriptions:</strong> Schools and districts may
                subscribe for additional features, administrative tools, and
                priority support
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3">
              6.2 Payment Terms
            </h3>
            <p className="text-muted-foreground mb-4">
              For paid subscriptions:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li>Fees are billed in advance on a subscription basis</li>
              <li>Subscriptions automatically renew unless canceled</li>
              <li>Prices may change with 30 days&apos; notice</li>
              <li>Refunds are provided in accordance with applicable law</li>
            </ul>
          </section>

          <Separator className="my-8" />

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              7. Termination
            </h2>

            <h3 className="text-xl font-semibold text-foreground mb-3">
              7.1 Your Right to Terminate
            </h3>
            <p className="text-muted-foreground mb-4">
              You may stop using the Service and delete your account at any time
              through your account settings or by contacting us.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">
              7.2 Our Right to Terminate
            </h3>
            <p className="text-muted-foreground mb-4">
              We may suspend or terminate your access to the Service if:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li>You violate these Terms</li>
              <li>We are required to do so by law</li>
              <li>
                Your conduct may harm other users, us, or third parties
              </li>
              <li>Your account has been inactive for an extended period</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              We will provide reasonable notice before termination when possible
              and will not terminate accounts in retaliation for exercising
              legal rights.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">
              7.3 Effect of Termination
            </h3>
            <p className="text-muted-foreground mb-4">
              Upon termination, your right to use the Service will cease
              immediately. We will retain and delete your data in accordance
              with our{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </section>

          <Separator className="my-8" />

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              8. Disclaimers
            </h2>
            <p className="text-muted-foreground mb-4">
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS
              AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR
              IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL
              WARRANTIES, INCLUDING:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li>
                Warranties of merchantability, fitness for a particular purpose,
                and non-infringement
              </li>
              <li>
                Warranties regarding the accuracy, reliability, or completeness
                of educational content
              </li>
              <li>
                Warranties that the Service will be uninterrupted,
                error-free, or secure
              </li>
            </ul>
            <p className="text-muted-foreground mb-4">
              Educational content is provided for informational purposes and
              does not constitute professional academic advice. Users should
              consult appropriate professionals for specific educational needs.
            </p>
          </section>

          <Separator className="my-8" />

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              9. Limitation of Liability
            </h2>
            <p className="text-muted-foreground mb-4">
              TO THE FULLEST EXTENT PERMITTED BY LAW:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li>
                We shall not be liable for any indirect, incidental, special,
                consequential, or punitive damages
              </li>
              <li>
                Our total liability shall not exceed the amounts paid by you to
                us in the 12 months preceding the claim, or $100, whichever is
                greater
              </li>
              <li>
                These limitations apply regardless of the theory of liability
              </li>
            </ul>
            <p className="text-muted-foreground mb-4">
              Some jurisdictions do not allow certain limitations of liability.
              In such cases, our liability will be limited to the greatest
              extent permitted by law.
            </p>
          </section>

          <Separator className="my-8" />

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              10. Indemnification
            </h2>
            <p className="text-muted-foreground mb-4">
              You agree to indemnify and hold harmless Kaelyn&apos;s Academy,
              its officers, directors, employees, and agents from any claims,
              damages, losses, or expenses (including reasonable attorney&apos;s
              fees) arising from:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li>Your violation of these Terms</li>
              <li>Your use of the Service</li>
              <li>Your violation of any third-party rights</li>
              <li>Content you submit to the Service</li>
            </ul>
          </section>

          <Separator className="my-8" />

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              11. Dispute Resolution
            </h2>

            <h3 className="text-xl font-semibold text-foreground mb-3">
              11.1 Governing Law
            </h3>
            <p className="text-muted-foreground mb-4">
              These Terms shall be governed by the laws of the State of
              California, without regard to conflict of law principles.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">
              11.2 Informal Resolution
            </h3>
            <p className="text-muted-foreground mb-4">
              Before filing any legal claim, you agree to contact us at{" "}
              <a
                href="mailto:legal@kaelyns.academy"
                className="text-primary hover:underline"
              >
                legal@kaelyns.academy
              </a>{" "}
              and attempt to resolve the dispute informally for at least 30
              days.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">
              11.3 Jurisdiction
            </h3>
            <p className="text-muted-foreground mb-4">
              Any legal action arising from these Terms shall be brought in the
              state or federal courts located in San Francisco County,
              California.
            </p>
          </section>

          <Separator className="my-8" />

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              12. Changes to Terms
            </h2>
            <p className="text-muted-foreground mb-4">
              We may modify these Terms at any time. When we make changes:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li>
                We will post the updated Terms with a new &quot;Last
                Updated&quot; date
              </li>
              <li>
                Material changes will be communicated via email or prominent
                notice on the Service
              </li>
              <li>
                Continued use of the Service after changes constitutes
                acceptance of the new Terms
              </li>
            </ul>
          </section>

          <Separator className="my-8" />

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              13. General Provisions
            </h2>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li>
                <strong>Entire Agreement:</strong> These Terms, together with
                our Privacy Policy and COPPA Compliance notice, constitute the
                entire agreement between you and us
              </li>
              <li>
                <strong>Severability:</strong> If any provision is found
                unenforceable, the remaining provisions will continue in effect
              </li>
              <li>
                <strong>Waiver:</strong> Our failure to enforce any right or
                provision does not constitute a waiver
              </li>
              <li>
                <strong>Assignment:</strong> You may not assign these Terms. We
                may assign our rights and obligations without restriction
              </li>
              <li>
                <strong>Notices:</strong> We may provide notices via email, the
                Service, or other reasonable means
              </li>
            </ul>
          </section>

          <Separator className="my-8" />

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              14. Contact Us
            </h2>
            <p className="text-muted-foreground mb-4">
              If you have questions about these Terms, please contact us:
            </p>
            <Card className="bg-muted/50">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Scale className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Legal Inquiries</p>
                      <a
                        href="mailto:legal@kaelyns.academy"
                        className="text-primary hover:underline"
                      >
                        legal@kaelyns.academy
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">
                        General Support
                      </p>
                      <a
                        href="mailto:support@kaelyns.academy"
                        className="text-primary hover:underline"
                      >
                        support@kaelyns.academy
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Related Links */}
        <div className="mt-12 pt-8 border-t">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Related Policies
          </h3>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/privacy"
              className="text-primary hover:underline text-sm"
            >
              Privacy Policy
            </Link>
            <Link
              href="/coppa"
              className="text-primary hover:underline text-sm"
            >
              COPPA Compliance
            </Link>
            <Link
              href="/contact"
              className="text-primary hover:underline text-sm"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
