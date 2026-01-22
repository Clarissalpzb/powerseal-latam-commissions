# PowerSeal LATAM Commissions - Session Notes
**Date:** January 20-22, 2026

---

## Project Overview

**Repository:** https://github.com/Clarissalpzb/powerseal-latam-commissions
**Live URL:** https://powerseal-commissions.onrender.com
**Project Name on Render:** PowerSeal LATAM

### Tech Stack
- React 18 + TypeScript + Vite
- Redux Toolkit (state management)
- TailwindCSS (styling)
- localStorage (temporary persistence, will migrate to PostgreSQL)

---

## Login Credentials

**Email:** `roberto.cosio@company.com`
**Password:** Any password works (mock authentication)

**Role:** Salesperson (3% commission rate)

*Note: The mock auth system only has Roberto Cosio implemented. Sarah Manager mentioned in CLAUDE.md is not in the code.*

---

## Deployment to Render

### Setup Details
- **Service Type:** Static Site
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`
- **Region:** Global

### GitHub Connection
The repo was connected via "Public Git Repository" option because:
- Render was connected to a different GitHub account (0xCharlieBrown)
- The repo needed to be made **public** temporarily for Render to access it

**Important:** For future deployments with code changes, you need to either:
1. Keep the repo public, OR
2. Configure Render's GitHub App to have access to your Clarissalpzb account

### Manual Deploy
To deploy new changes:
1. Go to https://dashboard.render.com
2. Find "PowerSeal LATAM" project
3. Click on "powerseal-commissions" service
4. Click "Manual Deploy" > "Deploy latest commit"

---

## Changes Made This Session

### 1. Build Error Fixes (Previous Session)
Fixed TypeScript errors that prevented Render deployment:

**package.json** - Added missing dependency:
```json
"@headlessui/react": "^1.7.18"
```

**src/features/salesperson/components/ActionsMenu.tsx** - Fixed implicit any types:
```typescript
// Lines 115 and 135 changed from:
{({ active }) => (
// To:
{({ active }: { active: boolean }) => (
```

**src/features/salesperson/components/SubmissionsList.tsx** - Removed unused function `getStatusBadge`

### 2. Typography Updates (This Session)
Updated typography to match Rheia Medical's lighter style.

**src/styles/globals.css** - Added base typography layer:
```css
@layer base {
  body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    @apply text-secondary-600 font-normal;
  }

  h1, h2, h3, h4, h5, h6 {
    @apply font-medium text-secondary-800;
  }

  h1 {
    @apply text-2xl tracking-tight;
  }

  h2 {
    @apply text-xl tracking-tight;
  }

  h3 {
    @apply text-lg;
  }

  p {
    @apply text-secondary-500 leading-relaxed;
  }
}
```

Also changed `.status-badge` from `font-bold` to `font-medium`.

**src/features/salesperson/Dashboard.tsx:**
- Changed header from `font-semibold text-gray-900` to `font-medium text-gray-800`

**src/features/salesperson/components/Analytics.tsx:**
- Changed KPI values from `font-semibold text-gray-900` to `font-medium text-gray-800`
- Changed section headings from `font-semibold text-gray-900` to `font-medium text-gray-800`
- Updated all h3 headings to use `text-gray-800`

**src/features/manager/Dashboard.tsx:**
- Same typography changes as salesperson dashboard

---

## Git Commits Made

1. `27fb9d8` - Fix build errors for Render deployment
2. `9a7cd22` - Update typography to lighter, modern style (base CSS)
3. `fb4d4d6` - Apply lighter typography throughout components

---

## Long-Term Vision (From User)

PowerSeal is meant to be a "Sales Command Center" with three layers:

1. **Territory Intelligence** (Future)
   - Map visualization
   - DENUE data integration (INEGI's Mexican business database)

2. **Sales Tools** (Future)
   - CRM integration
   - Quotes system
   - Odoo integration

3. **Performance & Rewards** (Current - CommissionHub)
   - Commission tracking
   - Submission workflow
   - Payment management

---

## Commission Calculation Rules

Based on payment days from invoice date:
- **0-45 days:** 100% commission
- **46-60 days:** 70% commission
- **61-90 days:** 50% commission
- **90+ days:** 0% commission

---

## Useful Commands

```bash
# Development
npm run dev       # Start dev server (localhost:5173)
npm run build     # Build for production
npm run preview   # Preview production build

# Git
git push origin main  # Push changes (triggers Render deploy if repo is public)
```

---

## Files Structure

```
src/
├── components/           # Shared components
├── features/
│   ├── auth/            # Login.tsx
│   ├── salesperson/     # Salesperson dashboard & components
│   │   ├── Dashboard.tsx
│   │   └── components/
│   │       ├── Analytics.tsx
│   │       ├── SubmissionForm.tsx
│   │       ├── SubmissionsList.tsx
│   │       ├── ActionsMenu.tsx
│   │       └── EditSubmissionModal.tsx
│   └── manager/         # Manager dashboard & components
├── hooks/               # useAuth.ts
├── store/               # Redux store & slices
├── styles/              # globals.css
├── types/               # TypeScript types
└── utils/               # currency.ts, etc.
```

---

## Notes

- The typography changes need a **Manual Deploy** on Render to go live
- The GitHub repo may need to be public for Render to pull new code
- All data is stored in localStorage (will be lost if browser data is cleared)
