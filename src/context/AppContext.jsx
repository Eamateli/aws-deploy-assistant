import React, { createContext, useContext, useReducer } from 'react';

// Initial state for the application
const initialState = {
  currentStep: 'upload',
  analysis: null,
  selectedArchitecture: null,
  deploymentGuide: null,
  preferences: {
    costPriority: 'medium',
    complexityTolerance: 'low',
    experienceLevel: 'beginner',
    region: 'us-east-1'
  },
  ui: {
    loading: false,
    error: null,
    notifications: []
  }
};

// Action types
export const ActionTypes = {
  SET_ANALYSIS_RESULT: 'SET_ANALYSIS_RESULT',
  SELECT_ARCHITECTURE: 'SELECT_ARCHITECTURE',
  GENERATE_DEPLOYMENT_GUIDE: 'GENERATE_DEPLOYMENT_GUIDE',
  SET_STEP: 'SET_STEP',
  UPDATE_PREFERENCES: 'UPDATE_PREFERENCES',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  CLEAR_ERROR: 'CLEAR_ERROR',
  RESET_STATE: 'RESET_STATE'
};

// Reducer function
const appReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_ANALYSIS_RESULT:
      return { 
        ...state, 
        analysis: action.payload, 
        currentStep: 'recommendations',
        ui: { ...state.ui, loading: false, error: null }
      };
      
    case ActionTypes.SELECT_ARCHITECTURE:
      return { 
        ...state, 
        selectedArchitecture: action.payload, 
        currentStep: 'deployment' 
      };
      
    case ActionTypes.GENERATE_DEPLOYMENT_GUIDE:
      return { 
        ...state, 
        deploymentGuide: action.payload 
      };
      
    case ActionTypes.SET_STEP:
      return { 
        ...state, 
        currentStep: action.payload 
      };
      
    case ActionTypes.UPDATE_PREFERENCES:
      return { 
        ...state, 
        preferences: { ...state.preferences, ...action.payload } 
      };
      
    case ActionTypes.SET_LOADING:
      return { 
        ...state, 
        loading: action.payload,
        ui: { ...state.ui, loading: action.payload } 
      };
      
    case ActionTypes.SET_ERROR:
      return { 
        ...state, 
        error: action.payload,
        ui: { ...state.ui, error: action.payload, loading: false } 
      };
      
    case ActionTypes.CLEAR_ERROR:
      return { 
        ...state, 
        error: null,
        ui: { ...state.ui, error: null } 
      };
      
    case ActionTypes.ADD_NOTIFICATION:
      return { 
        ...state, 
        ui: { 
          ...state.ui, 
          notifications: [...state.ui.notifications, action.payload] 
        } 
      };
      
    case ActionTypes.REMOVE_NOTIFICATION:
      return { 
        ...state, 
        ui: { 
          ...state.ui, 
          notifications: state.ui.notifications.filter(n => n.id !== action.payload) 
        } 
      };
      
    case ActionTypes.RESET_STATE:
      return { 
        ...initialState, 
        preferences: state.preferences // Keep user preferences
      };
      
    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children, initialState: customInitialState }) => {
  // Merge custom initial state with default structure to ensure all properties exist
  const mergedInitialState = customInitialState ? {
    ...initialState,
    ...customInitialState,
    ui: {
      ...initialState.ui,
      ...(customInitialState.ui || {})
    },
    preferences: {
      ...initialState.preferences,
      ...(customInitialState.preferences || {})
    }
  } : initialState;
  
  const [state, dispatch] = useReducer(appReducer, mergedInitialState);

  // Action creators for common operations
  const actions = {
    setAnalysisResult: (result) => 
      dispatch({ type: ActionTypes.SET_ANALYSIS_RESULT, payload: result }),
      
    selectArchitecture: (architecture) => 
      dispatch({ type: ActionTypes.SELECT_ARCHITECTURE, payload: architecture }),
      
    generateDeploymentGuide: (guide) => 
      dispatch({ type: ActionTypes.GENERATE_DEPLOYMENT_GUIDE, payload: guide }),
      
    setStep: (step) => 
      dispatch({ type: ActionTypes.SET_STEP, payload: step }),
      
    updatePreferences: (preferences) => 
      dispatch({ type: ActionTypes.UPDATE_PREFERENCES, payload: preferences }),
      
    setLoading: (loading) => 
      dispatch({ type: ActionTypes.SET_LOADING, payload: loading }),
      
    setError: (error) => 
      dispatch({ type: ActionTypes.SET_ERROR, payload: error }),
      
    addNotification: (notification) => {
      const id = Date.now().toString();
      dispatch({ 
        type: ActionTypes.ADD_NOTIFICATION, 
        payload: { ...notification, id } 
      });
      
      // Auto-remove notification after 5 seconds
      setTimeout(() => {
        dispatch({ type: ActionTypes.REMOVE_NOTIFICATION, payload: id });
      }, 5000);
    },
    
    removeNotification: (id) => 
      dispatch({ type: ActionTypes.REMOVE_NOTIFICATION, payload: id }),
      
    resetState: () => 
      dispatch({ type: ActionTypes.RESET_STATE })
  };

  const value = {
    state,
    dispatch,
    actions
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the app context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Alias for tests
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// Selector hooks for specific state slices
export const useCurrentStep = () => {
  const { state } = useApp();
  return state.currentStep;
};

export const useAnalysis = () => {
  const { state } = useApp();
  return state.analysis;
};

export const useSelectedArchitecture = () => {
  const { state } = useApp();
  return state.selectedArchitecture;
};

export const usePreferences = () => {
  const { state } = useApp();
  return state.preferences;
};

export const useUI = () => {
  const { state } = useApp();
  return state.ui;
};

export default AppContext;