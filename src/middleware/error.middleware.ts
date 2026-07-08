import { Request, Response, NextFunction } from 'express';
import { logDebug } from '../utils/debug-logger';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = res.locals.requestId;
  logDebug('Unhandled error', { requestId, message: err.message });
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
}

export function notFoundHandler(_req: Request, res: Response): void {
  const requestId = res.locals.requestId;
  logDebug('Route not found', { requestId });
  res.status(404).json({ error: 'Route not found' });
}
