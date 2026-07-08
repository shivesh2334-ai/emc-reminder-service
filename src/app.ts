import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { randomUUID } from 'crypto';
import { reminderRouter } from './routes/reminder.routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { isDebugEnabled, logDebug } from './utils/debug-logger';

export function createApp(): express.Application {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use((req, res, next) => {
    const requestId = randomUUID();
    res.locals.requestId = requestId;

    if (!isDebugEnabled()) {
      next();
      return;
    }

    const startedAt = Date.now();

    logDebug('Incoming request', {
      requestId,
      method: req.method,
      path: req.path,
    });

    res.on('finish', () => {
      logDebug('Request completed', {
        requestId,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        durationMs: Date.now() - startedAt,
      });
    });

    next();
  });

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'emc-reminder-service', timestamp: new Date().toISOString() });
  });

  app.use('/reminders', reminderRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
