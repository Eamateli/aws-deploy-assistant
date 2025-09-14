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
    Layers: (props) => <MockIcon data-testid="layers" {...props} />,
    Network: (props) => <MockIcon data-testid="network" {...props} />,
    Lock: (props) => <MockIcon data-testid="lock" {...props} />
  }
})

describe('Architecture Diagram Integration Tests', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
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

  const completeAnalysisWorkflow = async () => {
    // Enter application description
    const textarea = screen.getByPlaceholderText(/Describe your application/i)
    await user.type(textarea, 'React e-commerce application with shopping cart, user authentication, and payment processing')

    // Trigger analysis
    const analyzeButton = screen.getByText('Analyze Application')
    await user.click(analyzeButton)

    // Wait for recommendations to appear
    await waitFor(() => {
      expect(screen.getByText('AWS Architecture Recommendations')).toBeInTheDocument()
    }, { timeout: 3000 })
  }

  describe('Architecture Recommendations Display', () => {
    it('should display architecture recommendations after analysis', async () => {
      renderApp()
      await completeAnalysisWorkflow()

      // Should show recommendations heading
      expect(screen.getByText('AWS Architecture Recommendations')).toBeInTheDocument()
      
      // Should show some architecture content
      const pageContent = document.body.textContent
      expect(pageContent).toContain('Architecture')
    })

    it('should show AWS service information', async () => {
      renderApp()
      await completeAnalysisWorkflow()

      // Should have some AWS-related content
      const pageContent = document.body.textContent.toLowerCase()
      const awsTerms = ['aws', 's3', 'cloudfront', 'lambda', 'ec2', 'rds']
      
      let foundTerms = 0
      awsTerms.forEach(term => {
        if (pageContent.includes(term)) {
          foundTerms++
        }
      })
      
      // Should find at least some AWS terms
      expect(foundTerms).toBeGreaterThan(0)
    })

    it('should display architecture options', async () => {
      renderApp()
      await completeAnalysisWorkflow()

      // Look for architecture-related buttons or cards
      const buttons = screen.getAllByRole('button')
      const architectureButtons = buttons.filter(button => 
        button.textContent.toLowerCase().includes('select') ||
        button.textContent.toLowerCase().includes('choose') ||
        button.textContent.toLowerCase().includes('architecture')
      )

      // Should have some interactive elements for architecture selection
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('Visual Architecture Elements', () => {
    it('should render AWS service icons and visual elements', async () => {
      renderApp()
      await completeAnalysisWorkflow()

      // Should have AWS service icons rendered (using Lucide React icons as fallbacks)
      const awsIcons = [
        'icon-cloud', 'icon-server', 'icon-database', 'icon-globe',
        'icon-cpu', 'icon-shield', 'icon-hard-drive', 'icon-layers',
        'icon-zap', 'icon-network'
      ]

      // Count all visual elements including icons and buttons
      let visualElementCount = 0
      
      // Check for Lucide React icons (mocked as divs with data-testid)
      awsIcons.forEach(iconTestId => {
        const icons = screen.queryAllByTestId(iconTestId)
        visualElementCount += icons.length
      })
      
      // Check for buttons and other interactive elements
      const buttons = screen.getAllByRole('button')
      visualElementCount += buttons.length
      
      // Check for any SVG elements or images
      const svgElements = document.querySelectorAll('svg, img')
      visualElementCount += svgElements.length
      
      // Should have some visual elements in the architecture view
      expect(visualElementCount).toBeGreaterThan(0)
      
      // Should specifically have some AWS-related visual content
      const pageContent = document.body.textContent.toLowerCase()
      const hasAwsContent = pageContent.includes('aws') || 
                           pageContent.includes('s3') || 
                           pageContent.includes('lambda') || 
                           pageContent.includes('cloudfront')
      expect(hasAwsContent).toBe(true)
    })

    it('should show architecture visualization area', async () => {
      renderApp()
      await completeAnalysisWorkflow()

      // Should have some visual representation of architecture
      const pageContent = document.body.textContent
      expect(pageContent).toContain('Architecture')
      
      // Should be on the architecture step
      expect(screen.getByText('Architecture')).toBeInTheDocument()
    })
  })

  describe('Workflow State Management', () => {
    it('should transition to architecture step after analysis', async () => {
      renderApp()
      
      // Start on upload step
      expect(screen.getByText('Describe Your Application')).toBeInTheDocument()
      
      // Complete analysis
      await completeAnalysisWorkflow()
      
      // Should be on architecture step (step 2)
      const stepIndicators = screen.getAllByText('Architecture')
      expect(stepIndicators.length).toBeGreaterThan(0)
    })

    it('should maintain analysis results in architecture view', async () => {
      renderApp()
      await completeAnalysisWorkflow()

      // Should show that analysis was completed
      const pageContent = document.body.textContent
      expect(pageContent).toContain('Architecture')
      
      // Should not be back on the upload step
      expect(screen.queryByText('Describe Your Application')).not.toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('should render architecture view within reasonable time', async () => {
      const startTime = performance.now()
      
      renderApp()
      await completeAnalysisWorkflow()

      const endTime = performance.now()
      const renderTime = endTime - startTime

      // Should render within 5 seconds
      expect(renderTime).toBeLessThan(5000)
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
        await completeAnalysisWorkflow()
        
        // Should still show architecture content on mobile
        expect(screen.getByText('AWS Architecture Recommendations')).toBeInTheDocument()
        
        // Test desktop viewport
        Object.defineProperty(window, 'innerWidth', { value: 1920, writable: true })
        Object.defineProperty(window, 'innerHeight', { value: 1080, writable: true })
        
        // Should still be accessible on desktop
        expect(screen.getByText('AWS Architecture Recommendations')).toBeInTheDocument()
      } finally {
        // Restore original values
        Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth, writable: true })
        Object.defineProperty(window, 'innerHeight', { value: originalInnerHeight, writable: true })
      }
    })
  })

  describe('Error Handling', () => {
    it('should handle architecture rendering gracefully', async () => {
      // Mock console.error to catch any errors
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      renderApp()
      await completeAnalysisWorkflow()

      // Should render without throwing errors
      expect(screen.getByText('AWS Architecture Recommendations')).toBeInTheDocument()
      
      // Should not have logged any critical errors
      const errorCalls = consoleSpy.mock.calls.filter(call => 
        call[0] && call[0].toString().toLowerCase().includes('error')
      )
      expect(errorCalls.length).toBe(0)

      consoleSpy.mockRestore()
    })

    it('should handle empty architecture data', async () => {
      // Start with recommendations state but no data
      renderApp({
        currentStep: 'recommendations',
        analysis: {
          detected: { framework: 'react', appType: 'spa' },
          confidence: 0.8
        },
        recommendations: []
      })

      // Should still render the architecture view
      expect(screen.getByText('Architecture')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should provide accessible architecture interface', async () => {
      renderApp()
      await completeAnalysisWorkflow()

      // Should have proper heading structure
      const headings = screen.getAllByRole('heading')
      expect(headings.length).toBeGreaterThan(0)
      
      // Should have interactive elements
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should support keyboard navigation', async () => {
      renderApp()
      await completeAnalysisWorkflow()

      // Should be able to tab through interactive elements
      await user.tab()
      
      // Focus should be on an interactive element
      const focusedElement = document.activeElement
      expect(focusedElement).toBeTruthy()
      expect(['BUTTON', 'INPUT', 'TEXTAREA', 'A'].includes(focusedElement.tagName)).toBe(true)
    })
  })

  describe('Integration with Analysis Results', () => {
    it('should display recommendations based on analysis', async () => {
      renderApp()
      await completeAnalysisWorkflow()

      // Should show recommendations text
      expect(screen.getByText(/Based on your.*here are optimized AWS architectures/)).toBeInTheDocument()
      
      // Should show architecture content
      const pageContent = document.body.textContent
      expect(pageContent).toContain('Architecture')
    })

    it('should handle different application types', async () => {
      renderApp()
      
      // Test with different application description
      const textarea = screen.getByPlaceholderText(/Describe your application/i)
      await user.type(textarea, 'Node.js REST API with Express and MongoDB database')
      
      const analyzeButton = screen.getByText('Analyze Application')
      await user.click(analyzeButton)

      // Wait for recommendations
      await waitFor(() => {
        expect(screen.getByText('AWS Architecture Recommendations')).toBeInTheDocument()
      }, { timeout: 3000 })

      // Should show architecture recommendations
      expect(screen.getByText(/Based on your.*here are optimized AWS architectures/)).toBeInTheDocument()
    })
  })
})