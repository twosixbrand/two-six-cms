import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RolePage from './RolePage';
import * as roleApi from '../services/roleApi';
import Swal from 'sweetalert2';

vi.mock('../services/roleApi');
vi.mock('../services/errorApi');
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
  },
}));

const mockRoles = [
  { id: 1, name: 'Admin', description: 'Acceso total' },
  { id: 2, name: 'Editor', description: 'Acceso parcial' }
];

describe('RolePage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (roleApi.getRoles as any).mockResolvedValue(mockRoles);
  });

  const renderPage = () =>
    render(
      <BrowserRouter>
        <RolePage />
      </BrowserRouter>,
    );

  it('renders list of roles', async () => {
    renderPage();
    expect(await screen.findByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Acceso total')).toBeInTheDocument();
    expect(screen.getByText('Editor')).toBeInTheDocument();
  });

  it('filters roles by search term', async () => {
    renderPage();
    await screen.findByText('Admin');
    
    const searchInput = screen.getByPlaceholderText(/Buscar por nombre/i);
    fireEvent.change(searchInput, { target: { value: 'Editor' } });
    
    await waitFor(() => {
      expect(screen.queryByText('Admin')).not.toBeInTheDocument();
      expect(screen.getByText('Editor')).toBeInTheDocument();
    });
  });

  it('allows creating a new role', async () => {
    renderPage();
    await screen.findByText('Admin');
    
    fireEvent.click(screen.getByRole('button', { name: /Crear Rol/i }));
    
    const modal = await screen.findByRole('dialog');
    
    fireEvent.change(within(modal).getByLabelText(/Nombre del Rol/i), { target: { value: 'New Role' } });
    fireEvent.change(within(modal).getByLabelText(/Descripcion/i), { target: { value: 'Description' } });
    
    (roleApi.createRole as any).mockResolvedValue({ success: true });
    fireEvent.click(within(modal).getByRole('button', { name: /^Crear$/i }));
    
    await waitFor(() => {
      expect(roleApi.createRole).toHaveBeenCalledWith(expect.objectContaining({
        name: 'New Role',
        description: 'Description'
      }));
    });
  });

  it('allows editing an existing role', async () => {
    renderPage();
    await screen.findByText('Admin');
    
    fireEvent.click(screen.getByLabelText(/Editar rol Admin/i));
    
    const modal = await screen.findByRole('dialog');
    const nameInput = within(modal).getByLabelText(/Nombre del Rol/i);
    fireEvent.change(nameInput, { target: { value: 'Updated Admin' } });
    
    (roleApi.updateRole as any).mockResolvedValue({ success: true });
    fireEvent.click(within(modal).getByRole('button', { name: /Actualizar/i }));
    
    await waitFor(() => {
      expect(roleApi.updateRole).toHaveBeenCalledWith(1, expect.objectContaining({
        name: 'Updated Admin'
      }));
    });
  });

  it('allows deleting a role', async () => {
    renderPage();
    await screen.findByText('Admin');
    
    fireEvent.click(screen.getByLabelText(/Eliminar rol Admin/i));
    expect(Swal.fire).toHaveBeenCalled();
    
    (roleApi.deleteRole as any).mockResolvedValue({ success: true });
    
    await waitFor(() => {
      expect(roleApi.deleteRole).toHaveBeenCalledWith(1);
    });
  });

  it('handles API errors gracefully', async () => {
    (roleApi.getRoles as any).mockRejectedValue(new Error('Load Error'));
    renderPage();
    expect(await screen.findByText(/Error al cargar los roles/i)).toBeInTheDocument();
  });
});
