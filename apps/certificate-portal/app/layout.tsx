import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GACP Certificate Portal',
  description: 'Certificate Issuance and Management System for GACP Platform',
  keywords: ['GACP', 'Certificate', 'Agriculture', 'Certification']
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
