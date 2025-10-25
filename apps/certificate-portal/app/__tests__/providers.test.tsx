import React from 'react';
import { render, screen } from '@testing-library/react';
import { Providers } from '../providers';

describe('Providers', () => {
  it('should render children', () => {
    render(
      <Providers>
        <div>Test Child Content</div>
      </Providers>,
    );

    expect(screen.getByText('Test Child Content')).toBeInTheDocument();
  });

  it('should provide theme context', () => {
    render(
      <Providers>
        <button>Themed Button</button>
      </Providers>,
    );

    const button = screen.getByRole('button', { name: /themed button/i });
    expect(button).toBeInTheDocument();
  });

  it('should provide snackbar context', () => {
    render(
      <Providers>
        <div>Snackbar Provider</div>
      </Providers>,
    );

    expect(screen.getByText('Snackbar Provider')).toBeInTheDocument();
  });
});
