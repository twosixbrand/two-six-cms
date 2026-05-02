import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UserPage from './UserPage';
import * as userApi from '../services/userApi';
import Swal from 'sweetalert2';

vi.mock('../services/userApi');
vi.mock('../services/errorApi');
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
  },
}));

const mockUsers = [
  {
    id: 1,
    name: 'Admin User',
    login: 'admin',
    email: 'admin@example.com',
    phone: '123456',
    roles: [{ id: 1, name: 'Admin' }]
  },
  {
    id: 2,
    name: 'Editor User',
    login: 'editor',
    email: 'editor@example.com',
    phone: '654321',
    roles: [{ id: 2, name: 'Editor' }]
  }
];

describe('UserPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (userApi.getUsers as any).mockResolvedValue(mockUsers);
  });

  const renderPage = () =>
    render(
      <BrowserRouter>
        <UserPage />
      </BrowserRouter>,
    );

  it('renders list of users', async () => {
    renderPage();
    expect(await screen.findByText('Admin User')).toBeInTheDocument();
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    
    expect(screen.getByText('Editor User')).toBeInTheDocument();
  });

  it('filters users by search term', async () => {
    renderPage();
    await screen.findByText('Admin User');
    
    const searchInput = screen.getByPlaceholderText(/Buscar por nombre/i);
    fireEvent.change(searchInput, { target: { value: 'Editor' } });
    
    await waitFor(() => {
      expect(screen.queryByText('Admin User')).not.toBeInTheDocument();
      expect(screen.getByText('Editor User')).toBeInTheDocument();
    });
  });

  it('allows creating a new user', async () => {
    renderPage();
    await screen.findByText('Admin User');
    
    fireEvent.click(screen.getByRole('button', { name: /Crear Usuario/i }));
    
    const modal = await screen.findByRole('dialog');
    
    fireEvent.change(within(modal).getByLabelText(/Nombre/i), { target: { value: 'New User' } });
    fireEvent.change(within(modal).getByLabelText(/Login/i), { target: { value: 'newuser' } });
    fireEvent.change(within(modal).getByLabelText(/Email/i), { target: { value: 'new@example.com' } });
    fireEvent.change(within(modal).getByLabelText(/Telefono/i), { target: { value: '111222' } });
    fireEvent.change(within(modal).getByLabelText(/Contrasena/i), { target: { value: 'password123' } });
    
    (userApi.createUser as any).mockResolvedValue({ success: true });
    fireEvent.click(within(modal).getByRole('button', { name: /^Crear$/i }));
    
    await waitFor(() => {
      expect(userApi.createUser).toHaveBeenCalledWith(expect.objectContaining({
        name: 'New User',
        login: 'newuser',
        password: 'password123'
      }));
    });
  });

  it('allows editing an existing user', async () => {
    renderPage();
    await screen.findByText('Admin User');
    
    fireEvent.click(screen.getByLabelText(/Editar usuario Admin User/i));
    
    const modal = await screen.findByRole('dialog');
    const nameInput = within(modal).getByLabelText(/Nombre/i);
    fireEvent.change(nameInput, { target: { value: 'Updated Admin' } });
    
    (userApi.updateUser as any).mockResolvedValue({ success: true });
    fireEvent.click(within(modal).getByRole('button', { name: /Actualizar/i }));
    
    await waitFor(() => {
      expect(userApi.updateUser).toHaveBeenCalledWith(1, expect.objectContaining({
        name: 'Updated Admin'
      }));
    });
  });

  it('allows deleting a user', async () => {
    renderPage();
    await screen.findByText('Admin User');
    
    fireEvent.click(screen.getByLabelText(/Eliminar usuario Admin User/i));
    expect(Swal.fire).toHaveBeenCalled();
    
    (userApi.deleteUser as any).mockResolvedValue({ success: true });
    
    await waitFor(() => {
      expect(userApi.deleteUser).toHaveBeenCalledWith(1);
    });
  });

  it('handles API errors gracefully', async () => {
    (userApi.getUsers as any).mockRejectedValue(new Error('Load Error'));
    renderPage();
    expect(await screen.findByText(/Error al cargar los usuarios/i)).toBeInTheDocument();
  });
});
