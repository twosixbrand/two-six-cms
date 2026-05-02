import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PermissionManagementPage from './PermissionManagementPage';
import * as permissionApi from '../services/permissionApi';
import * as roleApi from '../services/roleApi';
import Swal from 'sweetalert2';

vi.mock('../services/permissionApi');
vi.mock('../services/roleApi');
vi.mock('../services/errorApi');
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
  },
}));

const mockRoles = [
  { id: 1, name: 'Admin' },
  { id: 2, name: 'Editor' }
];

const mockPermissions = [
  { id: 101, code: 'acc.read', name: 'Leer Contabilidad', group: 'accounting' },
  { id: 102, code: 'acc.write', name: 'Editar Contabilidad', group: 'accounting' },
  { id: 201, code: 'inv.read', name: 'Leer Inventario', group: 'inventory' }
];

const mockRolePermissions = [101];

describe('PermissionManagementPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (roleApi.getRoles as any).mockResolvedValue(mockRoles);
    (permissionApi.getPermissions as any).mockResolvedValue(mockPermissions);
    (permissionApi.getRolePermissions as any).mockResolvedValue(mockRolePermissions);
  });

  const renderPage = () =>
    render(
      <BrowserRouter>
        <PermissionManagementPage />
      </BrowserRouter>,
    );

  it('renders role list and shows empty state for permissions', async () => {
    renderPage();
    expect(await screen.findByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Editor')).toBeInTheDocument();
    expect(screen.getByText(/Selecciona un rol para gestionar sus permisos/i)).toBeInTheDocument();
  });

  it('loads and displays permissions when a role is selected', async () => {
    renderPage();
    await screen.findByText('Admin');
    
    fireEvent.click(screen.getByLabelText(/Seleccionar rol Admin/i));
    
    // Use a more flexible matcher for nested text
    await waitFor(() => {
      expect(screen.getByText(/Permisos para:/i)).toBeInTheDocument();
      expect(screen.getByText('Admin', { selector: 'span' })).toBeInTheDocument();
    });
    
    expect(screen.getByText('accounting')).toBeInTheDocument();
    
    // Check initial state
    const readAccCheckbox = screen.getByLabelText(/Permiso Leer Contabilidad/i) as HTMLInputElement;
    expect(readAccCheckbox.checked).toBe(true);
  });

  it('allows toggling permissions', async () => {
    renderPage();
    fireEvent.click(await screen.findByLabelText(/Seleccionar rol Admin/i));
    
    const checkbox = await screen.findByLabelText(/Permiso Editar Contabilidad/i) as HTMLInputElement;
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
  });

  it('allows selecting all in a group', async () => {
    renderPage();
    fireEvent.click(await screen.findByLabelText(/Seleccionar rol Admin/i));
    
    const selectAllCheckbox = await screen.findByLabelText(/Seleccionar todos en accounting/i) as HTMLInputElement;
    fireEvent.click(selectAllCheckbox);
    
    expect((screen.getByLabelText(/Permiso Leer Contabilidad/i) as HTMLInputElement).checked).toBe(true);
    expect((screen.getByLabelText(/Permiso Editar Contabilidad/i) as HTMLInputElement).checked).toBe(true);
  });

  it('allows saving permissions', async () => {
    renderPage();
    fireEvent.click(await screen.findByLabelText(/Seleccionar rol Admin/i));
    
    await waitFor(() => expect(screen.getByText(/Permisos para:/i)).toBeInTheDocument());
    
    fireEvent.click(screen.getByRole('button', { name: /Guardar Permisos/i }));
    expect(Swal.fire).toHaveBeenCalled();
    
    (permissionApi.setRolePermissions as any).mockResolvedValue({ success: true });
    
    await waitFor(() => {
      expect(permissionApi.setRolePermissions).toHaveBeenCalledWith(1, expect.any(Array));
    });
    
    expect(await screen.findByText(/Permisos guardados exitosamente/i)).toBeInTheDocument();
  });

  it('handles group expansion', async () => {
    renderPage();
    fireEvent.click(await screen.findByLabelText(/Seleccionar rol Admin/i));
    
    const groupHeader = await screen.findByLabelText(/Grupo inventory/i);
    fireEvent.click(groupHeader); // Collapse
    expect(screen.queryByText('Leer Inventario')).not.toBeInTheDocument();
    
    fireEvent.click(groupHeader); // Expand
    expect(screen.getByText('Leer Inventario')).toBeInTheDocument();
  });
});
