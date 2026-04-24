import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ToastProvider, useToast } from './Toast';

// Helper component to trigger toasts
const ToastTrigger = ({ type, msg }: { type: 'success' | 'error' | 'info'; msg: string }) => {
    const toast = useToast();
    return <button onClick={() => toast[type](msg)}>Fire</button>;
};

describe('Toast', () => {
    it('renders ToastProvider without crashing', () => {
        render(
            <ToastProvider>
                <div>App</div>
            </ToastProvider>
        );
        expect(screen.getByText('App')).toBeInTheDocument();
    });

    it('throws if useToast used outside provider', () => {
        const Bad = () => { useToast(); return null; };
        expect(() => render(<Bad />)).toThrow('useToast must be used within a ToastProvider');
    });
});
