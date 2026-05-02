import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SystemAuditLogPage from './SystemAuditLogPage';
import * as accountingApi from '../services/accountingApi';

vi.mock('../services/accountingApi');
vi.mock('../services/errorApi');

const mockLogs = [
  {
    id: 1,
    createdAt: '2023-01-01T10:00:00Z',
    action: 'CREATE',
    tableName: 'Product',
    recordId: '101',
    userId: 1,
    ipAddress: '127.0.0.1',
    oldValues: null,
    newValues: { name: 'New Product' }
  },
  {
    id: 2,
    createdAt: '2023-01-01T11:00:00Z',
    action: 'UPDATE',
    tableName: 'Order',
    recordId: '202',
    userId: 2,
    ipAddress: '127.0.0.1',
    oldValues: { status: 'PENDING' },
    newValues: { status: 'COMPLETED' }
  }
];

describe('SystemAuditLogPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (accountingApi.getSystemAuditLog as any).mockResolvedValue(mockLogs);
  });

  const renderPage = () =>
    render(
      <BrowserRouter>
        <SystemAuditLogPage />
      </BrowserRouter>,
    );

  it('renders list of audit logs', async () => {
    renderPage();
    expect(await screen.findByText('Product')).toBeInTheDocument();
    expect(screen.getByText('Order')).toBeInTheDocument();
    // Be specific to avoid matching select options
    expect(screen.getAllByText('CREATE')).not.toHaveLength(0);
    expect(screen.getAllByText('UPDATE')).not.toHaveLength(0);
  });

  it('filters audit logs', async () => {
    renderPage();
    await screen.findByText('Product');
    
    // Change entity filter
    const entitySelect = screen.getByLabelText(/Tabla \/ Entidad/i);
    fireEvent.change(entitySelect, { target: { value: 'Product' } });
    
    const filterBtn = screen.getByLabelText(/Filtrar Auditoría/i);
    fireEvent.click(filterBtn);
    
    await waitFor(() => {
      expect(accountingApi.getSystemAuditLog).toHaveBeenCalledWith(expect.objectContaining({
        tableName: 'Product'
      }));
    });
  });

  it('expands and hides row details', async () => {
    renderPage();
    await screen.findByText('Product');
    
    const viewBtn = screen.getByLabelText(/Ver detalles log 1/i);
    fireEvent.click(viewBtn);
    
    expect(await screen.findByText(/"name": "New Product"/i)).toBeInTheDocument();
    
    const hideBtn = screen.getByLabelText(/Ocultar detalles log 1/i);
    fireEvent.click(hideBtn);
    
    await waitFor(() => {
      expect(screen.queryByText(/"name": "New Product"/i)).not.toBeInTheDocument();
    });
  });

  it('handles empty log state', async () => {
    (accountingApi.getSystemAuditLog as any).mockResolvedValue([]);
    renderPage();
    expect(await screen.findByText(/No hay registros de auditoria/i)).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    (accountingApi.getSystemAuditLog as any).mockRejectedValue(new Error('API_LOAD_ERROR'));
    renderPage();
    expect(await screen.findByText(/API_LOAD_ERROR/i)).toBeInTheDocument();
  });
});
