import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render loading spinner', () => {
    render(<LoadingSpinner />);

    // Check for CircularProgress (MUI component)
    const spinner = screen.getByRole('progressbar');
    expect(spinner).toBeInTheDocument();
  });

  it('should render with custom message', () => {
    render(<LoadingSpinner message="กำลังโหลดข้อมูล..." />);

    expect(screen.getByText(/กำลังโหลดข้อมูล/i)).toBeInTheDocument();
  });

  it('should render centered by default', () => {
    const { container } = render(<LoadingSpinner />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ display: 'flex' });
  });
});
