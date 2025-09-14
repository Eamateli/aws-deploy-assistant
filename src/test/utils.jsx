import { render } from '@testing-library/react'
import { AppProvider } from '../context/AppContext'
import { ErrorProvider } from '../context/ErrorContext'

// Custom render function that includes providers
export function renderWithProviders(ui, options = {}) {
  const { initialState, ...renderOptions } = options

  function Wrapper({ children }) {
    return (
      <ErrorProvider>
        <AppProvider initialState={initialState}>
          {children}
        </AppProvider>
      </ErrorProvider>
    )
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  }
}

// Mock data for testing
export const mockReactPackageJson = {
  name: 'test-react-app',
  dependencies: {
    react: '^18.2.0',
    'react-dom': '^18.2.0',
    'react-router-dom': '^6.0.0'
  },
  scripts: {
    start: 'react-scripts start',
    build: 'react-scripts build'
  }
}

export const mockNodePackageJson = {
  name: 'test-node-api',
  dependencies: {
    express: '^4.18.0',
    cors: '^2.8.5',
    mongoose: '^6.0.0'
  },
  scripts: {
    start: 'node server.js',
    dev: 'nodemon server.js'
  }
}

export const mockReactAppFile = `
import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData);
  }, []);

  return (
    <div className="App">
      <h1>React App</h1>
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}

export default App;
`

export const mockNodeServerFile = `
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/testdb');

app.get('/api/data', (req, res) => {
  res.json([{ id: 1, name: 'Test' }]);
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`

export const mockAnalysisInput = {
  description: 'React e-commerce application with shopping cart',
  files: [
    {
      name: 'package.json',
      content: JSON.stringify(mockReactPackageJson),
      type: 'config',
      size: 1024
    },
    {
      name: 'src/App.jsx',
      content: mockReactAppFile,
      type: 'source',
      size: 2048
    }
  ]
}

export const mockArchitecture = {
  id: 'static-spa',
  name: 'Static SPA Hosting',
  description: 'Serverless hosting for React SPAs using S3 and CloudFront',
  services: [
    {
      service: 'S3',
      purpose: 'Static file hosting',
      required: true,
      config: {
        bucketPolicy: 'public-read',
        websiteHosting: true
      }
    },
    {
      service: 'CloudFront',
      purpose: 'Global CDN and HTTPS',
      required: true,
      config: {
        viewerProtocolPolicy: 'redirect-to-https'
      }
    }
  ],
  cost: {
    monthly: { min: 5, max: 25, typical: 12 },
    freeTierEligible: true
  },
  complexity: 2,
  scalability: 5
}