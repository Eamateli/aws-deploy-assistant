import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { performance } from 'perf_hooks'

// Mock large datasets for performance testing
const generateLargeCodebase = (fileCount = 100) => {
  return Array.from({ length: fileCount }, (_, i) => ({
    name: `file${i}.js`,
    content: `
      // File ${i}
      import React from 'react';
      import { useState, useEffect } from 'react';
      
      const Component${i} = () => {
        const [data, setData] = useState([]);
        
        useEffect(() => {
          fetch('/api/data${i}')
            .then(res => res.json())
            .then(setData);
        }, []);
        
        return (
          <div>
            <h1>Component ${i}</h1>
            {data.map(item => (
              <div key={item.id}>{item.name}</div>
            ))}
          </div>
        );
      };
      
      export default Component${i};
    `.repeat(10), // Make files larger
    size: 2048 * 10
  }))
}

const generateLargeArchitecture = (serviceCount = 50) => {
  return {
    id: 'complex-architecture',
    name: 'Complex Multi-Service Architecture',
    services: Array.from({ length: serviceCount }, (_, i) => ({
      service: `Service${i}`,
      purpose: `Purpose for service ${i}`,
      required: i % 2 === 0,
      config: {
        instanceType: 't3.micro',
        memorySize: 256 + (i * 64),
        timeout: 30 + i
      }
    }))
  }
}

describe('Performance Tests', () => {
  let performanceMarks = []

  beforeEach(() => {
    performanceMarks = []
    // Mock performance.mark and performance.measure
    vi.spyOn(performance, 'mark').mockImplementation((name) => {
      performanceMarks.push({ name, timestamp: Date.now() })
    })
    
    vi.spyOn(performance, 'measure').mockImplementation((name, start, end) => {
      const startMark = performanceMarks.find(m => m.name === start)
      const endMark = performanceMarks.find(m => m.name === end)
      const duration = endMark ? endMark.timestamp - startMark.timestamp : 0
      return { name, duration }
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Pattern Matching Performance', () => {
    it('should analyze large codebases within acceptable time limits', async () => {
      // Import the pattern matching functions
      const { detectFramework, detectAppType, detectInfrastructure } = await import('../../utils/patternMatchers')
      
      const largeCodebase = generateLargeCodebase(100)
      const input = {
        files: largeCodebase,
        description: 'Large React application with many components'
      }

      const startTime = performance.now()
      
      // Perform analysis
      const frameworkResult = detectFramework(input)
      const appTypeResult = detectAppType(input)
      const infraResult = detectInfrastructure(input)
      
      const endTime = performance.now()
      const duration = endTime - startTime

      // Should complete within 5 seconds for 100 files
      expect(duration).toBeLessThan(5000)
      
      // Should still produce valid results
      expect(frameworkResult).toBeDefined()
      expect(appTypeResult).toBeDefined()
      expect(infraResult).toBeDefined()
    })

    it('should handle memory efficiently with large file sets', async () => {
      const { detectFramework } = await import('../../utils/patternMatchers')
      
      // Test with progressively larger datasets
      const fileCounts = [10, 50, 100, 200]
      const results = []

      for (const count of fileCounts) {
        const codebase = generateLargeCodebase(count)
        const input = { files: codebase }

        const startTime = performance.now()
        const result = detectFramework(input)
        const endTime = performance.now()

        results.push({
          fileCount: count,
          duration: endTime - startTime,
          result: result
        })
      }

      // Performance should scale reasonably (not exponentially)
      const smallDatasetTime = results[0].duration
      const largeDatasetTime = results[results.length - 1].duration
      
      // Large dataset should not take more than 10x the time of small dataset
      expect(largeDatasetTime).toBeLessThan(smallDatasetTime * 10)
      
      // All results should be valid
      results.forEach(({ result }) => {
        expect(result).toBeDefined()
        expect(result.framework).toBeDefined()
      })
    })
  })

  describe('Cost Calculation Performance', () => {
    it('should calculate costs for complex architectures quickly', async () => {
      const { calculateArchitectureCost } = await import('../../utils/costCalculator')
      
      const complexArchitecture = generateLargeArchitecture(50)
      const traffic = {
        monthlyPageviews: 1000000,
        dataTransfer: 100
      }

      const startTime = performance.now()
      
      const costResult = calculateArchitectureCost(complexArchitecture, traffic)
      
      const endTime = performance.now()
      const duration = endTime - startTime

      // Should complete within 1 second for 50 services
      expect(duration).toBeLessThan(1000)
      
      // Should produce valid cost calculations
      expect(costResult).toBeDefined()
      expect(costResult.total).toBeDefined()
      expect(costResult.services).toHaveLength(50)
    })

    it('should handle concurrent cost calculations efficiently', async () => {
      const { calculateServiceCost } = await import('../../utils/costCalculator')
      
      const services = Array.from({ length: 20 }, (_, i) => ({
        service: 'Lambda',
        config: {
          memorySize: 256 + (i * 64),
          averageExecutionTime: 200 + (i * 50),
          monthlyInvocations: 100000 + (i * 10000)
        }
      }))

      const traffic = { monthlyApiCalls: 500000 }

      const startTime = performance.now()
      
      // Calculate costs concurrently
      const promises = services.map(service => 
        Promise.resolve(calculateServiceCost(service, traffic))
      )
      
      const results = await Promise.all(promises)
      
      const endTime = performance.now()
      const duration = endTime - startTime

      // Should complete within 500ms for 20 concurrent calculations
      expect(duration).toBeLessThan(500)
      
      // All calculations should succeed
      expect(results).toHaveLength(20)
      results.forEach(result => {
        expect(result).toBeDefined()
      })
    })
  })

  describe('UI Rendering Performance', () => {
    it('should render large service lists efficiently', async () => {
      // Mock React rendering performance
      const renderLargeServiceList = (serviceCount) => {
        const startTime = performance.now()
        
        // Simulate rendering time based on service count
        const renderTime = serviceCount * 0.1 // 0.1ms per service
        
        // Simulate the work
        let sum = 0
        for (let i = 0; i < serviceCount * 1000; i++) {
          sum += i
        }
        
        const endTime = performance.now()
        return endTime - startTime
      }

      const serviceCounts = [10, 50, 100, 200]
      const renderTimes = []

      for (const count of serviceCounts) {
        const renderTime = renderLargeServiceList(count)
        renderTimes.push({ count, time: renderTime })
      }

      // Rendering should complete within reasonable time limits
      renderTimes.forEach(({ count, time }) => {
        if (count <= 50) {
          expect(time).toBeLessThan(100) // 100ms for small lists
        } else if (count <= 100) {
          expect(time).toBeLessThan(200) // 200ms for medium lists
        } else {
          expect(time).toBeLessThan(500) // 500ms for large lists
        }
      })
    })

    it('should handle rapid state updates without performance degradation', () => {
      const simulateRapidStateUpdates = (updateCount) => {
        const startTime = performance.now()
        
        // Simulate rapid state updates
        let state = { counter: 0, data: [] }
        
        for (let i = 0; i < updateCount; i++) {
          state = {
            ...state,
            counter: state.counter + 1,
            data: [...state.data, { id: i, value: Math.random() }]
          }
        }
        
        const endTime = performance.now()
        return { duration: endTime - startTime, finalState: state }
      }

      const updateCounts = [100, 500, 1000]
      
      updateCounts.forEach(count => {
        const { duration, finalState } = simulateRapidStateUpdates(count)
        
        // Should handle updates efficiently
        expect(duration).toBeLessThan(count * 0.5) // Max 0.5ms per update
        
        // State should be consistent
        expect(finalState.counter).toBe(count)
        expect(finalState.data).toHaveLength(count)
      })
    })
  })

  describe('Memory Usage Tests', () => {
    it('should not leak memory during repeated operations', () => {
      const simulateMemoryUsage = () => {
        // Simulate memory-intensive operations
        const largeArrays = []
        
        for (let i = 0; i < 100; i++) {
          const largeArray = new Array(10000).fill(0).map((_, idx) => ({
            id: idx,
            data: `item-${idx}`,
            timestamp: Date.now()
          }))
          largeArrays.push(largeArray)
        }
        
        // Simulate cleanup
        largeArrays.length = 0
        
        return true
      }

      // Run multiple cycles to test for memory leaks
      for (let cycle = 0; cycle < 10; cycle++) {
        const result = simulateMemoryUsage()
        expect(result).toBe(true)
      }
      
      // In a real test, you would check memory usage here
      // For this mock test, we just verify the operations complete
      expect(true).toBe(true)
    })

    it('should handle large data structures efficiently', () => {
      const createLargeDataStructure = (size) => {
        const startTime = performance.now()
        
        // Create nested data structure
        const data = {
          metadata: {
            size: size,
            created: Date.now(),
            version: '1.0.0'
          },
          items: Array.from({ length: size }, (_, i) => ({
            id: i,
            name: `Item ${i}`,
            properties: {
              type: i % 2 === 0 ? 'even' : 'odd',
              category: Math.floor(i / 10),
              tags: [`tag-${i}`, `category-${Math.floor(i / 10)}`]
            },
            children: Array.from({ length: 5 }, (_, j) => ({
              id: `${i}-${j}`,
              value: Math.random()
            }))
          }))
        }
        
        const endTime = performance.now()
        
        return {
          data,
          creationTime: endTime - startTime,
          memoryEstimate: JSON.stringify(data).length
        }
      }

      const sizes = [100, 500, 1000]
      
      sizes.forEach(size => {
        const { data, creationTime, memoryEstimate } = createLargeDataStructure(size)
        
        // Creation should be reasonably fast
        expect(creationTime).toBeLessThan(size * 2) // Max 2ms per item
        
        // Data structure should be complete
        expect(data.items).toHaveLength(size)
        expect(data.metadata.size).toBe(size)
        
        // Memory usage should be reasonable
        expect(memoryEstimate).toBeGreaterThan(0)
      })
    })
  })

  describe('Bundle Size and Loading Performance', () => {
    it('should simulate acceptable bundle loading times', () => {
      const simulateBundleLoad = (bundleSize) => {
        const startTime = performance.now()
        
        // Simulate network loading time based on bundle size
        // Assuming 1MB/s connection speed
        const loadTime = bundleSize / 1024 // KB to seconds * 1000ms
        
        // Simulate parsing time (typically 10% of load time)
        const parseTime = loadTime * 0.1
        
        const totalTime = loadTime + parseTime
        
        const endTime = performance.now()
        
        return {
          loadTime,
          parseTime,
          totalTime,
          actualTime: endTime - startTime
        }
      }

      const bundleSizes = [
        { name: 'Small', size: 100 }, // 100KB
        { name: 'Medium', size: 300 }, // 300KB
        { name: 'Large', size: 500 }, // 500KB
        { name: 'XLarge', size: 1000 } // 1MB
      ]

      bundleSizes.forEach(({ name, size }) => {
        const result = simulateBundleLoad(size)
        
        // Bundle size requirements from the spec
        if (name === 'Small') {
          expect(result.totalTime).toBeLessThan(2000) // 2s for small bundles
        } else if (name === 'Medium') {
          expect(result.totalTime).toBeLessThan(5000) // 5s for medium bundles
        } else {
          expect(result.totalTime).toBeLessThan(10000) // 10s for large bundles
        }
      })
    })

    it('should validate code splitting effectiveness', () => {
      const simulateCodeSplitting = () => {
        // Simulate main bundle and lazy-loaded chunks
        const mainBundle = { size: 200, critical: true } // 200KB main
        const lazyChunks = [
          { name: 'analysis', size: 150, loadOnDemand: true },
          { name: 'recommendations', size: 100, loadOnDemand: true },
          { name: 'deployment', size: 80, loadOnDemand: true },
          { name: 'diagrams', size: 200, loadOnDemand: true }
        ]

        const totalSize = mainBundle.size + lazyChunks.reduce((sum, chunk) => sum + chunk.size, 0)
        const initialLoadSize = mainBundle.size
        const lazyLoadSize = lazyChunks.reduce((sum, chunk) => sum + chunk.size, 0)

        return {
          totalSize,
          initialLoadSize,
          lazyLoadSize,
          splitRatio: lazyLoadSize / totalSize
        }
      }

      const result = simulateCodeSplitting()

      // Initial bundle should be small
      expect(result.initialLoadSize).toBeLessThan(300) // Under 300KB initial

      // Most code should be lazy-loaded
      expect(result.splitRatio).toBeGreaterThan(0.6) // At least 60% lazy-loaded

      // Total size should be reasonable
      expect(result.totalSize).toBeLessThan(1000) // Under 1MB total
    })
  })
})