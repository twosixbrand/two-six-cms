import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PageHeader from './PageHeader';

describe('PageHeader', () => {
    it('renders title', () => {
        render(<PageHeader title="Dashboard" icon={<span>📊</span>} />);
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('renders icon', () => {
        render(<PageHeader title="Test" icon={<span data-testid="hdr-icon">🏠</span>} />);
        expect(screen.getByTestId('hdr-icon')).toBeInTheDocument();
    });

    it('renders children', () => {
        render(
            <PageHeader title="Test" icon={<span>📊</span>}>
                <button>Action</button>
            </PageHeader>
        );
        expect(screen.getByText('Action')).toBeInTheDocument();
    });
});
