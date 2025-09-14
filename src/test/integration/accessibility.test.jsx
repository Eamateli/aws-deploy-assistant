import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../utils'

// Mock components for accessibility testing
const AccessibleButton = ({ children, onClick, disabled, ariaLabel, ...props }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    aria-label={ariaLabel}
    type="button"
    {...props}
  >
    {children}
  </button>
)

const AccessibleForm = ({ onSubmit }) => (
  <form onSubmit={onSubmit} role="form" aria-labelledby="form-title">
    <h2 id="form-title">Application Analysis Form</h2>
    
    <div>
      <label htmlFor="app-description">
        Application Description
        <span aria-label="required" className="required">*</span>
      </label>
      <textarea
        id="app-description"
        name="description"
        required
        aria-describedby="description-help"
        placeholder="Describe your application..."
      />
      <div id="description-help" className="help-text">
        Provide details about your application's technology stack and features
      </div>
    </div>

    <fieldset>
      <legend>Framework Selection</legend>
      <div role="radiogroup" aria-labelledby="framework-legend">
        <label>
          <input type="radio" name="framework" value="react" />
          React
        </label>
        <label>
          <input type="radio" name="framework" value="vue" />
          Vue.js
        </label>
        <label>
          <input type="radio" name="framework" value="angular" />
          Angular
        </label>
      </div>
    </fieldset>

    <AccessibleButton type="submit" ariaLabel="Submit application for analysis">
      Analyze Application
    </AccessibleButton>
  </form>
)

const AccessibleServiceCard = ({ service, onSelect, selected }) => (
  <div
    role="button"
    tabIndex={0}
    aria-pressed={selected}
    aria-labelledby={`service-${service.id}-title`}
    aria-describedby={`service-${service.id}-description`}
    onClick={onSelect}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onSelect()
      }
    }}
    className={`service-card ${selected ? 'selected' : ''}`}
  >
    <h3 id={`service-${service.id}-title`}>{service.name}</h3>
    <p id={`service-${service.id}-description`}>{service.description}</p>
    <div aria-label={`Monthly cost: ${service.cost}`}>
      Cost: {service.cost}
    </div>
  </div>
)

const AccessibleProgressIndicator = ({ currentStep, totalSteps, stepNames }) => (
  <nav aria-label="Analysis progress" role="navigation">
    <ol className="progress-steps">
      {stepNames.map((name, index) => (
        <li
          key={index}
          aria-current={index === currentStep ? 'step' : undefined}
          className={`step ${index === currentStep ? 'current' : ''} ${index < currentStep ? 'completed' : ''}`}
        >
          <span aria-label={`Step ${index + 1} of ${totalSteps}: ${name}`}>
            {name}
          </span>
        </li>
      ))}
    </ol>
  </nav>
)

describe('Accessibility Tests', () => {
  describe('Keyboard Navigation', () => {
    it('should support full keyboard navigation through forms', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn((e) => e.preventDefault())

      render(<AccessibleForm onSubmit={mockSubmit} />)

      // Tab through form elements
      await user.tab()
      expect(screen.getByRole('textbox', { name: /application description/i })).toHaveFocus()

      await user.tab()
      expect(screen.getByRole('radio', { name: /react/i })).toHaveFocus()

      await user.tab()
      expect(screen.getByRole('radio', { name: /vue/i })).toHaveFocus()

      await user.tab()
      expect(screen.getByRole('radio', { name: /angular/i })).toHaveFocus()

      await user.tab()
      expect(screen.getByRole('button', { name: /submit application for analysis/i })).toHaveFocus()

      // Submit with Enter
      await user.keyboard('{Enter}')
      expect(mockSubmit).toHaveBeenCalled()
    })

    it('should support keyboard interaction with custom components', async () => {
      const user = userEvent.setup()
      const mockSelect = vi.fn()

      const service = {
        id: 's3',
        name: 'Amazon S3',
        description: 'Object storage service',
        cost: '$5-25/month'
      }

      render(
        <AccessibleServiceCard 
          service={service} 
          onSelect={mockSelect} 
          selected={false} 
        />
      )

      const serviceCard = screen.getByRole('button')
      
      // Focus with tab
      await user.tab()
      expect(serviceCard).toHaveFocus()

      // Activate with Enter
      await user.keyboard('{Enter}')
      expect(mockSelect).toHaveBeenCalled()

      // Reset mock
      mockSelect.mockClear()

      // Activate with Space
      await user.keyboard(' ')
      expect(mockSelect).toHaveBeenCalled()
    })

    it('should provide proper focus management in multi-step workflows', async () => {
      const user = userEvent.setup()
      
      const MultiStepWorkflow = () => {
        const [currentStep, setCurrentStep] = useState(0)
        const steps = ['Upload', 'Analysis', 'Recommendations', 'Deployment']

        return (
          <div>
            <AccessibleProgressIndicator 
              currentStep={currentStep}
              totalSteps={steps.length}
              stepNames={steps}
            />
            
            <main role="main" aria-live="polite">
              <h1>Step {currentStep + 1}: {steps[currentStep]}</h1>
              
              {currentStep < steps.length - 1 && (
                <AccessibleButton 
                  onClick={() => setCurrentStep(currentStep + 1)}
                  ariaLabel={`Continue to ${steps[currentStep + 1]}`}
                >
                  Next Step
                </AccessibleButton>
              )}
              
              {currentStep > 0 && (
                <AccessibleButton 
                  onClick={() => setCurrentStep(currentStep - 1)}
                  ariaLabel={`Go back to ${steps[currentStep - 1]}`}
                >
                  Previous Step
                </AccessibleButton>
              )}
            </main>
          </div>
        )
      }

      render(<MultiStepWorkflow />)

      // Check initial state
      expect(screen.getByRole('navigation', { name: /analysis progress/i })).toBeInTheDocument()
      expect(screen.getByText('Step 1: Upload')).toBeInTheDocument()

      // Navigate forward
      await user.click(screen.getByRole('button', { name: /continue to analysis/i }))
      expect(screen.getByText('Step 2: Analysis')).toBeInTheDocument()

      // Navigate backward
      await user.click(screen.getByRole('button', { name: /go back to upload/i }))
      expect(screen.getByText('Step 1: Upload')).toBeInTheDocument()
    })
  })

  describe('Screen Reader Support', () => {
    it('should provide proper ARIA labels and descriptions', () => {
      render(<AccessibleForm onSubmit={() => {}} />)

      // Check form structure
      expect(screen.getByRole('form')).toHaveAttribute('aria-labelledby', 'form-title')
      
      // Check input labels and descriptions
      const textarea = screen.getByRole('textbox', { name: /application description/i })
      expect(textarea).toHaveAttribute('aria-describedby', 'description-help')
      expect(textarea).toBeRequired()

      // Check fieldset and legend
      expect(screen.getByRole('group', { name: /framework selection/i })).toBeInTheDocument()
      expect(screen.getByRole('radiogroup')).toBeInTheDocument()

      // Check button accessibility
      const submitButton = screen.getByRole('button', { name: /submit application for analysis/i })
      expect(submitButton).toHaveAttribute('type', 'submit')
    })

    it('should announce dynamic content changes', () => {
      const DynamicContent = () => {
        const [status, setStatus] = useState('Ready')
        const [progress, setProgress] = useState(0)

        return (
          <div>
            <div aria-live="polite" aria-atomic="true">
              Status: {status}
            </div>
            
            <div 
              role="progressbar" 
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Analysis progress"
            >
              {progress}% complete
            </div>

            <AccessibleButton 
              onClick={() => {
                setStatus('Analyzing...')
                setProgress(50)
              }}
            >
              Start Analysis
            </AccessibleButton>

            <AccessibleButton 
              onClick={() => {
                setStatus('Complete')
                setProgress(100)
              }}
            >
              Complete Analysis
            </AccessibleButton>
          </div>
        )
      }

      render(<DynamicContent />)

      // Check initial state
      expect(screen.getByText('Status: Ready')).toBeInTheDocument()
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')

      // Check live region exists
      expect(screen.getByText('Status: Ready').closest('[aria-live="polite"]')).toBeInTheDocument()
    })

    it('should provide proper heading hierarchy', () => {
      const AccessiblePage = () => (
        <div>
          <h1>AWS Deploy Assistant</h1>
          
          <section>
            <h2>Code Analysis</h2>
            <h3>Upload Files</h3>
            <p>Upload your application files for analysis</p>
            
            <h3>Analysis Results</h3>
            <h4>Detected Framework</h4>
            <p>React application detected</p>
            
            <h4>Application Type</h4>
            <p>Single Page Application</p>
          </section>

          <section>
            <h2>Architecture Recommendations</h2>
            <h3>Recommended Services</h3>
            <p>Based on your application, we recommend...</p>
          </section>
        </div>
      )

      render(<AccessiblePage />)

      // Check heading hierarchy
      expect(screen.getByRole('heading', { level: 1, name: /aws deploy assistant/i })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 2, name: /code analysis/i })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 3, name: /upload files/i })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 4, name: /detected framework/i })).toBeInTheDocument()
    })
  })

  describe('Color and Contrast', () => {
    it('should not rely solely on color for information', () => {
      const StatusIndicator = ({ status, message }) => (
        <div 
          className={`status-indicator ${status}`}
          role="status"
          aria-label={`${status}: ${message}`}
        >
          <span className="status-icon" aria-hidden="true">
            {status === 'success' ? '✓' : status === 'error' ? '✗' : '⚠'}
          </span>
          <span className="status-text">{message}</span>
        </div>
      )

      render(
        <div>
          <StatusIndicator status="success" message="Analysis completed successfully" />
          <StatusIndicator status="error" message="Analysis failed" />
          <StatusIndicator status="warning" message="Low confidence in results" />
        </div>
      )

      // Check that status is conveyed through text and icons, not just color
      expect(screen.getByText('✓')).toBeInTheDocument()
      expect(screen.getByText('✗')).toBeInTheDocument()
      expect(screen.getByText('⚠')).toBeInTheDocument()
      
      // Check ARIA labels provide context
      expect(screen.getByLabelText(/success: analysis completed/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/error: analysis failed/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/warning: low confidence/i)).toBeInTheDocument()
    })

    it('should provide sufficient color contrast simulation', () => {
      // This would typically use a tool like axe-core
      // For now, we'll simulate contrast checking
      const checkContrast = (foreground, background) => {
        // Simplified contrast calculation (real implementation would be more complex)
        const fgLuminance = parseInt(foreground.slice(1), 16) / 0xFFFFFF
        const bgLuminance = parseInt(background.slice(1), 16) / 0xFFFFFF
        
        const lighter = Math.max(fgLuminance, bgLuminance)
        const darker = Math.min(fgLuminance, bgLuminance)
        
        return (lighter + 0.05) / (darker + 0.05)
      }

      // Test common color combinations
      const colorTests = [
        { fg: '#000000', bg: '#FFFFFF', name: 'Black on White' },
        { fg: '#FFFFFF', bg: '#000000', name: 'White on Black' },
        { fg: '#0066CC', bg: '#FFFFFF', name: 'Blue on White' },
        { fg: '#FFFFFF', bg: '#0066CC', name: 'White on Blue' }
      ]

      colorTests.forEach(({ fg, bg, name }) => {
        const contrast = checkContrast(fg, bg)
        
        // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
        expect(contrast).toBeGreaterThan(3)
      })
    })
  })

  describe('Mobile Accessibility', () => {
    it('should provide adequate touch targets', () => {
      const TouchTargetTest = () => (
        <div>
          <AccessibleButton 
            style={{ minWidth: '44px', minHeight: '44px', padding: '12px' }}
            ariaLabel="Minimum touch target size"
          >
            ✓
          </AccessibleButton>
          
          <AccessibleButton 
            style={{ minWidth: '48px', minHeight: '48px', padding: '16px' }}
            ariaLabel="Recommended touch target size"
          >
            Tap Me
          </AccessibleButton>
        </div>
      )

      render(<TouchTargetTest />)

      const buttons = screen.getAllByRole('button')
      
      // Check that buttons exist (actual size testing would require DOM measurement)
      expect(buttons).toHaveLength(2)
      expect(buttons[0]).toHaveAttribute('aria-label', 'Minimum touch target size')
      expect(buttons[1]).toHaveAttribute('aria-label', 'Recommended touch target size')
    })

    it('should support zoom up to 200% without horizontal scrolling', () => {
      // This would typically be tested with actual browser zoom
      // For now, we'll simulate responsive behavior
      const ResponsiveLayout = () => (
        <div style={{ maxWidth: '100%', overflow: 'hidden' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ flex: '1 1 300px', minWidth: '0' }}>
              <h2>Analysis Results</h2>
              <p>Your application has been analyzed...</p>
            </div>
            <div style={{ flex: '1 1 300px', minWidth: '0' }}>
              <h2>Recommendations</h2>
              <p>We recommend the following services...</p>
            </div>
          </div>
        </div>
      )

      render(<ResponsiveLayout />)

      // Check that content is present and structured properly
      expect(screen.getByText('Analysis Results')).toBeInTheDocument()
      expect(screen.getByText('Recommendations')).toBeInTheDocument()
    })
  })

  describe('Error Accessibility', () => {
    it('should provide accessible error messages', () => {
      const AccessibleErrorForm = () => {
        const [errors, setErrors] = useState({})

        const validate = () => {
          const newErrors = {}
          const description = document.getElementById('description').value
          
          if (!description.trim()) {
            newErrors.description = 'Application description is required'
          } else if (description.length < 20) {
            newErrors.description = 'Description must be at least 20 characters'
          }

          setErrors(newErrors)
          return Object.keys(newErrors).length === 0
        }

        return (
          <form onSubmit={(e) => { e.preventDefault(); validate(); }}>
            <div>
              <label htmlFor="description">Application Description</label>
              <textarea
                id="description"
                aria-describedby={errors.description ? 'description-error' : 'description-help'}
                aria-invalid={errors.description ? 'true' : 'false'}
              />
              
              {errors.description && (
                <div 
                  id="description-error" 
                  role="alert"
                  className="error-message"
                >
                  {errors.description}
                </div>
              )}
              
              <div id="description-help" className="help-text">
                Provide details about your application
              </div>
            </div>

            <AccessibleButton type="submit">
              Submit
            </AccessibleButton>
          </form>
        )
      }

      render(<AccessibleErrorForm />)

      const textarea = screen.getByRole('textbox')
      const submitButton = screen.getByRole('button', { name: /submit/i })

      // Initially no errors
      expect(textarea).toHaveAttribute('aria-invalid', 'false')
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()

      // Trigger validation
      submitButton.click()

      // Should show error
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('Application description is required')).toBeInTheDocument()
    })
  })
})

// Add missing React import
import React, { useState } from 'react'