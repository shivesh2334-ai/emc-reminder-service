import { Request, Response, NextFunction } from 'express';
import { isDebugEnabled, logDebug } from '../utils/debug-logger';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = res.locals.requestId;
  logDebug('Unhandled error', { requestId, message: err.message });
  console.error(err.stack);
  const responseBody: { error: string; requestId?: string } = { error: 'Internal server error' };
  if (isDebugEnabled()) {
    responseBody.requestId = requestId;
  }
  res.status(500).json(responseBody);
}

export function notFoundHandler(_req: Request, res: Response): void {
  const requestId = res.locals.requestId;
  logDebug('Route not found', { requestId });
  const responseBody: { error: string; requestId?: string } = { error: 'Route not found' };
  if (isDebugEnabled()) {
    responseBody.requestId = requestId;
  }
  res.status(404).json(responseBody);
}
