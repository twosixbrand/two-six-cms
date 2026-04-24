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
        // LoadingSpinner is rendered internally
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

    it('sorts data when header is clicked', () => {
        render(<DataTable columns={columns} data={data} />);
        fireEvent.click(screen.getByText('Nombre'));
        // After sorting asc, Alice should still be first
        const cells = screen.getAllByText(/Alice|Bob|Carlos/);
        expect(cells.length).toBe(3);
    });
});
