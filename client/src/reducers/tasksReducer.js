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
            ? { ...t, status: action.status, version: action.version || t.version }
            : t
        ),
      };
    case 'reordered':
      // Replace tasks of that status with new order, keep other statuses intact
      return {
        ...state,
        tasks: [
          ...state.tasks.filter(t => t.status !== action.status),
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