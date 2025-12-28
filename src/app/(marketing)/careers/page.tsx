import { Metadata } from "next";
import Link from "next/link";
import {
  Briefcase,
  MapPin,
  Clock,
  Heart,
  Sparkles,
  Users,
  GraduationCap,
  Globe,
  Zap,
  Coffee,
  Laptop,
  Plane,
  Smile,
  DollarSign,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { openPositions } from "@/data/careers";

export const metadata: Metadata = {
  title: "Careers | Kaelyn's Academy",
  description:
    "Join Kaelyn's Academy and help transform K-12 education. We're building the future of learning with passionate educators, engineers, and designers.",
};

const values = [
  {
    icon: Heart,
    title: "Students First",
    description:
      "Every decision starts with: How does this help students learn better?",
  },
  {
    icon: Sparkles,
    title: "Curiosity-Driven",
    description:
      "We ask questions, explore possibilities, and never stop learning.",
  },
  {
    icon: Users,
    title: "Collaborative",
    description:
      "The best ideas come from diverse perspectives working together.",
  },
  {
    icon: Zap,
    title: "Move Fast",
    description: "We ship quickly, learn from feedback, and iterate.",
  },
];

const benefits = [
  {
    icon: DollarSign,
    title: "Competitive Pay",
    description: "Top-of-market compensation with equity",
  },
  {
    icon: Shield,
    title: "Health & Wellness",
    description: "Medical, dental, vision, and mental health",
  },
  {
    icon: Laptop,
    title: "Remote-First",
    description: "Work from anywhere with flexible hours",
  },
  {
    icon: Plane,
    title: "Unlimited PTO",
    description: "Take the time you need to recharge",
  },
  {
    icon: Coffee,
    title: "Home Office",
    description: "$1,000 setup stipend for your workspace",
  },
  {
    icon: GraduationCap,
    title: "Learning Budget",
    description: "$2,000/year for courses and conferences",
  },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4" variant="secondary">
            <Briefcase className="h-3 w-3 mr-1" />
            We're Hiring
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Help Us Transform{" "}
            <span className="text-primary">K-12 Education</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Join a team of passionate educators, engineers, and designers who
            are building the future of learning. Remote-first, mission-driven,
            and always learning.
          </p>
          <a href="#positions">
            <Button size="lg" className="gap-2">
              View Open Positions
              <Briefcase className="h-4 w-4" />
            </Button>
          </a>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Every child learns differently, yet most educational tools treat
                students as if they're all the same. We're changing that.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                At Kaelyn's Academy, we're building adaptive learning technology
                that meets each student where they are—using interactive 3D
                visualizations, AI-powered tutoring, and personalized learning
                paths to make education engaging and effective.
              </p>
              <p className="text-lg text-muted-foreground">
                We believe education should be accessible to everyone. That's
                why our platform is free for families while we build sustainable
                partnerships with schools.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 text-center">
                <Globe className="h-10 w-10 text-primary mx-auto mb-3" />
                <div className="font-medium">Remote-First</div>
                <div className="text-sm text-muted-foreground">Work anywhere</div>
              </Card>
              <Card className="p-6 text-center">
                <Users className="h-10 w-10 text-primary mx-auto mb-3" />
                <div className="font-medium">Small Team</div>
                <div className="text-sm text-muted-foreground">High impact</div>
              </Card>
              <Card className="p-6 text-center">
                <GraduationCap className="h-10 w-10 text-primary mx-auto mb-3" />
                <div className="font-medium">Mission-Driven</div>
                <div className="text-sm text-muted-foreground">
                  Student-focused
                </div>
              </Card>
              <Card className="p-6 text-center">
                <Smile className="h-10 w-10 text-primary mx-auto mb-3" />
                <div className="font-medium">Fun Culture</div>
                <div className="text-sm text-muted-foreground">
                  Serious work
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Separator className="max-w-6xl mx-auto" />

      {/* Values Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Our Values
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              These principles guide how we work together and build our product.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <Card key={value.title}>
                <CardHeader className="text-center">
                  <div className="p-3 bg-primary/10 rounded-lg w-fit mx-auto mb-2">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {value.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Benefits & Perks
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We take care of our team so they can focus on our mission.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit) => (
              <Card key={benefit.title}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <benefit.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        {benefit.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="positions" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Open Positions
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join our growing team and help shape the future of education.
            </p>
          </div>
          <div className="space-y-4">
            {openPositions.map((position) => (
              <Card key={position.id} className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl mb-2">
                        {position.title}
                      </CardTitle>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{position.department}</Badge>
                        <Badge variant="outline" className="gap-1">
                          <MapPin className="h-3 w-3" />
                          {position.location}
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          <Clock className="h-3 w-3" />
                          {position.type}
                        </Badge>
                      </div>
                    </div>
                    <Link href={`/careers/${position.id}`}>
                      <Button>Apply Now</Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {position.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* No Positions CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Don't See the Right Role?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            We're always looking for talented people who are passionate about
            education. Send us your resume and tell us how you'd like to
            contribute.
          </p>
          <Link href="/contact">
            <Button size="lg" variant="outline" className="gap-2">
              Get in Touch
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
