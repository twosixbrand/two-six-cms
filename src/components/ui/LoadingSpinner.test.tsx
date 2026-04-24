import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
    it('renders without text', () => {
        const { container } = render(<LoadingSpinner />);
        expect(container.firstChild).toBeTruthy();
    });

    it('renders with text', () => {
        render(<LoadingSpinner text="Cargando..." />);
        expect(screen.getByText('Cargando...')).toBeInTheDocument();
    });

    it('renders sm size', () => {
        const { container } = render(<LoadingSpinner size="sm" />);
        expect(container.firstChild).toBeTruthy();
    });

    it('renders lg size', () => {
        const { container } = render(<LoadingSpinner size="lg" />);
        expect(container.firstChild).toBeTruthy();
    });
});
