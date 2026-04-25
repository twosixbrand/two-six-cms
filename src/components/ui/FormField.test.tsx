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
});

