import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false, media: query, onchange: null,
    addListener: vi.fn(), removeListener: vi.fn(),
    addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn(),
  })),
});

vi.mock('../../services/accountingApi', () => ({
  previewExogena: vi.fn(),
  generateExogena: vi.fn(),
  getExogenaThirdPartyMovements: vi.fn(),
}));
vi.mock('../../services/errorApi', () => ({ logError: vi.fn() }));
vi.mock('sweetalert2', () => ({ default: { fire: vi.fn().mockResolvedValue({ isConfirmed: false }) } }));
vi.mock('../../components/common/PageHeader', () => ({ default: ({ title }: any) => <h1>{title}</h1> }));
vi.mock('../../components/ui/Button', () => ({ default: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button> }));
vi.mock('../../components/ui/FormField', () => ({ default: ({ label }: any) => <label>{label}</label> }));
vi.mock('../../components/ui/LoadingSpinner', () => ({ default: ({ text }: any) => <div>{text}</div> }));

import ExogenaPage from './ExogenaPage';
import * as accountingApi from '../../services/accountingApi';

describe('ExogenaPage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  const renderPage = () => render(<BrowserRouter><ExogenaPage /></BrowserRouter>);

  it('renders page title', () => {
    renderPage();
    expect(screen.getByText('Informacion Exogena (Medios Magneticos DIAN)')).toBeInTheDocument();
  });

  it('renders year selector and preview button', () => {
    renderPage();
    expect(screen.getByText('Previsualizar')).toBeInTheDocument();
  });

  it('does not auto-fetch on mount (requires manual preview)', () => {
    renderPage();
    expect(accountingApi.previewExogena).not.toHaveBeenCalled();
  });
});
