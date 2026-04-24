import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import EmptyState from './EmptyState';

describe('EmptyState', () => {
    it('renders default title', () => {
        render(<EmptyState />);
        expect(screen.getByText('No hay datos')).toBeInTheDocument();
    });

    it('renders custom title', () => {
        render(<EmptyState title="Sin resultados" />);
        expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    });

    it('renders description', () => {
        render(<EmptyState description="Intenta con otros filtros" />);
        expect(screen.getByText('Intenta con otros filtros')).toBeInTheDocument();
    });

    it('renders icon', () => {
        render(<EmptyState icon={<span data-testid="empty-icon">📭</span>} />);
        expect(screen.getByTestId('empty-icon')).toBeInTheDocument();
    });

    it('renders action button', () => {
        render(<EmptyState action={<button>Crear nuevo</button>} />);
        expect(screen.getByText('Crear nuevo')).toBeInTheDocument();
    });
});
