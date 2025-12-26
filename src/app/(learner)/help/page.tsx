import { Metadata } from "next";
import Link from "next/link";
import {
  HelpCircle,
  BookOpen,
  MessageCircle,
  Video,
  Search,
  ChevronRight,
  Mail,
  Phone,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "Help & Support | Kaelyn's Academy",
  description: "Get help with your learning journey",
};

const faqs = [
  {
    question: "How do I track my progress?",
    answer:
      "Your progress is automatically tracked as you complete lessons. Visit your Dashboard to see your overall progress, streak, and achievements. Each subject page also shows detailed progress for that subject.",
  },
  {
    question: "What happens if I get a question wrong?",
    answer:
      "Don't worry! Getting questions wrong is part of learning. The system will help you understand the correct answer and may give you similar questions to practice. Your mastery score improves as you learn.",
  },
  {
    question: "How do I earn badges and achievements?",
    answer:
      "Badges are earned by completing lessons, maintaining streaks, reaching mastery levels, and accomplishing special goals. Check the Achievements page to see all available badges and your progress toward earning them.",
  },
  {
    question: "Can I go back and redo a lesson?",
    answer:
      "Yes! You can revisit any completed lesson at any time. Just navigate to the subject and find the lesson you want to review. Redoing lessons can help reinforce what you've learned.",
  },
  {
    question: "How does the AI Tutor work?",
    answer:
      "The AI Tutor is like having a personal teacher available 24/7. You can ask questions about any subject, request explanations, or get help with specific problems. The tutor adapts to your learning level.",
  },
  {
    question: "What is a learning streak?",
    answer:
      "A streak counts how many days in a row you've completed at least one lesson. Maintaining your streak earns bonus points and special badges. If you miss a day, your streak resets to zero.",
  },
  {
    question: "How do I change my avatar or display name?",
    answer:
      "Go to Settings (click the gear icon in the sidebar) to customize your profile. You can choose from our collection of fun avatars and update your display name.",
  },
  {
    question: "What should I do if something isn't working?",
    answer:
      "First, try refreshing the page. If the problem continues, ask your parent or teacher for help. They can contact our support team if needed.",
  },
];

const helpCategories = [
  {
    title: "Getting Started",
    description: "Learn the basics of using Kaelyn's Academy",
    icon: BookOpen,
    href: "/help/getting-started",
  },
  {
    title: "Video Tutorials",
    description: "Watch helpful how-to videos",
    icon: Video,
    href: "/help/videos",
  },
  {
    title: "Ask a Question",
    description: "Get help from our support team",
    icon: MessageCircle,
    href: "/contact",
  },
];

export default function HelpPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex p-3 rounded-full bg-primary/10 mb-4">
          <HelpCircle className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">How can we help?</h1>
        <p className="text-muted-foreground mt-2">
          Search our help articles or browse common questions below
        </p>
      </div>

      {/* Search */}
      <div className="max-w-xl mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search for help..."
            className="pl-10 h-12 text-lg"
          />
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-3 gap-4">
        {helpCategories.map((category) => (
          <Card key={category.title} className="hover:border-primary/50 transition-colors">
            <CardContent className="pt-6">
              <Link href={category.href} className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <category.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{category.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>
            Quick answers to common questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`faq-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Contact Support */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-8">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-xl font-semibold mb-2">Still need help?</h2>
            <p className="text-muted-foreground mb-6">
              Our support team is here to help you with any questions
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-primary" />
                <span>support@kaelyns.academy</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-primary" />
                <span>Mon-Fri, 9am-5pm EST</span>
              </div>
            </div>
            <Button asChild>
              <Link href="/contact">Contact Support</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
