# Deployment Instructions

## Intended deployment URLs
- Frontend: `https://playful-twilight-1d00f3.netlify.app/`
- Backend: `https://learnova-tutor-api.onrender.com`
- API base: `https://learnova-tutor-api.onrender.com/api`

Verify these URLs are still current before submitting.

## Netlify frontend
1. From `frontend/`, run `npm run build`.
2. Confirm the `dist/` directory was generated.
3. Set the Netlify environment variable:
   `VITE_API_URL=https://learnova-tutor-api.onrender.com/api`
4. Rebuild after changing the variable.
5. For manual Netlify Drop deployment, upload the **contents of `frontend/dist/`** to the intended site.
6. Test the deployed website in a private/incognito window.

## Render backend
Set the variables required by the code in the Render service dashboard. Known variable names include `NODE_ENV`, `PORT`, `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, and optional AI configuration such as `AI_TUTOR_PROVIDER`, `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `OPENAI_MODEL`.

Set the allowed frontend origin to:
`FRONTEND_URL=https://playful-twilight-1d00f3.netlify.app`

Confirm the CORS middleware reads `FRONTEND_URL`. Never include actual secrets in public docs or screenshots.

## PostgreSQL
1. Create a PostgreSQL database.
2. Set `DATABASE_URL` in the backend host.
3. Apply migrations from `database/migrations/` in order.
4. Confirm database connectivity from the health endpoint/logs.
5. Use synthetic demo records only.

## Post-deployment checks
- [ ] `GET /api/health` succeeds.
- [ ] Frontend requests use the deployed API, not localhost.
- [ ] CORS accepts the exact Netlify origin.
- [ ] Registration succeeds.
- [ ] Login succeeds.
- [ ] Lesson, AI tutor, practice and revision flows work where implemented.
- [ ] No API keys/passwords are exposed.

## Known issue
A deployed login request previously returned HTTP 500. Reproduce it, inspect Render logs, fix the underlying cause, redeploy, and retest before claiming production readiness.
