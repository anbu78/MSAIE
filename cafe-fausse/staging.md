# Staging

This project is currently only run locally (localhost). No staging/public
deployment has been created.

To deploy a staging version, a reasonable path is:
- Frontend: deploy `frontend/` (static build output from `npm run build`) to
  a static host such as Vercel, Netlify, or GitHub Pages.
- Backend: deploy `backend/` as a Flask app to a host such as Render,
  Railway, Fly.io, or a small VM, with a managed PostgreSQL instance (e.g.
  Render Postgres, Supabase, or Amazon RDS).
- Set `VITE_API_BASE_URL` (frontend) to the deployed backend's public URL,
  and `CORS_ORIGINS` (backend) to the deployed frontend's public URL.
