export const initialState = {
  tasks: [],
  loading: true,
  error: null,
};

export function tasksReducer(state, action) {
  switch (action.type) {
    case 'loaded':
      return { ...state, tasks: action.tasks, loading: false, error: null };
    case 'error':
      return { ...state, loading: false, error: action.error };
    case 'added':
      return { ...state, tasks: [...state.tasks, action.task] };
    case 'moved':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.id ? { ...t, status: action.status } : t
        ),
      };
    case 'deleted':
      return {
        ...state,
        tasks: state.tasks.filter(t => t.id !== action.id),
      };
    default:
      throw new Error('Unknown action: ' + action.type);
  }
}