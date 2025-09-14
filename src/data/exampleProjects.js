// Example project data for quick testing and demonstration

export const exampleProjects = {
  'react-spa': {
    name: 'React E-commerce SPA',
    description: 'A modern React single-page application for e-commerce with shopping cart, product catalog, and user authentication.',
    files: [
      {
        name: 'package.json',
        content: JSON.stringify({
          "name": "react-ecommerce-spa",
          "version": "1.0.0",
          "private": true,
          "dependencies": {
            "react": "^18.2.0",
            "react-dom": "^18.2.0",
            "react-router-dom": "^6.8.0",
            "react-scripts": "5.0.1",
            "axios": "^1.3.0",
            "styled-components": "^5.3.6",
            "@stripe/stripe-js": "^1.46.0",
            "react-query": "^3.39.0"
          },
          "devDependencies": {
            "@testing-library/jest-dom": "^5.16.4",
            "@testing-library/react": "^13.4.0",
            "@testing-library/user-event": "^13.5.0",
            "web-vitals": "^2.1.4"
          },
          "scripts": {
            "start": "react-scripts start",
            "build": "react-scripts build",
            "test": "react-scripts test",
            "eject": "react-scripts eject"
          },
          "eslintConfig": {
            "extends": [
              "react-app",
              "react-app/jest"
            ]
          },
          "browserslist": {
            "production": [
              ">0.2%",
              "not dead",
              "not op_mini all"
            ],
            "development": [
              "last 1 chrome version",
              "last 1 firefox version",
              "last 1 safari version"
            ]
          }
        }, null, 2)
      },
      {
        name: 'src/App.jsx',
        content: `import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider } from 'styled-components';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';

import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';

const queryClient = new QueryClient();

const theme = {
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    success: '#28a745',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8',
    light: '#f8f9fa',
    dark: '#343a40'
  }
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <CartProvider>
            <Router>
              <div className="App">
                <Header />
                <main>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/products/:id" element={<ProductDetailPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/login" element={<LoginPage />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </Router>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;`
      },
      {
        name: 'src/components/ProductCard.jsx',
        content: `import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import styled from 'styled-components';

const Card = styled.div\`
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  transition: box-shadow 0.2s;
  
  &:hover {
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
\`;

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product);
  };

  return (
    <Card>
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <div className="price">$\{product.price}</div>
      <div className="actions">
        <Link to={\`/products/\${product.id}\`}>View Details</Link>
        <button onClick={handleAddToCart}>Add to Cart</button>
      </div>
    </Card>
  );
};

export default ProductCard;`
      }
    ]
  },

  'nodejs-api': {
    name: 'Node.js REST API',
    description: 'A RESTful API built with Express.js, featuring user authentication, database integration, and comprehensive error handling.',
    files: [
      {
        name: 'package.json',
        content: JSON.stringify({
          "name": "nodejs-rest-api",
          "version": "1.0.0",
          "description": "RESTful API with Express.js and MongoDB",
          "main": "server.js",
          "scripts": {
            "start": "node server.js",
            "dev": "nodemon server.js",
            "test": "jest"
          },
          "dependencies": {
            "express": "^4.18.2",
            "mongoose": "^6.8.4",
            "bcryptjs": "^2.4.3",
            "jsonwebtoken": "^9.0.0",
            "cors": "^2.8.5",
            "helmet": "^6.0.1",
            "express-rate-limit": "^6.7.0",
            "dotenv": "^16.0.3",
            "joi": "^17.7.0",
            "multer": "^1.4.5-lts.1"
          },
          "devDependencies": {
            "nodemon": "^2.0.20",
            "jest": "^29.3.1",
            "supertest": "^6.3.3"
          },
          "keywords": ["nodejs", "express", "api", "mongodb", "rest"],
          "author": "Developer",
          "license": "MIT"
        }, null, 2)
      },
      {
        name: 'server.js',
        content: `const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});

module.exports = app;`
      },
      {
        name: 'routes/products.js',
        content: `const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const { validateProduct } = require('../middleware/validation');

// GET /api/products - Get all products
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    const query = {};
    
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/products - Create new product (admin only)
router.post('/', auth, validateProduct, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;`
      }
    ]
  },

  'fullstack': {
    name: 'Full-Stack MERN Application',
    description: 'Complete MERN stack application with React frontend, Express backend, MongoDB database, and user authentication.',
    files: [
      {
        name: 'package.json',
        content: JSON.stringify({
          "name": "mern-fullstack-app",
          "version": "1.0.0",
          "description": "Full-stack MERN application",
          "main": "server.js",
          "scripts": {
            "start": "node server.js",
            "server": "nodemon server.js",
            "client": "npm start --prefix client",
            "dev": "concurrently \"npm run server\" \"npm run client\"",
            "build": "npm run build --prefix client",
            "heroku-postbuild": "npm install --prefix client && npm run build --prefix client"
          },
          "dependencies": {
            "express": "^4.18.2",
            "mongoose": "^6.8.4",
            "bcryptjs": "^2.4.3",
            "jsonwebtoken": "^9.0.0",
            "cors": "^2.8.5",
            "dotenv": "^16.0.3",
            "path": "^0.12.7"
          },
          "devDependencies": {
            "nodemon": "^2.0.20",
            "concurrently": "^7.6.0"
          },
          "keywords": ["mern", "fullstack", "react", "express", "mongodb"],
          "author": "Developer",
          "license": "MIT"
        }, null, 2)
      },
      {
        name: 'server.js',
        content: `const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mernapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/posts', require('./routes/posts'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));`
      },
      {
        name: 'client/package.json',
        content: JSON.stringify({
          "name": "mern-client",
          "version": "1.0.0",
          "private": true,
          "proxy": "http://localhost:5000",
          "dependencies": {
            "react": "^18.2.0",
            "react-dom": "^18.2.0",
            "react-router-dom": "^6.8.0",
            "axios": "^1.3.0",
            "react-scripts": "5.0.1"
          },
          "scripts": {
            "start": "react-scripts start",
            "build": "react-scripts build",
            "test": "react-scripts test",
            "eject": "react-scripts eject"
          },
          "eslintConfig": {
            "extends": ["react-app", "react-app/jest"]
          },
          "browserslist": {
            "production": [">0.2%", "not dead", "not op_mini all"],
            "development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
          }
        }, null, 2)
      }
    ]
  }
};

// Helper function to get example project by type
export const getExampleProject = (type) => {
  return exampleProjects[type] || null;
};

// Helper function to get all available example types
export const getAvailableExamples = () => {
  return Object.keys(exampleProjects);
};