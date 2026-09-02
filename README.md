# Zuri Express — Frontend

*"For Kenyans, By Kenyans"* — the storefront. A React SPA (Vite + React
Router) that talks to the [zuri-express-backend](../zuri-express-backend)
REST API — no server-side rendering, no coupling to the backend beyond its
HTTP API.

## Stack

- **React 19 + TypeScript**, built with **Vite**
- **React Router** for client-side routing
- Two small React Contexts instead of a state-management library:
  - `AuthContext` — who's logged in (backed by the backend's session cookie)
  - `CartContext` — cart contents, kept in `localStorage` (the backend
    never stores carts — see its README)
- **Google Identity Services** (a script tag from Google, no npm package)
  for the "Sign in with Google" button
- Plain CSS (`src/styles/global.css`), no framework — small enough project
  that a utility framework would be more overhead than it saves

## 1. Point it at your backend

```bash
npm install
cp .env.example .env
```

Edit `.env`:

- `VITE_API_URL` — where your backend is running. Default
  `http://localhost:4000` matches the backend's default `PORT`.
- `VITE_GOOGLE_CLIENT_ID` — **the same** Client ID you put in the backend's
  `GOOGLE_CLIENT_ID`. Get one by following the backend README's "Setting up
  Google Sign-In" section (you only need to do this once — one Client ID
  covers both frontend and backend). Leave the placeholder in if you
  haven't set that up yet: the Google button shows a small "not configured"
  note in its place, and email/password login still works fine.

## 2. Run it

Start the backend first (`npm run dev` in `zuri-express-backend`), then:

```bash
npm run dev
```

Opens on `http://localhost:5173`. Make sure the backend's `.env` has
`CLIENT_ORIGIN="http://localhost:5173"` (it does by default) — the backend
only accepts cross-origin cookies from that exact origin.

**Admin login** (from the backend's seed script): `admin@zuriexpress.com` /
`ChangeMe123!`. Log in with that account and the "Admin" link appears in
the navbar.

## Project structure

```
src/
  main.tsx              Entry point — wraps App in the router + both contexts
  App.tsx                 All routes
  lib/
    api.ts                  Typed fetch wrapper for every backend endpoint
    types.ts                 TypeScript types mirroring the backend's shapes
    money.ts                  kuruş <-> TRY formatting (mirrors the backend)
  context/
    AuthContext.tsx          Current user; login/signup/logout/Google
    CartContext.tsx           Cart lines, persisted to localStorage
  components/
    Navbar.tsx, ProductCard.tsx, GoogleButton.tsx, OrderStatusBadge.tsx,
    VerifyEmailBanner.tsx, ProtectedRoute.tsx (auth-gated / admin-gated routes)
  pages/
    HomePage, ProductDetailPage, CartPage, CheckoutPage, OrdersPage,
    OrderDetailPage, LoginPage, SignupPage, VerifyEmailPage, NotFoundPage
    admin/  AdminLayout, AdminDashboardPage, AdminProductsPage,
            AdminProductFormPage (create + edit), AdminOrdersPage,
            AdminOrderDetailPage
  styles/global.css       One stylesheet, CSS custom properties for theming
```

## How auth works here

The backend issues an httpOnly session cookie — this app never sees or
stores a token itself. Every `fetch` in `src/lib/api.ts` sends
`credentials: "include"`, and `AuthContext` calls `GET /api/auth/me` once
on load to figure out if there's already a valid session (e.g. after a
page refresh).

Google Sign-In (`components/GoogleButton.tsx`) loads Google's own script,
renders their button, and gets a signed token back when clicked — that
token is POSTed to `/api/auth/google`, which verifies it and starts a
session exactly like email/password login does. No redirect flow, no
separate Google npm package.

`VerifyEmailBanner` shows a dismiss-free nudge to unverified users (backed
by `user.emailVerified`) with a resend button — it's informational only,
nothing is blocked for an unverified account.

## What's not built yet

- Guest checkout (an account is required — matches the backend, which
  requires auth on `POST /api/orders`)
- Search, product reviews, discount codes
- Real payment gateway UI (checkout only offers bank transfer / cash on
  delivery — see the backend README for why)
- Product image upload in the admin form (currently a plain image URL
  field — wire up Cloudinary/S3 later per the project's architecture notes)
- Turkish/English language toggle

## Deploying

Any static host works since this is a pure client-side SPA — Railway
(alongside the backend), Vercel, Netlify, or Cloudflare Pages are all
reasonable. Whichever you pick:

1. Set `VITE_API_URL` and `VITE_GOOGLE_CLIENT_ID` as build-time environment
   variables (Vite bakes them into the build, they're not read at runtime).
2. Build with `npm run build`, serve the `dist/` folder.
3. Update the backend's `CLIENT_ORIGIN` to this frontend's real deployed
   URL, and add that URL to the Google Cloud OAuth client's Authorized
   JavaScript origins (Google Cloud Console → Credentials → your client).
