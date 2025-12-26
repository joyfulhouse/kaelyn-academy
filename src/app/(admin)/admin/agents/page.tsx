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
  tutor: { label: "Tutor", color: "bg-blue-100 text-blue-800" },
  adaptive: { label: "Adaptive", color: "bg-green-100 text-green-800" },
  practice_gen: { label: "Practice Gen", color: "bg-purple-100 text-purple-800" },
  assessment: { label: "Assessment", color: "bg-orange-100 text-orange-800" },
};

const providerLabels: Record<string, { label: string; color: string }> = {
  anthropic: { label: "Claude", color: "bg-amber-100 text-amber-800" },
  openai: { label: "GPT", color: "bg-emerald-100 text-emerald-800" },
  google: { label: "Gemini", color: "bg-sky-100 text-sky-800" },
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
          <h1 className="text-3xl font-bold text-gray-900">AI Agents</h1>
          <p className="mt-1 text-gray-600">
            Manage AI tutors, adaptive difficulty, and practice generators
          </p>
        </div>
        <Link
          href="/admin/agents/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Agent
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          >
            <option value="">All Types</option>
            <option value="tutor">Tutor</option>
            <option value="adaptive">Adaptive</option>
            <option value="practice_gen">Practice Gen</option>
            <option value="assessment">Assessment</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      ) : agents.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-gray-400 mb-4">
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first AI agent.</p>
          <Link
            href="/admin/agents/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Agent
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Executions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Tokens
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {agents.map((agent) => {
                const typeInfo = agentTypeLabels[agent.type] || {
                  label: agent.type,
                  color: "bg-gray-100 text-gray-800",
                };
                const providerInfo = providerLabels[agent.provider] || {
                  label: agent.provider,
                  color: "bg-gray-100 text-gray-800",
                };
                const avgTokens =
                  (agent.avgInputTokens || 0) + (agent.avgOutputTokens || 0);

                return (
                  <tr key={agent.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{agent.name}</div>
                        <div className="text-sm text-gray-500">v{agent.version}</div>
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
                      <span className="ml-2 text-xs text-gray-500">{agent.modelTier}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {agent.executionCount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {avgTokens > 0 ? `~${Math.round(avgTokens)}` : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          agent.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {agent.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/admin/agents/${agent.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/admin/agents/${agent.id}/executions`}
                        className="text-gray-600 hover:text-gray-900"
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
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Built-in Agents</h2>
        <p className="text-gray-600 mb-4">
          These agents are powered by the Ax library and available via API without database configuration.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900">Tutoring Agent</h3>
            <p className="text-sm text-gray-500 mt-1">
              Personalized tutoring with age-appropriate responses
            </p>
            <code className="block mt-2 text-xs bg-gray-100 p-2 rounded">
              POST /api/agents/tutor
            </code>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900">Adaptive Agent</h3>
            <p className="text-sm text-gray-500 mt-1">
              Analyzes performance and adjusts difficulty
            </p>
            <code className="block mt-2 text-xs bg-gray-100 p-2 rounded">
              POST /api/agents/adaptive
            </code>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900">Practice Generator</h3>
            <p className="text-sm text-gray-500 mt-1">
              Creates practice questions by type and difficulty
            </p>
            <code className="block mt-2 text-xs bg-gray-100 p-2 rounded">
              POST /api/agents/practice
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
