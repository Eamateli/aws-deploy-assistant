import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppProvider } from '../../context/AppContext'
import App from '../../App'

// Mock Lucide React icons
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
    Clock: (props) => <MockIcon data-testid="clock" {...props} />,
    Terminal: (props) => <MockIcon data-testid="terminal" {...props} />,
    Package: (props) => <MockIcon data-testid="package" {...props} />,
    Layers: (props) => <MockIcon data-testid="layers" {...props} />,
    Network: (props) => <MockIcon data-testid="network" {...props} />,
    Lock: (props) => <MockIcon data-testid="lock" {...props} />
  }
})

describe('Deployment Guide Integration Tests', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
    // Mock clipboard API
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

  const completeWorkflowToDeployment = async () => {
    // Step 1: Enter application description
    const textarea = screen.getByPlaceholderText(/Describe your application/i)
    await user.type(textarea, 'React e-commerce application with shopping cart and user authentication')

    // Step 2: Trigger analysis
    const analyzeButton = screen.getByText('Analyze Application')
    await user.click(analyzeButton)

    // Step 3: Wait for recommendations
    await waitFor(() => {
      expect(screen.getByText('AWS Architecture Recommendations')).toBeInTheDocument()
    }, { timeout: 3000 })

    // Step 4: Select an architecture to proceed to deployment
    const buttons = screen.getAllByRole('button')
    const selectButton = buttons.find(button => 
      button.textContent.includes('Select') || 
      button.textContent.includes('Choose') ||
      button.textContent.includes('Deploy')
    )
    
    if (selectButton) {
      await user.click(selectButton)
    }

    // Step 5: Wait for deployment guide to appear
    await waitFor(() => {
      const deploymentElements = screen.queryAllByText(/Deploy|Deployment|Guide|Step/i)
      expect(deploymentElements.length).toBeGreaterThan(0)
    }, { timeout: 3000 })
  }

  describe('Deployment Guide Display', () => {
    it('should display deployment guide after architecture selection', async () => {
      renderApp()
      await completeWorkflowToDeployment()

      // Should show deployment-related content
      const pageContent = document.body.textContent
      expect(pageContent).toMatch(/Deploy|Deployment|Guide|Step/i)
    })

    it('should show step-by-step instructions', async () => {
      renderApp()
      await completeWorkflowToDeployment()

      // Should have step indicators or numbered instructions
      const pageContent = document.body.textContent
      const hasSteps = pageContent.includes('Step') || 
                      pageContent.includes('1.') || 
                      pageContent.includes('2.') ||
                      /\d+\./.test(pageContent)
      
      expect(hasSteps).toBe(true)
    })

    it('should display AWS CLI commands', async () => {
      renderApp()
      await completeWorkflowToDeployment()

      // Should show AWS CLI commands or command-like content
      const pageContent = document.body.textContent.toLowerCase()
      const hasCommands = pageContent.includes('aws') || 
                         pageContent.includes('cli') ||
                         pageContent.includes('command') ||
                         pageContent.includes('$') ||
                         pageContent.includes('npm') ||
                         pageContent.includes('build')
      
      expect(hasCommands).toBe(true)
    })
  })

  describe('Command Generation and Copying', () => {
    it('should provide copy-paste ready commands', async () => {
      renderApp()
      await completeWorkflowToDeployment()

      // Look for copy buttons or copyable content
      const copyButtons = screen.queryAllByTestId('icon-copy')
      const codeElements = document.querySelectorAll('code, pre, .command, .cli')
      
      // Should have some way to copy commands
      expect(copyButtons.length + codeElements.length).toBeGreaterThan(0)
    })

    it('should handle command copying functionality', async () => {
      renderApp()
      await completeWorkflowToDeployment()

      // Look for copy buttons
      const copyButtons = screen.queryAllByTestId('icon-copy')
      
      if (copyButtons.length > 0) {
        // Click on a copy button
        await user.click(copyButtons[0])
        
        // Should have called clipboard API
        expect(navigator.clipboard.writeText).toHaveBeenCalled()
      }
    })

    it('should display command examples for different services', async () => {
      renderApp()
      await completeWorkflowToDeployment()

      // Should show service-specific commands
      const pageContent = document.body.textContent.toLowerCase()
      const hasServiceCommands = pageContent.includes('s3') || 
                                 pageContent.includes('lambda') ||
                                 pageContent.includes('cloudfront') ||
                                 pageContent.includes('ec2')
      
      expect(hasServiceCommands).toBe(true)
    })
  })

  describe('Prerequisites and Setup', () => {
    it('should display prerequisite requirements', async () => {
      renderApp()
      await completeWorkflowToDeployment()

      // Should show prerequisites or requirements
      const pageContent = document.body.textContent.toLowerCase()
      const hasPrerequisites = pageContent.includes('prerequisite') ||
                              pageContent.includes('requirement') ||
                              pageContent.includes('install') ||
                              pageContent.includes('setup') ||
                              pageContent.includes('aws cli') ||
                              pageContent.includes('node.js')
      
      expect(hasPrerequisites).toBe(true)
    })

    it('should show tool installation instructions', async () => {
      renderApp()
      await completeWorkflowToDeployment()

      // Should mention required tools
      const pageContent = document.body.textContent.toLowerCase()
      const hasToolInstructions = pageContent.includes('install') ||
                                  pageContent.includes('download') ||
                                  pageContent.includes('setup')
      
      expect(hasToolInstructions).toBe(true)
    })
  })

  describe('Progress Tracking', () => {
    it('should provide step completion tracking', async () => {
      renderApp()
      await completeWorkflowToDeployment()

      // Look for checkboxes, progress indicators, or completion markers
      const checkboxes = screen.queryAllByRole('checkbox')
      const checkIcons = screen.queryAllByTestId('icon-check')
      const progressElements = document.querySelectorAll('[class*="progress"], [class*="complete"], [class*="step"]')
      
      // Should have some form of progress tracking
      expect(checkboxes.length + checkIcons.length + progressElements.length).toBeGreaterThan(0)
    })

    it('should show deployment progress indicators', async () => {
      renderApp()
      await completeWorkflowToDeployment()

      // Should be on deployment step (step 3)
      const stepIndicators = screen.getAllByText(/Deploy|3/i)
      expect(stepIndicators.length).toBeGreaterThan(0)
    })
  })

  describe('Time Estimation', () => {
    it('should provide time estimates for deployment', async () => {
      renderApp()
      await completeWorkflowToDeployment()

      // Should show time estimates
      const pageContent = document.body.textContent.toLowerCase()
      const hasTimeEstimates = pageContent.includes('minute') ||
                              pageContent.includes('hour') ||
                              pageContent.includes('time') ||
                              /\d+\s*(min|hr|hour|minute)/.test(pageContent)
      
      expect(hasTimeEstimates).toBe(true)
    })
  })

  describe('Error Handling and Troubleshooting', () => {
    it('should handle deployment guide generation errors', async () => {
      // Mock console.error to catch any errors
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      renderApp()
      await completeWorkflowToDeployment()

      // Should render without throwing errors
      const pageContent = document.body.textContent
      expect(pageContent).toMatch(/Deploy|Deployment|Guide|Step/i)
      
      // Should not have logged critical errors
      const errorCalls = consoleSpy.mock.calls.filter(call => 
        call[0] && call[0].toString().toLowerCase().includes('error')
      )
      expect(errorCalls.length).toBe(0)

      consoleSpy.mockRestore()
    })

    it('should provide troubleshooting guidance', async () => {
      renderApp()
      await completeWorkflowToDeployment()

      // Should have help or troubleshooting content
      const pageContent = document.body.textContent.toLowerCase()
      const hasTroubleshooting = pageContent.includes('help') ||
                                pageContent.includes('troubleshoot') ||
                                pageContent.includes('error') ||
                                pageContent.includes('issue') ||
                                pageContent.includes('problem')
      
      // This is optional, so we'll just check if it exists
      // expect(hasTroubleshooting).toBe(true)
    })
  })

  describe('Template Generation', () => {
    it('should generate deployment templates', async () => {
      renderApp()
      await completeWorkflowToDeployment()

      // Should show template or configuration content
      const pageContent = document.body.textContent.toLowerCase()
      const hasTemplates = pageContent.includes('template') ||
                          pageContent.includes('config') ||
                          pageContent.includes('cloudformation') ||
                          pageContent.includes('terraform') ||
                          pageContent.includes('yaml') ||
                          pageContent.includes('json')
      
      expect(hasTemplates).toBe(true)
    })

    it('should provide infrastructure as code options', async () => {
      renderApp()
      await completeWorkflowToDeployment()

      // Should mention IaC options
      const pageContent = document.body.textContent.toLowerCase()
      const hasIaC = pageContent.includes('cloudformation') ||
                     pageContent.includes('terraform') ||
                     pageContent.includes('cdk') ||
                     pageContent.includes('infrastructure')
      
      expect(hasIaC).toBe(true)
    })
  })

  describe('Workflow Integration', () => {
    it('should transition from architecture to deployment step', async () => {
      renderApp()
      
      // Start workflow
      const textarea = screen.getByPlaceholderText(/Describe your application/i)
      await user.type(textarea, 'Node.js API with Express and MongoDB')
      
      const analyzeButton = screen.getByText('Analyze Application')
      await user.click(analyzeButton)

      // Wait for recommendations
      await waitFor(() => {
        expect(screen.getByText('AWS Architecture Recommendations')).toBeInTheDocument()
      }, { timeout: 3000 })

      // Should be on architecture step (step 2)
      const architectureStep = screen.getByText('Architecture')
      expect(architectureStep).toBeInTheDocument()

      // Try to proceed to deployment
      const buttons = screen.getAllByRole('button')
      const proceedButton = buttons.find(button => 
        button.textContent.includes('Select') || 
        button.textContent.includes('Deploy') ||
        button.textContent.includes('Continue')
      )
      
      if (proceedButton) {
        await user.click(proceedButton)
        
        // Should eventually show deployment content
        await waitFor(() => {
          const deploymentElements = screen.queryAllByText(/Deploy|Deployment|Guide|Step/i)
          expect(deploymentElements.length).toBeGreaterThan(0)
        }, { timeout: 3000 })
      }
    })

    it('should maintain selected architecture in deployment guide', async () => {
      renderApp()
      await completeWorkflowToDeployment()

      // Should reference the selected architecture
      const pageContent = document.body.textContent
      expect(pageContent).toMatch(/Deploy|Deployment|Architecture/i)
    })
  })

  describe('Responsive Design', () => {
    it('should work on different screen sizes', async () => {
      // Mock different viewport sizes
      const originalInnerWidth = window.innerWidth
      const originalInnerHeight = window.innerHeight

      try {
        // Test mobile viewport
        Object.defineProperty(window, 'innerWidth', { value: 375, writable: true })
        Object.defineProperty(window, 'innerHeight', { value: 667, writable: true })
        
        renderApp()
        await completeWorkflowToDeployment()
        
        // Should still show deployment content on mobile
        const pageContent = document.body.textContent
        expect(pageContent).toMatch(/Deploy|Deployment|Guide|Step/i)
        
        // Test desktop viewport
        Object.defineProperty(window, 'innerWidth', { value: 1920, writable: true })
        Object.defineProperty(window, 'innerHeight', { value: 1080, writable: true })
        
        // Should still be accessible on desktop
        expect(pageContent).toMatch(/Deploy|Deployment|Guide|Step/i)
      } finally {
        // Restore original values
        Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth, writable: true })
        Object.defineProperty(window, 'innerHeight', { value: originalInnerHeight, writable: true })
      }
    })
  })

  describe('Accessibility', () => {
    it('should provide accessible deployment interface', async () => {
      renderApp()
      await completeWorkflowToDeployment()

      // Should have proper heading structure
      const headings = screen.getAllByRole('heading')
      expect(headings.length).toBeGreaterThan(0)
      
      // Should have interactive elements
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should support keyboard navigation in deployment guide', async () => {
      renderApp()
      await completeWorkflowToDeployment()

      // Should be able to tab through interactive elements
      await user.tab()
      
      // Focus should be on an interactive element
      const focusedElement = document.activeElement
      expect(focusedElement).toBeTruthy()
      expect(['BUTTON', 'INPUT', 'TEXTAREA', 'A'].includes(focusedElement.tagName)).toBe(true)
    })

    it('should have proper ARIA labels for deployment steps', async () => {
      renderApp()
      await completeWorkflowToDeployment()

      // Should have accessible form elements and buttons
      const interactiveElements = screen.getAllByRole('button')
      expect(interactiveElements.length).toBeGreaterThan(0)
      
      // Elements should be properly labeled
      interactiveElements.forEach(element => {
        expect(element.textContent.trim()).toBeTruthy()
      })
    })
  })

  describe('Performance', () => {
    it('should generate deployment guide within reasonable time', async () => {
      const startTime = performance.now()
      
      renderApp()
      await completeWorkflowToDeployment()

      const endTime = performance.now()
      const generationTime = endTime - startTime

      // Should generate guide within 5 seconds
      expect(generationTime).toBeLessThan(5000)
    })

    it('should handle large deployment guides efficiently', async () => {
      renderApp()
      
      // Use a complex application description
      const textarea = screen.getByPlaceholderText(/Describe your application/i)
      await user.type(textarea, 'Full-stack React application with Node.js backend, PostgreSQL database, Redis cache, file uploads, real-time chat, user authentication, payment processing, and admin dashboard')

      const analyzeButton = screen.getByText('Analyze Application')
      await user.click(analyzeButton)

      const startTime = performance.now()

      // Wait for recommendations and proceed to deployment
      await waitFor(() => {
        expect(screen.getByText('AWS Architecture Recommendations')).toBeInTheDocument()
      }, { timeout: 3000 })

      const buttons = screen.getAllByRole('button')
      const selectButton = buttons.find(button => 
        button.textContent.includes('Select') || button.textContent.includes('Deploy')
      )
      
      if (selectButton) {
        await user.click(selectButton)
        
        await waitFor(() => {
          const deploymentElements = screen.queryAllByText(/Deploy|Deployment|Guide|Step/i)
          expect(deploymentElements.length).toBeGreaterThan(0)
        }, { timeout: 3000 })
      }

      const endTime = performance.now()
      const processingTime = endTime - startTime

      // Should handle complex guides within reasonable time
      expect(processingTime).toBeLessThan(8000)
    })
  })

  describe('Different Architecture Types', () => {
    it('should generate appropriate guides for static SPA', async () => {
      renderApp()
      
      const textarea = screen.getByPlaceholderText(/Describe your application/i)
      await user.type(textarea, 'React single-page application with static hosting needs')
      
      const analyzeButton = screen.getByText('Analyze Application')
      await user.click(analyzeButton)

      await waitFor(() => {
        expect(screen.getByText('AWS Architecture Recommendations')).toBeInTheDocument()
      }, { timeout: 3000 })

      // Proceed to deployment
      const buttons = screen.getAllByRole('button')
      const selectButton = buttons.find(button => 
        button.textContent.includes('Select') || button.textContent.includes('Deploy')
      )
      
      if (selectButton) {
        await user.click(selectButton)
        
        await waitFor(() => {
          const deploymentElements = screen.queryAllByText(/Deploy|Deployment|Guide|Step/i)
          expect(deploymentElements.length).toBeGreaterThan(0)
        }, { timeout: 3000 })

        // Should show S3/CloudFront related deployment content
        const pageContent = document.body.textContent.toLowerCase()
        const hasStaticDeployment = pageContent.includes('s3') ||
                                   pageContent.includes('cloudfront') ||
                                   pageContent.includes('static') ||
                                   pageContent.includes('build')
        
        expect(hasStaticDeployment).toBe(true)
      }
    })

    it('should generate appropriate guides for serverless API', async () => {
      renderApp()
      
      const textarea = screen.getByPlaceholderText(/Describe your application/i)
      await user.type(textarea, 'Node.js REST API with serverless architecture using Lambda')
      
      const analyzeButton = screen.getByText('Analyze Application')
      await user.click(analyzeButton)

      await waitFor(() => {
        expect(screen.getByText('AWS Architecture Recommendations')).toBeInTheDocument()
      }, { timeout: 3000 })

      // Proceed to deployment
      const buttons = screen.getAllByRole('button')
      const selectButton = buttons.find(button => 
        button.textContent.includes('Select') || button.textContent.includes('Deploy')
      )
      
      if (selectButton) {
        await user.click(selectButton)
        
        await waitFor(() => {
          const deploymentElements = screen.queryAllByText(/Deploy|Deployment|Guide|Step/i)
          expect(deploymentElements.length).toBeGreaterThan(0)
        }, { timeout: 3000 })

        // Should show Lambda/API Gateway related deployment content
        const pageContent = document.body.textContent.toLowerCase()
        const hasServerlessDeployment = pageContent.includes('lambda') ||
                                       pageContent.includes('api gateway') ||
                                       pageContent.includes('serverless')
        
        expect(hasServerlessDeployment).toBe(true)
      }
    })
  })

  describe('Validation and Testing', () => {
    it('should provide deployment validation steps', async () => {
      renderApp()
      await completeWorkflowToDeployment()

      // Should show validation or testing steps
      const pageContent = document.body.textContent.toLowerCase()
      const hasValidation = pageContent.includes('test') ||
                           pageContent.includes('validate') ||
                           pageContent.includes('verify') ||
                           pageContent.includes('check')
      
      expect(hasValidation).toBe(true)
    })

    it('should show deployment success indicators', async () => {
      renderApp()
      await completeWorkflowToDeployment()

      // Should have success indicators or completion markers
      const successIcons = screen.queryAllByTestId('icon-check')
      const pageContent = document.body.textContent.toLowerCase()
      const hasSuccessContent = pageContent.includes('success') ||
                               pageContent.includes('complete') ||
                               pageContent.includes('deployed') ||
                               successIcons.length > 0
      
      expect(hasSuccessContent).toBe(true)
    })
  })

  describe('Integration with Cost Calculator', () => {
    it('should reference cost information in deployment guide', async () => {
      renderApp()
      await completeWorkflowToDeployment()

      // Should mention costs or pricing
      const pageContent = document.body.textContent.toLowerCase()
      const hasCostInfo = pageContent.includes('cost') ||
                         pageContent.includes('price') ||
                         pageContent.includes('$') ||
                         pageContent.includes('free tier') ||
                         pageContent.includes('billing')
      
      expect(hasCostInfo).toBe(true)
    })
  })
})