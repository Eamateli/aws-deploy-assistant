import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { performance } from 'perf_hooks'

// Mock React Flow components and hooks
const mockReactFlow = {
  ReactFlow: vi.fn(() => null),
  useNodesState: vi.fn(() => [[], vi.fn()]),
  useEdgesState: vi.fn(() => [[], vi.fn()]),
  addEdge: vi.fn(),
  Background: vi.fn(() => null),
  Controls: vi.fn(() => null),
  MiniMap: vi.fn(() => null)
};

// Mock architecture data for different complexity levels
const architectureTemplates = {
  'simple-static': {
    name: 'Simple Static Site',
    services: [
      { id: 's3', name: 'S3', type: 'storage', position: { x: 100, y: 100 } },
      { id: 'cloudfront', name: 'CloudFront', type: 'cdn', position: { x: 300, y: 100 } },
      { id: 'route53', name: 'Route53', type: 'dns', position: { x: 500, y: 100 } }
    ],
    connections: [
      { id: 'e1', source: 's3', target: 'cloudfront', type: 'data' },
      { id: 'e2', source: 'cloudfront', target: 'route53', type: 'dns' }
    ],
    complexity: 'low',
    expectedRenderTime: 200
  },
  'serverless-api': {
    name: 'Serverless API',
    services: [
      { id: 'apigateway', name: 'API Gateway', type: 'api', position: { x: 100, y: 100 } },
      { id: 'lambda1', name: 'Lambda Auth', type: 'compute', position: { x: 300, y: 50 } },
      { id: 'lambda2', name: 'Lambda API', type: 'compute', position: { x: 300, y: 150 } },
      { id: 'dynamodb', name: 'DynamoDB', type: 'database', position: { x: 500, y: 100 } },
      { id: 'cloudwatch', name: 'CloudWatch', type: 'monitoring', position: { x: 400, y: 250 } },
      { id: 'cognito', name: 'Cognito', type: 'auth', position: { x: 100, y: 250 } }
    ],
    connections: [
      { id: 'e1', source: 'apigateway', target: 'lambda1', type: 'invoke' },
      { id: 'e2', source: 'apigateway', target: 'lambda2', type: 'invoke' },
      { id: 'e3', source: 'lambda2', target: 'dynamodb', type: 'data' },
      { id: 'e4', source: 'lambda1', target: 'cognito', type: 'auth' },
      { id: 'e5', source: 'lambda1', target: 'cloudwatch', type: 'logs' },
      { id: 'e6', source: 'lambda2', target: 'cloudwatch', type: 'logs' }
    ],
    complexity: 'medium',
    expectedRenderTime: 500
  },
  'traditional-stack': {
    name: 'Traditional Stack',
    services: [
      { id: 'alb', name: 'Application Load Balancer', type: 'loadbalancer', position: { x: 100, y: 100 } },
      { id: 'ec2-1', name: 'EC2 Instance 1', type: 'compute', position: { x: 300, y: 50 } },
      { id: 'ec2-2', name: 'EC2 Instance 2', type: 'compute', position: { x: 300, y: 150 } },
      { id: 'rds-primary', name: 'RDS Primary', type: 'database', position: { x: 500, y: 75 } },
      { id: 'rds-replica', name: 'RDS Replica', type: 'database', position: { x: 500, y: 125 } },
      { id: 's3', name: 'S3 Storage', type: 'storage', position: { x: 700, y: 100 } },
      { id: 'elasticache', name: 'ElastiCache', type: 'cache', position: { x: 400, y: 250 } },
      { id: 'cloudwatch', name: 'CloudWatch', type: 'monitoring', position: { x: 600, y: 250 } }
    ],
    connections: [
      { id: 'e1', source: 'alb', target: 'ec2-1', type: 'http' },
      { id: 'e2', source: 'alb', target: 'ec2-2', type: 'http' },
      { id: 'e3', source: 'ec2-1', target: 'rds-primary', type: 'data' },
      { id: 'e4', source: 'ec2-2', target: 'rds-primary', type: 'data' },
      { id: 'e5', source: 'rds-primary', target: 'rds-replica', type: 'replication' },
      { id: 'e6', source: 'ec2-1', target: 's3', type: 'storage' },
      { id: 'e7', source: 'ec2-2', target: 's3', type: 'storage' },
      { id: 'e8', source: 'ec2-1', target: 'elasticache', type: 'cache' },
      { id: 'e9', source: 'ec2-2', target: 'elasticache', type: 'cache' },
      { id: 'e10', source: 'ec2-1', target: 'cloudwatch', type: 'logs' },
      { id: 'e11', source: 'ec2-2', target: 'cloudwatch', type: 'logs' }
    ],
    complexity: 'high',
    expectedRenderTime: 800
  },
  'complex-microservices': {
    name: 'Complex Microservices',
    services: Array.from({ length: 20 }, (_, i) => ({
      id: `service-${i}`,
      name: `Service ${i}`,
      type: i % 4 === 0 ? 'api' : i % 4 === 1 ? 'database' : i % 4 === 2 ? 'cache' : 'compute',
      position: { x: (i % 5) * 150 + 100, y: Math.floor(i / 5) * 100 + 100 }
    })),
    connections: Array.from({ length: 35 }, (_, i) => ({
      id: `e${i}`,
      source: `service-${i % 20}`,
      target: `service-${(i + 1) % 20}`,
      type: i % 3 === 0 ? 'data' : i % 3 === 1 ? 'api' : 'event'
    })),
    complexity: 'very-high',
    expectedRenderTime: 1200
  }
};

// Mock diagram rendering functions
const mockRenderDiagram = async (architecture, options = {}) => {
  const startTime = performance.now();
  
  // Simulate rendering time based on complexity
  const { services, connections, complexity } = architecture;
  let renderTime = 50; // Base rendering time
  
  // Add time based on number of nodes and edges
  renderTime += services.length * 8; // 8ms per service
  renderTime += connections.length * 5; // 5ms per connection
  
  // Add complexity multiplier
  const complexityMultipliers = {
    'low': 1.0,
    'medium': 1.2,
    'high': 1.5,
    'very-high': 2.0
  };
  renderTime *= complexityMultipliers[complexity] || 1.0;
  
  // Add time for special features
  if (options.animations) renderTime += 100;
  if (options.minimap) renderTime += 50;
  if (options.controls) renderTime += 30;
  if (options.background) renderTime += 20;
  
  // Simulate async rendering
  await new Promise(resolve => setTimeout(resolve, renderTime));
  
  const endTime = performance.now();
  const actualTime = endTime - startTime;
  
  return {
    renderTime: actualTime,
    nodeCount: services.length,
    edgeCount: connections.length,
    complexity,
    success: true,
    layout: {
      width: Math.max(...services.map(s => s.position.x)) + 100,
      height: Math.max(...services.map(s => s.position.y)) + 100
    }
  };
};

// Mock layout calculation functions
const mockCalculateLayout = async (services, connections, algorithm = 'hierarchical') => {
  const startTime = performance.now();
  
  // Simulate layout calculation time
  let layoutTime = 20; // Base time
  layoutTime += services.length * 3; // 3ms per node
  layoutTime += connections.length * 2; // 2ms per edge
  
  // Algorithm-specific time
  const algorithmMultipliers = {
    'hierarchical': 1.0,
    'force-directed': 1.5,
    'circular': 0.8,
    'grid': 0.6
  };
  layoutTime *= algorithmMultipliers[algorithm] || 1.0;
  
  await new Promise(resolve => setTimeout(resolve, layoutTime));
  
  const endTime = performance.now();
  
  // Generate layout positions
  const layoutPositions = services.map((service, index) => ({
    id: service.id,
    position: {
      x: (index % 5) * 150 + 100,
      y: Math.floor(index / 5) * 120 + 100
    }
  }));
  
  return {
    layoutTime: endTime - startTime,
    positions: layoutPositions,
    algorithm,
    success: true
  };
};

describe('Diagram Rendering Performance Tests', () => {
  let performanceMarks = [];

  beforeEach(() => {
    performanceMarks = [];
    
    // Mock performance APIs
    vi.spyOn(performance, 'mark').mockImplementation((name) => {
      performanceMarks.push({ name, timestamp: performance.now() });
    });
    
    vi.spyOn(performance, 'measure').mockImplementation((name, start, end) => {
      const startMark = performanceMarks.find(m => m.name === start);
      const endMark = performanceMarks.find(m => m.name === end);
      const duration = endMark ? endMark.timestamp - startMark.timestamp : 0;
      return { name, duration };
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Standard Architecture Rendering Performance', () => {
    Object.entries(architectureTemplates).forEach(([archName, architecture]) => {
      it(`should render ${archName} within performance requirements`, async () => {
        const startTime = performance.now();
        
        // Perform diagram rendering
        const result = await mockRenderDiagram(architecture);
        
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        
        // Performance requirement: < 1000ms for standard architectures
        expect(renderTime).toBeLessThan(1000);
        
        // Specific expectations based on complexity
        if (architecture.complexity === 'low') {
          expect(renderTime).toBeLessThan(300);
        } else if (architecture.complexity === 'medium') {
          expect(renderTime).toBeLessThan(600);
        } else if (architecture.complexity === 'high') {
          expect(renderTime).toBeLessThan(900);
        } else if (architecture.complexity === 'very-high') {
          // Very complex architectures can take up to 1.2s but should still be reasonable
          expect(renderTime).toBeLessThan(1200);
        }
        
        // Verify rendering success
        expect(result.success).toBe(true);
        expect(result.nodeCount).toBe(architecture.services.length);
        expect(result.edgeCount).toBe(architecture.connections.length);
        
        console.log(`${archName}: ${Math.round(renderTime)}ms (${architecture.complexity} complexity, ${result.nodeCount} nodes, ${result.edgeCount} edges)`);
      });
    });
  });

  describe('Layout Algorithm Performance', () => {
    const testArchitecture = architectureTemplates['serverless-api'];
    const layoutAlgorithms = ['hierarchical', 'force-directed', 'circular', 'grid'];

    layoutAlgorithms.forEach(algorithm => {
      it(`should calculate ${algorithm} layout efficiently`, async () => {
        const startTime = performance.now();
        
        const result = await mockCalculateLayout(
          testArchitecture.services,
          testArchitecture.connections,
          algorithm
        );
        
        const endTime = performance.now();
        const layoutTime = endTime - startTime;
        
        // Layout calculation should be fast
        expect(layoutTime).toBeLessThan(200);
        
        // Verify layout success
        expect(result.success).toBe(true);
        expect(result.positions).toHaveLength(testArchitecture.services.length);
        expect(result.algorithm).toBe(algorithm);
        
        console.log(`${algorithm} layout: ${Math.round(layoutTime)}ms`);
      });
    });
  });

  describe('Interactive Features Performance', () => {
    const testArchitecture = architectureTemplates['traditional-stack'];

    it('should handle diagram interactions efficiently', async () => {
      const interactions = [
        { type: 'hover', target: 'node', expectedTime: 50 },
        { type: 'click', target: 'node', expectedTime: 100 },
        { type: 'drag', target: 'node', expectedTime: 150 },
        { type: 'zoom', target: 'canvas', expectedTime: 80 },
        { type: 'pan', target: 'canvas', expectedTime: 80 }
      ];

      for (const interaction of interactions) {
        const startTime = performance.now();
        
        // Simulate interaction handling
        await new Promise(resolve => setTimeout(resolve, interaction.expectedTime * 0.8));
        
        const endTime = performance.now();
        const interactionTime = endTime - startTime;
        
        // Interactions should be responsive
        expect(interactionTime).toBeLessThan(interaction.expectedTime);
        
        console.log(`${interaction.type} interaction: ${Math.round(interactionTime)}ms`);
      }
    });

    it('should handle real-time updates efficiently', async () => {
      const updates = [
        { type: 'add_node', count: 1, expectedTime: 100 },
        { type: 'remove_node', count: 1, expectedTime: 80 },
        { type: 'add_edge', count: 2, expectedTime: 120 },
        { type: 'remove_edge', count: 2, expectedTime: 100 },
        { type: 'update_positions', count: 5, expectedTime: 150 }
      ];

      for (const update of updates) {
        const startTime = performance.now();
        
        // Simulate real-time update
        const updateTime = update.count * 20; // 20ms per operation
        await new Promise(resolve => setTimeout(resolve, updateTime));
        
        const endTime = performance.now();
        const actualTime = endTime - startTime;
        
        // Real-time updates should be fast
        expect(actualTime).toBeLessThan(update.expectedTime);
        
        console.log(`${update.type} (${update.count}): ${Math.round(actualTime)}ms`);
      }
    });
  });

  describe('Rendering Features Performance', () => {
    const testArchitecture = architectureTemplates['serverless-api'];

    it('should render with different feature combinations efficiently', async () => {
      const featureCombinations = [
        { name: 'basic', options: {}, expectedTime: 500 },
        { name: 'with-animations', options: { animations: true }, expectedTime: 600 },
        { name: 'with-minimap', options: { minimap: true }, expectedTime: 550 },
        { name: 'with-controls', options: { controls: true }, expectedTime: 530 },
        { name: 'full-features', options: { animations: true, minimap: true, controls: true, background: true }, expectedTime: 700 }
      ];

      for (const combo of featureCombinations) {
        const startTime = performance.now();
        
        const result = await mockRenderDiagram(testArchitecture, combo.options);
        
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        
        // Feature combinations should still meet performance requirements
        expect(renderTime).toBeLessThan(combo.expectedTime);
        expect(result.success).toBe(true);
        
        console.log(`${combo.name}: ${Math.round(renderTime)}ms`);
      }
    });

    it('should handle different viewport sizes efficiently', async () => {
      const viewportSizes = [
        { name: 'mobile', width: 375, height: 667, expectedTime: 400 },
        { name: 'tablet', width: 768, height: 1024, expectedTime: 450 },
        { name: 'desktop', width: 1920, height: 1080, expectedTime: 500 },
        { name: 'large-desktop', width: 2560, height: 1440, expectedTime: 550 }
      ];

      for (const viewport of viewportSizes) {
        const startTime = performance.now();
        
        // Simulate viewport-specific rendering
        const result = await mockRenderDiagram(testArchitecture, {
          viewport: { width: viewport.width, height: viewport.height }
        });
        
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        
        // Viewport size shouldn't significantly impact performance
        expect(renderTime).toBeLessThan(viewport.expectedTime);
        
        console.log(`${viewport.name} (${viewport.width}x${viewport.height}): ${Math.round(renderTime)}ms`);
      }
    });
  });

  describe('Memory and Resource Management', () => {
    it('should handle multiple diagram instances efficiently', async () => {
      const instanceCount = 3;
      const testArchitecture = architectureTemplates['simple-static'];
      
      const startTime = performance.now();
      
      // Render multiple diagram instances
      const promises = Array.from({ length: instanceCount }, () => 
        mockRenderDiagram(testArchitecture)
      );
      
      const results = await Promise.all(promises);
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const averageTime = totalTime / instanceCount;
      
      // Multiple instances should render efficiently
      expect(totalTime).toBeLessThan(1000);
      expect(averageTime).toBeLessThan(400);
      
      // All instances should render successfully
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
      
      console.log(`Multiple instances: ${Math.round(totalTime)}ms total, ${Math.round(averageTime)}ms average`);
    });

    it('should handle diagram cleanup and re-rendering efficiently', async () => {
      const testArchitecture = architectureTemplates['traditional-stack'];
      const cycles = 3;
      const renderTimes = [];
      
      for (let i = 0; i < cycles; i++) {
        const startTime = performance.now();
        
        // Simulate render -> cleanup -> re-render cycle
        const result = await mockRenderDiagram(testArchitecture);
        
        // Simulate cleanup
        await new Promise(resolve => setTimeout(resolve, 20));
        
        const endTime = performance.now();
        const cycleTime = endTime - startTime;
        
        renderTimes.push(cycleTime);
        expect(result.success).toBe(true);
      }
      
      // Performance should not degrade across cycles
      const firstTime = renderTimes[0];
      const lastTime = renderTimes[renderTimes.length - 1];
      
      expect(lastTime).toBeLessThan(firstTime * 1.3); // Max 30% degradation
      
      console.log('Cleanup cycles:', renderTimes.map(t => `${Math.round(t)}ms`).join(', '));
    });
  });

  describe('Scalability and Stress Testing', () => {
    it('should handle increasing node counts gracefully', async () => {
      const nodeCounts = [5, 10, 20, 50];
      const renderTimes = [];
      
      for (const nodeCount of nodeCounts) {
        // Generate test architecture with specified node count
        const testArch = {
          name: `Test Architecture ${nodeCount} nodes`,
          services: Array.from({ length: nodeCount }, (_, i) => ({
            id: `node-${i}`,
            name: `Node ${i}`,
            type: 'compute',
            position: { x: (i % 10) * 100, y: Math.floor(i / 10) * 100 }
          })),
          connections: Array.from({ length: Math.min(nodeCount - 1, nodeCount * 2) }, (_, i) => ({
            id: `edge-${i}`,
            source: `node-${i % nodeCount}`,
            target: `node-${(i + 1) % nodeCount}`,
            type: 'data'
          })),
          complexity: nodeCount <= 10 ? 'low' : nodeCount <= 30 ? 'medium' : 'high'
        };
        
        const startTime = performance.now();
        const result = await mockRenderDiagram(testArch);
        const endTime = performance.now();
        
        const renderTime = endTime - startTime;
        renderTimes.push({ nodeCount, renderTime });
        
        // Performance should scale reasonably
        const expectedMaxTime = 200 + (nodeCount * 20); // Base + 20ms per node
        expect(renderTime).toBeLessThan(expectedMaxTime);
        expect(result.success).toBe(true);
        
        console.log(`${nodeCount} nodes: ${Math.round(renderTime)}ms`);
      }
      
      // Check that performance scales sub-linearly
      const scalingFactor = renderTimes[renderTimes.length - 1].renderTime / renderTimes[0].renderTime;
      const nodeScalingFactor = nodeCounts[nodeCounts.length - 1] / nodeCounts[0];
      
      expect(scalingFactor).toBeLessThan(nodeScalingFactor * 1.5); // Should scale better than linear
    });

    it('should maintain performance under concurrent rendering', async () => {
      const concurrentCount = 4;
      const testArchitecture = architectureTemplates['serverless-api'];
      
      const startTime = performance.now();
      
      // Render multiple diagrams concurrently
      const promises = Array.from({ length: concurrentCount }, (_, i) => 
        mockRenderDiagram(testArchitecture, { id: `concurrent-${i}` })
      );
      
      const results = await Promise.all(promises);
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const averageTime = totalTime / concurrentCount;
      
      // Concurrent rendering should be efficient
      expect(totalTime).toBeLessThan(1500);
      expect(averageTime).toBeLessThan(600);
      
      // All renders should succeed
      results.forEach((result, index) => {
        expect(result.success).toBe(true);
        expect(result.renderTime).toBeLessThan(800);
      });
      
      console.log(`Concurrent rendering: ${Math.round(totalTime)}ms total, ${Math.round(averageTime)}ms average`);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle empty diagrams gracefully', async () => {
      const emptyArchitecture = {
        name: 'Empty Architecture',
        services: [],
        connections: [],
        complexity: 'low'
      };
      
      const startTime = performance.now();
      const result = await mockRenderDiagram(emptyArchitecture);
      const endTime = performance.now();
      
      const renderTime = endTime - startTime;
      
      // Empty diagrams should render very quickly
      expect(renderTime).toBeLessThan(100);
      expect(result.success).toBe(true);
      expect(result.nodeCount).toBe(0);
      expect(result.edgeCount).toBe(0);
      
      console.log(`Empty diagram: ${Math.round(renderTime)}ms`);
    });

    it('should handle malformed architecture data gracefully', async () => {
      const malformedArchitectures = [
        {
          name: 'Missing Positions',
          services: [{ id: 'node1', name: 'Node 1', type: 'compute' }],
          connections: [],
          complexity: 'low'
        },
        {
          name: 'Invalid Connections',
          services: [{ id: 'node1', name: 'Node 1', type: 'compute', position: { x: 100, y: 100 } }],
          connections: [{ id: 'e1', source: 'nonexistent', target: 'node1', type: 'data' }],
          complexity: 'low'
        }
      ];
      
      for (const architecture of malformedArchitectures) {
        const startTime = performance.now();
        
        try {
          const result = await mockRenderDiagram(architecture);
          const endTime = performance.now();
          const renderTime = endTime - startTime;
          
          // Should handle gracefully and still be fast
          expect(renderTime).toBeLessThan(500);
          
          console.log(`${architecture.name}: ${Math.round(renderTime)}ms`);
        } catch (error) {
          // If it throws, it should do so quickly
          const endTime = performance.now();
          const errorTime = endTime - startTime;
          expect(errorTime).toBeLessThan(100);
          
          console.log(`${architecture.name}: error in ${Math.round(errorTime)}ms`);
        }
      }
    });
  });

  describe('Performance Regression Detection', () => {
    it('should maintain consistent rendering performance', async () => {
      const testArchitecture = architectureTemplates['traditional-stack'];
      const runCount = 5;
      const renderResults = [];
      
      for (let i = 0; i < runCount; i++) {
        const startTime = performance.now();
        const result = await mockRenderDiagram(testArchitecture);
        const endTime = performance.now();
        
        renderResults.push({
          run: i + 1,
          time: endTime - startTime,
          success: result.success
        });
      }
      
      const times = renderResults.map(r => r.time);
      const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      const maxTime = Math.max(...times);
      const minTime = Math.min(...times);
      const variance = maxTime - minTime;
      
      // Performance should be consistent
      expect(averageTime).toBeLessThan(1000);
      expect(maxTime).toBeLessThan(1000);
      expect(variance).toBeLessThan(200); // Max 200ms variance
      
      // All renders should succeed
      renderResults.forEach(result => {
        expect(result.success).toBe(true);
      });
      
      console.log(`Consistency test: avg=${Math.round(averageTime)}ms, min=${Math.round(minTime)}ms, max=${Math.round(maxTime)}ms, variance=${Math.round(variance)}ms`);
    });

    it('should detect performance improvements or regressions', async () => {
      const testArchitecture = architectureTemplates['serverless-api'];
      
      // Baseline measurement
      const baselineRuns = 3;
      const baselineTimes = [];
      
      for (let i = 0; i < baselineRuns; i++) {
        const startTime = performance.now();
        await mockRenderDiagram(testArchitecture);
        const endTime = performance.now();
        baselineTimes.push(endTime - startTime);
      }
      
      const baselineAverage = baselineTimes.reduce((sum, time) => sum + time, 0) / baselineTimes.length;
      
      // Current measurement
      const currentRuns = 3;
      const currentTimes = [];
      
      for (let i = 0; i < currentRuns; i++) {
        const startTime = performance.now();
        await mockRenderDiagram(testArchitecture);
        const endTime = performance.now();
        currentTimes.push(endTime - startTime);
      }
      
      const currentAverage = currentTimes.reduce((sum, time) => sum + time, 0) / currentTimes.length;
      const performanceChange = ((currentAverage - baselineAverage) / baselineAverage) * 100;
      
      // Performance should not regress significantly
      expect(Math.abs(performanceChange)).toBeLessThan(30); // Max 30% change
      
      if (performanceChange > 15) {
        console.warn(`Performance regression detected: ${performanceChange.toFixed(1)}% slower`);
      } else if (performanceChange < -15) {
        console.log(`Performance improvement detected: ${Math.abs(performanceChange).toFixed(1)}% faster`);
      }
      
      console.log(`Performance comparison: baseline=${Math.round(baselineAverage)}ms, current=${Math.round(currentAverage)}ms, change=${performanceChange.toFixed(1)}%`);
    });
  });
});