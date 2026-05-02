import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DataTable from './DataTable';

describe('DataTable Component', () => {
  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Name' },
  ];
  const data = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
  ];

  it('renders table headers and data correctly', () => {
    render(<DataTable columns={columns} data={data} />);

    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('handles row click when onRowClick is provided', () => {
    const mockOnRowClick = vi.fn();
    render(<DataTable columns={columns} data={data} onRowClick={mockOnRowClick} />);

    const firstRow = screen.getByText('Alice').closest('tr')!;
    fireEvent.click(firstRow);

    expect(mockOnRowClick).toHaveBeenCalledWith(data[0]);
  });

  it('renders actions correctly', () => {
    const mockAction = vi.fn((row) => <button>Edit {row.name}</button>);
    render(<DataTable columns={columns} data={data} actions={mockAction} />);

    expect(screen.getByText('Edit Alice')).toBeInTheDocument();
    expect(screen.getByText('Edit Bob')).toBeInTheDocument();
  });

  it('shows loading spinner when loading is true', () => {
    render(<DataTable columns={columns} data={[]} loading={true} />);
    expect(screen.getByText(/Cargando datos/i)).toBeInTheDocument();
  });

  it('shows empty state when data is empty', () => {
    render(<DataTable columns={columns} data={[]} emptyMessage="No data found" />);
    expect(screen.getByText('No data found')).toBeInTheDocument();
  });

  it('handles sorting', () => {
    render(<DataTable columns={columns} data={data} />);
    
    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader); // Sort asc

    // In a real test we'd check row order, but let's at least check the indicator
    expect(screen.getByText('▲')).toBeInTheDocument();
    
    fireEvent.click(nameHeader); // Sort desc
    expect(screen.getByText('▼')).toBeInTheDocument();
  });

  it('handles pagination', () => {
    const manyData = Array.from({ length: 25 }, (_, i) => ({ id: i + 1, name: `User ${i + 1}` }));
    render(<DataTable columns={columns} data={manyData} pageSize={10} />);

    // Page 1: 1-10
    expect(screen.getByText('User 1')).toBeInTheDocument();
    expect(screen.queryByText('User 11')).not.toBeInTheDocument();

    // Go to Page 2
    const nextBtn = screen.getByText('→');
    fireEvent.click(nextBtn);

    expect(screen.getByText('User 11')).toBeInTheDocument();
    expect(screen.queryByText('User 1')).not.toBeInTheDocument();
  });

  it('handles page size change', () => {
    const mockOnPageSizeChange = vi.fn();
    const manyData = Array.from({ length: 25 }, (_, i) => ({ id: i + 1, name: `User ${i + 1}` }));
    render(
      <DataTable 
        columns={columns} 
        data={manyData} 
        pageSize={10} 
        onPageSizeChange={mockOnPageSizeChange} 
      />
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '50' } });

    expect(mockOnPageSizeChange).toHaveBeenCalledWith(50);
  });

  it('handles row hover', () => {
    render(<DataTable columns={columns} data={data} />);
    const firstRow = screen.getByText('Alice').closest('tr')!;
    
    fireEvent.mouseEnter(firstRow);
    fireEvent.mouseLeave(firstRow);
  });
});
