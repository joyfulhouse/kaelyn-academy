/**
 * Health Check API
 *
 * Provides health status for monitoring and load balancer checks.
 * Returns component health status for database, cache, and services.
 */

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

interface HealthCheck {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: ComponentHealth;
    memory: ComponentHealth;
  };
}

interface ComponentHealth {
  status: "healthy" | "unhealthy";
  latencyMs?: number;
  message?: string;
}

const startTime = Date.now();

/**
 * Check database connectivity
 */
async function checkDatabase(): Promise<ComponentHealth> {
  const start = Date.now();
  try {
    await db.execute(sql`SELECT 1`);
    return {
      status: "healthy",
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    return {
      status: "unhealthy",
      latencyMs: Date.now() - start,
      message: error instanceof Error ? error.message : "Database connection failed",
    };
  }
}

/**
 * Check memory usage
 */
function checkMemory(): ComponentHealth {
  const used = process.memoryUsage();
  const heapUsedMB = Math.round(used.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(used.heapTotal / 1024 / 1024);
  const percentUsed = (used.heapUsed / used.heapTotal) * 100;

  // Warn if heap usage exceeds 90%
  if (percentUsed > 90) {
    return {
      status: "unhealthy",
      message: `High memory usage: ${heapUsedMB}MB / ${heapTotalMB}MB (${percentUsed.toFixed(1)}%)`,
    };
  }

  return {
    status: "healthy",
    message: `${heapUsedMB}MB / ${heapTotalMB}MB (${percentUsed.toFixed(1)}%)`,
  };
}

/**
 * GET /api/health - Health check endpoint
 *
 * Returns 200 if healthy, 503 if unhealthy
 */
export async function GET() {
  const [databaseHealth, memoryHealth] = await Promise.all([
    checkDatabase(),
    Promise.resolve(checkMemory()),
  ]);

  const allHealthy = databaseHealth.status === "healthy" && memoryHealth.status === "healthy";
  const anyUnhealthy = databaseHealth.status === "unhealthy" || memoryHealth.status === "unhealthy";

  const overallStatus: HealthCheck["status"] = anyUnhealthy
    ? "unhealthy"
    : allHealthy
    ? "healthy"
    : "degraded";

  const health: HealthCheck = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? "1.0.0",
    uptime: Math.round((Date.now() - startTime) / 1000),
    checks: {
      database: databaseHealth,
      memory: memoryHealth,
    },
  };

  return NextResponse.json(health, {
    status: overallStatus === "unhealthy" ? 503 : 200,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}

/**
 * HEAD /api/health - Simple liveness check
 *
 * Returns 200 OK without body for load balancer checks
 */
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
