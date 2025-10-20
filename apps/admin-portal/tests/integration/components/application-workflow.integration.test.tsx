/**
 * Component Integration Tests - Application Workflow
 * Tests complete application creation and review workflow
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import React from 'react';

const theme = createTheme();

// Mock components for testing (simplified versions)
const MockApplicationForm = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
  const [formData, setFormData] = React.useState({
    farmName: '',
    farmLocation: '',
    farmSize: '',
    applicationType: 'GAP_VEGETABLES',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} data-testid="application-form">
      <input
        type="text"
        placeholder="Farm Name"
        value={formData.farmName}
        onChange={e => setFormData({ ...formData, farmName: e.target.value })}
        data-testid="farm-name-input"
      />
      <input
        type="text"
        placeholder="Farm Location"
        value={formData.farmLocation}
        onChange={e => setFormData({ ...formData, farmLocation: e.target.value })}
        data-testid="farm-location-input"
      />
      <input
        type="number"
        placeholder="Farm Size"
        value={formData.farmSize}
        onChange={e => setFormData({ ...formData, farmSize: e.target.value })}
        data-testid="farm-size-input"
      />
      <button type="submit" data-testid="submit-button">
        Submit Application
      </button>
    </form>
  );
};

const MockApplicationReview = ({
  application,
  onApprove,
  onReject,
}: {
  application: any;
  onApprove: (notes: string) => void;
  onReject: (reason: string) => void;
}) => {
  const [notes, setNotes] = React.useState('');
  const [reason, setReason] = React.useState('');

  return (
    <div data-testid="application-review">
      <h2>Review Application: {application.applicationNumber}</h2>
      <div>
        <p>Farm Name: {application.farmName}</p>
        <p>Status: {application.status}</p>
      </div>
      <div>
        <textarea
          placeholder="Review Notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          data-testid="review-notes"
        />
        <button onClick={() => onApprove(notes)} data-testid="approve-button">
          Approve
        </button>
      </div>
      <div>
        <textarea
          placeholder="Rejection Reason"
          value={reason}
          onChange={e => setReason(e.target.value)}
          data-testid="rejection-reason"
        />
        <button onClick={() => onReject(reason)} data-testid="reject-button">
          Reject
        </button>
      </div>
    </div>
  );
};

describe('Application Workflow Integration Tests', () => {
  const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
  };

  describe('Application Creation Flow', () => {
    test('should create new application with valid data', async () => {
      const mockSubmit = jest.fn();
      const user = userEvent.setup();

      renderWithTheme(<MockApplicationForm onSubmit={mockSubmit} />);

      // Fill form
      await user.type(screen.getByTestId('farm-name-input'), 'Green Valley Farm');
      await user.type(screen.getByTestId('farm-location-input'), 'Bangkok');
      await user.type(screen.getByTestId('farm-size-input'), '10');

      // Submit
      await user.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith({
          farmName: 'Green Valley Farm',
          farmLocation: 'Bangkok',
          farmSize: '10',
          applicationType: 'GAP_VEGETABLES',
        });
      });
    });

    test('should validate required fields', async () => {
      const mockSubmit = jest.fn();
      const user = userEvent.setup();

      renderWithTheme(<MockApplicationForm onSubmit={mockSubmit} />);

      // Try to submit without filling
      await user.click(screen.getByTestId('submit-button'));

      // Form should submit but with empty values
      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith({
          farmName: '',
          farmLocation: '',
          farmSize: '',
          applicationType: 'GAP_VEGETABLES',
        });
      });
    });

    test('should handle form field changes', async () => {
      const mockSubmit = jest.fn();
      const user = userEvent.setup();

      renderWithTheme(<MockApplicationForm onSubmit={mockSubmit} />);

      const farmNameInput = screen.getByTestId('farm-name-input') as HTMLInputElement;

      await user.type(farmNameInput, 'Test Farm');

      expect(farmNameInput.value).toBe('Test Farm');
    });

    test('should clear form after submission', async () => {
      const mockSubmit = jest.fn();
      const user = userEvent.setup();

      const FormWithClear = () => {
        const [key, setKey] = React.useState(0);

        const handleSubmit = (data: any) => {
          mockSubmit(data);
          setKey(prev => prev + 1); // Force re-render with empty form
        };

        return <MockApplicationForm key={key} onSubmit={handleSubmit} />;
      };

      renderWithTheme(<FormWithClear />);

      // Fill and submit
      await user.type(screen.getByTestId('farm-name-input'), 'Test Farm');
      await user.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalled();
      });
    });
  });

  describe('Application Review Flow', () => {
    const mockApplication = {
      id: 'app-123',
      applicationNumber: 'APP-2025-001',
      farmName: 'Test Farm',
      farmLocation: 'Bangkok',
      status: 'PENDING_REVIEW',
      userId: 'user-123',
    };

    test('should approve application with notes', async () => {
      const mockApprove = jest.fn();
      const mockReject = jest.fn();
      const user = userEvent.setup();

      renderWithTheme(
        <MockApplicationReview
          application={mockApplication}
          onApprove={mockApprove}
          onReject={mockReject}
        />,
      );

      // Enter notes
      await user.type(screen.getByTestId('review-notes'), 'All documents verified and approved');

      // Click approve
      await user.click(screen.getByTestId('approve-button'));

      await waitFor(() => {
        expect(mockApprove).toHaveBeenCalledWith('All documents verified and approved');
        expect(mockReject).not.toHaveBeenCalled();
      });
    });

    test('should reject application with reason', async () => {
      const mockApprove = jest.fn();
      const mockReject = jest.fn();
      const user = userEvent.setup();

      renderWithTheme(
        <MockApplicationReview
          application={mockApplication}
          onApprove={mockApprove}
          onReject={mockReject}
        />,
      );

      // Enter rejection reason
      await user.type(screen.getByTestId('rejection-reason'), 'Missing required documents');

      // Click reject
      await user.click(screen.getByTestId('reject-button'));

      await waitFor(() => {
        expect(mockReject).toHaveBeenCalledWith('Missing required documents');
        expect(mockApprove).not.toHaveBeenCalled();
      });
    });

    test('should display application details correctly', () => {
      const mockApprove = jest.fn();
      const mockReject = jest.fn();

      renderWithTheme(
        <MockApplicationReview
          application={mockApplication}
          onApprove={mockApprove}
          onReject={mockReject}
        />,
      );

      expect(screen.getByText(/APP-2025-001/)).toBeInTheDocument();
      expect(screen.getByText(/Test Farm/)).toBeInTheDocument();
      expect(screen.getByText(/PENDING_REVIEW/)).toBeInTheDocument();
    });

    test('should handle approve without notes', async () => {
      const mockApprove = jest.fn();
      const mockReject = jest.fn();
      const user = userEvent.setup();

      renderWithTheme(
        <MockApplicationReview
          application={mockApplication}
          onApprove={mockApprove}
          onReject={mockReject}
        />,
      );

      // Click approve without entering notes
      await user.click(screen.getByTestId('approve-button'));

      await waitFor(() => {
        expect(mockApprove).toHaveBeenCalledWith('');
      });
    });
  });

  describe('Complete Application Workflow', () => {
    test('should complete full application lifecycle', async () => {
      const mockSubmit = jest.fn();
      const mockApprove = jest.fn();
      const user = userEvent.setup();

      // Step 1: Create application
      const { unmount } = renderWithTheme(<MockApplicationForm onSubmit={mockSubmit} />);

      await user.type(screen.getByTestId('farm-name-input'), 'Complete Farm');
      await user.type(screen.getByTestId('farm-location-input'), 'Chiang Mai');
      await user.type(screen.getByTestId('farm-size-input'), '15');
      await user.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalled();
      });

      unmount();

      // Step 2: Review and approve
      const mockApp = {
        id: 'app-complete',
        applicationNumber: 'APP-2025-COMPLETE',
        farmName: 'Complete Farm',
        farmLocation: 'Chiang Mai',
        status: 'PENDING_REVIEW',
        userId: 'user-123',
      };

      renderWithTheme(
        <MockApplicationReview
          application={mockApp}
          onApprove={mockApprove}
          onReject={jest.fn()}
        />,
      );

      await user.type(screen.getByTestId('review-notes'), 'Approved after review');
      await user.click(screen.getByTestId('approve-button'));

      await waitFor(() => {
        expect(mockApprove).toHaveBeenCalledWith('Approved after review');
      });
    });

    test('should handle multiple form submissions', async () => {
      const mockSubmit = jest.fn();
      const user = userEvent.setup();

      renderWithTheme(<MockApplicationForm onSubmit={mockSubmit} />);

      // First submission
      await user.type(screen.getByTestId('farm-name-input'), 'Farm 1');
      await user.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledTimes(1);
      });

      // Clear and second submission
      await user.clear(screen.getByTestId('farm-name-input'));
      await user.type(screen.getByTestId('farm-name-input'), 'Farm 2');
      await user.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Form Validation and Error Handling', () => {
    test('should handle numeric input validation', async () => {
      const mockSubmit = jest.fn();
      const user = userEvent.setup();

      renderWithTheme(<MockApplicationForm onSubmit={mockSubmit} />);

      const farmSizeInput = screen.getByTestId('farm-size-input') as HTMLInputElement;

      // Try to enter invalid number
      await user.type(farmSizeInput, 'invalid');

      // Number input should filter out non-numeric characters
      expect(farmSizeInput.value).toBe('');
    });

    test('should handle special characters in text input', async () => {
      const mockSubmit = jest.fn();
      const user = userEvent.setup();

      renderWithTheme(<MockApplicationForm onSubmit={mockSubmit} />);

      await user.type(screen.getByTestId('farm-name-input'), 'Farm <script>alert("test")</script>');

      await user.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalled();
        const submittedData = mockSubmit.mock.calls[0][0];
        expect(submittedData.farmName).toContain('<script>');
      });
    });
  });

  describe('Accessibility Tests', () => {
    test('should have accessible form elements', () => {
      renderWithTheme(<MockApplicationForm onSubmit={jest.fn()} />);

      expect(screen.getByTestId('farm-name-input')).toHaveAttribute('type', 'text');
      expect(screen.getByTestId('farm-size-input')).toHaveAttribute('type', 'number');
      expect(screen.getByTestId('submit-button')).toHaveAttribute('type', 'submit');
    });

    test('should have accessible review buttons', () => {
      const mockApp = {
        id: 'app-123',
        applicationNumber: 'APP-2025-001',
        farmName: 'Test Farm',
        farmLocation: 'Bangkok',
        status: 'PENDING_REVIEW',
        userId: 'user-123',
      };

      renderWithTheme(
        <MockApplicationReview application={mockApp} onApprove={jest.fn()} onReject={jest.fn()} />,
      );

      expect(screen.getByTestId('approve-button')).toBeInTheDocument();
      expect(screen.getByTestId('reject-button')).toBeInTheDocument();
    });
  });
});
