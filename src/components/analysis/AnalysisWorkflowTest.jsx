import React, { useState } from 'react';
import AnalysisWorkflow from './AnalysisWorkflow';

/**
 * AnalysisWorkflowTest - Test component for the complete analysis workflow
 */
const AnalysisWorkflowTest = () => {
  const [completedAnalysis, setCompletedAnalysis] = useState(null);

  const handleAnalysisComplete = (result) => {
    console.log('Analysis completed:', result);
    setCompletedAnalysis(result);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AWS Deploy Assistant
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Analyze your application and get personalized AWS deployment recommendations
          </p>
        </div>

        <AnalysisWorkflow onAnalysisComplete={handleAnalysisComplete} />

        {/* Debug Information */}
        {completedAnalysis && (
          <div className="mt-12 bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Analysis Result (Debug)
            </h3>
            <pre className="bg-gray-50 p-4 rounded text-sm overflow-x-auto">
              {JSON.stringify(completedAnalysis, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisWorkflowTest;