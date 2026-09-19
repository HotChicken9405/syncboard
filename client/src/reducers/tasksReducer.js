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
          (t._id || t.id) === action.id
            ? { ...t, columnId: action.columnId, version: action.version || t.version }
            : t
        ),
      };
    case 'reordered':
      return {
        ...state,
        tasks: [
          ...state.tasks.filter(t => String(t.columnId) !== action.columnId),
          ...action.tasks,
        ],
      };
    case 'deleted':
      return {
        ...state,
        tasks: state.tasks.filter(t => (t._id || t.id) !== action.id),
      };
    default:
      throw new Error('Unknown action: ' + action.type);
  }
}