# 🏆 GACP Certificate Portal

**Version**: 1.0.0
**Port**: 3003
**Status**: ✅ Sprint 1 Development

## 📋 Overview

GACP Certificate Portal is a professional system for certificate officers to issue, manage, and track GACP (Good Agricultural and Collection Practices) certificates. The portal includes QR code generation, PDF export, and comprehensive certificate management features.

---

## ✨ Features

### Core Features

- ✅ **Certificate Issuance**: Create and issue GACP certificates
- ✅ **QR Code Generation**: Generate unique QR codes for verification
- ✅ **PDF Export**: Export certificates as official PDF documents
- ✅ **Certificate Management**: View, search, and manage all certificates
- ✅ **Dashboard Analytics**: Real-time statistics and insights
- ✅ **Authentication**: Secure login for certificate officers

### Upcoming Features (Sprint 1-2)

- 🔄 Certificate search & filter
- 🔄 Certificate validation/verification
- 🔄 Batch certificate generation
- 🔄 Email notifications
- 🔄 Audit trail logging
- 🔄 Advanced reporting

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB (for backend)

### Installation

```bash
# Navigate to certificate portal
cd apps/certificate-portal

# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Edit .env.local with your configuration
```

### Development

```bash
# Run development server
npm run dev

# Open browser
http://localhost:3003
```

### Build for Production

```bash
# Build
npm run build

# Start production server
npm start
```

---

## 📁 Project Structure

```
apps/certificate-portal/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Global styles
│   ├── login/
│   │   └── page.tsx                # Login page
│   ├── dashboard/
│   │   └── page.tsx                # Main dashboard
│   └── certificates/
│       ├── page.tsx                # Certificate list
│       ├── new/page.tsx            # Create certificate
│       └── [id]/page.tsx           # Certificate detail
│
├── components/
│   ├── layout/
│   │   └── DashboardLayout.tsx     # Dashboard layout
│   ├── certificates/
│   │   ├── CertificateCard.tsx     # Certificate card component
│   │   ├── CertificateForm.tsx     # Certificate form
│   │   └── QRCodeGenerator.tsx     # QR code component
│   └── ui/
│       └── ...                     # Reusable UI components
│
├── lib/
│   ├── api/
│   │   └── certificates.ts         # Certificate API client
│   ├── theme/
│   │   └── index.ts                # MUI theme configuration
│   ├── types/
│   │   └── certificate.ts          # TypeScript types
│   └── utils/
│       ├── qr-generator.ts         # QR code utilities
│       └── pdf-generator.ts        # PDF utilities
│
├── public/
│   └── ...                         # Static assets
│
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
└── README.md
```

---

## 🔐 Authentication

### Demo Credentials

```
Email: cert@gacp.test
Password: password123
```

### User Roles

- **Certificate Officer**: Can issue and manage certificates

---

## 🎨 Tech Stack

> [!WARNING]
> **Tech Debt**: This portal currently uses **Material-UI (MUI)**, while the rest of the GACP platform uses a shared **Tailwind CSS** library (`@gacp/ui`).
> Future refactoring should consider migrating to `@gacp/ui` for consistency, but this is a low-priority task as long as the UI remains functional.

### Frontend

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Material-UI v5**: Component library
- **Tailwind CSS**: Utility-first CSS
- **Notistack**: Toast notifications

### Certificate Features

- **qrcode**: QR code generation
- **jsPDF**: PDF document generation
- **html2canvas**: HTML to image conversion
- **react-hook-form**: Form management
- **zod**: Schema validation

### Testing

- **Jest**: Unit testing
- **React Testing Library**: Component testing
- **Playwright**: E2E testing

---

## 📊 API Integration

### Backend Endpoints

```typescript
// Certificate Management
GET    /api/certificates          // List all certificates
GET    /api/certificates/:id      // Get certificate details
POST   /api/certificates          // Create new certificate
PUT    /api/certificates/:id      // Update certificate
DELETE /api/certificates/:id      // Delete certificate

// QR & PDF
GET    /api/certificates/:id/qr   // Get QR code
GET    /api/certificates/:id/pdf  // Generate PDF

// Validation
POST   /api/certificates/validate // Validate certificate
```

### Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3004/api
NEXT_PUBLIC_APP_NAME=GACP Certificate Portal
JWT_SECRET=your-secret-key
```

---

## 🧪 Testing

### Run Tests

```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# E2E tests
npm run test:e2e
```

### Test Coverage Target

- **Minimum**: 80%
- **Target**: 90%

---

## 📝 Scripts

```json
{
  "dev": "Run development server (port 3003)",
  "build": "Build for production",
  "start": "Start production server",
  "lint": "Run ESLint",
  "test": "Run Jest tests",
  "test:e2e": "Run Playwright E2E tests",
  "type-check": "Check TypeScript types"
}
```

---

## 🎯 Development Guidelines

### Code Style

- Use TypeScript strict mode
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful commit messages

### Component Guidelines

- Use functional components with hooks
- Implement proper TypeScript types
- Add JSDoc comments for complex logic
- Keep components focused and reusable

### Testing Guidelines

- Write tests for all features
- Test happy paths and edge cases
- Mock external dependencies
- Maintain high coverage

---

## 🚢 Deployment

### Environment Setup

```bash
# Production environment
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.gacp.example.com
```

### Build & Deploy

```bash
# Build
npm run build

# Start
npm start

# Or use PM2
pm2 start npm --name "cert-portal" -- start
```

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3003
CMD ["npm", "start"]
```

---

## 📊 Performance Metrics

### Target Metrics

- **Page Load**: < 2 seconds
- **API Response**: < 500ms
- **Lighthouse Score**: > 90
- **Bundle Size**: < 1MB (gzipped)

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: Module not found errors

```bash
# Solution: Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Issue**: Port already in use

```bash
# Solution: Kill process on port 3003
# Windows
netstat -ano | findstr :3003
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3003 | xargs kill -9
```

**Issue**: Build fails

```bash
# Solution: Clear Next.js cache
rm -rf .next
npm run build
```

---

## 📞 Support

### Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Material-UI Docs](https://mui.com)
- [TypeScript Docs](https://www.typescriptlang.org/docs)

### Contact

- **Project Manager**: [PM Name]
- **Tech Lead**: [Tech Lead Name]
- **Slack**: #cert-portal-dev

---

## 📋 Sprint Status

### Sprint 1-2 (Current)

**Timeline**: Week 1-3
**Status**: 🟡 In Progress

#### Completed ✅

- [x] Project setup
- [x] Authentication system
- [x] Dashboard layout
- [x] Landing page

#### In Progress 🔄

- [ ] Certificate list view
- [ ] Certificate detail view
- [ ] Certificate issuance form
- [ ] QR code generation
- [ ] PDF generation

#### Upcoming 📅

- [ ] Backend integration
- [ ] Testing
- [ ] Documentation
- [ ] Production deployment

---

## 📄 License

Copyright © 2025 GACP Platform. All rights reserved.

---

**Last Updated**: October 15, 2025
**Version**: 1.0.0
**Status**: ✅ Active Development
