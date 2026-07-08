import { v4 as uuidv4 } from 'uuid';
import {
  Reminder,
  CreateReminderDto,
  UpdateReminderDto,
  ReminderStatus,
} from '../models/reminder.model';
import { logDebug } from '../utils/debug-logger';

export class ReminderService {
  private reminders: Map<string, Reminder> = new Map();

  create(dto: CreateReminderDto): Reminder {
    const now = new Date();
    const reminder: Reminder = {
      id: uuidv4(),
      title: dto.title,
      message: dto.message,
      scheduledAt: new Date(dto.scheduledAt),
      type: dto.type,
      status: ReminderStatus.PENDING,
      recipient: dto.recipient,
      createdAt: now,
      updatedAt: now,
    };
    this.reminders.set(reminder.id, reminder);
    logDebug('Reminder created in service', {
      reminderId: reminder.id,
      scheduledAt: reminder.scheduledAt.toISOString(),
    });
    return reminder;
  }

  findAll(): Reminder[] {
    return Array.from(this.reminders.values());
  }

  findById(id: string): Reminder | undefined {
    return this.reminders.get(id);
  }

  update(id: string, dto: UpdateReminderDto): Reminder | undefined {
    const reminder = this.reminders.get(id);
    if (!reminder) {
      logDebug('Reminder update requested for missing id', { reminderId: id });
      return undefined;
    }

    const updated: Reminder = {
      ...reminder,
      ...dto,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : reminder.scheduledAt,
      updatedAt: new Date(),
    };

    this.reminders.set(id, updated);
    logDebug('Reminder updated in service', { reminderId: id });
    return updated;
  }

  delete(id: string): boolean {
    const deleted = this.reminders.delete(id);
    logDebug('Reminder delete attempted in service', { reminderId: id, deleted });
    return deleted;
  }

  cancel(id: string): Reminder | undefined {
    const reminder = this.reminders.get(id);
    if (!reminder) {
      logDebug('Reminder cancel requested for missing id', { reminderId: id });
      return undefined;
    }

    const updated: Reminder = {
      ...reminder,
      status: ReminderStatus.CANCELLED,
      updatedAt: new Date(),
    };

    this.reminders.set(id, updated);
    logDebug('Reminder cancelled in service', { reminderId: id });
    return updated;
  }

  markAsSent(id: string): Reminder | undefined {
    const reminder = this.reminders.get(id);
    if (!reminder) {
      logDebug('Reminder mark as sent requested for missing id', { reminderId: id });
      return undefined;
    }

    const updated: Reminder = {
      ...reminder,
      status: ReminderStatus.SENT,
      updatedAt: new Date(),
    };

    this.reminders.set(id, updated);
    logDebug('Reminder marked sent in service', { reminderId: id });
    return updated;
  }

  getPendingReminders(): Reminder[] {
    return this.findAll().filter(
      (r) => r.status === ReminderStatus.PENDING && new Date(r.scheduledAt) <= new Date()
    );
  }
}
