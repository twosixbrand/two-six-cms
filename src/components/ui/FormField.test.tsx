import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FormField from './FormField';

describe('FormField Component', () => {
  const mockOnChange = vi.fn();

  it('renders a text input correctly', () => {
    render(
      <FormField
        label="Full Name"
        name="fullName"
        value=""
        onChange={mockOnChange}
        placeholder="Enter your name"
      />
    );

    const label = screen.getByText(/Full Name/i);
    const input = screen.getByPlaceholderText(/Enter your name/i);

    expect(label).toBeInTheDocument();
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
  });

  it('handles text input changes', () => {
    render(
      <FormField
        label="Name"
        name="name"
        value=""
        onChange={mockOnChange}
      />
    );

    const input = screen.getByLabelText(/Name/i);
    fireEvent.change(input, { target: { value: 'John Doe' } });

    expect(mockOnChange).toHaveBeenCalled();
  });

  it('renders a select input correctly', () => {
    const options = [
      { value: '1', label: 'Option 1' },
      { value: '2', label: 'Option 2' },
    ];

    render(
      <FormField
        label="Choice"
        name="choice"
        type="select"
        value="1"
        onChange={mockOnChange}
        options={options}
      />
    );

    const select = screen.getByLabelText(/Choice/i);
    expect(select.tagName).toBe('SELECT');
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('renders a textarea correctly', () => {
    render(
      <FormField
        label="Notes"
        name="notes"
        type="textarea"
        value="Sample text"
        onChange={mockOnChange}
      />
    );

    const textarea = screen.getByLabelText(/Notes/i);
    expect(textarea.tagName).toBe('TEXTAREA');
    expect(textarea).toHaveValue('Sample text');
  });

  it('renders a date input and formats input correctly', () => {
    render(
      <FormField
        label="Date"
        name="date"
        type="date"
        value=""
        onChange={mockOnChange}
      />
    );

    const input = screen.getByLabelText(/Date/i);
    
    // Simulate typing '20260501'
    fireEvent.change(input, { target: { value: '20260501' } });

    expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({
      target: expect.objectContaining({
        value: '2026-05-01'
      })
    }));
  });

  it('displays error message when provided', () => {
    render(
      <FormField
        label="Field"
        name="field"
        value=""
        onChange={mockOnChange}
        error="This field is required"
      />
    );

    expect(screen.getByText(/This field is required/i)).toBeInTheDocument();
  });

  it('shows required asterisk when required', () => {
    render(
      <FormField
        label="Email"
        name="email"
        value=""
        onChange={mockOnChange}
        required={true}
      />
    );

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('disables the input when disabled prop is true', () => {
    render(
      <FormField
        label="Disabled Field"
        name="disabled"
        value=""
        onChange={mockOnChange}
        disabled={true}
      />
    );

    const input = screen.getByLabelText(/Disabled Field/i);
    expect(input).toBeDisabled();
  });

  it('handles focus and blur states', () => {
    render(
      <FormField
        label="Focus Test"
        name="focus"
        value=""
        onChange={mockOnChange}
      />
    );

    const input = screen.getByLabelText(/Focus Test/i);
    
    fireEvent.focus(input);
    // Visual focus state is internal, but we can verify it doesn't crash
    
    fireEvent.blur(input);
  });
});
