import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CustomerList from './CustomerList';

const mockCustomers = [
    {
        id: 1, name: 'Juan Pérez', email: 'juan@test.com',
        current_phone_number: '3001234567', is_registered: true,
        document_number: '1234567890', city: 'Medellín', state: 'Antioquia',
        identificationType: { name: 'CC' }, customerType: { name: 'Premium' },
    },
    {
        id: 2, name: 'María López', email: 'maria@test.com',
        current_phone_number: '3009876543', is_registered: false,
        document_number: null, city: '', state: '',
        identificationType: null, customerType: null,
    },
];

describe('CustomerList', () => {
    const onEdit = vi.fn();

    it('renders empty state when no customers', () => {
        render(<CustomerList items={[]} onEdit={onEdit} />);
        expect(screen.getByText('No hay clientes registrados.')).toBeInTheDocument();
    });

    it('renders empty state when items is null', () => {
        render(<CustomerList items={null} onEdit={onEdit} />);
        expect(screen.getByText('No hay clientes registrados.')).toBeInTheDocument();
    });

    it('renders customer names', () => {
        render(<CustomerList items={mockCustomers} onEdit={onEdit} />);
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
        expect(screen.getByText('María López')).toBeInTheDocument();
    });

    it('shows registration badge (Registrado vs Invitado)', () => {
        render(<CustomerList items={mockCustomers} onEdit={onEdit} />);
        expect(screen.getByText('✓ Registrado')).toBeInTheDocument();
        expect(screen.getByText('⚠ Invitado')).toBeInTheDocument();
    });

    it('shows document number with type prefix', () => {
        render(<CustomerList items={mockCustomers} onEdit={onEdit} />);
        expect(screen.getByText(/CC.*1234567890/)).toBeInTheDocument();
    });

    it('shows customer contact info', () => {
        render(<CustomerList items={mockCustomers} onEdit={onEdit} />);
        expect(screen.getByText('juan@test.com')).toBeInTheDocument();
        expect(screen.getByText('3001234567')).toBeInTheDocument();
    });

    it('shows location when city/state are present', () => {
        render(<CustomerList items={mockCustomers} onEdit={onEdit} />);
        expect(screen.getByText('Medellín, Antioquia')).toBeInTheDocument();
    });

    it('shows customer type when available', () => {
        render(<CustomerList items={mockCustomers} onEdit={onEdit} />);
        expect(screen.getByText('Premium')).toBeInTheDocument();
    });

    it('calls onEdit when edit button is clicked', () => {
        render(<CustomerList items={mockCustomers} onEdit={onEdit} />);
        const editButtons = screen.getAllByTitle('Editar');
        fireEvent.click(editButtons[0]);
        expect(onEdit).toHaveBeenCalledWith(mockCustomers[0]);
    });

    it('renders edit button for each customer', () => {
        render(<CustomerList items={mockCustomers} onEdit={onEdit} />);
        const editButtons = screen.getAllByTitle('Editar');
        expect(editButtons).toHaveLength(2);
    });
});
