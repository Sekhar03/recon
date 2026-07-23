# Deploying to Vercel

This repository is pre-configured and ready for one-click deployment on [Vercel](https://vercel.com).

## 🛠 Features Configured for Vercel

1. **Vercel Serverless Function (`/api`)**:
   - The Express API backend is located at `api/index.js` and runs as a Vercel Serverless Function handling all `/api/v1/*` requests (Product catalog, Reconciliation triggering, Analytics, History logs).

2. **Frontend Build (`dist/`)**:
   - Built using Vite & React.
   - Clean production output with SPA client routing handled via `vercel.json` rewrites.

3. **Vercel Routing (`vercel.json`)**:
   - `rewrites` configured to route `/api/*` requests directly to `api/index.js`.
   - All SPA pages fall back gracefully to `index.html`.

---

## 🚀 How to Deploy

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. Push your repository to GitHub / GitLab / Bitbucket.
2. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..."** -> **"Project"**.
3. Import your repository.
4. Keep all default settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **"Deploy"**.

### Option 2: Deploy via Vercel CLI

1. Install the Vercel CLI globally (if not already installed):
   ```bash
   npm i -g vercel
   ```
2. Run the deployment command from the project root:
   ```bash
   vercel
   ```
3. Follow the prompts to link the project and deploy.
4. For production deployment:
   ```bash
   vercel --prod
   ```

---

## 🧪 Local Testing

To test locally before deploying:
- Run frontend dev server: `npm run dev`
- Run local API server: `node server/index.js`
- Or use Vercel CLI local dev: `vercel dev`
