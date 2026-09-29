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
      // Avoid duplicates from socket + optimistic update
      if (state.tasks.find(t => String(t._id) === String(action.task._id))) return state;
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
    case 'socket:reordered': {
      // Reorder by orderedIds from socket
      const map = Object.fromEntries(state.tasks.map(t => [String(t._id || t.id), t]));
      const reordered = action.orderedIds
        .map(id => map[id])
        .filter(Boolean);
      const untouched = state.tasks.filter(t => !action.orderedIds.includes(String(t._id || t.id)));
      return { ...state, tasks: [...untouched, ...reordered] };
    }
    case 'deleted':
      return {
        ...state,
        tasks: state.tasks.filter(t => (t._id || t.id) !== action.id),
      };
    default:
      throw new Error('Unknown action: ' + action.type);
  }
}