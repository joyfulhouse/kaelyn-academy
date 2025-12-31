import { Metadata } from "next";
import Link from "next/link";
import { Shield, Lock, Eye, Bell, Trash2, UserCheck, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Privacy Policy | Kaelyn's Academy",
  description:
    "Learn how Kaelyn's Academy collects, uses, and protects your personal information. COPPA and FERPA compliant.",
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "December 26, 2025";
  const effectiveDate = "December 26, 2025";

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Shield className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground">
            Last Updated: {lastUpdated} | Effective Date: {effectiveDate}
          </p>
        </div>

        {/* Quick Summary */}
        <Card className="mb-12 border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Privacy at a Glance
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Data Security</p>
                  <p className="text-sm text-muted-foreground">
                    Industry-standard encryption protects all data
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Eye className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">No Advertising</p>
                  <p className="text-sm text-muted-foreground">
                    We never sell data or show targeted ads to children
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <UserCheck className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">COPPA Compliant</p>
                  <p className="text-sm text-muted-foreground">
                    Full compliance with children&apos;s privacy laws
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Trash2 className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">
                    Data Deletion Rights
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Request deletion of your data at any time
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Full Policy */}
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              1. Introduction
            </h2>
            <p className="text-muted-foreground mb-4">
              Kaelyn&apos;s Academy (&quot;we,&quot; &quot;our,&quot; or
              &quot;us&quot;) is committed to protecting the privacy of all
              users, with special emphasis on the privacy of children under 13
              years of age. This Privacy Policy explains how we collect, use,
              disclose, and safeguard information when you use our K-12
              educational platform.
            </p>
            <p className="text-muted-foreground mb-4">
              We comply with the Children&apos;s Online Privacy Protection Act
              (COPPA), the Family Educational Rights and Privacy Act (FERPA),
              and applicable state privacy laws including the California Student
              Online Personal Information Protection Act (SOPIPA) and New
              York&apos;s Education Law 2-d.
            </p>
          </section>

          <Separator className="my-8" />

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              2. Information We Collect
            </h2>

            <h3 className="text-xl font-semibold text-foreground mb-3">
              2.1 Information Provided Directly
            </h3>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li>
                <strong>Account Information:</strong> Name, email address, and
                password for parents, teachers, and administrators
              </li>
              <li>
                <strong>Learner Profiles:</strong> Child&apos;s name, grade
                level, date of birth, and learning preferences (collected with
                verifiable parental consent)
              </li>
              <li>
                <strong>Educational Records:</strong> Progress data, assessment
                scores, and learning activities
              </li>
              <li>
                <strong>Communications:</strong> Messages sent through our
                platform and support inquiries
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3">
              2.2 Automatically Collected Information
            </h3>
            <p className="text-muted-foreground mb-4">
              In accordance with the 2025 COPPA Rule amendments, we disclose
              that we may collect:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li>
                <strong>Device Information:</strong> Device type, operating
                system, and browser type
              </li>
              <li>
                <strong>Usage Data:</strong> Pages visited, features used, and
                time spent on the platform
              </li>
              <li>
                <strong>Technical Identifiers:</strong> IP address and session
                cookies (for authentication and security purposes only)
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3">
              2.3 Information We Do NOT Collect from Children
            </h3>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li>Biometric identifiers (fingerprints, facial recognition)</li>
              <li>Precise geolocation data</li>
              <li>Social media account information</li>
              <li>
                Information for behavioral advertising or user profiling for
                commercial purposes
              </li>
            </ul>
          </section>

          <Separator className="my-8" />

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              3. How We Use Information
            </h2>
            <p className="text-muted-foreground mb-4">
              We use collected information solely for the following educational
              purposes:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li>
                <strong>Providing Educational Services:</strong> Delivering
                personalized learning content, tracking progress, and generating
                progress reports
              </li>
              <li>
                <strong>Adaptive Learning:</strong> Using AI-powered algorithms
                to adjust content difficulty and provide personalized tutoring
                (see Section 5 for AI-specific disclosures)
              </li>
              <li>
                <strong>Platform Improvement:</strong> Analyzing aggregate,
                de-identified usage data to improve our educational content and
                features
              </li>
              <li>
                <strong>Safety and Security:</strong> Protecting against
                unauthorized access, fraud, and ensuring platform integrity
              </li>
              <li>
                <strong>Communication:</strong> Sending progress updates to
                parents and important service announcements
              </li>
            </ul>
          </section>

          <Separator className="my-8" />

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              4. Data Sharing and Disclosure
            </h2>
            <p className="text-muted-foreground mb-4">
              We do not sell, rent, or trade personal information. We may share
              information only in the following limited circumstances:
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">
              4.1 With Schools and Educators
            </h3>
            <p className="text-muted-foreground mb-4">
              When students access our platform through a school, we share
              educational records with authorized school personnel for
              legitimate educational purposes, consistent with FERPA.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">
              4.2 With Parents and Guardians
            </h3>
            <p className="text-muted-foreground mb-4">
              Parents have full access to their child&apos;s account
              information, progress data, and all collected information.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">
              4.3 With Service Providers
            </h3>
            <p className="text-muted-foreground mb-4">
              We work with carefully selected service providers who help us
              operate our platform:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li>
                <strong>Cloud Hosting:</strong> Vercel and Neon (database
                hosting)
              </li>
              <li>
                <strong>Authentication:</strong> OAuth providers (Google,
                Microsoft, Apple) for secure sign-in
              </li>
              <li>
                <strong>AI Services:</strong> Anthropic, OpenAI, and Google for
                AI tutoring features
              </li>
              <li>
                <strong>Email:</strong> Resend for transactional emails
              </li>
            </ul>
            <p className="text-muted-foreground mb-4">
              All service providers are contractually bound to use data only for
              the services we request and are prohibited from using children's
              data for their own purposes.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">
              4.4 Legal Requirements
            </h3>
            <p className="text-muted-foreground mb-4">
              We may disclose information when required by law, such as in
              response to a valid court order or subpoena.
            </p>
          </section>

          <Separator className="my-8" />

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              5. Artificial Intelligence Disclosure
            </h2>
            <p className="text-muted-foreground mb-4">
              In compliance with the 2025 COPPA Rule amendments requiring AI
              transparency, we provide the following disclosures:
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">
              5.1 AI Features
            </h3>
            <p className="text-muted-foreground mb-4">
              Our platform uses artificial intelligence for:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li>
                <strong>AI Tutoring:</strong> Providing personalized
                explanations and answering student questions
              </li>
              <li>
                <strong>Adaptive Learning:</strong> Adjusting content difficulty
                based on student performance
              </li>
              <li>
                <strong>Practice Problem Generation:</strong> Creating
                personalized practice exercises
              </li>
              <li>
                <strong>Progress Analysis:</strong> Identifying learning gaps
                and recommending content
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3">
              5.2 Data Used by AI
            </h3>
            <p className="text-muted-foreground mb-4">
              AI features use the following categories of data:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li>Current lesson content and student questions</li>
              <li>Student grade level and subject area</li>
              <li>
                Recent learning history (e.g., concepts mastered, areas of
                difficulty)
              </li>
            </ul>
            <p className="text-muted-foreground mb-4">
              <strong>Important:</strong> Student data is NOT used to train
              third-party AI models. Conversations with AI tutors are processed
              in real-time and are not retained by AI providers beyond the
              immediate session.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">
              5.3 AI Providers
            </h3>
            <p className="text-muted-foreground mb-4">
              We use the following AI service providers, all of which have data
              processing agreements prohibiting the use of student data for
              model training:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li>Anthropic (Claude)</li>
              <li>OpenAI</li>
              <li>Google (Gemini)</li>
            </ul>
          </section>

          <Separator className="my-8" />

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              6. Data Retention
            </h2>
            <p className="text-muted-foreground mb-4">
              In accordance with the 2025 COPPA Rule requirements, we maintain
              the following data retention policy:
            </p>

            <div className="overflow-x-auto">
              <table className="min-w-full border border-border rounded-lg overflow-hidden">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Data Type
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Retention Period
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      Account Information
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      Duration of account + 30 days after deletion request
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      Educational Progress Data
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      Duration of account + 1 year (for continuity if re-enrolled)
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      AI Tutoring Conversations
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      30 days (for context continuity)
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      Usage Analytics (Aggregated)
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      Indefinitely (de-identified)
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      Session Cookies
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      Deleted upon logout or after 7 days of inactivity
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <Separator className="my-8" />

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              7. Parental Rights
            </h2>
            <p className="text-muted-foreground mb-4">
              Under COPPA, parents have the following rights regarding their
              child&apos;s information:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li>
                <strong>Right to Review:</strong> Access all personal
                information collected from your child
              </li>
              <li>
                <strong>Right to Delete:</strong> Request deletion of your
                child&apos;s personal information
              </li>
              <li>
                <strong>Right to Refuse:</strong> Refuse further collection of
                your child&apos;s information
              </li>
              <li>
                <strong>Right to Withdraw Consent:</strong> Revoke previously
                given consent at any time
              </li>
            </ul>
            <p className="text-muted-foreground mb-4">
              To exercise these rights, please contact us at{" "}
              <a
                href="mailto:privacy@kaelyns.academy"
                className="text-primary hover:underline"
              >
                privacy@kaelyns.academy
              </a>{" "}
              or through your parent dashboard settings.
            </p>
          </section>

          <Separator className="my-8" />

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              8. Data Security
            </h2>
            <p className="text-muted-foreground mb-4">
              We implement industry-standard security measures to protect
              personal information:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li>
                <strong>Encryption:</strong> All data is encrypted in transit
                (TLS 1.3) and at rest (AES-256)
              </li>
              <li>
                <strong>Access Controls:</strong> Role-based access ensures only
                authorized personnel can access data
              </li>
              <li>
                <strong>Regular Audits:</strong> We conduct regular security
                assessments and penetration testing
              </li>
              <li>
                <strong>Secure Infrastructure:</strong> Our platform is hosted
                on SOC 2 Type II certified infrastructure
              </li>
              <li>
                <strong>Employee Training:</strong> All employees receive
                privacy and security training
              </li>
            </ul>
          </section>

          <Separator className="my-8" />

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              9. School Consent
            </h2>
            <p className="text-muted-foreground mb-4">
              When students access Kaelyn&apos;s Academy through a school,
              schools may consent on behalf of parents under COPPA&apos;s
              &quot;school consent&quot; provision. This consent is limited to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li>
                Educational purposes directly related to classroom instruction
              </li>
              <li>
                Features that the school has specifically approved for use
              </li>
            </ul>
            <p className="text-muted-foreground mb-4">
              School consent does NOT extend to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li>Use of student data for AI training</li>
              <li>Marketing or advertising purposes</li>
              <li>Analytics beyond educational support</li>
            </ul>
          </section>

          <Separator className="my-8" />

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              10. Changes to This Policy
            </h2>
            <p className="text-muted-foreground mb-4">
              We may update this Privacy Policy to reflect changes in our
              practices or legal requirements. We will:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li>
                Post the updated policy on this page with a new &quot;Last
                Updated&quot; date
              </li>
              <li>
                Notify parents via email of any material changes affecting
                children&apos;s data
              </li>
              <li>
                Obtain new parental consent if required for any expanded data
                collection
              </li>
            </ul>
          </section>

          <Separator className="my-8" />

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              11. Contact Us
            </h2>
            <p className="text-muted-foreground mb-4">
              If you have questions about this Privacy Policy or our privacy
              practices, please contact us:
            </p>
            <Card className="bg-muted/50">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Email</p>
                      <a
                        href="mailto:privacy@kaelyns.academy"
                        className="text-primary hover:underline"
                      >
                        privacy@kaelyns.academy
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">
                        Privacy Officer
                      </p>
                      <p className="text-muted-foreground">
                        Kaelyn&apos;s Academy Privacy Team
                      </p>
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
              href="/terms"
              className="text-primary hover:underline text-sm"
            >
              Terms of Service
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
