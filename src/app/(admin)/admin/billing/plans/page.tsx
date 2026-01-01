"use client";

import { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
  CreditCard,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Loader2,
  DollarSign,
  Users,
  Zap,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: "month" | "year";
  features: string[];
  limits: {
    users: number;
    storage: number;
    aiQueries: number;
  };
  isActive: boolean;
  subscriberCount: number;
  stripePriceId?: string;
}

export default function SubscriptionPlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    interval: "month" as "month" | "year",
    features: [] as string[],
    limits: { users: 100, storage: 10, aiQueries: 1000 },
    isActive: true,
  });
  const [newFeature, setNewFeature] = useState("");

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/admin/billing/plans");
      if (res.ok) {
        const data = await res.json();
        setPlans(data.plans || []);
      } else {
        // Mock data
        setPlans([
          {
            id: "free",
            name: "Free",
            description: "For individual learners",
            price: 0,
            interval: "month",
            features: ["1 learner", "Basic curriculum", "Limited AI tutor"],
            limits: { users: 1, storage: 1, aiQueries: 50 },
            isActive: true,
            subscriberCount: 1250,
          },
          {
            id: "family",
            name: "Family",
            description: "For families with multiple children",
            price: 14.99,
            interval: "month",
            features: ["Up to 5 learners", "Full curriculum", "Unlimited AI tutor", "Progress reports"],
            limits: { users: 5, storage: 10, aiQueries: 500 },
            isActive: true,
            subscriberCount: 450,
            stripePriceId: "price_family_monthly",
          },
          {
            id: "school",
            name: "School",
            description: "For schools and districts",
            price: 299,
            interval: "month",
            features: ["Unlimited students", "Admin dashboard", "Analytics", "SSO", "Priority support"],
            limits: { users: -1, storage: 100, aiQueries: 10000 },
            isActive: true,
            subscriberCount: 25,
            stripePriceId: "price_school_monthly",
          },
          {
            id: "enterprise",
            name: "Enterprise",
            description: "Custom solutions for large organizations",
            price: 999,
            interval: "month",
            features: ["Custom integrations", "Dedicated support", "SLA", "White-label"],
            limits: { users: -1, storage: -1, aiQueries: -1 },
            isActive: true,
            subscriberCount: 5,
            stripePriceId: "price_enterprise_monthly",
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      interval: plan.interval,
      features: [...plan.features],
      limits: { ...plan.limits },
      isActive: plan.isActive,
    });
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingPlan(null);
    setFormData({
      name: "",
      description: "",
      price: 0,
      interval: "month",
      features: [],
      limits: { users: 100, storage: 10, aiQueries: 1000 },
      isActive: true,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = editingPlan
        ? `/api/admin/billing/plans/${editingPlan.id}`
        : "/api/admin/billing/plans";
      const method = editingPlan ? "PATCH" : "POST";

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      setDialogOpen(false);
      fetchPlans();
    } catch (error) {
      console.error("Failed to save plan:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()],
      });
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subscription Plans</h1>
          <p className="text-muted-foreground">
            Manage pricing tiers and subscription features.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Plan
        </Button>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <Card key={plan.id} className={!plan.isActive ? "opacity-60" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{plan.name}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => handleEdit(plan)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-3xl font-bold">
                  ${plan.price}
                </span>
                <span className="text-muted-foreground">/{plan.interval}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                {plan.subscriberCount} subscribers
              </div>

              <ul className="space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>

              {!plan.isActive && (
                <Badge variant="outline">Inactive</Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Comparison</CardTitle>
          <CardDescription>
            Feature comparison across all pricing tiers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feature</TableHead>
                {plans.map((plan) => (
                  <TableHead key={plan.id} className="text-center">
                    {plan.name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Price</TableCell>
                {plans.map((plan) => (
                  <TableCell key={plan.id} className="text-center">
                    ${plan.price}/{plan.interval}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Users</TableCell>
                {plans.map((plan) => (
                  <TableCell key={plan.id} className="text-center">
                    {plan.limits.users === -1 ? "Unlimited" : plan.limits.users}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Storage (GB)</TableCell>
                {plans.map((plan) => (
                  <TableCell key={plan.id} className="text-center">
                    {plan.limits.storage === -1 ? "Unlimited" : plan.limits.storage}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">AI Queries/month</TableCell>
                {plans.map((plan) => (
                  <TableCell key={plan.id} className="text-center">
                    {plan.limits.aiQueries === -1 ? "Unlimited" : plan.limits.aiQueries}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit/Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? "Edit Plan" : "Create Plan"}
            </DialogTitle>
            <DialogDescription>
              {editingPlan ? "Update the subscription plan details" : "Create a new subscription tier"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="space-y-2">
              <Label>Plan Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Premium"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="For growing teams"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Interval</Label>
                <select
                  className="w-full h-10 px-3 border rounded-md"
                  value={formData.interval}
                  onChange={(e) => setFormData({ ...formData, interval: e.target.value as "month" | "year" })}
                >
                  <option value="month">Monthly</option>
                  <option value="year">Yearly</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Features</Label>
              <div className="flex gap-2">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add feature"
                  onKeyDown={(e) => e.key === "Enter" && handleAddFeature()}
                />
                <Button type="button" variant="outline" onClick={handleAddFeature}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <ul className="space-y-1">
                {formData.features.map((feature, i) => (
                  <li key={i} className="flex items-center justify-between text-sm bg-muted px-2 py-1 rounded">
                    {feature}
                    <button onClick={() => handleRemoveFeature(i)}>
                      <X className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
