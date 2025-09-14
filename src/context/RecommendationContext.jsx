import React, { createContext, useContext, useReducer } from 'react';

// Initial state for recommendations
const initialRecommendationState = {
  architectures: [],
  selectedArchitecture: null,
  comparison: {
    isComparing: false,
    selectedArchitectures: []
  },
  filters: {
    maxCost: null,
    maxComplexity: 5,
    preferredServices: [],
    excludedServices: []
  },
  customization: {
    isCustomizing: false,
    modifications: {}
  },
  evaluation: {
    scores: {},
    reasoning: {}
  }
};

// Action types
const RecommendationActionTypes = {
  SET_ARCHITECTURES: 'SET_ARCHITECTURES',
  SELECT_ARCHITECTURE: 'SELECT_ARCHITECTURE',
  START_COMPARISON: 'START_COMPARISON',
  ADD_TO_COMPARISON: 'ADD_TO_COMPARISON',
  REMOVE_FROM_COMPARISON: 'REMOVE_FROM_COMPARISON',
  END_COMPARISON: 'END_COMPARISON',
  UPDATE_FILTERS: 'UPDATE_FILTERS',
  START_CUSTOMIZATION: 'START_CUSTOMIZATION',
  UPDATE_CUSTOMIZATION: 'UPDATE_CUSTOMIZATION',
  END_CUSTOMIZATION: 'END_CUSTOMIZATION',
  SET_EVALUATION: 'SET_EVALUATION',
  CLEAR_RECOMMENDATIONS: 'CLEAR_RECOMMENDATIONS'
};

// Reducer
const recommendationReducer = (state, action) => {
  switch (action.type) {
    case RecommendationActionTypes.SET_ARCHITECTURES:
      return {
        ...state,
        architectures: action.payload
      };
      
    case RecommendationActionTypes.SELECT_ARCHITECTURE:
      return {
        ...state,
        selectedArchitecture: action.payload,
        comparison: {
          ...state.comparison,
          isComparing: false,
          selectedArchitectures: []
        }
      };
      
    case RecommendationActionTypes.START_COMPARISON:
      return {
        ...state,
        comparison: {
          ...state.comparison,
          isComparing: true,
          selectedArchitectures: []
        }
      };
      
    case RecommendationActionTypes.ADD_TO_COMPARISON:
      return {
        ...state,
        comparison: {
          ...state.comparison,
          selectedArchitectures: [
            ...state.comparison.selectedArchitectures,
            action.payload
          ]
        }
      };
      
    case RecommendationActionTypes.REMOVE_FROM_COMPARISON:
      return {
        ...state,
        comparison: {
          ...state.comparison,
          selectedArchitectures: state.comparison.selectedArchitectures.filter(
            arch => arch.id !== action.payload
          )
        }
      };
      
    case RecommendationActionTypes.END_COMPARISON:
      return {
        ...state,
        comparison: {
          isComparing: false,
          selectedArchitectures: []
        }
      };
      
    case RecommendationActionTypes.UPDATE_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      };
      
    case RecommendationActionTypes.START_CUSTOMIZATION:
      return {
        ...state,
        customization: {
          isCustomizing: true,
          modifications: {}
        }
      };
      
    case RecommendationActionTypes.UPDATE_CUSTOMIZATION:
      return {
        ...state,
        customization: {
          ...state.customization,
          modifications: { ...state.customization.modifications, ...action.payload }
        }
      };
      
    case RecommendationActionTypes.END_CUSTOMIZATION:
      return {
        ...state,
        customization: {
          isCustomizing: false,
          modifications: {}
        }
      };
      
    case RecommendationActionTypes.SET_EVALUATION:
      return {
        ...state,
        evaluation: action.payload
      };
      
    case RecommendationActionTypes.CLEAR_RECOMMENDATIONS:
      return initialRecommendationState;
      
    default:
      return state;
  }
};

// Create context
const RecommendationContext = createContext();

// Provider component
export const RecommendationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(recommendationReducer, initialRecommendationState);

  // Action creators
  const actions = {
    setArchitectures: (architectures) => 
      dispatch({ type: RecommendationActionTypes.SET_ARCHITECTURES, payload: architectures }),
      
    selectArchitecture: (architecture) => 
      dispatch({ type: RecommendationActionTypes.SELECT_ARCHITECTURE, payload: architecture }),
      
    startComparison: () => 
      dispatch({ type: RecommendationActionTypes.START_COMPARISON }),
      
    addToComparison: (architecture) => 
      dispatch({ type: RecommendationActionTypes.ADD_TO_COMPARISON, payload: architecture }),
      
    removeFromComparison: (architectureId) => 
      dispatch({ type: RecommendationActionTypes.REMOVE_FROM_COMPARISON, payload: architectureId }),
      
    endComparison: () => 
      dispatch({ type: RecommendationActionTypes.END_COMPARISON }),
      
    updateFilters: (filters) => 
      dispatch({ type: RecommendationActionTypes.UPDATE_FILTERS, payload: filters }),
      
    startCustomization: () => 
      dispatch({ type: RecommendationActionTypes.START_CUSTOMIZATION }),
      
    updateCustomization: (modifications) => 
      dispatch({ type: RecommendationActionTypes.UPDATE_CUSTOMIZATION, payload: modifications }),
      
    endCustomization: () => 
      dispatch({ type: RecommendationActionTypes.END_CUSTOMIZATION }),
      
    setEvaluation: (evaluation) => 
      dispatch({ type: RecommendationActionTypes.SET_EVALUATION, payload: evaluation }),
      
    clearRecommendations: () => 
      dispatch({ type: RecommendationActionTypes.CLEAR_RECOMMENDATIONS })
  };

  const value = {
    state,
    dispatch,
    actions
  };

  return (
    <RecommendationContext.Provider value={value}>
      {children}
    </RecommendationContext.Provider>
  );
};

// Custom hook
export const useRecommendationContext = () => {
  const context = useContext(RecommendationContext);
  if (!context) {
    throw new Error('useRecommendationContext must be used within a RecommendationProvider');
  }
  return context;
};

export { RecommendationActionTypes };
export default RecommendationContext;