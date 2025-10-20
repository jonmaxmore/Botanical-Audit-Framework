import type { Metadata } from 'next';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'GACP Admin Portal - ระบบจัดการผู้ดูแลระบบ',
  description:
    'GACP Certification Platform - Admin Portal for Application Review & User Management',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
