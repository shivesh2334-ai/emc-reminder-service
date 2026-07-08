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
