READY: coin-claim-website-vercel-ready
-------------------------------------
1. Unzip / push this folder to GitHub and connect to Vercel, or upload ZIP.
2. On Vercel: set Environment Variables from .env.example (DO NOT commit real .env).
3. Deploy.
4. After deploy, run locally: node scripts/register-commands.js to register /getcoin and /checkcoin.
5. Test flow:
   - /getcoin -> bot DM shortened link -> user follows shortener -> shortener redirects to /api/out/:subid -> auto-validate -> add 150 coin -> redirect to /claim/:subid?status=success
6. Set weekly cron to call /api/cron/reset
