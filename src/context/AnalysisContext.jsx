import React, { createContext, useContext, useReducer } from 'react';

// Initial state for analysis workflow
const initialAnalysisState = {
  input: {
    description: '',
    files: [],
    type: 'description' // 'description' | 'files'
  },
  processing: {
    isAnalyzing: false,
    progress: 0,
    currentStep: 'idle' // 'idle' | 'parsing' | 'matching' | 'scoring' | 'complete'
  },
  results: {
    patterns: [],
    confidence: 0,
    alternatives: [],
    requirements: null,
    timestamp: null
  },
  history: [], // Previous analyses
  validation: {
    errors: [],
    warnings: []
  }
};

// Action types
const AnalysisActionTypes = {
  SET_INPUT: 'SET_INPUT',
  ADD_FILE: 'ADD_FILE',
  REMOVE_FILE: 'REMOVE_FILE',
  START_ANALYSIS: 'START_ANALYSIS',
  UPDATE_PROGRESS: 'UPDATE_PROGRESS',
  SET_RESULTS: 'SET_RESULTS',
  ADD_TO_HISTORY: 'ADD_TO_HISTORY',
  SET_VALIDATION_ERRORS: 'SET_VALIDATION_ERRORS',
  CLEAR_ANALYSIS: 'CLEAR_ANALYSIS'
};

// Reducer
const analysisReducer = (state, action) => {
  switch (action.type) {
    case AnalysisActionTypes.SET_INPUT:
      return {
        ...state,
        input: { ...state.input, ...action.payload },
        validation: { errors: [], warnings: [] }
      };
      
    case AnalysisActionTypes.ADD_FILE:
      return {
        ...state,
        input: {
          ...state.input,
          files: [...state.input.files, action.payload],
          type: 'files'
        }
      };
      
    case AnalysisActionTypes.REMOVE_FILE:
      return {
        ...state,
        input: {
          ...state.input,
          files: state.input.files.filter(f => f.id !== action.payload)
        }
      };
      
    case AnalysisActionTypes.START_ANALYSIS:
      return {
        ...state,
        processing: {
          isAnalyzing: true,
          progress: 0,
          currentStep: 'parsing'
        },
        validation: { errors: [], warnings: [] }
      };
      
    case AnalysisActionTypes.UPDATE_PROGRESS:
      return {
        ...state,
        processing: {
          ...state.processing,
          progress: action.payload.progress,
          currentStep: action.payload.step
        }
      };
      
    case AnalysisActionTypes.SET_RESULTS:
      return {
        ...state,
        processing: {
          isAnalyzing: false,
          progress: 100,
          currentStep: 'complete'
        },
        results: {
          ...action.payload,
          timestamp: new Date().toISOString()
        }
      };
      
    case AnalysisActionTypes.ADD_TO_HISTORY:
      return {
        ...state,
        history: [action.payload, ...state.history.slice(0, 9)] // Keep last 10
      };
      
    case AnalysisActionTypes.SET_VALIDATION_ERRORS:
      return {
        ...state,
        validation: action.payload
      };
      
    case AnalysisActionTypes.CLEAR_ANALYSIS:
      return initialAnalysisState;
      
    default:
      return state;
  }
};

// Create context
const AnalysisContext = createContext();

// Provider component
export const AnalysisProvider = ({ children }) => {
  const [state, dispatch] = useReducer(analysisReducer, initialAnalysisState);

  // Action creators
  const actions = {
    setInput: (input) => 
      dispatch({ type: AnalysisActionTypes.SET_INPUT, payload: input }),
      
    addFile: (file) => 
      dispatch({ type: AnalysisActionTypes.ADD_FILE, payload: file }),
      
    removeFile: (fileId) => 
      dispatch({ type: AnalysisActionTypes.REMOVE_FILE, payload: fileId }),
      
    startAnalysis: () => 
      dispatch({ type: AnalysisActionTypes.START_ANALYSIS }),
      
    updateProgress: (progress, step) => 
      dispatch({ 
        type: AnalysisActionTypes.UPDATE_PROGRESS, 
        payload: { progress, step } 
      }),
      
    setResults: (results) => {
      dispatch({ type: AnalysisActionTypes.SET_RESULTS, payload: results });
      // Add to history
      dispatch({ 
        type: AnalysisActionTypes.ADD_TO_HISTORY, 
        payload: { ...results, input: state.input } 
      });
    },
    
    setValidationErrors: (validation) => 
      dispatch({ type: AnalysisActionTypes.SET_VALIDATION_ERRORS, payload: validation }),
      
    clearAnalysis: () => 
      dispatch({ type: AnalysisActionTypes.CLEAR_ANALYSIS })
  };

  const value = {
    state,
    dispatch,
    actions
  };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
};

// Custom hook
export const useAnalysisContext = () => {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysisContext must be used within an AnalysisProvider');
  }
  return context;
};

export { AnalysisActionTypes };
export default AnalysisContext;