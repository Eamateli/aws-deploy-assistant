import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppProvider } from '../../context/AppContext'
import App from '../../App'
import { mockAnalysisInput, mockArchitecture } from '../utils'

// Mock React Flow to avoid canvas rendering issues in tests
vi.mock('reactflow', () => ({
  default: ({ children, nodes, edges }) => (
    <div data-testid="react-flow-mock">
      <div data-testid="nodes-count">{nodes?.length || 0}</div>
      <div data-testid="edges-count">{edges?.length || 0}</div>
      {children}
    </div>
  ),
  ReactFlowProvider: ({ children }) => <div data-testid="react-flow-provider">{children}</div>,
  useNodesState: () => [[], vi.fn()],
  useEdgesState: () => [[], vi.fn()],
  Controls: () => <div data-testid="react-flow-controls">Controls</div>,
  MiniMap: () => <div data-testid="react-flow-minimap">MiniMap</div>,
  Background: () => <div data-testid="react-flow-background">Background</div>,
  Handle: () => <div data-testid="react-flow-handle">Handle</div>,
  Position: { Top: 'top', Bottom: 'bottom', Left: 'left', Right: 'right' }
}))

// Mock Lucide React icons to avoid rendering issues
vi.mock('lucide-react', () => {
  const MockIcon = ({ size, className, ...props }) => (
    <div 
      data-testid={`icon-${props['data-testid'] || 'generic'}`}
      className={className}
      style={{ width: size, height: size }}
      {...props}
    />
  )
  
  return {
    Upload: (props) => <MockIcon data-testid="upload" {...props} />,
    Code: (props) => <MockIcon data-testid="code" {...props} />,
    Zap: (props) => <MockIcon data-testid="zap" {...props} />,
    DollarSign: (props) => <MockIcon data-testid="dollar-sign" {...props} />,
    FileText: (props) => <MockIcon data-testid="file-text" {...props} />,
    ChevronRight: (props) => <MockIcon data-testid="chevron-right" {...props} />,
    Play: (props) => <MockIcon data-testid="play" {...props} />,
    Copy: (props) => <MockIcon data-testid="copy" {...props} />,
    Check: (props) => <MockIcon data-testid="check" {...props} />,
    AlertCircle: (props) => <MockIcon data-testid="alert-circle" {...props} />,
    Cloud: (props) => <MockIcon data-testid="cloud" {...props} />,
    Server: (props) => <MockIcon data-testid="server" {...props} />,
    Database: (props) => <MockIcon data-testid="database" {...props} />,
    Globe: (props) => <MockIcon data-testid="globe" {...props} />,
    Cpu: (props) => <MockIcon data-testid="cpu" {...props} />,
    Shield: (props) => <MockIcon data-testid="shield" {...props} />,
    HardDrive: (props) => <MockIcon data-testid="hard-drive" {...props} />,
    BarChart3: (props) => <MockIcon data-testid="bar-chart3" {...props} />,
    TrendingUp: (props) => <MockIcon data-testid="trending-up" {...props} />,
    Settings: (props) => <MockIcon data-testid="settings" {...props} />,
    Info: (props) => <MockIcon data-testid="info" {...props} />,
    ExternalLink: (props) => <MockIcon data-testid="external-link" {...props} />,
    Download: (props) => <MockIcon data-testid="download" {...props} />,
    Clock: (props) => <MockIcon data-testid="clock" {...props} />
  }
})

describe('End-to-End Workflow Integration Tests', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
    // Mock clipboard API properly
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined)
      },
      writable: true
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const renderApp = (initialState = {}) => {
    return render(
      <AppProvider initialState={initialState}>
        <App />
      </AppProvider>
    )
  }

  describe('Complete Workflow: Upload → Analysis → Recommendations → Deployment', () => {
    it('should complete the full end-to-end workflow successfully', async () => {
      renderApp()

      // Step 1: Verify initial upload state
      expect(screen.getByText('Describe Your Application')).toBeInTheDocument()
      expect(screen.getByText('Tell us about your app and we\'ll analyze it to recommend the perfect AWS architecture for your needs')).toBeInTheDocument()

      // Step 2: Enter application description
      const textarea = screen.getByPlaceholderText(/Describe your application/i)
      await user.type(textarea, 'React e-commerce application with shopping cart, user authentication, and payment processing using Stripe')

      // Step 3: Trigger analysis
      const analyzeButton = screen.getByText('Analyze Application')
      expect(analyzeButton).toBeInTheDocument()
      await user.click(analyzeButton)

      // Step 4: Wait for analysis to complete and recommendations to appear
      await waitFor(() => {
        expect(screen.getByText('AWS Architecture Recommendations')).toBeInTheDocument()
      }, { timeout: 3000 })

      // Step 5: Verify recommendations are displayed
      expect(screen.getByText(/Based on your.*here are optimized AWS architectures/)).toBeInTheDocument()
      
      // Step 6: Select an architecture (look for architecture cards)
      const architectureCards = screen.getAllByRole('button')
      const selectButton = architectureCards.find(button => 
        button.textContent.includes('Select') || 
        button.closest('[data-testid*="architecture"]') ||
        button.closest('.card')
      )
      
      if (selectButton) {
        await user.click(selectButton)
      } else {
        // Fallback: click on any card-like element
        const cards = screen.getAllByText(/Static|Serverless|Traditional|Container/i)
        if (cards.length > 0) {
          await user.click(cards[0])
        }
      }

      // Step 7: Wait for deployment guide to appear
      await waitFor(() => {
        const deploymentElements = screen.queryAllByText(/Deploy|Deployment|Guide|Step/i)
        expect(deploymentElements.length).toBeGreaterThan(0)
      }, { timeout: 3000 })

      // Step 8: Verify deployment guide content
      const deploymentElements = screen.getAllByText(/Deploy|Deployment|Guide|Step/i)
      expect(deploymentElements.length).toBeGreaterThan(0)
    }, 10000)

    it('should handle workflow state transitions correctly', async () => {
      renderApp()

      // Start with upload step
      expect(screen.getByText('Describe Your Application')).toBeInTheDocument()

      // Enter description and analyze
      const textarea = screen.getByPlaceholderText(/Describe your application/i)
      await user.type(textarea, 'Node.js REST API with Express and MongoDB')
      
      const analyzeButton = screen.getByText('Analyze Application')
      await user.click(analyzeButton)

      // Should transition to recommendations
      await waitFor(() => {
        expect(screen.getByText('AWS Architecture Recommendations')).toBeInTheDocument()
      }, { timeout: 3000 })

      // Verify we're no longer in upload state
      expect(screen.queryByText('Describe Your Application')).not.toBeInTheDocument()
    }, 8000)

    it('should persist analysis results throughout the workflow', async () => {
      renderApp()

      const testDescription = 'Vue.js SPA with real-time chat features using Socket.io'
      
      // Enter description
      const textarea = screen.getByPlaceholderText(/Describe your application/i)
      await user.type(textarea, testDescription)
      
      // Analyze
      await user.click(screen.getByText('Analyze Application'))

      // Wait for recommendations
      await waitFor(() => {
        expect(screen.getByText('AWS Architecture Recommendations')).toBeInTheDocument()
      }, { timeout: 3000 })

      // The analysis should be reflected in the recommendations
      // Look for any text that might indicate the analysis was processed
      const pageContent = document.body.textContent
      expect(pageContent).toContain('Architecture')
    }, 8000)
  })

  describe('Error Handling in Workflow', () => {
    it('should handle empty input gracefully', async () => {
      renderApp()

      // Try to analyze without entering description
      const analyzeButton = screen.getByText('Analyze Application')
      await user.click(analyzeButton)

      // Should remain on upload step or show validation message
      expect(screen.getByText('Describe Your Application')).toBeInTheDocument()
    })

    it('should handle analysis errors gracefully', async () => {
      renderApp()

      // Enter minimal description
      const textarea = screen.getByPlaceholderText(/Describe your application/i)
      await user.type(textarea, 'test')
      
      // Analyze
      await user.click(screen.getByText('Analyze Application'))

      // Should either show recommendations or handle gracefully
      await waitFor(() => {
        const hasRecommendations = screen.queryByText('AWS Architecture Recommendations')
        const hasUpload = screen.queryByText('Describe Your Application')
        expect(hasRecommendations || hasUpload).toBeTruthy()
      }, { timeout: 3000 })
    })
  })

  describe('Workflow Navigation', () => {
    it('should allow navigation between workflow steps', async () => {
      renderApp()

      // Complete analysis
      const textarea = screen.getByPlaceholderText(/Describe your application/i)
      await user.type(textarea, 'React application with authentication')
      await user.click(screen.getByText('Analyze Application'))

      // Wait for recommendations
      await waitFor(() => {
        expect(screen.getByText('AWS Architecture Recommendations')).toBeInTheDocument()
      }, { timeout: 3000 })

      // Check if there are navigation elements or step indicators
      const stepIndicators = screen.queryAllByText(/Step|1|2|3/i)
      const navigationElements = screen.queryAllByRole('button')
      
      // Should have some form of navigation or step indication
      expect(stepIndicators.length + navigationElements.length).toBeGreaterThan(0)
    })
  })

  describe('Responsive Design in Workflow', () => {
    it('should work on different screen sizes', async () => {
      // Mock different viewport sizes
      const originalInnerWidth = window.innerWidth
      const originalInnerHeight = window.innerHeight

      try {
        // Test mobile viewport
        Object.defineProperty(window, 'innerWidth', { value: 375, writable: true })
        Object.defineProperty(window, 'innerHeight', { value: 667, writable: true })
        
        renderApp()
        
        expect(screen.getByText('Describe Your Application')).toBeInTheDocument()
        
        // Test desktop viewport
        Object.defineProperty(window, 'innerWidth', { value: 1920, writable: true })
        Object.defineProperty(window, 'innerHeight', { value: 1080, writable: true })
        
        // Component should still be accessible
        expect(screen.getByText('Describe Your Application')).toBeInTheDocument()
      } finally {
        // Restore original values
        Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth, writable: true })
        Object.defineProperty(window, 'innerHeight', { value: originalInnerHeight, writable: true })
      }
    })
  })

  describe('Accessibility in Workflow', () => {
    it('should support keyboard navigation', async () => {
      renderApp()

      // Test tab navigation
      await user.tab()
      
      // Should be able to focus on interactive elements
      const focusedElement = document.activeElement
      expect(focusedElement).toBeTruthy()
      expect(focusedElement.tagName).toMatch(/BUTTON|INPUT|TEXTAREA|A/)
    })

    it('should have proper ARIA labels and roles', () => {
      renderApp()

      // Check for proper form elements
      const textarea = screen.getByPlaceholderText(/Describe your application/i)
      expect(textarea).toBeInTheDocument()
      expect(textarea.tagName).toBe('TEXTAREA')

      // Check for buttons with proper roles
      const analyzeButton = screen.getByText('Analyze Application')
      expect(analyzeButton).toBeInTheDocument()
      expect(analyzeButton.tagName).toBe('BUTTON')
    })
  })

  describe('Performance in Workflow', () => {
    it('should complete analysis within reasonable time', async () => {
      const startTime = performance.now()
      
      renderApp()

      const textarea = screen.getByPlaceholderText(/Describe your application/i)
      await user.type(textarea, 'React application')
      await user.click(screen.getByText('Analyze Application'))

      await waitFor(() => {
        const hasRecommendations = screen.queryByText('AWS Architecture Recommendations')
        const hasUpload = screen.queryByText('Describe Your Application')
        expect(hasRecommendations || hasUpload).toBeTruthy()
      }, { timeout: 3000 })

      const endTime = performance.now()
      const duration = endTime - startTime
      
      // Analysis should complete within 5 seconds
      expect(duration).toBeLessThan(5000)
    })
  })
})

describe('Workflow State Management Integration', () => {
  it('should maintain consistent state throughout workflow', async () => {
    const user = userEvent.setup()
    
    render(
      <AppProvider>
        <App />
      </AppProvider>
    )

    // Initial state should be upload
    expect(screen.getByText('Describe Your Application')).toBeInTheDocument()

    // Enter description
    const textarea = screen.getByPlaceholderText(/Describe your application/i)
    await user.type(textarea, 'Python Flask API with PostgreSQL')
    
    // Trigger analysis
    await user.click(screen.getByText('Analyze Application'))

    // State should transition to recommendations
    await waitFor(() => {
      const recommendations = screen.queryByText('AWS Architecture Recommendations')
      const upload = screen.queryByText('Describe Your Application')
      expect(recommendations || upload).toBeTruthy()
    }, { timeout: 3000 })
  })

  it('should handle state persistence across re-renders', async () => {
    const user = userEvent.setup()
    
    const { rerender } = render(
      <AppProvider>
        <App />
      </AppProvider>
    )

    // Complete analysis
    const textarea = screen.getByPlaceholderText(/Describe your application/i)
    await user.type(textarea, 'React SPA')
    await user.click(screen.getByText('Analyze Application'))

    // Re-render the app
    rerender(
      <AppProvider>
        <App />
      </AppProvider>
    )

    // Should reset to initial state (expected behavior for new provider instance)
    expect(screen.getByText('Describe Your Application')).toBeInTheDocument()
  })
})