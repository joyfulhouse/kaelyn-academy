import { Metadata } from "next";
import Link from "next/link";
import {
  Users,
  BarChart3,
  Shield,
  BookOpen,
  Zap,
  CheckCircle,
  ArrowRight,
  Building2,
  Clock,
  Globe,
  Award,
  FileText,
  HeadphonesIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { DemoRequestForm } from "@/components/marketing/demo-request-form";

export const metadata: Metadata = {
  title: "For Schools & Districts | Kaelyn's Academy",
  description:
    "Transform your K-12 classroom with Kaelyn's Academy. Standards-aligned curriculum, powerful analytics, classroom management tools, and COPPA/FERPA compliance built in.",
};

const features = [
  {
    icon: BookOpen,
    title: "Standards-Aligned Curriculum",
    description:
      "Complete K-12 curriculum aligned with Common Core, NGSS, and state standards. Ready-to-use lessons with interactive 3D visualizations.",
  },
  {
    icon: BarChart3,
    title: "Powerful Analytics",
    description:
      "Real-time dashboards showing student progress, mastery levels, and areas needing attention. Export reports for administrators and parents.",
  },
  {
    icon: Users,
    title: "Classroom Management",
    description:
      "Create classes, assign students, set custom assignments, and track completion. Seamless roster integration with popular SIS platforms.",
  },
  {
    icon: Zap,
    title: "Adaptive Learning",
    description:
      "AI-powered system adjusts difficulty based on student performance, ensuring every learner is appropriately challenged.",
  },
  {
    icon: Shield,
    title: "Privacy & Compliance",
    description:
      "Fully COPPA and FERPA compliant. Student data is never sold. SOC 2 Type II certified infrastructure.",
  },
  {
    icon: HeadphonesIcon,
    title: "Dedicated Support",
    description:
      "Implementation specialists, professional development resources, and priority support for all school accounts.",
  },
];

const benefits = [
  "Reduce lesson planning time by up to 50%",
  "Increase student engagement with interactive content",
  "Close learning gaps with personalized pathways",
  "Meet accessibility requirements (WCAG 2.1 AA)",
  "Support remote, hybrid, and in-person learning",
  "Seamless integration with Google Classroom and Canvas",
];

const testimonials = [
  {
    quote:
      "Kaelyn's Academy transformed how my students engage with math. The 3D visualizations help them understand abstract concepts in ways I couldn't achieve before.",
    author: "Sarah M.",
    role: "5th Grade Teacher",
    school: "Lincoln Elementary",
  },
  {
    quote:
      "The analytics dashboard gives me exactly the insights I need to support teachers and demonstrate student growth to our board.",
    author: "Dr. James L.",
    role: "Assistant Superintendent",
    school: "Riverside Unified School District",
  },
];

const integrations = [
  "Google Classroom",
  "Canvas",
  "Clever",
  "ClassLink",
  "Schoology",
  "Microsoft Teams",
];

export default function SchoolsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4" variant="secondary">
                <Building2 className="h-3 w-3 mr-1" />
                For Schools & Districts
              </Badge>
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
                Transform Your{" "}
                <span className="text-primary">K-12 Classroom</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Empower teachers with standards-aligned curriculum, engaging 3D
                visualizations, and powerful analytics—all while keeping student
                data safe and compliant.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#demo-form">
                  <Button size="lg" className="gap-2">
                    Request a Demo
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </a>
                <Link href="/pricing">
                  <Button size="lg" variant="outline">
                    View Pricing
                  </Button>
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">K-12</div>
                <div className="text-sm text-muted-foreground">
                  All Grade Levels
                </div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">10+</div>
                <div className="text-sm text-muted-foreground">Subjects</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">100%</div>
                <div className="text-sm text-muted-foreground">
                  Standards Aligned
                </div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  FERPA
                </div>
                <div className="text-sm text-muted-foreground">Compliant</div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built by educators for educators, with the tools teachers actually
              need.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <div className="p-3 bg-primary/10 rounded-lg w-fit mb-2">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator className="max-w-6xl mx-auto" />

      {/* Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Why Schools Choose Us
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join hundreds of schools that have improved student outcomes
                with Kaelyn's Academy.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              {testimonials.map((testimonial, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground italic mb-4">
                      "{testimonial.quote}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary font-semibold">
                          {testimonial.author.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-foreground">
                          {testimonial.author}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {testimonial.role}, {testimonial.school}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Integrates with Your Existing Tools
          </h2>
          <p className="text-muted-foreground mb-8">
            Seamless integration with the platforms you already use.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {integrations.map((integration) => (
              <Badge
                key={integration}
                variant="outline"
                className="px-4 py-2 text-sm"
              >
                {integration}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      <Separator className="max-w-6xl mx-auto" />

      {/* Compliance Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Built for Compliance
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Student privacy and data security are at the core of everything we
              do.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <Shield className="h-10 w-10 text-primary mx-auto mb-3" />
                <CardTitle className="text-lg mb-2">COPPA Compliant</CardTitle>
                <CardDescription>
                  Verified protection for students under 13
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <FileText className="h-10 w-10 text-primary mx-auto mb-3" />
                <CardTitle className="text-lg mb-2">FERPA Compliant</CardTitle>
                <CardDescription>
                  Educational records handled properly
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Award className="h-10 w-10 text-primary mx-auto mb-3" />
                <CardTitle className="text-lg mb-2">SOC 2 Type II</CardTitle>
                <CardDescription>
                  Enterprise-grade security controls
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Globe className="h-10 w-10 text-primary mx-auto mb-3" />
                <CardTitle className="text-lg mb-2">Student DPA</CardTitle>
                <CardDescription>
                  Ready-to-sign data agreements
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Request Form */}
      <section
        id="demo-form"
        className="py-16 px-4 sm:px-6 lg:px-8 bg-primary/5"
      >
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Request a Demo
            </h2>
            <p className="text-lg text-muted-foreground">
              See how Kaelyn's Academy can transform learning in your school.
              Fill out the form and we'll be in touch within one business day.
            </p>
          </div>
          <Card>
            <CardContent className="pt-6">
              <DemoRequestForm />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground mb-8">
            Implementation typically takes 2-4 weeks. Our team handles
            everything from rostering to teacher training.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" variant="outline" className="gap-2">
                Contact Sales
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" className="gap-2">
                View Pricing
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
