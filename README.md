# EMC Reminder Service

A microservice for scheduling and managing reminders with support for email, SMS, and push notification delivery channels.

## Features

- Create, read, update, and delete reminders
- Support for multiple notification types (EMAIL, SMS, PUSH)
- Reminder status lifecycle: PENDING → SENT / CANCELLED / FAILED
- RESTful API with JSON responses
- Health check endpoint
- Docker support

## Getting Started

### Prerequisites

- Node.js 20+
- npm 9+

### Installation

```bash
npm install
```

### Configuration

Copy the example environment file and update the values:

```bash
cp .env.example .env
```

| Variable   | Default       | Description      |
|------------|---------------|------------------|
| `PORT`     | `3000`        | HTTP server port |
| `NODE_ENV` | `development` | Runtime environment |

### Running the Service

**Development:**
```bash
npm run dev
```

**Production (build first):**
```bash
npm run build
npm start
```

**Docker:**
```bash
docker-compose up
```

## API Reference

### Health Check

```
GET /health
```

Response:
```json
{ "status": "ok", "service": "emc-reminder-service", "timestamp": "..." }
```

---

### Reminders

#### List all reminders

```
GET /reminders
```

#### Get a reminder

```
GET /reminders/:id
```

#### Create a reminder

```
POST /reminders
Content-Type: application/json

{
  "title": "Team Meeting",
  "message": "Don't forget the weekly sync",
  "scheduledAt": "2030-06-01T10:00:00Z",
  "type": "EMAIL",
  "recipient": "team@example.com"
}
```

**Fields:**

| Field         | Type                      | Required | Description                          |
|---------------|---------------------------|----------|--------------------------------------|
| `title`       | string                    | Yes      | Short title for the reminder         |
| `message`     | string                    | Yes      | Reminder body text                   |
| `scheduledAt` | ISO 8601 date string      | Yes      | When to send the reminder            |
| `type`        | `EMAIL` \| `SMS` \| `PUSH` | Yes      | Notification channel                 |
| `recipient`   | string                    | Yes      | Email address, phone number, or token|

#### Update a reminder

```
PATCH /reminders/:id
Content-Type: application/json

{
  "title": "Updated Title"
}
```

#### Cancel a reminder

```
POST /reminders/:id/cancel
```

#### Delete a reminder

```
DELETE /reminders/:id
```

---

## Development

### Run tests

```bash
npm test
```

### Run linter

```bash
npm run lint
```

### Build

```bash
npm run build
```

## Reminder Status Lifecycle

```
PENDING → SENT
       → CANCELLED
       → FAILED
```