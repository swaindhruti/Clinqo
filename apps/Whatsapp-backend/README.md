# Whatsapp Backend (Core API)

## Server Flow

1. API receives request from web client or bot.
2. Router validates payload and auth dependencies.
3. Service runs business logic (clinic/doctor/patient/booking/check-in/query).
4. Repository executes DB operations.
5. API returns structured JSON response with proper status code.

## Setup

Create `.env` with:

```env
DATABASE_URL=postgresql+asyncpg://<user>:<pass>@<host>/<db>?sslmode=require
DATABASE_URL_SYNC=postgresql://<user>:<pass>@<host>/<db>?sslmode=require
LOG_LEVEL=INFO
ENVIRONMENT=production
SECRET_KEY=change-this-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=480
CORS_ORIGINS=https://clinqer.netlify.app,http://localhost:8080,http://127.0.0.1:8080
CORS_ALLOW_CREDENTIALS=false
```

## Commands

Run with Docker Compose:

```bash
docker compose up -d --build
docker compose logs -f app
```

Run without Docker:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Quick health check:

```bash
curl http://localhost:8000/health
```
