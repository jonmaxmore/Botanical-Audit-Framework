# GACP Frontend (Next.js 15)

Modern frontend for the GACP platform built with Next.js 15, React 18, Material UI, and Tailwind CSS. This app powers the farmer and administrative portals that connect to the Express backend on port 5000.

## Requirements

- Node.js 18.17.0 or later (Node 20 LTS recommended)
- npm 9.6.7+ or pnpm 8+ (project scripts assume npm)
- Backend API available locally at `http://localhost:5000` or override with env vars

## Install Dependencies

```bash
npm install
```

## Scripts

| Command                   | Purpose                                               |
| ------------------------- | ----------------------------------------------------- |
| `npm run dev`             | Start Next.js in development mode on port 3000        |
| `npm run build`           | Produce a production build in `.next/`                |
| `npm run start`           | Launch the production bundle (after `npm run build`)  |
| `npm run lint`            | Run ESLint checks                                     |
| `npm run type-check`      | Execute TypeScript type checks without emitting files |
| `npm run test:e2e`        | Run Playwright end-to-end suite (headless)            |
| `npm run test:e2e:ui`     | Open Playwright UI runner                             |
| `npm run test:e2e:headed` | Run Playwright tests with a visible browser           |
| `npm run test:e2e:chrome` | Playwright tests in Chromium only                     |
| `npm run test:e2e:report` | View the latest Playwright HTML report                |

## Environment Variables

Copy `.env.example` to `.env.local` for local development and update values.

| Variable                       | Required | Description                                                    |
| ------------------------------ | -------- | -------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`          | Yes      | Base URL for the backend API (default `http://localhost:5000`) |
| `NEXT_PUBLIC_API_TIMEOUT`      | No       | HTTP timeout in milliseconds (default `30000`)                 |
| `NEXT_PUBLIC_ENABLE_MOCK_DATA` | No       | Set to `true` to enable mock data sources                      |
| `NEXT_PUBLIC_LOG_LEVEL`        | No       | Client log verbosity (`debug`, `info`, `warn`, `error`)        |

For production builds, set the same variables in the hosting environment or extend the root `.env.production.template`.

## Running Locally

```bash
npm run dev
```

The application will start on `http://localhost:3000`. Ensure the backend API is running and accessible at the URL specified in `NEXT_PUBLIC_API_URL`.

## Production Build & Preview

```bash
npm run build
npm run start
```

This runs the optimized Next.js build with the standalone output configured in `next.config.js`.

## Docker Build

A multi-stage Dockerfile is included for production deployments.

```bash
# Build image
docker build -t gacp-frontend:latest .

# Run container (requires backend reachable from container)
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.example.com \
  gacp-frontend:latest
```

## Project Structure (excerpt)

```
frontend-nextjs/
├── src/
│   ├── app/               # App Router pages/layouts
│   ├── components/        # Shared UI components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities and API clients
│   └── types/             # TypeScript definitions
├── public/                # Static assets (favicons, images)
├── Dockerfile             # Production image definition
├── next.config.js         # Performance and build configuration
├── tailwind.config.ts     # Tailwind setup
├── playwright.config.ts   # E2E configuration
└── package.json
```

## Quality Checks

Run before committing or opening a PR:

```bash
npm run lint
npm run type-check
npm run build
```

Optional but recommended: `npm run test:e2e` (requires Playwright browsers installed via `npx playwright install`).

## Integration Notes

- Default backend URL: `http://localhost:5000`
- Update `NEXT_PUBLIC_API_URL` for staging/production deployments
- API client resides under `src/lib/api` and respects the environment variables above

## Additional References

- Next.js docs: https://nextjs.org/docs
- Material UI docs: https://mui.com/
- Tailwind CSS docs: https://tailwindcss.com/docs
- Playwright docs: https://playwright.dev/docs
