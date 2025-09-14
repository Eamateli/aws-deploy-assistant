import React, { createContext, useContext, useReducer } from 'react';

// Initial state for deployment workflow
const initialDeploymentState = {
  guide: null,
  progress: {
    currentStep: 0,
    completedSteps: new Set(),
    startedSteps: new Set(),
    totalSteps: 0
  },
  execution: {
    isExecuting: false,
    currentCommand: null,
    commandHistory: [],
    errors: []
  },
  validation: {
    prerequisites: {},
    stepValidation: {},
    finalValidation: null
  },
  customization: {
    parameters: {},
    templateOverrides: {}
  }
};

// Action types
const DeploymentActionTypes = {
  SET_GUIDE: 'SET_GUIDE',
  START_STEP: 'START_STEP',
  COMPLETE_STEP: 'COMPLETE_STEP',
  SET_CURRENT_STEP: 'SET_CURRENT_STEP',
  START_EXECUTION: 'START_EXECUTION',
  END_EXECUTION: 'END_EXECUTION',
  ADD_COMMAND_TO_HISTORY: 'ADD_COMMAND_TO_HISTORY',
  ADD_EXECUTION_ERROR: 'ADD_EXECUTION_ERROR',
  CLEAR_EXECUTION_ERRORS: 'CLEAR_EXECUTION_ERRORS',
  UPDATE_PREREQUISITE: 'UPDATE_PREREQUISITE',
  UPDATE_STEP_VALIDATION: 'UPDATE_STEP_VALIDATION',
  SET_FINAL_VALIDATION: 'SET_FINAL_VALIDATION',
  UPDATE_PARAMETERS: 'UPDATE_PARAMETERS',
  UPDATE_TEMPLATE_OVERRIDES: 'UPDATE_TEMPLATE_OVERRIDES',
  RESET_DEPLOYMENT: 'RESET_DEPLOYMENT'
};

// Reducer
const deploymentReducer = (state, action) => {
  switch (action.type) {
    case DeploymentActionTypes.SET_GUIDE:
      return {
        ...state,
        guide: action.payload,
        progress: {
          ...state.progress,
          totalSteps: action.payload?.steps?.length || 0,
          currentStep: 0,
          completedSteps: new Set(),
          startedSteps: new Set()
        }
      };
      
    case DeploymentActionTypes.START_STEP:
      return {
        ...state,
        progress: {
          ...state.progress,
          currentStep: action.payload,
          startedSteps: new Set([...state.progress.startedSteps, action.payload])
        }
      };
      
    case DeploymentActionTypes.COMPLETE_STEP:
      const newCompletedSteps = new Set([...state.progress.completedSteps, action.payload]);
      const nextStep = action.payload + 1;
      
      return {
        ...state,
        progress: {
          ...state.progress,
          completedSteps: newCompletedSteps,
          currentStep: nextStep < state.progress.totalSteps ? nextStep : state.progress.currentStep
        }
      };
      
    case DeploymentActionTypes.SET_CURRENT_STEP:
      return {
        ...state,
        progress: {
          ...state.progress,
          currentStep: action.payload
        }
      };
      
    case DeploymentActionTypes.START_EXECUTION:
      return {
        ...state,
        execution: {
          ...state.execution,
          isExecuting: true,
          currentCommand: action.payload
        }
      };
      
    case DeploymentActionTypes.END_EXECUTION:
      return {
        ...state,
        execution: {
          ...state.execution,
          isExecuting: false,
          currentCommand: null
        }
      };
      
    case DeploymentActionTypes.ADD_COMMAND_TO_HISTORY:
      return {
        ...state,
        execution: {
          ...state.execution,
          commandHistory: [
            ...state.execution.commandHistory,
            {
              ...action.payload,
              timestamp: new Date().toISOString()
            }
          ]
        }
      };
      
    case DeploymentActionTypes.ADD_EXECUTION_ERROR:
      return {
        ...state,
        execution: {
          ...state.execution,
          errors: [
            ...state.execution.errors,
            {
              ...action.payload,
              timestamp: new Date().toISOString()
            }
          ]
        }
      };
      
    case DeploymentActionTypes.CLEAR_EXECUTION_ERRORS:
      return {
        ...state,
        execution: {
          ...state.execution,
          errors: []
        }
      };
      
    case DeploymentActionTypes.UPDATE_PREREQUISITE:
      return {
        ...state,
        validation: {
          ...state.validation,
          prerequisites: {
            ...state.validation.prerequisites,
            [action.payload.name]: action.payload.status
          }
        }
      };
      
    case DeploymentActionTypes.UPDATE_STEP_VALIDATION:
      return {
        ...state,
        validation: {
          ...state.validation,
          stepValidation: {
            ...state.validation.stepValidation,
            [action.payload.step]: action.payload.result
          }
        }
      };
      
    case DeploymentActionTypes.SET_FINAL_VALIDATION:
      return {
        ...state,
        validation: {
          ...state.validation,
          finalValidation: action.payload
        }
      };
      
    case DeploymentActionTypes.UPDATE_PARAMETERS:
      return {
        ...state,
        customization: {
          ...state.customization,
          parameters: { ...state.customization.parameters, ...action.payload }
        }
      };
      
    case DeploymentActionTypes.UPDATE_TEMPLATE_OVERRIDES:
      return {
        ...state,
        customization: {
          ...state.customization,
          templateOverrides: { ...state.customization.templateOverrides, ...action.payload }
        }
      };
      
    case DeploymentActionTypes.RESET_DEPLOYMENT:
      return initialDeploymentState;
      
    default:
      return state;
  }
};

// Create context
const DeploymentContext = createContext();

// Provider component
export const DeploymentProvider = ({ children }) => {
  const [state, dispatch] = useReducer(deploymentReducer, initialDeploymentState);

  // Action creators
  const actions = {
    setGuide: (guide) => 
      dispatch({ type: DeploymentActionTypes.SET_GUIDE, payload: guide }),
      
    startStep: (stepIndex) => 
      dispatch({ type: DeploymentActionTypes.START_STEP, payload: stepIndex }),
      
    completeStep: (stepIndex) => 
      dispatch({ type: DeploymentActionTypes.COMPLETE_STEP, payload: stepIndex }),
      
    setCurrentStep: (stepIndex) => 
      dispatch({ type: DeploymentActionTypes.SET_CURRENT_STEP, payload: stepIndex }),
      
    startExecution: (command) => 
      dispatch({ type: DeploymentActionTypes.START_EXECUTION, payload: command }),
      
    endExecution: () => 
      dispatch({ type: DeploymentActionTypes.END_EXECUTION }),
      
    addCommandToHistory: (command, result, success = true) => 
      dispatch({ 
        type: DeploymentActionTypes.ADD_COMMAND_TO_HISTORY, 
        payload: { command, result, success } 
      }),
      
    addExecutionError: (error, step, command) => 
      dispatch({ 
        type: DeploymentActionTypes.ADD_EXECUTION_ERROR, 
        payload: { error, step, command } 
      }),
      
    clearExecutionErrors: () => 
      dispatch({ type: DeploymentActionTypes.CLEAR_EXECUTION_ERRORS }),
      
    updatePrerequisite: (name, status) => 
      dispatch({ 
        type: DeploymentActionTypes.UPDATE_PREREQUISITE, 
        payload: { name, status } 
      }),
      
    updateStepValidation: (step, result) => 
      dispatch({ 
        type: DeploymentActionTypes.UPDATE_STEP_VALIDATION, 
        payload: { step, result } 
      }),
      
    setFinalValidation: (result) => 
      dispatch({ type: DeploymentActionTypes.SET_FINAL_VALIDATION, payload: result }),
      
    updateParameters: (parameters) => 
      dispatch({ type: DeploymentActionTypes.UPDATE_PARAMETERS, payload: parameters }),
      
    updateTemplateOverrides: (overrides) => 
      dispatch({ type: DeploymentActionTypes.UPDATE_TEMPLATE_OVERRIDES, payload: overrides }),
      
    resetDeployment: () => 
      dispatch({ type: DeploymentActionTypes.RESET_DEPLOYMENT })
  };

  // Computed values
  const computed = {
    isStepCompleted: (stepIndex) => state.progress.completedSteps.has(stepIndex),
    isStepStarted: (stepIndex) => state.progress.startedSteps.has(stepIndex),
    getCompletionPercentage: () => 
      state.progress.totalSteps > 0 
        ? (state.progress.completedSteps.size / state.progress.totalSteps) * 100 
        : 0,
    hasErrors: () => state.execution.errors.length > 0,
    arePrerequisitesMet: () => 
      Object.values(state.validation.prerequisites).every(status => status === true)
  };

  const value = {
    state,
    dispatch,
    actions,
    computed
  };

  return (
    <DeploymentContext.Provider value={value}>
      {children}
    </DeploymentContext.Provider>
  );
};

// Custom hook
export const useDeploymentContext = () => {
  const context = useContext(DeploymentContext);
  if (!context) {
    throw new Error('useDeploymentContext must be used within a DeploymentProvider');
  }
  return context;
};

export { DeploymentActionTypes };
export default DeploymentContext;