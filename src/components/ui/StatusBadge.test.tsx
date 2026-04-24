import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatusBadge from './StatusBadge';

describe('StatusBadge', () => {
    it('renders status text', () => {
        render(<StatusBadge status="Pagado" />);
        expect(screen.getByText('Pagado')).toBeInTheDocument();
    });

    it('auto-detects success variant for known statuses', () => {
        render(<StatusBadge status="pagado" />);
        const el = screen.getByText('pagado');
        expect(el.style.color).toBe('rgb(52, 211, 153)'); // #34d399
    });

    it('auto-detects warning variant', () => {
        render(<StatusBadge status="pendiente" />);
        const el = screen.getByText('pendiente');
        expect(el.style.color).toBe('rgb(251, 191, 36)'); // #fbbf24
    });

    it('uses neutral for unknown statuses', () => {
        render(<StatusBadge status="desconocido" />);
        const el = screen.getByText('desconocido');
        expect(el.style.color).toBe('rgb(160, 160, 176)'); // #a0a0b0
    });

    it('respects explicit variant prop', () => {
        render(<StatusBadge status="custom" variant="error" />);
        const el = screen.getByText('custom');
        expect(el.style.color).toBe('rgb(248, 113, 113)'); // #f87171
    });

    it('renders sm size', () => {
        render(<StatusBadge status="OK" size="sm" />);
        expect(screen.getByText('OK')).toBeInTheDocument();
    });
});
