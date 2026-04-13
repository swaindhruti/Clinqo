# Clinqo WhatsApp Bot

## Bot Flow

1. User sends message (with clinic link text like `Book an appointment <clinic_id>` or normal greeting).
2. Bot extracts clinic id, verifies clinic from core backend, and starts language + patient flow.
3. Bot shows visit type, sub-category, doctor, available dates, and slots.
4. Bot confirms details and books appointment/procedure through core backend APIs.
5. Bot stores/retrieves session state in Redis.

## Setup

Create `.env` from `.env.example` and set:

```env
PHONE_NUMBER_ID=your_phone_number_id
APP_SECRET=your_meta_access_token
VERIFY_TOKEN=your_webhook_verify_token
PORT=8080
API_BASE_URL=http://localhost:8000/api/v1
REDIS_URL=redis://default:password@host:port
```

If `REDIS_URL` is not set, bot falls back to `REDIS_HOST` and `REDIS_PORT`.

## Commands

Install and run locally:

```bash
npm install
node index.js
```

Docker build and run:

```bash
docker build -t clinqo-bot .
docker run -d --name clinqo-bot --env-file .env -p 8080:8080 --restart unless-stopped clinqo-bot
```

Docker Compose:

```bash
docker compose up -d --build
docker compose logs -f bot
docker compose down
```

Notes:

- In Docker, bot uses `http://host.docker.internal:8000/api/v1` by default so it can reach backend running on host.
- To use a different backend URL, set `BOT_API_BASE_URL` before compose up.

Syntax checks:

```bash
node --check index.js
node --check core/chatbot.js
node --check config/redis-config.js
node --check handlers/booking.js
node --check services/api.js
```
