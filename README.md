Coin Claim Website - Vercel-ready (Express)
------------------------------------------

Files included:
- server.js (main Express app)
- package.json
- vercel.json
- .env.example (placeholders)
- public/logo.svg
- scripts/register-commands.js

Quick start (local):
1. Copy .env.example -> .env and fill in your DISCORD_* values.
2. npm install
3. npm start
4. Run node scripts/register-commands.js once to register slash commands to your guild.

Deploy to Vercel:
1. Create a new project on Vercel and upload this repository or connect GitHub.
2. Set Environment Variables on Vercel from .env.example (do NOT commit .env).
3. Deploy. Vercel will use vercel.json to run server.js via @vercel/node.
4. After deploy, run register-commands.js locally (with env set) to register the slash commands.