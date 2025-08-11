FULL project ready for Vercel (Next.js app-router + serverless API)
-----------------------------------------------------------------
Files created on desktop in folder: coin-claim-website-next-vercel-ready

Important steps after generating ZIP:
1) Open the folder and inspect .env.example. DO NOT commit real .env in repo.
2) Upload this project to GitHub or ZIP and import to Vercel.
3) On Vercel Project -> Settings -> Environment Variables, add:
   DISCORD_PUBLIC_KEY, DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID, GUILD_ID, DISCORD_WEBHOOK_URL, BASE_URL,
   API_LINK4M, API_YEUMONEY, API_BBMKTS, ADMIN_SECRET
4) Deploy on Vercel.
5) After deploy go to https://<YOUR_PROJECT>.vercel.app/admin and login with ADMIN_SECRET.
   - From admin you can click "Đăng ký lệnh" to register slash commands.
6) Test on Discord: /getcoin -> bot should DM a short link -> follow link -> claim page shows status and adds 150 coin.
7) For weekly reset, use Vercel scheduled function or external cron to GET /api/cron/reset.