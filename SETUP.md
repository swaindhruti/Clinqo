# Clinqo Platform Setup Guide

Welcome to the Clinqo platform setup guide! This document provides a step-by-step walkthrough to get the entire ecosystem up and running locally, including the Python backend, the Next.js frontend dashboard, the Node.js WhatsApp bot, and all necessary port forwarding tunnels.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Docker](https://www.docker.com/) & Docker Compose
- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/)
- [Cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) (for Cloudflare Tunnels)
- [ngrok](https://ngrok.com/)

---

## Step 1: Start the Backend Server (WhatsApp-backend)

The backend is built with FastAPI and runs inside a Docker container alongside a PostgreSQL database and Redis caching layer.

1.  Open a terminal and navigate to the backend directory:
    ```bash
    cd apps/Whatsapp-backend
    ```
2.  Ensure your `.env` file is properly configured.
3.  Start the services using Docker Compose:

    ```bash
    docker-compose up --build -d
    ```

    _The backend will now be running locally on port `8000`._

4.  **Expose the Backend via Cloudflare Tunnel**:
    Open a new terminal and run:
    ```bash
    cloudflared tunnel --url http://localhost:8000
    ```
    _(Keep this terminal open. Note the generated Cloudflare URL, as it will be used by the frontend and the bot.)_

---

## Step 2: Start the Web Dashboard (apps/web)

The frontend is a Next.js application that provides the Doctor, Clinic, and Admin dashboards.

1.  Open a new terminal and navigate to the web app directory:
    ```bash
    cd apps/web
    ```
2.  Configure your environment variables. Create or edit `.env.local`:
    ```env
    # Point this to your localhost or your newly generated Cloudflare backend URL
    NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
    ```
3.  Install dependencies and start the development server:

    ```bash
    pnpm install
    pnpm run dev
    ```

    _The dashboard will now be running locally on port `3000`._

4.  **(Optional) Expose the Frontend via Cloudflare Tunnel**:
    If you need to view the frontend on an external device (like a mobile phone):
    ```bash
    cloudflared tunnel --url http://localhost:3000
    ```

---

## Step 3: Start the WhatsApp Registration Bot (clinqo-registration)

This is the Node.js Express server that interfaces directly with the Meta WhatsApp API to handle patient interactions.

1.  Open a new terminal and navigate to the prebuilt bot directory:
    ```bash
    cd apps/clinqo-registration/Prebuilt
    ```
2.  Ensure your `.env` file is properly configured with your Meta Application credentials and the Backend API URL:
    ```env
    WEBHOOK_VERIFY_TOKEN="your_verify_token"
    GRAPH_API_TOKEN="your_graph_api_token"
    PORT=8080
    API_BASE_URL="http://localhost:8000/api/v1" # Or your backend Cloudflare URL
    ```
3.  Install dependencies (if not already done) and start the bot:

    ```bash
    npm install
    node index.js
    ```

    _The bot webhook server will now be running locally on port `8080`._

4.  **Expose the Bot Webhook via ngrok**:
    The Meta developer portal REQUIRES a public HTTPS endpoint. Open a final terminal window and run:

    ```bash
    ngrok http 8080
    ```

    _(Keep this terminal open. Copy the generated `https://...ngrok-free.app` URL.)_

5.  **Update Meta Developer Portal**:
    Go to your Meta Developer Dashboard -> WhatsApp -> Configuration. Update your Webhook Callback URL to the ngrok URL you just generated (append `/webhook`, e.g., `https://example.ngrok.app/webhook`) and verify it using your `WEBHOOK_VERIFY_TOKEN`.

---

## Step 4: Seed the Database (Optional but Recommended)

To populate the database with sandbox doctors and their availability (so you have something to test the bot against), run the setup script:

```bash
cd apps/setup-script
bash seed_db.sh
```

## You are all set! 🎉

You can now send a message to your WhatsApp test number to start the interactive booking process, and view the results live on your Next.js dashboard at `http://localhost:3000`.
