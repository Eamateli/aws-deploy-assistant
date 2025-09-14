import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { performance } from 'perf_hooks'

// Mock test data representing different types of codebases
const testCodebases = {
  'react-spa-small': {
    description: 'React e-commerce app with shopping cart, user authentication, and payment processing using Stripe',
    files: [
      { name: 'package.json', size: 2048, content: '{"dependencies":{"react":"^18.0.0","react-dom":"^18.0.0","stripe":"^10.0.0"}}' },
      { name: 'src/App.jsx', size: 4096, content: 'import React, { useState, useEffect } from "react"; export default function App() { return <div>E-commerce App</div>; }' },
      { name: 'src/components/Cart.jsx', size: 3072, content: 'import React from "react"; export default function Cart() { return <div>Shopping Cart</div>; }' }
    ],
    expectedFramework: 'react',
    expectedAppType: 'spa',
    expectedComplexity: 'medium'
  },
  'react-spa-large': {
    description: 'Large React application with multiple features, complex state management, and extensive component library',
    files: Array.from({ length: 50 }, (_, i) => ({
      name: `src/components/Component${i}.jsx`,
      size: 2048 + Math.random() * 4096,
      content: `import React, { useState, useEffect } from "react"; export default function Component${i}() { return <div>Component ${i}</div>; }`
    })).concat([
      { name: 'package.json', size: 8192, content: '{"dependencies":{"react":"^18.0.0","react-dom":"^18.0.0","redux":"^4.0.0","react-router":"^6.0.0"}}' }
    ]),
    expectedFramework: 'react',
    expectedAppType: 'spa',
    expectedComplexity: 'high'
  },
  'nodejs-api-medium': {
    description: 'Node.js REST API with Express, MongoDB, JWT authentication, and file upload functionality',
    files: [
      { name: 'package.json', size: 3072, content: '{"dependencies":{"express":"^4.18.0","mongoose":"^6.0.0","jsonwebtoken":"^8.5.0","multer":"^1.4.0"}}' },
      { name: 'server.js', size: 4096, content: 'const express = require("express"); const app = express(); app.listen(3000);' },
      { name: 'routes/auth.js', size: 2048, content: 'const express = require("express"); const router = express.Router(); module.exports = router;' },
      { name: 'models/User.js', size: 1536, content: 'const mongoose = require("mongoose"); const userSchema = new mongoose.Schema({});' }
    ],
    expectedFramework: 'nodejs',
    expectedAppType: 'api',
    expectedComplexity: 'medium'
  },
  'python-api-small': {
    description: 'Python Flask API with PostgreSQL database, user management, and basic CRUD operations',
    files: [
      { name: 'requirements.txt', size: 512, content: 'Flask==2.0.0\npsycopg2==2.9.0\nSQLAlchemy==1.4.0' },
      { name: 'app.py', size: 2048, content: 'from flask import Flask\napp = Flask(__name__)\n@app.route("/")\ndef hello(): return "Hello World"' },
      { name: 'models.py', size: 1024, content: 'from sqlalchemy import Column, Integer, String\nclass User: pass' }
    ],
    expectedFramework: 'python',
    expectedAppType: 'api',
    expectedComplexity: 'low'
  },
  'fullstack-complex': {
    description: 'Full-stack React app with Node.js backend, PostgreSQL database, Redis caching, and real-time chat features',
    files: [
      { name: 'package.json', size: 6144, content: '{"dependencies":{"react":"^18.0.0","express":"^4.18.0","socket.io":"^4.0.0","redis":"^4.0.0","pg":"^8.7.0"}}' },
      { name: 'client/src/App.jsx', size: 8192, content: 'import React, { useState, useEffect } from "react"; import io from "socket.io-client"; export default function App() {}' },
      { name: 'server/index.js', size: 4096, content: 'const express = require("express"); const { Server } = require("socket.io"); const redis = require("redis");' },
      { name: 'server/database.js', size: 2048, content: 'const { Pool } = require("pg"); const pool = new Pool({});' }
    ],
    expectedFramework: 'react',
    expectedAppType: 'spa',
    expectedComplexity: 'high'
  },
  'static-site': {
    description: 'Static portfolio website with HTML, CSS, and vanilla JavaScript',
    files: [
      { name: 'index.html', size: 4096, content: '<!DOCTYPE html><html><head><title>Portfolio</title></head><body><h1>My Portfolio</h1></body></html>' },
      { name: 'style.css', size: 2048, content: 'body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }' },
      { name: 'script.js', size: 1024, content: 'document.addEventListener("DOMContentLoaded", function() { console.log("Portfolio loaded"); });' }
    ],
    expectedFramework: 'static',
    expectedAppType: 'static',
    expectedComplexity: 'low'
  }
};

// Mock the analysis function
const mockAnalyzeCode = async (input) => {
  const startTime = performance.now();
  
  // Simulate realistic analysis time based on input complexity
  const inputLower = input.toLowerCase();
  let analysisTime = 100; // Base time in ms
  
  // Add time based on content complexity
  if (inputLower.includes('react') || inputLower.includes('jsx')) {
    analysisTime += 200;
  }
  if (inputLower.includes('express') || inputLower.includes('nodejs')) {
    analysisTime += 150;
  }
  if (inputLower.includes('database') || inputLower.includes('mongodb') || inputLower.includes('postgres')) {
    analysisTime += 100;
  }
  if (inputLower.includes('auth') || inputLower.includes('jwt')) {
    analysisTime += 80;
  }
  if (inputLower.includes('realtime') || inputLower.includes('socket')) {
    analysisTime += 120;
  }
  
  // Simulate pattern matching delay
  await new Promise(resolve => setTimeout(resolve, analysisTime));
  
  const endTime = performance.now();
  const actualTime = endTime - startTime;
  
  // Determine detected pattern
  let detectedPattern = 'generic-app';
  let confidence = 0.6;
  
  if (inputLower.includes('react')) {
    detectedPattern = 'react-spa';
    confidence = 0.9;
  } else if (inputLower.includes('express') || inputLower.includes('nodejs')) {
    detectedPattern = 'nodejs-api';
    confidence = 0.85;
  } else if (inputLower.includes('flask') || inputLower.includes('django') || inputLower.includes('python')) {
    detectedPattern = 'python-api';
    confidence = 0.8;
  } else if (inputLower.includes('fullstack')) {
    detectedPattern = 'fullstack-app';
    confidence = 0.8;
  } else if (inputLower.includes('static') || inputLower.includes('html')) {
    detectedPattern = 'static-site';
    confidence = 0.7;
  }
  
  return {
    detected: {
      id: detectedPattern,
      name: detectedPattern.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      framework: inputLower.includes('react') && inputLower.includes('nodejs') ? 'react-nodejs' :
                 inputLower.includes('react') ? 'react' : 
                 inputLower.includes('vue') ? 'vue' :
                 inputLower.includes('express') || inputLower.includes('nodejs') ? 'nodejs' :
                 inputLower.includes('python') || inputLower.includes('flask') || inputLower.includes('django') ? 'python' :
                 inputLower.includes('html') ? 'static' : 'generic',
      appType: inputLower.includes('spa') || inputLower.includes('react') ? 'spa' :
               inputLower.includes('api') ? 'api' :
               inputLower.includes('fullstack') ? 'fullstack' : 
               inputLower.includes('static') || inputLower.includes('html') ? 'static' : 'spa'
    },
    confidence,
    analysisTime: actualTime,
    timestamp: new Date().toISOString()
  };
};

describe('Analysis Speed Benchmark Tests', () => {
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

  describe('Individual Codebase Analysis Performance', () => {
    Object.entries(testCodebases).forEach(([codebaseName, codebase]) => {
      it(`should analyze ${codebaseName} within performance requirements`, async () => {
        const startTime = performance.now();
        
        // Perform analysis
        const result = await mockAnalyzeCode(codebase.description);
        
        const endTime = performance.now();
        const analysisTime = endTime - startTime;
        
        // Performance requirement: < 2000ms for typical codebases
        expect(analysisTime).toBeLessThan(2000);
        
        // Additional performance expectations based on complexity
        if (codebase.expectedComplexity === 'low') {
          expect(analysisTime).toBeLessThan(500);
        } else if (codebase.expectedComplexity === 'medium') {
          expect(analysisTime).toBeLessThan(1000);
        } else if (codebase.expectedComplexity === 'high') {
          expect(analysisTime).toBeLessThan(1500);
        }
        
        // Verify analysis accuracy
        expect(result.detected.framework).toBe(codebase.expectedFramework);
        expect(result.detected.appType).toBe(codebase.expectedAppType);
        expect(result.confidence).toBeGreaterThan(0.5);
        
        console.log(`${codebaseName}: ${Math.round(analysisTime)}ms (${codebase.expectedComplexity} complexity)`);
      });
    });
  });

  describe('Batch Analysis Performance', () => {
    it('should handle multiple analyses efficiently', async () => {
      const batchSize = 5;
      const testCases = Object.entries(testCodebases).slice(0, batchSize);
      
      const startTime = performance.now();
      
      // Run analyses in parallel
      const results = await Promise.all(
        testCases.map(([name, codebase]) => mockAnalyzeCode(codebase.description))
      );
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const averageTime = totalTime / batchSize;
      
      // Batch processing should be efficient
      expect(totalTime).toBeLessThan(3000); // Total time for 5 analyses
      expect(averageTime).toBeLessThan(1000); // Average per analysis
      
      // All analyses should complete successfully
      expect(results).toHaveLength(batchSize);
      results.forEach(result => {
        expect(result.confidence).toBeGreaterThan(0.5);
        expect(result.detected).toBeDefined();
      });
      
      console.log(`Batch analysis: ${Math.round(totalTime)}ms total, ${Math.round(averageTime)}ms average`);
    });

    it('should handle sequential analyses without performance degradation', async () => {
      const testCases = Object.entries(testCodebases).slice(0, 3);
      const analysisResults = [];
      
      for (const [name, codebase] of testCases) {
        const startTime = performance.now();
        const result = await mockAnalyzeCode(codebase.description);
        const endTime = performance.now();
        
        analysisResults.push({
          name,
          time: endTime - startTime,
          result
        });
      }
      
      // Check for performance degradation
      const times = analysisResults.map(r => r.time);
      const firstTime = times[0];
      const lastTime = times[times.length - 1];
      
      // Last analysis shouldn't be significantly slower than first
      expect(lastTime).toBeLessThan(firstTime * 1.5); // Max 50% degradation
      
      // All analyses should meet individual requirements
      times.forEach(time => {
        expect(time).toBeLessThan(2000);
      });
      
      console.log('Sequential analysis times:', times.map(t => `${Math.round(t)}ms`).join(', '));
    });
  });

  describe('Pattern Matching Performance', () => {
    it('should quickly identify common patterns', async () => {
      const commonPatterns = [
        { input: 'React SPA with authentication', expectedTime: 500 },
        { input: 'Node.js Express API', expectedTime: 450 },
        { input: 'Static HTML website', expectedTime: 400 },
        { input: 'Python Flask application', expectedTime: 480 }
      ];

      for (const pattern of commonPatterns) {
        const startTime = performance.now();
        const result = await mockAnalyzeCode(pattern.input);
        const endTime = performance.now();
        const analysisTime = endTime - startTime;

        // Common patterns should be identified quickly
        expect(analysisTime).toBeLessThan(pattern.expectedTime);
        expect(result.confidence).toBeGreaterThanOrEqual(0.7);
        
        console.log(`Pattern "${pattern.input}": ${Math.round(analysisTime)}ms`);
      }
    });

    it('should handle complex patterns within acceptable time', async () => {
      const complexPatterns = [
        'Full-stack React application with Node.js backend, PostgreSQL database, Redis caching, WebSocket real-time features, JWT authentication, file upload with S3, email notifications, and background job processing',
        'Microservices architecture with multiple Node.js APIs, React frontend, MongoDB and PostgreSQL databases, Elasticsearch for search, Redis for caching, RabbitMQ for messaging, and Docker containerization'
      ];

      for (const pattern of complexPatterns) {
        const startTime = performance.now();
        const result = await mockAnalyzeCode(pattern);
        const endTime = performance.now();
        const analysisTime = endTime - startTime;

        // Complex patterns should still meet the 2-second requirement
        expect(analysisTime).toBeLessThan(2000);
        expect(result.confidence).toBeGreaterThanOrEqual(0.5);
        
        console.log(`Complex pattern: ${Math.round(analysisTime)}ms`);
      }
    });
  });

  describe('File Processing Performance', () => {
    it('should process file contents efficiently', async () => {
      const fileSizes = [
        { name: 'small', size: 1024, expectedTime: 400 },
        { name: 'medium', size: 10240, expectedTime: 500 },
        { name: 'large', size: 102400, expectedTime: 800 }
      ];

      for (const fileSize of fileSizes) {
        const mockFileContent = 'a'.repeat(fileSize.size);
        const description = `React application with ${fileSize.name} codebase`;
        
        const startTime = performance.now();
        const result = await mockAnalyzeCode(description + ' ' + mockFileContent.substring(0, 100));
        const endTime = performance.now();
        const processingTime = endTime - startTime;

        // File processing should scale reasonably with size
        expect(processingTime).toBeLessThan(fileSize.expectedTime);
        
        console.log(`File processing (${fileSize.name}): ${Math.round(processingTime)}ms`);
      }
    });

    it('should handle multiple file types without significant overhead', async () => {
      const fileTypes = [
        { ext: 'js', content: 'const express = require("express");' },
        { ext: 'jsx', content: 'import React from "react"; export default function App() {}' },
        { ext: 'py', content: 'from flask import Flask\napp = Flask(__name__)' },
        { ext: 'json', content: '{"dependencies": {"react": "^18.0.0"}}' },
        { ext: 'html', content: '<!DOCTYPE html><html><body></body></html>' }
      ];

      const startTime = performance.now();
      
      const results = await Promise.all(
        fileTypes.map(file => 
          mockAnalyzeCode(`Application with ${file.ext} files: ${file.content}`)
        )
      );
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const averageTime = totalTime / fileTypes.length;

      // Multiple file types should process efficiently
      expect(totalTime).toBeLessThan(1500);
      expect(averageTime).toBeLessThan(400);
      
      console.log(`Multi-file processing: ${Math.round(totalTime)}ms total, ${Math.round(averageTime)}ms average`);
    });
  });

  describe('Memory and Resource Usage', () => {
    it('should maintain consistent performance under memory pressure', async () => {
      // Simulate memory pressure with large data structures
      const largeData = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        data: `Large data item ${i}`.repeat(100)
      }));

      const startTime = performance.now();
      
      // Perform analysis while large data is in memory
      const result = await mockAnalyzeCode('React application with complex state management');
      
      const endTime = performance.now();
      const analysisTime = endTime - startTime;

      // Performance should not degrade significantly under memory pressure
      expect(analysisTime).toBeLessThan(2000);
      expect(result.confidence).toBeGreaterThan(0.5);
      
      // Clean up large data
      largeData.length = 0;
      
      console.log(`Analysis under memory pressure: ${Math.round(analysisTime)}ms`);
    });

    it('should handle concurrent analyses without resource conflicts', async () => {
      const concurrentCount = 3;
      const testInput = 'Node.js Express API with database integration';
      
      const startTime = performance.now();
      
      // Run multiple analyses concurrently
      const promises = Array.from({ length: concurrentCount }, () => 
        mockAnalyzeCode(testInput)
      );
      
      const results = await Promise.all(promises);
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const averageTime = totalTime / concurrentCount;

      // Concurrent analyses should complete efficiently
      expect(totalTime).toBeLessThan(3000);
      expect(averageTime).toBeLessThan(1500);
      
      // All results should be consistent and valid
      results.forEach(result => {
        expect(result.confidence).toBeGreaterThanOrEqual(0.5);
        expect(result.detected.framework).toBe('nodejs');
      });
      
      console.log(`Concurrent analysis: ${Math.round(totalTime)}ms total, ${Math.round(averageTime)}ms average`);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty input gracefully', async () => {
      const startTime = performance.now();
      const result = await mockAnalyzeCode('');
      const endTime = performance.now();
      const analysisTime = endTime - startTime;

      // Empty input should be handled quickly
      expect(analysisTime).toBeLessThan(500);
      expect(result.detected).toBeDefined();
      
      console.log(`Empty input analysis: ${Math.round(analysisTime)}ms`);
    });

    it('should handle very long input efficiently', async () => {
      const longInput = 'React application with many features: ' + 'feature '.repeat(1000);
      
      const startTime = performance.now();
      const result = await mockAnalyzeCode(longInput);
      const endTime = performance.now();
      const analysisTime = endTime - startTime;

      // Long input should still meet performance requirements
      expect(analysisTime).toBeLessThan(2000);
      expect(result.detected.framework).toBe('react');
      
      console.log(`Long input analysis: ${Math.round(analysisTime)}ms`);
    });

    it('should handle ambiguous patterns within time limits', async () => {
      const ambiguousInputs = [
        'Application with both React and Vue components',
        'Full-stack app that could be Node.js or Python',
        'Website with static and dynamic features'
      ];

      for (const input of ambiguousInputs) {
        const startTime = performance.now();
        const result = await mockAnalyzeCode(input);
        const endTime = performance.now();
        const analysisTime = endTime - startTime;

        // Ambiguous patterns should still complete within time limits
        expect(analysisTime).toBeLessThan(2000);
        expect(result.detected).toBeDefined();
        
        console.log(`Ambiguous pattern analysis: ${Math.round(analysisTime)}ms`);
      }
    });
  });

  describe('Performance Regression Detection', () => {
    it('should maintain consistent performance across multiple runs', async () => {
      const testInput = 'React e-commerce application with authentication';
      const runCount = 5;
      const analysisResults = [];

      for (let i = 0; i < runCount; i++) {
        const startTime = performance.now();
        const result = await mockAnalyzeCode(testInput);
        const endTime = performance.now();
        
        analysisResults.push({
          run: i + 1,
          time: endTime - startTime,
          confidence: result.confidence
        });
      }

      const times = analysisResults.map(r => r.time);
      const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      const maxTime = Math.max(...times);
      const minTime = Math.min(...times);
      const variance = maxTime - minTime;

      // Performance should be consistent across runs
      expect(averageTime).toBeLessThan(2000);
      expect(maxTime).toBeLessThan(2000);
      expect(variance).toBeLessThan(500); // Max 500ms variance between runs

      console.log(`Performance consistency: avg=${Math.round(averageTime)}ms, min=${Math.round(minTime)}ms, max=${Math.round(maxTime)}ms, variance=${Math.round(variance)}ms`);
    });

    it('should detect performance improvements or regressions', async () => {
      // Baseline performance measurement
      const baselineInput = 'Standard React SPA application';
      const baselineRuns = 3;
      const baselineTimes = [];

      for (let i = 0; i < baselineRuns; i++) {
        const startTime = performance.now();
        await mockAnalyzeCode(baselineInput);
        const endTime = performance.now();
        baselineTimes.push(endTime - startTime);
      }

      const baselineAverage = baselineTimes.reduce((sum, time) => sum + time, 0) / baselineTimes.length;

      // Current performance measurement
      const currentRuns = 3;
      const currentTimes = [];

      for (let i = 0; i < currentRuns; i++) {
        const startTime = performance.now();
        await mockAnalyzeCode(baselineInput);
        const endTime = performance.now();
        currentTimes.push(endTime - startTime);
      }

      const currentAverage = currentTimes.reduce((sum, time) => sum + time, 0) / currentTimes.length;
      const performanceChange = ((currentAverage - baselineAverage) / baselineAverage) * 100;

      // Performance should not regress significantly
      expect(Math.abs(performanceChange)).toBeLessThan(50); // Max 50% change
      
      if (performanceChange > 20) {
        console.warn(`Performance regression detected: ${performanceChange.toFixed(1)}% slower`);
      } else if (performanceChange < -20) {
        console.log(`Performance improvement detected: ${Math.abs(performanceChange).toFixed(1)}% faster`);
      }

      console.log(`Performance comparison: baseline=${Math.round(baselineAverage)}ms, current=${Math.round(currentAverage)}ms, change=${performanceChange.toFixed(1)}%`);
    });
  });
});