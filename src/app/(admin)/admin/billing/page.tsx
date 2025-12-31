"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  CreditCard,
  DollarSign,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Zap,
} from "lucide-react";

interface BillingStats {
  totalRevenue: number;
  totalRevenueFormatted: string;
  activeSubscriptions: number;
  canceledSubscriptions: number;
  trialSubscriptions: number;
  planBreakdown: Record<string, number>;
}

interface Subscription {
  id: string;
  organizationName: string;
  organizationSlug: string;
  planName: string;
  status: string;
  billingCycle: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceMonthly: number;
  priceYearly: number;
  limits: {
    maxLearners: number;
    maxTeachers: number;
    maxAiRequestsPerMonth: number;
    maxStorageGb: number;
    features: string[];
  };
  isPopular: boolean;
}

interface UsageInfo {
  usage: {
    periodStart: string;
    periodEnd: string;
    totalRequests: number;
    inputTokens: number;
    outputTokens: number;
    estimatedCost: number;
    estimatedCostFormatted: string;
    limitUsedPercent: number;
  } | null;
  limits: {
    used: number;
    limit: number;
    percentUsed: number;
    withinLimit: boolean;
  };
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function StatusBadge({ status, cancelAtPeriodEnd }: { status: string; cancelAtPeriodEnd: boolean }) {
  if (cancelAtPeriodEnd) {
    return (
      <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-700">
        <Clock className="h-3 w-3" />
        Canceling
      </Badge>
    );
  }

  switch (status) {
    case "active":
      return (
        <Badge className="gap-1 bg-green-100 text-green-800">
          <CheckCircle2 className="h-3 w-3" />
          Active
        </Badge>
      );
    case "trialing":
      return (
        <Badge className="gap-1 bg-blue-100 text-blue-800">
          <Sparkles className="h-3 w-3" />
          Trial
        </Badge>
      );
    case "past_due":
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          Past Due
        </Badge>
      );
    case "canceled":
      return (
        <Badge variant="secondary" className="gap-1">
          Canceled
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
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

export default function AdminBillingPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<BillingStats | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [total, setTotal] = useState(0);

  // Upgrade dialog
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [processingUpgrade, setProcessingUpgrade] = useState(false);

  // Success/cancel messages from Stripe redirect
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [billingRes, plansRes, usageRes] = await Promise.all([
        fetch("/api/admin/billing"),
        fetch("/api/billing/plans"),
        fetch("/api/billing/usage"),
      ]);

      if (!billingRes.ok) {
        const data = await billingRes.json();
        throw new Error(data.error || "Failed to fetch billing data");
      }

      const billingData = await billingRes.json();
      setStats(billingData.stats);
      setSubscriptions(billingData.subscriptions);
      setTotal(billingData.total);

      if (plansRes.ok) {
        const plansData = await plansRes.json();
        setPlans(plansData.plans);
      }

      if (usageRes.ok) {
        const usageData = await usageRes.json();
        setUsage(usageData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load billing data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpgrade = async () => {
    if (!selectedPlan) return;

    setProcessingUpgrade(true);
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planSlug: selectedPlan, billingCycle }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create checkout session");
      }

      const { sessionUrl } = await response.json();
      window.location.href = sessionUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start checkout");
      setProcessingUpgrade(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      const response = await fetch("/api/billing/portal", {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to open billing portal");
      }

      const { portalUrl } = await response.json();
      window.location.href = portalUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to open billing portal");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Billing & Subscriptions</h1>
          <p className="text-muted-foreground mt-1">
            Manage subscriptions, view invoices, and track AI usage
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleManageBilling}>
            <CreditCard className="h-4 w-4 mr-2" />
            Manage Billing
          </Button>
          <Button onClick={() => setUpgradeDialogOpen(true)}>
            <Zap className="h-4 w-4 mr-2" />
            Upgrade Plan
          </Button>
        </div>
      </div>

      {/* Success/Cancel Messages */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          <span>Payment successful! Your subscription has been updated.</span>
        </div>
      )}
      {canceled && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          <span>Checkout was canceled. No changes were made to your subscription.</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Stats */}
      {loading ? (
        <StatsSkeleton />
      ) : stats ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRevenueFormatted}</div>
              <p className="text-xs text-muted-foreground">All-time revenue</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
              <p className="text-xs text-muted-foreground">
                {stats.trialSubscriptions} on trial
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plan Breakdown</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.keys(stats.planBreakdown).length}
              </div>
              <p className="text-xs text-muted-foreground">
                {Object.entries(stats.planBreakdown)
                  .map(([plan, count]) => `${count} ${plan}`)
                  .join(", ") || "No subscriptions"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Canceled</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.canceledSubscriptions}</div>
              <p className="text-xs text-muted-foreground">Canceled subscriptions</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* AI Usage */}
      {usage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Usage This Month
            </CardTitle>
            <CardDescription>
              Track your organization&apos;s AI tutoring usage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                {usage.limits.used.toLocaleString()} / {usage.limits.limit.toLocaleString()} requests
              </span>
              <span className="text-sm text-muted-foreground">
                {usage.limits.percentUsed.toFixed(1)}% used
              </span>
            </div>
            <Progress value={usage.limits.percentUsed} className="h-2" />
            {usage.usage && (
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div>
                  <p className="text-sm text-muted-foreground">Input Tokens</p>
                  <p className="text-lg font-semibold">
                    {usage.usage.inputTokens.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Output Tokens</p>
                  <p className="text-lg font-semibold">
                    {usage.usage.outputTokens.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Cost</p>
                  <p className="text-lg font-semibold">
                    {usage.usage.estimatedCostFormatted}
                  </p>
                </div>
              </div>
            )}
            {!usage.limits.withinLimit && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                You have exceeded your AI usage limit. Consider upgrading your plan.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Subscriptions List */}
      <Card>
        <CardHeader>
          <CardTitle>All Subscriptions</CardTitle>
          <CardDescription>
            {total} total subscriptions across all organizations
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No subscriptions found</p>
              <p className="text-sm mt-1">
                Subscriptions will appear here when organizations upgrade
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{sub.organizationName}</span>
                        <Badge variant="outline">{sub.planName}</Badge>
                        <StatusBadge
                          status={sub.status}
                          cancelAtPeriodEnd={sub.cancelAtPeriodEnd}
                        />
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{sub.organizationSlug}</span>
                        <span className="capitalize">{sub.billingCycle}</span>
                        {sub.currentPeriodEnd && (
                          <span>
                            Renews{" "}
                            {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Plans */}
      {plans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Available Plans</CardTitle>
            <CardDescription>
              Subscription plans and their pricing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`p-4 border rounded-lg ${
                    plan.isPopular ? "border-primary ring-1 ring-primary" : ""
                  }`}
                >
                  {plan.isPopular && (
                    <Badge className="mb-2">Most Popular</Badge>
                  )}
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {plan.description}
                  </p>
                  <div className="mb-4">
                    <span className="text-2xl font-bold">
                      {formatCurrency(plan.priceMonthly)}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      {plan.limits.maxLearners} learners
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      {plan.limits.maxTeachers} teachers
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      {plan.limits.maxAiRequestsPerMonth.toLocaleString()} AI requests/month
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      {plan.limits.maxStorageGb} GB storage
                    </li>
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upgrade Dialog */}
      <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upgrade Plan</DialogTitle>
            <DialogDescription>
              Choose a plan and billing cycle to upgrade your subscription
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Plan</label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans
                    .filter((p) => p.priceMonthly > 0)
                    .map((plan) => (
                      <SelectItem key={plan.id} value={plan.slug}>
                        {plan.name} - {formatCurrency(plan.priceMonthly)}/mo
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Billing Cycle</label>
              <Select
                value={billingCycle}
                onValueChange={(v) => setBillingCycle(v as "monthly" | "yearly")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly (Save 20%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectedPlan && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">
                  Total:{" "}
                  {formatCurrency(
                    billingCycle === "yearly"
                      ? (plans.find((p) => p.slug === selectedPlan)?.priceYearly || 0)
                      : (plans.find((p) => p.slug === selectedPlan)?.priceMonthly || 0)
                  )}
                  /{billingCycle === "yearly" ? "year" : "month"}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUpgradeDialogOpen(false)}
              disabled={processingUpgrade}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpgrade}
              disabled={!selectedPlan || processingUpgrade}
            >
              {processingUpgrade ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Continue to Checkout
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
