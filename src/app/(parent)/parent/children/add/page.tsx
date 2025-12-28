"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  UserPlus,
  AlertCircle,
  CheckCircle,
  Loader2,
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

interface ExistingChild {
  id: string;
  name: string;
  slug: string;
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
  const [isLoading, setIsLoading] = useState(true);
  const [existingChildren, setExistingChildren] = useState<ExistingChild[]>([]);

  // Fetch existing children to check for duplicates
  useEffect(() => {
    async function fetchChildren() {
      try {
        const response = await fetch("/api/parent/children");
        if (response.ok) {
          const data = await response.json();
          setExistingChildren(data.children || []);
        }
      } catch (err) {
        console.error("Failed to fetch existing children:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchChildren();
  }, []);

  const existingFirstNames = existingChildren.map(child => child.name.split(" ")[0]);
  const hasDuplicateFirstName = firstName.trim() !== "" && existingFirstNames.some(
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

    // Check if duplicate first name requires middle name
    if (hasDuplicateFirstName && !middleName.trim()) {
      setError("Another child has the same first name. Please add a middle name to distinguish them.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/parent/children", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          middleName: middleName.trim() || undefined,
          lastName: lastName.trim(),
          gradeLevel,
          birthYear,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to add child. Please try again.");
        return;
      }

      // Redirect to the new child's profile using the slug from the API
      router.push(`/parent/children/${data.child.slug}`);
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
                  <p className="text-xs text-warning">
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

            <div className="p-4 bg-info/10 rounded-lg border border-info/20">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-info mt-0.5" />
                <div>
                  <h4 className="font-medium text-info">
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
