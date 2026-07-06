import { Router, Request, Response } from 'express';
import { ReminderService } from '../services/reminder.service';
import { CreateReminderDto, UpdateReminderDto, ReminderType } from '../models/reminder.model';

const router = Router();
const reminderService = new ReminderService();

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
  res.json({ data: reminders, count: reminders.length });
});

// GET /reminders/:id
router.get('/:id', (req: Request, res: Response) => {
  const reminder = reminderService.findById(req.params.id);
  if (!reminder) {
    res.status(404).json({ error: 'Reminder not found' });
    return;
  }
  res.json({ data: reminder });
});

// POST /reminders
router.post('/', (req: Request, res: Response) => {
  const errors = validateCreateDto(req.body);
  if (errors.length > 0) {
    res.status(400).json({ error: 'Validation failed', details: errors });
    return;
  }

  const reminder = reminderService.create(req.body as CreateReminderDto);
  res.status(201).json({ data: reminder });
});

// PATCH /reminders/:id
router.patch('/:id', (req: Request, res: Response) => {
  const dto: UpdateReminderDto = req.body;
  if (dto.scheduledAt && isNaN(new Date(dto.scheduledAt).getTime())) {
    res.status(400).json({ error: 'scheduledAt must be a valid date' });
    return;
  }
  if (dto.type && !isValidReminderType(dto.type)) {
    res.status(400).json({
      error: `type must be one of: ${Object.values(ReminderType).join(', ')}`,
    });
    return;
  }

  const reminder = reminderService.update(req.params.id, dto);
  if (!reminder) {
    res.status(404).json({ error: 'Reminder not found' });
    return;
  }
  res.json({ data: reminder });
});

// POST /reminders/:id/cancel
router.post('/:id/cancel', (req: Request, res: Response) => {
  const reminder = reminderService.cancel(req.params.id);
  if (!reminder) {
    res.status(404).json({ error: 'Reminder not found' });
    return;
  }
  res.json({ data: reminder });
});

// DELETE /reminders/:id
router.delete('/:id', (req: Request, res: Response) => {
  const deleted = reminderService.delete(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: 'Reminder not found' });
    return;
  }
  res.status(204).send();
});

export { router as reminderRouter, reminderService };
