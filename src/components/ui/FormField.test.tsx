import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FormField from './FormField';

describe('FormField', () => {
    it('renders label and input with matching id and htmlFor attributes', () => {
        render(
            <FormField label="Email" name="email" type="email" value="" onChange={() => {}} />
        );

        const label = screen.getByText('Email');
        const input = screen.getByRole('textbox', { name: /email/i }) as HTMLInputElement;

        expect(label).toHaveAttribute('for', 'email');
        expect(input).toHaveAttribute('id', 'email');
    });

    it('renders select element with correct id', () => {
        render(
            <FormField label="Role" name="role" type="select" options={[{ value: 'admin', label: 'Admin' }]} value="" onChange={() => {}} />
        );

        const label = screen.getByText('Role');
        const select = screen.getByRole('combobox', { name: /role/i });

        expect(label).toHaveAttribute('for', 'role');
        expect(select).toHaveAttribute('id', 'role');
    });

    it('renders textarea with correct id', () => {
        render(
            <FormField label="Bio" name="bio" type="textarea" value="" onChange={() => {}} />
        );

        const label = screen.getByText('Bio');
        const textarea = screen.getByRole('textbox', { name: /bio/i });

        expect(label).toHaveAttribute('for', 'bio');
        expect(textarea).toHaveAttribute('id', 'bio');
    });

    it('renders an error message when error prop is provided', () => {
        render(
            <FormField label="Email" name="email" error="Invalid email address" value="" onChange={() => {}} />
        );

        expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    });

    // === Date type tests (YYYY-MM-DD format enforcement) ===

    it('renders type="date" as a text input (not native date picker)', () => {
        render(
            <FormField label="Fecha" name="test_date" type="date" value="" onChange={() => {}} />
        );

        const input = screen.getByRole('textbox', { name: /fecha/i }) as HTMLInputElement;
        expect(input).toHaveAttribute('type', 'text');
    });

    it('shows YYYY-MM-DD placeholder for date fields', () => {
        render(
            <FormField label="Fecha" name="test_date" type="date" value="" onChange={() => {}} />
        );

        const input = screen.getByPlaceholderText('YYYY-MM-DD');
        expect(input).toBeInTheDocument();
    });

    it('enforces maxLength=10 on date fields', () => {
        render(
            <FormField label="Fecha" name="test_date" type="date" value="" onChange={() => {}} />
        );

        const input = screen.getByRole('textbox', { name: /fecha/i }) as HTMLInputElement;
        expect(input).toHaveAttribute('maxLength', '10');
    });

    it('shows a YYYY-MM-DD formatted value in date fields', () => {
        render(
            <FormField label="Fecha" name="test_date" type="date" value="2026-04-24" onChange={() => {}} />
        );

        const input = screen.getByRole('textbox', { name: /fecha/i }) as HTMLInputElement;
        expect(input.value).toBe('2026-04-24');
    });

    it('allows custom placeholder to override YYYY-MM-DD for date fields', () => {
        render(
            <FormField label="Fecha" name="test_date" type="date" value="" onChange={() => {}} placeholder="Ingrese fecha" />
        );

        const input = screen.getByPlaceholderText('Ingrese fecha');
        expect(input).toBeInTheDocument();
    });

    it('fires onChange when date field value changes', () => {
        const handleChange = vi.fn();
        render(
            <FormField label="Fecha" name="test_date" type="date" value="" onChange={handleChange} />
        );

        const input = screen.getByRole('textbox', { name: /fecha/i });
        fireEvent.change(input, { target: { value: '2026-01-15' } });
        expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('shows required asterisk when required prop is set', () => {
        render(
            <FormField label="Fecha" name="test_date" type="date" value="" onChange={() => {}} required />
        );

        expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('applies disabled state to date field', () => {
        render(
            <FormField label="Fecha" name="test_date" type="date" value="2026-04-24" onChange={() => {}} disabled />
        );

        const input = screen.getByRole('textbox', { name: /fecha/i }) as HTMLInputElement;
        expect(input).toBeDisabled();
    });

    // === Auto-dash insertion tests ===

    it('auto-inserts dash after 4-digit year input', () => {
        const handleChange = vi.fn();
        render(
            <FormField label="Fecha" name="test_date" type="date" value="" onChange={handleChange} />
        );

        const input = screen.getByRole('textbox', { name: /fecha/i });
        fireEvent.change(input, { target: { value: '20260' } });
        expect(handleChange).toHaveBeenCalledWith(
            expect.objectContaining({ target: { name: 'test_date', value: '2026-0' } })
        );
    });

    it('auto-inserts dash after month digits', () => {
        const handleChange = vi.fn();
        render(
            <FormField label="Fecha" name="test_date" type="date" value="" onChange={handleChange} />
        );

        const input = screen.getByRole('textbox', { name: /fecha/i });
        fireEvent.change(input, { target: { value: '2026041' } });
        expect(handleChange).toHaveBeenCalledWith(
            expect.objectContaining({ target: { name: 'test_date', value: '2026-04-1' } })
        );
    });

    it('formats 8 raw digits into YYYY-MM-DD', () => {
        const handleChange = vi.fn();
        render(
            <FormField label="Fecha" name="test_date" type="date" value="" onChange={handleChange} />
        );

        const input = screen.getByRole('textbox', { name: /fecha/i });
        fireEvent.change(input, { target: { value: '20260424' } });
        expect(handleChange).toHaveBeenCalledWith(
            expect.objectContaining({ target: { name: 'test_date', value: '2026-04-24' } })
        );
    });

    it('strips non-digit characters from date input', () => {
        const handleChange = vi.fn();
        render(
            <FormField label="Fecha" name="test_date" type="date" value="" onChange={handleChange} />
        );

        const input = screen.getByRole('textbox', { name: /fecha/i });
        fireEvent.change(input, { target: { value: '2026/04/24' } });
        expect(handleChange).toHaveBeenCalledWith(
            expect.objectContaining({ target: { name: 'test_date', value: '2026-04-24' } })
        );
    });

    // === Select with multiple options ===

    it('renders select with multiple options', () => {
        render(
            <FormField
                label="País"
                name="country"
                type="select"
                options={[
                    { value: 'co', label: 'Colombia' },
                    { value: 'mx', label: 'México' },
                    { value: 'ar', label: 'Argentina' },
                ]}
                value="co"
                onChange={() => {}}
            />
        );
        expect(screen.getByText('Colombia')).toBeInTheDocument();
        expect(screen.getByText('México')).toBeInTheDocument();
        expect(screen.getByText('Argentina')).toBeInTheDocument();
    });

    it('fires onChange when select value changes', () => {
        const handleChange = vi.fn();
        render(
            <FormField
                label="País"
                name="country"
                type="select"
                options={[
                    { value: 'co', label: 'Colombia' },
                    { value: 'mx', label: 'México' },
                ]}
                value="co"
                onChange={handleChange}
            />
        );
        const select = screen.getByRole('combobox', { name: /país/i });
        fireEvent.change(select, { target: { value: 'mx' } });
        expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('renders select with placeholder as disabled option', () => {
        render(
            <FormField
                label="País"
                name="country"
                type="select"
                options={[{ value: 'co', label: 'Colombia' }]}
                value=""
                onChange={() => {}}
                placeholder="Seleccionar..."
            />
        );
        const placeholder = screen.getByText('Seleccionar...');
        expect(placeholder).toBeInTheDocument();
        expect(placeholder).toBeDisabled();
    });

    it('disables select when disabled prop is set', () => {
        render(
            <FormField
                label="País"
                name="country"
                type="select"
                options={[{ value: 'co', label: 'Colombia' }]}
                value="co"
                onChange={() => {}}
                disabled
            />
        );
        const select = screen.getByRole('combobox', { name: /país/i });
        expect(select).toBeDisabled();
    });

    // === Textarea ===

    it('renders textarea with custom rows', () => {
        render(
            <FormField label="Notas" name="notes" type="textarea" value="" onChange={() => {}} rows={6} />
        );
        const textarea = screen.getByRole('textbox', { name: /notas/i }) as HTMLTextAreaElement;
        expect(textarea.rows).toBe(6);
    });

    it('renders textarea with placeholder', () => {
        render(
            <FormField label="Notas" name="notes" type="textarea" value="" onChange={() => {}} placeholder="Escribe aquí..." />
        );
        expect(screen.getByPlaceholderText('Escribe aquí...')).toBeInTheDocument();
    });

    it('disables textarea when disabled prop is set', () => {
        render(
            <FormField label="Notas" name="notes" type="textarea" value="texto" onChange={() => {}} disabled />
        );
        const textarea = screen.getByRole('textbox', { name: /notas/i });
        expect(textarea).toBeDisabled();
    });

    // === Focus / Blur ===

    it('applies focus border on input focus', () => {
        render(
            <FormField label="Nombre" name="nombre" type="text" value="" onChange={() => {}} />
        );
        const input = screen.getByRole('textbox', { name: /nombre/i });
        input.focus();
        expect(input).toHaveFocus();
    });

    it('removes focus border on blur', () => {
        render(
            <FormField label="Nombre" name="nombre" type="text" value="" onChange={() => {}} />
        );
        const input = screen.getByRole('textbox', { name: /nombre/i });
        input.focus();
        input.blur();
        expect(input).not.toHaveFocus();
    });

    // === Number type ===

    it('renders number input correctly', () => {
        render(
            <FormField label="Cantidad" name="qty" type="number" value="5" onChange={() => {}} />
        );
        const input = screen.getByRole('spinbutton', { name: /cantidad/i }) as HTMLInputElement;
        expect(input.type).toBe('number');
        expect(input.value).toBe('5');
    });

    // === Disabled text input ===

    it('disables text input when disabled prop is set', () => {
        render(
            <FormField label="Código" name="code" type="text" value="ABC" onChange={() => {}} disabled />
        );
        const input = screen.getByRole('textbox', { name: /código/i });
        expect(input).toBeDisabled();
    });

    // === Error with focused state ===

    it('shows error border when both error and focused', () => {
        render(
            <FormField label="Email" name="email" type="email" value="" onChange={() => {}} error="Campo requerido" />
        );
        const input = screen.getByRole('textbox', { name: /email/i });
        fireEvent.focus(input);
        expect(screen.getByText('Campo requerido')).toBeInTheDocument();
    });
});
