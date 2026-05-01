import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DataTable from './DataTable';

const columns = [
    { key: 'name', header: 'Nombre' },
    { key: 'email', header: 'Email' },
];

const data = [
    { id: 1, name: 'Alice', email: 'alice@test.com' },
    { id: 2, name: 'Bob', email: 'bob@test.com' },
    { id: 3, name: 'Carlos', email: 'carlos@test.com' },
];

// Generate large dataset for pagination tests
const largeData = Array.from({ length: 40 }, (_, i) => ({
    id: i + 1,
    name: `User ${String(i + 1).padStart(3, '0')}`,
    email: `user${i + 1}@test.com`,
}));

describe('DataTable', () => {
    it('renders column headers', () => {
        render(<DataTable columns={columns} data={data} />);
        expect(screen.getByText('Nombre')).toBeInTheDocument();
        expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('renders row data', () => {
        render(<DataTable columns={columns} data={data} />);
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('bob@test.com')).toBeInTheDocument();
    });

    it('shows empty message when data is empty', () => {
        render(<DataTable columns={columns} data={[]} emptyMessage="Sin datos" />);
        expect(screen.getByText('Sin datos')).toBeInTheDocument();
    });

    it('shows loading state', () => {
        render(<DataTable columns={columns} data={[]} loading={true} />);
        const container = document.querySelector('[style*="animation"]');
        expect(container).toBeTruthy();
    });

    it('renders actions column', () => {
        render(
            <DataTable
                columns={columns}
                data={data}
                actions={(row) => <button>Edit {row.name}</button>}
            />
        );
        expect(screen.getByText('Edit Alice')).toBeInTheDocument();
        expect(screen.getByText('Acciones')).toBeInTheDocument();
    });

    it('calls onRowClick when row is clicked', () => {
        const handler = vi.fn();
        render(<DataTable columns={columns} data={data} onRowClick={handler} />);
        fireEvent.click(screen.getByText('Alice'));
        expect(handler).toHaveBeenCalledWith(data[0]);
    });

    it('renders custom cell via render prop', () => {
        const cols = [
            { key: 'name', header: 'Nombre', render: (val: string) => <strong>{val.toUpperCase()}</strong> },
        ];
        render(<DataTable columns={cols} data={data} />);
        expect(screen.getByText('ALICE')).toBeInTheDocument();
    });

    // ── Sorting Tests ───────────────────────────────────────
    it('sorts data ascending on first header click', () => {
        render(<DataTable columns={columns} data={data} />);
        fireEvent.click(screen.getByText('Nombre'));
        const cells = screen.getAllByText(/Alice|Bob|Carlos/);
        expect(cells[0].textContent).toBe('Alice');
        expect(cells[2].textContent).toBe('Carlos');
    });

    it('sorts data descending on second header click', () => {
        render(<DataTable columns={columns} data={data} />);
        // First click: asc
        fireEvent.click(screen.getByText('Nombre'));
        // Second click: desc
        fireEvent.click(screen.getByText('Nombre'));
        const cells = screen.getAllByText(/Alice|Bob|Carlos/);
        expect(cells[0].textContent).toBe('Carlos');
        expect(cells[2].textContent).toBe('Alice');
    });

    it('shows sort indicator arrow after sorting', () => {
        render(<DataTable columns={columns} data={data} />);
        fireEvent.click(screen.getByText('Nombre'));
        expect(screen.getByText('▲')).toBeInTheDocument();
        fireEvent.click(screen.getByText('Nombre'));
        expect(screen.getByText('▼')).toBeInTheDocument();
    });

    // ── Pagination Tests ────────────────────────────────────
    it('paginates data when rows exceed pageSize', () => {
        render(<DataTable columns={columns} data={largeData} pageSize={15} />);
        // Page 1: should show User 001..User 015
        expect(screen.getByText('User 001')).toBeInTheDocument();
        expect(screen.queryByText('User 016')).not.toBeInTheDocument();
    });

    it('navigates to next page on forward button click', () => {
        render(<DataTable columns={columns} data={largeData} pageSize={15} />);
        const nextBtn = screen.getByText('→');
        fireEvent.click(nextBtn);
        // Page 2 should show User 016
        expect(screen.getByText('User 016')).toBeInTheDocument();
        expect(screen.queryByText('User 001')).not.toBeInTheDocument();
    });

    it('navigates to previous page on back button click', () => {
        render(<DataTable columns={columns} data={largeData} pageSize={15} />);
        // Go to page 2
        fireEvent.click(screen.getByText('→'));
        // Go back to page 1
        fireEvent.click(screen.getByText('←'));
        expect(screen.getByText('User 001')).toBeInTheDocument();
    });

    it('disables back button on first page', () => {
        render(<DataTable columns={columns} data={largeData} pageSize={15} />);
        const backBtn = screen.getByText('←');
        expect(backBtn).toBeDisabled();
    });

    it('shows correct record count text', () => {
        render(<DataTable columns={columns} data={largeData} pageSize={15} />);
        expect(screen.getByText(/1–15 de 40/)).toBeInTheDocument();
    });

    it('clicking page number navigates directly to that page', () => {
        render(<DataTable columns={columns} data={largeData} pageSize={15} />);
        // Click page 2
        fireEvent.click(screen.getByText('2'));
        expect(screen.getByText('User 016')).toBeInTheDocument();
    });

    // ── Page Size Tests ─────────────────────────────────────
    it('renders page size selector when onPageSizeChange is provided', () => {
        const handler = vi.fn();
        render(<DataTable columns={columns} data={largeData} pageSize={15} onPageSizeChange={handler} />);
        expect(screen.getByText(/Por pág/)).toBeInTheDocument();
    });

    it('calls onPageSizeChange when page size is changed', () => {
        const handler = vi.fn();
        render(<DataTable columns={columns} data={largeData} pageSize={15} onPageSizeChange={handler} />);
        const select = screen.getByDisplayValue('15');
        fireEvent.change(select, { target: { value: '50' } });
        expect(handler).toHaveBeenCalledWith(50);
    });

    // ── No pagination when data fits in one page ────────────
    it('does not show pagination controls when data fits in one page', () => {
        render(<DataTable columns={columns} data={data} pageSize={15} />);
        expect(screen.queryByText('→')).not.toBeInTheDocument();
        expect(screen.queryByText('←')).not.toBeInTheDocument();
    });
});

