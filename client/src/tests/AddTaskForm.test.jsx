import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import AddTaskForm from "../components/AddTaskForm/AddTaskForm.jsx";

const mockColumns = [
  { _id: 'col1', name: 'To Do' },
  { _id: 'col2', name: 'In Progress' },
];

function renderForm(onAdd = vi.fn()) {
  return render(
    <BrowserRouter>
      <AddTaskForm onAdd={onAdd} columns={mockColumns} />
    </BrowserRouter>
  );
}

describe('AddTaskForm', () => {
  it('renders the trigger button', () => {
    renderForm();
    expect(screen.getByText('+ New Task')).toBeInTheDocument();
  });

  it('opens the form when trigger is clicked', () => {
    renderForm();
    fireEvent.click(screen.getByText('+ New Task'));
    expect(screen.getByText('NEW TASK')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('What needs to be done?')).toBeInTheDocument();
  });

  it('shows error when title is too short', () => {
    renderForm();
    fireEvent.click(screen.getByText('+ New Task'));
    fireEvent.change(screen.getByPlaceholderText('What needs to be done?'), {
      target: { value: 'ab' },
    });
    fireEvent.click(screen.getByText('Add Task →'));
    expect(screen.getByText('Title must be at least 3 characters')).toBeInTheDocument();
  });

  it('calls onAdd with correct data when form is valid', () => {
    const onAdd = vi.fn();
    renderForm(onAdd);
    fireEvent.click(screen.getByText('+ New Task'));
    fireEvent.change(screen.getByPlaceholderText('What needs to be done?'), {
      target: { value: 'My New Task' },
    });
    fireEvent.click(screen.getByText('Add Task →'));
    expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({
      title: 'My New Task',
      priority: 'normal',
    }));
  });

  it('closes form when cancel is clicked', () => {
    renderForm();
    fireEvent.click(screen.getByText('+ New Task'));
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('NEW TASK')).not.toBeInTheDocument();
  });
});