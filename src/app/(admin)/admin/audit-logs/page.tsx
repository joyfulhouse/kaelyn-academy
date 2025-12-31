"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  History,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  User,
  Calendar,
  Filter,
  Activity,
  Shield,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
} from "lucide-react";

interface AuditLog {
  id: string;
  actorId: string;
  actorRole: string;
  actorEmail: string | null;
  actorName: string | null;
  organizationId: string | null;
  organizationName: string | null;
  action: string;
  category: string;
  resourceType: string;
  resourceId: string | null;
  resourceName: string | null;
  description: string | null;
  metadata: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    changes?: Record<string, { from: unknown; to: unknown }>;
    reason?: string;
    ipAddress?: string;
    userAgent?: string;
  } | null;
  status: string;
  errorMessage: string | null;
  createdAt: string;
}

interface FilterStats {
  categories: string[];
  categoryStats: Array<{ category: string; count: number }>;
  actionStats: Array<{ action: string; count: number }>;
  resourceTypeStats: Array<{ resourceType: string; count: number }>;
  recentActors: Array<{
    actorId: string;
    actorEmail: string | null;
    actorName: string | null;
  }>;
}

interface AuditLogsResponse {
  logs: AuditLog[];
  total: number;
  filters: FilterStats;
}

function getStatusIcon(status: string) {
  switch (status) {
    case "success":
      return <CheckCircle className="h-4 w-4 text-success" />;
    case "failure":
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    case "pending":
      return <Clock className="h-4 w-4 text-warning" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "success":
      return "bg-success/10 text-success";
    case "failure":
      return "bg-destructive/10 text-destructive";
    case "pending":
      return "bg-warning/10 text-warning";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function getCategoryColor(category: string) {
  const colors: Record<string, string> = {
    user: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    learner:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
    organization:
      "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
    content:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    consent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
    data: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100",
    settings:
      "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100",
    auth: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100",
  };
  return colors[category] || "bg-muted text-muted-foreground";
}

function formatAction(action: string) {
  return action.replace(".", " ").replace(/_/g, " ");
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<FilterStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [resourceType, setResourceType] = useState("");
  const [status, setStatus] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const limit = 20;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", limit.toString());
      params.set("offset", ((page - 1) * limit).toString());
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      if (resourceType) params.set("resourceType", resourceType);
      if (status) params.set("status", status);

      const response = await fetch(`/api/admin/audit-logs?${params}`);
      if (response.ok) {
        const data: AuditLogsResponse = await response.json();
        setLogs(data.logs);
        setTotal(data.total);
        setFilters(data.filters);
      }
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, category, resourceType, status]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const totalPages = Math.ceil(total / limit);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setResourceType("");
    setStatus("");
    setPage(1);
  };

  if (loading && logs.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Audit Logs
          </h1>
          <p className="text-muted-foreground mt-1">
            Track all administrative actions for security and compliance
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLogs}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {filters && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <History className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{total}</p>
                  <p className="text-xs text-muted-foreground">Total Events</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {filters.categoryStats.slice(0, 3).map((stat) => (
            <Card key={stat.category}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${getCategoryColor(stat.category)}`}
                  >
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.count}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {stat.category}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search actions, resources, actors..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {filters?.categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={resourceType} onValueChange={setResourceType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Resource" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Resources</SelectItem>
                {filters?.resourceTypeStats.map((rt) => (
                  <SelectItem key={rt.resourceType} value={rt.resourceType}>
                    {rt.resourceType} ({rt.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failure">Failure</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Button type="submit">Search</Button>
            <Button type="button" variant="ghost" onClick={clearFilters}>
              Clear
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>
            Showing {logs.length} of {total} events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Status</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="w-[80px]">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <History className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-muted-foreground">No audit logs found</p>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{getStatusIcon(log.status)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className={getCategoryColor(log.category)}
                          >
                            {log.category}
                          </Badge>
                          <span className="font-medium capitalize">
                            {formatAction(log.action)}
                          </span>
                        </div>
                        {log.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {log.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">
                          {log.resourceName || log.resourceType}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {log.resourceType}
                          {log.resourceId && ` (${log.resourceId.slice(0, 8)}...)`}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {log.actorName || log.actorEmail || "Unknown"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {log.actorRole}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm">
                            {new Date(log.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(log.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedLog(log)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedLog && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getStatusIcon(selectedLog.status)}
                  <span className="capitalize">
                    {formatAction(selectedLog.action)}
                  </span>
                </DialogTitle>
                <DialogDescription>
                  {new Date(selectedLog.createdAt).toLocaleString()}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Actor
                    </p>
                    <p className="font-medium">
                      {selectedLog.actorName || selectedLog.actorEmail}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedLog.actorRole}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Resource
                    </p>
                    <p className="font-medium">
                      {selectedLog.resourceName || selectedLog.resourceType}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedLog.resourceId}
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Status
                  </p>
                  <Badge className={getStatusColor(selectedLog.status)}>
                    {selectedLog.status}
                  </Badge>
                  {selectedLog.errorMessage && (
                    <p className="text-sm text-destructive mt-1">
                      {selectedLog.errorMessage}
                    </p>
                  )}
                </div>

                {/* Description */}
                {selectedLog.description && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Description
                    </p>
                    <p>{selectedLog.description}</p>
                  </div>
                )}

                {/* Metadata */}
                {selectedLog.metadata && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Details
                    </p>

                    {/* Changes */}
                    {selectedLog.metadata.changes &&
                      Object.keys(selectedLog.metadata.changes).length > 0 && (
                        <div className="bg-muted rounded-lg p-3 space-y-2">
                          <p className="text-sm font-medium">Changes:</p>
                          {Object.entries(selectedLog.metadata.changes).map(
                            ([key, change]) => (
                              <div
                                key={key}
                                className="text-sm grid grid-cols-3 gap-2"
                              >
                                <span className="font-mono">{key}</span>
                                <span className="text-destructive line-through">
                                  {JSON.stringify(change.from)}
                                </span>
                                <span className="text-success">
                                  {JSON.stringify(change.to)}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      )}

                    {/* Reason */}
                    {selectedLog.metadata.reason && (
                      <p className="text-sm mt-2">
                        <span className="font-medium">Reason:</span>{" "}
                        {selectedLog.metadata.reason}
                      </p>
                    )}

                    {/* IP and User Agent */}
                    <div className="text-xs text-muted-foreground mt-2 space-y-1">
                      {selectedLog.metadata.ipAddress && (
                        <p>IP: {selectedLog.metadata.ipAddress}</p>
                      )}
                      {selectedLog.metadata.userAgent && (
                        <p className="line-clamp-1">
                          UA: {selectedLog.metadata.userAgent}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Organization */}
                {selectedLog.organizationName && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Organization
                    </p>
                    <p>{selectedLog.organizationName}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
