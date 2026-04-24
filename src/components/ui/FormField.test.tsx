import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
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
});
