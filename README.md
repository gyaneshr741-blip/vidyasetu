# VidyaSetu – Nagarjuna University

Unified campus portal for Nagarjuna University's **students**, **faculty**, **parents**, and **administrators**.

## Features

- **Student (`ravi`, `sita`)**: Dashboard overview, subject-wise attendance bars & condonation requests, elective course registration, examination grades & SGPA, online fee payment (demo UPI) & printable receipts, grievance portal, and notifications.
- **Faculty (`drrao`)**: Weekly workload & timetable dashboard, class attendance marking (with automatic low-attendance parent notifications), validated marks entry & result publishing, and announcements / assignment uploads.
- **Parent (`parent1`)**: Read-only child dashboard, attendance tracking, exam results, fee history/receipts, and notifications.
- **Admin (`admin`)**: Portal metrics & user directory, department attendance policies, elective registration window toggle, attendance condonation approval, grievance resolution, announcements, and eligibility reports.

All demo accounts use password `pass`. Portal state and active session persist automatically in browser `localStorage`, with safe validation and one-click demo data reset.

## Tech Stack

- **React 19** + **TypeScript** + **Vite**
- **Vitest** for domain logic unit testing
- **Vercel** static hosting with SPA rewrites and security headers (`vercel.json`)

## Local Development

```bash
npm install
npm run dev
```

Run checks and production build locally:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Environment Variables

No secrets are required. Optional public build-time overrides are documented in `.env.example`:

- `VITE_APP_NAME` (default: `VidyaSetu`)
- `VITE_UNIVERSITY_NAME` (default: `Nagarjuna University`)
- `VITE_STORAGE_KEY` (default: `vidyasetu_portal_v1`)

## Updating & Redeploying

1. Make your code changes locally and verify:
   ```bash
   npm run typecheck && npm run lint && npm test && npm run build
   ```
2. Commit and push to GitHub (`main` branch):
   ```bash
   git add .
   git commit -m "Describe your update"
   git push origin main
   ```
3. If GitHub integration is connected to your Vercel project, pushing to `main` triggers an automatic production deployment. You can also deploy directly at any time using the Vercel CLI:
   ```bash
   vercel --prod
   ```
