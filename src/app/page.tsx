import Link from "next/link";
import {
  GraduationCap,
  Bot,
  BarChart3,
  Gamepad2,
  Users,
  Target,
  Shield,
  Check,
  Calculator,
  BookOpen,
  Microscope,
  Landmark,
  Laptop,
  Palette,
  Play,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StatsSection } from "@/components/marketing/stats-section";

export default function LandingPage() {
  const features = [
    {
      icon: Bot,
      title: "AI-Powered Tutoring",
      description: "Personalized learning assistance with intelligent AI tutors that adapt to each student's pace and style.",
    },
    {
      icon: BarChart3,
      title: "Progress Tracking",
      description: "Real-time dashboards for learners, parents, and teachers to monitor growth and celebrate achievements.",
    },
    {
      icon: Gamepad2,
      title: "Interactive Learning",
      description: "Engaging 3D visualizations and gamified activities that make learning fun and memorable.",
    },
    {
      icon: Users,
      title: "Family Connected",
      description: "Parents stay informed with detailed progress reports and recommendations for at-home support.",
    },
    {
      icon: Target,
      title: "Adaptive Difficulty",
      description: "Smart algorithms adjust content difficulty to keep students challenged but never overwhelmed.",
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "COPPA-compliant platform with robust privacy protections designed for K-12 education.",
    },
  ];

  const subjects = [
    { name: "Mathematics", icon: Calculator, color: "from-blue-500 to-cyan-500" },
    { name: "Reading & ELA", icon: BookOpen, color: "from-green-500 to-emerald-500" },
    { name: "Science", icon: Microscope, color: "from-purple-500 to-violet-500" },
    { name: "History", icon: Landmark, color: "from-orange-500 to-amber-500" },
    { name: "Technology", icon: Laptop, color: "from-pink-500 to-rose-500" },
    { name: "Art & Music", icon: Palette, color: "from-teal-500 to-cyan-500" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav
        aria-label="Main navigation"
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-foreground">
                Kaelyn&apos;s Academy
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link href="#features" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
                Features
              </Link>
              <Link href="#subjects" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
                Subjects
              </Link>
              <Link href="#pricing" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
                Pricing
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log In
                </Button>
              </Link>
              <Link href="/login">
                <Button size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main id="main-content" role="main">
        <section
          aria-labelledby="hero-heading"
          className="pt-32 pb-20 px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-7xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Now with AI-powered learning
            </Badge>
            <h1 id="hero-heading" className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight tracking-tight">
              Learning Made{" "}
              <span className="text-primary">
                Personal & Fun
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              K-12 education platform with AI tutors, interactive lessons, and progress tracking that adapts to every student&apos;s unique learning journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" className="gap-2 px-8">
                  <Play className="h-4 w-4" />
                  Start Learning Free
                </Button>
              </Link>
              <Link href="#demo">
                <Button size="lg" variant="outline" className="gap-2 px-8">
                  Watch Demo
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="mt-12 flex flex-wrap justify-center items-center gap-6 text-muted-foreground text-sm">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-success" />
                Free for families
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-success" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-success" />
                COPPA compliant
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          aria-labelledby="features-heading"
          className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 id="features-heading" className="text-3xl font-bold text-foreground mb-4">
                Everything You Need for Success
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Powerful tools designed specifically for K-12 education, from kindergarten through high school.
              </p>
            </div>
            <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" role="list" aria-label="Platform features">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <li key={feature.title}>
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                          <Icon className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {feature.description}
                        </p>
                      </CardContent>
                    </Card>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* Subjects Section */}
        <section
          id="subjects"
          aria-labelledby="subjects-heading"
          className="py-20 px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 id="subjects-heading" className="text-3xl font-bold text-foreground mb-4">
                Complete K-12 Curriculum
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Comprehensive coverage of core subjects with grade-appropriate content from kindergarten through 12th grade.
              </p>
            </div>
            <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4" role="list" aria-label="Available subjects">
              {subjects.map((subject) => {
                const Icon = subject.icon;
                return (
                  <li key={subject.name} className="group">
                    <button
                      type="button"
                      aria-label={`Explore ${subject.name}`}
                      className={`w-full bg-gradient-to-br ${subject.color} p-6 rounded-2xl text-white text-center transform transition-all group-hover:scale-105 group-hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
                    >
                      <Icon className="h-10 w-10 mx-auto mb-3" />
                      <div className="font-medium text-sm">{subject.name}</div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* Stats Section */}
        <StatsSection />

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to Transform Learning?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of families who have made learning engaging and effective with Kaelyn&apos;s Academy.
            </p>
            <Link href="/login">
              <Button size="lg" className="px-12">
                Get Started for Free
              </Button>
            </Link>
          </div>
        </section>
      </main>

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
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <span className="font-bold text-foreground">Kaelyn&apos;s Academy</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Making K-12 education personal, engaging, and effective for every student.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="#subjects" className="hover:text-foreground transition-colors">Subjects</Link></li>
                <li><Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link href="/schools" className="hover:text-foreground transition-colors">For Schools</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-foreground transition-colors">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
                <li><Link href="/coppa" className="hover:text-foreground transition-colors">COPPA Compliance</Link></li>
              </ul>
            </div>
          </div>
          <Separator className="my-8" />
          <div className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Kaelyn&apos;s Academy. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
