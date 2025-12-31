"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  BookOpen,
  GraduationCap,
  Sparkles,
  ExternalLink,
  Filter,
  Check,
  X,
  Loader2,
  RefreshCw,
  Info,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LearnerInfo {
  id: string;
  name: string;
  gradeLevel: number;
  avatarUrl: string | null;
}

interface ContentMetadata {
  subjectName?: string;
  gradeLevel?: number;
  estimatedMinutes?: number;
  difficultyLevel?: number;
  externalUrl?: string;
  featureName?: string;
}

interface ApprovalRequest {
  id: string;
  learnerId: string;
  contentType: string;
  contentId: string | null;
  contentTitle: string;
  contentDescription: string | null;
  contentMetadata: ContentMetadata | null;
  status: string;
  requestReason: string | null;
  responseReason: string | null;
  respondedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  learner: LearnerInfo | null;
}

interface ApprovalCounts {
  pending: number;
  approved: number;
  denied: number;
  expired: number;
  total: number;
}

const contentTypeIcons: Record<string, React.ReactNode> = {
  subject: <GraduationCap className="h-5 w-5" />,
  unit: <BookOpen className="h-5 w-5" />,
  lesson: <BookOpen className="h-5 w-5" />,
  activity: <Sparkles className="h-5 w-5" />,
  feature: <Sparkles className="h-5 w-5" />,
  external_link: <ExternalLink className="h-5 w-5" />,
};

const contentTypeLabels: Record<string, string> = {
  subject: "Subject",
  unit: "Unit",
  lesson: "Lesson",
  activity: "Activity",
  feature: "Feature",
  external_link: "External Link",
};

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/30",
  approved: "bg-success/10 text-success border-success/30",
  denied: "bg-destructive/10 text-destructive border-destructive/30",
  expired: "bg-muted text-muted-foreground border-muted",
};

export default function ParentApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [counts, setCounts] = useState<ApprovalCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [selectedApprovals, setSelectedApprovals] = useState<Set<string>>(new Set());
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "deny">("approve");
  const [actionReason, setActionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [singleActionId, setSingleActionId] = useState<string | null>(null);

  const fetchApprovals = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== "all") {
        params.set("status", statusFilter);
      }
      const response = await fetch(`/api/parent/approvals?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch approvals");
      const data = await response.json();
      setApprovals(data.approvals);
      setCounts(data.counts);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load approvals");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  const handleSelectAll = () => {
    const pendingApprovals = approvals.filter((a) => a.status === "pending");
    if (selectedApprovals.size === pendingApprovals.length) {
      setSelectedApprovals(new Set());
    } else {
      setSelectedApprovals(new Set(pendingApprovals.map((a) => a.id)));
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedApprovals);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedApprovals(newSelected);
  };

  const openActionDialog = (type: "approve" | "deny", singleId?: string) => {
    setActionType(type);
    setSingleActionId(singleId || null);
    setActionReason("");
    setActionDialogOpen(true);
  };

  const handleAction = async () => {
    setIsSubmitting(true);
    try {
      const ids = singleActionId ? [singleActionId] : Array.from(selectedApprovals);
      const status = actionType === "approve" ? "approved" : "denied";

      if (ids.length === 1) {
        // Single update
        const response = await fetch("/api/parent/approvals", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: ids[0],
            status,
            responseReason: actionReason || undefined,
          }),
        });
        if (!response.ok) throw new Error("Failed to update approval");
      } else {
        // Bulk update
        const response = await fetch("/api/parent/approvals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ids,
            status,
            responseReason: actionReason || undefined,
          }),
        });
        if (!response.ok) throw new Error("Failed to update approvals");
      }

      setActionDialogOpen(false);
      setSelectedApprovals(new Set());
      setSingleActionId(null);
      await fetchApprovals();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const pendingApprovals = approvals.filter((a) => a.status === "pending");
  const allPendingSelected =
    pendingApprovals.length > 0 && selectedApprovals.size === pendingApprovals.length;

  if (loading && approvals.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading approval requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/parent"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Clock className="h-8 w-8 text-primary" />
              Content Approvals
            </h1>
            <p className="text-muted-foreground mt-1">
              Review and approve content access requests from your children
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => fetchApprovals()}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      {counts && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card
            className={`cursor-pointer transition-all ${statusFilter === "pending" ? "ring-2 ring-warning" : ""}`}
            onClick={() => setStatusFilter("pending")}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-warning/10">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{counts.pending}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all ${statusFilter === "approved" ? "ring-2 ring-success" : ""}`}
            onClick={() => setStatusFilter("approved")}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-success/10">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{counts.approved}</p>
                  <p className="text-sm text-muted-foreground">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all ${statusFilter === "denied" ? "ring-2 ring-destructive" : ""}`}
            onClick={() => setStatusFilter("denied")}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-destructive/10">
                  <XCircle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{counts.denied}</p>
                  <p className="text-sm text-muted-foreground">Denied</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all ${statusFilter === "all" ? "ring-2 ring-primary" : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-muted">
                  <Filter className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{counts.total}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Bulk Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                <TabsList>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="approved">Approved</TabsTrigger>
                  <TabsTrigger value="denied">Denied</TabsTrigger>
                  <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {statusFilter === "pending" && pendingApprovals.length > 0 && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={allPendingSelected}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all" className="text-sm cursor-pointer">
                  Select all ({pendingApprovals.length})
                </Label>
                {selectedApprovals.size > 0 && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="ml-4 gap-1 text-success hover:text-success"
                      onClick={() => openActionDialog("approve")}
                    >
                      <Check className="h-4 w-4" />
                      Approve ({selectedApprovals.size})
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 text-destructive hover:text-destructive"
                      onClick={() => openActionDialog("deny")}
                    >
                      <X className="h-4 w-4" />
                      Deny ({selectedApprovals.size})
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Approval List */}
      {approvals.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Approval Requests</h3>
              <p className="text-muted-foreground">
                {statusFilter === "pending"
                  ? "There are no pending content approval requests at this time."
                  : `No ${statusFilter} requests found.`}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                When your children request access to new content, you'll see them here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {approvals.map((approval) => (
            <Card key={approval.id} className="overflow-hidden">
              <div className="flex">
                {/* Checkbox for pending items */}
                {approval.status === "pending" && (
                  <div className="flex items-center justify-center px-4 border-r border-border bg-muted/30">
                    <Checkbox
                      checked={selectedApprovals.has(approval.id)}
                      onCheckedChange={() => handleSelectOne(approval.id)}
                    />
                  </div>
                )}

                <div className="flex-1">
                  <CardHeader className="pb-2">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex items-start gap-4">
                        {/* Content Type Icon */}
                        <div className="p-3 rounded-lg bg-primary/10 text-primary shrink-0">
                          {contentTypeIcons[approval.contentType] || (
                            <BookOpen className="h-5 w-5" />
                          )}
                        </div>

                        <div>
                          <CardTitle className="text-lg">
                            {approval.contentTitle}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {contentTypeLabels[approval.contentType] || approval.contentType}
                            {approval.contentMetadata?.subjectName && (
                              <> in {approval.contentMetadata.subjectName}</>
                            )}
                          </CardDescription>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className={statusColors[approval.status]}
                        >
                          {approval.status.charAt(0).toUpperCase() +
                            approval.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-2">
                    <div className="space-y-4">
                      {/* Learner Info */}
                      {approval.learner && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={approval.learner.avatarUrl || undefined} />
                            <AvatarFallback className="bg-role-learner text-role-learner-foreground">
                              {getInitials(approval.learner.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{approval.learner.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Grade{" "}
                              {approval.learner.gradeLevel === 0
                                ? "K"
                                : approval.learner.gradeLevel}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Content Description */}
                      {approval.contentDescription && (
                        <p className="text-sm text-muted-foreground">
                          {approval.contentDescription}
                        </p>
                      )}

                      {/* Content Metadata */}
                      {approval.contentMetadata && (
                        <div className="flex flex-wrap gap-2">
                          {approval.contentMetadata.estimatedMinutes && (
                            <Badge variant="secondary">
                              ~{approval.contentMetadata.estimatedMinutes} min
                            </Badge>
                          )}
                          {approval.contentMetadata.difficultyLevel && (
                            <Badge variant="secondary">
                              Difficulty: {approval.contentMetadata.difficultyLevel}/5
                            </Badge>
                          )}
                          {approval.contentMetadata.gradeLevel !== undefined && (
                            <Badge variant="secondary">
                              Grade Level:{" "}
                              {approval.contentMetadata.gradeLevel === 0
                                ? "K"
                                : approval.contentMetadata.gradeLevel}
                            </Badge>
                          )}
                          {approval.contentMetadata.externalUrl && (
                            <Badge variant="secondary" className="gap-1">
                              <ExternalLink className="h-3 w-3" />
                              External Link
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Request Reason */}
                      {approval.requestReason && (
                        <div className="p-3 rounded-lg bg-info/10 border border-info/20">
                          <div className="flex items-start gap-2">
                            <Info className="h-4 w-4 text-info mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-info">
                                Child's Message
                              </p>
                              <p className="text-sm text-muted-foreground">
                                "{approval.requestReason}"
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Response Reason (for processed requests) */}
                      {approval.responseReason && (
                        <div className="p-3 rounded-lg bg-muted">
                          <p className="text-sm font-medium">Your Response</p>
                          <p className="text-sm text-muted-foreground">
                            "{approval.responseReason}"
                          </p>
                        </div>
                      )}

                      {/* Timestamps and Actions */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
                        <div className="text-sm text-muted-foreground">
                          Requested: {formatDate(approval.createdAt)}
                          {approval.respondedAt && (
                            <>
                              {" "}
                              | Responded: {formatDate(approval.respondedAt)}
                            </>
                          )}
                          {approval.expiresAt && approval.status === "pending" && (
                            <>
                              {" "}
                              | Expires: {formatDate(approval.expiresAt)}
                            </>
                          )}
                        </div>

                        {/* Action Buttons for Pending */}
                        {approval.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 text-success hover:text-success hover:bg-success/10"
                              onClick={() => openActionDialog("approve", approval.id)}
                            >
                              <Check className="h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => openActionDialog("deny", approval.id)}
                            >
                              <X className="h-4 w-4" />
                              Deny
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Info Box */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Content approval is enabled when "Require Approval for New Content" is turned on in{" "}
          <Link href="/parent/controls" className="underline hover:text-primary">
            Parental Controls
          </Link>
          . When enabled, your children will need your approval to access new subjects, lessons,
          or features.
        </AlertDescription>
      </Alert>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve Content Access" : "Deny Content Access"}
            </DialogTitle>
            <DialogDescription>
              {singleActionId
                ? actionType === "approve"
                  ? "Your child will be able to access this content immediately."
                  : "Your child will not be able to access this content."
                : actionType === "approve"
                  ? `You are approving ${selectedApprovals.size} content request(s).`
                  : `You are denying ${selectedApprovals.size} content request(s).`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">
                {actionType === "approve" ? "Message (Optional)" : "Reason (Optional)"}
              </Label>
              <Textarea
                id="reason"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder={
                  actionType === "approve"
                    ? "Add an optional message for your child..."
                    : "Explain why you're denying this request..."
                }
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={isSubmitting}
              className={
                actionType === "approve"
                  ? "bg-success hover:bg-success/90"
                  : "bg-destructive hover:bg-destructive/90"
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : actionType === "approve" ? (
                "Approve"
              ) : (
                "Deny"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
