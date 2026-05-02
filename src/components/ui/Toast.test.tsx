import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { ToastProvider, useToast } from './Toast';

// Test component to use the toast hook
const TestComponent = () => {
  const toast = useToast();
  return (
    <div>
      <button onClick={() => toast.success('Success message')}>Success</button>
      <button onClick={() => toast.error('Error message')}>Error</button>
      <button onClick={() => toast.info('Info message')}>Info</button>
    </div>
  );
};

describe('Toast System', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a success toast when calling toast.success', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Success'));
    
    expect(screen.getByText('Success message')).toBeInTheDocument();
    // Success checkmark icon (✓)
    expect(screen.getByText('\u2713')).toBeInTheDocument();
  });

  it('renders an error toast when calling toast.error', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Error'));
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('removes toast after timeout', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Info'));
    expect(screen.getByText('Info message')).toBeInTheDocument();

    // Fast-forward 4 seconds for the timer
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    
    // It should start exiting (opacity changes, etc.)
    // After another 300ms it should be removed
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.queryByText('Info message')).not.toBeInTheDocument();
  });

  it('removes toast when clicking close button', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Success'));
    const closeBtn = screen.getByLabelText('Cerrar');
    
    fireEvent.click(closeBtn);

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.queryByText('Success message')).not.toBeInTheDocument();
  });

  it('throws error when useToast is used outside provider', () => {
    // Silence console.error for this test as it's expected to throw
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => render(<TestComponent />)).toThrow('useToast must be used within a ToastProvider');
    
    spy.mockRestore();
  });
});
