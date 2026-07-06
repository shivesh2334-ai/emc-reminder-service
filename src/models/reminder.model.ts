export enum ReminderStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

export enum ReminderType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
}

export interface Reminder {
  id: string;
  title: string;
  message: string;
  scheduledAt: Date;
  type: ReminderType;
  status: ReminderStatus;
  recipient: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReminderDto {
  title: string;
  message: string;
  scheduledAt: string | Date;
  type: ReminderType;
  recipient: string;
}

export interface UpdateReminderDto {
  title?: string;
  message?: string;
  scheduledAt?: string | Date;
  type?: ReminderType;
  recipient?: string;
}
