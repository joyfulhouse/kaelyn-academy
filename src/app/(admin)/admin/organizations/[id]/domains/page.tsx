"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Plus,
  Globe,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Trash2,
  Settings,
  Copy,
  ExternalLink,
  Loader2,
  Shield,
  Star,
} from "lucide-react";
import type { DomainVerificationStatus } from "@/lib/db/schema/organizations";

interface Domain {
  id: string;
  domain: string;
  isPrimary: boolean;
  verificationStatus: DomainVerificationStatus;
  verificationToken: string | null;
  verificationMethod: string | null;
  verifiedAt: string | null;
  lastVerificationAttempt: string | null;
  verificationError: string | null;
  sslEnabled: boolean;
  sslExpiresAt: string | null;
  routingEnabled: boolean;
  redirectToWww: boolean;
  forceHttps: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  verificationInstructions: {
    instructions: string;
    records: { type: string; name: string; value: string }[];
  } | null;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
}

function StatusBadge({ status }: { status: DomainVerificationStatus }) {
  switch (status) {
    case "verified":
      return (
        <Badge className="gap-1 bg-green-100 text-green-800">
          <CheckCircle2 className="h-3 w-3" />
          Verified
        </Badge>
      );
    case "verifying":
      return (
        <Badge variant="secondary" className="gap-1">
          <RefreshCw className="h-3 w-3 animate-spin" />
          Verifying
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Failed
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      );
  }
}

export default function OrganizationDomainsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const organizationId = params.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [domains, setDomains] = useState<Domain[]>([]);

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);

  // Form states
  const [newDomain, setNewDomain] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Settings form
  const [routingEnabled, setRoutingEnabled] = useState(false);
  const [forceHttps, setForceHttps] = useState(true);
  const [redirectToWww, setRedirectToWww] = useState(false);

  const fetchDomains = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch organization details
      const orgResponse = await fetch(`/api/admin/organizations/${organizationId}`);
      if (!orgResponse.ok) {
        throw new Error("Failed to fetch organization");
      }
      const orgData = await orgResponse.json();
      setOrganization(orgData.organization);

      // Fetch domains
      const domainsResponse = await fetch(
        `/api/admin/organizations/${organizationId}/domains`
      );
      if (!domainsResponse.ok) {
        throw new Error("Failed to fetch domains");
      }
      const domainsData = await domainsResponse.json();
      setDomains(domainsData.domains);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  const handleAddDomain = async () => {
    setSubmitting(true);
    setFormError(null);
    try {
      const response = await fetch(
        `/api/admin/organizations/${organizationId}/domains`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            domain: newDomain,
            isPrimary,
            notes: notes || undefined,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add domain");
      }

      setAddDialogOpen(false);
      setNewDomain("");
      setIsPrimary(false);
      setNotes("");
      fetchDomains();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to add domain");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyDomain = async () => {
    if (!selectedDomain) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const response = await fetch(
        `/api/admin/organizations/${organizationId}/domains/${selectedDomain.id}/verify`,
        { method: "POST" }
      );

      const result = await response.json();

      if (result.success) {
        setVerifyDialogOpen(false);
        setSelectedDomain(null);
        fetchDomains();
      } else {
        setFormError(result.message || "Verification failed");
        fetchDomains(); // Refresh to get updated status
      }
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to verify domain"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateSettings = async () => {
    if (!selectedDomain) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const response = await fetch(
        `/api/admin/organizations/${organizationId}/domains/${selectedDomain.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            routingEnabled,
            forceHttps,
            redirectToWww,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update settings");
      }

      setSettingsDialogOpen(false);
      setSelectedDomain(null);
      fetchDomains();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to update settings"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDomain = async () => {
    if (!selectedDomain) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const response = await fetch(
        `/api/admin/organizations/${organizationId}/domains/${selectedDomain.id}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete domain");
      }

      setDeleteDialogOpen(false);
      setSelectedDomain(null);
      fetchDomains();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to delete domain"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetPrimary = async (domain: Domain) => {
    try {
      const response = await fetch(
        `/api/admin/organizations/${organizationId}/domains/${domain.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPrimary: true }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to set primary domain");
      }

      fetchDomains();
    } catch (err) {
      console.error("Error setting primary domain:", err);
    }
  };

  const openSettingsDialog = (domain: Domain) => {
    setSelectedDomain(domain);
    setRoutingEnabled(domain.routingEnabled);
    setForceHttps(domain.forceHttps);
    setRedirectToWww(domain.redirectToWww);
    setFormError(null);
    setSettingsDialogOpen(true);
  };

  const openVerifyDialog = (domain: Domain) => {
    setSelectedDomain(domain);
    setFormError(null);
    setVerifyDialogOpen(true);
  };

  const openDeleteDialog = (domain: Domain) => {
    setSelectedDomain(domain);
    setFormError(null);
    setDeleteDialogOpen(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48 mt-1" />
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-32 mt-1" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <p className="text-lg font-medium">{error}</p>
            <Button onClick={fetchDomains} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Custom Domains</h1>
            <p className="text-muted-foreground mt-1">
              {organization?.name} - Manage white-label domains
            </p>
          </div>
        </div>
        <Button
          onClick={() => {
            setNewDomain("");
            setIsPrimary(false);
            setNotes("");
            setFormError(null);
            setAddDialogOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Domain
        </Button>
      </div>

      {/* SSL Documentation Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            SSL Certificates
          </CardTitle>
          <CardDescription>
            How to configure SSL for custom domains
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            SSL certificates for custom domains can be configured in one of the following ways:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              <strong>Cloudflare (Recommended):</strong> Add your domain to Cloudflare and enable
              their Universal SSL. Configure your DNS to point to the platform.
            </li>
            <li>
              <strong>Vercel:</strong> If deployed on Vercel, add custom domains in the Vercel
              dashboard. SSL is automatically provisioned.
            </li>
            <li>
              <strong>Let's Encrypt:</strong> For self-hosted deployments, configure your reverse
              proxy (nginx/Caddy) to obtain Let's Encrypt certificates.
            </li>
          </ul>
          <p className="text-xs mt-4">
            After verifying domain ownership below, configure your SSL provider and then
            enable routing for the domain.
          </p>
        </CardContent>
      </Card>

      {/* Domains List */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Domains</CardTitle>
          <CardDescription>
            {domains.length === 0
              ? "No custom domains configured"
              : `${domains.length} domain${domains.length !== 1 ? "s" : ""} configured`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {domains.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No custom domains configured</p>
              <p className="text-sm mt-1">
                Add a domain to enable white-label access for this organization
              </p>
              <Button
                onClick={() => setAddDialogOpen(true)}
                className="mt-4"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Domain
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {domains.map((domain) => (
                <div
                  key={domain.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{domain.domain}</span>
                        {domain.isPrimary && (
                          <Badge variant="secondary" className="gap-1">
                            <Star className="h-3 w-3" />
                            Primary
                          </Badge>
                        )}
                        <StatusBadge status={domain.verificationStatus} />
                        {domain.routingEnabled && (
                          <Badge className="gap-1 bg-blue-100 text-blue-800">
                            <CheckCircle2 className="h-3 w-3" />
                            Active
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        {domain.verificationStatus === "verified" && (
                          <span>
                            Verified{" "}
                            {domain.verifiedAt &&
                              new Date(domain.verifiedAt).toLocaleDateString()}
                          </span>
                        )}
                        {domain.sslEnabled && (
                          <span className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            SSL
                          </span>
                        )}
                        {domain.forceHttps && <span>HTTPS Only</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {domain.verificationStatus !== "verified" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openVerifyDialog(domain)}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Verify
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {domain.verificationStatus === "verified" && (
                          <DropdownMenuItem
                            onClick={() =>
                              window.open(`https://${domain.domain}`, "_blank")
                            }
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Visit Domain
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => openSettingsDialog(domain)}>
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </DropdownMenuItem>
                        {!domain.isPrimary && domain.verificationStatus === "verified" && (
                          <DropdownMenuItem onClick={() => handleSetPrimary(domain)}>
                            <Star className="h-4 w-4 mr-2" />
                            Set as Primary
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => openDeleteDialog(domain)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Domain Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Domain</DialogTitle>
            <DialogDescription>
              Add a new custom domain for white-label access
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {formError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                {formError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="domain">Domain Name</Label>
              <Input
                id="domain"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="learn.example.com"
              />
              <p className="text-xs text-muted-foreground">
                Enter the full domain name without http:// or https://
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="primary">Primary Domain</Label>
                <p className="text-xs text-muted-foreground">
                  Set as the main domain for this organization
                </p>
              </div>
              <Switch
                id="primary"
                checked={isPrimary}
                onCheckedChange={setIsPrimary}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Internal notes about this domain..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleAddDomain} disabled={submitting || !newDomain}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Domain"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verify Domain Dialog */}
      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Verify Domain Ownership</DialogTitle>
            <DialogDescription>
              Add a DNS TXT record to verify ownership of {selectedDomain?.domain}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {formError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                {formError}
              </div>
            )}
            {selectedDomain?.verificationInstructions && (
              <>
                <p className="text-sm text-muted-foreground">
                  {selectedDomain.verificationInstructions.instructions}
                </p>
                <div className="bg-muted rounded-lg p-4 space-y-3">
                  {selectedDomain.verificationInstructions.records.map(
                    (record, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {record.type} Record
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(record.value)}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                        </div>
                        <div className="text-sm">
                          <strong>Name:</strong>{" "}
                          <code className="bg-background px-1 rounded">
                            {record.name}
                          </code>
                        </div>
                        <div className="text-sm">
                          <strong>Value:</strong>{" "}
                          <code className="bg-background px-1 rounded text-xs break-all">
                            {record.value}
                          </code>
                        </div>
                      </div>
                    )
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  DNS changes can take up to 48 hours to propagate, though they
                  typically take effect within a few minutes.
                </p>
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setVerifyDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleVerifyDomain} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Check Verification
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Domain Settings</DialogTitle>
            <DialogDescription>
              Configure routing options for {selectedDomain?.domain}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {formError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                {formError}
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Routing</Label>
                <p className="text-xs text-muted-foreground">
                  Allow traffic to this domain
                </p>
              </div>
              <Switch
                checked={routingEnabled}
                onCheckedChange={setRoutingEnabled}
                disabled={selectedDomain?.verificationStatus !== "verified"}
              />
            </div>
            {selectedDomain?.verificationStatus !== "verified" && (
              <p className="text-xs text-amber-600">
                Domain must be verified before enabling routing
              </p>
            )}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Force HTTPS</Label>
                <p className="text-xs text-muted-foreground">
                  Redirect HTTP requests to HTTPS
                </p>
              </div>
              <Switch checked={forceHttps} onCheckedChange={setForceHttps} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Redirect to WWW</Label>
                <p className="text-xs text-muted-foreground">
                  Redirect non-www requests to www subdomain
                </p>
              </div>
              <Switch
                checked={redirectToWww}
                onCheckedChange={setRedirectToWww}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSettingsDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateSettings} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Settings"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Domain</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedDomain?.domain}&quot;?
              This will disable white-label access through this domain.
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
              onClick={handleDeleteDomain}
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
