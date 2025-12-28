import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  Building2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  openPositions,
  getPositionById,
  formatSalaryRange,
} from "@/data/careers";
import { ApplicationForm } from "./application-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const position = getPositionById(id);

  if (!position) {
    return {
      title: "Position Not Found | Kaelyn's Academy",
    };
  }

  return {
    title: `${position.title} | Careers | Kaelyn's Academy`,
    description: position.description,
  };
}

export async function generateStaticParams() {
  return openPositions.map((position) => ({
    id: position.id,
  }));
}

export default async function CareerDetailPage({ params }: PageProps) {
  const { id } = await params;
  const position = getPositionById(id);

  if (!position) {
    notFound();
  }

  const postedDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(position.postedAt);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/careers"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to all positions
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                {position.title}
              </h1>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className="gap-1">
                  <Building2 className="h-3 w-3" />
                  {position.department}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <MapPin className="h-3 w-3" />
                  {position.location}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {position.type}
                </Badge>
                {position.salary && (
                  <Badge variant="outline" className="gap-1">
                    <DollarSign className="h-3 w-3" />
                    {formatSalaryRange(position.salary)}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Posted on {postedDate}
              </p>
            </div>
            <a href="#apply">
              <Button size="lg" className="gap-2 shrink-0">
                Apply Now
                <Sparkles className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About */}
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  About this role
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {position.description}
                </p>
              </div>

              {/* Responsibilities */}
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  What you'll do
                </h2>
                <ul className="space-y-3">
                  {position.responsibilities.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Requirements */}
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  What we're looking for
                </h2>
                <ul className="space-y-3">
                  {position.requirements.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Nice to have */}
              {position.niceToHave && position.niceToHave.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    Nice to have
                  </h2>
                  <ul className="space-y-3">
                    {position.niceToHave.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Sparkles className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Department</p>
                    <p className="font-medium">{position.department}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{position.location}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Employment Type</p>
                    <p className="font-medium">{position.type}</p>
                  </div>
                  {position.salary && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Salary Range
                        </p>
                        <p className="font-medium">
                          {formatSalaryRange(position.salary)}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-2">
                    Why Kaelyn's Academy?
                  </h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Remote-first culture</li>
                    <li>• Competitive salary + equity</li>
                    <li>• Unlimited PTO</li>
                    <li>• $2,000/year learning budget</li>
                    <li>• Full health benefits</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Separator className="max-w-4xl mx-auto" />

      {/* Application Form */}
      <section id="apply" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Apply for this position
            </h2>
            <p className="text-muted-foreground">
              We'd love to hear from you. Fill out the form below and we'll be
              in touch soon.
            </p>
          </div>
          <ApplicationForm positionId={position.id} positionTitle={position.title} />
        </div>
      </section>
    </div>
  );
}
