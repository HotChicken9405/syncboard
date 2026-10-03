import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SearchFilterBar from "../components/SearchFilterBar/SearchFilterBar.jsx";

const defaultFilters = {
  search: '',
  priority: 'all',
  dueFilter: 'all',
  sortBy: 'position',
};

function renderBar(filters = defaultFilters, onChange = vi.fn()) {
  return render(
    <SearchFilterBar
      filters={filters}
      onChange={onChange}
      totalResults={5}
      totalTasks={10}
    />
  );
}

describe('SearchFilterBar', () => {
  it('renders search input', () => {
    renderBar();
    expect(screen.getByPlaceholderText('Search tasks...')).toBeInTheDocument();
  });

  it('renders priority filter select', () => {
    renderBar();
    expect(screen.getByDisplayValue('All Priorities')).toBeInTheDocument();
  });

  it('renders sort select', () => {
    renderBar();
    expect(screen.getByDisplayValue('Default Order')).toBeInTheDocument();
  });

  it('calls onChange when search input changes', () => {
    const onChange = vi.fn();
    renderBar(defaultFilters, onChange);
    fireEvent.change(screen.getByPlaceholderText('Search tasks...'), {
      target: { value: 'login' },
    });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ search: 'login' }));
  });

  it('calls onChange when priority filter changes', () => {
    const onChange = vi.fn();
    renderBar(defaultFilters, onChange);
    fireEvent.change(screen.getByDisplayValue('All Priorities'), {
      target: { value: 'high' },
    });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ priority: 'high' }));
  });

  it('shows clear button and result count when filtering', () => {
    renderBar({ ...defaultFilters, search: 'test' });
    expect(screen.getByText('Clear ×')).toBeInTheDocument();
    expect(screen.getByText(/5 of 10/)).toBeInTheDocument();
  });

  it('calls onChange with defaults when clear is clicked', () => {
    const onChange = vi.fn();
    renderBar({ ...defaultFilters, search: 'test' }, onChange);
    fireEvent.click(screen.getByText('Clear ×'));
    expect(onChange).toHaveBeenCalledWith(defaultFilters);
  });
});