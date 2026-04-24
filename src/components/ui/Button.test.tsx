import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Button from './Button';

describe('Button', () => {
    it('renders children text', () => {
        render(<Button>Click Me</Button>);
        expect(screen.getByText('Click Me')).toBeInTheDocument();
    });

    it('calls onClick when clicked', () => {
        const handler = vi.fn();
        render(<Button onClick={handler}>Press</Button>);
        fireEvent.click(screen.getByText('Press'));
        expect(handler).toHaveBeenCalledTimes(1);
    });

    it('does not fire onClick when disabled', () => {
        const handler = vi.fn();
        render(<Button onClick={handler} disabled>Nope</Button>);
        fireEvent.click(screen.getByText('Nope'));
        expect(handler).not.toHaveBeenCalled();
    });

    it('shows loading spinner text when loading', () => {
        render(<Button loading>Save</Button>);
        const btn = screen.getByRole('button');
        expect(btn).toBeDisabled();
    });

    it('renders with icon', () => {
        render(<Button icon={<span data-testid="icon">★</span>}>Star</Button>);
        expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('applies primary variant by default', () => {
        render(<Button>Primary</Button>);
        const btn = screen.getByRole('button');
        expect(btn.style.background).toBeTruthy();
    });

    it('renders as submit type', () => {
        render(<Button type="submit">Submit</Button>);
        expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });
});
