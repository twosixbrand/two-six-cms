import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ManualConsignacionPage from './ManualConsignacionPage';

describe('ManualConsignacionPage', () => {
  it('renders the manual iframe', () => {
    render(<ManualConsignacionPage />);
    const iframe = document.querySelector('iframe');
    expect(iframe).not.toBeNull();
    expect(iframe?.getAttribute('src')).toBe('/Manual_Consignacion_TwoSix.html');
    expect(iframe?.getAttribute('title')).toContain('Manual de Consignación');
  });

  it('sets full viewport height style', () => {
    const { container } = render(<ManualConsignacionPage />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.height).toBe('calc(100vh - 80px)');
  });
});
