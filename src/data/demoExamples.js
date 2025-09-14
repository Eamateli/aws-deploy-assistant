// Demo Examples for AWS Deploy Assistant
// Realistic application examples for demonstration purposes

export const demoExamples = {
  // React E-commerce Application
  reactEcommerce: {
    id: 'react-ecommerce',
    name: 'React E-commerce Store',
    description: 'Modern e-commerce application built with React, featuring shopping cart, user authentication, and payment processing',
    category: 'E-commerce',
    complexity: 'Medium',
    files: [
      {
        name: 'package.json',
        content: JSON.stringify({
          "name": "react-ecommerce-store",
          "version": "1.0.0",
          "private": true,
          "dependencies": {
            "react": "^18.2.0",
            "react-dom": "^18.2.0",
            "react-router-dom": "^6.8.0",
            "react-query": "^3.39.0",
            "axios": "^1.3.0",
            "stripe": "^11.1.0",
            "@reduxjs/toolkit": "^1.9.0",
            "react-redux": "^8.0.5",
            "tailwindcss": "^3.2.0",
            "framer-motion": "^9.0.0"
          },
          "scripts": {
            "start": "react-scripts start",
            "build": "react-scripts build",
            "test": "react-scripts test",
            "eject": "react-scripts eject"
          },
          "devDependencies": {
            "react-scripts": "5.0.1"
          }
        }, null, 2),
        type: 'config'
      },
      {
        name: 'src/App.jsx',
        content: `import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { store } from './store/store';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="App">
            <Header />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
            </Routes>
          </div>
        </Router>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;`,
        type: 'source'
      },
      {
        name: 'src/components/ProductCard.jsx',
        content: `import React from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { motion } from 'framer-motion';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();

  const handleAddToCart = () => {
    dispatch(addToCart(product));
  };

  return (
    <motion.div 
      className="bg-white rounded-lg shadow-md overflow-hidden"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <img 
        src={product.image} 
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
        <p className="text-gray-600 mb-2">{product.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-green-600">
            \${product.price}
          </span>
          <button
            onClick={handleAddToCart}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;`,
        type: 'source'
      },
      {
        name: '.env',
        content: `REACT_APP_API_URL=https://api.example.com
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_example
REACT_APP_ANALYTICS_ID=GA-XXXXXXXXX`,
        type: 'config'
      }
    ],
    expectedAnalysis: {
      framework: 'react',
      appType: 'spa',
      database: 'external',
      auth: true,
      realtime: false,
      storage: true,
      expectedTraffic: 'medium',
      complexity: 3,
      confidence: 0.92
    },
    recommendedArchitecture: 'static-spa',
    estimatedCost: { min: 15, max: 75, typical: 35 }
  },

  // Node.js REST API
  nodejsApi: {
    id: 'nodejs-api',
    name: 'Node.js REST API',
    description: 'RESTful API server built with Express.js, featuring user authentication, database integration, and file uploads',
    category: 'Backend API',
    complexity: 'Medium',
    files: [
      {
        name: 'package.json',
        content: JSON.stringify({
          "name": "nodejs-rest-api",
          "version": "1.0.0",
          "description": "RESTful API with Express and MongoDB",
          "main": "server.js",
          "scripts": {
            "start": "node server.js",
            "dev": "nodemon server.js",
            "test": "jest"
          },
          "dependencies": {
            "express": "^4.18.2",
            "mongoose": "^6.9.0",
            "bcryptjs": "^2.4.3",
            "jsonwebtoken": "^9.0.0",
            "cors": "^2.8.5",
            "helmet": "^6.0.1",
            "express-rate-limit": "^6.7.0",
            "multer": "^1.4.5",
            "dotenv": "^16.0.3",
            "joi": "^17.7.0"
          },
          "devDependencies": {
            "nodemon": "^2.0.20",
            "jest": "^29.4.0",
            "supertest": "^6.3.3"
          }
        }, null, 2),
        type: 'config'
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
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});

module.exports = app;`,
        type: 'source'
      },
      {
        name: 'models/User.js',
        content: `const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\\S+@\\S+\\.\\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  profile: {
    firstName: String,
    lastName: String,
    avatar: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);`,
        type: 'source'
      },
      {
        name: '.env',
        content: `NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://localhost:27017/myapp
JWT_SECRET=your-super-secret-jwt-key
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1`,
        type: 'config'
      }
    ],
    expectedAnalysis: {
      framework: 'nodejs',
      appType: 'api',
      database: 'required',
      auth: true,
      realtime: false,
      storage: true,
      expectedTraffic: 'medium',
      complexity: 3,
      confidence: 0.89
    },
    recommendedArchitecture: 'serverless-api',
    estimatedCost: { min: 25, max: 150, typical: 65 }
  },

  // Full-stack Application
  fullStackApp: {
    id: 'fullstack-app',
    name: 'Full-Stack Social Platform',
    description: 'Complete social media platform with React frontend, Node.js backend, real-time messaging, and file uploads',
    category: 'Social Platform',
    complexity: 'High',
    files: [
      {
        name: 'package.json',
        content: JSON.stringify({
          "name": "social-platform-monorepo",
          "version": "1.0.0",
          "private": true,
          "workspaces": [
            "client",
            "server"
          ],
          "scripts": {
            "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
            "dev:server": "cd server && npm run dev",
            "dev:client": "cd client && npm start",
            "build": "npm run build:client && npm run build:server",
            "build:client": "cd client && npm run build",
            "build:server": "cd server && npm run build"
          },
          "devDependencies": {
            "concurrently": "^7.6.0"
          }
        }, null, 2),
        type: 'config'
      },
      {
        name: 'client/package.json',
        content: JSON.stringify({
          "name": "social-platform-client",
          "version": "1.0.0",
          "dependencies": {
            "react": "^18.2.0",
            "react-dom": "^18.2.0",
            "socket.io-client": "^4.6.0",
            "axios": "^1.3.0",
            "react-router-dom": "^6.8.0",
            "@reduxjs/toolkit": "^1.9.0",
            "react-redux": "^8.0.5",
            "react-hook-form": "^7.43.0",
            "react-dropzone": "^14.2.0",
            "emoji-picker-react": "^4.4.0",
            "moment": "^2.29.0"
          }
        }, null, 2),
        type: 'config'
      },
      {
        name: 'server/package.json',
        content: JSON.stringify({
          "name": "social-platform-server",
          "version": "1.0.0",
          "dependencies": {
            "express": "^4.18.2",
            "socket.io": "^4.6.0",
            "mongoose": "^6.9.0",
            "redis": "^4.6.0",
            "aws-sdk": "^2.1320.0",
            "multer": "^1.4.5",
            "multer-s3": "^3.0.1",
            "bcryptjs": "^2.4.3",
            "jsonwebtoken": "^9.0.0",
            "nodemailer": "^6.9.0",
            "bull": "^4.10.0"
          }
        }, null, 2),
        type: 'config'
      },
      {
        name: 'client/src/App.jsx',
        content: `import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { SocketProvider } from './context/SocketContext';
import Header from './components/Header';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Login from './pages/Login';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <Provider store={store}>
      <SocketProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            {user && <Header />}
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Feed />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/messages" element={<Messages />} />
            </Routes>
          </div>
        </Router>
      </SocketProvider>
    </Provider>
  );
}

export default App;`,
        type: 'source'
      },
      {
        name: 'server/server.js',
        content: `const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const redis = require('redis');
const AWS = require('aws-sdk');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"]
  }
});

// Redis client for session management
const redisClient = redis.createClient({
  url: process.env.REDIS_URL
});

// AWS S3 configuration
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
  });
  
  socket.on('send_message', (data) => {
    io.to(data.roomId).emit('receive_message', data);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`,
        type: 'source'
      },
      {
        name: 'docker-compose.yml',
        content: `version: '3.8'
services:
  client:
    build: ./client
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:5000
    depends_on:
      - server

  server:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/socialplatform
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongo
      - redis

  mongo:
    image: mongo:5.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  mongo_data:`,
        type: 'config'
      }
    ],
    expectedAnalysis: {
      framework: 'fullstack',
      appType: 'fullstack',
      database: 'required',
      auth: true,
      realtime: true,
      storage: true,
      expectedTraffic: 'high',
      complexity: 5,
      confidence: 0.95
    },
    recommendedArchitecture: 'container-based',
    estimatedCost: { min: 100, max: 500, typical: 250 }
  },

  // Static Portfolio Site
  staticPortfolio: {
    id: 'static-portfolio',
    name: 'Developer Portfolio',
    description: 'Clean, modern portfolio website built with vanilla HTML, CSS, and JavaScript',
    category: 'Portfolio',
    complexity: 'Low',
    files: [
      {
        name: 'package.json',
        content: JSON.stringify({
          "name": "developer-portfolio",
          "version": "1.0.0",
          "description": "Personal portfolio website",
          "scripts": {
            "build": "npm run build:css && npm run build:js",
            "build:css": "tailwindcss -i ./src/styles.css -o ./dist/styles.css --minify",
            "build:js": "webpack --mode=production",
            "dev": "live-server --port=3000"
          },
          "devDependencies": {
            "tailwindcss": "^3.2.0",
            "webpack": "^5.75.0",
            "webpack-cli": "^5.0.0",
            "live-server": "^1.2.2"
          }
        }, null, 2),
        type: 'config'
      },
      {
        name: 'index.html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>John Doe - Full Stack Developer</title>
    <link rel="stylesheet" href="dist/styles.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body class="font-inter bg-gray-50">
    <!-- Navigation -->
    <nav class="fixed top-0 w-full bg-white shadow-sm z-50">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center py-4">
                <div class="text-xl font-bold text-gray-900">John Doe</div>
                <div class="hidden md:flex space-x-8">
                    <a href="#about" class="text-gray-600 hover:text-gray-900">About</a>
                    <a href="#projects" class="text-gray-600 hover:text-gray-900">Projects</a>
                    <a href="#contact" class="text-gray-600 hover:text-gray-900">Contact</a>
                </div>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="pt-20 pb-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center">
                <h1 class="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                    Full Stack Developer
                </h1>
                <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                    I create beautiful, responsive web applications using modern technologies
                    like React, Node.js, and AWS.
                </p>
                <button class="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                    View My Work
                </button>
            </div>
        </div>
    </section>

    <!-- Projects Section -->
    <section id="projects" class="py-16">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="text-3xl font-bold text-center mb-12">Featured Projects</h2>
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <!-- Project cards will be populated by JavaScript -->
            </div>
        </div>
    </section>

    <script src="dist/main.js"></script>
</body>
</html>`,
        type: 'source'
      },
      {
        name: 'src/main.js',
        content: `// Portfolio JavaScript functionality
class Portfolio {
  constructor() {
    this.projects = [
      {
        title: 'E-commerce Platform',
        description: 'Full-stack e-commerce solution with React and Node.js',
        image: '/images/ecommerce.jpg',
        technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
        github: 'https://github.com/johndoe/ecommerce',
        demo: 'https://ecommerce-demo.com'
      },
      {
        title: 'Task Management App',
        description: 'Collaborative task management with real-time updates',
        image: '/images/taskapp.jpg',
        technologies: ['Vue.js', 'Socket.io', 'PostgreSQL'],
        github: 'https://github.com/johndoe/taskapp',
        demo: 'https://taskapp-demo.com'
      },
      {
        title: 'Weather Dashboard',
        description: 'Beautiful weather app with location-based forecasts',
        image: '/images/weather.jpg',
        technologies: ['JavaScript', 'Weather API', 'Chart.js'],
        github: 'https://github.com/johndoe/weather',
        demo: 'https://weather-demo.com'
      }
    ];
    
    this.init();
  }

  init() {
    this.renderProjects();
    this.setupSmoothScrolling();
    this.setupContactForm();
  }

  renderProjects() {
    const projectsContainer = document.querySelector('#projects .grid');
    
    this.projects.forEach(project => {
      const projectCard = this.createProjectCard(project);
      projectsContainer.appendChild(projectCard);
    });
  }

  createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow';
    
    card.innerHTML = \`
      <img src="\${project.image}" alt="\${project.title}" class="w-full h-48 object-cover">
      <div class="p-6">
        <h3 class="text-xl font-semibold mb-2">\${project.title}</h3>
        <p class="text-gray-600 mb-4">\${project.description}</p>
        <div class="flex flex-wrap gap-2 mb-4">
          \${project.technologies.map(tech => 
            \`<span class="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">\${tech}</span>\`
          ).join('')}
        </div>
        <div class="flex space-x-4">
          <a href="\${project.github}" class="text-blue-600 hover:text-blue-800">GitHub</a>
          <a href="\${project.demo}" class="text-blue-600 hover:text-blue-800">Live Demo</a>
        </div>
      </div>
    \`;
    
    return card;
  }

  setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  setupContactForm() {
    // Contact form functionality would go here
    console.log('Contact form setup complete');
  }
}

// Initialize portfolio when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new Portfolio();
});`,
        type: 'source'
      },
      {
        name: 'tailwind.config.js',
        content: `module.exports = {
  content: ["./*.html", "./src/**/*.js"],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}`,
        type: 'config'
      }
    ],
    expectedAnalysis: {
      framework: 'vanilla',
      appType: 'static',
      database: 'none',
      auth: false,
      realtime: false,
      storage: false,
      expectedTraffic: 'low',
      complexity: 1,
      confidence: 0.88
    },
    recommendedArchitecture: 'static-hosting',
    estimatedCost: { min: 1, max: 10, typical: 3 }
  }
};

// Quick access functions for demo
export const getDemoExample = (id) => {
  return demoExamples[id];
};

export const getAllDemoExamples = () => {
  return Object.values(demoExamples);
};

export const getDemoExamplesByComplexity = (complexity) => {
  return Object.values(demoExamples).filter(example => 
    example.complexity.toLowerCase() === complexity.toLowerCase()
  );
};

export const getDemoExamplesByCategory = (category) => {
  return Object.values(demoExamples).filter(example => 
    example.category.toLowerCase().includes(category.toLowerCase())
  );
};