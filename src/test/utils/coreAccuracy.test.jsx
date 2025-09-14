import { describe, it, expect } from 'vitest'
import { 
  FrameworkDetector,
  AppTypeDetector,
  InfrastructureDetector
} from '../../utils/patternMatchers'

/**
 * Core Pattern Matching Accuracy Test
 * 
 * This test validates that the pattern matching algorithms achieve >90% accuracy
 * for known, well-defined patterns. The test uses realistic confidence thresholds
 * and focuses on the most common use cases.
 */
describe('Core Pattern Matching Accuracy (>90% Requirement)', () => {
  
  // Well-defined test cases that should be detected with high accuracy
  const coreTestCases = [
    // React patterns
    {
      name: 'React SPA - Standard',
      input: {
        files: [
          { 
            name: 'package.json', 
            content: JSON.stringify({
              dependencies: { 
                react: '^18.2.0', 
                'react-dom': '^18.2.0',
                'react-scripts': '^5.0.0'
              },
              scripts: { 
                start: 'react-scripts start',
                build: 'react-scripts build'
              }
            })
          },
          { 
            name: 'src/App.jsx', 
            content: 'import React, { useState } from "react"; function App() { const [count, setCount] = useState(0); return <div><h1>React App</h1></div>; } export default App;'
          },
          { 
            name: 'public/index.html', 
            content: '<!DOCTYPE html><html><head><title>React App</title></head><body><div id="root"></div></body></html>'
          }
        ]
      },
      expected: {
        framework: 'react',
        appType: 'spa',
        minFrameworkConfidence: 0.6,
        minAppTypeConfidence: 0.6
      }
    },

    // Node.js API patterns
    {
      name: 'Node.js Express API',
      input: {
        files: [
          { 
            name: 'package.json', 
            content: JSON.stringify({
              dependencies: { 
                express: '^4.18.0',
                cors: '^2.8.5'
              },
              scripts: { 
                start: 'node server.js'
              }
            })
          },
          { 
            name: 'server.js', 
            content: 'const express = require("express"); const app = express(); app.get("/api/users", (req, res) => { res.json([{id: 1, name: "John"}]); }); app.listen(3000);'
          }
        ]
      },
      expected: {
        framework: 'nodejs',
        appType: 'api',
        minFrameworkConfidence: 0.6,
        minAppTypeConfidence: 0.6
      }
    },

    // Vue SPA patterns
    {
      name: 'Vue 3 SPA',
      input: {
        files: [
          { 
            name: 'package.json', 
            content: JSON.stringify({
              dependencies: { 
                vue: '^3.2.0',
                '@vue/cli-service': '^5.0.0'
              },
              scripts: { 
                serve: 'vue-cli-service serve',
                build: 'vue-cli-service build'
              }
            })
          },
          { 
            name: 'src/App.vue', 
            content: '<template><div id="app"><h1>{{ message }}</h1></div></template><script>export default { name: "App", data() { return { message: "Hello Vue!" }; } };</script>'
            }
        ]
      },
      expected: {
        framework: 'vue',
        appType: 'spa',
        minFrameworkConfidence: 0.6,
        minAppTypeConfidence: 0.6
      }
    },

    // Python Flask API patterns
    {
      name: 'Python Flask API',
      input: {
        files: [
          { 
            name: 'requirements.txt', 
            content: 'Flask==2.3.0\nFlask-CORS==4.0.0'
          },
          { 
            name: 'app.py', 
            content: 'from flask import Flask, jsonify\nfrom flask_cors import CORS\n\napp = Flask(__name__)\nCORS(app)\n\n@app.route("/api/users", methods=["GET"])\ndef get_users():\n    return jsonify([{"id": 1, "name": "John"}])\n\nif __name__ == "__main__":\n    app.run(debug=True)'
          }
        ]
      },
      expected: {
        framework: 'python',
        appType: 'api',
        minFrameworkConfidence: 0.6,
        minAppTypeConfidence: 0.6
      }
    },

    // Static website patterns
    {
      name: 'Static HTML Website',
      input: {
        files: [
          { 
            name: 'index.html', 
            content: '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>My Portfolio</title></head><body><header><h1>John Doe</h1></header><main><section><h2>About Me</h2><p>I am a web developer...</p></section></main></body></html>'
          },
          { 
            name: 'style.css', 
            content: 'body { font-family: Arial, sans-serif; margin: 0; padding: 0; } header { background: #333; color: white; padding: 1rem; }'
          },
          { 
            name: 'script.js', 
            content: 'document.addEventListener("DOMContentLoaded", function() { console.log("Portfolio loaded"); });'
          }
        ]
      },
      expected: {
        framework: 'unknown',
        appType: 'static',
        minFrameworkConfidence: 0.0, // Unknown framework should have low confidence
        minAppTypeConfidence: 0.6
      }
    },

    // React with database (MongoDB)
    {
      name: 'React + Node.js + MongoDB',
      input: {
        files: [
          { 
            name: 'package.json', 
            content: JSON.stringify({
              dependencies: { 
                react: '^18.2.0',
                express: '^4.18.0',
                mongoose: '^6.0.0'
              }
            })
          },
          { 
            name: 'server.js', 
            content: 'const express = require("express"); const mongoose = require("mongoose"); mongoose.connect("mongodb://localhost:27017/myapp"); const app = express(); app.listen(3000);'
          },
          { 
            name: 'src/App.jsx', 
            content: 'import React from "react"; function App() { return <div>Full Stack App</div>; } export default App;'
          }
        ]
      },
      expected: {
        framework: 'react', // Should detect React as primary framework
        appType: 'fullstack',
        minFrameworkConfidence: 0.6,
        minAppTypeConfidence: 0.5,
        hasDatabase: true
      }
    },

    // Node.js with JWT Auth
    {
      name: 'Node.js API with JWT Auth',
      input: {
        files: [
          { 
            name: 'package.json', 
            content: JSON.stringify({
              dependencies: { 
                express: '^4.18.0',
                jsonwebtoken: '^8.5.0',
                bcrypt: '^5.0.0'
              }
            })
          },
          { 
            name: 'auth.js', 
            content: 'const jwt = require("jsonwebtoken"); const bcrypt = require("bcrypt"); const login = async (req, res) => { const token = jwt.sign({ userId: 1 }, "secret"); res.json({ token }); };'
          }
        ]
      },
      expected: {
        framework: 'nodejs',
        appType: 'api',
        minFrameworkConfidence: 0.6,
        minAppTypeConfidence: 0.6,
        hasAuth: true
      }
    },

    // Express with file upload
    {
      name: 'Node.js API with File Upload',
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
            content: 'const multer = require("multer"); const upload = multer({ dest: "uploads/" }); app.post("/upload", upload.single("file"), (req, res) => { res.json({ filename: req.file.filename }); });'
          }
        ]
      },
      expected: {
        framework: 'nodejs',
        appType: 'api',
        minFrameworkConfidence: 0.6,
        minAppTypeConfidence: 0.6,
        hasStorage: true
      }
    },

    // Socket.io real-time app
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
            content: 'const io = require("socket.io")(server); io.on("connection", (socket) => { socket.on("message", (data) => { io.emit("message", data); }); });'
          }
        ]
      },
      expected: {
        framework: 'nodejs',
        appType: 'api',
        minFrameworkConfidence: 0.6,
        minAppTypeConfidence: 0.6,
        hasRealtime: true
      }
    },

    // Next.js SSR
    {
      name: 'Next.js SSR App',
      input: {
        files: [
          { 
            name: 'package.json', 
            content: JSON.stringify({
              dependencies: { 
                react: '^18.0.0',
                next: '^13.0.0'
              },
              scripts: { 
                dev: 'next dev',
                build: 'next build'
              }
            })
          },
          { 
            name: 'pages/index.js', 
            content: 'export default function Home() { return <h1>Next.js App</h1>; } export async function getServerSideProps() { return { props: {} }; }'
          }
        ]
      },
      expected: {
        framework: 'react',
        appType: 'ssr',
        minFrameworkConfidence: 0.5,
        minAppTypeConfidence: 0.5
      }
    }
  ];

  describe('Framework Detection Accuracy', () => {
    it('should achieve >90% accuracy for framework detection', () => {
      const detector = new FrameworkDetector();
      let correct = 0;
      let total = 0;

      coreTestCases.forEach(testCase => {
        const result = detector.analyze(testCase.input);
        total++;
        
        const frameworkCorrect = result.framework === testCase.expected.framework;
        const confidenceOk = result.confidence >= testCase.expected.minFrameworkConfidence;
        
        if (frameworkCorrect && confidenceOk) {
          correct++;
        } else {
          console.log(`Failed: ${testCase.name}`);
          console.log(`  Expected: ${testCase.expected.framework} (conf >= ${testCase.expected.minFrameworkConfidence})`);
          console.log(`  Got: ${result.framework} (conf: ${result.confidence})`);
        }
      });

      const accuracy = correct / total;
      console.log(`Framework Detection Accuracy: ${(accuracy * 100).toFixed(1)}% (${correct}/${total})`);
      expect(accuracy).toBeGreaterThan(0.9);
    });
  });

  describe('App Type Detection Accuracy', () => {
    it('should achieve >90% accuracy for app type detection', () => {
      const frameworkDetector = new FrameworkDetector();
      const appTypeDetector = new AppTypeDetector();
      let correct = 0;
      let total = 0;

      coreTestCases.forEach(testCase => {
        const frameworkResult = frameworkDetector.analyze(testCase.input);
        const appTypeResult = appTypeDetector.analyze(testCase.input, frameworkResult);
        total++;
        
        const appTypeCorrect = appTypeResult.appType === testCase.expected.appType;
        const confidenceOk = appTypeResult.confidence >= testCase.expected.minAppTypeConfidence;
        
        if (appTypeCorrect && confidenceOk) {
          correct++;
        } else {
          console.log(`Failed: ${testCase.name}`);
          console.log(`  Expected: ${testCase.expected.appType} (conf >= ${testCase.expected.minAppTypeConfidence})`);
          console.log(`  Got: ${appTypeResult.appType} (conf: ${appTypeResult.confidence})`);
        }
      });

      const accuracy = correct / total;
      console.log(`App Type Detection Accuracy: ${(accuracy * 100).toFixed(1)}% (${correct}/${total})`);
      expect(accuracy).toBeGreaterThan(0.9);
    });
  });

  describe('Infrastructure Detection Accuracy', () => {
    it('should achieve >90% accuracy for infrastructure detection', () => {
      const detector = new InfrastructureDetector();
      let correct = 0;
      let total = 0;

      // Filter test cases that have infrastructure expectations
      const infraTestCases = coreTestCases.filter(tc => 
        tc.expected.hasDatabase !== undefined || 
        tc.expected.hasAuth !== undefined || 
        tc.expected.hasStorage !== undefined || 
        tc.expected.hasRealtime !== undefined
      );

      infraTestCases.forEach(testCase => {
        const result = detector.analyze(testCase.input);
        let allCorrect = true;
        
        // Check database detection
        if (testCase.expected.hasDatabase !== undefined) {
          const detected = result.requirements.database?.required === true;
          if (detected !== testCase.expected.hasDatabase) {
            allCorrect = false;
          }
        }
        
        // Check auth detection
        if (testCase.expected.hasAuth !== undefined) {
          const detected = result.requirements.auth?.required === true;
          if (detected !== testCase.expected.hasAuth) {
            allCorrect = false;
          }
        }
        
        // Check storage detection
        if (testCase.expected.hasStorage !== undefined) {
          const detected = result.requirements.storage?.required === true;
          if (detected !== testCase.expected.hasStorage) {
            allCorrect = false;
          }
        }
        
        // Check realtime detection
        if (testCase.expected.hasRealtime !== undefined) {
          const detected = result.requirements.realtime?.required === true;
          if (detected !== testCase.expected.hasRealtime) {
            allCorrect = false;
          }
        }
        
        total++;
        if (allCorrect) {
          correct++;
        } else {
          console.log(`Failed infrastructure: ${testCase.name}`);
          console.log(`  Requirements:`, result.requirements);
        }
      });

      const accuracy = total > 0 ? correct / total : 1; // If no infra tests, consider 100%
      console.log(`Infrastructure Detection Accuracy: ${(accuracy * 100).toFixed(1)}% (${correct}/${total})`);
      expect(accuracy).toBeGreaterThan(0.9);
    });
  });

  describe('Overall Pattern Matching Accuracy', () => {
    it('should achieve >90% overall accuracy across all pattern types', () => {
      const frameworkDetector = new FrameworkDetector();
      const appTypeDetector = new AppTypeDetector();
      const infraDetector = new InfrastructureDetector();
      
      let totalChecks = 0;
      let correctChecks = 0;

      coreTestCases.forEach(testCase => {
        // Framework detection
        const frameworkResult = frameworkDetector.analyze(testCase.input);
        totalChecks++;
        if (frameworkResult.framework === testCase.expected.framework && 
            frameworkResult.confidence >= testCase.expected.minFrameworkConfidence) {
          correctChecks++;
        }

        // App type detection
        const appTypeResult = appTypeDetector.analyze(testCase.input, frameworkResult);
        totalChecks++;
        if (appTypeResult.appType === testCase.expected.appType && 
            appTypeResult.confidence >= testCase.expected.minAppTypeConfidence) {
          correctChecks++;
        }

        // Infrastructure detection (if applicable)
        if (testCase.expected.hasDatabase !== undefined || 
            testCase.expected.hasAuth !== undefined || 
            testCase.expected.hasStorage !== undefined || 
            testCase.expected.hasRealtime !== undefined) {
          
          const infraResult = infraDetector.analyze(testCase.input);
          let infraCorrect = true;
          
          if (testCase.expected.hasDatabase !== undefined) {
            totalChecks++;
            if ((infraResult.requirements.database?.required === true) === testCase.expected.hasDatabase) {
              correctChecks++;
            } else {
              infraCorrect = false;
            }
          }
          
          if (testCase.expected.hasAuth !== undefined) {
            totalChecks++;
            if ((infraResult.requirements.auth?.required === true) === testCase.expected.hasAuth) {
              correctChecks++;
            } else {
              infraCorrect = false;
            }
          }
          
          if (testCase.expected.hasStorage !== undefined) {
            totalChecks++;
            if ((infraResult.requirements.storage?.required === true) === testCase.expected.hasStorage) {
              correctChecks++;
            } else {
              infraCorrect = false;
            }
          }
          
          if (testCase.expected.hasRealtime !== undefined) {
            totalChecks++;
            if ((infraResult.requirements.realtime?.required === true) === testCase.expected.hasRealtime) {
              correctChecks++;
            } else {
              infraCorrect = false;
            }
          }
        }
      });

      const overallAccuracy = correctChecks / totalChecks;
      console.log(`Overall Pattern Matching Accuracy: ${(overallAccuracy * 100).toFixed(1)}% (${correctChecks}/${totalChecks})`);
      expect(overallAccuracy).toBeGreaterThan(0.9);
    });
  });

  describe('Edge Cases and Robustness', () => {
    it('should handle empty input gracefully', () => {
      const detector = new FrameworkDetector();
      const result = detector.analyze({ files: [] });
      
      expect(result.framework).toBe('unknown');
      expect(result.confidence).toBe(0);
    });

    it('should handle malformed JSON gracefully', () => {
      const detector = new FrameworkDetector();
      const result = detector.analyze({
        files: [
          { name: 'package.json', content: '{ invalid json }' }
        ]
      });
      
      // Should not crash and should return some result
      expect(result.framework).toBeDefined();
      expect(result.confidence).toBeDefined();
    });

    it('should be deterministic (same input = same output)', () => {
      const detector = new FrameworkDetector();
      const testCase = coreTestCases[0];
      
      const result1 = detector.analyze(testCase.input);
      const result2 = detector.analyze(testCase.input);
      
      expect(result1.framework).toBe(result2.framework);
      expect(result1.confidence).toBe(result2.confidence);
    });
  });
});