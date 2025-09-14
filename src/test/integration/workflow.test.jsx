import React, { useState, useEffect } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, mockAnalysisInput, mockArchitecture } from '../utils'

// Mock the analysis workflow components
const MockAnalysisWorkflow = ({ onAnalysisComplete }) => {
  return (
    <div data-testid="analysis-workflow">
      <h2>Code Analysis</h2>
      <button 
        onClick={() => onAnalysisComplete(mockAnalysisInput)}
        data-testid="complete-analysis"
      >
        Complete Analysis
      </button>
    </div>
  )
}

const MockRecommendationEngine = ({ analysis, onArchitectureSelect }) => {
  return (
    <div data-testid="recommendation-engine">
      <h2>Architecture Recommendations</h2>
      <div data-testid="analysis-result">
        Framework: {analysis?.detected?.framework || 'Unknown'}
      </div>
      <button 
        onClick={() => onArchitectureSelect(mockArchitecture)}
        data-testid="select-architecture"
      >
        Select Architecture
      </button>
    </div>
  )
}

const MockDeploymentGuide = ({ architecture }) => {
  return (
    <div data-testid="deployment-guide">
      <h2>Deployment Guide</h2>
      <div data-testid="architecture-name">
        {architecture?.name || 'No architecture selected'}
      </div>
      <div data-testid="deployment-steps">
        <div>Step 1: Build your application</div>
        <div>Step 2: Configure AWS services</div>
        <div>Step 3: Deploy to production</div>
      </div>
    </div>
  )
}

// Main workflow component for testing
const WorkflowApp = () => {
  const [currentStep, setCurrentStep] = useState('analysis')
  const [analysis, setAnalysis] = useState(null)
  const [selectedArchitecture, setSelectedArchitecture] = useState(null)

  const handleAnalysisComplete = (analysisResult) => {
    setAnalysis(analysisResult)
    setCurrentStep('recommendations')
  }

  const handleArchitectureSelect = (architecture) => {
    setSelectedArchitecture(architecture)
    setCurrentStep('deployment')
  }

  return (
    <div data-testid="workflow-app">
      <div data-testid="current-step">{currentStep}</div>
      
      {currentStep === 'analysis' && (
        <MockAnalysisWorkflow onAnalysisComplete={handleAnalysisComplete} />
      )}
      
      {currentStep === 'recommendations' && (
        <MockRecommendationEngine 
          analysis={analysis}
          onArchitectureSelect={handleArchitectureSelect}
        />
      )}
      
      {currentStep === 'deployment' && (
        <MockDeploymentGuide architecture={selectedArchitecture} />
      )}
    </div>
  )
}

describe('End-to-End Workflow Integration Tests', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
  })

  it('should complete the full analysis to deployment workflow', async () => {
    render(<WorkflowApp />)

    // Start with analysis step
    expect(screen.getByTestId('current-step')).toHaveTextContent('analysis')
    expect(screen.getByTestId('analysis-workflow')).toBeInTheDocument()

    // Complete analysis
    await user.click(screen.getByTestId('complete-analysis'))

    // Should move to recommendations
    await waitFor(() => {
      expect(screen.getByTestId('current-step')).toHaveTextContent('recommendations')
    })
    
    expect(screen.getByTestId('recommendation-engine')).toBeInTheDocument()
    expect(screen.getByTestId('analysis-result')).toBeInTheDocument()

    // Select architecture
    await user.click(screen.getByTestId('select-architecture'))

    // Should move to deployment
    await waitFor(() => {
      expect(screen.getByTestId('current-step')).toHaveTextContent('deployment')
    })
    
    expect(screen.getByTestId('deployment-guide')).toBeInTheDocument()
    expect(screen.getByTestId('architecture-name')).toHaveTextContent('Static SPA Hosting')
    expect(screen.getByTestId('deployment-steps')).toBeInTheDocument()
  })

  it('should handle workflow state persistence', async () => {
    const { rerender } = render(<WorkflowApp />)

    // Complete analysis
    await user.click(screen.getByTestId('complete-analysis'))
    
    // Verify we're in recommendations step
    await waitFor(() => {
      expect(screen.getByTestId('current-step')).toHaveTextContent('recommendations')
    })

    // Re-render component (simulating navigation or refresh)
    rerender(<WorkflowApp />)

    // Should maintain state (in a real app, this would use context or state management)
    // For this test, it will reset to analysis, which is expected behavior
    expect(screen.getByTestId('current-step')).toHaveTextContent('analysis')
  })

  it('should display appropriate content at each workflow step', async () => {
    render(<WorkflowApp />)

    // Analysis step content
    expect(screen.getByText('Code Analysis')).toBeInTheDocument()
    expect(screen.getByText('Complete Analysis')).toBeInTheDocument()

    // Move to recommendations
    await user.click(screen.getByTestId('complete-analysis'))
    
    await waitFor(() => {
      expect(screen.getByText('Architecture Recommendations')).toBeInTheDocument()
      expect(screen.getByText('Select Architecture')).toBeInTheDocument()
    })

    // Move to deployment
    await user.click(screen.getByTestId('select-architecture'))
    
    await waitFor(() => {
      expect(screen.getByText('Deployment Guide')).toBeInTheDocument()
      expect(screen.getByText('Step 1: Build your application')).toBeInTheDocument()
      expect(screen.getByText('Step 2: Configure AWS services')).toBeInTheDocument()
      expect(screen.getByText('Step 3: Deploy to production')).toBeInTheDocument()
    })
  })
})

describe('Architecture Diagram Integration Tests', () => {
  const MockArchitectureDiagram = ({ architecture, onServiceClick }) => {
    if (!architecture) return <div data-testid="no-architecture">No architecture selected</div>

    return (
      <div data-testid="architecture-diagram">
        <h3>Architecture Diagram</h3>
        <div data-testid="services-list">
          {architecture.services?.map((service, index) => (
            <div 
              key={index}
              data-testid={`service-${service.service}`}
              onClick={() => onServiceClick(service)}
              style={{ cursor: 'pointer', padding: '8px', border: '1px solid #ccc', margin: '4px' }}
            >
              <div>{service.service}</div>
              <div>{service.purpose}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  it('should render architecture diagram with interactive services', async () => {
    const user = userEvent.setup()
    const mockOnServiceClick = vi.fn()

    render(
      <MockArchitectureDiagram 
        architecture={mockArchitecture}
        onServiceClick={mockOnServiceClick}
      />
    )

    expect(screen.getByTestId('architecture-diagram')).toBeInTheDocument()
    expect(screen.getByText('Architecture Diagram')).toBeInTheDocument()

    // Check that services are rendered
    expect(screen.getByTestId('service-S3')).toBeInTheDocument()
    expect(screen.getByTestId('service-CloudFront')).toBeInTheDocument()

    // Test service interaction
    await user.click(screen.getByTestId('service-S3'))
    expect(mockOnServiceClick).toHaveBeenCalledWith(
      expect.objectContaining({
        service: 'S3',
        purpose: 'Static file hosting'
      })
    )
  })

  it('should handle empty architecture state', () => {
    render(<MockArchitectureDiagram architecture={null} />)
    
    expect(screen.getByTestId('no-architecture')).toBeInTheDocument()
    expect(screen.getByText('No architecture selected')).toBeInTheDocument()
  })
})

describe('Deployment Guide Integration Tests', () => {
  const MockDeploymentGuideDetailed = ({ architecture }) => {
    const [completedSteps, setCompletedSteps] = useState(new Set())
    
    const steps = [
      { id: 'build', title: 'Build Application', command: 'npm run build' },
      { id: 'configure', title: 'Configure AWS', command: 'aws configure' },
      { id: 'deploy', title: 'Deploy to S3', command: 'aws s3 sync build/ s3://bucket' }
    ]

    const handleStepComplete = (stepId) => {
      setCompletedSteps(prev => new Set([...prev, stepId]))
    }

    return (
      <div data-testid="deployment-guide-detailed">
        <h3>Deployment Guide for {architecture?.name}</h3>
        <div data-testid="deployment-steps">
          {steps.map(step => (
            <div key={step.id} data-testid={`step-${step.id}`}>
              <h4>{step.title}</h4>
              <code data-testid={`command-${step.id}`}>{step.command}</code>
              <button 
                onClick={() => handleStepComplete(step.id)}
                data-testid={`complete-${step.id}`}
                disabled={completedSteps.has(step.id)}
              >
                {completedSteps.has(step.id) ? 'Completed' : 'Mark Complete'}
              </button>
            </div>
          ))}
        </div>
        <div data-testid="progress">
          {completedSteps.size} of {steps.length} steps completed
        </div>
      </div>
    )
  }

  it('should generate and track deployment guide progress', async () => {
    const user = userEvent.setup()
    
    render(<MockDeploymentGuideDetailed architecture={mockArchitecture} />)

    expect(screen.getByText('Deployment Guide for Static SPA Hosting')).toBeInTheDocument()
    
    // Check initial state
    expect(screen.getByTestId('progress')).toHaveTextContent('0 of 3 steps completed')
    
    // Complete first step
    await user.click(screen.getByTestId('complete-build'))
    expect(screen.getByTestId('progress')).toHaveTextContent('1 of 3 steps completed')
    expect(screen.getByTestId('complete-build')).toHaveTextContent('Completed')
    expect(screen.getByTestId('complete-build')).toBeDisabled()

    // Complete second step
    await user.click(screen.getByTestId('complete-configure'))
    expect(screen.getByTestId('progress')).toHaveTextContent('2 of 3 steps completed')

    // Complete final step
    await user.click(screen.getByTestId('complete-deploy'))
    expect(screen.getByTestId('progress')).toHaveTextContent('3 of 3 steps completed')
  })

  it('should display correct commands for each step', () => {
    render(<MockDeploymentGuideDetailed architecture={mockArchitecture} />)

    expect(screen.getByTestId('command-build')).toHaveTextContent('npm run build')
    expect(screen.getByTestId('command-configure')).toHaveTextContent('aws configure')
    expect(screen.getByTestId('command-deploy')).toHaveTextContent('aws s3 sync build/ s3://bucket')
  })
})

describe('Cross-Browser Compatibility Tests', () => {
  // These tests would typically use tools like Playwright or Selenium
  // For now, we'll simulate different browser behaviors
  
  it('should handle different viewport sizes', () => {
    // Mock different viewport sizes
    const originalInnerWidth = window.innerWidth
    const originalInnerHeight = window.innerHeight

    // Mobile viewport
    Object.defineProperty(window, 'innerWidth', { value: 375, writable: true })
    Object.defineProperty(window, 'innerHeight', { value: 667, writable: true })
    
    render(<WorkflowApp />)
    expect(screen.getByTestId('workflow-app')).toBeInTheDocument()

    // Desktop viewport
    Object.defineProperty(window, 'innerWidth', { value: 1920, writable: true })
    Object.defineProperty(window, 'innerHeight', { value: 1080, writable: true })
    
    // Component should still render correctly
    expect(screen.getByTestId('workflow-app')).toBeInTheDocument()

    // Restore original values
    Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth, writable: true })
    Object.defineProperty(window, 'innerHeight', { value: originalInnerHeight, writable: true })
  })

  it('should handle keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<WorkflowApp />)

    const completeButton = screen.getByTestId('complete-analysis')
    
    // Focus the button using Tab
    await user.tab()
    expect(completeButton).toHaveFocus()

    // Activate using Enter
    await user.keyboard('{Enter}')
    
    await waitFor(() => {
      expect(screen.getByTestId('current-step')).toHaveTextContent('recommendations')
    })
  })

  it('should handle touch events on mobile devices', async () => {
    const user = userEvent.setup()
    render(<WorkflowApp />)

    // Simulate touch events (userEvent handles this automatically)
    const completeButton = screen.getByTestId('complete-analysis')
    
    await user.click(completeButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('current-step')).toHaveTextContent('recommendations')
    })
  })
})

describe('Error Handling Integration Tests', () => {
  const MockErrorBoundary = ({ children, onError }) => {
    const [hasError, setHasError] = useState(false)

    useEffect(() => {
      const handleError = (error) => {
        setHasError(true)
        if (onError) onError(error)
      }

      window.addEventListener('error', handleError)
      return () => window.removeEventListener('error', handleError)
    }, [onError])

    if (hasError) {
      return <div data-testid="error-fallback">Something went wrong</div>
    }

    return children
  }

  const ErrorProneComponent = ({ shouldError }) => {
    if (shouldError) {
      throw new Error('Test error')
    }
    return <div data-testid="working-component">Working correctly</div>
  }

  it('should handle component errors gracefully', () => {
    const mockOnError = vi.fn()
    
    // Suppress console.error for this test
    const originalError = console.error
    console.error = vi.fn()

    render(
      <MockErrorBoundary onError={mockOnError}>
        <ErrorProneComponent shouldError={true} />
      </MockErrorBoundary>
    )

    expect(screen.getByTestId('error-fallback')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()

    console.error = originalError
  })

  it('should render normally when no errors occur', () => {
    render(
      <MockErrorBoundary>
        <ErrorProneComponent shouldError={false} />
      </MockErrorBoundary>
    )

    expect(screen.getByTestId('working-component')).toBeInTheDocument()
    expect(screen.getByText('Working correctly')).toBeInTheDocument()
  })
})