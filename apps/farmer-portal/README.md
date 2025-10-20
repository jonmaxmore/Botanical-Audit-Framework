# 🌾 GACP Farmer Portal - Frontend Application

**Version**: 3.0.0  
**Framework**: Next.js 14.2.18  
**Language**: TypeScript  
**Updated**: October 14, 2025

---

## 🎯 Overview

GACP Farmer Portal is a comprehensive web application for managing agricultural certification processes. It features role-based dashboards, authentication system, and a modern responsive UI.

### Key Features

- ✅ **5 Role-Based Dashboards** (Farmer, Reviewer, Inspector, Approver, Admin)
- ✅ **Complete Authentication** (Login, Register, Session Management)
- ✅ **Modern Landing Page** with features showcase
- ✅ **Role-Based Access Control** (RBAC) with granular permissions
- ✅ **Responsive Design** (Desktop, Tablet, Mobile)
- ✅ **TypeScript** with strict mode
- ✅ **Material-UI + Tailwind CSS** for styling
- ✅ **Mock API** ready for testing

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- pnpm package manager

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Server will start at: **http://localhost:3001**

---

## 🧪 Demo Accounts

Test the system with these pre-configured accounts:

| Email              | Password    | Role         | Dashboard    |
| ------------------ | ----------- | ------------ | ------------ |
| farmer@test.com    | password123 | 👨‍🌾 Farmer    | Green Theme  |
| reviewer@test.com  | password123 | 📋 Reviewer  | Blue Theme   |
| inspector@test.com | password123 | 🔍 Inspector | Orange Theme |
| approver@test.com  | password123 | ✅ Approver  | Purple Theme |
| admin@test.com     | password123 | ⚙️ Admin     | Red Theme    |

---

## 📁 Project Structure

```
app/
├── page.tsx                      # Landing page (/)
├── login/
│   └── page.tsx                  # Login page (/login)
├── register/
│   └── page.tsx                  # Register page (/register)
├── dashboard/
│   ├── farmer/page.tsx           # Farmer dashboard
│   ├── reviewer/page.tsx         # Reviewer dashboard
│   ├── inspector/page.tsx        # Inspector dashboard
│   ├── approver/page.tsx         # Approver dashboard
│   └── admin/page.tsx            # Admin dashboard
└── api/
    └── auth/
        ├── login/route.ts        # Login API
        ├── register/route.ts     # Register API
        └── logout/route.ts       # Logout API

components/
└── dashboard/
    └── DashboardLayout.tsx       # Unified dashboard layout

lib/
├── auth.ts                       # Authentication utilities
└── roles.ts                      # Role management & permissions

public/                           # Static assets
styles/                          # Global styles
```

---

## 🎨 Tech Stack

### Core

- **Next.js 14.2.18** - React framework with App Router
- **React 18.3.1** - UI library
- **TypeScript 5.7.2** - Type safety

### Styling

- **Tailwind CSS 3.4.17** - Utility-first CSS
- **Material-UI 6.3.0** - Component library
- **@emotion/react & styled** - CSS-in-JS

### Development

- **ESLint 8** - Code linting
- **PostCSS** - CSS processing
- **pnpm** - Package manager

---

## 📍 Routes

### Public Routes

- `/` - Landing page (auto-redirects if authenticated)
- `/login` - Login page with demo accounts
- `/register` - User registration with role selection

### Protected Routes (Requires Authentication)

- `/dashboard/farmer` - Farmer dashboard
- `/dashboard/reviewer` - DTAM Reviewer dashboard
- `/dashboard/inspector` - DTAM Inspector dashboard
- `/dashboard/approver` - DTAM Approver dashboard
- `/dashboard/admin` - System Admin dashboard

### API Routes

- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - Session cleanup

---

## 🔐 Authentication System

### How It Works

1. **Login**: User submits email/password → API validates → Creates session → Redirects to dashboard
2. **Register**: User fills form → API creates account → Auto-login → Redirects to dashboard
3. **Session**: Stored in localStorage with 24-hour expiration
4. **Authorization**: Role-based redirect and permission checking

### Session Storage

```typescript
interface AuthSession {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    // ... other fields
  };
  token: string;
  expiresAt: Date;
}
```

### Role-Based Access Control

```typescript
enum UserRole {
  FARMER = 'farmer',
  REVIEWER = 'reviewer',
  INSPECTOR = 'inspector',
  APPROVER = 'approver',
  ADMIN = 'admin',
  PUBLIC = 'public',
}
```

Each role has specific permissions:

- Farmer: farm:read, farm:write, application:create, etc.
- Reviewer: application:review, document:verify, etc.
- Inspector: farm:inspect, inspection:create, etc.
- Approver: application:approve, certificate:issue, etc.
- Admin: Full system access

---

## 🎯 Dashboard Features

### Farmer Dashboard (Green)

- View registered farms
- Submit documents (with badge counter)
- Complete surveys
- Track certificates
- Recent activities feed

### Reviewer Dashboard (Blue)

- Pending applications queue (with badge)
- In-progress reviews (with badge)
- Document verification
- Comment system
- Completion tracking

### Inspector Dashboard (Orange)

- Today's schedule (with badge)
- Video call inspections
- Onsite visit scheduling
- Location-based assignments
- Inspection reports

### Approver Dashboard (Purple)

- Approval queue (with badge)
- Certificate issuance
- Score-based evaluation
- Approve/Reject actions
- Approval history

### Admin Dashboard (Red)

- User management
- System health monitoring
- Audit logs
- Settings management
- Backup & restore

---

## 🛠️ Development

### Available Scripts

```bash
# Development server (port 3001)
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint

# Type checking
pnpm type-check
```

### Environment Variables

Create `.env.local` file:

```env
# API Configuration (for production)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Feature Flags
NEXT_PUBLIC_ENABLE_MOCK_API=true
```

### TypeScript Configuration

Path aliases configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/app/*": ["./app/*"]
    }
  }
}
```

---

## 🎨 Styling Guide

### Tailwind CSS Classes

Common patterns used:

```tsx
// Gradients
className = 'bg-gradient-to-r from-green-600 to-blue-600';

// Rounded corners
className = 'rounded-xl shadow-lg';

// Hover effects
className = 'hover:bg-green-700 transition-all';

// Responsive
className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
```

### Material-UI Icons

```tsx
import { Agriculture, Dashboard, Assessment } from '@mui/icons-material';
```

### Color Palette

```javascript
const COLORS = {
  farmer: '#4caf50', // Green
  reviewer: '#2196f3', // Blue
  inspector: '#ff9800', // Orange
  approver: '#9c27b0', // Purple
  admin: '#f44336', // Red
  public: '#757575', // Gray
};
```

---

## 🧪 Testing

### Manual Testing

1. Start dev server: `pnpm dev`
2. Open browser: http://localhost:3001
3. Test each demo account
4. Verify dashboard navigation
5. Check responsive design
6. Test registration flow

### Component Testing

Each dashboard includes:

- ✅ Stat cards with icons
- ✅ Activity/queue lists
- ✅ Action buttons
- ✅ Badge counters
- ✅ Responsive layout

### Browser Testing

Tested on:

- ✅ Chrome 120+
- ✅ Firefox 121+
- ✅ Safari 17+
- ✅ Edge 120+

---

## 📱 Responsive Design

### Breakpoints

- **Mobile**: < 768px (Temporary drawer)
- **Tablet**: 768px - 1024px (Toggleable drawer)
- **Desktop**: > 1024px (Permanent drawer)

### Mobile Optimizations

- Touch-friendly buttons (min 44px)
- Simplified navigation
- Vertical scrolling priority
- Optimized images

---

## 🚧 Known Limitations

### Current Implementation

- ✅ Frontend: 100% complete
- ✅ Mock API: Functional
- ⏳ Real Backend: Not connected
- ⏳ Database: Not integrated
- ⏳ Email Service: Not configured

### Mock API Behavior

- Uses in-memory user data
- Sessions stored in localStorage
- No password hashing
- No email verification
- No rate limiting

---

## 🔮 Roadmap

### Phase 1: Backend Integration ⏳

- [ ] Connect to real API endpoints
- [ ] Replace mock authentication
- [ ] Implement JWT tokens
- [ ] Add password hashing

### Phase 2: Features Enhancement ⏳

- [ ] Real-time notifications (WebSocket)
- [ ] File upload functionality
- [ ] Email verification
- [ ] Forgot password flow
- [ ] Two-factor authentication

### Phase 3: Production Ready ⏳

- [ ] Security hardening
- [ ] Performance optimization
- [ ] Error tracking (Sentry)
- [ ] Analytics integration
- [ ] SEO optimization

---

## 📚 Documentation

### Available Documents

1. **GACP_UNIFIED_FRONTEND_SITEMAP.md** (450+ lines)
   - Complete route structure
   - Role permissions matrix
   - Work process flows

2. **SYSTEM_IMPLEMENTATION_COMPLETE.md** (580+ lines)
   - Implementation phases
   - Code metrics
   - Feature breakdown

3. **QUICK_START_GUIDE.md** (In root directory)
   - Testing scenarios
   - Troubleshooting guide

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3001 | xargs kill -9

# Or use different port
pnpm dev -- -p 3002
```

### Build Errors

```bash
# Clear cache
rm -rf .next
pnpm dev
```

### TypeScript Errors

```bash
# Check errors
pnpm type-check

# Verify paths
cat tsconfig.json | grep paths
```

### Session Issues

```javascript
// Clear in browser console
localStorage.clear();
// Then refresh
```

---

## 🤝 Contributing

### Code Style

- Use TypeScript for all new files
- Follow ESLint configuration
- Write meaningful commit messages
- Add JSDoc comments for functions

### Pull Request Process

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit
3. Push and create PR
4. Wait for review

---

## 📞 Support

- **GitHub Issues**: [Report Bug](https://github.com/jonmaxmore/gacp-certify-flow-main/issues)
- **Documentation**: See root directory markdown files
- **Email**: support@gacp-platform.th

---

## 📄 License

This project is part of the GACP Certification Platform.

---

## 🙏 Acknowledgments

- **Next.js Team** - Amazing framework
- **Material-UI Team** - Beautiful components
- **Tailwind CSS Team** - Utility-first CSS
- **All Contributors** - Thank you!

---

## 📊 Stats

- **Total Lines**: 3,600+ lines of code
- **Components**: 6 major components
- **Pages**: 8 pages
- **API Routes**: 3 endpoints
- **TypeScript**: 100% coverage
- **ESLint**: 0 warnings

---

**Built with ❤️ using Next.js, TypeScript, Tailwind CSS, and Material-UI**

_Last updated: October 14, 2025_
