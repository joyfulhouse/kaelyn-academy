"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Flag,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageSquare,
  FileText,
  Eye,
  Loader2,
  Search,
  Clock,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

interface ModerationItem {
  id: string;
  type: "ai_response" | "user_content" | "report";
  content: string;
  context: string;
  flagReason: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "pending" | "approved" | "rejected" | "escalated";
  reportedBy?: string;
  reportedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

interface ModerationStats {
  pending: number;
  reviewedToday: number;
  escalated: number;
  autoApproved: number;
}

export default function ModerationPage() {
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [stats, setStats] = useState<ModerationStats>({
    pending: 0,
    reviewedToday: 0,
    escalated: 0,
    autoApproved: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<ModerationItem | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      params.set("status", activeTab);
      if (searchQuery) params.set("search", searchQuery);
      if (typeFilter !== "all") params.set("type", typeFilter);

      const res = await fetch(`/api/admin/moderation?${params}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
        setStats(data.stats || { pending: 0, reviewedToday: 0, escalated: 0, autoApproved: 0 });
      } else {
        // Mock data
        setItems([
          {
            id: "1",
            type: "ai_response",
            content: "This AI response was flagged for potential age-inappropriate content.",
            context: "Math lesson for grade 3",
            flagReason: "Content filter triggered",
            severity: "medium",
            status: "pending",
            reportedAt: new Date().toISOString(),
          },
          {
            id: "2",
            type: "user_content",
            content: "User submitted content that needs review.",
            context: "Discussion forum post",
            flagReason: "User report",
            severity: "low",
            status: "pending",
            reportedBy: "parent@example.com",
            reportedAt: new Date().toISOString(),
          },
        ]);
        setStats({ pending: 12, reviewedToday: 45, escalated: 2, autoApproved: 156 });
      }
    } catch (error) {
      console.error("Failed to fetch moderation items:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery, typeFilter]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleAction = async (action: "approve" | "reject" | "escalate") => {
    if (!selectedItem) return;
    setProcessing(true);
    try {
      await fetch(`/api/admin/moderation/${selectedItem.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note: reviewNote }),
      });
      setSelectedItem(null);
      setReviewNote("");
      fetchItems();
    } catch (error) {
      console.error("Failed to process moderation item:", error);
    } finally {
      setProcessing(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
      case "high":
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case "low":
        return <Badge className="bg-blue-100 text-blue-800">Low</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "ai_response":
        return <MessageSquare className="h-4 w-4" />;
      case "user_content":
        return <FileText className="h-4 w-4" />;
      case "report":
        return <Flag className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Content Moderation</h1>
        <p className="text-muted-foreground">
          Review and moderate flagged content. Approve, reject, or escalate items for further review.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reviewed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.reviewedToday}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Escalated</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.escalated}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto-Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.autoApproved}</div>
          </CardContent>
        </Card>
      </div>

      {/* Moderation Queue */}
      <Card>
        <CardHeader>
          <CardTitle>Moderation Queue</CardTitle>
          <CardDescription>
            Review flagged content and take appropriate action
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
                <TabsTrigger value="escalated">Escalated</TabsTrigger>
              </TabsList>
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="ai_response">AI Response</SelectItem>
                    <SelectItem value="user_content">User Content</SelectItem>
                    <SelectItem value="report">User Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value={activeTab} className="mt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Reported</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No items in this queue
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(item.type)}
                            <span className="capitalize">{item.type.replace("_", " ")}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {item.content}
                        </TableCell>
                        <TableCell>{item.flagReason}</TableCell>
                        <TableCell>{getSeverityBadge(item.severity)}</TableCell>
                        <TableCell>
                          {new Date(item.reportedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedItem(item)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Content</DialogTitle>
            <DialogDescription>
              Review the flagged content and take appropriate action
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {getTypeIcon(selectedItem.type)}
                  <span className="capitalize font-medium">
                    {selectedItem.type.replace("_", " ")}
                  </span>
                </div>
                {getSeverityBadge(selectedItem.severity)}
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Content:</p>
                <p>{selectedItem.content}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Context:</p>
                <p className="text-muted-foreground">{selectedItem.context}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Flag Reason:</p>
                <p className="text-muted-foreground">{selectedItem.flagReason}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Review Note:</p>
                <Textarea
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="Add a note about your decision..."
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => handleAction("escalate")}
              disabled={processing}
            >
              <AlertTriangle className="h-4 w-4 mr-1" />
              Escalate
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleAction("reject")}
              disabled={processing}
            >
              {processing ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4 mr-1" />
              )}
              Reject
            </Button>
            <Button
              onClick={() => handleAction("approve")}
              disabled={processing}
            >
              {processing ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-1" />
              )}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
