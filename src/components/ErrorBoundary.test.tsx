import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

function ExplodingComponent() {
  throw new Error('boom');
}

describe('ErrorBoundary', () => {
  it('renders fallback UI when child throws', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ExplodingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Falha inesperada na interface')).toBeInTheDocument();
    expect(screen.getByText('boom')).toBeInTheDocument();

    spy.mockRestore();
  });
});
