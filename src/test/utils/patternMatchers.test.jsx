import { describe, it, expect } from 'vitest'
import { 
  detectFramework, 
  detectAppType, 
  detectInfrastructure,
  calculatePatternConfidence,
  FrameworkDetector,
  AppTypeDetector,
  InfrastructureDetector,
  PatternAnalyzer
} from '../../utils/patternMatchers'
import { 
  mockReactPackageJson, 
  mockNodePackageJson, 
  mockReactAppFile, 
  mockNodeServerFile 
} from '../utils.jsx'

// Comprehensive test data for >90% accuracy validation
const testCases = {
  react: [
    {
      name: 'React with Create React App',
      input: {
        files: [
          { name: 'package.json', content: JSON.stringify({
            dependencies: { react: '^18.2.0', 'react-dom': '^18.2.0', 'react-scripts': '^5.0.0' },
            scripts: { start: 'react-scripts start', build: 'react-scripts build' }
          })},
          { name: 'src/App.jsx', content: 'import React from "react"; export default function App() { return <div>Hello</div>; }' },
          { name: 'public/index.html', content: '<div id="root"></div>' }
        ]
      },
      expected: { framework: 'react', confidence: 0.8 }
    },
    {
      name: 'React with Next.js',
      input: {
        files: [
          { name: 'package.json', content: JSON.stringify({
            dependencies: { react: '^18.0.0', next: '^13.0.0' },
            scripts: { dev: 'next dev', build: 'next build' }
          })},
          { name: 'pages/index.js', content: 'export default function Home() { return <h1>Next.js</h1>; }' }
        ]
      },
      expected: { framework: 'react', confidence: 0.5 }
    },
    {
      name: 'React with TypeScript',
      input: {
        files: [
          { name: 'package.json', content: JSON.stringify({
            dependencies: { react: '^18.0.0', '@types/react': '^18.0.0' }
          })},
          { name: 'src/App.tsx', content: 'import React from "react"; const App: React.FC = () => <div>TypeScript React</div>; export default App;' }
        ]
      },
      expected: { framework: 'react', confidence: 0.6 }
    }
  ],
  vue: [
    {
      name: 'Vue 3 with Composition API',
      input: {
        files: [
          { name: 'package.json', content: JSON.stringify({
            dependencies: { vue: '^3.2.0', '@vue/cli-service': '^5.0.0' },
            scripts: { serve: 'vue-cli-service serve', build: 'vue-cli-service build' }
          })},
          { name: 'src/App.vue', content: '<template><div>{{ message }}</div></template><script setup>const message = "Hello Vue";</script>' }
        ]
      },
      expected: { framework: 'vue', confidence: 0.9 }
    },
    {
      name: 'Vue with Nuxt.js',
      input: {
        files: [
          { name: 'package.json', content: JSON.stringify({
            dependencies: { vue: '^3.0.0', nuxt: '^3.0.0' },
            scripts: { dev: 'nuxt dev', build: 'nuxt build' }
          })},
          { name: 'nuxt.config.js', content: 'export default defineNuxtConfig({})' }
        ]
      },
      expected: { framework: 'vue', confidence: 0.85 }
    }
  ],
  nodejs: [
    {
      name: 'Express.js API',
      input: {
        files: [
          { name: 'package.json', content: JSON.stringify({
            dependencies: { express: '^4.18.0', cors: '^2.8.5' },
            scripts: { start: 'node server.js' }
          })},
          { name: 'server.js', content: 'const express = require("express"); const app = express(); app.listen(3000);' }
        ]
      },
      expected: { framework: 'nodejs', confidence: 0.9 }
    },
    {
      name: 'Fastify API',
      input: {
        files: [
          { name: 'package.json', content: JSON.stringify({
            dependencies: { fastify: '^4.0.0' }
          })},
          { name: 'app.js', content: 'const fastify = require("fastify")(); fastify.listen(3000);' }
        ]
      },
      expected: { framework: 'nodejs', confidence: 0.85 }
    }
  ],
  python: [
    {
      name: 'Flask API',
      input: {
        files: [
          { name: 'requirements.txt', content: 'Flask==2.3.0\nrequests==2.28.0' },
          { name: 'app.py', content: 'from flask import Flask\napp = Flask(__name__)\n@app.route("/")\ndef hello(): return "Hello"\nif __name__ == "__main__": app.run()' }
        ]
      },
      expected: { framework: 'python', confidence: 0.9 }
    },
    {
      name: 'FastAPI',
      input: {
        files: [
          { name: 'requirements.txt', content: 'fastapi==0.95.0\nuvicorn==0.21.0' },
          { name: 'main.py', content: 'from fastapi import FastAPI\napp = FastAPI()\n@app.get("/")\ndef read_root(): return {"Hello": "World"}' }
        ]
      },
      expected: { framework: 'python', confidence: 0.85 }
    }
  ]
};

const appTypeTestCases = {
  spa: [
    {
      name: 'React SPA with Router',
      input: {
        framework: 'react',
        files: [
          { name: 'src/App.jsx', content: 'import { BrowserRouter, Routes, Route } from "react-router-dom";' },
          { name: 'public/index.html', content: '<div id="root"></div>' }
        ]
      },
      expected: { appType: 'spa', confidence: 0.8 }
    },
    {
      name: 'Vue SPA',
      input: {
        framework: 'vue',
        files: [
          { name: 'src/App.vue', content: '<template><router-view /></template>' },
          { name: 'src/router/index.js', content: 'import { createRouter } from "vue-router"' }
        ]
      },
      expected: { appType: 'spa', confidence: 0.8 }
    }
  ],
  api: [
    {
      name: 'Express REST API',
      input: {
        framework: 'nodejs',
        files: [
          { name: 'routes/users.js', content: 'router.get("/users", (req, res) => res.json(users));' },
          { name: 'server.js', content: 'app.use("/api", routes);' }
        ]
      },
      expected: { appType: 'api', confidence: 0.85 }
    },
    {
      name: 'Python Flask API',
      input: {
        framework: 'python',
        files: [
          { name: 'app.py', content: '@app.route("/api/users", methods=["GET"])\ndef get_users(): return jsonify(users)' }
        ]
      },
      expected: { appType: 'api', confidence: 0.8 }
    }
  ],
  static: [
    {
      name: 'Static HTML site',
      input: {
        framework: 'unknown',
        files: [
          { name: 'index.html', content: '<!DOCTYPE html><html><head><title>Site</title></head><body><h1>Hello</h1></body></html>' },
          { name: 'style.css', content: 'body { margin: 0; }' },
          { name: 'script.js', content: 'console.log("Hello world");' }
        ]
      },
      expected: { appType: 'static', confidence: 0.8 }
    }
  ]
};

describe('Pattern Matching Algorithms - Comprehensive Accuracy Tests', () => {
  describe('Framework Detection Accuracy (Target: >90%)', () => {
    // Test React detection accuracy
    testCases.react.forEach((testCase, index) => {
      it(`should detect React correctly - Case ${index + 1}: ${testCase.name}`, () => {
        const detector = new FrameworkDetector();
        const result = detector.analyze(testCase.input);
        
        expect(result.framework).toBe('react');
        expect(result.confidence).toBeGreaterThanOrEqual(testCase.expected.confidence);
      });
    });

    // Test Vue detection accuracy
    testCases.vue.forEach((testCase, index) => {
      it(`should detect Vue correctly - Case ${index + 1}: ${testCase.name}`, () => {
        const detector = new FrameworkDetector();
        const result = detector.analyze(testCase.input);
        
        expect(result.framework).toBe('vue');
        expect(result.confidence).toBeGreaterThanOrEqual(testCase.expected.confidence);
      });
    });

    // Test Node.js detection accuracy
    testCases.nodejs.forEach((testCase, index) => {
      it(`should detect Node.js correctly - Case ${index + 1}: ${testCase.name}`, () => {
        const detector = new FrameworkDetector();
        const result = detector.analyze(testCase.input);
        
        expect(result.framework).toBe('nodejs');
        expect(result.confidence).toBeGreaterThanOrEqual(testCase.expected.confidence);
      });
    });

    // Test Python detection accuracy
    testCases.python.forEach((testCase, index) => {
      it(`should detect Python correctly - Case ${index + 1}: ${testCase.name}`, () => {
        const detector = new FrameworkDetector();
        const result = detector.analyze(testCase.input);
        
        expect(result.framework).toBe('python');
        expect(result.confidence).toBeGreaterThanOrEqual(testCase.expected.confidence);
      });
    });

    it('should achieve >90% accuracy across all framework test cases', () => {
      const detector = new FrameworkDetector();
      let correctDetections = 0;
      let totalTests = 0;

      // Test all framework cases
      Object.entries(testCases).forEach(([expectedFramework, cases]) => {
        cases.forEach(testCase => {
          const result = detector.analyze(testCase.input);
          totalTests++;
          
          if (result.framework === expectedFramework && 
              result.confidence >= testCase.expected.confidence) {
            correctDetections++;
          }
        });
      });

      const accuracy = correctDetections / totalTests;
      expect(accuracy).toBeGreaterThan(0.9); // >90% accuracy requirement
    });
  });

  describe('App Type Detection Accuracy (Target: >90%)', () => {
    // Test SPA detection
    appTypeTestCases.spa.forEach((testCase, index) => {
      it(`should detect SPA correctly - Case ${index + 1}: ${testCase.name}`, () => {
        const detector = new AppTypeDetector();
        const frameworkResult = { framework: testCase.input.framework };
        const result = detector.analyze(testCase.input, frameworkResult);
        
        expect(result.appType).toBe('spa');
        expect(result.confidence).toBeGreaterThanOrEqual(testCase.expected.confidence);
      });
    });

    // Test API detection
    appTypeTestCases.api.forEach((testCase, index) => {
      it(`should detect API correctly - Case ${index + 1}: ${testCase.name}`, () => {
        const detector = new AppTypeDetector();
        const frameworkResult = { framework: testCase.input.framework };
        const result = detector.analyze(testCase.input, frameworkResult);
        
        expect(result.appType).toBe('api');
        expect(result.confidence).toBeGreaterThanOrEqual(testCase.expected.confidence);
      });
    });

    // Test Static site detection
    appTypeTestCases.static.forEach((testCase, index) => {
      it(`should detect Static site correctly - Case ${index + 1}: ${testCase.name}`, () => {
        const detector = new AppTypeDetector();
        const frameworkResult = { framework: testCase.input.framework };
        const result = detector.analyze(testCase.input, frameworkResult);
        
        expect(result.appType).toBe('static');
        expect(result.confidence).toBeGreaterThanOrEqual(testCase.expected.confidence);
      });
    });

    it('should achieve >90% accuracy across all app type test cases', () => {
      const detector = new AppTypeDetector();
      let correctDetections = 0;
      let totalTests = 0;

      Object.entries(appTypeTestCases).forEach(([expectedType, cases]) => {
        cases.forEach(testCase => {
          const frameworkResult = { framework: testCase.input.framework };
          const result = detector.analyze(testCase.input, frameworkResult);
          totalTests++;
          
          if (result.appType === expectedType && 
              result.confidence >= testCase.expected.confidence) {
            correctDetections++;
          }
        });
      });

      const accuracy = correctDetections / totalTests;
      expect(accuracy).toBeGreaterThan(0.9); // >90% accuracy requirement
    });
  });
});

describe('Pattern Matching Algorithms', () => {
  describe('detectFramework', () => {
    it('should detect React framework correctly', () => {
      const input = {
        files: [
          { name: 'package.json', content: JSON.stringify(mockReactPackageJson) },
          { name: 'src/App.jsx', content: mockReactAppFile }
        ]
      }

      const result = detectFramework(input)
      
      expect(result.framework).toBe('react')
      expect(result.confidence).toBeGreaterThan(0.8)
    })

    it('should detect Node.js framework correctly', () => {
      const input = {
        files: [
          { name: 'package.json', content: JSON.stringify(mockNodePackageJson) },
          { name: 'server.js', content: mockNodeServerFile }
        ]
      }

      const result = detectFramework(input)
      
      expect(result.framework).toBe('nodejs')
      expect(result.confidence).toBeGreaterThan(0.8)
    })

    it('should handle unknown frameworks with low confidence', () => {
      const input = {
        files: [
          { name: 'index.html', content: '<html><body>Hello World</body></html>' }
        ]
      }

      const result = detectFramework(input)
      
      expect(result.framework).toBe('unknown')
      expect(result.confidence).toBeLessThan(0.5)
    })

    it('should detect Vue framework from package.json and .vue files', () => {
      const vuePackageJson = {
        dependencies: { vue: '^3.0.0', '@vue/cli-service': '^5.0.0' }
      }
      const vueComponent = `
        <template>
          <div>{{ message }}</div>
        </template>
        <script>
        export default {
          data() {
            return { message: 'Hello Vue!' }
          }
        }
        </script>
      `

      const input = {
        files: [
          { name: 'package.json', content: JSON.stringify(vuePackageJson) },
          { name: 'src/App.vue', content: vueComponent }
        ]
      }

      const result = detectFramework(input)
      
      expect(result.framework).toBe('vue')
      expect(result.confidence).toBeGreaterThan(0.8)
    })
  })

  describe('detectAppType', () => {
    it('should detect SPA type for React applications', () => {
      const input = {
        framework: 'react',
        files: [
          { name: 'src/App.jsx', content: mockReactAppFile },
          { name: 'public/index.html', content: '<div id="root"></div>' }
        ]
      }

      const result = detectAppType(input)
      
      expect(result.appType).toBe('spa')
      expect(result.confidence).toBeGreaterThan(0.7)
    })

    it('should detect API type for Express applications', () => {
      const input = {
        framework: 'nodejs',
        files: [
          { name: 'server.js', content: mockNodeServerFile }
        ]
      }

      const result = detectAppType(input)
      
      expect(result.appType).toBe('api')
      expect(result.confidence).toBeGreaterThan(0.7)
    })

    it('should detect full-stack applications', () => {
      const input = {
        framework: 'nodejs',
        files: [
          { name: 'server.js', content: mockNodeServerFile },
          { name: 'client/src/App.jsx', content: mockReactAppFile },
          { name: 'client/package.json', content: JSON.stringify(mockReactPackageJson) }
        ]
      }

      const result = detectAppType(input)
      
      expect(result.appType).toBe('fullstack')
      expect(result.confidence).toBeGreaterThan(0.7)
    })

    it('should detect static sites', () => {
      const input = {
        framework: 'unknown',
        files: [
          { name: 'index.html', content: '<html><body><h1>Static Site</h1></body></html>' },
          { name: 'style.css', content: 'body { margin: 0; }' },
          { name: 'script.js', content: 'console.log("Hello");' }
        ]
      }

      const result = detectAppType(input)
      
      expect(result.appType).toBe('static')
      expect(result.confidence).toBeGreaterThan(0.6)
    })
  })

  describe('Infrastructure Detection Accuracy (Target: >90%)', () => {
    const infrastructureTestCases = {
      database: [
        {
          name: 'MongoDB with Mongoose',
          input: {
            files: [
              { name: 'server.js', content: 'const mongoose = require("mongoose"); mongoose.connect("mongodb://localhost");' },
              { name: 'package.json', content: JSON.stringify({ dependencies: { mongoose: '^6.0.0' } }) }
            ]
          },
          expected: { database: 'required', databaseType: 'nosql', confidence: 0.8 }
        },
        {
          name: 'PostgreSQL with Sequelize',
          input: {
            files: [
              { name: 'models/user.js', content: 'const { Sequelize, DataTypes } = require("sequelize"); const sequelize = new Sequelize("postgres://");' },
              { name: 'package.json', content: JSON.stringify({ dependencies: { sequelize: '^6.0.0', pg: '^8.0.0' } }) }
            ]
          },
          expected: { database: 'required', databaseType: 'sql', confidence: 0.8 }
        },
        {
          name: 'SQLite with raw SQL',
          input: {
            files: [
              { name: 'db.js', content: 'CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT);' },
              { name: 'package.json', content: JSON.stringify({ dependencies: { sqlite3: '^5.0.0' } }) }
            ]
          },
          expected: { database: 'required', databaseType: 'sql', confidence: 0.7 }
        }
      ],
      auth: [
        {
          name: 'JWT Authentication',
          input: {
            files: [
              { name: 'auth.js', content: 'const jwt = require("jsonwebtoken"); const token = jwt.sign({userId: 1}, "secret");' },
              { name: 'package.json', content: JSON.stringify({ dependencies: { jsonwebtoken: '^8.0.0', bcrypt: '^5.0.0' } }) }
            ]
          },
          expected: { auth: true, authType: 'jwt', confidence: 0.8 }
        },
        {
          name: 'Passport.js Authentication',
          input: {
            files: [
              { name: 'passport.js', content: 'const passport = require("passport"); passport.use(new LocalStrategy());' },
              { name: 'package.json', content: JSON.stringify({ dependencies: { passport: '^0.6.0', 'passport-local': '^1.0.0' } }) }
            ]
          },
          expected: { auth: true, authType: 'jwt', confidence: 0.7 }
        }
      ],
      storage: [
        {
          name: 'Multer File Upload',
          input: {
            files: [
              { name: 'upload.js', content: 'const multer = require("multer"); const upload = multer({dest: "uploads/"});' },
              { name: 'package.json', content: JSON.stringify({ dependencies: { multer: '^1.4.0' } }) }
            ]
          },
          expected: { storage: true, storageType: 'file-upload', confidence: 0.8 }
        },
        {
          name: 'AWS S3 Integration',
          input: {
            files: [
              { name: 's3.js', content: 'const AWS = require("aws-sdk"); const s3 = new AWS.S3(); s3.upload(params);' },
              { name: 'package.json', content: JSON.stringify({ dependencies: { 'aws-sdk': '^2.0.0' } }) }
            ]
          },
          expected: { storage: true, storageType: 'file-upload', confidence: 0.7 }
        }
      ],
      realtime: [
        {
          name: 'Socket.IO WebSockets',
          input: {
            files: [
              { name: 'socket.js', content: 'const io = require("socket.io")(server); io.on("connection", (socket) => {});' },
              { name: 'package.json', content: JSON.stringify({ dependencies: { 'socket.io': '^4.0.0' } }) }
            ]
          },
          expected: { realtime: true, realtimeType: 'websockets', confidence: 0.8 }
        },
        {
          name: 'Native WebSocket',
          input: {
            files: [
              { name: 'websocket.js', content: 'const WebSocket = require("ws"); const wss = new WebSocket.Server({port: 8080});' },
              { name: 'package.json', content: JSON.stringify({ dependencies: { ws: '^8.0.0' } }) }
            ]
          },
          expected: { realtime: true, realtimeType: 'websockets', confidence: 0.7 }
        }
      ]
    };

    // Test each infrastructure category
    Object.entries(infrastructureTestCases).forEach(([category, cases]) => {
      cases.forEach((testCase, index) => {
        it(`should detect ${category} correctly - Case ${index + 1}: ${testCase.name}`, () => {
          const detector = new InfrastructureDetector();
          const result = detector.analyze(testCase.input);
          
          if (category === 'database') {
            expect(result.requirements.database?.required).toBe(testCase.expected.database === 'required');
            if (result.requirements.database?.required) {
              expect(result.requirements.database.type).toBe(testCase.expected.databaseType);
            }
          } else {
            expect(result.requirements[category]?.required).toBe(testCase.expected[category]);
          }
          
          expect(result.confidence).toBeGreaterThanOrEqual(testCase.expected.confidence - 0.2); // Allow some tolerance
        });
      });
    });

    it('should achieve >90% accuracy across all infrastructure test cases', () => {
      const detector = new InfrastructureDetector();
      let correctDetections = 0;
      let totalTests = 0;

      Object.entries(infrastructureTestCases).forEach(([category, cases]) => {
        cases.forEach(testCase => {
          const result = detector.analyze(testCase.input);
          totalTests++;
          
          let isCorrect = false;
          
          if (category === 'database') {
            const hasDatabase = result.requirements.database?.required;
            const correctType = result.requirements.database?.type === testCase.expected.databaseType;
            isCorrect = hasDatabase && correctType;
          } else {
            isCorrect = result.requirements[category]?.required === testCase.expected[category];
          }
          
          if (isCorrect) {
            correctDetections++;
          }
        });
      });

      const accuracy = correctDetections / totalTests;
      expect(accuracy).toBeGreaterThan(0.9); // >90% accuracy requirement
    });

    // Original tests for backward compatibility
    it('should detect database requirements', () => {
      const input = {
        files: [
          { name: 'server.js', content: 'const mongoose = require("mongoose");' },
          { name: 'package.json', content: JSON.stringify({ dependencies: { mongoose: '^6.0.0' } }) }
        ]
      }

      const result = detectInfrastructure(input)
      
      expect(result.database).toBe('required')
      expect(result.databaseType).toBe('nosql')
      expect(result.confidence).toBeGreaterThan(0.6)
    })

    it('should detect authentication requirements', () => {
      const authCode = `
        const jwt = require('jsonwebtoken');
        const bcrypt = require('bcrypt');
        
        app.post('/login', async (req, res) => {
          const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
          res.json({ token });
        });
      `

      const input = {
        files: [
          { name: 'auth.js', content: authCode },
          { name: 'package.json', content: JSON.stringify({ dependencies: { jsonwebtoken: '^8.0.0', bcrypt: '^5.0.0' } }) }
        ]
      }

      const result = detectInfrastructure(input)
      
      expect(result.auth).toBe(true)
      expect(result.authType).toBe('jwt')
      expect(result.confidence).toBeGreaterThan(0.7)
    })

    it('should detect file storage requirements', () => {
      const storageCode = `
        const multer = require('multer');
        const upload = multer({ dest: 'uploads/' });
        
        app.post('/upload', upload.single('file'), (req, res) => {
          res.json({ filename: req.file.filename });
        });
      `

      const input = {
        files: [
          { name: 'upload.js', content: storageCode },
          { name: 'package.json', content: JSON.stringify({ dependencies: { multer: '^1.4.0' } }) }
        ]
      }

      const result = detectInfrastructure(input)
      
      expect(result.storage).toBe(true)
      expect(result.storageType).toBe('file-upload')
    })

    it('should detect real-time requirements', () => {
      const realtimeCode = `
        const io = require('socket.io')(server);
        
        io.on('connection', (socket) => {
          socket.on('message', (data) => {
            io.emit('message', data);
          });
        });
      `

      const input = {
        files: [
          { name: 'socket.js', content: realtimeCode },
          { name: 'package.json', content: JSON.stringify({ dependencies: { 'socket.io': '^4.0.0' } }) }
        ]
      }

      const result = detectInfrastructure(input)
      
      expect(result.realtime).toBe(true)
      expect(result.realtimeType).toBe('websockets')
    })
  })

  describe('calculatePatternConfidence', () => {
    it('should calculate high confidence for clear patterns', () => {
      const patterns = {
        fileIndicators: 0.9,
        dependencyIndicators: 0.8,
        contentPatterns: 0.85,
        structurePatterns: 0.7
      }

      const confidence = calculatePatternConfidence(patterns)
      
      expect(confidence).toBeGreaterThan(0.8)
      expect(confidence).toBeLessThanOrEqual(1.0)
    })

    it('should calculate low confidence for unclear patterns', () => {
      const patterns = {
        fileIndicators: 0.3,
        dependencyIndicators: 0.2,
        contentPatterns: 0.4,
        structurePatterns: 0.1
      }

      const confidence = calculatePatternConfidence(patterns)
      
      expect(confidence).toBeLessThan(0.5)
      expect(confidence).toBeGreaterThanOrEqual(0.0)
    })

    it('should weight dependency indicators most heavily', () => {
      const highDependency = {
        fileIndicators: 0.1,
        dependencyIndicators: 0.9,
        contentPatterns: 0.1,
        structurePatterns: 0.1
      }

      const highFile = {
        fileIndicators: 0.9,
        dependencyIndicators: 0.1,
        contentPatterns: 0.1,
        structurePatterns: 0.1
      }

      const confidenceHighDep = calculatePatternConfidence(highDependency)
      const confidenceHighFile = calculatePatternConfidence(highFile)
      
      expect(confidenceHighDep).toBeGreaterThan(confidenceHighFile)
    })
  })

  describe('Complete Pattern Analysis Accuracy (Target: >90%)', () => {
    const completeTestCases = [
      {
        name: 'React E-commerce SPA',
        input: {
          description: 'React e-commerce application with shopping cart and user authentication',
          files: [
            { 
              name: 'package.json', 
              content: JSON.stringify({
                dependencies: { 
                  react: '^18.2.0', 
                  'react-dom': '^18.2.0', 
                  'react-router-dom': '^6.0.0',
                  axios: '^1.0.0'
                },
                scripts: { build: 'react-scripts build' }
              })
            },
            { 
              name: 'src/App.jsx', 
              content: 'import React from "react"; import { BrowserRouter, Routes } from "react-router-dom"; function App() { return <BrowserRouter><Routes></Routes></BrowserRouter>; }'
            },
            {
              name: 'src/components/Cart.jsx',
              content: 'import React, { useState } from "react"; export default function Cart() { const [items, setItems] = useState([]); }'
            }
          ]
        },
        expected: {
          framework: 'react',
          appType: 'spa',
          minConfidence: 0.8
        }
      },
      {
        name: 'Node.js REST API with MongoDB',
        input: {
          description: 'Node.js REST API with MongoDB database and JWT authentication',
          files: [
            {
              name: 'package.json',
              content: JSON.stringify({
                dependencies: {
                  express: '^4.18.0',
                  mongoose: '^6.0.0',
                  jsonwebtoken: '^8.5.0',
                  bcrypt: '^5.0.0',
                  cors: '^2.8.5'
                },
                scripts: { start: 'node server.js' }
              })
            },
            {
              name: 'server.js',
              content: 'const express = require("express"); const mongoose = require("mongoose"); const jwt = require("jsonwebtoken"); const app = express(); mongoose.connect("mongodb://localhost"); app.listen(3000);'
            },
            {
              name: 'routes/auth.js',
              content: 'const router = express.Router(); router.post("/login", async (req, res) => { const token = jwt.sign({userId: user.id}, "secret"); res.json({token}); });'
            }
          ]
        },
        expected: {
          framework: 'nodejs',
          appType: 'api',
          hasDatabase: true,
          hasAuth: true,
          minConfidence: 0.8
        }
      },
      {
        name: 'Python Flask API with PostgreSQL',
        input: {
          description: 'Python Flask API with PostgreSQL database',
          files: [
            {
              name: 'requirements.txt',
              content: 'Flask==2.3.0\npsycopg2==2.9.0\nSQLAlchemy==1.4.0\nFlask-JWT-Extended==4.4.0'
            },
            {
              name: 'app.py',
              content: 'from flask import Flask, jsonify\nfrom flask_sqlalchemy import SQLAlchemy\nfrom flask_jwt_extended import JWTManager\n\napp = Flask(__name__)\ndb = SQLAlchemy(app)\n\n@app.route("/api/users")\ndef get_users():\n    return jsonify([])\n\nif __name__ == "__main__":\n    app.run()'
            }
          ]
        },
        expected: {
          framework: 'python',
          appType: 'api',
          hasDatabase: true,
          hasAuth: true,
          minConfidence: 0.75
        }
      },
      {
        name: 'Static Portfolio Website',
        input: {
          description: 'Static portfolio website with HTML, CSS, and JavaScript',
          files: [
            {
              name: 'index.html',
              content: '<!DOCTYPE html><html><head><title>Portfolio</title><link rel="stylesheet" href="style.css"></head><body><h1>My Portfolio</h1><script src="script.js"></script></body></html>'
            },
            {
              name: 'style.css',
              content: 'body { font-family: Arial, sans-serif; margin: 0; padding: 20px; } h1 { color: #333; }'
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
          minConfidence: 0.7
        }
      }
    ];

    completeTestCases.forEach((testCase, index) => {
      it(`should analyze complete application correctly - Case ${index + 1}: ${testCase.name}`, async () => {
        const analyzer = new PatternAnalyzer();
        const result = await analyzer.analyzeApplication(testCase.input);
        
        // Check framework detection
        expect(result.framework.framework).toBe(testCase.expected.framework);
        expect(result.framework.confidence).toBeGreaterThanOrEqual(testCase.expected.minConfidence);
        
        // Check app type detection
        expect(result.appType.appType).toBe(testCase.expected.appType);
        expect(result.appType.confidence).toBeGreaterThanOrEqual(testCase.expected.minConfidence);
        
        // Check infrastructure detection if expected
        if (testCase.expected.hasDatabase) {
          expect(result.infrastructure.requirements.database?.required).toBe(true);
        }
        
        if (testCase.expected.hasAuth) {
          expect(result.infrastructure.requirements.auth?.required).toBe(true);
        }
        
        // Check overall confidence
        expect(result.confidence).toBeGreaterThanOrEqual(testCase.expected.minConfidence);
      });
    });

    it('should achieve >90% overall accuracy across all complete test cases', async () => {
      const analyzer = new PatternAnalyzer();
      let correctAnalyses = 0;
      let totalTests = completeTestCases.length;

      for (const testCase of completeTestCases) {
        try {
          const result = await analyzer.analyzeApplication(testCase.input);
          
          const frameworkCorrect = result.framework.framework === testCase.expected.framework;
          const appTypeCorrect = result.appType.appType === testCase.expected.appType;
          const confidenceGood = result.confidence >= testCase.expected.minConfidence;
          
          let infrastructureCorrect = true;
          if (testCase.expected.hasDatabase) {
            infrastructureCorrect = infrastructureCorrect && result.infrastructure.requirements.database?.required;
          }
          if (testCase.expected.hasAuth) {
            infrastructureCorrect = infrastructureCorrect && result.infrastructure.requirements.auth?.required;
          }
          
          if (frameworkCorrect && appTypeCorrect && confidenceGood && infrastructureCorrect) {
            correctAnalyses++;
          }
        } catch (error) {
          // Analysis failure counts as incorrect
          console.error(`Analysis failed for ${testCase.name}:`, error);
        }
      }

      const overallAccuracy = correctAnalyses / totalTests;
      expect(overallAccuracy).toBeGreaterThan(0.9); // >90% accuracy requirement
    });
  })

  describe('Pattern Matching Edge Cases and Robustness', () => {
    it('should handle empty input gracefully', () => {
      const detector = new FrameworkDetector();
      const result = detector.analyze({ files: [], description: '' });
      
      expect(result.framework).toBe('unknown');
      expect(result.confidence).toBe(0);
    });

    it('should handle malformed package.json', () => {
      const detector = new FrameworkDetector();
      const result = detector.analyze({
        files: [
          { name: 'package.json', content: 'invalid json content' }
        ]
      });
      
      expect(result.framework).toBe('unknown');
      expect(result.confidence).toBe(0);
    });

    it('should handle conflicting framework indicators', () => {
      const detector = new FrameworkDetector();
      const result = detector.analyze({
        files: [
          { 
            name: 'package.json', 
            content: JSON.stringify({
              dependencies: { react: '^18.0.0', vue: '^3.0.0' } // Conflicting frameworks
            })
          }
        ]
      });
      
      // Should pick the one with higher confidence
      expect(['react', 'vue']).toContain(result.framework);
      expect(result.alternatives).toBeDefined();
      expect(result.alternatives.length).toBeGreaterThan(0);
    });

    it('should maintain confidence scoring consistency', () => {
      const detector = new FrameworkDetector();
      
      // Test the same input multiple times
      const input = {
        files: [
          { name: 'package.json', content: JSON.stringify(mockReactPackageJson) },
          { name: 'src/App.jsx', content: mockReactAppFile }
        ]
      };
      
      const results = Array.from({ length: 5 }, () => detector.analyze(input));
      
      // All results should be identical
      results.forEach(result => {
        expect(result.framework).toBe(results[0].framework);
        expect(result.confidence).toBe(results[0].confidence);
      });
    });
  });
});