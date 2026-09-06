# EMC Reminder Service

Appointment & Reminder Microservice

Features

- Patient Registration
- Appointment Scheduling
- SMS Reminder
- WhatsApp Reminder
- Email Reminder
- Patient Confirmation
- EMR Integration
- REST APIs
- Audit Logs
- Scheduler

## Debugging

- Set `DEBUG=true` (or `1`, `yes`, `on`, `debug`) to enable request and reminder lifecycle debug logs.
- Each request gets a `requestId` and debug logs include it for traceability.

## Vercel deployment

- Do not configure this project as `nextjs`; it is an Express/TypeScript service.
- In Vercel, use the repository root as the Root Directory.
- If a `Framework Preset` is required, select `Other`.
- The Vercel Function entry point is `api/index.ts`; all public routes are rewritten to it.

## Default recipients

- WhatsApp reminders use `9891368298` when `recipient` is omitted.
- Email reminders use `support@emc.ooo` when `recipient` is omitted.
- Override these defaults with `DEFAULT_WHATSAPP_NUMBER` and `DEFAULT_EMAIL`.
- SMS and push reminders still require an explicit `recipient`.
