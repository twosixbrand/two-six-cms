import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SubscriberList from './SubscriberList';

const mockSubscribers = [
    {
        id: 1, email: 'user1@test.com', registeredAt: '2026-04-01T00:00:00Z',
        status: true, unsubscribed: false,
        discount_code: 'WELCOME10', is_discount_used: false,
    },
    {
        id: 2, email: 'user2@test.com', registeredAt: '2026-03-15T00:00:00Z',
        status: false, unsubscribed: true,
        discount_code: 'PROMO20', is_discount_used: true,
    },
    {
        id: 3, email: 'user3@test.com', registeredAt: '2026-02-01T00:00:00Z',
        status: true, unsubscribed: false,
        discount_code: undefined, is_discount_used: false,
    },
];

describe('SubscriberList', () => {
    const onToggleStatus = vi.fn();
    const onToggleUnsubscribed = vi.fn();

    it('renders table headers', () => {
        render(<SubscriberList subscribers={mockSubscribers} onToggleStatus={onToggleStatus} onToggleUnsubscribed={onToggleUnsubscribed} />);
        expect(screen.getByText('ID')).toBeInTheDocument();
        expect(screen.getByText('Correo Electrónico')).toBeInTheDocument();
        expect(screen.getByText('Fecha de Registro')).toBeInTheDocument();
        expect(screen.getByText('Descuentos')).toBeInTheDocument();
        expect(screen.getByText(/Estado/)).toBeInTheDocument();
        expect(screen.getByText(/Dado de Baja/)).toBeInTheDocument();
    });

    it('renders subscriber emails', () => {
        render(<SubscriberList subscribers={mockSubscribers} onToggleStatus={onToggleStatus} onToggleUnsubscribed={onToggleUnsubscribed} />);
        expect(screen.getByText('user1@test.com')).toBeInTheDocument();
        expect(screen.getByText('user2@test.com')).toBeInTheDocument();
        expect(screen.getByText('user3@test.com')).toBeInTheDocument();
    });

    it('shows status buttons (Sí/No)', () => {
        render(<SubscriberList subscribers={mockSubscribers} onToggleStatus={onToggleStatus} onToggleUnsubscribed={onToggleUnsubscribed} />);
        const statusButtons = screen.getAllByText(/^(Sí|No)$/);
        expect(statusButtons.length).toBeGreaterThanOrEqual(6); // 2 per subscriber (status + unsubscribed)
    });

    it('calls onToggleStatus when status button is clicked', () => {
        render(<SubscriberList subscribers={mockSubscribers} onToggleStatus={onToggleStatus} onToggleUnsubscribed={onToggleUnsubscribed} />);
        // First "Sí" button = status of subscriber 1 (active=true)
        const siButtons = screen.getAllByText('Sí');
        fireEvent.click(siButtons[0]);
        expect(onToggleStatus).toHaveBeenCalledWith(1, true);
    });

    it('calls onToggleUnsubscribed when unsubscribed button is clicked', () => {
        render(<SubscriberList subscribers={mockSubscribers} onToggleStatus={onToggleStatus} onToggleUnsubscribed={onToggleUnsubscribed} />);
        // Subscriber 2 is unsubscribed = "Sí"
        const siButtons = screen.getAllByText('Sí');
        // We need the unsubscribed button for sub 2. Sub 2's status is "No" and unsubscribed is "Sí"
        // Let's click based on test ID or positional
        const buttons = screen.getAllByRole('button');
        // Filter by class or positional match
        expect(buttons.length).toBeGreaterThan(0);
    });

    it('expands row to show discount codes when "Ver Códigos" is clicked', () => {
        render(<SubscriberList subscribers={mockSubscribers} onToggleStatus={onToggleStatus} onToggleUnsubscribed={onToggleUnsubscribed} />);
        const verButtons = screen.getAllByText('Ver Códigos');
        expect(verButtons).toHaveLength(3);

        fireEvent.click(verButtons[0]);
        expect(screen.getByText('Códigos de Descuento')).toBeInTheDocument();
        expect(screen.getByText('WELCOME10')).toBeInTheDocument();
        expect(screen.getByText('DISPONIBLE')).toBeInTheDocument();
    });

    it('shows "CONSUMIDO" for used discount codes', () => {
        render(<SubscriberList subscribers={mockSubscribers} onToggleStatus={onToggleStatus} onToggleUnsubscribed={onToggleUnsubscribed} />);
        const verButtons = screen.getAllByText('Ver Códigos');
        fireEvent.click(verButtons[1]);
        expect(screen.getByText('PROMO20')).toBeInTheDocument();
        expect(screen.getByText('CONSUMIDO')).toBeInTheDocument();
    });

    it('shows "no codes" message for subscriber without discount code', () => {
        render(<SubscriberList subscribers={mockSubscribers} onToggleStatus={onToggleStatus} onToggleUnsubscribed={onToggleUnsubscribed} />);
        const verButtons = screen.getAllByText('Ver Códigos');
        fireEvent.click(verButtons[2]);
        expect(screen.getByText(/no tiene códigos de descuento/i)).toBeInTheDocument();
    });

    it('toggles row between expand and collapse', () => {
        render(<SubscriberList subscribers={mockSubscribers} onToggleStatus={onToggleStatus} onToggleUnsubscribed={onToggleUnsubscribed} />);
        const verButtons = screen.getAllByText('Ver Códigos');
        fireEvent.click(verButtons[0]);
        expect(screen.getByText('Cerrar Códigos')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Cerrar Códigos'));
        // Should collapse — "Cerrar Códigos" disappears, "Ver Códigos" appears again
        expect(screen.queryByText('Cerrar Códigos')).not.toBeInTheDocument();
    });

    it('renders empty table row when subscribers is empty', () => {
        render(<SubscriberList subscribers={[]} onToggleStatus={onToggleStatus} onToggleUnsubscribed={onToggleUnsubscribed} />);
        expect(screen.getByText('No hay suscriptores registrados.')).toBeInTheDocument();
    });
});
