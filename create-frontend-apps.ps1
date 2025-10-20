# Create Remaining 7 Frontend Apps

$apps = @(
    @{name="dtam-portal"; port=3002; title="DTAM Portal"},
    @{name="certificate-portal"; port=3003; title="Certificate Management"},
    @{name="farm-management-portal"; port=3008; title="Farm Management"},
    @{name="survey-portal"; port=3005; title="Survey System"},
    @{name="trace-portal"; port=3006; title="Traceability System"},
    @{name="standards-portal"; port=3007; title="Standards Comparison"},
    @{name="admin-portal"; port=3009; title="System Administration"}
)

Write-Host "Creating remaining 7 frontend apps..." -ForegroundColor Green
Write-Host ""

foreach ($app in $apps) {
    $appName = $app.name
    $appPort = $app.port
    $appTitle = $app.title
    $appPath = "apps\$appName"
    
    Write-Host "Creating $appName..." -ForegroundColor Cyan
    
    # Create directories
    New-Item -ItemType Directory -Path "$appPath\app" -Force | Out-Null
    New-Item -ItemType Directory -Path "$appPath\components" -Force | Out-Null
    
    # package.json
    $packageJson = @"
{
  "name": "@gacp/$appName",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p $appPort",
    "build": "next build",
    "start": "next start -p $appPort"
  },
  "dependencies": {
    "next": "14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@gacp/ui": "workspace:*",
    "@gacp/types": "workspace:*",
    "@gacp/utils": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/react": "^18.3.0",
    "tailwindcss": "^3.4.0"
  }
}
"@
    $packageJson | Out-File -FilePath "$appPath\package.json" -Encoding UTF8
    
    # page.tsx
    $pageTsx = @"
export default function Home() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold">$appTitle</h1>
      <p className="mt-4">Welcome to GACP Platform</p>
    </div>
  );
}
"@
    $pageTsx | Out-File -FilePath "$appPath\app\page.tsx" -Encoding UTF8
    
    # layout.tsx
    $layoutTsx = @"
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '$appTitle - GACP Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
"@
    $layoutTsx | Out-File -FilePath "$appPath\app\layout.tsx" -Encoding UTF8
    
    # tsconfig.json
    $tsconfig = @"
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
"@
    $tsconfig | Out-File -FilePath "$appPath\tsconfig.json" -Encoding UTF8
    
    # next.config.js
    $nextConfig = @"
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@gacp/ui', '@gacp/types', '@gacp/utils'],
};

module.exports = nextConfig;
"@
    $nextConfig | Out-File -FilePath "$appPath\next.config.js" -Encoding UTF8
    
    Write-Host "  ✓ Created $appName (port $appPort)" -ForegroundColor Green
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  ALL 8 FRONTEND APPS CREATED!" -ForegroundColor Green  
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next step: Run 'pnpm install' to install dependencies" -ForegroundColor Yellow
Write-Host ""
