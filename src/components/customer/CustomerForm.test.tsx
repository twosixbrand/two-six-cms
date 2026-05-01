import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CustomerForm from './CustomerForm';

vi.mock('../../services/locationApi', () => ({
    default: {
        getDepartments: vi.fn().mockResolvedValue([
            { id: 1, name: 'Antioquia' },
            { id: 2, name: 'Cundinamarca' },
        ]),
        getCities: vi.fn().mockResolvedValue([
            { id: 10, name: 'Medellín' },
            { id: 11, name: 'Envigado' },
        ]),
    },
}));

const mockCustomer = {
    id: 1,
    name: 'Juan Pérez',
    email: 'juan@test.com',
    current_phone_number: '3001234567',
    shipping_address: 'Calle 10 #20-30',
    city: 'Medellín',
    state: 'Antioquia',
    postal_code: '050001',
    country: 'Colombia',
    document_number: '1234567890',
};

describe('CustomerForm', () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('shows placeholder message when no customer is selected', () => {
        render(<CustomerForm currentItem={null} onSave={onSave} onCancel={onCancel} />);
        expect(screen.getByText(/Selecciona un cliente/i)).toBeInTheDocument();
    });

    it('renders form with customer data when editing', async () => {
        render(<CustomerForm currentItem={mockCustomer} onSave={onSave} onCancel={onCancel} />);
        expect(screen.getByText('Editar Cliente')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Juan Pérez')).toBeInTheDocument();
        expect(screen.getByDisplayValue('juan@test.com')).toBeInTheDocument();
        expect(screen.getByDisplayValue('3001234567')).toBeInTheDocument();
    });

    it('shows document number badge when present', () => {
        render(<CustomerForm currentItem={mockCustomer} onSave={onSave} onCancel={onCancel} />);
        expect(screen.getByText('1234567890')).toBeInTheDocument();
    });

    it('renders all form labels', () => {
        render(<CustomerForm currentItem={mockCustomer} onSave={onSave} onCancel={onCancel} />);
        expect(screen.getByLabelText('Nombre')).toBeInTheDocument();
        expect(screen.getByLabelText('Correo Electrónico')).toBeInTheDocument();
        expect(screen.getByLabelText('Teléfono')).toBeInTheDocument();
        expect(screen.getByLabelText('Dirección de Envío')).toBeInTheDocument();
    });

    it('calls onSave with updated data on submit', async () => {
        render(<CustomerForm currentItem={mockCustomer} onSave={onSave} onCancel={onCancel} />);
        const nameInput = screen.getByDisplayValue('Juan Pérez');
        fireEvent.change(nameInput, { target: { value: 'Juan Actualizado', name: 'name' } });

        const submitBtn = screen.getByText('Actualizar');
        fireEvent.click(submitBtn);

        expect(onSave).toHaveBeenCalledTimes(1);
        expect(onSave.mock.calls[0][0]).toMatchObject({ name: 'Juan Actualizado' });
    });

    it('calls onCancel when cancel button is clicked', () => {
        render(<CustomerForm currentItem={mockCustomer} onSave={onSave} onCancel={onCancel} />);
        fireEvent.click(screen.getByText('Cancelar'));
        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('updates form fields when a different customer is selected', () => {
        const { rerender } = render(
            <CustomerForm currentItem={mockCustomer} onSave={onSave} onCancel={onCancel} />
        );

        const newCustomer = { ...mockCustomer, id: 2, name: 'María López', email: 'maria@test.com' };
        rerender(<CustomerForm currentItem={newCustomer} onSave={onSave} onCancel={onCancel} />);

        expect(screen.getByDisplayValue('María López')).toBeInTheDocument();
        expect(screen.getByDisplayValue('maria@test.com')).toBeInTheDocument();
    });

    it('loads department options on mount', async () => {
        render(<CustomerForm currentItem={mockCustomer} onSave={onSave} onCancel={onCancel} />);
        await waitFor(() => {
            expect(screen.getByText('Antioquia')).toBeInTheDocument();
            expect(screen.getByText('Cundinamarca')).toBeInTheDocument();
        });
    });
});
