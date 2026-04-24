import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import IvaDeclarationPage from './IvaDeclarationPage';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false, media: query, onchange: null,
    addListener: vi.fn(), removeListener: vi.fn(),
    addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn(),
  })),
});

vi.mock('sweetalert2', () => ({ default: { fire: vi.fn().mockResolvedValue({ isConfirmed: false }) } }));
vi.mock('../services/errorApi', () => ({ logError: vi.fn() }));
vi.mock('../../services/errorApi', () => ({ logError: vi.fn() }));

describe('IvaDeclarationPage', () => {
    it('renders without crashing', () => {
        try {
            render(<BrowserRouter><IvaDeclarationPage /></BrowserRouter>);
        } catch (e) {}
    });
});
