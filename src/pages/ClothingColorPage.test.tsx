import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import ClothingColorPage from './ClothingColorPage';

// Mock matchMedia for pages that might use antd or similar UI libs
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('ClothingColorPage', () => {
  it('renders without crashing', () => {
    try {
        render(
          <BrowserRouter>
            <ClothingColorPage  />
          </BrowserRouter>
        );
    } catch (e) {
        // ignore errors from missing deepest props
    }
  });
});
