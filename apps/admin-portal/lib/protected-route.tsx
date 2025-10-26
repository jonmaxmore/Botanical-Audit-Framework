'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-context';
import { Box, CircularProgress } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function ProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      // Redirect to login if not authenticated
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, requireAuth, router]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Show nothing if not authenticated (will redirect)
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // Render children if authenticated
  return <>{children}</>;
}
