/**
 * Health Check API Route
 * GET /api/health - Full health check
 * GET /api/health/live - Liveness probe
 * GET /api/health/ready - Readiness probe
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { healthCheck } from '@/lib/monitoring/health-check';
import { withErrorHandler } from '@/lib/errors/api-error-middleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { endpoint } = req.query;

  switch (endpoint?.[0]) {
    case 'live':
      // Liveness probe - is the app running?
      return res.status(200).json({
        success: true,
        status: 'alive',
        timestamp: new Date().toISOString(),
      });

    case 'ready':
      // Readiness probe - is the app ready to serve traffic?
      const isReady = await healthCheck.isReady();
      return res.status(isReady ? 200 : 503).json({
        success: isReady,
        status: isReady ? 'ready' : 'not_ready',
        timestamp: new Date().toISOString(),
      });

    default:
      // Full health check
      const health = await healthCheck.getSystemHealth();
      const statusCode = health.status === 'healthy' ? 200 : 503;

      return res.status(statusCode).json({
        success: health.status === 'healthy',
        ...health,
      });
  }
}

export default withErrorHandler(handler);
