import { ReminderService } from '../services/reminder.service';
import { ReminderStatus, ReminderType } from '../models/reminder.model';

describe('ReminderService', () => {
  let service: ReminderService;

  beforeEach(() => {
    service = new ReminderService();
  });

  describe('create', () => {
    it('should create a reminder with PENDING status', () => {
      const reminder = service.create({
        title: 'Test Reminder',
        message: 'Test message',
        scheduledAt: new Date('2030-01-01T10:00:00Z'),
        type: ReminderType.EMAIL,
        recipient: 'test@example.com',
      });

      expect(reminder.id).toBeDefined();
      expect(reminder.title).toBe('Test Reminder');
      expect(reminder.message).toBe('Test message');
      expect(reminder.type).toBe(ReminderType.EMAIL);
      expect(reminder.status).toBe(ReminderStatus.PENDING);
      expect(reminder.recipient).toBe('test@example.com');
      expect(reminder.createdAt).toBeInstanceOf(Date);
      expect(reminder.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('findAll', () => {
    it('should return empty array initially', () => {
      expect(service.findAll()).toEqual([]);
    });

    it('should return all created reminders', () => {
      service.create({
        title: 'Reminder 1',
        message: 'Message 1',
        scheduledAt: new Date('2030-01-01'),
        type: ReminderType.EMAIL,
        recipient: 'a@example.com',
      });
      service.create({
        title: 'Reminder 2',
        message: 'Message 2',
        scheduledAt: new Date('2030-01-02'),
        type: ReminderType.SMS,
        recipient: '+1234567890',
      });

      expect(service.findAll()).toHaveLength(2);
    });
  });

  describe('findById', () => {
    it('should return the reminder by id', () => {
      const created = service.create({
        title: 'Reminder',
        message: 'Message',
        scheduledAt: new Date('2030-01-01'),
        type: ReminderType.EMAIL,
        recipient: 'test@example.com',
      });

      const found = service.findById(created.id);
      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
    });

    it('should return undefined for non-existent id', () => {
      expect(service.findById('non-existent')).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update reminder fields', () => {
      const created = service.create({
        title: 'Original Title',
        message: 'Original message',
        scheduledAt: new Date('2030-01-01'),
        type: ReminderType.EMAIL,
        recipient: 'test@example.com',
      });

      const updated = service.update(created.id, { title: 'Updated Title' });
      expect(updated?.title).toBe('Updated Title');
      expect(updated?.message).toBe('Original message');
    });

    it('should return undefined when updating non-existent reminder', () => {
      expect(service.update('non-existent', { title: 'Test' })).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('should delete an existing reminder', () => {
      const created = service.create({
        title: 'To Delete',
        message: 'Message',
        scheduledAt: new Date('2030-01-01'),
        type: ReminderType.EMAIL,
        recipient: 'test@example.com',
      });

      expect(service.delete(created.id)).toBe(true);
      expect(service.findById(created.id)).toBeUndefined();
    });

    it('should return false when deleting non-existent reminder', () => {
      expect(service.delete('non-existent')).toBe(false);
    });
  });

  describe('cancel', () => {
    it('should cancel a pending reminder', () => {
      const created = service.create({
        title: 'To Cancel',
        message: 'Message',
        scheduledAt: new Date('2030-01-01'),
        type: ReminderType.EMAIL,
        recipient: 'test@example.com',
      });

      const cancelled = service.cancel(created.id);
      expect(cancelled?.status).toBe(ReminderStatus.CANCELLED);
    });

    it('should return undefined when cancelling non-existent reminder', () => {
      expect(service.cancel('non-existent')).toBeUndefined();
    });
  });

  describe('markAsSent', () => {
    it('should mark reminder as sent', () => {
      const created = service.create({
        title: 'To Send',
        message: 'Message',
        scheduledAt: new Date('2030-01-01'),
        type: ReminderType.EMAIL,
        recipient: 'test@example.com',
      });

      const sent = service.markAsSent(created.id);
      expect(sent?.status).toBe(ReminderStatus.SENT);
    });
  });

  describe('getPendingReminders', () => {
    it('should return only pending reminders past their scheduled time', () => {
      service.create({
        title: 'Past reminder',
        message: 'Message',
        scheduledAt: new Date('2000-01-01'),
        type: ReminderType.EMAIL,
        recipient: 'test@example.com',
      });
      service.create({
        title: 'Future reminder',
        message: 'Message',
        scheduledAt: new Date('2099-01-01'),
        type: ReminderType.EMAIL,
        recipient: 'test@example.com',
      });

      const pending = service.getPendingReminders();
      expect(pending).toHaveLength(1);
      expect(pending[0].title).toBe('Past reminder');
    });
  });
});
