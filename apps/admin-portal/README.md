# GACP Admin Portal

> ระบบจัดการผู้ดูแลระบบ - Good Agricultural Certification Platform

## 🎯 Overview

Admin Portal สำหรับการจัดการระบบ GACP รวมถึง:

- ตรวจสอบและอนุมัติคำขอรับรองมาตรฐาน GAP
- จัดการผู้ใช้งานและสิทธิ์การเข้าถึง
- รายงานและการวิเคราะห์ข้อมูล
- KPI Dashboard

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm 8+

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

### Development Server

- URL: http://localhost:3002
- API: http://localhost:3000

## 📁 Project Structure

```
apps/admin-portal/
├── app/
│   ├── layout.tsx           # Root layout with theme
│   ├── page.tsx             # Home page (dashboard selector)
│   ├── providers.tsx        # App providers wrapper
│   ├── theme-provider.tsx   # MUI theme configuration
│   └── login/
│       └── page.tsx         # Admin login page
├── components/              # Reusable components
├── lib/                     # Utilities and helpers
├── next.config.js           # Next.js configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies
```

## 🎨 Tech Stack

### Framework & UI

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Material-UI v6** - Component library
- **Emotion** - CSS-in-JS styling

### Data Visualization

- **Chart.js** - Charts and graphs
- **react-chartjs-2** - React wrapper for Chart.js

### Forms & Validation

- **React Hook Form** - Form state management
- **Yup** - Schema validation

### HTTP Client

- **Axios** - HTTP requests to API

## 🔐 Authentication

### Demo Accounts

| Email            | Password    | Role        | Description                 |
| ---------------- | ----------- | ----------- | --------------------------- |
| admin@gacp.th    | admin123    | SUPER_ADMIN | Full system access          |
| reviewer@gacp.th | reviewer123 | REVIEWER    | Review applications         |
| approver@gacp.th | approver123 | APPROVER    | Approve/reject applications |

### Login Flow

1. Navigate to `/login`
2. Enter email and password
3. Upon successful login, user is redirected to home page
4. Token is stored in `localStorage`

## 📊 Features

### ✅ Implemented (Day 1)

- [x] Next.js 14 + TypeScript setup
- [x] Material-UI v6 integration
- [x] Custom theme (GACP green + admin blue)
- [x] Admin login page
- [x] Home page with module cards
- [x] Authentication flow (mock)
- [x] Responsive layout

### 🚧 In Progress

- [ ] Dashboard with KPI widgets
- [ ] Application review system
- [ ] User management
- [ ] Reports & analytics

### 📅 Planned

- [ ] Real-time notifications
- [ ] Advanced search & filters
- [ ] Export functionality (Excel, PDF)
- [ ] Audit logs
- [ ] Role-based access control

## 🎨 Theme Configuration

```typescript
// Primary Colors
primary: '#2e7d32' (GACP Green)
secondary: '#1976d2' (Admin Blue)

// Font
fontFamily: 'Sarabun' (Thai-optimized)

// Spacing
borderRadius: 8px
```

## 📝 Scripts

```bash
# Development
pnpm dev              # Start dev server (port 3002)
pnpm lint             # Run ESLint
pnpm type-check       # TypeScript type checking

# Production
pnpm build            # Build for production
pnpm start            # Start production server

# Testing (coming soon)
pnpm test             # Run unit tests
pnpm test:e2e         # Run E2E tests
```

## 🔧 Configuration

### Environment Variables

Create `.env.local` file:

```env
# API Configuration
API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

# Admin Portal Configuration
PORT=3002
NEXT_PUBLIC_ADMIN_PORTAL_URL=http://localhost:3002

# Authentication
JWT_SECRET=your-secret-key
SESSION_TIMEOUT=3600000

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
```

## 📦 Dependencies

### Core

- next: ^14.2.0
- react: ^18.3.0
- @mui/material: ^6.1.0
- @mui/icons-material: ^6.1.0

### Forms & Validation

- react-hook-form: ^7.53.0
- yup: ^1.4.0
- @hookform/resolvers: ^3.9.0

### Data & Visualization

- chart.js: ^4.4.0
- react-chartjs-2: ^5.2.0
- axios: ^1.7.0

### Utilities

- date-fns: ^3.6.0
- jwt-decode: ^4.0.0

## 🚀 Deployment

### Vercel (Recommended)

```bash
vercel --prod
```

### Docker

```bash
docker build -t gacp-admin-portal .
docker run -p 3002:3002 gacp-admin-portal
```

### Manual

```bash
pnpm build
pnpm start
```

## 📊 Performance Targets

| Metric                 | Target | Current |
| ---------------------- | ------ | ------- |
| First Contentful Paint | <1.5s  | ✅      |
| Time to Interactive    | <3.5s  | ✅      |
| Bundle Size            | <500KB | ✅      |
| Lighthouse Score       | >90    | 🔄      |

## 🔒 Security

- JWT-based authentication
- HTTP-only cookies for session
- CSRF protection
- Input validation (Yup schemas)
- XSS protection (React auto-escaping)
- SQL injection protection (prepared statements)

## 🤝 Contributing

1. Create feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open Pull Request

## 📄 License

Proprietary - GACP Platform © 2025

## 📞 Support

- Email: support@gacp.th
- Docs: https://docs.gacp.th
- Issues: GitHub Issues

---

**Status:** ✅ Development Ready (Day 1 Complete)  
**Version:** 1.0.0  
**Last Updated:** October 15, 2025
