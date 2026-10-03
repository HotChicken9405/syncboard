import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import TaskCard from "../components/TaskCard/TaskCard.jsx";

const mockTask = {
  _id: 'task1',
  title: 'Fix login bug',
  assignee: 'Kasun',
  priority: 'high',
  columnId: 'col1',
  version: 1,
};

function renderCard(task = mockTask, onDelete = vi.fn()) {
  return render(
    <BrowserRouter>
      <TaskCard
        task={task}
        boardId="board1"
        columnName="To Do"
        onDelete={onDelete}
        isDragging={false}
      />
    </BrowserRouter>
  );
}

describe('TaskCard', () => {
  it('renders the task title', () => {
    renderCard();
    expect(screen.getByText('Fix login bug')).toBeInTheDocument();
  });

  it('renders the assignee', () => {
    renderCard();
    expect(screen.getByText(/Kasun/)).toBeInTheDocument();
  });

  it('renders the priority badge', () => {
    renderCard();
    expect(screen.getByText('high')).toBeInTheDocument();
  });

  it('shows confirm modal when delete is clicked', () => {
    renderCard();
    fireEvent.click(screen.getByTitle ? document.querySelector('button[class*="deleteBtn"]') : screen.getByText('×'));
    expect(screen.getByText(/Delete this task/)).toBeInTheDocument();
  });

  it('calls onDelete when confirm modal is confirmed', () => {
    const onDelete = vi.fn();
    renderCard(mockTask, onDelete);
    fireEvent.click(document.querySelector('button[class*="deleteBtn"]'));
    fireEvent.click(screen.getByText('Delete'));
    expect(onDelete).toHaveBeenCalledWith('task1');
  });

  it('renders overdue styling for past due date', () => {
    const overdueTask = {
      ...mockTask,
      dueDate: '2020-01-01',
    };
    const { container } = renderCard(overdueTask);
    expect(container.querySelector('[class*="cardOverdue"]')).toBeInTheDocument();
  });
});