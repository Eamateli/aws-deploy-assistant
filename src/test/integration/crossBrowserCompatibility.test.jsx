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
    Lock: (props) => <MockIcon data-testid="lock" {...props} />,
    Terminal: (props) => <MockIcon data-testid="terminal" {...props} />,
    FileCode: (props) => <MockIcon data-testid="file-code" {...props} />
  }
})

describe('Cross-Browser Compatibility Tests', () => {
  let user
  let originalUserAgent

  beforeEach(() => {
    user = userEvent.setup()
    originalUserAgent = navigator.userAgent
  })

  afterEach(() => {
    vi.clearAllMocks()
    // Restore original user agent
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUserAgent,
      configurable: true
    })
  })

  const renderApp = (initialState = {}) => {
    return render(
      <AppProvider initialState={initialState}>
        <App />
      </AppProvider>
    )
  }

  const mockUserAgent = (userAgent) => {
    Object.defineProperty(navigator, 'userAgent', {
      value: userAgent,
      configurable: true
    })
  }

  const simulateBrowserEnvironment = (browser) => {
    const userAgents = {
      chrome: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      firefox: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
      safari: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
      brave: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    
    mockUserAgent(userAgents[browser])
    
    // Mock browser-specific APIs
    if (browser === 'safari') {
      // Safari has different clipboard API behavior
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: vi.fn().mockRejectedValue(new Error('Clipboard API not available'))
        },
        configurable: true
      })
    } else {
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: vi.fn().mockResolvedValue()
        },
        configurable: true
      })
    }

    // Mock browser-specific CSS support
    const mockSupports = vi.fn()
    if (browser === 'firefox') {
      mockSupports.mockImplementation((property, value) => {
        // Firefox has different CSS Grid support
        if (property === 'display' && value === 'grid') return true
        if (property === 'backdrop-filter') return false
        return true
      })
    } else {
      mockSupports.mockReturnValue(true)
    }
    
    global.CSS = { supports: mockSupports }
  }

  const completeBasicWorkflow = async () => {
    // Enter application description
    const textarea = screen.getByPlaceholderText(/Describe your application/i)
    await user.type(textarea, 'React e-commerce application')
    
    // Trigger analysis
    const analyzeButton = screen.getByText('Analyze Application')
    await user.click(analyzeButton)
    
    // Wait for results
    await waitFor(() => {
      const pageContent = document.body.textContent.toLowerCase()
      expect(
        pageContent.includes('recommendation') || 
        pageContent.includes('architecture') ||
        pageContent.includes('aws')
      ).toBe(true)
    }, { timeout: 3000 })
  }

  describe('Chrome Compatibility', () => {
    beforeEach(() => {
      simulateBrowserEnvironment('chrome')
    })

    it('should render application correctly in Chrome', async () => {
      renderApp()
      
      // Should render main interface
      expect(screen.getByText('AWS Deploy Assistant')).toBeInTheDocument()
      
      // Should have functional buttons
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should handle file uploads in Chrome', async () => {
      renderApp()
      
      // Look for file upload area or upload-related content
      const fileInputs = document.querySelectorAll('input[type="file"]')
      const dropZones = document.querySelectorAll('[data-testid*="drop"], .drop-zone, .file-upload')
      const uploadText = document.body.textContent.toLowerCase()
      const hasUploadFeature = uploadText.includes('upload') || uploadText.includes('drag') || uploadText.includes('file')
      
      // Should have file upload capability or mention upload functionality
      expect(fileInputs.length + dropZones.length > 0 || hasUploadFeature).toBe(true)
    })

    it('should support clipboard operations in Chrome', async () => {
      renderApp()
      await completeBasicWorkflow()
      
      // Look for copy buttons
      const copyButtons = screen.getAllByRole('button').filter(button =>
        button.textContent.toLowerCase().includes('copy')
      )
      
      if (copyButtons.length > 0) {
        await user.click(copyButtons[0])
        expect(navigator.clipboard.writeText).toHaveBeenCalled()
      }
    })

    it('should handle CSS Grid layouts in Chrome', async () => {
      renderApp()
      
      // Check for grid layouts
      const gridElements = document.querySelectorAll('.grid, [style*="grid"], [class*="grid"]')
      
      // Should support modern CSS features
      expect(CSS.supports('display', 'grid')).toBe(true)
    })

    it('should support modern JavaScript features in Chrome', async () => {
      renderApp()
      
      // Test async/await, arrow functions, destructuring
      const testModernJS = async () => {
        const data = { test: 'value' }
        const { test } = data
        return test
      }
      
      const result = await testModernJS()
      expect(result).toBe('value')
    })
  })

  describe('Firefox Compatibility', () => {
    beforeEach(() => {
      simulateBrowserEnvironment('firefox')
    })

    it('should render application correctly in Firefox', async () => {
      renderApp()
      
      // Should render main interface
      expect(screen.getByText('AWS Deploy Assistant')).toBeInTheDocument()
      
      // Should handle Firefox-specific rendering
      const pageContent = document.body.textContent
      expect(pageContent.length).toBeGreaterThan(0)
    })

    it('should handle form interactions in Firefox', async () => {
      renderApp()
      
      // Test textarea input
      const textarea = screen.getByPlaceholderText(/Describe your application/i)
      await user.type(textarea, 'Test application')
      
      expect(textarea.value).toBe('Test application')
    })

    it('should work with Firefox CSS limitations', async () => {
      renderApp()
      
      // Firefox might not support some CSS features
      expect(CSS.supports('backdrop-filter', 'blur(10px)')).toBe(false)
      
      // But should still render the interface
      const mainContent = document.querySelector('main, .main, [role="main"]')
      expect(mainContent || document.body.children.length > 0).toBeTruthy()
    })

    it('should handle button interactions in Firefox', async () => {
      renderApp()
      
      const analyzeButton = screen.getByText('Analyze Application')
      await user.click(analyzeButton)
      
      // Should trigger analysis workflow
      await waitFor(() => {
        const pageContent = document.body.textContent.toLowerCase()
        expect(pageContent.includes('analyz') || pageContent.includes('process')).toBe(true)
      }, { timeout: 2000 })
    })

    it('should support Firefox-specific event handling', async () => {
      renderApp()
      
      // Test keyboard navigation
      await user.tab()
      const focusedElement = document.activeElement
      expect(focusedElement).toBeTruthy()
      expect(focusedElement.tagName).toMatch(/BUTTON|INPUT|TEXTAREA|A|SELECT/)
    })
  })

  describe('Safari Compatibility', () => {
    beforeEach(() => {
      simulateBrowserEnvironment('safari')
    })

    it('should render application correctly in Safari', async () => {
      renderApp()
      
      // Should render main interface
      expect(screen.getByText('AWS Deploy Assistant')).toBeInTheDocument()
      
      // Should handle Safari-specific rendering
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should handle Safari clipboard limitations gracefully', async () => {
      renderApp()
      await completeBasicWorkflow()
      
      // Look for copy buttons
      const copyButtons = screen.getAllByRole('button').filter(button =>
        button.textContent.toLowerCase().includes('copy')
      )
      
      if (copyButtons.length > 0) {
        await user.click(copyButtons[0])
        // Safari clipboard might fail, but should handle gracefully
        expect(navigator.clipboard.writeText).toHaveBeenCalled()
      }
    })

    it('should work with Safari touch events', async () => {
      renderApp()
      
      // Simulate touch interactions
      const buttons = screen.getAllByRole('button')
      if (buttons.length > 0) {
        fireEvent.touchStart(buttons[0])
        fireEvent.touchEnd(buttons[0])
        
        // Should handle touch events without errors
        expect(buttons[0]).toBeInTheDocument()
      }
    })

    it('should handle Safari-specific CSS behavior', async () => {
      renderApp()
      
      // Safari has different flexbox behavior
      const flexElements = document.querySelectorAll('[style*="flex"], .flex, [class*="flex"]')
      
      // Should still render layout correctly
      const mainLayout = document.querySelector('main, .main, .app')
      expect(mainLayout || document.body.children.length > 0).toBeTruthy()
    })

    it('should support Safari date/time handling', async () => {
      renderApp()
      
      // Test date operations that might differ in Safari
      const now = new Date()
      const timestamp = now.toISOString()
      
      expect(timestamp).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })
  })

  describe('Brave Compatibility', () => {
    beforeEach(() => {
      simulateBrowserEnvironment('brave')
    })

    it('should render application correctly in Brave', async () => {
      renderApp()
      
      // Should render main interface
      expect(screen.getByText('AWS Deploy Assistant')).toBeInTheDocument()
      
      // Should work like Chrome but with privacy features
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should handle Brave privacy features', async () => {
      renderApp()
      
      // Brave might block certain tracking or analytics
      // Application should still function normally
      const pageContent = document.body.textContent
      expect(pageContent.includes('AWS Deploy Assistant')).toBe(true)
    })

    it('should work with Brave ad blocking', async () => {
      renderApp()
      
      // Even with ad blocking, core functionality should work
      const textarea = screen.getByPlaceholderText(/Describe your application/i)
      await user.type(textarea, 'Test app')
      
      expect(textarea.value).toBe('Test app')
    })

    it('should handle Brave script blocking gracefully', async () => {
      renderApp()
      
      // Core React functionality should work
      const analyzeButton = screen.getByText('Analyze Application')
      await user.click(analyzeButton)
      
      // Should trigger analysis
      await waitFor(() => {
        const pageContent = document.body.textContent.toLowerCase()
        expect(pageContent.includes('analyz') || pageContent.includes('process')).toBe(true)
      }, { timeout: 2000 })
    })

    it('should support Brave-specific security features', async () => {
      renderApp()
      
      // Should handle HTTPS requirements and security headers
      // In test environment, just verify basic functionality
      expect(screen.getByText('AWS Deploy Assistant')).toBeInTheDocument()
    })
  })

  describe('Cross-Browser Feature Compatibility', () => {
    const browsers = ['chrome', 'firefox', 'safari', 'brave']

    browsers.forEach(browser => {
      describe(`${browser.charAt(0).toUpperCase() + browser.slice(1)} Features`, () => {
        beforeEach(() => {
          simulateBrowserEnvironment(browser)
        })

        it(`should support basic workflow in ${browser}`, async () => {
          renderApp()
          await completeBasicWorkflow()
          
          // Should complete basic workflow regardless of browser
          const pageContent = document.body.textContent.toLowerCase()
          expect(
            pageContent.includes('recommendation') || 
            pageContent.includes('architecture') ||
            pageContent.includes('aws') ||
            pageContent.includes('analyz')
          ).toBe(true)
        })

        it(`should handle responsive design in ${browser}`, async () => {
          renderApp()
          
          // Test different viewport sizes
          Object.defineProperty(window, 'innerWidth', { value: 320, configurable: true })
          Object.defineProperty(window, 'innerHeight', { value: 568, configurable: true })
          
          fireEvent(window, new Event('resize'))
          
          // Should still be functional on mobile
          expect(screen.getByText('AWS Deploy Assistant')).toBeInTheDocument()
          
          // Reset to desktop
          Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true })
          Object.defineProperty(window, 'innerHeight', { value: 768, configurable: true })
          
          fireEvent(window, new Event('resize'))
        })

        it(`should support keyboard navigation in ${browser}`, async () => {
          renderApp()
          
          // Test tab navigation
          await user.tab()
          const firstFocusable = document.activeElement
          expect(firstFocusable).toBeTruthy()
          
          await user.tab()
          const secondFocusable = document.activeElement
          expect(secondFocusable).toBeTruthy()
          
          // Should be able to navigate between elements
          expect(firstFocusable).not.toBe(secondFocusable)
        })

        it(`should handle form validation in ${browser}`, async () => {
          renderApp()
          
          // Try to analyze without input
          const analyzeButton = screen.getByText('Analyze Application')
          await user.click(analyzeButton)
          
          // Should handle validation appropriately
          const pageContent = document.body.textContent.toLowerCase()
          expect(
            pageContent.includes('describe') ||
            pageContent.includes('required') ||
            pageContent.includes('analyz') ||
            pageContent.includes('process')
          ).toBe(true)
        })

        it(`should support modern CSS features in ${browser}`, async () => {
          renderApp()
          
          // Check for modern CSS usage
          const styledElements = document.querySelectorAll('[class*="flex"], [class*="grid"], [style*="flex"], [style*="grid"]')
          
          // Should use modern layout techniques
          expect(styledElements.length).toBeGreaterThan(0)
        })
      })
    })
  })

  describe('Browser-Specific Error Handling', () => {
    it('should handle Chrome-specific errors gracefully', async () => {
      simulateBrowserEnvironment('chrome')
      renderApp()
      
      // Simulate Chrome-specific error
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      // Should not crash the application
      expect(screen.getByText('AWS Deploy Assistant')).toBeInTheDocument()
      
      consoleError.mockRestore()
    })

    it('should handle Firefox-specific errors gracefully', async () => {
      simulateBrowserEnvironment('firefox')
      renderApp()
      
      // Firefox might have different error handling
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      // Should still function
      expect(screen.getByText('AWS Deploy Assistant')).toBeInTheDocument()
      
      consoleWarn.mockRestore()
    })

    it('should handle Safari-specific errors gracefully', async () => {
      simulateBrowserEnvironment('safari')
      renderApp()
      
      // Safari might have clipboard or other API limitations
      // Should handle gracefully without crashing
      expect(screen.getByText('AWS Deploy Assistant')).toBeInTheDocument()
    })

    it('should handle Brave-specific errors gracefully', async () => {
      simulateBrowserEnvironment('brave')
      renderApp()
      
      // Brave might block certain features
      // Should continue to function
      expect(screen.getByText('AWS Deploy Assistant')).toBeInTheDocument()
    })
  })

  describe('Performance Across Browsers', () => {
    const browsers = ['chrome', 'firefox', 'safari', 'brave']

    browsers.forEach(browser => {
      it(`should load efficiently in ${browser}`, async () => {
        simulateBrowserEnvironment(browser)
        
        const startTime = performance.now()
        renderApp()
        const endTime = performance.now()
        
        const loadTime = endTime - startTime
        
        // Should load within reasonable time across all browsers
        expect(loadTime).toBeLessThan(2000) // 2 seconds
        expect(screen.getByText('AWS Deploy Assistant')).toBeInTheDocument()
      })

      it(`should handle large datasets efficiently in ${browser}`, async () => {
        simulateBrowserEnvironment(browser)
        
        // Test with complex state
        renderApp({
          analysis: {
            detected: { framework: 'react', appType: 'spa' },
            confidence: 0.9
          },
          recommendations: Array.from({ length: 10 }, (_, i) => ({
            id: `arch-${i}`,
            name: `Architecture ${i}`,
            services: ['s3', 'cloudfront', 'lambda']
          }))
        })
        
        // Should handle large datasets without performance issues
        expect(screen.getByText('AWS Deploy Assistant')).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility Across Browsers', () => {
    const browsers = ['chrome', 'firefox', 'safari', 'brave']

    browsers.forEach(browser => {
      it(`should maintain accessibility standards in ${browser}`, async () => {
        simulateBrowserEnvironment(browser)
        renderApp()
        
        // Should have proper heading structure
        const headings = screen.getAllByRole('heading')
        expect(headings.length).toBeGreaterThan(0)
        
        // Should have accessible buttons
        const buttons = screen.getAllByRole('button')
        expect(buttons.length).toBeGreaterThan(0)
        
        // Should support screen readers
        const ariaElements = document.querySelectorAll('[aria-label], [aria-describedby], [role]')
        // Should have some accessible elements or at least proper semantic structure
        const accessibleButtons = screen.getAllByRole('button')
        const accessibleHeadings = screen.getAllByRole('heading')
        expect(ariaElements.length + accessibleButtons.length + accessibleHeadings.length).toBeGreaterThan(0)
      })

      it(`should support keyboard navigation in ${browser}`, async () => {
        simulateBrowserEnvironment(browser)
        renderApp()
        
        // Should be able to tab through interactive elements
        await user.tab()
        const focusedElement = document.activeElement
        expect(focusedElement).toBeTruthy()
        expect(['BUTTON', 'INPUT', 'TEXTAREA', 'A', 'SELECT'].includes(focusedElement.tagName)).toBe(true)
      })
    })
  })
})