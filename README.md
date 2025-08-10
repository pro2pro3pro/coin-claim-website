
README - coin-claim-website-final
---------------------------------
Quick start:

1) unzip and place on your server or use Vercel. This package runs as a simple express server for local testing.
2) Install deps: npm install
3) Run locally: npm run dev
4) To register commands: POST to /api/register-commands after setting env (or run curl -X POST https://your-host/api/register-commands)
5) Deploy on Vercel: create project from this repo, set Environment Variables from .env, then deploy.
6) Set a weekly cron to call /api/cron/reset to reset normal coins.

Notes:
- This is a compact full implementation using SQLite and the shortener APIs you provided.
- For production, rotate Discord tokens after testing since they were included here.
