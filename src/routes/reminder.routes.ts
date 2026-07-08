import { Router, Request, Response } from 'express';
import { ReminderService } from '../services/reminder.service';
import { CreateReminderDto, UpdateReminderDto, ReminderType } from '../models/reminder.model';
import { logDebug } from '../utils/debug-logger';

const router = Router();
const reminderService = new ReminderService();

function getRequestId(res: Response): string | undefined {
  return res.locals.requestId;
}

function isValidReminderType(type: string): type is ReminderType {
  return Object.values(ReminderType).includes(type as ReminderType);
}

function validateCreateDto(dto: Partial<CreateReminderDto>): string[] {
  const errors: string[] = [];
  if (!dto.title || typeof dto.title !== 'string') {
    errors.push('title is required and must be a string');
  }
  if (!dto.message || typeof dto.message !== 'string') {
    errors.push('message is required and must be a string');
  }
  if (!dto.scheduledAt) {
    errors.push('scheduledAt is required');
  } else if (isNaN(new Date(dto.scheduledAt).getTime())) {
    errors.push('scheduledAt must be a valid date');
  }
  if (!dto.type) {
    errors.push('type is required');
  } else if (!isValidReminderType(dto.type)) {
    errors.push(`type must be one of: ${Object.values(ReminderType).join(', ')}`);
  }
  if (!dto.recipient || typeof dto.recipient !== 'string') {
    errors.push('recipient is required and must be a string');
  }
  return errors;
}

// GET /reminders
router.get('/', (_req: Request, res: Response) => {
  const reminders = reminderService.findAll();
  logDebug('Listed reminders', { requestId: getRequestId(res), count: reminders.length });
  res.json({ data: reminders, count: reminders.length });
});

// GET /reminders/:id
router.get('/:id', (req: Request, res: Response) => {
  const reminder = reminderService.findById(req.params.id);
  if (!reminder) {
    logDebug('Reminder lookup failed', { requestId: getRequestId(res), reminderId: req.params.id });
    res.status(404).json({ error: 'Reminder not found' });
    return;
  }
  logDebug('Fetched reminder', { requestId: getRequestId(res), reminderId: req.params.id });
  res.json({ data: reminder });
});

// POST /reminders
router.post('/', (req: Request, res: Response) => {
  const errors = validateCreateDto(req.body);
  if (errors.length > 0) {
    logDebug('Reminder creation validation failed', {
      requestId: getRequestId(res),
      details: errors,
    });
    res.status(400).json({ error: 'Validation failed', details: errors });
    return;
  }

  const reminder = reminderService.create(req.body as CreateReminderDto);
  logDebug('Created reminder', { requestId: getRequestId(res), reminderId: reminder.id });
  res.status(201).json({ data: reminder });
});

// PATCH /reminders/:id
router.patch('/:id', (req: Request, res: Response) => {
  const dto: UpdateReminderDto = req.body;
  if (dto.scheduledAt && isNaN(new Date(dto.scheduledAt).getTime())) {
    logDebug('Reminder update validation failed', {
      requestId: getRequestId(res),
      reminderId: req.params.id,
      error: 'Invalid scheduledAt',
    });
    res.status(400).json({ error: 'scheduledAt must be a valid date' });
    return;
  }
  if (dto.type && !isValidReminderType(dto.type)) {
    logDebug('Reminder update validation failed', {
      requestId: getRequestId(res),
      reminderId: req.params.id,
      error: 'Invalid reminder type',
    });
    res.status(400).json({
      error: `type must be one of: ${Object.values(ReminderType).join(', ')}`,
    });
    return;
  }

  const reminder = reminderService.update(req.params.id, dto);
  if (!reminder) {
    logDebug('Reminder update failed', { requestId: getRequestId(res), reminderId: req.params.id });
    res.status(404).json({ error: 'Reminder not found' });
    return;
  }
  logDebug('Updated reminder', { requestId: getRequestId(res), reminderId: req.params.id });
  res.json({ data: reminder });
});

// POST /reminders/:id/cancel
router.post('/:id/cancel', (req: Request, res: Response) => {
  const reminder = reminderService.cancel(req.params.id);
  if (!reminder) {
    logDebug('Reminder cancel failed', { requestId: getRequestId(res), reminderId: req.params.id });
    res.status(404).json({ error: 'Reminder not found' });
    return;
  }
  logDebug('Cancelled reminder', { requestId: getRequestId(res), reminderId: req.params.id });
  res.json({ data: reminder });
});

// DELETE /reminders/:id
router.delete('/:id', (req: Request, res: Response) => {
  const deleted = reminderService.delete(req.params.id);
  if (!deleted) {
    logDebug('Reminder delete failed', { requestId: getRequestId(res), reminderId: req.params.id });
    res.status(404).json({ error: 'Reminder not found' });
    return;
  }
  logDebug('Deleted reminder', { requestId: getRequestId(res), reminderId: req.params.id });
  res.status(204).send();
});

export { router as reminderRouter, reminderService };
