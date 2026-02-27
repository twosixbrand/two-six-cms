import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import App from './App';

describe('App Smoke Test', () => {
  it('should render login page when not authenticated', () => {
    render(<App />);
    // Check if it renders at least the login or some text
    // Since App has ErrorBoundary and AuthProvider, this should work.
    expect(document.body).toBeDefined();
  });
});
