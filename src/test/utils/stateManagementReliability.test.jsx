import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppProvider, useApp, ActionTypes } from '../../context/AppContext';
import { mockAnalysisInput, mockArchitecture } from '../utils';

// Test component to interact with context
function StateTestComponent() {
  const { state, dispatch, actions } = useApp();
  
  return (
    <div>
      <div data-testid="current-step">{state.currentStep}</div>
      <div data-testid="analysis-status">
        {state.analysis ? 'has-analysis' : 'no-analysis'}
      </div>
      <div data-testid="selected-architecture">
        {state.selectedArchitecture?.id || 'none'}
      </div>
      <div data-testid="loading-status">
        {state.ui.loading ? 'loading' : 'not-loading'}
      </div>
      <div data-testid="error-status">
        {state.ui.error ? state.ui.error.message : 'no-error'}
      </div>
      <div data-testid="notifications-count">
        {state.ui.notifications.length}
      </div>
      <div data-testid="cost-priority">
        {state.preferences.costPriority}
      </div>
      
      {/* Action buttons */}
      <button 
        onClick={() => actions.setAnalysisResult(mockAnalysisInput)}
        data-testid="set-analysis"
      >
        Set Analysis
      </button>
      
      <button 
        onClick={() => actions.selectArchitecture(mockArchitecture)}
        data-testid="select-architecture"
      >
        Select Architecture
      </button>
      
      <button 
        onClick={() => actions.setLoading(true)}
        data-testid="set-loading"
      >
        Set Loading
      </button>
      
      <button 
        onClick={() => actions.setError({ message: 'Test error', type: 'analysis' })}
        data-testid="set-error"
      >
        Set Error
      </button>
      
      <button 
        onClick={() => actions.addNotification({ message: 'Test notification', type: 'success' })}
        data-testid="add-notification"
      >
        Add Notification
      </button>
      
      <button 
        onClick={() => actions.updatePreferences({ costPriority: 'high' })}
        data-testid="update-preferences"
      >
        Update Preferences
      </button>
      
      <button 
        onClick={() => actions.resetState()}
        data-testid="reset-state"
      >
        Reset State
      </button>
      
      <button 
        onClick={() => dispatch({ type: 'INVALID_ACTION' })}
        data-testid="invalid-action"
      >
        Invalid Action
      </button>
    </div>
  );
}

describe('State Management Reliability', () => {
  function renderWithContext(initialState = {}) {
    return render(
      <AppProvider initialState={initialState}>
        <StateTestComponent />
      </AppProvider>
    );
  }

  beforeEach(() => {
    // Clear any timers between tests
    vi.clearAllTimers();
  });

  describe('Initial State Integrity', () => {
    it('should provide correct initial state structure', () => {
      renderWithContext();
      
      expect(screen.getByTestId('current-step')).toHaveTextContent('upload');
      expect(screen.getByTestId('analysis-status')).toHaveTextContent('no-analysis');
      expect(screen.getByTestId('selected-architecture')).toHaveTextContent('none');
      expect(screen.getByTestId('loading-status')).toHaveTextContent('not-loading');
      expect(screen.getByTestId('error-status')).toHaveTextContent('no-error');
      expect(screen.getByTestId('notifications-count')).toHaveTextContent('0');
      expect(screen.getByTestId('cost-priority')).toHaveTextContent('medium');
    });

    it('should accept and apply custom initial state', () => {
      const customState = {
        currentStep: 'recommendations',
        analysis: mockAnalysisInput,
        preferences: {
          costPriority: 'high',
          complexityTolerance: 'medium',
          experienceLevel: 'intermediate',
          region: 'eu-west-1'
        }
      };
      
      renderWithContext(customState);
      
      expect(screen.getByTestId('current-step')).toHaveTextContent('recommendations');
      expect(screen.getByTestId('analysis-status')).toHaveTextContent('has-analysis');
      expect(screen.getByTestId('cost-priority')).toHaveTextContent('high');
    });

    it('should maintain state structure integrity with partial initial state', () => {
      const partialState = {
        currentStep: 'deployment'
      };
      
      renderWithContext(partialState);
      
      // Should have the custom step
      expect(screen.getByTestId('current-step')).toHaveTextContent('deployment');
      
      // Should maintain default values for other properties
      expect(screen.getByTestId('analysis-status')).toHaveTextContent('no-analysis');
      expect(screen.getByTestId('cost-priority')).toHaveTextContent('medium');
    });
  });

  describe('State Transitions', () => {
    it('should handle analysis result setting correctly', async () => {
      const user = userEvent.setup();
      renderWithContext();
      
      await user.click(screen.getByTestId('set-analysis'));
      
      expect(screen.getByTestId('current-step')).toHaveTextContent('recommendations');
      expect(screen.getByTestId('analysis-status')).toHaveTextContent('has-analysis');
      expect(screen.getByTestId('loading-status')).toHaveTextContent('not-loading');
      expect(screen.getByTestId('error-status')).toHaveTextContent('no-error');
    });

    it('should handle architecture selection correctly', async () => {
      const user = userEvent.setup();
      renderWithContext();
      
      // First set analysis
      await user.click(screen.getByTestId('set-analysis'));
      expect(screen.getByTestId('current-step')).toHaveTextContent('recommendations');
      
      // Then select architecture
      await user.click(screen.getByTestId('select-architecture'));
      expect(screen.getByTestId('current-step')).toHaveTextContent('deployment');
      expect(screen.getByTestId('selected-architecture')).toHaveTextContent('static-spa');
    });

    it('should handle loading state transitions', async () => {
      const user = userEvent.setup();
      renderWithContext();
      
      expect(screen.getByTestId('loading-status')).toHaveTextContent('not-loading');
      
      await user.click(screen.getByTestId('set-loading'));
      expect(screen.getByTestId('loading-status')).toHaveTextContent('loading');
    });

    it('should handle error state transitions', async () => {
      const user = userEvent.setup();
      renderWithContext();
      
      expect(screen.getByTestId('error-status')).toHaveTextContent('no-error');
      expect(screen.getByTestId('loading-status')).toHaveTextContent('not-loading');
      
      await user.click(screen.getByTestId('set-error'));
      expect(screen.getByTestId('error-status')).toHaveTextContent('Test error');
      expect(screen.getByTestId('loading-status')).toHaveTextContent('not-loading'); // Should clear loading
    });

    it('should handle preference updates correctly', async () => {
      const user = userEvent.setup();
      renderWithContext();
      
      expect(screen.getByTestId('cost-priority')).toHaveTextContent('medium');
      
      await user.click(screen.getByTestId('update-preferences'));
      expect(screen.getByTestId('cost-priority')).toHaveTextContent('high');
    });
  });

  describe('State Persistence and Consistency', () => {
    it('should maintain state consistency across multiple actions', async () => {
      const user = userEvent.setup();
      renderWithContext();
      
      // Perform multiple state changes
      await user.click(screen.getByTestId('update-preferences'));
      expect(screen.getByTestId('cost-priority')).toHaveTextContent('high');
      
      await user.click(screen.getByTestId('set-analysis'));
      expect(screen.getByTestId('current-step')).toHaveTextContent('recommendations');
      expect(screen.getByTestId('cost-priority')).toHaveTextContent('high'); // Should persist
      
      await user.click(screen.getByTestId('select-architecture'));
      expect(screen.getByTestId('current-step')).toHaveTextContent('deployment');
      expect(screen.getByTestId('analysis-status')).toHaveTextContent('has-analysis'); // Should persist
      expect(screen.getByTestId('cost-priority')).toHaveTextContent('high'); // Should persist
    });

    it('should handle state reset correctly', async () => {
      const user = userEvent.setup();
      renderWithContext();
      
      // Set up some state
      await user.click(screen.getByTestId('update-preferences'));
      await user.click(screen.getByTestId('set-analysis'));
      await user.click(screen.getByTestId('select-architecture'));
      
      expect(screen.getByTestId('current-step')).toHaveTextContent('deployment');
      expect(screen.getByTestId('cost-priority')).toHaveTextContent('high');
      
      // Reset state
      await user.click(screen.getByTestId('reset-state'));
      
      expect(screen.getByTestId('current-step')).toHaveTextContent('upload');
      expect(screen.getByTestId('analysis-status')).toHaveTextContent('no-analysis');
      expect(screen.getByTestId('selected-architecture')).toHaveTextContent('none');
      expect(screen.getByTestId('cost-priority')).toHaveTextContent('high'); // Preferences should persist
    });

    it('should preserve preferences across workflow steps', async () => {
      const user = userEvent.setup();
      renderWithContext();
      
      // Update preferences first
      await user.click(screen.getByTestId('update-preferences'));
      expect(screen.getByTestId('cost-priority')).toHaveTextContent('high');
      
      // Go through workflow steps
      await user.click(screen.getByTestId('set-analysis'));
      expect(screen.getByTestId('cost-priority')).toHaveTextContent('high');
      
      await user.click(screen.getByTestId('select-architecture'));
      expect(screen.getByTestId('cost-priority')).toHaveTextContent('high');
      
      // Preferences should be maintained throughout
      expect(screen.getByTestId('current-step')).toHaveTextContent('deployment');
    });
  });

  describe('Notification Management', () => {
    it('should handle notification addition and auto-removal', async () => {
      vi.useFakeTimers();
      const user = userEvent.setup();
      renderWithContext();
      
      expect(screen.getByTestId('notifications-count')).toHaveTextContent('0');
      
      await user.click(screen.getByTestId('add-notification'));
      expect(screen.getByTestId('notifications-count')).toHaveTextContent('1');
      
      // Fast-forward time to trigger auto-removal
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('notifications-count')).toHaveTextContent('0');
      });
      
      vi.useRealTimers();
    });

    it('should handle multiple notifications correctly', async () => {
      vi.useFakeTimers();
      const user = userEvent.setup();
      renderWithContext();
      
      // Add multiple notifications
      await user.click(screen.getByTestId('add-notification'));
      await user.click(screen.getByTestId('add-notification'));
      await user.click(screen.getByTestId('add-notification'));
      
      expect(screen.getByTestId('notifications-count')).toHaveTextContent('3');
      
      // Fast-forward time partially
      act(() => {
        vi.advanceTimersByTime(2500);
      });
      
      // Should still have all notifications
      expect(screen.getByTestId('notifications-count')).toHaveTextContent('3');
      
      // Fast-forward to trigger removal
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('notifications-count')).toHaveTextContent('0');
      });
      
      vi.useRealTimers();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle invalid actions gracefully', async () => {
      const user = userEvent.setup();
      renderWithContext();
      
      const initialStep = screen.getByTestId('current-step').textContent;
      
      // Dispatch invalid action
      await user.click(screen.getByTestId('invalid-action'));
      
      // State should remain unchanged
      expect(screen.getByTestId('current-step')).toHaveTextContent(initialStep);
    });

    it('should handle null/undefined payloads gracefully', async () => {
      const user = userEvent.setup();
      
      function NullPayloadTestComponent() {
        const { state, dispatch } = useApp();
        
        return (
          <div>
            <div data-testid="current-step">{state.currentStep}</div>
            <button 
              onClick={() => dispatch({ type: ActionTypes.SET_ANALYSIS_RESULT, payload: null })}
              data-testid="null-analysis"
            >
              Null Analysis
            </button>
            <button 
              onClick={() => dispatch({ type: ActionTypes.UPDATE_PREFERENCES, payload: undefined })}
              data-testid="undefined-preferences"
            >
              Undefined Preferences
            </button>
          </div>
        );
      }
      
      render(
        <AppProvider>
          <NullPayloadTestComponent />
        </AppProvider>
      );
      
      const initialStep = screen.getByTestId('current-step').textContent;
      
      await user.click(screen.getByTestId('null-analysis'));
      await user.click(screen.getByTestId('undefined-preferences'));
      
      // Should handle gracefully without crashing
      expect(screen.getByTestId('current-step')).toBeDefined();
    });

    it('should maintain state integrity during rapid state changes', async () => {
      const user = userEvent.setup();
      renderWithContext();
      
      // Perform rapid state changes
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(user.click(screen.getByTestId('set-loading')));
        promises.push(user.click(screen.getByTestId('update-preferences')));
      }
      
      await Promise.all(promises);
      
      // State should still be consistent
      expect(screen.getByTestId('loading-status')).toHaveTextContent('loading');
      expect(screen.getByTestId('cost-priority')).toHaveTextContent('high');
    });
  });

  describe('Memory Management', () => {
    it('should not create memory leaks with notification timers', async () => {
      vi.useFakeTimers();
      const user = userEvent.setup();
      const { unmount } = renderWithContext();
      
      // Add notifications
      await user.click(screen.getByTestId('add-notification'));
      await user.click(screen.getByTestId('add-notification'));
      
      // Unmount component before timers complete
      unmount();
      
      // Fast-forward time - should not cause errors
      act(() => {
        vi.advanceTimersByTime(10000);
      });
      
      // No assertions needed - test passes if no errors thrown
      vi.useRealTimers();
    });
  });

  describe('Context Provider Error Handling', () => {
    it('should throw error when useApp is used outside provider', () => {
      function ComponentWithoutProvider() {
        const { state } = useApp();
        return <div>{state.currentStep}</div>;
      }
      
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = vi.fn();
      
      expect(() => {
        render(<ComponentWithoutProvider />);
      }).toThrow('useApp must be used within an AppProvider');
      
      console.error = originalError;
    });
  });

  describe('Performance and Optimization', () => {
    it('should not cause unnecessary re-renders', async () => {
      let renderCount = 0;
      
      function RenderCountComponent() {
        renderCount++;
        const { state } = useApp();
        return <div data-testid="render-count">{renderCount}</div>;
      }
      
      const user = userEvent.setup();
      
      render(
        <AppProvider>
          <RenderCountComponent />
          <StateTestComponent />
        </AppProvider>
      );
      
      const initialRenderCount = renderCount;
      
      // Perform state change
      await user.click(screen.getByTestId('set-analysis'));
      
      // Should only re-render once for the state change
      expect(renderCount).toBe(initialRenderCount + 1);
    });

    it('should handle large state objects efficiently', async () => {
      const largeAnalysis = {
        ...mockAnalysisInput,
        files: Array.from({ length: 100 }, (_, i) => ({
          name: `file${i}.js`,
          content: 'console.log("test");'.repeat(1000),
          type: 'source',
          size: 10000
        }))
      };
      
      function LargeStateComponent() {
        const { state, actions } = useApp();
        
        return (
          <div>
            <div data-testid="files-count">
              {state.analysis?.files?.length || 0}
            </div>
            <button 
              onClick={() => actions.setAnalysisResult(largeAnalysis)}
              data-testid="set-large-analysis"
            >
              Set Large Analysis
            </button>
          </div>
        );
      }
      
      const user = userEvent.setup();
      
      render(
        <AppProvider>
          <LargeStateComponent />
        </AppProvider>
      );
      
      const startTime = performance.now();
      await user.click(screen.getByTestId('set-large-analysis'));
      const endTime = performance.now();
      
      expect(screen.getByTestId('files-count')).toHaveTextContent('100');
      expect(endTime - startTime).toBeLessThan(100); // Should complete quickly
    });
  });
});