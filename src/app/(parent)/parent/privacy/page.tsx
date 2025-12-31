"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  UserX,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Download,
  ExternalLink,
  Baby,
  Calendar,
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Consent {
  id: string;
  learnerId: string | null;
  childName: string;
  childBirthdate: string;
  status: "pending" | "email_sent" | "verified" | "active" | "revoked" | "expired";
  verificationMethod: string;
  consentedAt: string | null;
  revokedAt: string | null;
  revocationReason: string | null;
  createdAt: string;
  learner: {
    id: string;
    name: string;
    gradeLevel: number;
    avatarUrl: string | null;
    isActive: boolean;
  } | null;
}

interface ConsentsData {
  consents: Consent[];
  orphanedLearners: Array<{
    id: string;
    name: string;
    gradeLevel: number;
    avatarUrl: string | null;
    isActive: boolean;
    hasConsent: boolean;
  }>;
}

const REVOCATION_REASONS = [
  { value: "no_longer_using", label: "No longer using the platform" },
  { value: "privacy_concerns", label: "Privacy concerns" },
  { value: "school_ended", label: "School year ended" },
  { value: "child_aged_out", label: "Child is now 13 or older" },
  { value: "switching_platforms", label: "Switching to another platform" },
  { value: "other", label: "Other reason" },
];

function PrivacySkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div>
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96 mt-2" />
        </div>
      </div>
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

function getGradeLevelLabel(grade: number): string {
  if (grade === 0) return "Kindergarten";
  if (grade === 1) return "1st Grade";
  if (grade === 2) return "2nd Grade";
  if (grade === 3) return "3rd Grade";
  return `${grade}th Grade`;
}

function getStatusBadge(status: string) {
  switch (status) {
    case "active":
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    case "pending":
    case "email_sent":
      return <Badge variant="secondary">Pending Verification</Badge>;
    case "revoked":
      return <Badge variant="destructive">Revoked</Badge>;
    case "expired":
      return <Badge variant="outline">Expired</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function PrivacyPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [consentsData, setConsentsData] = useState<ConsentsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Revocation dialog state
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [selectedConsent, setSelectedConsent] = useState<Consent | null>(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [revokeReasonOther, setRevokeReasonOther] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [revoking, setRevoking] = useState(false);
  const [revokeSuccess, setRevokeSuccess] = useState(false);

  // Data export state
  const [exporting, setExporting] = useState(false);

  const fetchConsents = useCallback(async () => {
    if (!session?.user) return;

    try {
      const response = await fetch("/api/parent/consents");
      if (!response.ok) {
        throw new Error("Failed to fetch consent records");
      }
      const data = await response.json();
      setConsentsData(data);
    } catch (err) {
      console.error("Error fetching consents:", err);
      setError("Failed to load consent records. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      fetchConsents();
    } else {
      setLoading(false);
    }
  }, [session, fetchConsents]);

  const handleRevokeClick = (consent: Consent) => {
    setSelectedConsent(consent);
    setRevokeReason("");
    setRevokeReasonOther("");
    setConfirmText("");
    setRevokeSuccess(false);
    setRevokeDialogOpen(true);
  };

  const handleRevokeConsent = async () => {
    if (!selectedConsent) return;

    const finalReason =
      revokeReason === "other" ? revokeReasonOther : revokeReason;

    if (!finalReason) {
      return;
    }

    if (confirmText !== selectedConsent.childName) {
      return;
    }

    setRevoking(true);

    try {
      const response = await fetch(`/api/consent?id=${selectedConsent.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: finalReason }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to revoke consent");
      }

      setRevokeSuccess(true);

      // Refresh the data
      await fetchConsents();

      // Close dialog after delay
      setTimeout(() => {
        setRevokeDialogOpen(false);
        setSelectedConsent(null);
      }, 2000);
    } catch (err) {
      console.error("Error revoking consent:", err);
      setError(
        err instanceof Error ? err.message : "Failed to revoke consent"
      );
    } finally {
      setRevoking(false);
    }
  };

  const handleExportData = async () => {
    setExporting(true);

    try {
      const response = await fetch("/api/privacy/data");
      if (!response.ok) {
        throw new Error("Failed to export data");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `kaelys-academy-data-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error exporting data:", err);
      setError("Failed to export data. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <PrivacySkeleton />;
  }

  const activeConsents =
    consentsData?.consents.filter((c) => c.status === "active") || [];
  const revokedConsents =
    consentsData?.consents.filter((c) => c.status === "revoked") || [];
  const pendingConsents =
    consentsData?.consents.filter(
      (c) => c.status === "pending" || c.status === "email_sent"
    ) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/parent">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Privacy & COPPA
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your children&apos;s privacy and consent settings
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* COPPA Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Children&apos;s Online Privacy Protection Act (COPPA)
          </CardTitle>
          <CardDescription>
            Under COPPA, you have the right to review, delete, and refuse
            further collection of your child&apos;s personal information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleExportData}
              disabled={exporting}
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Download Your Data
            </Button>
            <Button variant="outline" className="gap-2" asChild>
              <Link href="/coppa">
                <ExternalLink className="h-4 w-4" />
                Read Our COPPA Policy
              </Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Questions about your child&apos;s privacy?{" "}
            <a
              href="mailto:privacy@kaelyns.academy"
              className="text-primary hover:underline"
            >
              Contact our privacy team
            </a>
          </p>
        </CardContent>
      </Card>

      {/* Active Consents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Active Consents
          </CardTitle>
          <CardDescription>
            Children with verified parental consent
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeConsents.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No active consents found.{" "}
              <Link href="/consent" className="text-primary hover:underline">
                Add a child
              </Link>{" "}
              to get started.
            </p>
          ) : (
            <div className="space-y-4">
              {activeConsents.map((consent) => (
                <div
                  key={consent.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      {consent.learner?.avatarUrl ? (
                        <AvatarImage src={consent.learner.avatarUrl} />
                      ) : (
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {consent.childName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{consent.childName}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        {consent.learner && (
                          <span className="flex items-center gap-1">
                            <Baby className="h-3 w-3" />
                            {getGradeLevelLabel(consent.learner.gradeLevel)}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Born{" "}
                          {new Date(consent.childBirthdate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(consent.status)}
                        {consent.consentedAt && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Verified{" "}
                            {new Date(consent.consentedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRevokeClick(consent)}
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    Revoke Consent
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Consents */}
      {pendingConsents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              Pending Verification
            </CardTitle>
            <CardDescription>
              Consents awaiting email verification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingConsents.map((consent) => (
                <div
                  key={consent.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-950/20"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-yellow-100 text-yellow-700">
                        {consent.childName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{consent.childName}</h3>
                      <p className="text-sm text-muted-foreground">
                        Check your email to complete verification
                      </p>
                      {getStatusBadge(consent.status)}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/consent/verify`}>Complete Verification</Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Revoked Consents */}
      {revokedConsents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-muted-foreground">
              <UserX className="h-5 w-5" />
              Revoked Consents
            </CardTitle>
            <CardDescription>
              Previously revoked consents (data has been deactivated)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revokedConsents.map((consent) => (
                <div
                  key={consent.id}
                  className="flex items-center justify-between p-4 border rounded-lg opacity-60"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 grayscale">
                      <AvatarFallback className="bg-muted text-muted-foreground">
                        {consent.childName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{consent.childName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {consent.revocationReason || "Consent revoked"}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(consent.status)}
                        {consent.revokedAt && (
                          <span className="text-xs text-muted-foreground">
                            Revoked{" "}
                            {new Date(consent.revokedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Revocation Dialog */}
      <AlertDialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Revoke Parental Consent
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4 text-left">
                {revokeSuccess ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <CheckCircle2 className="h-12 w-12 text-green-600 mb-4" />
                    <p className="font-medium text-foreground">
                      Consent Revoked Successfully
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {selectedConsent?.childName}&apos;s account has been
                      deactivated and their data will be deleted within 30 days.
                    </p>
                  </div>
                ) : (
                  <>
                    <p>
                      You are about to revoke consent for{" "}
                      <strong>{selectedConsent?.childName}</strong>. This will:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Deactivate their learning account</li>
                      <li>Stop all data collection immediately</li>
                      <li>Begin the data deletion process (30 days)</li>
                      <li>Remove access to learning materials</li>
                    </ul>

                    <div className="space-y-3 pt-2">
                      <div>
                        <Label htmlFor="reason">
                          Reason for revocation (required)
                        </Label>
                        <Select
                          value={revokeReason}
                          onValueChange={setRevokeReason}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select a reason" />
                          </SelectTrigger>
                          <SelectContent>
                            {REVOCATION_REASONS.map((reason) => (
                              <SelectItem key={reason.value} value={reason.value}>
                                {reason.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {revokeReason === "other" && (
                        <div>
                          <Label htmlFor="otherReason">Please specify</Label>
                          <Textarea
                            id="otherReason"
                            value={revokeReasonOther}
                            onChange={(e) => setRevokeReasonOther(e.target.value)}
                            placeholder="Tell us why you're revoking consent..."
                            className="mt-1"
                          />
                        </div>
                      )}

                      <div>
                        <Label htmlFor="confirmName">
                          Type &quot;{selectedConsent?.childName}&quot; to
                          confirm
                        </Label>
                        <Input
                          id="confirmName"
                          value={confirmText}
                          onChange={(e) => setConfirmText(e.target.value)}
                          placeholder="Enter child's name"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          {!revokeSuccess && (
            <AlertDialogFooter>
              <AlertDialogCancel disabled={revoking}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRevokeConsent}
                disabled={
                  revoking ||
                  !revokeReason ||
                  (revokeReason === "other" && !revokeReasonOther) ||
                  confirmText !== selectedConsent?.childName
                }
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {revoking ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Revoking...
                  </>
                ) : (
                  "Revoke Consent"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
