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
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import {
  Search,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Send,
  Eye,
  Loader2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ConsentRequest {
  id: string;
  studentName: string;
  studentGrade: string;
  parentName: string;
  parentEmail: string;
  consentType: "data_collection" | "photo_release" | "ai_tutoring" | "third_party";
  status: "pending" | "approved" | "denied" | "expired";
  requestedAt: string;
  respondedAt?: string;
  expiresAt: string;
}

interface ConsentStats {
  pending: number;
  approved: number;
  denied: number;
  expired: number;
}

export default function ConsentManagementPage() {
  const [requests, setRequests] = useState<ConsentRequest[]>([]);
  const [stats, setStats] = useState<ConsentStats>({
    pending: 0,
    approved: 0,
    denied: 0,
    expired: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<ConsentRequest | null>(null);
  const [sendingReminder, setSendingReminder] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (typeFilter !== "all") params.set("type", typeFilter);
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`/api/admin/school/consent?${params}`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
        setStats(data.stats || { pending: 0, approved: 0, denied: 0, expired: 0 });
      } else {
        // Mock data
        setRequests([
          {
            id: "1",
            studentName: "Emma Johnson",
            studentGrade: "3",
            parentName: "Sarah Johnson",
            parentEmail: "sarah.j@email.com",
            consentType: "ai_tutoring",
            status: "pending",
            requestedAt: "2025-12-15",
            expiresAt: "2026-01-15",
          },
          {
            id: "2",
            studentName: "Liam Williams",
            studentGrade: "4",
            parentName: "Mike Williams",
            parentEmail: "mike.w@email.com",
            consentType: "data_collection",
            status: "approved",
            requestedAt: "2025-12-10",
            respondedAt: "2025-12-12",
            expiresAt: "2026-12-10",
          },
          {
            id: "3",
            studentName: "Sophia Chen",
            studentGrade: "2",
            parentName: "Wei Chen",
            parentEmail: "wei.c@email.com",
            consentType: "photo_release",
            status: "denied",
            requestedAt: "2025-12-08",
            respondedAt: "2025-12-09",
            expiresAt: "2026-12-08",
          },
          {
            id: "4",
            studentName: "Noah Davis",
            studentGrade: "5",
            parentName: "Lisa Davis",
            parentEmail: "lisa.d@email.com",
            consentType: "third_party",
            status: "pending",
            requestedAt: "2025-12-20",
            expiresAt: "2026-01-20",
          },
          {
            id: "5",
            studentName: "Olivia Brown",
            studentGrade: "1",
            parentName: "James Brown",
            parentEmail: "james.b@email.com",
            consentType: "ai_tutoring",
            status: "expired",
            requestedAt: "2025-10-01",
            expiresAt: "2025-11-01",
          },
        ]);
        setStats({ pending: 8, approved: 285, denied: 12, expired: 5 });
      }
    } catch (error) {
      console.error("Failed to fetch consent requests:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, searchQuery]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case "denied":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Denied</Badge>;
      case "expired":
        return <Badge variant="outline">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const types: Record<string, string> = {
      data_collection: "Data Collection",
      photo_release: "Photo Release",
      ai_tutoring: "AI Tutoring",
      third_party: "Third Party Sharing",
    };
    return <Badge variant="outline">{types[type] || type}</Badge>;
  };

  const handleSendReminder = async () => {
    if (!selectedRequest) return;
    setSendingReminder(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSelectedRequest(null);
    } catch (error) {
      console.error("Failed to send reminder:", error);
    } finally {
      setSendingReminder(false);
    }
  };

  const filteredRequests = requests.filter((req) =>
    req.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.parentName.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Parent Consent Management</h1>
          <p className="text-muted-foreground">
            Track and manage parental consent forms for student data.
          </p>
        </div>
        <Button>
          <Send className="mr-2 h-4 w-4" />
          Send Bulk Reminder
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">Consent granted</p>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Denied</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.denied}</div>
            <p className="text-xs text-muted-foreground">Consent refused</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.expired}</div>
            <p className="text-xs text-muted-foreground">Need renewal</p>
          </CardContent>
        </Card>
      </div>

      {/* Consent Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Consent Requests</CardTitle>
          <CardDescription>
            View and manage all parental consent requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by student or parent name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="denied">Denied</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="data_collection">Data Collection</SelectItem>
                <SelectItem value="photo_release">Photo Release</SelectItem>
                <SelectItem value="ai_tutoring">AI Tutoring</SelectItem>
                <SelectItem value="third_party">Third Party</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.studentName}</TableCell>
                  <TableCell>{request.studentGrade}</TableCell>
                  <TableCell>
                    <div>
                      <p>{request.parentName}</p>
                      <p className="text-xs text-muted-foreground">{request.parentEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(request.consentType)}</TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell>{new Date(request.requestedAt).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(request.expiresAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedRequest(request)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {request.status === "pending" && (
                        <Button variant="ghost" size="sm" title="Send reminder">
                          <Mail className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Consent Request Details</DialogTitle>
            <DialogDescription>
              View consent request information
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Student</Label>
                  <p className="font-medium">{selectedRequest.studentName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Grade</Label>
                  <p className="font-medium">{selectedRequest.studentGrade}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Parent</Label>
                  <p className="font-medium">{selectedRequest.parentName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedRequest.parentEmail}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Type</Label>
                  <p>{getTypeBadge(selectedRequest.consentType)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <p>{getStatusBadge(selectedRequest.status)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedRequest(null)}>
              Close
            </Button>
            {selectedRequest?.status === "pending" && (
              <Button onClick={handleSendReminder} disabled={sendingReminder}>
                {sendingReminder && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Reminder
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
