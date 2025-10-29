import type { Metadata } from 'next';
import { Inter, Noto_Sans_Thai } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
});

const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai'],
  variable: '--font-noto-sans-thai'
});

export const metadata: Metadata = {
  title: 'GACP Platform - ระบบรับรองมาตรฐาน GACP',
  description:
    'ระบบการรับรองมาตรฐาน GACP (Good Agricultural and Collection Practices) สำหรับเกษตรกรผู้ปลูกพืชสมุนไพร',
  keywords: ['GACP', 'มาตรฐาน GACP', 'สมุนไพร', 'เกษตรอินทรีย์', 'DTAM']
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${inter.variable} ${notoSansThai.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
