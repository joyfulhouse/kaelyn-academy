import { Metadata } from "next";
import Link from "next/link";
import {
  Baby,
  Shield,
  CheckCircle2,
  Lock,
  Eye,
  Trash2,
  School,
  AlertCircle,
  Mail,
  FileText,
  UserCheck,
  Database,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "COPPA Compliance | Kaelyn's Academy",
  description:
    "Learn how Kaelyn's Academy protects children's privacy and complies with the Children's Online Privacy Protection Act (COPPA).",
};

export default function COPPACompliancePage() {
  const lastUpdated = "December 26, 2025";

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400">
              <Baby className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Children&apos;s Privacy (COPPA)
          </h1>
          <p className="text-muted-foreground mb-4">
            How Kaelyn&apos;s Academy Protects Your Child&apos;s Information
          </p>
          <Badge
            variant="outline"
            className="text-green-600 border-green-300 dark:text-green-400 dark:border-green-800"
          >
            Updated for 2025 COPPA Rule Amendments
          </Badge>
          <p className="text-sm text-muted-foreground mt-4">
            Last Updated: {lastUpdated}
          </p>
        </div>

        {/* What is COPPA */}
        <Card className="mb-8 border-green-200 dark:border-green-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <Shield className="h-5 w-5" />
              What is COPPA?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The Children&apos;s Online Privacy Protection Act (COPPA) is a
              U.S. federal law enacted in 1998 and enforced by the Federal Trade
              Commission (FTC). COPPA protects the privacy of children under 13
              years of age by requiring websites and online services to obtain
              verifiable parental consent before collecting personal information
              from children.
            </p>
            <p className="text-muted-foreground mt-4">
              <strong>The 2025 COPPA Rule Amendments</strong> (effective June
              23, 2025) represent the most significant update to children&apos;s
              privacy protections in over two decades, expanding the definition
              of personal information and adding new requirements for AI
              transparency.
            </p>
          </CardContent>
        </Card>

        {/* Our Commitment */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-foreground">
                  Verifiable Parental Consent
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                We obtain verifiable parental consent before collecting any
                personal information from children under 13. Parents must verify
                their identity before creating learner accounts.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Lock className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-foreground">
                  Data Minimization
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                We only collect information necessary to provide educational
                services. We never collect more data than needed and never for
                marketing purposes.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Eye className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-foreground">
                  No Targeted Advertising
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                We never use children&apos;s personal information for behavioral
                advertising or create marketing profiles. Our platform is
                ad-free for all learners.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Database className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-foreground">
                  Data Retention Limits
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                We retain children&apos;s data only as long as necessary for
                educational purposes. Parents can request deletion at any time.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Compliance Information */}
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Information We Collect from Children
            </h2>
            <p className="text-muted-foreground mb-4">
              With verifiable parental consent, we collect only the following
              information from children under 13:
            </p>

            <div className="overflow-x-auto mb-6">
              <table className="min-w-full border border-border rounded-lg overflow-hidden">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Information Type
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Purpose
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      First name or nickname
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      Personalize learning experience and display in
                      parent/teacher dashboards
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      Grade level
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      Provide age-appropriate content and curriculum
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      Date of birth (optional)
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      Verify age group for COPPA compliance; celebrate birthdays
                      if enabled
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      Learning progress data
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      Track educational progress, personalize learning path,
                      generate reports
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      Assessment responses
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      Evaluate understanding and adjust content difficulty
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      AI tutor conversations
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      Provide educational support and track learning patterns
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-semibold text-foreground mb-3">
              Information We Do NOT Collect from Children
            </h3>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li>Email addresses (associated with parent account only)</li>
              <li>Phone numbers</li>
              <li>Physical addresses</li>
              <li>Photos or videos</li>
              <li>Social media handles</li>
              <li>
                Biometric data (fingerprints, facial recognition, voice prints)
              </li>
              <li>Precise geolocation</li>
              <li>Persistent identifiers for advertising purposes</li>
            </ul>
          </section>

          <Separator className="my-8" />

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <UserCheck className="h-6 w-6 text-primary" />
              Parental Consent Process
            </h2>
            <p className="text-muted-foreground mb-4">
              Before creating a learner profile for a child under 13, we require
              verifiable parental consent through the following process:
            </p>

            <div className="space-y-4 mb-6">
              <div className="flex gap-4 items-start">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">
                    Parent Account Creation
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    A parent or guardian creates an account using their own
                    email and authenticates via a verified identity provider
                    (Google, Microsoft, Apple).
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">
                    Direct Notice
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    We provide clear, complete notice about our data practices,
                    including what information we collect, how it&apos;s used,
                    and third-party sharing.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">
                    Consent Verification
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    The parent actively consents by checking acknowledgment
                    boxes and clicking &quot;I Consent.&quot; For enhanced
                    verification, we may use knowledge-based authentication
                    questions.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold shrink-0">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">
                    Learner Profile Creation
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Only after consent is verified can the parent create a
                    learner profile for their child.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <Separator className="my-8" />

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <School className="h-6 w-6 text-primary" />
              School Consent
            </h2>
            <p className="text-muted-foreground mb-4">
              Under COPPA, schools may consent to the collection of student
              information on behalf of parents when the service is used for
              educational purposes. This &quot;school consent&quot; mechanism is
              subject to strict limitations under the 2025 COPPA Rule
              amendments:
            </p>

            <Card className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
              <CardContent className="p-6">
                <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-3 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  School Consent Limitations
                </h4>
                <ul className="list-disc pl-6 text-amber-700 dark:text-amber-300 space-y-2 text-sm">
                  <li>
                    School consent applies ONLY to data used for educational
                    purposes within the school context
                  </li>
                  <li>
                    School consent does NOT extend to AI training, commercial
                    analytics, or purposes beyond classroom support
                  </li>
                  <li>
                    Schools must provide parents with notice of all
                    school-authorized services
                  </li>
                  <li>
                    Parents retain all COPPA rights regardless of school consent
                  </li>
                </ul>
              </CardContent>
            </Card>

            <p className="text-muted-foreground mb-4">
              When a school district contracts with Kaelyn&apos;s Academy:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li>
                We enter into a Student Data Privacy Agreement specifying
                permitted uses
              </li>
              <li>
                We collect only what is necessary for the educational purpose
              </li>
              <li>
                We prohibit use of student data for advertising or marketing
              </li>
              <li>
                We comply with FERPA and state student privacy laws
              </li>
              <li>
                Data is deleted or returned when the school relationship ends
              </li>
            </ul>
          </section>

          <Separator className="my-8" />

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Your Rights as a Parent
            </h2>
            <p className="text-muted-foreground mb-4">
              COPPA provides parents with the following rights regarding their
              child&apos;s information:
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Eye className="h-4 w-4 text-primary" />
                    Right to Review
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    You can review all personal information collected from your
                    child at any time through your parent dashboard or by
                    contacting us.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Trash2 className="h-4 w-4 text-primary" />
                    Right to Delete
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    You can request deletion of your child&apos;s personal
                    information at any time. We will delete the data within 30
                    days.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-primary" />
                    Right to Refuse
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    You can refuse to allow further collection or use of your
                    child&apos;s information without losing access to
                    educational features.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-primary" />
                    Right to Control
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    You can modify parental control settings, screen time
                    limits, and which features your child can access.
                  </p>
                </CardContent>
              </Card>
            </div>

            <h3 className="text-xl font-semibold text-foreground mb-3">
              How to Exercise Your Rights
            </h3>
            <p className="text-muted-foreground mb-4">
              You can exercise these rights by:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li>
                <strong>Parent Dashboard:</strong> Access settings directly in
                your account under &quot;Children&quot; → &quot;Privacy
                Settings&quot;
              </li>
              <li>
                <strong>Email:</strong> Send requests to{" "}
                <a
                  href="mailto:privacy@kaelyns.academy"
                  className="text-primary hover:underline"
                >
                  privacy@kaelyns.academy
                </a>
              </li>
              <li>
                <strong>Contact Form:</strong> Use our{" "}
                <Link href="/contact" className="text-primary hover:underline">
                  contact form
                </Link>{" "}
                with subject &quot;COPPA Request&quot;
              </li>
            </ul>
            <p className="text-muted-foreground mb-4">
              We will respond to all requests within 10 business days.
            </p>
          </section>

          <Separator className="my-8" />

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              AI Features and Children&apos;s Data
            </h2>
            <p className="text-muted-foreground mb-4">
              In compliance with the 2025 COPPA Rule requirements for AI
              transparency:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li>
                <strong>No AI Training:</strong> Children&apos;s data is NEVER
                used to train AI models. Conversations with AI tutors are
                processed in real-time only.
              </li>
              <li>
                <strong>Educational Purpose Only:</strong> AI features (tutoring,
                adaptive learning) are used solely to support your child&apos;s
                education.
              </li>
              <li>
                <strong>Age-Appropriate Content:</strong> AI responses are
                filtered for age-appropriateness based on the child&apos;s grade
                level.
              </li>
              <li>
                <strong>Third-Party AI Providers:</strong> We use Anthropic,
                OpenAI, and Google for AI features, all bound by data processing
                agreements prohibiting use of children&apos;s data for their own
                purposes.
              </li>
            </ul>
          </section>

          <Separator className="my-8" />

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Data Security
            </h2>
            <p className="text-muted-foreground mb-4">
              We implement robust security measures to protect children&apos;s
              information:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li>
                End-to-end encryption for data in transit (TLS 1.3) and at rest
                (AES-256)
              </li>
              <li>
                Access controls ensuring only authorized personnel can access
                child data
              </li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>
                Employee training on COPPA compliance and data protection
              </li>
              <li>Incident response procedures for potential data breaches</li>
              <li>SOC 2 Type II certified cloud infrastructure</li>
            </ul>
          </section>

          <Separator className="my-8" />

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Contact Our Privacy Team
            </h2>
            <p className="text-muted-foreground mb-4">
              If you have questions about how we protect children&apos;s privacy
              or wish to exercise your COPPA rights:
            </p>

            <Card className="bg-muted/50">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">
                        Privacy Email
                      </p>
                      <a
                        href="mailto:privacy@kaelyns.academy"
                        className="text-primary hover:underline"
                      >
                        privacy@kaelyns.academy
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">
                        Children&apos;s Privacy Officer
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Kaelyn&apos;s Academy Privacy Team
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">
                        Response Time
                      </p>
                      <p className="text-muted-foreground text-sm">
                        We respond to all COPPA requests within 10 business days
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <Separator className="my-8" />

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Additional Resources
            </h2>
            <p className="text-muted-foreground mb-4">
              For more information about children&apos;s online privacy:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li>
                <a
                  href="https://www.ftc.gov/legal-library/browse/rules/childrens-online-privacy-protection-rule-coppa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  FTC COPPA Rule (Official Text)
                </a>
              </li>
              <li>
                <a
                  href="https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  FTC COPPA Compliance FAQs
                </a>
              </li>
              <li>
                <a
                  href="https://studentprivacy.ed.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  U.S. Department of Education Student Privacy Resources
                </a>
              </li>
            </ul>
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
              href="/terms"
              className="text-primary hover:underline text-sm"
            >
              Terms of Service
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
