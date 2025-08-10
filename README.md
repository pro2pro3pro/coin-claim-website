README - coin-claim-website-vercel-ready
---------------------------------------
1) Unzip and inspect. Place real secrets into Vercel Environment Variables (do NOT commit .env).
2) Endpoints (placeholders):
   - POST /api/discord  -> Discord interactions endpoint (must implement verifyKey and interaction logic)
   - GET  /out/:subid   -> Redirect endpoint for shortener to return users to (auto-validate)
3) To create deployment ZIP:
   Compress-Archive -Path 'C:\Users\Home\Desktop\coin-claim-website-vercel-ready\*' -DestinationPath 'C:\Users\Home\Desktop\coin-claim-website-vercel-ready.zip'
