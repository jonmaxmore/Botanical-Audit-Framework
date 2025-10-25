/**
 * Certificate Verification Page Tests
 * 
 * Tests the public certificate verification page
 */

import { render, screen, waitFor } from '@testing-library/react';
import { useParams } from 'next/navigation';
import VerifyCertificatePage from '../page';
import { certificateApi } from '@/lib/api/certificates';

// Mock the API
jest.mock('@/lib/api/certificates');

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
}));

describe('VerifyCertificatePage', () => {
  const mockCertificateNumber = 'GACP-2025-001';

  beforeEach(() => {
    jest.clearAllMocks();
    (useParams as jest.Mock).mockReturnValue({
      certificateNumber: mockCertificateNumber,
    });
  });

  it('should show loading state initially', () => {
    (certificateApi.verify as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<VerifyCertificatePage />);

    expect(screen.getByText(/verifying certificate/i)).toBeInTheDocument();
  });

  it('should display valid certificate information', async () => {
    const mockCertificate = {
      id: 'cert-123',
      certificateNumber: mockCertificateNumber,
      farmId: 'farm-456',
      farmName: 'Test Farm',
      farmerName: 'John Doe',
      farmerNationalId: '1234567890123',
      address: {
        houseNumber: '123',
        village: 'Test Village',
        subdistrict: 'Test Sub',
        district: 'Test District',
        province: 'Bangkok',
        postalCode: '10110',
      },
      farmArea: 15.5,
      cropType: 'Rice',
      certificationStandard: 'GACP',
      status: 'active',
      issuedBy: 'Department of Agriculture',
      issuedDate: '2025-01-01',
      expiryDate: '2026-01-01',
      inspectionDate: '2024-12-15',
      inspectorName: 'Inspector Smith',
      createdAt: '2024-12-01',
      updatedAt: '2024-12-01',
    };

    (certificateApi.verify as jest.Mock).mockResolvedValue({
      valid: true,
      certificate: mockCertificate,
    });

    render(<VerifyCertificatePage />);

    await waitFor(() => {
      expect(screen.getByText(/certificate valid/i)).toBeInTheDocument();
    });

    expect(screen.getByText('Test Farm')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText(mockCertificateNumber)).toBeInTheDocument();
  });

  it('should display error for invalid certificate', async () => {
    (certificateApi.verify as jest.Mock).mockResolvedValue({
      valid: false,
      message: 'Certificate not found',
    });

    render(<VerifyCertificatePage />);

    await waitFor(() => {
      expect(screen.getByText(/certificate invalid/i)).toBeInTheDocument();
    });
  });

  it('should show revocation warning for revoked certificates', async () => {
    const revokedCertificate = {
      id: 'cert-123',
      certificateNumber: mockCertificateNumber,
      farmName: 'Test Farm',
      farmerName: 'John Doe',
      status: 'revoked',
      revokedDate: '2025-10-01',
      revokedReason: 'Testing revocation',
      // ... other required fields
      farmId: 'farm-456',
      farmerNationalId: '1234567890123',
      address: {
        houseNumber: '123',
        subdistrict: 'Test Sub',
        district: 'Test District',
        province: 'Bangkok',
        postalCode: '10110',
      },
      farmArea: 10,
      cropType: 'Rice',
      certificationStandard: 'GACP' as const,
      issuedBy: 'Dept',
      issuedDate: '2025-01-01',
      expiryDate: '2026-01-01',
      inspectionDate: '2024-12-01',
      inspectorName: 'Inspector',
      createdAt: '2024-12-01',
      updatedAt: '2025-10-01',
    };

    (certificateApi.verify as jest.Mock).mockResolvedValue({
      valid: true,
      certificate: revokedCertificate,
    });

    render(<VerifyCertificatePage />);

    await waitFor(() => {
      expect(screen.getByText(/certificate has been revoked/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/testing revocation/i)).toBeInTheDocument();
  });

  it('should handle API errors gracefully', async () => {
    (certificateApi.verify as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );

    render(<VerifyCertificatePage />);

    await waitFor(() => {
      expect(screen.getByText(/verification failed/i)).toBeInTheDocument();
    });
  });
});
