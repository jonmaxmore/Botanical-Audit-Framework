'use client';

import { ReactNode } from 'react';
import ThemeProviderWrapper from './theme-provider';
import { AuthProvider } from '@/lib/auth-context';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProviderWrapper>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProviderWrapper>
  );
}
