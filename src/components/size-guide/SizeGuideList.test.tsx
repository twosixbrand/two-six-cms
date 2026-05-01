import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SizeGuideList from './SizeGuideList';

const mockItems = [
    { id: 1, size: 'S', width: '48', length: '68' },
    { id: 2, size: 'M', width: '53', length: '72' },
    { id: 3, size: 'L', width: '56', length: '76' },
];

describe('SizeGuideList', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    it('renders empty state when no items', () => {
        render(<SizeGuideList items={[]} onEdit={onEdit} onDelete={onDelete} />);
        expect(screen.getByText('No hay medidas registradas.')).toBeInTheDocument();
    });

    it('renders empty state when items is null', () => {
        render(<SizeGuideList items={null} onEdit={onEdit} onDelete={onDelete} />);
        expect(screen.getByText('No hay medidas registradas.')).toBeInTheDocument();
    });

    it('renders table headers', () => {
        render(<SizeGuideList items={mockItems} onEdit={onEdit} onDelete={onDelete} />);
        expect(screen.getByText('ID')).toBeInTheDocument();
        expect(screen.getByText('Talla')).toBeInTheDocument();
        expect(screen.getByText('Ancho')).toBeInTheDocument();
        expect(screen.getByText('Largo')).toBeInTheDocument();
        expect(screen.getByText('Acciones')).toBeInTheDocument();
    });

    it('renders all items', () => {
        render(<SizeGuideList items={mockItems} onEdit={onEdit} onDelete={onDelete} />);
        expect(screen.getByText('S')).toBeInTheDocument();
        expect(screen.getByText('M')).toBeInTheDocument();
        expect(screen.getByText('L')).toBeInTheDocument();
    });

    it('renders width and length values', () => {
        render(<SizeGuideList items={mockItems} onEdit={onEdit} onDelete={onDelete} />);
        expect(screen.getByText('48')).toBeInTheDocument();
        expect(screen.getByText('72')).toBeInTheDocument();
        expect(screen.getByText('76')).toBeInTheDocument();
    });

    it('calls onEdit when edit button is clicked', () => {
        render(<SizeGuideList items={mockItems} onEdit={onEdit} onDelete={onDelete} />);
        const editButtons = screen.getAllByTitle('Editar');
        fireEvent.click(editButtons[1]);
        expect(onEdit).toHaveBeenCalledWith(mockItems[1]);
    });

    it('calls onDelete when delete button is clicked', () => {
        render(<SizeGuideList items={mockItems} onEdit={onEdit} onDelete={onDelete} />);
        const deleteButtons = screen.getAllByTitle('Eliminar');
        fireEvent.click(deleteButtons[2]);
        expect(onDelete).toHaveBeenCalledWith(3); // id of third item
    });

    it('renders edit and delete buttons for each row', () => {
        render(<SizeGuideList items={mockItems} onEdit={onEdit} onDelete={onDelete} />);
        expect(screen.getAllByTitle('Editar')).toHaveLength(3);
        expect(screen.getAllByTitle('Eliminar')).toHaveLength(3);
    });
});
