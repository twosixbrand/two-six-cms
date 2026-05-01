import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SizeGuideForm from './SizeGuideForm';

describe('SizeGuideForm', () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();

    it('renders "Nueva Medida de Talla" title when no currentItem', () => {
        render(<SizeGuideForm onSave={onSave} currentItem={null} onCancel={onCancel} />);
        expect(screen.getByText('Nueva Medida de Talla')).toBeInTheDocument();
    });

    it('renders "Editar Medida de Talla" when currentItem is set', () => {
        render(<SizeGuideForm onSave={onSave} currentItem={{ id: 1, size: 'M', width: '53', length: '72' }} onCancel={onCancel} />);
        expect(screen.getByText('Editar Medida de Talla')).toBeInTheDocument();
    });

    it('renders empty inputs for new item', () => {
        render(<SizeGuideForm onSave={onSave} currentItem={null} onCancel={onCancel} />);
        expect(screen.getByPlaceholderText('Ej: M, XL, U (Única)')).toHaveValue('');
        expect(screen.getByPlaceholderText('Ej: 53')).toHaveValue('');
        expect(screen.getByPlaceholderText('Ej: 72')).toHaveValue('');
    });

    it('populates fields when editing', () => {
        render(<SizeGuideForm onSave={onSave} currentItem={{ id: 1, size: 'XL', width: '58', length: '76' }} onCancel={onCancel} />);
        expect(screen.getByDisplayValue('XL')).toBeInTheDocument();
        expect(screen.getByDisplayValue('58')).toBeInTheDocument();
        expect(screen.getByDisplayValue('76')).toBeInTheDocument();
    });

    it('shows ID field when editing', () => {
        render(<SizeGuideForm onSave={onSave} currentItem={{ id: 42, size: 'S', width: '50', length: '68' }} onCancel={onCancel} />);
        expect(screen.getByDisplayValue('42')).toBeInTheDocument();
    });

    it('shows "Crear" button when creating new', () => {
        render(<SizeGuideForm onSave={onSave} currentItem={null} onCancel={onCancel} />);
        expect(screen.getByText('Crear')).toBeInTheDocument();
    });

    it('shows "Actualizar" and "Cancelar" buttons when editing', () => {
        render(<SizeGuideForm onSave={onSave} currentItem={{ id: 1, size: 'M', width: '53', length: '72' }} onCancel={onCancel} />);
        expect(screen.getByText('Actualizar')).toBeInTheDocument();
        expect(screen.getByText('Cancelar')).toBeInTheDocument();
    });

    it('calls onSave with form data on submit', () => {
        render(<SizeGuideForm onSave={onSave} currentItem={null} onCancel={onCancel} />);
        fireEvent.change(screen.getByPlaceholderText('Ej: M, XL, U (Única)'), { target: { value: 'L', name: 'size' } });
        fireEvent.change(screen.getByPlaceholderText('Ej: 53'), { target: { value: '55', name: 'width' } });
        fireEvent.change(screen.getByPlaceholderText('Ej: 72'), { target: { value: '74', name: 'length' } });

        const form = screen.getByText('Crear').closest('form')!;
        fireEvent.submit(form);

        expect(onSave).toHaveBeenCalledWith({ size: 'L', width: '55', length: '74' });
    });

    it('calls onCancel when cancel button is clicked', () => {
        render(<SizeGuideForm onSave={onSave} currentItem={{ id: 1, size: 'M', width: '53', length: '72' }} onCancel={onCancel} />);
        fireEvent.click(screen.getByText('Cancelar'));
        expect(onCancel).toHaveBeenCalledTimes(1);
    });
});
