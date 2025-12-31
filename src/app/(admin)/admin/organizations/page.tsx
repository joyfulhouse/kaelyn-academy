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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  MoreHorizontal,
  Plus,
  Building2,
  Users,
  School,
  Home,
  Pencil,
  Trash2,
  ExternalLink,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Globe,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Organization {
  id: string;
  name: string;
  slug: string;
  type: "family" | "school" | "district";
  logoUrl: string | null;
  primaryColor: string | null;
  customDomain: string | null;
  subscriptionTier: string | null;
  subscriptionExpiresAt: string | null;
  settings: {
    allowTeacherInvites?: boolean;
    maxLearners?: number;
    enabledSubjects?: string[];
    enabledGrades?: number[];
  } | null;
  createdAt: string;
  updatedAt: string;
  userCount: number;
  isExpired: boolean;
}

interface OrgStats {
  total: number;
  families: number;
  schools: number;
  districts: number;
  freeTier: number;
  paidTier: number;
  expiringSoon: number;
}

interface FormData {
  name: string;
  slug: string;
  type: "family" | "school" | "district";
  logoUrl: string;
  primaryColor: string;
  customDomain: string;
  subscriptionTier: "free" | "paid";
  maxLearners: string;
  allowTeacherInvites: boolean;
}

const defaultFormData: FormData = {
  name: "",
  slug: "",
  type: "family",
  logoUrl: "",
  primaryColor: "#10b981",
  customDomain: "",
  subscriptionTier: "free",
  maxLearners: "10",
  allowTeacherInvites: true,
};

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function OrgTypeBadge({ type }: { type: string }) {
  switch (type) {
    case "family":
      return (
        <Badge variant="outline" className="gap-1">
          <Home className="h-3 w-3" />
          Family
        </Badge>
      );
    case "school":
      return (
        <Badge variant="secondary" className="gap-1">
          <School className="h-3 w-3" />
          School
        </Badge>
      );
    case "district":
      return (
        <Badge className="gap-1 bg-purple-100 text-purple-800">
          <Building2 className="h-3 w-3" />
          District
        </Badge>
      );
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
}

function TierBadge({
  tier,
  isExpired,
}: {
  tier: string | null;
  isExpired: boolean;
}) {
  if (isExpired) {
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertTriangle className="h-3 w-3" />
        Expired
      </Badge>
    );
  }

  if (tier === "paid") {
    return (
      <Badge className="gap-1 bg-green-100 text-green-800">
        <CheckCircle2 className="h-3 w-3" />
        Paid
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-1">
      Free
    </Badge>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function AdminOrganizationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [tierFilter, setTierFilter] = useState<string>("");
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [stats, setStats] = useState<OrgStats>({
    total: 0,
    families: 0,
    schools: 0,
    districts: 0,
    freeTier: 0,
    paidTier: 0,
    expiringSoon: 0,
  });

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchOrganizations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (typeFilter) params.set("type", typeFilter);
      if (tierFilter) params.set("tier", tierFilter);

      const response = await fetch(
        `/api/admin/organizations?${params.toString()}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch organizations");
      }
      const data = await response.json();
      setOrganizations(data.organizations);
      setStats(data.stats);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load organizations"
      );
    } finally {
      setLoading(false);
    }
  }, [searchQuery, typeFilter, tierFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrganizations();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchOrganizations]);

  const handleCreate = async () => {
    setSubmitting(true);
    setFormError(null);
    try {
      const response = await fetch("/api/admin/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug || generateSlug(formData.name),
          type: formData.type,
          logoUrl: formData.logoUrl || null,
          primaryColor: formData.primaryColor || null,
          customDomain: formData.customDomain || null,
          subscriptionTier: formData.subscriptionTier,
          settings: {
            maxLearners: parseInt(formData.maxLearners) || 10,
            allowTeacherInvites: formData.allowTeacherInvites,
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create organization");
      }

      setCreateDialogOpen(false);
      setFormData(defaultFormData);
      fetchOrganizations();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to create organization"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedOrg) return;

    setSubmitting(true);
    setFormError(null);
    try {
      const response = await fetch(
        `/api/admin/organizations/${selectedOrg.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            slug: formData.slug,
            type: formData.type,
            logoUrl: formData.logoUrl || null,
            primaryColor: formData.primaryColor || null,
            customDomain: formData.customDomain || null,
            subscriptionTier: formData.subscriptionTier,
            settings: {
              maxLearners: parseInt(formData.maxLearners) || 10,
              allowTeacherInvites: formData.allowTeacherInvites,
            },
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update organization");
      }

      setEditDialogOpen(false);
      setSelectedOrg(null);
      setFormData(defaultFormData);
      fetchOrganizations();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to update organization"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedOrg) return;

    setSubmitting(true);
    setFormError(null);
    try {
      const response = await fetch(
        `/api/admin/organizations/${selectedOrg.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete organization");
      }

      setDeleteDialogOpen(false);
      setSelectedOrg(null);
      fetchOrganizations();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to delete organization"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openEditDialog = (org: Organization) => {
    setSelectedOrg(org);
    setFormData({
      name: org.name,
      slug: org.slug,
      type: org.type,
      logoUrl: org.logoUrl || "",
      primaryColor: org.primaryColor || "#10b981",
      customDomain: org.customDomain || "",
      subscriptionTier: (org.subscriptionTier as "free" | "paid") || "free",
      maxLearners: String(org.settings?.maxLearners || 10),
      allowTeacherInvites: org.settings?.allowTeacherInvites ?? true,
    });
    setFormError(null);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (org: Organization) => {
    setSelectedOrg(org);
    setFormError(null);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Organizations</h1>
          <p className="text-muted-foreground mt-1">
            Manage organizations and their settings
          </p>
        </div>
        <Button
          onClick={() => {
            setFormData(defaultFormData);
            setFormError(null);
            setCreateDialogOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          New Organization
        </Button>
      </div>

      {/* Stats */}
      {loading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Organizations</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">By Type</CardTitle>
              <School className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.schools}</div>
              <p className="text-xs text-muted-foreground">
                Schools · {stats.families} Families · {stats.districts}{" "}
                Districts
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.paidTier}</div>
              <p className="text-xs text-muted-foreground">
                {stats.freeTier} Free Tier
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Expiring Soon
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.expiringSoon}</div>
              <p className="text-xs text-muted-foreground">Within 30 days</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>All Organizations</CardTitle>
          <CardDescription>
            View and manage all organizations on the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search by name, slug, or domain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="family">Family</SelectItem>
                <SelectItem value="school">School</SelectItem>
                <SelectItem value="district">District</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Tiers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          )}

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded" />
                    <div>
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-48 mt-1" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
              ))}
            </div>
          ) : organizations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No organizations found</p>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="space-y-4">
              {organizations.map((org) => (
                <div
                  key={org.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="h-10 w-10 rounded flex items-center justify-center text-white font-bold"
                      style={{
                        backgroundColor: org.primaryColor || "#10b981",
                      }}
                    >
                      {org.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{org.name}</span>
                        <OrgTypeBadge type={org.type} />
                        <TierBadge
                          tier={org.subscriptionTier}
                          isExpired={org.isExpired}
                        />
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{org.slug}</span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {org.userCount} users
                        </span>
                        {org.customDomain && (
                          <span className="flex items-center gap-1">
                            <ExternalLink className="h-3 w-3" />
                            {org.customDomain}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(org)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`/admin/organizations/${org.id}/domains`)
                        }
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        Manage Domains
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => openDeleteDialog(org)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Organization</DialogTitle>
            <DialogDescription>
              Add a new organization to the platform
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {formError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                {formError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    name: e.target.value,
                    slug: generateSlug(e.target.value),
                  });
                }}
                placeholder="Acme School District"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                placeholder="acme-school-district"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Organization Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: "family" | "school" | "district") =>
                  setFormData({
                    ...formData,
                    type: value,
                    maxLearners:
                      value === "family"
                        ? "10"
                        : value === "school"
                          ? "1000"
                          : "10000",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="school">School</SelectItem>
                  <SelectItem value="district">District</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tier">Subscription</Label>
                <Select
                  value={formData.subscriptionTier}
                  onValueChange={(value: "free" | "paid") =>
                    setFormData({ ...formData, subscriptionTier: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxLearners">Max Learners</Label>
                <Input
                  id="maxLearners"
                  type="number"
                  value={formData.maxLearners}
                  onChange={(e) =>
                    setFormData({ ...formData, maxLearners: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Brand Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primaryColor"
                  value={formData.primaryColor}
                  onChange={(e) =>
                    setFormData({ ...formData, primaryColor: e.target.value })
                  }
                  placeholder="#10b981"
                />
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) =>
                    setFormData({ ...formData, primaryColor: e.target.value })
                  }
                  className="h-10 w-10 rounded border cursor-pointer"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={submitting || !formData.name}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Organization</DialogTitle>
            <DialogDescription>
              Update organization settings and branding
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {formError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                {formError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit-name">Organization Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-slug">Slug</Label>
              <Input
                id="edit-slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type">Organization Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: "family" | "school" | "district") =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="school">School</SelectItem>
                  <SelectItem value="district">District</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-tier">Subscription</Label>
                <Select
                  value={formData.subscriptionTier}
                  onValueChange={(value: "free" | "paid") =>
                    setFormData({ ...formData, subscriptionTier: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-maxLearners">Max Learners</Label>
                <Input
                  id="edit-maxLearners"
                  type="number"
                  value={formData.maxLearners}
                  onChange={(e) =>
                    setFormData({ ...formData, maxLearners: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-customDomain">Custom Domain</Label>
              <Input
                id="edit-customDomain"
                value={formData.customDomain}
                onChange={(e) =>
                  setFormData({ ...formData, customDomain: e.target.value })
                }
                placeholder="learn.acme.edu"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-primaryColor">Brand Color</Label>
              <div className="flex gap-2">
                <Input
                  id="edit-primaryColor"
                  value={formData.primaryColor}
                  onChange={(e) =>
                    setFormData({ ...formData, primaryColor: e.target.value })
                  }
                />
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) =>
                    setFormData({ ...formData, primaryColor: e.target.value })
                  }
                  className="h-10 w-10 rounded border cursor-pointer"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={submitting || !formData.name}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Organization</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedOrg?.name}&quot;?
              {selectedOrg && selectedOrg.userCount > 0 && (
                <span className="block mt-2 text-destructive">
                  This organization has {selectedOrg.userCount} active users.
                  You must transfer or remove all users before deleting.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {formError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              {formError}
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={submitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
