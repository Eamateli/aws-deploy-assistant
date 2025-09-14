import React, { useState, useContext, createContext } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { HelpCircle, X, ChevronRight, ChevronLeft, BookOpen } from 'lucide-react';
import AnimatedTransition from './AnimatedTransition';

// Help Context for managing help state
const HelpContext = createContext();

export const HelpProvider = ({ children }) => {
  const [isHelpMode, setIsHelpMode] = useState(false);
  const [currentTour, setCurrentTour] = useState(null);
  const [tourStep, setTourStep] = useState(0);

  const startTour = (tourId) => {
    const tour = helpTours[tourId];
    if (tour) {
      setCurrentTour(tour);
      setTourStep(0);
      setIsHelpMode(true);
    }
  };

  const nextStep = () => {
    if (currentTour && tourStep < currentTour.steps.length - 1) {
      setTourStep(tourStep + 1);
    }
  };

  const prevStep = () => {
    if (tourStep > 0) {
      setTourStep(tourStep - 1);
    }
  };

  const endTour = () => {
    setCurrentTour(null);
    setTourStep(0);
    setIsHelpMode(false);
  };

  return (
    <HelpContext.Provider value={{
      isHelpMode,
      setIsHelpMode,
      currentTour,
      tourStep,
      startTour,
      nextStep,
      prevStep,
      endTour
    }}>
      {children}
    </HelpContext.Provider>
  );
};

export const useHelp = () => {
  const context = useContext(HelpContext);
  if (!context) {
    throw new Error('useHelp must be used within a HelpProvider');
  }
  return context;
};

// Help content database
const helpContent = {
  codeAnalysis: {
    title: 'Code Analysis',
    description: 'Upload your code files or describe your application to get started',
    sections: [
      {
        title: 'File Upload',
        content: 'Drag and drop your package.json, source files, or configuration files. We support React, Vue, Node.js, Python, and more.',
        tips: [
          'Include package.json for dependency analysis',
          'Upload main source files for pattern detection',
          'Configuration files help detect infrastructure needs'
        ]
      },
      {
        title: 'Manual Description',
        content: 'Describe your application in plain English. Include details about frameworks, features, and expected usage.',
        tips: [
          'Mention your tech stack (React, Node.js, etc.)',
          'Describe key features (authentication, database, etc.)',
          'Include expected traffic and user base'
        ]
      }
    ]
  },
  recommendations: {
    title: 'AWS Recommendations',
    description: 'Get personalized AWS service recommendations based on your application analysis',
    sections: [
      {
        title: 'Architecture Patterns',
        content: 'We recommend proven architecture patterns that match your application type and requirements.',
        tips: [
          'Static SPA: Perfect for React/Vue apps with external APIs',
          'Serverless API: Cost-effective for APIs with variable traffic',
          'Container-based: Best for complex applications with multiple services'
        ]
      },
      {
        title: 'Cost Optimization',
        content: 'All recommendations include cost estimates and optimization suggestions.',
        tips: [
          'Free tier eligible services are highlighted',
          'Cost ranges account for different traffic levels',
          'Alternative architectures show cost trade-offs'
        ]
      }
    ]
  },
  deployment: {
    title: 'Deployment Guide',
    description: 'Step-by-step instructions to deploy your application to AWS',
    sections: [
      {
        title: 'Prerequisites',
        content: 'Ensure you have the required tools and AWS account setup before starting.',
        tips: [
          'Install AWS CLI and configure credentials',
          'Have your application code ready',
          'Review the deployment checklist'
        ]
      },
      {
        title: 'Step-by-Step Commands',
        content: 'Copy and paste commands directly into your terminal. Each step includes validation.',
        tips: [
          'Run commands in order',
          'Wait for each step to complete',
          'Use the validation commands to verify success'
        ]
      }
    ]
  }
};

// Guided tours
const helpTours = {
  firstTime: {
    id: 'firstTime',
    title: 'Welcome to AWS Deploy Assistant',
    description: 'Let\'s walk through the main features',
    steps: [
      {
        target: '[data-tour="upload"]',
        title: 'Start Here',
        content: 'Upload your code files or describe your application to begin the analysis.',
        position: 'bottom'
      },
      {
        target: '[data-tour="analysis"]',
        title: 'Code Analysis',
        content: 'We\'ll detect your framework, application type, and infrastructure requirements.',
        position: 'right'
      },
      {
        target: '[data-tour="recommendations"]',
        title: 'AWS Recommendations',
        content: 'Get personalized service recommendations with cost estimates and architecture diagrams.',
        position: 'left'
      },
      {
        target: '[data-tour="deployment"]',
        title: 'Deployment Guide',
        content: 'Follow step-by-step instructions to deploy your application to AWS.',
        position: 'top'
      }
    ]
  }
};

// Help Panel Component
export const HelpPanel = ({ topic, className = '' }) => {
  const [activeSection, setActiveSection] = useState(0);
  const content = helpContent[topic];

  if (!content) return null;

  return (
    <Card className={`max-w-md ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <BookOpen className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900">{content.title}</h3>
      </div>
      
      <p className="text-gray-600 mb-4">{content.description}</p>
      
      <div className="space-y-4">
        {content.sections.map((section, index) => (
          <div key={index}>
            <button
              onClick={() => setActiveSection(activeSection === index ? -1 : index)}
              className="flex items-center justify-between w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="font-medium text-gray-900">{section.title}</span>
              <ChevronRight 
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  activeSection === index ? 'rotate-90' : ''
                }`} 
              />
            </button>
            
            {activeSection === index && (
              <AnimatedTransition type="slide-down" className="mt-2 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700 mb-3">{section.content}</p>
                {section.tips && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Tips:</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {section.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="flex items-start space-x-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </AnimatedTransition>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

// Tour Overlay Component
export const TourOverlay = () => {
  const { currentTour, tourStep, nextStep, prevStep, endTour } = useHelp();

  if (!currentTour) return null;

  const currentStep = currentTour.steps[tourStep];
  const isLastStep = tourStep === currentTour.steps.length - 1;
  const isFirstStep = tourStep === 0;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      
      {/* Tour Card */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
        <Card className="max-w-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {currentStep.title}
            </h3>
            <button
              onClick={endTour}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <p className="text-gray-600 mb-6">{currentStep.content}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex space-x-1">
              {currentTour.steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === tourStep ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <div className="flex space-x-2">
              {!isFirstStep && (
                <Button variant="secondary" size="sm" onClick={prevStep}>
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              )}
              <Button 
                size="sm" 
                onClick={isLastStep ? endTour : nextStep}
              >
                {isLastStep ? 'Finish' : 'Next'}
                {!isLastStep && <ChevronRight className="w-4 h-4 ml-1" />}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// Help Button Component
export const HelpButton = ({ topic, tour, className = '' }) => {
  const { startTour } = useHelp();
  const [showPanel, setShowPanel] = useState(false);

  const handleClick = () => {
    if (tour) {
      startTour(tour);
    } else {
      setShowPanel(!showPanel);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleClick}
        className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
      >
        <HelpCircle className="w-4 h-4" />
        <span>Help</span>
      </button>
      
      {showPanel && topic && (
        <div className="absolute top-full right-0 mt-2 z-40">
          <HelpPanel topic={topic} />
        </div>
      )}
    </div>
  );
};

export default HelpSystem;