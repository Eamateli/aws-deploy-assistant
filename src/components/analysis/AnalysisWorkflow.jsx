import React, { useState } from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import AnalysisInput from './AnalysisInput';
import AnalysisProgress from './AnalysisProgress';

/**
 * AnalysisWorkflow - Complete analysis workflow component
 * Orchestrates the entire analysis process from input to results
 */
const AnalysisWorkflow = ({ onAnalysisComplete, className = '' }) => {
  const [currentStep, setCurrentStep] = useState('input'); // input, analysis, results
  const [analysisData, setAnalysisData] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Handle when analysis input is ready
  const handleAnalysisReady = (data) => {
    setAnalysisData(data);
  };

  // Start analysis process
  const startAnalysis = () => {
    if (analysisData) {
      setCurrentStep('analysis');
    }
  };

  // Handle analysis completion
  const handleAnalysisComplete = (result) => {
    setAnalysisResult(result);
    setCurrentStep('results');
    onAnalysisComplete?.(result);
  };

  // Handle analysis error
  const handleAnalysisError = (error) => {
    console.error('Analysis error:', error);
    // Stay on analysis step to show error state
  };

  // Reset workflow
  const resetWorkflow = () => {
    setCurrentStep('input');
    setAnalysisData(null);
    setAnalysisResult(null);
  };

  // Workflow steps for progress indicator
  const workflowSteps = [
    { id: 'input', name: 'Input', description: 'Provide application details' },
    { id: 'analysis', name: 'Analysis', description: 'Analyze patterns and requirements' },
    { id: 'results', name: 'Results', description: 'Review analysis results' }
  ];

  return (
    <div className={`max-w-7xl mx-auto ${className}`}>
      {/* Workflow Progress Indicator */}
      <div className="mb-12">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-8">
            {workflowSteps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                    currentStep === step.id 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : workflowSteps.findIndex(s => s.id === currentStep) > index 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                    {workflowSteps.findIndex(s => s.id === currentStep) > index ? (
                      <CheckCircle size={20} />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="mt-3 text-center">
                    <div className={`text-sm font-medium ${
                      currentStep === step.id ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {step.name}
                    </div>
                    <div className="text-xs text-gray-400 mt-1 max-w-24">
                      {step.description}
                    </div>
                  </div>
                </div>
                
                {index < workflowSteps.length - 1 && (
                  <ArrowRight className="mx-6 text-gray-400 flex-shrink-0" size={20} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-96">
        {currentStep === 'input' && (
          <div>
            <AnalysisInput onAnalysisReady={handleAnalysisReady} />
            
            {/* Continue Button */}
            {analysisData && (
              <div className="mt-8 text-center">
                <button
                  onClick={startAnalysis}
                  className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  Continue to Analysis
                  <ArrowRight className="ml-2" size={20} />
                </button>
              </div>
            )}
          </div>
        )}

        {currentStep === 'analysis' && (
          <AnalysisProgress
            analysisData={analysisData}
            onAnalysisComplete={handleAnalysisComplete}
            onAnalysisError={handleAnalysisError}
          />
        )}

        {currentStep === 'results' && analysisResult && (
          <div className="text-center">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                <CheckCircle className="text-green-600" size={32} />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Analysis Complete!
              </h2>
              
              <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
                We've successfully analyzed your {analysisResult.detected?.name || 'application'} and 
                identified the optimal AWS architecture patterns. You're ready to proceed to recommendations.
              </p>

              {/* Quick Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Application Type</h4>
                  <p className="text-blue-700">
                    {analysisResult.detected?.appType?.toUpperCase() || 'Unknown'}
                  </p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">Confidence Level</h4>
                  <p className="text-green-700">
                    {Math.round(analysisResult.confidence * 100)}%
                  </p>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-2">Analysis Method</h4>
                  <p className="text-purple-700 capitalize">
                    {analysisResult.method?.replace('-', ' ') || 'Unknown'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4">
                <button
                  onClick={resetWorkflow}
                  className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Start Over
                </button>
                
                <button
                  onClick={() => onAnalysisComplete?.(analysisResult)}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-all"
                >
                  View Recommendations
                  <ArrowRight className="inline ml-2" size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisWorkflow;