import type { Database } from '@course/db';
import { sql } from 'drizzle-orm';

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: {
    database: { status: 'up' | 'down'; latencyMs?: number };
    uptime: number;
  };
}

const startTime = Date.now();

export async function healthCheck(db: Database): Promise<HealthCheckResult> {
  const timestamp = new Date().toISOString();
  let dbStatus: 'up' | 'down' = 'down';
  let dbLatency: number | undefined;

  try {
    const start = Date.now();
    await db.execute(sql`SELECT 1`);
    dbLatency = Date.now() - start;
    dbStatus = 'up';
  } catch {
    dbStatus = 'down';
  }

  const allUp = dbStatus === 'up';

  return {
    status: allUp ? 'healthy' : 'unhealthy',
    timestamp,
    services: {
      database: { status: dbStatus, latencyMs: dbLatency },
      uptime: Math.floor((Date.now() - startTime) / 1000),
    },
  };
}
