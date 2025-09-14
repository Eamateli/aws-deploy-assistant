import React, { useState, lazy, Suspense, useEffect } from 'react';
import { 
  Upload, Code, Zap, DollarSign, FileText, ChevronRight, Play, Copy, Check, 
  AlertCircle, Cloud, Server, Database, Globe, Cpu, Shield, HardDrive,
  BarChart3, TrendingUp, Settings, Info, ExternalLink, Download, Clock
} from 'lucide-react';

import { CombinedProvider, useApp, useNotifications, NotificationContainer } from './context';
import { PerformanceProvider } from './components/core/PerformanceMonitor';
import { ThemeProvider } from './context/ThemeContext';
import ThemeToggle from './components/core/ThemeToggle';
import errorLogger from './utils/errorLogger';
import { initializeOptimizations } from './utils/assetOptimizer';
import { initializeBundleOptimizations, createLazyComponent } from './utils/bundleOptimizer';
import config, { env } from './config/environment';

// Lazy load heavy components with retry mechanism for better performance
const ArchitectureDiagram = createLazyComponent(() => import('./components/architecture/ArchitectureDiagram'));
const DeploymentGuide = createLazyComponent(() => import('./components/deployment/DeploymentGuide'));
const CostCalculator = createLazyComponent(() => import('./components/cost/CostCalculator'));

// Enhanced components with AWS icons and documentation links
import EnhancedServiceCard from './components/recommendations/EnhancedServiceCard';
import EnhancedArchitectureDiagram from './components/architecture/EnhancedArchitectureDiagram';

// Components are defined inline in this file for now
// Future optimization: move to separate files when they become large enough

// Loading component for lazy-loaded components
const ComponentLoader = ({ message = "Loading..." }) => (
  <div className="flex items-center justify-center py-12">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  </div>
);

// Optimized pattern matching engine with dynamic loading
const analyzeCode = async (input) => {
  // Load pattern data dynamically to reduce initial bundle size
  const { getPatternRules } = await import('./utils/bundleOptimizer');
  
  // Basic pattern detection for initial classification
  const inputLower = input.toLowerCase();
  let detectedFramework = 'generic';
  
  if (inputLower.includes('react') || inputLower.includes('jsx')) {
    detectedFramework = 'react';
  } else if (inputLower.includes('vue') || inputLower.includes('vuejs')) {
    detectedFramework = 'vue';
  } else if (inputLower.includes('express') || inputLower.includes('nodejs')) {
    detectedFramework = 'nodejs';
  } else if (inputLower.includes('python') || inputLower.includes('flask') || inputLower.includes('django')) {
    detectedFramework = 'python';
  }
  
  // Load specific patterns for detected framework
  const patterns = await getPatternRules(detectedFramework);
  
  let bestMatch = null;
  let highestScore = 0;

  for (const [key, pattern] of Object.entries(patterns)) {
    const score = pattern.indicators?.files?.reduce((acc, indicator) => {
      return acc + (inputLower.includes(indicator.toLowerCase()) ? 1 : 0);
    }, 0) / (pattern.indicators?.files?.length || 1);

    if (score > highestScore) {
      highestScore = score;
      bestMatch = { 
        ...pattern, 
        id: key, 
        score,
        name: pattern.name || key,
        appType: pattern.appType || 'generic',
        framework: detectedFramework
      };
    }
  }

  // Fallback to basic detection if no patterns match
  if (!bestMatch || highestScore < 0.3) {
    bestMatch = {
      id: 'generic-app',
      name: 'Generic Application',
      appType: inputLower.includes('api') ? 'api' : inputLower.includes('spa') ? 'spa' : 'fullstack',
      framework: detectedFramework,
      score: 0.5
    };
    highestScore = 0.5;
  }

  return {
    detected: bestMatch,
    confidence: highestScore * 0.9, // Slightly reduce confidence for dynamic loading
    timestamp: new Date().toISOString(),
    requirements: {
      auth: inputLower.includes('auth') || inputLower.includes('login'),
      database: inputLower.includes('database') || inputLower.includes('mongodb') || inputLower.includes('postgres'),
      realtime: inputLower.includes('realtime') || inputLower.includes('websocket'),
      storage: inputLower.includes('upload') || inputLower.includes('file') || inputLower.includes('image'),
      traffic: inputLower.includes('high traffic') ? 'high' : inputLower.includes('medium traffic') ? 'medium' : 'low'
    }
  };
};

// Architecture patterns will be loaded dynamically
let architecturePatternsCache = null;

const getArchitecturePatterns = async () => {
  if (architecturePatternsCache) {
    return architecturePatternsCache;
  }
  
  try {
    const module = await import('./data/architecturePatterns');
    architecturePatternsCache = module.architecturePatterns || module.default;
    return architecturePatternsCache;
  } catch (error) {
    console.error('Failed to load architecture patterns:', error);
    // Return minimal fallback patterns
    return {
      'static-spa': {
        id: 'static-spa',
        name: 'Static SPA Hosting',
        description: 'Basic static hosting setup',
        services: [],
        complexity: 2,
        cost: { min: 5, max: 25, typical: 12 },
        deploymentTime: '15-30 minutes',
        scalability: 5,
        pros: ['Cost-effective', 'Simple setup'],
        cons: ['Limited functionality']
      }
    };
  }
};

// Deployment guide generator - optimized for dynamic loading
const generateDeploymentGuide = async (architecture) => {
  // Load deployment templates dynamically
  try {
    const { deploymentGuides } = await import('./data/deploymentGuides');
    return deploymentGuides[architecture.id] || deploymentGuides['static-spa'];
  } catch (error) {
    console.error('Failed to load deployment guides:', error);
    // Return basic fallback guide
    return {
      title: `Deploy ${architecture.name}`,
      estimatedTime: '30 minutes',
      prerequisites: ['AWS CLI installed', 'AWS account configured'],
      steps: [
        {
          title: 'Prepare your application',
          description: 'Get your application ready for deployment',
          commands: ['# Follow AWS documentation for your specific setup'],
          explanation: 'Refer to AWS documentation for detailed deployment steps'
        }
      ]
    };
  }
};

// Cost calculation utilities
const calculateCosts = async (architecture, traffic = 'low', region = 'us-east-1') => {
  const trafficMultipliers = {
    low: { requests: 10000, storage: 1, bandwidth: 10 },
    medium: { requests: 100000, storage: 5, bandwidth: 100 },
    high: { requests: 1000000, storage: 20, bandwidth: 1000 }
  };

  const multiplier = trafficMultipliers[traffic];
  
  // Use the passed architecture directly instead of looking it up
  const baseArchitecture = architecture;

  if (!baseArchitecture) return { monthly: 0, breakdown: [] };

  let totalCost = 0;
  const breakdown = [];

  // Calculate costs based on architecture type
  switch (architecture.id) {
    case 'static-spa':
      const s3Cost = (multiplier.storage * 0.023) + (multiplier.requests * 0.0004 / 1000);
      const cloudFrontCost = multiplier.bandwidth * 0.085;
      const route53Cost = 0.50;
      
      breakdown.push(
        { service: 'S3', cost: s3Cost, description: `${multiplier.storage}GB storage + ${multiplier.requests.toLocaleString()} requests` },
        { service: 'CloudFront', cost: cloudFrontCost, description: `${multiplier.bandwidth}GB data transfer` },
        { service: 'Route53', cost: route53Cost, description: '1 hosted zone' }
      );
      totalCost = s3Cost + cloudFrontCost + route53Cost;
      break;

    case 'serverless-api':
      const lambdaCost = (multiplier.requests * 0.20) / 1000000;
      const apiGatewayCost = (multiplier.requests * 3.50) / 1000000;
      const dynamoDBCost = multiplier.storage * 0.25;
      const cloudWatchCost = 2.50; // Base monitoring cost
      
      breakdown.push(
        { service: 'Lambda', cost: lambdaCost, description: `${multiplier.requests.toLocaleString()} requests` },
        { service: 'API Gateway', cost: apiGatewayCost, description: `${multiplier.requests.toLocaleString()} API calls` },
        { service: 'DynamoDB', cost: dynamoDBCost, description: `${multiplier.storage}GB storage` },
        { service: 'CloudWatch', cost: cloudWatchCost, description: 'Logs and monitoring' }
      );
      totalCost = lambdaCost + apiGatewayCost + dynamoDBCost + cloudWatchCost;
      break;

    case 'traditional-stack':
      const ec2Cost = 8.5 * (traffic === 'high' ? 4 : traffic === 'medium' ? 2 : 1); // Scale instances
      const albCost = 16 + (multiplier.requests * 0.008 / 1000);
      const rdsCost = 15 * (traffic === 'high' ? 2 : 1); // Scale database
      const s3StorageCost = multiplier.storage * 0.023;
      
      breakdown.push(
        { service: 'EC2', cost: ec2Cost, description: `${traffic === 'high' ? '4x' : traffic === 'medium' ? '2x' : '1x'} t3.small instances` },
        { service: 'ALB', cost: albCost, description: `Load balancer + ${multiplier.requests.toLocaleString()} requests` },
        { service: 'RDS', cost: rdsCost, description: `${traffic === 'high' ? 'Multi-AZ' : 'Single'} MySQL instance` },
        { service: 'S3', cost: s3StorageCost, description: `${multiplier.storage}GB file storage` }
      );
      totalCost = ec2Cost + albCost + rdsCost + s3StorageCost;
      break;

    case 'container-stack':
      const fargateHours = 24 * 30 * (traffic === 'high' ? 4 : traffic === 'medium' ? 2 : 1);
      const fargateCost = fargateHours * 0.04048; // 1 vCPU
      const containerALBCost = 16 + (multiplier.requests * 0.008 / 1000);
      const containerRDSCost = 15 * (traffic === 'high' ? 2 : 1);
      
      breakdown.push(
        { service: 'Fargate', cost: fargateCost, description: `${fargateHours} vCPU hours` },
        { service: 'ALB', cost: containerALBCost, description: `Load balancer + ${multiplier.requests.toLocaleString()} requests` },
        { service: 'RDS', cost: containerRDSCost, description: `${traffic === 'high' ? 'Multi-AZ' : 'Single'} MySQL instance` }
      );
      totalCost = fargateCost + containerALBCost + containerRDSCost;
      break;

    default:
      totalCost = baseArchitecture.cost.typical;
  }

  return {
    monthly: Math.round(totalCost * 100) / 100,
    breakdown: breakdown.map(item => ({
      ...item,
      cost: Math.round(item.cost * 100) / 100
    })),
    freeTierEligible: totalCost < 20,
    annual: Math.round(totalCost * 12 * 100) / 100
  };
};

// Components
const StepIndicator = ({ steps, currentStep, onStepClick }) => (
  <div className="flex items-center justify-center mb-8 overflow-x-auto">
    <div className="flex items-center space-x-4 min-w-max px-4">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <button
            onClick={() => onStepClick?.(step.id)}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all cursor-pointer hover:shadow-md ${
              currentStep === step.id 
                ? 'bg-blue-600 text-white shadow-lg' 
                : steps.findIndex(s => s.id === currentStep) > index 
                  ? 'bg-green-500 text-white hover:bg-green-600' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
            title={`Go to ${step.name} step`}
          >
            {steps.findIndex(s => s.id === currentStep) > index ? <Check size={16} /> : index + 1}
          </button>
          <button
            onClick={() => onStepClick?.(step.id)}
            className={`ml-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 ${
              currentStep === step.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
            }`}
            title={`Go to ${step.name} step`}
          >
            {step.name}
          </button>
          {index < steps.length - 1 && (
            <ChevronRight className="mx-4 text-gray-400 flex-shrink-0" size={16} />
          )}
        </div>
      ))}
    </div>
  </div>
);

const CodeUploader = ({ onAnalyze }) => {
  const [input, setInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    
    setAnalyzing(true);
    try {
      // Simulate analysis time while loading patterns
      const [result] = await Promise.all([
        analyzeCode(input),
        new Promise(resolve => setTimeout(resolve, 1200)) // Reduced time due to async loading
      ]);
      onAnalyze(result);
    } catch (error) {
      console.error('Analysis failed:', error);
      // Fallback analysis
      const fallbackResult = {
        detected: {
          id: 'generic-app',
          name: 'Generic Application',
          appType: 'fullstack',
          framework: 'generic'
        },
        confidence: 0.5,
        timestamp: new Date().toISOString(),
        requirements: {
          auth: false,
          database: true,
          realtime: false,
          storage: false,
          traffic: 'low'
        }
      };
      onAnalyze(fallbackResult);
    } finally {
      setAnalyzing(false);
    }
  };

  const examples = [
    'React e-commerce app with shopping cart, user authentication, and payment processing using Stripe',
    'Node.js REST API with Express, MongoDB, JWT authentication, and file upload functionality',
    'Vue.js portfolio website with contact form, blog section, and image gallery',
    'Python Flask API with PostgreSQL database, user management, and real-time notifications',
    'Full-stack React app with Node.js backend, PostgreSQL database, and real-time chat features'
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
          <Upload className="text-blue-600 dark:text-blue-400" size={32} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Describe Your Application</h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
          Tell us about your app and we'll analyze it to recommend the perfect AWS architecture for your needs
        </p>
      </div>

      <div className="card p-8 mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Application Description
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your application: framework, features, database needs, expected traffic, special requirements..."
          className="input-field h-32 resize-none"
        />
        
        <div className="mt-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium">Try these examples:</p>
          <div className="grid gap-3">
            {examples.map((example, index) => (
              <button
                key={index}
                onClick={() => setInput(example)}
                className="text-left p-4 text-sm bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors"
              >
                <div className="flex items-start">
                  <Code className="text-gray-400 dark:text-gray-500 mr-3 mt-0.5 flex-shrink-0" size={16} />
                  <span className="text-gray-900 dark:text-gray-100">{example}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={!input.trim() || analyzing}
          className="btn-primary w-full mt-6 flex items-center justify-center"
        >
          {analyzing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Analyzing Application...
            </>
          ) : (
            <>
              <Zap className="mr-2" size={20} />
              Analyze Application
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const ServiceCard = ({ service, isSelected, onClick }) => {
  const Icon = service.icon;
  const categoryColors = {
    compute: 'text-orange-500',
    storage: 'text-blue-500',
    database: 'text-green-500',
    networking: 'text-purple-500',
    monitoring: 'text-yellow-500'
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all bg-white dark:bg-gray-800 ${
        isSelected 
          ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-md' 
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start space-x-3">
        <Icon className={`${categoryColors[service.category] || 'text-gray-500 dark:text-gray-400'} mt-1 flex-shrink-0`} size={24} />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{service.name}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{service.purpose}</p>
          <p className="text-xs text-green-600 dark:text-green-400 font-medium">{service.cost}</p>
        </div>
      </div>
    </div>
  );
};

const ArchitectureRecommendations = ({ analysis, onSelectArchitecture }) => {
  const [selectedArch, setSelectedArch] = useState(null);
  const [patterns, setPatterns] = useState(null);
  const [loading, setLoading] = useState(true);

  // Debug logging
  useEffect(() => {
    console.log('ArchitectureRecommendations props:', { analysis, onSelectArchitecture });
  }, [analysis, onSelectArchitecture]);

  useEffect(() => {
    const loadPatterns = async () => {
      try {
        const architecturePatterns = await getArchitecturePatterns();
        setPatterns(architecturePatterns);
      } catch (error) {
        console.error('Failed to load architecture patterns:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadPatterns();
  }, []);

  const getRecommendations = () => {
    if (!patterns) return [];
    
    const { detected } = analysis;
    
    if (detected?.appType === 'spa') {
      return [patterns['static-spa'], patterns['container-stack']].filter(Boolean);
    } else if (detected?.appType === 'api') {
      return [patterns['serverless-api'], patterns['traditional-stack'], patterns['container-stack']].filter(Boolean);
    } else if (detected?.appType === 'fullstack') {
      return [patterns['traditional-stack'], patterns['container-stack'], patterns['serverless-api']].filter(Boolean);
    }
    
    return [patterns['static-spa'], patterns['serverless-api'], patterns['traditional-stack']].filter(Boolean);
  };

  if (loading) {
    return <ComponentLoader message="Loading architecture recommendations..." />;
  }

  const recommendations = getRecommendations();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
          <Zap className="text-green-600 dark:text-green-400" size={32} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">AWS Architecture Recommendations</h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Based on your {analysis.detected?.name || 'application'}, here are optimized AWS architectures
        </p>
      </div>

      {analysis.confidence < 0.7 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6 flex items-start">
          <AlertCircle className="text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5 flex-shrink-0" size={20} />
          <div>
            <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Low Confidence Detection</h4>
            <p className="text-yellow-700 dark:text-yellow-300 text-sm">
              Pattern matching confidence: {Math.round(analysis.confidence * 100)}%. 
              Please review recommendations carefully and consider your specific requirements.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 mb-8">
        {recommendations.map((arch) => (
          <div
            key={arch.id}
            className={`card border-2 transition-all cursor-pointer hover:scale-[1.02] ${
              selectedArch?.id === arch.id 
                ? 'border-blue-500 dark:border-blue-400 shadow-xl ring-2 ring-blue-200 dark:ring-blue-800 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10'
            }`}
            onClick={() => {
              console.log('Architecture card clicked:', arch.name);
              setSelectedArch(arch);
              console.log('Selected architecture set to:', arch);
            }}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{arch.name}</h3>
                    {selectedArch?.id === arch.id && (
                      <Check className="ml-2 text-green-500 dark:text-green-400" size={20} />
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{arch.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Complexity:</span>
                      <div className="ml-2 flex">
                        {[1,2,3,4,5].map(i => (
                          <div 
                            key={i} 
                            className={`w-3 h-3 rounded-full mr-1 ${
                              i <= arch.complexity ? 'bg-orange-400' : 'bg-gray-200 dark:bg-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Setup Time:</span>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">{arch.deploymentTime}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Scalability:</span>
                      <div className="ml-2 flex">
                        {[1,2,3,4,5].map(i => (
                          <div 
                            key={i} 
                            className={`w-3 h-3 rounded-full mr-1 ${
                              i <= arch.scalability ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <DollarSign className="text-green-600 dark:text-green-400 mr-1" size={16} />
                      <span className="font-medium text-green-600 dark:text-green-400">
                        ${arch.cost.min}-{arch.cost.max}/mo
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {arch.services.map((service, index) => (
                  <EnhancedServiceCard
                    key={index}
                    service={service}
                    isSelected={false}
                    onClick={(e) => e.stopPropagation()}
                    showDocLink={true}
                  />
                ))}
              </div>



              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center">
                    <Check className="mr-1" size={16} />
                    Pros
                  </h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {arch.pros.map((pro, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 dark:text-green-400 mr-2">•</span>
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-orange-700 dark:text-orange-400 mb-2 flex items-center">
                    <AlertCircle className="mr-1" size={16} />
                    Considerations
                  </h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {arch.cons.map((con, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-orange-500 dark:text-orange-400 mr-2">•</span>
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Enhanced Architecture Diagram - Always show for better UX */}
              <div className="mt-6 border-t pt-6">
                <EnhancedArchitectureDiagram 
                  architecture={arch}
                  className="mb-4"
                  showDownload={true}
                  autoLoad={true}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={() => {
            console.log('Button clicked!', selectedArch);
            const archToUse = selectedArch || recommendations[0]; // Use first architecture if none selected
            console.log('Architecture to use:', archToUse);
            
            if (archToUse && onSelectArchitecture) {
              console.log('Calling onSelectArchitecture with:', archToUse);
              onSelectArchitecture(archToUse);
            } else {
              console.log('Missing architecture or onSelectArchitecture:', { archToUse, onSelectArchitecture });
            }
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
        >
          <Play className="mr-2" size={20} />
          Continue with {selectedArch?.name || (recommendations[0]?.name + ' (Default)') || 'Architecture'}
        </button>
      </div>
    </div>
  );
};

// Wrapper component for deployment guide with async loading
const DeploymentGuideWrapper = ({ architecture }) => {
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGuide = async () => {
      try {
        const deploymentGuide = await generateDeploymentGuide(architecture);
        setGuide(deploymentGuide);
      } catch (error) {
        console.error('Failed to load deployment guide:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadGuide();
  }, [architecture]);

  if (loading) {
    return <ComponentLoader message="Loading deployment guide..." />;
  }

  if (!guide) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Failed to Load Deployment Guide
        </h3>
        <p className="text-gray-600">
          Please try refreshing the page or contact support.
        </p>
      </div>
    );
  }

  return (
    <DeploymentGuide 
      architecture={architecture}
      guide={guide}
    />
  );
};

const DeploymentStep = ({ step, index, isActive, isCompleted, onComplete, onActivate }) => {
  const [commandsCopied, setCommandsCopied] = useState(new Set());

  const copyCommand = (command, commandIndex) => {
    navigator.clipboard.writeText(command);
    setCommandsCopied(prev => new Set([...prev, commandIndex]));
    setTimeout(() => {
      setCommandsCopied(prev => {
        const newSet = new Set(prev);
        newSet.delete(commandIndex);
        return newSet;
      });
    }, 2000);
  };

  return (
    <div className={`card border-2 transition-all ${
      isActive ? 'border-blue-500 bg-blue-50' : 
      isCompleted ? 'border-green-300 bg-green-50' : 'border-gray-200'
    }`}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
              isCompleted ? 'bg-green-500 text-white' : 
              isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {isCompleted ? <Check size={16} /> : index + 1}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{step.title}</h4>
              <p className="text-sm text-gray-600">{step.description}</p>
            </div>
          </div>
          
          {!isCompleted && (
            <button
              onClick={isActive ? onComplete : onActivate}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              {isActive ? 'Mark Complete' : 'Start Step'}
            </button>
          )}
        </div>

        {isActive && (
          <div className="ml-11 space-y-4">
            {step.commands && step.commands.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Code className="mr-2" size={16} />
                  Commands:
                </h5>
                <div className="space-y-3">
                  {step.commands.map((command, cmdIndex) => (
                    <div key={cmdIndex} className="relative">
                      <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                        {command}
                      </pre>
                      <button
                        onClick={() => copyCommand(command, cmdIndex)}
                        className="absolute top-3 right-3 p-2 bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors"
                        title="Copy command"
                      >
                        {commandsCopied.has(cmdIndex) ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {step.explanation && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Info className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" size={16} />
                  <p className="text-sm text-blue-800">{step.explanation}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Main App Component with Context
const AppContent = () => {
  const { state, actions } = useApp();
  const { actions: notificationActions } = useNotifications();

  // Initialize bundle optimizations on app start
  useEffect(() => {
    initializeBundleOptimizations();
    
    // Initialize other optimizations
    if (initializeOptimizations) {
      initializeOptimizations();
    }
  }, []);

  const steps = [
    { id: 'upload', name: 'Analyze' },
    { id: 'recommendations', name: 'Architecture' },
    { id: 'deployment', name: 'Deploy' },
    { id: 'costs', name: 'Costs' }
  ];

  const handleAnalyze = (result) => {
    actions.setAnalysisResult(result);
    notificationActions.success('Application analysis completed successfully!');
  };

  const handleSelectArchitecture = (architecture) => {
    actions.selectArchitecture(architecture);
    notificationActions.info(`Selected ${architecture.name} architecture`);
  };

  const handleViewCosts = () => {
    actions.setStep('costs');
  };

  const handleBackToDeployment = () => {
    actions.setStep('deployment');
  };

  const handleStartOver = () => {
    actions.resetState();
    notificationActions.info('Starting new analysis');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
      <NotificationContainer />
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <Cloud className="text-white" size={20} />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">AWS Deploy Assistant</h1>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Powered by Kiro AI</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {state.currentStep !== 'upload' && (
                  <button
                    onClick={handleStartOver}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 text-sm font-medium transition-colors"
                  >
                    Start Over
                  </button>
                )}
                <ThemeToggle />
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  <ExternalLink size={20} />
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <StepIndicator 
            steps={steps} 
            currentStep={state.currentStep} 
            onStepClick={(stepId) => {
              console.log('Step clicked:', stepId);
              
              // Handle navigation with required data checks
              if (stepId === 'recommendations' && !state.analysis) {
                // If no analysis, create a mock one to allow navigation
                const mockAnalysis = {
                  detected: { name: 'Generic Application', appType: 'spa' },
                  confidence: 0.8,
                  requirements: { traffic: 'low' }
                };
                actions.setAnalysisResult(mockAnalysis);
              }
              
              if ((stepId === 'deployment' || stepId === 'costs') && !state.selectedArchitecture) {
                // If no selected architecture, auto-select the first available one
                const mockArchitecture = {
                  id: 'static-spa',
                  name: 'Static SPA Hosting',
                  description: 'Serverless hosting for React/Vue SPAs using S3 and CloudFront',
                  services: [],
                  complexity: 2,
                  cost: { min: 5, max: 25, typical: 12 }
                };
                actions.selectArchitecture(mockArchitecture);
              }
              
              actions.setStep(stepId);
            }}
          />

          {state.currentStep === 'upload' && (
            <CodeUploader onAnalyze={handleAnalyze} />
          )}

          {state.currentStep === 'recommendations' && state.analysis && (
            <ArchitectureRecommendations 
              analysis={state.analysis} 
              onSelectArchitecture={handleSelectArchitecture}
            />
          )}

          {state.currentStep === 'deployment' && state.selectedArchitecture && (
            <div>
              <Suspense fallback={<ComponentLoader message="Loading deployment guide..." />}>
                <DeploymentGuideWrapper 
                  architecture={state.selectedArchitecture}
                />
              </Suspense>
              <div className="text-center mt-8">
                <button
                  onClick={handleViewCosts}
                  className="btn-primary px-8"
                >
                  <DollarSign className="mr-2" size={20} />
                  View Cost Analysis
                </button>
              </div>
            </div>
          )}

          {state.currentStep === 'costs' && state.selectedArchitecture && (
            <div>
              <Suspense fallback={<ComponentLoader message="Loading cost calculator..." />}>
                <CostCalculator 
                  architecture={state.selectedArchitecture}
                  analysis={state.analysis}
                />
              </Suspense>
              <div className="text-center mt-8 space-x-4">
                <button
                  onClick={handleBackToDeployment}
                  className="btn-secondary px-6"
                >
                  <ChevronRight className="mr-2 rotate-180" size={20} />
                  Back to Deployment
                </button>
                <button
                  onClick={handleStartOver}
                  className="btn-primary px-6"
                >
                  <Upload className="mr-2" size={20} />
                  Analyze New App
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-gray-50 border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <p className="text-gray-600 text-sm">
                Built with ❤️ using Kiro AI • Spec-driven development in action
              </p>
              <p className="text-gray-500 text-xs mt-2">
                This tool provides estimates and guidance. Always verify AWS pricing and test deployments thoroughly.
              </p>
            </div>
          </div>
        </footer>
    </div>
  );
};

// Main App wrapper with providers
const App = () => {
  // Initialize optimizations on app load
  React.useEffect(() => {
    try {
      initializeOptimizations();
      errorLogger.logUserAction('app_initialized', {
        environment: env.isDevelopment ? 'development' : 'production',
        features: config.features
      });
    } catch (error) {
      errorLogger.logError(error, {
        component: 'App',
        action: 'initialization'
      });
    }
  }, []);

  // Check for test mode
  const isTestMode = window.location.search.includes('test=deployment');
  
  if (isTestMode) {
    const DeploymentGuideTest = React.lazy(() => import('./components/deployment/DeploymentGuideTest.jsx'));
    return (
      <ThemeProvider>
        <CombinedProvider>
          <PerformanceProvider>
            <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
              <DeploymentGuideTest />
            </React.Suspense>
          </PerformanceProvider>
        </CombinedProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <CombinedProvider>
        <PerformanceProvider>
          <AppContent />
          <NotificationContainer />
        </PerformanceProvider>
      </CombinedProvider>
    </ThemeProvider>
  );
};

export default App;