import { Metadata } from "next";
import Link from "next/link";
import {
  Check,
  X,
  GraduationCap,
  Building2,
  Users,
  Sparkles,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "Pricing | Kaelyn's Academy",
  description:
    "Free for families, affordable for schools. Explore Kaelyn's Academy pricing plans for K-12 education with standards-aligned curriculum and interactive learning.",
};

const familyFeatures = [
  { name: "Full K-12 curriculum access", included: true },
  { name: "All subjects (Math, Reading, Science, etc.)", included: true },
  { name: "Interactive 3D visualizations", included: true },
  { name: "AI-powered tutoring", included: true },
  { name: "Progress tracking", included: true },
  { name: "Achievement system", included: true },
  { name: "Multiple child profiles", included: true },
  { name: "Parental controls", included: true },
  { name: "Foreign language courses", included: true },
  { name: "Offline access", included: false },
  { name: "Priority support", included: false },
];

const schoolFeatures = [
  { name: "Everything in Family Plan", included: true },
  { name: "Classroom management tools", included: true },
  { name: "Student rostering (Clever, ClassLink)", included: true },
  { name: "LMS integration (Canvas, Google)", included: true },
  { name: "Custom assignments", included: true },
  { name: "Detailed analytics & reports", included: true },
  { name: "Standards mapping", included: true },
  { name: "Admin dashboard", included: true },
  { name: "SSO/SAML authentication", included: true },
  { name: "Data export & API access", included: true },
  { name: "Dedicated success manager", included: true },
  { name: "Professional development", included: true },
  { name: "Priority support (24h SLA)", included: true },
];

const faqs = [
  {
    question: "Is Kaelyn's Academy really free for families?",
    answer:
      "Yes! Kaelyn's Academy is completely free for individual families and homeschoolers. We believe every child deserves access to quality education regardless of their family's financial situation. Our family plan includes full curriculum access, AI tutoring, progress tracking, and more—all at no cost.",
  },
  {
    question: "How do you make money if it's free for families?",
    answer:
      "We offer premium plans for schools and districts that include classroom management tools, advanced analytics, rostering integrations, and dedicated support. This allows us to provide free access to families while building a sustainable business.",
  },
  {
    question: "What's included in the school pricing?",
    answer:
      "School pricing is based on the number of students and includes everything in the family plan plus: classroom management, LMS integration, rostering (Clever, ClassLink), detailed analytics, custom assignments, admin dashboard, SSO, data export, a dedicated success manager, and priority support.",
  },
  {
    question: "Do you offer discounts for Title I schools?",
    answer:
      "Yes! We offer significant discounts for Title I schools and districts with limited budgets. Contact our sales team to discuss your specific situation and learn about available grants and funding options.",
  },
  {
    question: "Is there a free trial for schools?",
    answer:
      "Absolutely! We offer a 30-day free pilot program for schools, including full access to all features and dedicated onboarding support. Request a demo to get started.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "For families, the platform is free—no payment needed. For schools, we accept purchase orders, credit cards, and ACH transfers. We can also work with your procurement process and timing.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Family accounts are free and can be deleted at any time. School contracts are typically annual but include a 30-day satisfaction guarantee. If you're not happy, we'll work with you to make it right.",
  },
  {
    question: "Is student data safe?",
    answer:
      "Absolutely. We're fully COPPA and FERPA compliant, SOC 2 Type II certified, and never sell student data. We sign Student Data Privacy Agreements and follow the Student Privacy Pledge. See our Privacy Policy for details.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4" variant="secondary">
            <Sparkles className="h-3 w-3 mr-1" />
            Simple, Transparent Pricing
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Free for Families.
            <br />
            <span className="text-primary">Affordable for Schools.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We believe every child deserves access to quality education. That's
            why Kaelyn's Academy is completely free for families and
            homeschoolers.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Family Plan */}
            <Card className="relative border-2">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <Badge variant="secondary">Most Popular</Badge>
                </div>
                <CardTitle className="text-2xl">Family Plan</CardTitle>
                <CardDescription>
                  For individual families and homeschoolers
                </CardDescription>
                <div className="mt-4">
                  <span className="text-5xl font-bold text-foreground">$0</span>
                  <span className="text-muted-foreground">/forever</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {familyFeatures.map((feature) => (
                    <li key={feature.name} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-success flex-shrink-0" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground/50 flex-shrink-0" />
                      )}
                      <span
                        className={
                          feature.included
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }
                      >
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/login" className="w-full">
                  <Button className="w-full" size="lg">
                    Get Started Free
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            {/* School Plan */}
            <Card className="relative border-2 border-primary">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                  For Schools
                </Badge>
              </div>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-2xl">School Plan</CardTitle>
                <CardDescription>
                  For schools, districts, and institutions
                </CardDescription>
                <div className="mt-4">
                  <span className="text-5xl font-bold text-foreground">
                    Custom
                  </span>
                  <span className="text-muted-foreground">/student/year</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {schoolFeatures.slice(0, 11).map((feature) => (
                    <li key={feature.name} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-success flex-shrink-0" />
                      <span className="text-foreground">{feature.name}</span>
                    </li>
                  ))}
                  <li className="text-sm text-muted-foreground pt-2">
                    + {schoolFeatures.length - 11} more features
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Link href="/schools#demo-form" className="w-full">
                  <Button className="w-full" size="lg">
                    Request a Demo
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/contact" className="w-full">
                  <Button variant="outline" className="w-full" size="lg">
                    Contact Sales
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Volume Pricing */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <Users className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Volume Discounts for Schools
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            The more students you enroll, the more you save. We also offer
            special pricing for Title I schools and multi-year agreements.
          </p>
          <div className="grid sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-foreground mb-1">
                  1-100
                </div>
                <div className="text-sm text-muted-foreground mb-3">
                  students
                </div>
                <div className="text-lg font-semibold text-primary">
                  Contact us
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-foreground mb-1">
                  101-500
                </div>
                <div className="text-sm text-muted-foreground mb-3">
                  students
                </div>
                <div className="text-lg font-semibold text-primary">
                  10% off
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-foreground mb-1">
                  501-1000
                </div>
                <div className="text-sm text-muted-foreground mb-3">
                  students
                </div>
                <div className="text-lg font-semibold text-primary">
                  20% off
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-foreground mb-1">
                  1000+
                </div>
                <div className="text-sm text-muted-foreground mb-3">
                  students
                </div>
                <div className="text-lg font-semibold text-primary">
                  Custom
                </div>
              </CardContent>
            </Card>
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            Title I schools may qualify for additional discounts of up to 50%.
          </p>
        </div>
      </section>

      <Separator className="max-w-4xl mx-auto" />

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <HelpCircle className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground">
              Have questions? We've got answers.
            </p>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of families and schools already using Kaelyn's
            Academy to make learning engaging and effective.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="gap-2">
                <GraduationCap className="h-5 w-5" />
                Start Free (Families)
              </Button>
            </Link>
            <Link href="/schools">
              <Button size="lg" variant="outline" className="gap-2">
                <Building2 className="h-5 w-5" />
                Learn About School Plans
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
