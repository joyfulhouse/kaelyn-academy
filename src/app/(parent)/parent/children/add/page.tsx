"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  UserPlus,
  AlertCircle,
  CheckCircle,
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Mock existing children names for uniqueness check
const existingChildren = ["Emma Johnson", "Liam Johnson"];

function generateSlug(firstName: string, middleName: string, existingFirstNames: string[]): string {
  const slug = firstName.toLowerCase();
  const hasDuplicate = existingFirstNames.some(name =>
    name.toLowerCase() === firstName.toLowerCase()
  );

  if (hasDuplicate && middleName) {
    return `${slug}-${middleName[0].toLowerCase()}`;
  }

  return slug;
}

export default function AddChildPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const existingFirstNames = existingChildren.map(name => name.split(" ")[0]);
  const hasDuplicateFirstName = existingFirstNames.some(
    name => name.toLowerCase() === firstName.toLowerCase()
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    if (!firstName.trim() || !lastName.trim() || !gradeLevel || !birthYear) {
      setError("Please fill in all required fields.");
      return;
    }

    // Check for name uniqueness
    const fullName = middleName
      ? `${firstName} ${middleName} ${lastName}`
      : `${firstName} ${lastName}`;

    if (existingChildren.some(name => name.toLowerCase() === fullName.toLowerCase())) {
      setError("A child with this name already exists. Please use a different name or add a middle name.");
      return;
    }

    // Check if duplicate first name requires middle name
    if (hasDuplicateFirstName && !middleName.trim()) {
      setError("Another child has the same first name. Please add a middle name to distinguish them.");
      return;
    }

    setIsSubmitting(true);

    try {
      // In production, this would create the child in the database
      const slug = generateSlug(firstName, middleName, existingFirstNames);
      console.log("Creating child:", { firstName, middleName, lastName, gradeLevel, birthYear, slug });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Redirect to the new child's profile
      router.push(`/parent/children/${slug}`);
    } catch {
      setError("Failed to add child. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const birthYears = Array.from({ length: 18 }, (_, i) => currentYear - 5 - i);
  const grades = [
    { value: "K", label: "Kindergarten" },
    { value: "1", label: "1st Grade" },
    { value: "2", label: "2nd Grade" },
    { value: "3", label: "3rd Grade" },
    { value: "4", label: "4th Grade" },
    { value: "5", label: "5th Grade" },
    { value: "6", label: "6th Grade" },
    { value: "7", label: "7th Grade" },
    { value: "8", label: "8th Grade" },
    { value: "9", label: "9th Grade" },
    { value: "10", label: "10th Grade" },
    { value: "11", label: "11th Grade" },
    { value: "12", label: "12th Grade" },
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/parent/children">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Add Child</h1>
          <p className="text-muted-foreground">
            Create a learner account for your child
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Child Information
          </CardTitle>
          <CardDescription>
            Enter your child&apos;s details to create their learning account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Emma"
                  required
                />
                {hasDuplicateFirstName && (
                  <p className="text-xs text-amber-600">
                    Another child has this first name. A middle name is required.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="middleName">
                  Middle Name {hasDuplicateFirstName ? "*" : "(Optional)"}
                </Label>
                <Input
                  id="middleName"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  placeholder="Rose"
                  required={hasDuplicateFirstName}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Johnson"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="gradeLevel">Grade Level *</Label>
                <Select value={gradeLevel} onValueChange={setGradeLevel} required>
                  <SelectTrigger id="gradeLevel">
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map((grade) => (
                      <SelectItem key={grade.value} value={grade.value}>
                        {grade.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthYear">Birth Year *</Label>
                <Select value={birthYear} onValueChange={setBirthYear} required>
                  <SelectTrigger id="birthYear">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {birthYears.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-700 dark:text-blue-300">
                    COPPA Compliance
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    By adding your child, you confirm you are their parent or legal guardian
                    and consent to their use of Kaelyn&apos;s Academy in accordance with our
                    Privacy Policy and Terms of Service.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" asChild className="flex-1">
                <Link href="/parent/children">Cancel</Link>
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Child"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
