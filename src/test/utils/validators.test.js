import { describe, it, expect } from 'vitest'
import { 
  validateFileUpload,
  validateApplicationDescription,
  validateAnalysisInput,
  validateArchitectureSelection,
  sanitizeUserInput
} from '../../utils/validators'

describe('Validation Utilities', () => {
  describe('validateFileUpload', () => {
    it('should accept valid file types', () => {
      const validFiles = [
        { name: 'package.json', size: 1024, type: 'application/json' },
        { name: 'App.jsx', size: 2048, type: 'text/javascript' },
        { name: 'server.js', size: 1500, type: 'text/javascript' },
        { name: 'requirements.txt', size: 500, type: 'text/plain' },
        { name: 'Dockerfile', size: 800, type: 'text/plain' }
      ]

      const result = validateFileUpload(validFiles)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.validFiles).toHaveLength(5)
    })

    it('should reject files that are too large', () => {
      const largeFiles = [
        { name: 'large-file.js', size: 15 * 1024 * 1024, type: 'text/javascript' } // 15MB
      ]

      const result = validateFileUpload(largeFiles)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          type: 'FILE_TOO_LARGE',
          file: 'large-file.js'
        })
      )
    })

    it('should reject unsupported file types', () => {
      const unsupportedFiles = [
        { name: 'image.png', size: 1024, type: 'image/png' },
        { name: 'document.pdf', size: 2048, type: 'application/pdf' },
        { name: 'video.mp4', size: 5000, type: 'video/mp4' }
      ]

      const result = validateFileUpload(unsupportedFiles)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(3)
      expect(result.errors[0].type).toBe('UNSUPPORTED_FILE_TYPE')
    })

    it('should enforce maximum file count', () => {
      const tooManyFiles = Array.from({ length: 25 }, (_, i) => ({
        name: `file${i}.js`,
        size: 1024,
        type: 'text/javascript'
      }))

      const result = validateFileUpload(tooManyFiles)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          type: 'TOO_MANY_FILES',
          maxFiles: 20
        })
      )
    })

    it('should validate total upload size', () => {
      const files = Array.from({ length: 10 }, (_, i) => ({
        name: `file${i}.js`,
        size: 6 * 1024 * 1024, // 6MB each = 60MB total
        type: 'text/javascript'
      }))

      const result = validateFileUpload(files)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          type: 'TOTAL_SIZE_TOO_LARGE',
          maxSize: '50MB'
        })
      )
    })

    it('should provide helpful suggestions for common issues', () => {
      const problematicFiles = [
        { name: 'node_modules/package.json', size: 1024, type: 'application/json' },
        { name: '.git/config', size: 500, type: 'text/plain' }
      ]

      const result = validateFileUpload(problematicFiles)
      
      expect(result.suggestions).toContain('Avoid uploading node_modules directory')
      expect(result.suggestions).toContain('Exclude .git directory from uploads')
    })
  })

  describe('validateApplicationDescription', () => {
    it('should accept valid descriptions', () => {
      const validDescriptions = [
        'React e-commerce application with shopping cart and user authentication',
        'Node.js REST API with MongoDB database for a blog platform',
        'Vue.js dashboard for analytics with real-time data updates'
      ]

      validDescriptions.forEach(description => {
        const result = validateApplicationDescription(description)
        expect(result.isValid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })
    })

    it('should reject descriptions that are too short', () => {
      const shortDescriptions = [
        'React app',
        'API',
        'Website'
      ]

      shortDescriptions.forEach(description => {
        const result = validateApplicationDescription(description)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            type: 'DESCRIPTION_TOO_SHORT',
            minLength: 20
          })
        )
      })
    })

    it('should reject descriptions that are too long', () => {
      const longDescription = 'A'.repeat(1001) // 1001 characters

      const result = validateApplicationDescription(longDescription)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          type: 'DESCRIPTION_TOO_LONG',
          maxLength: 1000
        })
      )
    })

    it('should detect and flag potentially malicious content', () => {
      const maliciousDescriptions = [
        'My app <script>alert("xss")</script>',
        'Application with javascript:void(0)',
        'App that uses eval() and document.write()'
      ]

      maliciousDescriptions.forEach(description => {
        const result = validateApplicationDescription(description)
        expect(result.warnings).toContainEqual(
          expect.objectContaining({
            type: 'POTENTIALLY_UNSAFE_CONTENT'
          })
        )
      })
    })

    it('should provide suggestions for improving descriptions', () => {
      const vague = 'My application'
      
      const result = validateApplicationDescription(vague)
      
      expect(result.suggestions).toContain('Include the technology stack (React, Node.js, etc.)')
      expect(result.suggestions).toContain('Describe the main features or purpose')
      expect(result.suggestions).toContain('Mention any special requirements (database, auth, etc.)')
    })
  })

  describe('validateAnalysisInput', () => {
    it('should require either files or description', () => {
      const emptyInput = {
        files: [],
        description: ''
      }

      const result = validateAnalysisInput(emptyInput)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          type: 'NO_INPUT_PROVIDED'
        })
      )
    })

    it('should accept valid input with files only', () => {
      const input = {
        files: [
          { name: 'package.json', content: '{"dependencies": {"react": "^18.0.0"}}' }
        ],
        description: ''
      }

      const result = validateAnalysisInput(input)
      
      expect(result.isValid).toBe(true)
    })

    it('should accept valid input with description only', () => {
      const input = {
        files: [],
        description: 'React application with user authentication and shopping cart functionality'
      }

      const result = validateAnalysisInput(input)
      
      expect(result.isValid).toBe(true)
    })

    it('should validate file contents for key files', () => {
      const input = {
        files: [
          { name: 'package.json', content: 'invalid json content' }
        ],
        description: ''
      }

      const result = validateAnalysisInput(input)
      
      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          type: 'INVALID_JSON',
          file: 'package.json'
        })
      )
    })
  })

  describe('validateArchitectureSelection', () => {
    it('should accept valid architecture selection', () => {
      const selection = {
        architectureId: 'static-spa',
        preferences: {
          costPriority: 'high',
          complexityTolerance: 'low',
          performanceRequirements: 'medium'
        },
        customizations: {
          region: 'us-east-1',
          environment: 'production'
        }
      }

      const result = validateArchitectureSelection(selection)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject invalid architecture IDs', () => {
      const selection = {
        architectureId: 'invalid-architecture',
        preferences: {}
      }

      const result = validateArchitectureSelection(selection)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          type: 'INVALID_ARCHITECTURE_ID'
        })
      )
    })

    it('should validate preference values', () => {
      const selection = {
        architectureId: 'static-spa',
        preferences: {
          costPriority: 'invalid-value',
          complexityTolerance: 'also-invalid'
        }
      }

      const result = validateArchitectureSelection(selection)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(2)
    })

    it('should validate AWS regions', () => {
      const selection = {
        architectureId: 'static-spa',
        customizations: {
          region: 'invalid-region'
        }
      }

      const result = validateArchitectureSelection(selection)
      
      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          type: 'INVALID_REGION'
        })
      )
    })
  })

  describe('sanitizeUserInput', () => {
    it('should remove potentially dangerous HTML tags', () => {
      const maliciousInput = 'Hello <script>alert("xss")</script> World'
      
      const sanitized = sanitizeUserInput(maliciousInput)
      
      expect(sanitized).toBe('Hello  World')
      expect(sanitized).not.toContain('<script>')
    })

    it('should preserve safe formatting', () => {
      const safeInput = 'My **React** application with _authentication_'
      
      const sanitized = sanitizeUserInput(safeInput)
      
      expect(sanitized).toBe(safeInput)
    })

    it('should handle SQL injection attempts', () => {
      const sqlInjection = "'; DROP TABLE users; --"
      
      const sanitized = sanitizeUserInput(sqlInjection)
      
      expect(sanitized).not.toContain('DROP TABLE')
      expect(sanitized).not.toContain('--')
    })

    it('should normalize whitespace', () => {
      const messyInput = '  Multiple   spaces\n\nand\t\ttabs  '
      
      const sanitized = sanitizeUserInput(messyInput)
      
      expect(sanitized).toBe('Multiple spaces and tabs')
    })

    it('should handle empty and null inputs', () => {
      expect(sanitizeUserInput('')).toBe('')
      expect(sanitizeUserInput(null)).toBe('')
      expect(sanitizeUserInput(undefined)).toBe('')
    })
  })

  describe('Performance Requirements', () => {
    it('should validate large files quickly', () => {
      const largeFileList = Array.from({ length: 100 }, (_, i) => ({
        name: `file${i}.js`,
        size: 1024,
        type: 'text/javascript'
      }))

      const startTime = performance.now()
      validateFileUpload(largeFileList)
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(100) // Should complete in under 100ms
    })

    it('should validate long descriptions quickly', () => {
      const longDescription = 'A'.repeat(10000)

      const startTime = performance.now()
      validateApplicationDescription(longDescription)
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(50) // Should complete in under 50ms
    })
  })
})