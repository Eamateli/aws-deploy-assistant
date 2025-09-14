import React, { useState } from 'react';
import { Card } from '../core/Card';
import { Button } from '../core/Button';
import { getAllDemoExamples } from '../../data/demoExamples';
import { Code, Globe, Server, Layers } from 'lucide-react';

const DemoExampleSelector = ({ onSelectExample, className = '' }) => {
  const [selectedExample, setSelectedExample] = useState(null);
  const examples = getAllDemoExamples();

  const getComplexityColor = (complexity) => {
    switch (complexity.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case 'e-commerce': return <Globe className="w-5 h-5" />;
      case 'backend api': return <Server className="w-5 h-5" />;
      case 'social platform': return <Layers className="w-5 h-5" />;
      case 'portfolio': return <Code className="w-5 h-5" />;
      default: return <Code className="w-5 h-5" />;
    }
  };

  const handleSelectExample = (example) => {
    setSelectedExample(example);
  };

  const handleUseExample = () => {
    if (selectedExample && onSelectExample) {
      onSelectExample(selectedExample);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Try a Demo Example
        </h3>
        <p className="text-gray-600">
          Select a realistic application example to see the analysis in action
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {examples.map((example) => (
          <Card
            key={example.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedExample?.id === example.id 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => handleSelectExample(example)}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg">
                {getCategoryIcon(example.category)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">
                    {example.name}
                  </h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getComplexityColor(example.complexity)}`}>
                    {example.complexity}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {example.description}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{example.files.length} files</span>
                  <span>{example.category}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {selectedExample && (
        <Card className="bg-blue-50 border-blue-200">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                {selectedExample.name}
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                {selectedExample.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Framework:</span>
                <span className="ml-2 text-gray-600">
                  {selectedExample.expectedAnalysis.framework}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">App Type:</span>
                <span className="ml-2 text-gray-600">
                  {selectedExample.expectedAnalysis.appType}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Database:</span>
                <span className="ml-2 text-gray-600">
                  {selectedExample.expectedAnalysis.database}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Est. Cost:</span>
                <span className="ml-2 text-gray-600">
                  ${selectedExample.estimatedCost.min}-${selectedExample.estimatedCost.max}/mo
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-blue-200">
              <Button 
                onClick={handleUseExample}
                className="w-full"
                variant="primary"
              >
                Use This Example
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DemoExampleSelector;