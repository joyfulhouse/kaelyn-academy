import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  GraduationCap,
  Heart,
  Lightbulb,
  Shield,
  Users,
  Sparkles,
  BookOpen,
  Globe,
  Award,
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

export const metadata: Metadata = {
  title: "About Us | Kaelyn's Academy",
  description:
    "Learn about Kaelyn's Academy - our mission to make K-12 education personal, engaging, and effective for every student through innovative technology and proven pedagogy.",
};

const values = [
  {
    icon: Heart,
    title: "Student-Centered Learning",
    description:
      "Every feature we build starts with one question: How will this help students learn better? We believe education should adapt to each child, not the other way around.",
  },
  {
    icon: Shield,
    title: "Privacy & Safety First",
    description:
      "Children's data is sacred. We go beyond COPPA requirements to ensure student information is protected, never sold, and used only to improve their learning experience.",
  },
  {
    icon: Lightbulb,
    title: "Joy in Discovery",
    description:
      "Learning should spark curiosity and wonder. Our interactive 3D visualizations and engaging content turn abstract concepts into memorable experiences.",
  },
  {
    icon: Users,
    title: "Inclusive Excellence",
    description:
      "Every child deserves access to high-quality education. We design for accessibility, support multiple languages, and adapt to different learning styles.",
  },
];

const stats = [
  { value: "K-12", label: "Grade Levels Covered" },
  { value: "10+", label: "Core Subjects" },
  { value: "100%", label: "Standards Aligned" },
  { value: "6+", label: "Languages Supported" },
];

const team = [
  {
    name: "The Kaelyn's Academy Team",
    role: "Educators, Engineers & Designers",
    description:
      "We're a diverse team of former teachers, curriculum designers, software engineers, and child development specialists united by a common mission: making learning accessible and engaging for every child.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <GraduationCap className="h-4 w-4" />
            Our Story
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Education Reimagined for{" "}
            <span className="text-primary">Every Child</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Kaelyn's Academy was founded with a simple belief: every child
            deserves a personalized education that meets them where they are and
            inspires them to grow.
          </p>
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
                We're building the future of K-12 education—one that combines
                the best of technology with proven pedagogical methods to create
                truly personalized learning experiences.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                Traditional education often treats students as uniform learners
                moving at the same pace. But every child is unique—they have
                different strengths, interests, and ways of understanding the
                world.
              </p>
              <p className="text-lg text-muted-foreground">
                Kaelyn's Academy uses adaptive learning technology, interactive
                3D visualizations, and AI-powered tutoring to meet each student
                exactly where they are, helping them build confidence and master
                concepts at their own pace.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat) => (
                <Card key={stat.label} className="text-center">
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              ))}
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
              These principles guide every decision we make, from product design
              to customer support.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {values.map((value) => (
              <Card key={value.title}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <value.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{value.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {value.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator className="max-w-6xl mx-auto" />

      {/* What We Offer Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              What We Offer
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A comprehensive learning platform designed for the whole
              educational ecosystem.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="p-3 bg-blue-500/10 rounded-lg w-fit">
                  <BookOpen className="h-6 w-6 text-blue-500" />
                </div>
                <CardTitle>For Students</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Interactive 3D learning visualizations</li>
                  <li>• AI-powered personal tutoring</li>
                  <li>• Adaptive difficulty progression</li>
                  <li>• Achievement and reward systems</li>
                  <li>• Multi-subject curriculum</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="p-3 bg-green-500/10 rounded-lg w-fit">
                  <Users className="h-6 w-6 text-green-500" />
                </div>
                <CardTitle>For Parents</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Detailed progress dashboards</li>
                  <li>• Parental controls and time limits</li>
                  <li>• Learning recommendations</li>
                  <li>• Multi-child management</li>
                  <li>• Direct teacher communication</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="p-3 bg-purple-500/10 rounded-lg w-fit">
                  <GraduationCap className="h-6 w-6 text-purple-500" />
                </div>
                <CardTitle>For Schools</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Classroom management tools</li>
                  <li>• Standards-aligned curriculum</li>
                  <li>• Student analytics and reports</li>
                  <li>• Assignment creation and grading</li>
                  <li>• District-wide administration</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Standards Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Award className="h-4 w-4" />
                Standards Alignment
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Built on Educational Standards
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Our curriculum is carefully aligned with national and
                international educational standards, ensuring students are
                learning the skills they need to succeed.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <div className="font-medium text-foreground">
                      Common Core State Standards
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Mathematics and English Language Arts
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <div className="font-medium text-foreground">
                      Next Generation Science Standards
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Science education across all grade levels
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <div className="font-medium text-foreground">
                      ACTFL World-Readiness Standards
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Foreign language learning pathways
                    </div>
                  </div>
                </li>
              </ul>
            </div>
            <div className="flex justify-center">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-6 text-center">
                  <Globe className="h-10 w-10 text-primary mx-auto mb-3" />
                  <div className="font-medium">Global Standards</div>
                </Card>
                <Card className="p-6 text-center">
                  <Award className="h-10 w-10 text-primary mx-auto mb-3" />
                  <div className="font-medium">Research-Based</div>
                </Card>
                <Card className="p-6 text-center">
                  <Lightbulb className="h-10 w-10 text-primary mx-auto mb-3" />
                  <div className="font-medium">Evidence-Driven</div>
                </Card>
                <Card className="p-6 text-center">
                  <Shield className="h-10 w-10 text-primary mx-auto mb-3" />
                  <div className="font-medium">Privacy First</div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Transform Learning?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of families and schools who are already using
            Kaelyn's Academy to make education more engaging and effective.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="gap-2">
                <GraduationCap className="h-5 w-5" />
                Get Started Free
              </Button>
            </Link>
            <Link href="/schools">
              <Button size="lg" variant="outline" className="gap-2">
                <Users className="h-5 w-5" />
                For Schools
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
