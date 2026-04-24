import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SearchInput from './SearchInput';

describe('SearchInput', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    it('renders with placeholder', () => {
        render(<SearchInput value="" onChange={vi.fn()} placeholder="Buscar..." />);
        expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument();
    });

    it('renders default placeholder', () => {
        render(<SearchInput value="" onChange={vi.fn()} />);
        expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument();
    });

    it('calls onChange after debounce', async () => {
        const handler = vi.fn();
        render(<SearchInput value="" onChange={handler} />);
        const input = screen.getByPlaceholderText('Buscar...');
        fireEvent.change(input, { target: { value: 'test' } });
        act(() => { vi.advanceTimersByTime(350); });
        expect(handler).toHaveBeenCalledWith('test');
    });

    it('shows clear button when value is present', () => {
        render(<SearchInput value="hello" onChange={vi.fn()} />);
        const input = screen.getByDisplayValue('hello');
        expect(input).toBeInTheDocument();
    });

    it('clears input on clear click', () => {
        const handler = vi.fn();
        render(<SearchInput value="hello" onChange={handler} />);
        const clearBtn = screen.getByLabelText('Limpiar busqueda');
        fireEvent.click(clearBtn);
        expect(handler).toHaveBeenCalledWith('');
    });
});
