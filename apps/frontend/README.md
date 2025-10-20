# 🌿 Botanical Audit Framework - Frontend

ระบบ Frontend สำหรับ Botanical Audit Framework (GACP Certification System)

## 📋 Overview

เว็บไซต์สำหรับระบบตรวจสอบและรับรองมาตรฐาน GACP (Good Agricultural and Collection Practices)
สำหรับพืชสมุนไพร ออกแบบตามมาตรฐานเว็บไซต์ภาครัฐไทย

## 🎨 Design Inspiration

ออกแบบตามตัวอย่างเว็บไซต์ภาครัฐไทย:

- [DTAM - กรมการแพทย์แผนไทยและการแพทย์ทางเลือก](https://www.dtam.moph.go.th/)
- [Cannabis GACP System](https://cannabis-gacp-thaicam.dtam.moph.go.th/)
- [กรมพัฒนาธุรกิจการค้า](https://edbr.dbd.go.th/)

## 🚀 Getting Started

### Development Server

```bash
# Install dependencies (if not already installed)
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

```
apps/frontend/
├── pages/
│   ├── index.tsx          # Home page (Landing page)
│   ├── _app.tsx           # App wrapper with theme provider
│   ├── login.tsx          # (To be created)
│   └── register.tsx       # (To be created)
├── styles/
│   ├── globals.css        # Global styles & utilities
│   └── theme.ts           # MUI theme configuration
├── components/            # (To be created)
├── lib/                   # (To be created)
└── public/
    └── images/            # (To be created)
```

## 🎨 Design System

### Color Palette (Thai Government Theme)

- **Primary Green:** #2e7d32 (สีเขียวสมุนไพร)
- **Secondary Blue:** #1976d2 (สีน้ำเงินราชการ)
- **Success:** #4caf50
- **Warning:** #ff9800
- **Error:** #f44336

### Typography

- **Body:** Sarabun (300, 400, 500, 700)
- **Headings:** Prompt (500, 600, 700, 800)
- **Fallback:** Noto Sans Thai

### Responsive Breakpoints

- **Mobile:** < 600px
- **Tablet:** 600px - 960px
- **Desktop:** > 960px
- **Large Desktop:** > 1280px

## 📋 Home Page Sections

1. **Navigation Bar** - Logo, menu, mobile drawer, login button
2. **Hero Section** - Green gradient background with CTAs
3. **Quick Stats** - 4 stat cards with icons
4. **About Section** - GACP Standard & Certification Process
5. **Services Section** - 6 service cards with icons
6. **News Section** - 3 latest news cards
7. **Contact Section** - DTAM contact info
8. **Footer** - Copyright & version info

## 🛠️ Tech Stack

- **Framework:** Next.js 13+ with TypeScript
- **UI Library:** Material-UI (MUI) v5
- **Styling:** CSS Modules + Global CSS + MUI Theme
- **Icons:** Material Icons
- **Fonts:** Google Fonts (Sarabun, Prompt, Noto Sans Thai)
- **State Management:** React Context API (Future: Redux)

## 📦 Dependencies

```json
{
  "@mui/material": "^5.x",
  "@mui/icons-material": "^5.x",
  "@emotion/react": "^11.x",
  "@emotion/styled": "^11.x",
  "next": "13.x",
  "react": "^18.x",
  "typescript": "^5.x"
}
```

## 🎯 Development Roadmap

### ✅ Phase 1: Home Page (COMPLETED)

- [x] Create home page with 8 sections
- [x] Implement MUI theme (Thai government style)
- [x] Add responsive navigation with mobile drawer
- [x] Create global styles and utilities
- [ ] Add real images
- [ ] Test on all devices

### 🔄 Phase 2: Authentication (IN PROGRESS)

- [ ] Login page with form validation
- [ ] Register page (multi-step form for farmers)
- [ ] Forgot password flow
- [ ] OTP verification

### 📋 Phase 3: User Portals

- [ ] Farmer dashboard
- [ ] Inspector dashboard
- [ ] Admin dashboard
- [ ] Profile management

### 🎨 Phase 4: Component Library

- [ ] Layout components (Header, Sidebar, Footer)
- [ ] Form components (Input, Select, DatePicker)
- [ ] Data components (DataTable, StatusBadge)
- [ ] Card components (StatCard, InfoCard)

### 🔌 Phase 5: API Integration

- [ ] Setup axios client with interceptors
- [ ] Authentication flow
- [ ] Error handling
- [ ] Type definitions

## 🖼️ Image Assets Needed

Create these images in `/public/images/`:

| Filename                    | Purpose            | Size     | Format |
| --------------------------- | ------------------ | -------- | ------ |
| `hero-farming.jpg`          | Hero section       | 1200x800 | JPG    |
| `leaf-pattern.svg`          | Background pattern | Vector   | SVG    |
| `gacp-standard.jpg`         | About section      | 800x600  | JPG    |
| `certification-process.jpg` | About section      | 800x600  | JPG    |
| `news-1.jpg`                | News thumbnail     | 600x400  | JPG    |
| `news-2.jpg`                | News thumbnail     | 600x400  | JPG    |
| `news-3.jpg`                | News thumbnail     | 600x400  | JPG    |

## 🧪 Testing Checklist

### Responsive Testing

- [ ] iPhone SE (375px)
- [ ] iPhone 12 Pro (390px)
- [ ] iPad (768px)
- [ ] iPad Pro (1024px)
- [ ] Desktop (1280px)
- [ ] Large Desktop (1920px)

### Browser Testing

- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (iOS)
- [ ] Safari (macOS)

### Accessibility (WCAG 2.1 AA)

- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Color contrast ratios
- [ ] Focus indicators
- [ ] ARIA labels

## 📝 Code Style

### Component Example

```tsx
import { Box, Typography, Button } from '@mui/material';

export default function ExampleComponent() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">Thai Government Style</Typography>
      <Button variant="contained" color="primary">
        ปุ่มสีเขียว
      </Button>
    </Box>
  );
}
```

### Styling Best Practices

- Use MUI `sx` prop for component-specific styles
- Use `theme.ts` for consistent colors and typography
- Use `globals.css` for utility classes and animations
- Keep components small and reusable

## 🔗 Related Documentation

- [Backend API](../backend/README.md)
- [UAT Documentation](../../docs/UAT_FINAL_PRESENTATION.md)
- [Database Schema](../../database/README.md)
- [Deployment Guide](../../DOCKER_SETUP_GUIDE.md)

## 🐛 Common Issues

### MUI Module Not Found

```bash
# Solution: Install MUI dependencies
pnpm add @mui/material @mui/icons-material @emotion/react @emotion/styled
```

### Port Already in Use

```bash
# Solution: Change port or kill process
PORT=3001 pnpm dev
```

### TypeScript Errors

```bash
# Solution: Check tsconfig.json and restart TS server
# VS Code: Ctrl+Shift+P > "TypeScript: Restart TS Server"
```

## 📄 License

Copyright © 2025 DTAM - กรมการแพทย์แผนไทยและการแพทย์ทางเลือก  
All rights reserved.

---

**Version:** 2.0.0  
**Last Updated:** January 2025  
**Status:** 🚧 Under Active Development  
**Tech Stack:** Next.js + TypeScript + MUI
