# GACP Platform - Next.js 14 Frontend

## 🚀 เทคโนโลยี

- **Next.js 14.2.18** - React Framework with App Router
- **React 18.3.1** - UI Library
- **TypeScript 5.7.2** - Type Safety
- **Tailwind CSS 3.4.17** - Utility-First CSS
- **Material-UI v6** - Component Library
- **Axios** - HTTP Client

## 📦 การติดตั้ง

```bash
npm install
```

## 🏃 การรันโปรเจกต์

### Development Mode

```bash
npm run dev
```

Server จะรันที่: http://localhost:3000

### Production Build

```bash
npm run build
npm start
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

## 📁 โครงสร้างโปรเจกต์

```
frontend-nextjs/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root Layout
│   │   ├── page.tsx            # Home Page (redirects)
│   │   ├── globals.css         # Global Styles
│   │   ├── providers.tsx       # Theme Provider
│   │   ├── farmer/
│   │   │   └── dashboard/
│   │   │       └── page.tsx    # Farmer Dashboard
│   │   └── dtam/
│   │       └── dashboard/
│   │           └── page.tsx    # DTAM Dashboard
│   ├── components/             # Reusable Components
│   ├── lib/                    # Utilities
│   ├── hooks/                  # Custom Hooks
│   ├── types/                  # TypeScript Types
│   └── api/                    # API Client
├── public/                     # Static Files
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.mjs
└── .env.local
```

## 🎨 สี Theme (GACP Brand)

- **Primary (Green)**: `#4caf50`
- **Secondary (Orange)**: `#ff9800`
- **Success**: `#4caf50`
- **Warning**: `#ff9800`
- **Error**: `#f44336`
- **Info**: `#2196f3`

## 🔗 API Endpoints

Backend API: `http://localhost:3004`

### Farmer Endpoints

- `GET /api/farmer/documents` - List documents
- `POST /api/farmer/documents` - Upload document
- `GET /api/farmer/reports` - List reports
- `POST /api/farmer/reports/generate` - Generate report
- `GET /api/farmer/dashboard-v2` - Dashboard data

### DTAM Endpoints

- `GET /api/dtam/documents` - Admin view documents
- `PUT /api/dtam/documents/:id/approve` - Approve document
- `GET /api/dtam/reports` - Admin view reports
- `GET /api/dtam/dashboard-v2` - Admin dashboard data

## ✅ Version Fixes Applied

1. ✅ **Next.js 14.2.18** (stable release)
2. ✅ **React 18.3.1** (compatible with Next.js 14)
3. ✅ **Material-UI v6.1.9** (latest stable)
4. ✅ **TypeScript 5.7.2** (latest stable)
5. ✅ **Tailwind CSS 3.4.17** (latest stable)
6. ✅ **forceConsistentCasingInFileNames: true** (bug fix)
7. ✅ **Zero Vite dependencies** (completely removed)

## 🚫 Removed

- ❌ Vite
- ❌ @vitejs/plugin-react
- ❌ All Vite-related configurations

## 📝 Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3004
NEXT_PUBLIC_API_TIMEOUT=30000
NODE_ENV=development
NEXT_PUBLIC_ENABLE_MOCK_DATA=false
```

## 🎯 Next Steps (PM Plan - Week 1)

### Day 1-2: Setup ✅ COMPLETE

- [x] Next.js 14 project created
- [x] TypeScript configured
- [x] Tailwind CSS integrated
- [x] Material-UI v6 integrated
- [x] Version conflicts fixed
- [x] Vite removed

### Day 3-5: Template Customization (Next)

- [ ] Choose Material Dashboard template
- [ ] Customize theme colors
- [ ] Create navigation layout
- [ ] Setup routing structure

### Week 2: Document Module UI

- [ ] Document upload page
- [ ] Document list page
- [ ] Document details page
- [ ] DTAM approval interface

### Week 2-3: Report Module UI

- [ ] Report generation form
- [ ] Report list page
- [ ] Download functionality
- [ ] DTAM system reports

### Week 3: Dashboard Module UI

- [ ] Farmer dashboard v2 (charts)
- [ ] DTAM dashboard v2 (admin stats)

### Week 3-4: API Integration

- [ ] Integrate 6 API endpoints
- [ ] Authentication handling
- [ ] Error handling
- [ ] Loading states

### Week 4: Testing & Deployment

- [ ] Full testing
- [ ] Performance optimization
- [ ] Production build
- [ ] Deployment guide

## 📚 Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Material-UI Docs](https://mui.com/material-ui/)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)

## 🐛 Known Issues

None currently. All version conflicts have been resolved.

## 👨‍💻 Development Team

- **PM**: Project Manager (decisions on features)
- **UX/UI Designer**: Not required (using template approach)
- **Frontend Developer**: Implementation (you/team)
- **SA**: Backend support (API integration assistance)

---

**Status**: ✅ Day 1-2 COMPLETE - Next.js 14 + Tailwind CSS setup ready for Week 1 development
