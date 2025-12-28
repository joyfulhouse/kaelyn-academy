"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Agent {
  id: string;
  name: string;
  slug: string;
  type: string;
  provider: string;
  modelTier: string;
  version: number;
  isActive: boolean;
  createdAt: string;
  executionCount: number;
  avgInputTokens: number | null;
  avgOutputTokens: number | null;
}

const agentTypeLabels: Record<string, { label: string; color: string }> = {
  tutor: { label: "Tutor", color: "bg-info/20 text-info" },
  adaptive: { label: "Adaptive", color: "bg-success/20 text-success" },
  practice_gen: { label: "Practice Gen", color: "bg-primary/20 text-primary" },
  assessment: { label: "Assessment", color: "bg-warning/20 text-warning" },
};

const providerLabels: Record<string, { label: string; color: string }> = {
  anthropic: { label: "Claude", color: "bg-warning/20 text-warning" },
  openai: { label: "GPT", color: "bg-success/20 text-success" },
  google: { label: "Gemini", color: "bg-info/20 text-info" },
};

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<string>("");

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (typeFilter) params.set("type", typeFilter);
      if (activeFilter) params.set("active", activeFilter);

      const response = await fetch(`/api/agents?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch agents");

      const data = await response.json();
      setAgents(data.agents);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [typeFilter, activeFilter]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI Agents</h1>
          <p className="mt-1 text-muted-foreground">
            Manage AI tutors, adaptive difficulty, and practice generators
          </p>
        </div>
        <Link
          href="/admin/agents/new"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Create Agent
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4 bg-card p-4 rounded-lg shadow-sm border border-border">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Type</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="block w-40 rounded-md border-border bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary text-sm"
          >
            <option value="">All Types</option>
            <option value="tutor">Tutor</option>
            <option value="adaptive">Adaptive</option>
            <option value="practice_gen">Practice Gen</option>
            <option value="assessment">Assessment</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Status</label>
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="block w-40 rounded-md border-border bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary text-sm"
          >
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {/* Agents Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-destructive">
          {error}
        </div>
      ) : agents.length === 0 ? (
        <div className="bg-card rounded-lg shadow-sm border border-border p-12 text-center">
          <div className="text-muted-foreground mb-4">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No agents found</h3>
          <p className="text-muted-foreground mb-4">Get started by creating your first AI agent.</p>
          <Link
            href="/admin/agents/new"
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Create Agent
          </Link>
        </div>
      ) : (
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Executions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Avg Tokens
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {agents.map((agent) => {
                const typeInfo = agentTypeLabels[agent.type] || {
                  label: agent.type,
                  color: "bg-muted text-muted-foreground",
                };
                const providerInfo = providerLabels[agent.provider] || {
                  label: agent.provider,
                  color: "bg-muted text-muted-foreground",
                };
                const avgTokens =
                  (agent.avgInputTokens || 0) + (agent.avgOutputTokens || 0);

                return (
                  <tr key={agent.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-foreground">{agent.name}</div>
                        <div className="text-sm text-muted-foreground">v{agent.version}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${typeInfo.color}`}
                      >
                        {typeInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${providerInfo.color}`}
                      >
                        {providerInfo.label}
                      </span>
                      <span className="ml-2 text-xs text-muted-foreground">{agent.modelTier}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {agent.executionCount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {avgTokens > 0 ? `~${Math.round(avgTokens)}` : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          agent.isActive
                            ? "bg-success/20 text-success"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {agent.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/admin/agents/${agent.id}`}
                        className="text-primary hover:text-primary/80 mr-4"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/admin/agents/${agent.id}/executions`}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        Logs
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Built-in Agents Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">Built-in Agents</h2>
        <p className="text-muted-foreground mb-4">
          These agents are powered by the Ax library and available via API without database configuration.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-lg shadow-sm border border-border p-4">
            <h3 className="font-medium text-foreground">Tutoring Agent</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Personalized tutoring with age-appropriate responses
            </p>
            <code className="block mt-2 text-xs bg-muted p-2 rounded">
              POST /api/agents/tutor
            </code>
          </div>
          <div className="bg-card rounded-lg shadow-sm border border-border p-4">
            <h3 className="font-medium text-foreground">Adaptive Agent</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Analyzes performance and adjusts difficulty
            </p>
            <code className="block mt-2 text-xs bg-muted p-2 rounded">
              POST /api/agents/adaptive
            </code>
          </div>
          <div className="bg-card rounded-lg shadow-sm border border-border p-4">
            <h3 className="font-medium text-foreground">Practice Generator</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Creates practice questions by type and difficulty
            </p>
            <code className="block mt-2 text-xs bg-muted p-2 rounded">
              POST /api/agents/practice
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
