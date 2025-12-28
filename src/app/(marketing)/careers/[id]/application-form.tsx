"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Send, CheckCircle2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const applicationSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  linkedIn: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  portfolio: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  experience: z.enum(["0-2", "3-5", "6-10", "10+"], "Please select your experience level"),
  coverLetter: z.string().max(5000).optional(),
  heardFrom: z.string().optional(),
  workAuthorization: z.boolean().refine((val) => val === true, {
    message: "You must be authorized to work in the US",
  }),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface ApplicationFormProps {
  positionId: string;
  positionTitle: string;
}

export function ApplicationForm({ positionId, positionTitle }: ApplicationFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      workAuthorization: false,
    },
  });

  const workAuthorization = watch("workAuthorization");

  const onSubmit = (data: ApplicationFormData) => {
    startTransition(async () => {
      // In production, this would submit to an API endpoint
      // that handles file uploads and sends to an ATS
      console.log("Application submitted:", {
        ...data,
        positionId,
        positionTitle,
        resume: resumeFile?.name,
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSubmitted(true);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!validTypes.includes(file.type)) {
        alert("Please upload a PDF or Word document");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      setResumeFile(file);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="border-success/50 bg-success/5">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Application Submitted!
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Thank you for applying to the {positionTitle} position. We'll
              review your application and get back to you within 5-7 business
              days.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Application</CardTitle>
        <CardDescription>
          All fields marked with * are required
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                {...register("firstName")}
                aria-invalid={!!errors.firstName}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                {...register("lastName")}
                aria-invalid={!!errors.lastName}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          {/* Contact */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" {...register("phone")} />
            </div>
          </div>

          {/* Links */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="linkedIn">LinkedIn Profile</Label>
              <Input
                id="linkedIn"
                type="url"
                placeholder="https://linkedin.com/in/..."
                {...register("linkedIn")}
              />
              {errors.linkedIn && (
                <p className="text-sm text-destructive">
                  {errors.linkedIn.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="portfolio">Portfolio/Website</Label>
              <Input
                id="portfolio"
                type="url"
                placeholder="https://..."
                {...register("portfolio")}
              />
              {errors.portfolio && (
                <p className="text-sm text-destructive">
                  {errors.portfolio.message}
                </p>
              )}
            </div>
          </div>

          {/* Resume Upload */}
          <div className="space-y-2">
            <Label>Resume *</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
              {resumeFile ? (
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span className="text-sm">{resumeFile.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setResumeFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF or Word (max 5MB)
                  </p>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Experience */}
          <div className="space-y-2">
            <Label>Years of Experience *</Label>
            <Select onValueChange={(value) => setValue("experience", value as ApplicationFormData["experience"])}>
              <SelectTrigger>
                <SelectValue placeholder="Select experience level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-2">0-2 years</SelectItem>
                <SelectItem value="3-5">3-5 years</SelectItem>
                <SelectItem value="6-10">6-10 years</SelectItem>
                <SelectItem value="10+">10+ years</SelectItem>
              </SelectContent>
            </Select>
            {errors.experience && (
              <p className="text-sm text-destructive">
                {errors.experience.message}
              </p>
            )}
          </div>

          {/* Cover Letter */}
          <div className="space-y-2">
            <Label htmlFor="coverLetter">Cover Letter</Label>
            <Textarea
              id="coverLetter"
              {...register("coverLetter")}
              rows={6}
              placeholder="Tell us why you're interested in this role and what makes you a great fit..."
            />
            <p className="text-xs text-muted-foreground">
              Optional but recommended
            </p>
          </div>

          {/* How did you hear about us */}
          <div className="space-y-2">
            <Label>How did you hear about us?</Label>
            <Select onValueChange={(value) => setValue("heardFrom", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="indeed">Indeed</SelectItem>
                <SelectItem value="glassdoor">Glassdoor</SelectItem>
                <SelectItem value="referral">Employee Referral</SelectItem>
                <SelectItem value="website">Company Website</SelectItem>
                <SelectItem value="social">Social Media</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Work Authorization */}
          <div className="flex items-start space-x-3">
            <Checkbox
              id="workAuthorization"
              checked={workAuthorization}
              onCheckedChange={(checked) =>
                setValue("workAuthorization", checked === true)
              }
            />
            <div className="space-y-1">
              <Label
                htmlFor="workAuthorization"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                Work Authorization *
              </Label>
              <p className="text-sm text-muted-foreground">
                I am legally authorized to work in the United States
              </p>
              {errors.workAuthorization && (
                <p className="text-sm text-destructive">
                  {errors.workAuthorization.message}
                </p>
              )}
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            className="w-full gap-2"
            disabled={isPending || !resumeFile}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit Application
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            By submitting this application, you agree to our{" "}
            <a href="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </a>{" "}
            and consent to Kaelyn's Academy processing your personal data for
            recruitment purposes.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
