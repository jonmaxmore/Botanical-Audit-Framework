/**
 * GACP Platform - Integration Test Page
 *
 * PURPOSE: Test page for frontend-backend integration validation
 * WORKFLOW: Display comprehensive integration test results
 * LOGIC: Validate all business logic and API connectivity
 */

import { Metadata } from 'next';
import { Box, Container } from '@mui/material';
import GACPIntegrationTest from '@/components/GACPIntegrationTest';

export const metadata: Metadata = {
  title: 'Integration Test - GACP Platform',
  description: 'Test frontend-backend integration and business logic validation',
};

export default function IntegrationTestPage() {
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <GACPIntegrationTest />
      </Box>
    </Container>
  );
}
