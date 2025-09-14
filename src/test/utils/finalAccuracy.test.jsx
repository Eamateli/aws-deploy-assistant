import { describe, it, expect } from 'vitest'
import { 
  FrameworkDetector,
  AppTypeDetector,
  InfrastructureDetector
} from '../../utils/patternMatchers'

/**
 * Final Pattern Matching Accuracy Test
 * 
 * This test validates that the pattern matching algorithms achieve >90% accuracy
 * for their core functionality. The test uses realistic expectations and focuses
 * on the most important patterns that the system needs to detect correctly.
 */
describe('Pattern Matching Accuracy >90% Requirement - Final Validation', () => {
  
  // Core patterns that MUST be detected correctly for >90% accuracy
  const mustDetectPatterns = [
    // React - Most important frontend framework
    {
      name: 'React SPA',
      input: {
        files: [
          { 
            name: 'package.json', 
            content: JSON.stringify({
              dependencies: { 
                react: '^18.2.0', 
                'react-dom': '^18.2.0'
              }
            })
          },
          { 
            name: 'src/App.jsx', 
            content: 'import React from "react"; function App() { return <div>Hello</div>; } export default App;'
          }
        ]
      },
      expectedFramework: 'react',
      expectedAppType: 'spa'
    },

    // Node.js Express - Most important backend framework
    {
      name: 'Node.js Express API',
      input: {
        files: [
          { 
            name: 'package.json', 
            content: JSON.stringify({
              dependencies: { 
                express: '^4.18.0'
              }
            })
          },
          { 
            name: 'server.js', 
            content: 'const express = require("express"); const app = express(); app.listen(3000);'
          }
        ]
      },
      expectedFramework: 'nodejs',
      expectedAppType: 'api'
    },

    // Vue - Second most important frontend framework
    {
      name: 'Vue SPA',
      input: {
        files: [
          { 
            name: 'package.json', 
            content: JSON.stringify({
              dependencies: { 
                vue: '^3.2.0'
              }
            })
          },
          { 
            name: 'src/App.vue', 
            content: '<template><div>Hello Vue</div></template><script>export default { name: "App" };</script>'
          }
        ]
      },
      expectedFramework: 'vue',
      expectedAppType: 'spa'
    },

    // Python Flask - Important backend framework
    {
      name: 'Python Flask API',
      input: {
        files: [
          { 
            name: 'requirements.txt', 
            content: 'Flask==2.3.0'
          },
          { 
            name: 'app.py', 
            content: 'from flask import Flask\napp = Flask(__name__)\n@app.route("/")\ndef hello(): return "Hello"\nif __name__ == "__main__": app.run()'
          }
        ]
      },
      expectedFramework: 'python',
      expectedAppType: 'api'
    },

    // Static site - Important for simple websites
    {
      name: 'Static Website',
      input: {
        files: [
          { 
            name: 'index.html', 
            content: '<!DOCTYPE html><html><head><title>Site</title></head><body><h1>Hello</h1></body></html>'
          },
          { 
            name: 'style.css', 
            content: 'body { margin: 0; }'
          }
        ]
      },
      expectedFramework: 'unknown',
      expectedAppType: 'static'
    },

    // MongoDB database detection
    {
      name: 'Node.js with MongoDB',
      input: {
        files: [
          { 
            name: 'package.json', 
            content: JSON.stringify({
              dependencies: { 
                express: '^4.18.0',
                mongoose: '^6.0.0'
              }
            })
          },
          { 
            name: 'server.js', 
            content: 'const mongoose = require("mongoose"); mongoose.connect("mongodb://localhost");'
          }
        ]
      },
      expectedFramework: 'nodejs',
      expectedAppType: 'api',
      expectedDatabase: true
    },

    // JWT Auth detection
    {
      name: 'Node.js with JWT Auth',
      input: {
        files: [
          { 
            name: 'package.json', 
            content: JSON.stringify({
              dependencies: { 
                express: '^4.18.0',
                jsonwebtoken: '^8.5.0'
              }
            })
          },
          { 
            name: 'auth.js', 
            content: 'const jwt = require("jsonwebtoken"); const token = jwt.sign({id: 1}, "secret");'
          }
        ]
      },
      expectedFramework: 'nodejs',
      expectedAppType: 'api',
      expectedAuth: true
    },

    // File upload detection
    {
      name: 'Node.js with File Upload',
      input: {
        files: [
          { 
            name: 'package.json', 
            content: JSON.stringify({
              dependencies: { 
                express: '^4.18.0',
                multer: '^1.4.0'
              }
            })
          },
          { 
            name: 'upload.js', 
            content: 'const multer = require("multer"); const upload = multer({dest: "uploads/"});'
          }
        ]
      },
      expectedFramework: 'nodejs',
      expectedAppType: 'api',
      expectedStorage: true
    },

    // Socket.io realtime detection
    {
      name: 'Node.js with Socket.IO',
      input: {
        files: [
          { 
            name: 'package.json', 
            content: JSON.stringify({
              dependencies: { 
                express: '^4.18.0',
                'socket.io': '^4.0.0'
              }
            })
          },
          { 
            name: 'socket.js', 
            content: 'const io = require("socket.io")(server); io.on("connection", (socket) => {});'
          }
        ]
      },
      expectedFramework: 'nodejs',
      expectedAppType: 'api',
      expectedRealtime: true
    },

    // Full-stack detection
    {
      name: 'Full-Stack App',
      input: {
        files: [
          { 
            name: 'client/package.json', 
            content: JSON.stringify({
              dependencies: { 
                react: '^18.2.0'
              }
            })
          },
          { 
            name: 'server/package.json', 
            content: JSON.stringify({
              dependencies: { 
                express: '^4.18.0'
              }
            })
          },
          { 
            name: 'client/src/App.jsx', 
            content: 'import React from "react"; export default function App() { return <div>Client</div>; }'
          },
          { 
            name: 'server/server.js', 
            content: 'const express = require("express"); const app = express(); app.listen(3000);'
          }
        ]
      },
      expectedFramework: 'react', // Should detect primary framework
      expectedAppType: 'fullstack'
    }
  ];

  it('should achieve >90% accuracy for pattern matching (CORE REQUIREMENT)', () => {
    const frameworkDetector = new FrameworkDetector();
    const appTypeDetector = new AppTypeDetector();
    const infraDetector = new InfrastructureDetector();
    
    let totalTests = 0;
    let passedTests = 0;
    const results = [];

    mustDetectPatterns.forEach(testCase => {
      const result = {
        name: testCase.name,
        tests: [],
        passed: 0,
        total: 0
      };

      // Test framework detection
      const frameworkResult = frameworkDetector.analyze(testCase.input);
      result.total++;
      totalTests++;
      
      const frameworkCorrect = frameworkResult.framework === testCase.expectedFramework;
      if (frameworkCorrect) {
        result.passed++;
        passedTests++;
      }
      result.tests.push({
        type: 'framework',
        expected: testCase.expectedFramework,
        actual: frameworkResult.framework,
        confidence: frameworkResult.confidence,
        passed: frameworkCorrect
      });

      // Test app type detection
      const appTypeResult = appTypeDetector.analyze(testCase.input, frameworkResult);
      result.total++;
      totalTests++;
      
      const appTypeCorrect = appTypeResult.appType === testCase.expectedAppType;
      if (appTypeCorrect) {
        result.passed++;
        passedTests++;
      }
      result.tests.push({
        type: 'appType',
        expected: testCase.expectedAppType,
        actual: appTypeResult.appType,
        confidence: appTypeResult.confidence,
        passed: appTypeCorrect
      });

      // Test infrastructure detection (if expected)
      if (testCase.expectedDatabase !== undefined || 
          testCase.expectedAuth !== undefined || 
          testCase.expectedStorage !== undefined || 
          testCase.expectedRealtime !== undefined) {
        
        const infraResult = infraDetector.analyze(testCase.input);
        
        if (testCase.expectedDatabase !== undefined) {
          result.total++;
          totalTests++;
          const dbCorrect = (infraResult.requirements.database?.required === true) === testCase.expectedDatabase;
          if (dbCorrect) {
            result.passed++;
            passedTests++;
          }
          result.tests.push({
            type: 'database',
            expected: testCase.expectedDatabase,
            actual: infraResult.requirements.database?.required === true,
            confidence: infraResult.requirements.database?.confidence || 0,
            passed: dbCorrect
          });
        }

        if (testCase.expectedAuth !== undefined) {
          result.total++;
          totalTests++;
          const authCorrect = (infraResult.requirements.auth?.required === true) === testCase.expectedAuth;
          if (authCorrect) {
            result.passed++;
            passedTests++;
          }
          result.tests.push({
            type: 'auth',
            expected: testCase.expectedAuth,
            actual: infraResult.requirements.auth?.required === true,
            confidence: infraResult.requirements.auth?.confidence || 0,
            passed: authCorrect
          });
        }

        if (testCase.expectedStorage !== undefined) {
          result.total++;
          totalTests++;
          const storageCorrect = (infraResult.requirements.storage?.required === true) === testCase.expectedStorage;
          if (storageCorrect) {
            result.passed++;
            passedTests++;
          }
          result.tests.push({
            type: 'storage',
            expected: testCase.expectedStorage,
            actual: infraResult.requirements.storage?.required === true,
            confidence: infraResult.requirements.storage?.confidence || 0,
            passed: storageCorrect
          });
        }

        if (testCase.expectedRealtime !== undefined) {
          result.total++;
          totalTests++;
          const realtimeCorrect = (infraResult.requirements.realtime?.required === true) === testCase.expectedRealtime;
          if (realtimeCorrect) {
            result.passed++;
            passedTests++;
          }
          result.tests.push({
            type: 'realtime',
            expected: testCase.expectedRealtime,
            actual: infraResult.requirements.realtime?.required === true,
            confidence: infraResult.requirements.realtime?.confidence || 0,
            passed: realtimeCorrect
          });
        }
      }

      results.push(result);
    });

    // Calculate overall accuracy
    const accuracy = passedTests / totalTests;
    
    // Log detailed results
    console.log('\n=== PATTERN MATCHING ACCURACY RESULTS ===');
    console.log(`Overall Accuracy: ${(accuracy * 100).toFixed(1)}% (${passedTests}/${totalTests})`);
    console.log('\nDetailed Results:');
    
    results.forEach(result => {
      const testAccuracy = (result.passed / result.total * 100).toFixed(1);
      console.log(`\n${result.name}: ${testAccuracy}% (${result.passed}/${result.total})`);
      
      result.tests.forEach(test => {
        const status = test.passed ? '✓' : '✗';
        const conf = test.confidence ? ` (conf: ${test.confidence.toFixed(2)})` : '';
        console.log(`  ${status} ${test.type}: expected ${test.expected}, got ${test.actual}${conf}`);
      });
    });

    // Show which tests failed
    const failedTests = results.filter(r => r.passed < r.total);
    if (failedTests.length > 0) {
      console.log('\nFailed Tests:');
      failedTests.forEach(result => {
        const failedSubTests = result.tests.filter(t => !t.passed);
        failedSubTests.forEach(test => {
          console.log(`  - ${result.name}: ${test.type} detection failed`);
        });
      });
    }

    console.log(`\nFINAL RESULT: ${accuracy >= 0.9 ? 'PASS' : 'FAIL'} - ${(accuracy * 100).toFixed(1)}% accuracy`);
    console.log('===========================================\n');

    // The core requirement: >90% accuracy
    expect(accuracy).toBeGreaterThan(0.9);
  });

  it('should detect React patterns correctly', () => {
    const detector = new FrameworkDetector();
    const reactTest = mustDetectPatterns.find(p => p.name === 'React SPA');
    
    const result = detector.analyze(reactTest.input);
    
    expect(result.framework).toBe('react');
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  it('should detect Node.js patterns correctly', () => {
    const detector = new FrameworkDetector();
    const nodeTest = mustDetectPatterns.find(p => p.name === 'Node.js Express API');
    
    const result = detector.analyze(nodeTest.input);
    
    expect(result.framework).toBe('nodejs');
    expect(result.confidence).toBeGreaterThan(0.4);
  });

  it('should detect SPA app types correctly', () => {
    const frameworkDetector = new FrameworkDetector();
    const appTypeDetector = new AppTypeDetector();
    const reactTest = mustDetectPatterns.find(p => p.name === 'React SPA');
    
    const frameworkResult = frameworkDetector.analyze(reactTest.input);
    const appTypeResult = appTypeDetector.analyze(reactTest.input, frameworkResult);
    
    expect(appTypeResult.appType).toBe('spa');
    expect(appTypeResult.confidence).toBeGreaterThan(0.5);
  });

  it('should detect API app types correctly', () => {
    const frameworkDetector = new FrameworkDetector();
    const appTypeDetector = new AppTypeDetector();
    const nodeTest = mustDetectPatterns.find(p => p.name === 'Node.js Express API');
    
    const frameworkResult = frameworkDetector.analyze(nodeTest.input);
    const appTypeResult = appTypeDetector.analyze(nodeTest.input, frameworkResult);
    
    expect(appTypeResult.appType).toBe('api');
    expect(appTypeResult.confidence).toBeGreaterThan(0.5);
  });

  it('should detect database requirements correctly', () => {
    const detector = new InfrastructureDetector();
    const dbTest = mustDetectPatterns.find(p => p.name === 'Node.js with MongoDB');
    
    const result = detector.analyze(dbTest.input);
    
    expect(result.requirements.database?.required).toBe(true);
    expect(result.requirements.database?.type).toBe('nosql');
  });

  it('should detect authentication requirements correctly', () => {
    const detector = new InfrastructureDetector();
    const authTest = mustDetectPatterns.find(p => p.name === 'Node.js with JWT Auth');
    
    const result = detector.analyze(authTest.input);
    
    expect(result.requirements.auth?.required).toBe(true);
  });

  it('should be performant (complete analysis in <1 second)', () => {
    const frameworkDetector = new FrameworkDetector();
    const testCase = mustDetectPatterns[0];
    
    const startTime = Date.now();
    frameworkDetector.analyze(testCase.input);
    const endTime = Date.now();
    
    const duration = endTime - startTime;
    expect(duration).toBeLessThan(1000);
  });

  it('should be deterministic (same input produces same output)', () => {
    const detector = new FrameworkDetector();
    const testCase = mustDetectPatterns[0];
    
    const result1 = detector.analyze(testCase.input);
    const result2 = detector.analyze(testCase.input);
    
    expect(result1.framework).toBe(result2.framework);
    expect(result1.confidence).toBe(result2.confidence);
  });
});