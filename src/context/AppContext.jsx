import { createContext, useContext, useReducer, useCallback } from 'react';

const AppContext = createContext(null);

const initialState = {
  currentUser: {
    id: 'rm1',
    name: 'Vikram Mehta',
    email: 'vikram@bimakavach.com',
    role: 'rm',
    initials: 'VM',
  },
  isManagerView: false,
  activeTab: 'inbox',
  selectedConversation: null,
  selectedClient: null,
  selectedDeal: null,
  notifications: [],
  searchQuery: '',
  inboxFilter: 'all', // 'all', 'whatsapp', 'email', 'call'
  stageUpdateBanner: null,
  dealNoteSuggestion: null,
  showCallSimulator: false,
  callSimulatorData: null,
  toasts: [],
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };

    case 'TOGGLE_MANAGER_VIEW':
      return {
        ...state,
        isManagerView: !state.isManagerView,
        activeTab: !state.isManagerView ? 'dashboard' : 'inbox',
      };

    case 'SET_SELECTED_CONVERSATION':
      return { ...state, selectedConversation: action.payload };

    case 'SET_SELECTED_CLIENT':
      return { ...state, selectedClient: action.payload };

    case 'SET_SELECTED_DEAL':
      return { ...state, selectedDeal: action.payload };

    case 'SET_INBOX_FILTER':
      return { ...state, inboxFilter: action.payload };

    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };

    case 'SHOW_STAGE_UPDATE_BANNER':
      return { ...state, stageUpdateBanner: action.payload };

    case 'DISMISS_STAGE_UPDATE_BANNER':
      return { ...state, stageUpdateBanner: null };

    case 'SHOW_DEAL_NOTE_SUGGESTION':
      return { ...state, dealNoteSuggestion: action.payload };

    case 'DISMISS_DEAL_NOTE_SUGGESTION':
      return { ...state, dealNoteSuggestion: null };

    case 'SHOW_CALL_SIMULATOR':
      return {
        ...state,
        showCallSimulator: true,
        callSimulatorData: action.payload,
      };

    case 'HIDE_CALL_SIMULATOR':
      return {
        ...state,
        showCallSimulator: false,
        callSimulatorData: null,
      };

    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [...state.toasts, { ...action.payload, id: Date.now() }],
      };

    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.payload),
      };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
      };

    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    dispatch({ type: 'ADD_TOAST', payload: { message, type, id } });
    setTimeout(() => {
      dispatch({ type: 'REMOVE_TOAST', payload: id });
    }, 4000);
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch, showToast }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
