import request from 'supertest';
import { createApp } from '../app';
import { ReminderType } from '../models/reminder.model';

const app = createApp();

describe('GET /health', () => {
  it('should return 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('emc-reminder-service');
  });
});

describe('Reminder Routes', () => {
  const validReminder = {
    title: 'Test Reminder',
    message: 'Do not forget this',
    scheduledAt: '2030-06-01T10:00:00Z',
    type: ReminderType.EMAIL,
    recipient: 'user@example.com',
  };

  describe('POST /reminders', () => {
    it('should create a reminder and return 201', async () => {
      const res = await request(app).post('/reminders').send(validReminder);
      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject({
        title: validReminder.title,
        type: validReminder.type,
        status: 'PENDING',
      });
      expect(res.body.data.id).toBeDefined();
    });

    it('should return 400 for missing required fields', async () => {
      const res = await request(app).post('/reminders').send({ title: 'Only Title' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
      expect(res.body.details).toBeInstanceOf(Array);
    });

    it('should return 400 for invalid type', async () => {
      const res = await request(app)
        .post('/reminders')
        .send({ ...validReminder, type: 'INVALID' });
      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid scheduledAt', async () => {
      const res = await request(app)
        .post('/reminders')
        .send({ ...validReminder, scheduledAt: 'not-a-date' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /reminders', () => {
    it('should return an array of reminders', async () => {
      const res = await request(app).get('/reminders');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(typeof res.body.count).toBe('number');
    });
  });

  describe('GET /reminders/:id', () => {
    it('should return a reminder by id', async () => {
      const createRes = await request(app).post('/reminders').send(validReminder);
      const id = createRes.body.data.id;

      const res = await request(app).get(`/reminders/${id}`);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(id);
    });

    it('should return 404 for non-existent id', async () => {
      const res = await request(app).get('/reminders/non-existent-id');
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /reminders/:id', () => {
    it('should update a reminder', async () => {
      const createRes = await request(app).post('/reminders').send(validReminder);
      const id = createRes.body.data.id;

      const res = await request(app)
        .patch(`/reminders/${id}`)
        .send({ title: 'Updated Title' });
      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Updated Title');
    });

    it('should return 404 for non-existent id', async () => {
      const res = await request(app)
        .patch('/reminders/non-existent')
        .send({ title: 'X' });
      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid type in update', async () => {
      const createRes = await request(app).post('/reminders').send(validReminder);
      const id = createRes.body.data.id;

      const res = await request(app)
        .patch(`/reminders/${id}`)
        .send({ type: 'INVALID' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /reminders/:id/cancel', () => {
    it('should cancel a reminder', async () => {
      const createRes = await request(app).post('/reminders').send(validReminder);
      const id = createRes.body.data.id;

      const res = await request(app).post(`/reminders/${id}/cancel`);
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('CANCELLED');
    });

    it('should return 404 for non-existent reminder', async () => {
      const res = await request(app).post('/reminders/non-existent/cancel');
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /reminders/:id', () => {
    it('should delete a reminder and return 204', async () => {
      const createRes = await request(app).post('/reminders').send(validReminder);
      const id = createRes.body.data.id;

      const res = await request(app).delete(`/reminders/${id}`);
      expect(res.status).toBe(204);
    });

    it('should return 404 when deleting non-existent reminder', async () => {
      const res = await request(app).delete('/reminders/non-existent');
      expect(res.status).toBe(404);
    });
  });
});

describe('404 handler', () => {
  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/unknown-route');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Route not found');
  });
});
