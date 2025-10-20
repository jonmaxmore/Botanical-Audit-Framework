import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, CircularProgress } from '@mui/material';
import { UserRole } from '../types/user.types';
import { AuthService } from '../lib/auth.service';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const isAuthenticated = AuthService.isAuthenticated();

      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      if (allowedRoles && allowedRoles.length > 0) {
        const hasRole = AuthService.hasAnyRole(allowedRoles);
        if (!hasRole) {
          router.push('/unauthorized');
          return;
        }
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [router, allowedRoles]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
}
