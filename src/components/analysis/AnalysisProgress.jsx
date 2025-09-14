import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  RefreshCw,
  TrendingUp,
  Search,
  Zap,
  Target
} from 'lucide-react';

/**
 * AnalysisProgress - Analysis trigger and progress feedback component
 * Handles the analysis process with loading states, progress tracking, and results display
 */
const AnalysisProgress = ({ 
  analysisData, 
  onAnalysisComplete, 
  onAnalysisError,
  className = '' 
}) => {
  const [analysisState, setAnalysisState] = useState('ready'); // ready, analyzing, completed, error
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);

  // Analysis steps for progress tracking
  const analysisSteps = [
    {
      id: 'parsing',
      name: 'Parsing Input',
      description: 'Reading and processing your application data',
      icon: Search,
      duration: 800
    },
    {
      id: 'pattern-matching',
      name: 'Pattern Detection',
      description: 'Identifying frameworks, technologies, and patterns',
      icon: Target,
      duration: 1200
    },
    {
      id: 'requirements',
      name: 'Analyzing Requirements',
      description: 'Determining infrastructure and service needs',
      icon: TrendingUp,
      duration: 1000
    },
    {
      id: 'recommendations',
      name: 'Generating Recommendations',
      description: 'Creating optimized AWS architecture suggestions',
      icon: Zap,
      duration: 900
    }
  ];

  // Start analysis process
  const startAnalysis = async () => {
    if (!analysisData) {
      setError('No analysis data provided');
      setAnalysisState('error');
      return;
    }

    setAnalysisState('analyzing');
    setCurrentStep(0);
    setProgress(0);
    setError(null);

    try {
      // Simulate analysis process with steps
      for (let i = 0; i < analysisSteps.length; i++) {
        setCurrentStep(i);
        
        // Simulate step processing time
        await new Promise(resolve => {
          const stepDuration = analysisSteps[i].duration;
          const progressInterval = setInterval(() => {
            setProgress(prev => {
              const stepProgress = ((i + 1) / analysisSteps.length) * 100;
              const newProgress = Math.min(prev + 2, stepProgress);
              
              if (newProgress >= stepProgress) {
                clearInterval(progressInterval);
                resolve();
              }
              
              return newProgress;
            });
          }, stepDuration / 50);
        });
      }

      // Perform actual analysis
      const result = await performAnalysis(analysisData);
      
      setProgress(100);
      setAnalysisResult(result);
      setAnalysisState('completed');
      onAnalysisComplete?.(result);

    } catch (err) {
      setError(err.message || 'Analysis failed');
      setAnalysisState('error');
      onAnalysisError?.(err);
    }
  };

  // Perform the actual analysis logic
  const performAnalysis = async (data) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (data.method === 'upload') {
      return analyzeFromFiles(data.files);
    } else {
      return analyzeFromDescription(data.description);
    }
  };

  // Analyze from uploaded files
  const analyzeFromFiles = (files) => {
    const patterns = {
      'react-spa': {
        name: 'React Single Page Application',
        indicators: ['react', 'jsx', 'package.json', 'src/App.jsx'],
        appType: 'spa',
        framework: 'react',
        confidence: 0.9
      },
      'nodejs-api': {
        name: 'Node.js REST API',
        indicators: ['express', 'server.js', 'routes', 'package.json'],
        appType: 'api',
        framework: 'nodejs',
        confidence: 0.85
      },
      'fullstack-app': {
        name: 'Full-Stack Application',
        indicators: ['react', 'express', 'client', 'server'],
        appType: 'fullstack',
        framework: 'react-nodejs',
        confidence: 0.8
      },
      'python-api': {
        name: 'Python API Application',
        indicators: ['flask', 'django', 'fastapi', 'requirements.txt', 'app.py'],
        appType: 'api',
        framework: 'python',
        confidence: 0.8
      }
    };

    // Analyze file names and content
    const fileNames = files.map(f => f.name.toLowerCase());
    const fileContents = files.map(f => f.content.toLowerCase()).join(' ');
    
    let bestMatch = null;
    let highestScore = 0;

    for (const [key, pattern] of Object.entries(patterns)) {
      let score = 0;
      let matches = 0;

      pattern.indicators.forEach(indicator => {
        if (fileNames.some(name => name.includes(indicator)) || 
            fileContents.includes(indicator)) {
          matches++;
        }
      });

      score = (matches / pattern.indicators.length) * pattern.confidence;

      if (score > highestScore) {
        highestScore = score;
        bestMatch = { ...pattern, id: key, score };
      }
    }

    // Analyze requirements from files
    const requirements = {
      auth: fileContents.includes('auth') || fileContents.includes('login'),
      database: fileContents.includes('database') || fileContents.includes('mongodb') || 
                fileContents.includes('postgres') || fileContents.includes('mysql'),
      realtime: fileContents.includes('socket') || fileContents.includes('websocket'),
      storage: fileContents.includes('upload') || fileContents.includes('multer'),
      traffic: 'low' // Default for file analysis
    };

    return {
      detected: bestMatch,
      confidence: highestScore,
      requirements,
      method: 'file-analysis',
      filesAnalyzed: files.length,
      timestamp: new Date().toISOString()
    };
  };

  // Analyze from manual description
  const analyzeFromDescription = (description) => {
    const frameworkMap = {
      'react': { name: 'React Application', appType: 'spa', confidence: 0.9 },
      'vue': { name: 'Vue.js Application', appType: 'spa', confidence: 0.9 },
      'angular': { name: 'Angular Application', appType: 'spa', confidence: 0.9 },
      'nodejs': { name: 'Node.js Application', appType: 'api', confidence: 0.85 },
      'python': { name: 'Python Application', appType: 'api', confidence: 0.85 },
      'php': { name: 'PHP Application', appType: 'fullstack', confidence: 0.8 },
      'java': { name: 'Java Application', appType: 'api', confidence: 0.8 },
      'dotnet': { name: '.NET Application', appType: 'fullstack', confidence: 0.8 }
    };

    const detected = frameworkMap[description.framework] || {
      name: 'Web Application',
      appType: description.appTypes?.[0] || 'spa',
      confidence: 0.7
    };

    // Determine app type from selections
    if (description.appTypes?.length > 0) {
      if (description.appTypes.includes('fullstack')) {
        detected.appType = 'fullstack';
      } else if (description.appTypes.includes('api')) {
        detected.appType = 'api';
      } else if (description.appTypes.includes('spa')) {
        detected.appType = 'spa';
      }
    }

    const requirements = {
      auth: description.features?.includes('auth') || false,
      database: description.features?.includes('database') || description.database !== 'none',
      realtime: description.features?.includes('realtime') || false,
      storage: description.features?.includes('file-upload') || false,
      payments: description.features?.includes('payments') || false,
      search: description.features?.includes('search') || false,
      analytics: description.features?.includes('analytics') || false,
      traffic: description.expectedTraffic || 'low'
    };

    return {
      detected: {
        ...detected,
        id: `${description.framework || 'generic'}-${detected.appType}`,
        framework: description.framework
      },
      confidence: detected.confidence,
      requirements,
      method: 'manual-description',
      userInput: description,
      timestamp: new Date().toISOString()
    };
  };

  // Reset analysis
  const resetAnalysis = () => {
    setAnalysisState('ready');
    setCurrentStep(0);
    setProgress(0);
    setAnalysisResult(null);
    setError(null);
  };

  // Get confidence level description
  const getConfidenceLevel = (confidence) => {
    if (confidence >= 0.8) return { level: 'High', color: 'text-green-600', bg: 'bg-green-100' };
    if (confidence >= 0.6) return { level: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'Low', color: 'text-red-600', bg: 'bg-red-100' };
  };

  return (
    <div className={`${className}`}>
      {/* Analysis Trigger Button */}
      {analysisState === 'ready' && (
        <div className="text-center">
          <button
            onClick={startAnalysis}
            disabled={!analysisData}
            className={`inline-flex items-center px-8 py-4 text-lg font-semibold rounded-lg transition-all ${
              analysisData
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Play className="mr-3" size={24} />
            Analyze Application
          </button>
          
          {!analysisData && (
            <p className="mt-3 text-sm text-gray-500">
              Please upload files or complete the description form first
            </p>
          )}
        </div>
      )}

      {/* Analysis Progress */}
      {analysisState === 'analyzing' && (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Loader2 className="text-blue-600 animate-spin" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Analyzing Your Application
            </h3>
            <p className="text-gray-600">
              Please wait while we analyze your application and generate recommendations
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Analysis Steps */}
          <div className="space-y-4">
            {analysisSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === index;
              const isCompleted = currentStep > index;
              
              return (
                <div
                  key={step.id}
                  className={`flex items-center space-x-4 p-4 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-blue-50 border border-blue-200' 
                      : isCompleted 
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : isCompleted 
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle size={20} />
                    ) : isActive ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <Icon size={20} />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className={`font-medium ${
                      isActive ? 'text-blue-900' : isCompleted ? 'text-green-900' : 'text-gray-700'
                    }`}>
                      {step.name}
                    </h4>
                    <p className={`text-sm ${
                      isActive ? 'text-blue-700' : isCompleted ? 'text-green-700' : 'text-gray-500'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysisState === 'completed' && analysisResult && (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="text-green-600" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Analysis Complete!
            </h3>
            <p className="text-gray-600">
              We've successfully analyzed your application and identified the following
            </p>
          </div>

          {/* Detection Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Detected Pattern</h4>
              
              {analysisResult.detected ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium text-gray-800">
                      {analysisResult.detected.name}
                    </h5>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      getConfidenceLevel(analysisResult.confidence).bg
                    } ${getConfidenceLevel(analysisResult.confidence).color}`}>
                      {getConfidenceLevel(analysisResult.confidence).level} Confidence
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Type:</span> {analysisResult.detected.appType?.toUpperCase()}
                    </div>
                    {analysisResult.detected.framework && (
                      <div>
                        <span className="font-medium">Framework:</span> {analysisResult.detected.framework}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Confidence:</span> {Math.round(analysisResult.confidence * 100)}%
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <AlertCircle className="mx-auto text-yellow-500 mb-2" size={24} />
                  <p className="text-sm text-gray-600">
                    Unable to detect a specific pattern. Manual review recommended.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Requirements Detected</h4>
              
              <div className="space-y-2">
                {Object.entries(analysisResult.requirements).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>
                    <span className={`font-medium ${
                      typeof value === 'boolean' 
                        ? value ? 'text-green-600' : 'text-gray-400'
                        : 'text-blue-600'
                    }`}>
                      {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Confidence Warning */}
          {analysisResult.confidence < 0.7 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="font-medium text-yellow-800">Low Confidence Detection</h4>
                  <p className="text-yellow-700 text-sm mt-1">
                    Our analysis has low confidence ({Math.round(analysisResult.confidence * 100)}%). 
                    Please review the recommendations carefully and consider providing more specific information.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={resetAnalysis}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="inline mr-2" size={16} />
              Analyze Again
            </button>
          </div>
        </div>
      )}

      {/* Error State */}
      {analysisState === 'error' && (
        <div className="bg-white rounded-lg shadow-lg border border-red-200 p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <XCircle className="text-red-600" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Analysis Failed
            </h3>
            <p className="text-gray-600 mb-6">
              We encountered an error while analyzing your application
            </p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700 text-sm">
                {error || 'An unexpected error occurred during analysis'}
              </p>
            </div>

            <button
              onClick={resetAnalysis}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="inline mr-2" size={16} />
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisProgress;