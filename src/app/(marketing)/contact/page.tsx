import { Metadata } from "next";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  Building2,
  HelpCircle,
  Users,
} from "lucide-react";
import { ContactForm } from "@/components/marketing/contact-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Contact Us | Kaelyn's Academy",
  description:
    "Get in touch with Kaelyn's Academy. We're here to help with questions about our K-12 educational platform, school partnerships, technical support, and more.",
};

const contactMethods = [
  {
    icon: Mail,
    title: "Email Us",
    description: "For general inquiries and support",
    value: "hello@kaelyns.academy",
    href: "mailto:hello@kaelyns.academy",
  },
  {
    icon: Phone,
    title: "Call Us",
    description: "Mon-Fri, 9am-5pm PST",
    value: "(555) 123-4567",
    href: "tel:+15551234567",
  },
  {
    icon: MapPin,
    title: "Visit Us",
    description: "Our headquarters",
    value: "San Francisco, CA",
    href: null,
  },
  {
    icon: Clock,
    title: "Response Time",
    description: "We aim to respond within",
    value: "24 hours",
    href: null,
  },
];

const inquiryTypes = [
  {
    icon: HelpCircle,
    title: "General Support",
    description:
      "Questions about your account, billing, or using the platform? Our support team is ready to help.",
  },
  {
    icon: Building2,
    title: "School Partnerships",
    description:
      "Interested in bringing Kaelyn's Academy to your school or district? Let's discuss how we can work together.",
  },
  {
    icon: Users,
    title: "Press & Media",
    description:
      "For press inquiries, interview requests, or media resources, reach out to our communications team.",
  },
  {
    icon: MessageSquare,
    title: "Feedback & Suggestions",
    description:
      "Have ideas for improving our platform? We love hearing from our community and continuously improving.",
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Get in Touch
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Have a question or want to learn more about Kaelyn's Academy? We'd
            love to hear from you. Our team is here to help.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {contactMethods.map((method) => (
              <Card key={method.title}>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-3 bg-primary/10 rounded-lg mb-4">
                      <method.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">
                      {method.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {method.description}
                    </p>
                    {method.href ? (
                      <a
                        href={method.href}
                        className="text-primary hover:underline font-medium"
                      >
                        {method.value}
                      </a>
                    ) : (
                      <span className="font-medium text-foreground">
                        {method.value}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator className="max-w-6xl mx-auto" />

      {/* Main Contact Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Send Us a Message
              </h2>
              <p className="text-muted-foreground mb-8">
                Fill out the form below and we'll get back to you as soon as
                possible.
              </p>
              <ContactForm />
            </div>

            {/* Inquiry Types */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                How Can We Help?
              </h2>
              <p className="text-muted-foreground mb-8">
                Choose the topic that best matches your inquiry for faster
                routing.
              </p>
              <div className="space-y-4">
                {inquiryTypes.map((type) => (
                  <Card key={type.title}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-lg">
                          <type.icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <CardTitle className="text-lg">{type.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{type.description}</CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Teaser */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground mb-8">
            Can't find what you're looking for? Check our FAQ or reach out
            directly.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 text-left">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Is Kaelyn's Academy free for families?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Yes! Kaelyn's Academy is completely free for individual
                  families. We believe every child deserves access to quality
                  education.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  What grade levels do you support?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  We support students from Kindergarten through 12th grade, with
                  age-appropriate content and interfaces for each level.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Is my child's data safe?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Absolutely. We're fully COPPA compliant and never sell student
                  data. See our Privacy Policy for details.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Can schools use Kaelyn's Academy?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Yes! We offer special plans for schools and districts with
                  classroom management tools, analytics, and more.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
