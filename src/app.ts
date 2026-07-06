import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { reminderRouter } from './routes/reminder.routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

export function createApp(): express.Application {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'emc-reminder-service', timestamp: new Date().toISOString() });
  });

  app.use('/reminders', reminderRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
