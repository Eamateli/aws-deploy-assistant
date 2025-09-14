import { describe, it, expect } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppProvider, useAppContext } from '../../context/AppContext'
import { mockAnalysisInput, mockArchitecture } from '../utils'

// Test component to interact with context
function TestComponent() {
  const { state, dispatch } = useAppContext()
  
  return (
    <div>
      <div data-testid="current-step">{state.currentStep}</div>
      <div data-testid="analysis-status">
        {state.analysis ? 'has-analysis' : 'no-analysis'}
      </div>
      <div data-testid="selected-architecture">
        {state.selectedArchitecture?.id || 'none'}
      </div>
      
      <button 
        onClick={() => dispatch({ 
          type: 'SET_ANALYSIS_RESULT', 
          payload: mockAnalysisInput 
        })}
        data-testid="set-analysis"
      >
        Set Analysis
      </button>
      
      <button 
        onClick={() => dispatch({ 
          type: 'SELECT_ARCHITECTURE', 
          payload: mockArchitecture 
        })}
        data-testid="select-architecture"
      >
        Select Architecture
      </button>
      
      <button 
        onClick={() => dispatch({ 
          type: 'UPDATE_PREFERENCES', 
          payload: { costPriority: 'high' } 
        })}
        data-testid="update-preferences"
      >
        Update Preferences
      </button>
      
      <button 
        onClick={() => dispatch({ type: 'RESET_STATE' })}
        data-testid="reset"
      >
        Reset
      </button>
    </div>
  )
}

describe('AppContext', () => {
  function renderWithContext(initialState = {}) {
    return render(
      <AppProvider initialState={initialState}>
        <TestComponent />
      </AppProvider>
    )
  }

  it('provides initial state correctly', () => {
    renderWithContext()
    
    expect(screen.getByTestId('current-step')).toHaveTextContent('upload')
    expect(screen.getByTestId('analysis-status')).toHaveTextContent('no-analysis')
    expect(screen.getByTestId('selected-architecture')).toHaveTextContent('none')
  })

  it('accepts custom initial state', () => {
    const customInitialState = {
      currentStep: 'recommendations',
      analysis: mockAnalysisInput
    }
    
    renderWithContext(customInitialState)
    
    expect(screen.getByTestId('current-step')).toHaveTextContent('recommendations')
    expect(screen.getByTestId('analysis-status')).toHaveTextContent('has-analysis')
  })

  it('handles SET_ANALYSIS_RESULT action', async () => {
    const user = userEvent.setup()
    renderWithContext()
    
    await user.click(screen.getByTestId('set-analysis'))
    
    expect(screen.getByTestId('current-step')).toHaveTextContent('recommendations')
    expect(screen.getByTestId('analysis-status')).toHaveTextContent('has-analysis')
  })

  it('handles SELECT_ARCHITECTURE action', async () => {
    const user = userEvent.setup()
    renderWithContext()
    
    // First set analysis, then select architecture
    await user.click(screen.getByTestId('set-analysis'))
    await user.click(screen.getByTestId('select-architecture'))
    
    expect(screen.getByTestId('current-step')).toHaveTextContent('deployment')
    expect(screen.getByTestId('selected-architecture')).toHaveTextContent('static-spa')
  })

  it('handles UPDATE_PREFERENCES action', async () => {
    const user = userEvent.setup()
    
    function PreferencesTestComponent() {
      const { state, dispatch } = useAppContext()
      
      return (
        <div>
          <div data-testid="cost-priority">
            {state.preferences.costPriority}
          </div>
          <button 
            onClick={() => dispatch({ 
              type: 'UPDATE_PREFERENCES', 
              payload: { costPriority: 'high' } 
            })}
            data-testid="update-preferences"
          >
            Update
          </button>
        </div>
      )
    }
    
    render(
      <AppProvider>
        <PreferencesTestComponent />
      </AppProvider>
    )
    
    expect(screen.getByTestId('cost-priority')).toHaveTextContent('medium')
    
    await user.click(screen.getByTestId('update-preferences'))
    
    expect(screen.getByTestId('cost-priority')).toHaveTextContent('high')
  })

  it('handles RESET_STATE action', async () => {
    const user = userEvent.setup()
    renderWithContext()
    
    // Set some state first
    await user.click(screen.getByTestId('set-analysis'))
    await user.click(screen.getByTestId('select-architecture'))
    
    expect(screen.getByTestId('current-step')).toHaveTextContent('deployment')
    
    // Reset state
    await user.click(screen.getByTestId('reset'))
    
    expect(screen.getByTestId('current-step')).toHaveTextContent('upload')
    expect(screen.getByTestId('analysis-status')).toHaveTextContent('no-analysis')
    expect(screen.getByTestId('selected-architecture')).toHaveTextContent('none')
  })

  it('handles SET_LOADING action', async () => {
    function LoadingTestComponent() {
      const { state, dispatch } = useAppContext()
      
      return (
        <div>
          <div data-testid="loading-status">
            {state.loading ? 'loading' : 'not-loading'}
          </div>
          <button 
            onClick={() => dispatch({ 
              type: 'SET_LOADING', 
              payload: { analyzing: true } 
            })}
            data-testid="set-loading"
          >
            Set Loading
          </button>
        </div>
      )
    }
    
    const user = userEvent.setup()
    
    render(
      <AppProvider>
        <LoadingTestComponent />
      </AppProvider>
    )
    
    expect(screen.getByTestId('loading-status')).toHaveTextContent('not-loading')
    
    await user.click(screen.getByTestId('set-loading'))
    
    expect(screen.getByTestId('loading-status')).toHaveTextContent('loading')
  })

  it('handles SET_ERROR action', async () => {
    function ErrorTestComponent() {
      const { state, dispatch } = useAppContext()
      
      return (
        <div>
          <div data-testid="error-status">
            {state.error ? state.error.message : 'no-error'}
          </div>
          <button 
            onClick={() => dispatch({ 
              type: 'SET_ERROR', 
              payload: { message: 'Test error', type: 'analysis' } 
            })}
            data-testid="set-error"
          >
            Set Error
          </button>
          <button 
            onClick={() => dispatch({ type: 'CLEAR_ERROR' })}
            data-testid="clear-error"
          >
            Clear Error
          </button>
        </div>
      )
    }
    
    const user = userEvent.setup()
    
    render(
      <AppProvider>
        <ErrorTestComponent />
      </AppProvider>
    )
    
    expect(screen.getByTestId('error-status')).toHaveTextContent('no-error')
    
    await user.click(screen.getByTestId('set-error'))
    
    expect(screen.getByTestId('error-status')).toHaveTextContent('Test error')
    
    await user.click(screen.getByTestId('clear-error'))
    
    expect(screen.getByTestId('error-status')).toHaveTextContent('no-error')
  })

  it('maintains state consistency across re-renders', async () => {
    const user = userEvent.setup()
    const { rerender } = renderWithContext()
    
    await user.click(screen.getByTestId('set-analysis'))
    
    expect(screen.getByTestId('current-step')).toHaveTextContent('recommendations')
    
    // Re-render component
    rerender(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    )
    
    // State should be reset because we created a new provider
    expect(screen.getByTestId('current-step')).toHaveTextContent('upload')
  })

  it('throws error when used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error
    console.error = () => {}
    
    expect(() => {
      render(<TestComponent />)
    }).toThrow('useAppContext must be used within an AppProvider')
    
    console.error = originalError
  })

  it('handles complex state transitions correctly', async () => {
    const user = userEvent.setup()
    renderWithContext()
    
    // Complete workflow: upload -> analysis -> recommendations -> deployment
    expect(screen.getByTestId('current-step')).toHaveTextContent('upload')
    
    await user.click(screen.getByTestId('set-analysis'))
    expect(screen.getByTestId('current-step')).toHaveTextContent('recommendations')
    
    await user.click(screen.getByTestId('select-architecture'))
    expect(screen.getByTestId('current-step')).toHaveTextContent('deployment')
    
    // Verify all state is maintained
    expect(screen.getByTestId('analysis-status')).toHaveTextContent('has-analysis')
    expect(screen.getByTestId('selected-architecture')).toHaveTextContent('static-spa')
  })

  it('preserves preferences across state changes', async () => {
    function PreferencesTestComponent() {
      const { state, dispatch } = useAppContext()
      
      return (
        <div>
          <div data-testid="cost-priority">{state.preferences.costPriority}</div>
          <div data-testid="current-step">{state.currentStep}</div>
          <button 
            onClick={() => dispatch({ 
              type: 'UPDATE_PREFERENCES', 
              payload: { costPriority: 'high' } 
            })}
            data-testid="update-preferences"
          >
            Update Preferences
          </button>
          <button 
            onClick={() => dispatch({ 
              type: 'SET_ANALYSIS_RESULT', 
              payload: mockAnalysisInput 
            })}
            data-testid="set-analysis"
          >
            Set Analysis
          </button>
        </div>
      )
    }
    
    const user = userEvent.setup()
    
    render(
      <AppProvider>
        <PreferencesTestComponent />
      </AppProvider>
    )
    
    // Update preferences
    await user.click(screen.getByTestId('update-preferences'))
    expect(screen.getByTestId('cost-priority')).toHaveTextContent('high')
    
    // Change step
    await user.click(screen.getByTestId('set-analysis'))
    expect(screen.getByTestId('current-step')).toHaveTextContent('recommendations')
    
    // Preferences should be preserved
    expect(screen.getByTestId('cost-priority')).toHaveTextContent('high')
  })
})