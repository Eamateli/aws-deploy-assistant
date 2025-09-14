import React, { useState, useEffect } from 'react';
import { Card } from '../core/Card';
import { Button } from '../core/Button';
import { LoadingSpinner } from '../core/LoadingSpinner';
import DemoExampleSelector from './DemoExampleSelector';
import { analyzeApplication } from '../../utils/patternMatchers';
import { generateRecommendations } from '../../utils/serviceRecommender';
import { Play, CheckCircle, Clock, ArrowRight } from 'lucide-react';

const DemoWorkflow = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedExample, setSelectedExample] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const steps = [
    {
      id: 'select',
      title: 'Select Demo Example',
      description: 'Choose a realistic application to analyze',
      icon: Play,
      status: selectedExample ? 'completed' : 'current'
    },
    {
      id: 'analyze',
      title: 'Code Analysis',
      description: 'Detect patterns and requirements',
      icon: Clock,
      status: analysisResult ? 'completed' : selectedExample ? 'current' : 'pending'
    },
    {
      id: 'recommend',
      title: 'AWS Recommendations',
      description: 'Generate optimal architecture',
      icon: CheckCircle,
      status: recommendations ? 'completed' : analysisResult ? 'current' : 'pending'
    }
  ];

  const handleExampleSelect = (example) => {
    setSelectedExample(example);
    setCurrentStep(1);
  };

  const handleAnalyze = async () => {
    if (!selectedExample) return;

    setIsProcessing(true);
    
    // Simulate analysis process with realistic timing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const analysisInput = {
      description: selectedExample.description,
      files: selectedExample.files,
      timestamp: new Date().toISOString()
    };

    const result = analyzeApplication(analysisInput);
    setAnalysisResult(result);
    setCurrentStep(2);
    setIsProcessing(false);
  };

  const handleGenerateRecommendations = async () => {
    if (!analysisResult) return;

    setIsProcessing(true);
    
    // Simulate recommendation generation
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const recs = generateRecommendations(analysisResult);
    setRecommendations(recs);
    setIsProcessing(false);
    
    if (onComplete) {
      onComplete({
        example: selectedExample,
        analysis: analysisResult,
        recommendations: recs
      });
    }
  };

  const getStepStatus = (step, index) => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'current';
    return 'pending';
  };

  const StepIndicator = ({ step, index, status }) => {
    const Icon = step.icon;
    
    return (
      <div className="flex items-center">
        <div className={`
          flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
          ${status === 'completed' ? 'bg-green-500 border-green-500 text-white' :
            status === 'current' ? 'bg-blue-500 border-blue-500 text-white' :
            'bg-gray-100 border-gray-300 text-gray-400'}
        `}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="ml-3">
          <h4 className={`text-sm font-medium ${
            status === 'pending' ? 'text-gray-400' : 'text-gray-900'
          }`}>
            {step.title}
          </h4>
          <p className={`text-xs ${
            status === 'pending' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {step.description}
          </p>
        </div>
        {index < steps.length - 1 && (
          <ArrowRight className="w-4 h-4 text-gray-400 ml-4" />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Progress Indicator */}
      <Card>
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <StepIndicator
              key={step.id}
              step={step}
              index={index}
              status={getStepStatus(step, index)}
            />
          ))}
        </div>
      </Card>

      {/* Step Content */}
      {currentStep === 0 && (
        <DemoExampleSelector onSelectExample={handleExampleSelect} />
      )}

      {currentStep === 1 && selectedExample && (
        <Card>
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Ready to Analyze: {selectedExample.name}
            </h3>
            <p className="text-gray-600">
              We'll analyze {selectedExample.files.length} files to detect patterns and requirements
            </p>
            
            {isProcessing ? (
              <div className="flex flex-col items-center space-y-3">
                <LoadingSpinner size="lg" />
                <p className="text-sm text-gray-600">
                  Analyzing code patterns and dependencies...
                </p>
              </div>
            ) : (
              <Button onClick={handleAnalyze} size="lg">
                Start Analysis
              </Button>
            )}
          </div>
        </Card>
      )}

      {currentStep === 2 && analysisResult && (
        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Analysis Results
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(analysisResult.confidence * 100)}%
                </div>
                <div className="text-sm text-gray-600">Confidence</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {analysisResult.detected.framework}
                </div>
                <div className="text-sm text-gray-600">Framework</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {analysisResult.detected.appType}
                </div>
                <div className="text-sm text-gray-600">App Type</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {analysisResult.detected.complexity}/5
                </div>
                <div className="text-sm text-gray-600">Complexity</div>
              </div>
            </div>

            {isProcessing ? (
              <div className="flex flex-col items-center space-y-3">
                <LoadingSpinner size="lg" />
                <p className="text-sm text-gray-600">
                  Generating AWS service recommendations...
                </p>
              </div>
            ) : (
              <Button onClick={handleGenerateRecommendations} size="lg" className="w-full">
                Generate AWS Recommendations
              </Button>
            )}
          </Card>
        </div>
      )}

      {recommendations && (
        <Card>
          <div className="text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-900">
              Demo Complete!
            </h3>
            <p className="text-gray-600">
              Successfully generated {recommendations.length} architecture recommendation(s) 
              for {selectedExample.name}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-lg font-semibold text-blue-600">
                  {recommendations[0]?.services?.length || 0}
                </div>
                <div className="text-sm text-gray-600">AWS Services</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-lg font-semibold text-green-600">
                  ${selectedExample.estimatedCost.typical}/mo
                </div>
                <div className="text-sm text-gray-600">Est. Cost</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-lg font-semibold text-purple-600">
                  {selectedExample.complexity}
                </div>
                <div className="text-sm text-gray-600">Complexity</div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DemoWorkflow;