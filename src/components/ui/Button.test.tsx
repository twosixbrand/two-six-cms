import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Button from './Button';

describe('Button component', () => {
  it('renders children correctly', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders in loading state and disables interaction', () => {
    const handleClick = vi.fn();
    render(<Button loading onClick={handleClick}>Click Me</Button>);
    
    // Should not show text (or at least not be clickable)
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders in disabled state', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Click Me</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveStyle({ opacity: '0.5' });
  });

  it('applies variant styles (primary)', () => {
    render(<Button variant="primary">Primary</Button>);
    const button = screen.getByRole('button');
    // Using RGB because computed styles are often RGB
    expect(button).toHaveStyle({ background: 'rgb(240, 180, 41)' });
  });

  it('applies variant styles (destructive)', () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveStyle({ color: 'rgb(248, 113, 113)' });
  });

  it('handles mouse enter and leave (hover state)', () => {
    render(<Button variant="primary">Hover Me</Button>);
    const button = screen.getByRole('button');
    
    fireEvent.mouseEnter(button);
    // After mouse enter, the background should change (see implementation)
    expect(button).toHaveStyle({ background: 'rgb(217, 158, 30)' }); // #d99e1e

    fireEvent.mouseLeave(button);
    expect(button).toHaveStyle({ background: 'rgb(240, 180, 41)' });
  });
});
