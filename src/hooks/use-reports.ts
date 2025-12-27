/**
 * Report Generation Hook
 * React hook for generating and downloading reports
 */

"use client";

import { useState, useCallback } from "react";
import type {
  ReportConfig,
  ReportResult,
  ReportType,
  ReportFormat,
} from "@/lib/reports/types";
import {
  generateReport,
  getAvailableFormats,
  estimateGenerationTime,
  generateCSV,
  generateJSON,
} from "@/lib/reports/generator";

export interface UseReportsResult {
  isGenerating: boolean;
  error: string | null;
  lastReport: ReportResult | null;
  generate: (config: ReportConfig) => Promise<ReportResult | null>;
  download: (report: ReportResult) => void;
  getFormats: (type: ReportType) => ReportFormat[];
  estimateTime: (type: ReportType, recordCount: number) => number;
  clearError: () => void;
}

export function useReports(): UseReportsResult {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastReport, setLastReport] = useState<ReportResult | null>(null);

  const generate = useCallback(async (config: ReportConfig): Promise<ReportResult | null> => {
    setIsGenerating(true);
    setError(null);

    try {
      const report = await generateReport(config);
      setLastReport(report);
      return report;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate report";
      setError(message);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const download = useCallback((report: ReportResult) => {
    const { metadata, data } = report;
    let content: string;
    let mimeType: string;
    let extension: string;

    switch (metadata.format) {
      case "csv":
        // For CSV, we need to flatten the data appropriately
        if (Array.isArray(data)) {
          content = generateCSV(
            data as Record<string, unknown>[],
            Object.keys(data[0] || {}).map((key) => ({ key, label: key }))
          );
        } else {
          content = generateJSON(data);
        }
        mimeType = "text/csv";
        extension = "csv";
        break;
      case "json":
        content = generateJSON(data);
        mimeType = "application/json";
        extension = "json";
        break;
      case "xlsx":
        // For XLSX, we'd need a library like xlsx
        // For now, fall back to JSON
        content = generateJSON(data);
        mimeType = "application/json";
        extension = "json";
        break;
      case "pdf":
        // PDF generation is handled separately via downloadPDF
        // Fall back to JSON for generic download
        content = generateJSON(data);
        mimeType = "application/json";
        extension = "json";
        break;
      default:
        content = generateJSON(data);
        mimeType = "application/json";
        extension = "json";
    }

    // Create and trigger download
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${metadata.title.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const getFormats = useCallback((type: ReportType): ReportFormat[] => {
    return getAvailableFormats(type);
  }, []);

  const estimateTime = useCallback((type: ReportType, recordCount: number): number => {
    return estimateGenerationTime(type, recordCount);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isGenerating,
    error,
    lastReport,
    generate,
    download,
    getFormats,
    estimateTime,
    clearError,
  };
}
