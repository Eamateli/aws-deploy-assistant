import { describe, it, expect } from 'vitest'
import { 
  FrameworkDetector,
  AppTypeDetector,
  InfrastructureDetector,
  PatternAnalyzer
} from '../../utils/patternMatchers'

// Comprehensive test suite for >90% pattern matching accuracy
describe('Pattern Matching Accuracy Validation (>90% Requirement)', () => {
  
  // Known good test cases that should achieve >90% accuracy
  const knownPatterns = {
    react: [
      {
        name: 'Standard React App',
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
              content: 'import React, { useState } from "react"; function App() { const [count, setCount] = useState(0); return <div><h1>React App</h1><button onClick={() => setCount(count + 1)}>Count: {count}</button></div>; } export default App;'
            },
            { 
              name: 'public/index.html', 
              content: '<!DOCTYPE html><html><head><title>React App</title></head><body><div id="root"></div></body></html>'
            }
          ]
        },
        expectedFramework: 'react',
        expectedAppType: 'spa',
        minConfidence: 0.8
      },
      {
        name: 'React with Router',
        input: {
          files: [
            { 
              name: 'package.json', 
              content: JSON.stringify({
                dependencies: { 
                  react: '^18.2.0', 
                  'react-dom': '^18.2.0',
                  'react-router-dom': '^6.0.0'
                }
              })
            },
            { 
              name: 'src/App.jsx', 
              content: 'import React from "react"; import { BrowserRouter, Routes, Route } from "react-router-dom"; function App() { return <BrowserRouter><Routes><Route path="/" element={<div>Home</div>} /></Routes></BrowserRouter>; } export default App;'
            }
          ]
        },
        expectedFramework: 'react',
        expectedAppType: 'spa',
        minConfidence: 0.8
      }
    ],

    nodejs: [
      {
        name: 'Express API',
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
              content: 'const express = require("express"); const cors = require("cors"); const app = express(); app.use(cors()); app.use(express.json()); app.get("/api/users", (req, res) => { res.json([{id: 1, name: "John"}]); }); app.listen(3000, () => { console.log("Server running on port 3000"); });'
            }
          ]
        },
        expectedFramework: 'nodejs',
        expectedAppType: 'api',
        minConfidence: 0.8
      }
    ],

    vue: [
      {
        name: 'Vue 3 App',
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
              content: '<template><div id="app"><h1>{{ message }}</h1><button @click="increment">Count: {{ count }}</button></div></template><script>export default { name: "App", data() { return { message: "Hello Vue!", count: 0 }; }, methods: { increment() { this.count++; } } };</script><style>#app { font-family: Avenir, Helvetica, Arial, sans-serif; }</style>'
            }
          ]
        },
        expectedFramework: 'vue',
        expectedAppType: 'spa',
        minConfidence: 0.8
      }
    ],

    python: [
      {
        name: 'Flask API',
        input: {
          files: [
            { 
              name: 'requirements.txt', 
              content: 'Flask==2.3.0\nFlask-CORS==4.0.0\nrequests==2.28.0'
            },
            { 
              name: 'app.py', 
              content: 'from flask import Flask, jsonify, request\nfrom flask_cors import CORS\n\napp = Flask(__name__)\nCORS(app)\n\n@app.route("/api/users", methods=["GET"])\ndef get_users():\n    return jsonify([{"id": 1, "name": "John"}])\n\n@app.route("/api/users", methods=["POST"])\ndef create_user():\n    data = request.get_json()\n    return jsonify({"id": 2, "name": data["name"]})\n\nif __name__ == "__main__":\n    app.run(debug=True)'
            }
          ]
        },
        expectedFramework: 'python',
        expectedAppType: 'api',
        minConfidence: 0.8
      }
    ],

    static: [
      {
        name: 'Static Website',
        input: {
          files: [
            { 
              name: 'index.html', 
              content: '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>My Portfolio</title><link rel="stylesheet" href="style.css"></head><body><header><h1>John Doe</h1><nav><a href="#about">About</a><a href="#projects">Projects</a></nav></header><main><section id="about"><h2>About Me</h2><p>I am a web developer...</p></section></main><script src="script.js"></script></body></html>'
            },
            { 
              name: 'style.css', 
              content: 'body { font-family: Arial, sans-serif; margin: 0; padding: 0; } header { background: #333; color: white; padding: 1rem; } nav a { color: white; text-decoration: none; margin: 0 1rem; }'
            },
            { 
              name: 'script.js', 
              content: 'document.addEventListener("DOMContentLoaded", function() { console.log("Portfolio loaded"); const links = document.querySelectorAll("nav a"); links.forEach(link => { link.addEventListener("click", function(e) { e.preventDefault(); const target = document.querySelector(this.getAttribute("href")); target.scrollIntoView({ behavior: "smooth" }); }); }); });'
            }
          ]
        },
        expectedFramework: 'unknown',
        expectedAppType: 'static',
        minConfidence: 0.7
      }
    ]
  };

  // Infrastructure test cases
  const infrastructurePatterns = {
    database: [
      {
        name: 'MongoDB with Mongoose',
        input: {
          files: [
            { 
              name: 'package.json', 
              content: JSON.stringify({
                dependencies: { 
                  mongoose: '^6.0.0',
                  express: '^4.18.0'
                }
              })
            },
            { 
              name: 'models/User.js', 
              content: 'const mongoose = require("mongoose"); const userSchema = new mongoose.Schema({ name: { type: String, required: true }, email: { type: String, required: true, unique: true }, createdAt: { type: Date, default: Date.now } }); module.exports = mongoose.model("User", userSchema);'
            },
            { 
              name: 'server.js', 
              content: 'const mongoose = require("mongoose"); mongoose.connect("mongodb://localhost:27017/myapp", { useNewUrlParser: true, useUnifiedTopology: true });'
            }
          ]
        },
        expectedDatabase: true,
        expectedDatabaseType: 'nosql'
      }
    ],

    auth: [
      {
        name: 'JWT Authentication',
        input: {
          files: [
            { 
              name: 'package.json', 
              content: JSON.stringify({
                dependencies: { 
                  jsonwebtoken: '^8.5.0',
                  bcrypt: '^5.0.0',
                  express: '^4.18.0'
                }
              })
            },
            { 
              name: 'auth.js', 
              content: 'const jwt = require("jsonwebtoken"); const bcrypt = require("bcrypt"); const login = async (req, res) => { const { email, password } = req.body; const user = await User.findOne({ email }); if (user && await bcrypt.compare(password, user.password)) { const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "24h" }); res.json({ token, user: { id: user._id, email: user.email } }); } else { res.status(401).json({ error: "Invalid credentials" }); } };'
            }
          ]
        },
        expectedAuth: true
      }
    ]
  };

  describe('Framework Detection Accuracy', () => {
    it('should achieve >90% accuracy for React patterns', () => {
      const detector = new FrameworkDetector();
      let correct = 0;
      let total = 0;

      knownPatterns.react.forEach(testCase => {
        const result = detector.analyze(testCase.input);
        total++;
        
        if (result.framework === testCase.expectedFramework && 
            result.confidence >= testCase.minConfidence) {
          correct++;
        }
      });

      const accuracy = correct / total;
      expect(accuracy).toBeGreaterThan(0.9);
    });

    it('should achieve >90% accuracy for Node.js patterns', () => {
      const detector = new FrameworkDetector();
      let correct = 0;
      let total = 0;

      knownPatterns.nodejs.forEach(testCase => {
        const result = detector.analyze(testCase.input);
        total++;
        
        if (result.framework === testCase.expectedFramework && 
            result.confidence >= testCase.minConfidence) {
          correct++;
        }
      });

      const accuracy = correct / total;
      expect(accuracy).toBeGreaterThan(0.9);
    });

    it('should achieve >90% accuracy for Vue patterns', () => {
      const detector = new FrameworkDetector();
      let correct = 0;
      let total = 0;

      knownPatterns.vue.forEach(testCase => {
        const result = detector.analyze(testCase.input);
        total++;
        
        if (result.framework === testCase.expectedFramework && 
            result.confidence >= testCase.minConfidence) {
          correct++;
        }
      });

      const accuracy = correct / total;
      expect(accuracy).toBeGreaterThan(0.9);
    });

    it('should achieve >90% accuracy for Python patterns', () => {
      const detector = new FrameworkDetector();
      let correct = 0;
      let total = 0;

      knownPatterns.python.forEach(testCase => {
        const result = detector.analyze(testCase.input);
        total++;
        
        if (result.framework === testCase.expectedFramework && 
            result.confidence >= testCase.minConfidence) {
          correct++;
        }
      });

      const accuracy = correct / total;
      expect(accuracy).toBeGreaterThan(0.9);
    });

    it('should achieve >90% overall framework detection accuracy', () => {
      const detector = new FrameworkDetector();
      let correct = 0;
      let total = 0;

      Object.values(knownPatterns).forEach(patterns => {
        patterns.forEach(testCase => {
          const result = detector.analyze(testCase.input);
          total++;
          
          if (result.framework === testCase.expectedFramework && 
              result.confidence >= testCase.minConfidence) {
            correct++;
          }
        });
      });

      const accuracy = correct / total;
      expect(accuracy).toBeGreaterThan(0.9);
    });
  });

  describe('App Type Detection Accuracy', () => {
    it('should achieve >90% accuracy for app type detection', () => {
      const frameworkDetector = new FrameworkDetector();
      const appTypeDetector = new AppTypeDetector();
      let correct = 0;
      let total = 0;

      Object.values(knownPatterns).forEach(patterns => {
        patterns.forEach(testCase => {
          const frameworkResult = frameworkDetector.analyze(testCase.input);
          const appTypeResult = appTypeDetector.analyze(testCase.input, frameworkResult);
          total++;
          
          if (appTypeResult.appType === testCase.expectedAppType && 
              appTypeResult.confidence >= 0.7) {
            correct++;
          }
        });
      });

      const accuracy = correct / total;
      expect(accuracy).toBeGreaterThan(0.9);
    });
  });

  describe('Infrastructure Detection Accuracy', () => {
    it('should achieve >90% accuracy for database detection', () => {
      const detector = new InfrastructureDetector();
      let correct = 0;
      let total = 0;

      infrastructurePatterns.database.forEach(testCase => {
        const result = detector.analyze(testCase.input);
        total++;
        
        if (result.requirements.database?.required === testCase.expectedDatabase) {
          correct++;
        }
      });

      const accuracy = correct / total;
      expect(accuracy).toBeGreaterThan(0.9);
    });

    it('should achieve >90% accuracy for auth detection', () => {
      const detector = new InfrastructureDetector();
      let correct = 0;
      let total = 0;

      infrastructurePatterns.auth.forEach(testCase => {
        const result = detector.analyze(testCase.input);
        total++;
        
        if (result.requirements.auth?.required === testCase.expectedAuth) {
          correct++;
        }
      });

      const accuracy = correct / total;
      expect(accuracy).toBeGreaterThan(0.9);
    });
  });

  describe('Complete Pattern Analysis Accuracy', () => {
    it('should achieve >90% overall accuracy for complete analysis', () => {
      const analyzer = new PatternAnalyzer();
      let correct = 0;
      let total = 0;

      Object.values(knownPatterns).forEach(patterns => {
        patterns.forEach(async (testCase) => {
          const result = await analyzer.analyzeApplication(testCase.input);
          total++;
          
          const frameworkCorrect = result.framework.framework === testCase.expectedFramework;
          const appTypeCorrect = result.appType.appType === testCase.expectedAppType;
          const confidenceOk = result.confidence >= 0.7;
          
          if (frameworkCorrect && appTypeCorrect && confidenceOk) {
            correct++;
          }
        });
      });

      const accuracy = correct / total;
      expect(accuracy).toBeGreaterThan(0.9);
    });
  });

  describe('Performance and Reliability', () => {
    it('should maintain consistent accuracy across multiple runs', () => {
      const detector = new FrameworkDetector();
      const testCase = knownPatterns.react[0];
      
      const results = [];
      for (let i = 0; i < 10; i++) {
        const result = detector.analyze(testCase.input);
        results.push(result);
      }

      // All results should be identical (deterministic)
      const firstResult = results[0];
      results.forEach(result => {
        expect(result.framework).toBe(firstResult.framework);
        expect(result.confidence).toBe(firstResult.confidence);
      });
    });

    it('should complete analysis within reasonable time', () => {
      const analyzer = new PatternAnalyzer();
      const testCase = knownPatterns.react[0];
      
      const startTime = Date.now();
      analyzer.analyzeApplication(testCase.input);
      const endTime = Date.now();
      
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});