// DeploymentGuideTest.jsx - Test component for deployment guide functionality
import React, { useState } from 'react';
import DeploymentGuide from './DeploymentGuide.jsx';
import { architecturePatterns } from '../../data/architecturePatterns.js';

/**
 * Test component for demonstrating deployment guide functionality
 */
const DeploymentGuideTest = () => {
  const [selectedPattern, setSelectedPattern] = useState('static-spa');
  const [userParams, setUserParams] = useState({
    appName: 'my-test-app',
    region: 'us-east-1',
    experienceLevel: 'intermediate',
    awsExperience: 'some',
    devopsExperience: 'some',
    timeAvailable: 'adequate',
    hasTeamSupport: false,
    firstTimeAWS: false,
    timeConstraints: 'normal'
  });

  const handlePatternChange = (patternId) => {
    setSelectedPattern(patternId);
  };

  const handleParamChange = (key, value) => {
    setUserParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleStepComplete = (stepIndex, step) => {
    console.log('Step completed:', stepIndex, step.title);
  };

  const handleDeploymentComplete = (guide) => {
    console.log('Deployment completed:', guide.name);
  };

  const currentPattern = architecturePatterns[selectedPattern];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Deployment Guide Test
        </h1>

        {/* Pattern Selection */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Select Architecture Pattern
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(architecturePatterns).map(([id, pattern]) => (
              <button
                key={id}
                onClick={() => handlePatternChange(id)}
                className={`p-3 border rounded-lg text-left transition-all ${
                  selectedPattern === id
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium text-sm">{pattern.name}</div>
                <div className="text-xs text-gray-600 mt-1">
                  {pattern.description}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Complexity: {pattern.characteristics.complexity}/5
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Parameter Configuration */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Configuration Parameters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Application Name
              </label>
              <input
                type="text"
                value={userParams.appName}
                onChange={(e) => handleParamChange('appName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="my-app"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                AWS Region
              </label>
              <select
                value={userParams.region}
                onChange={(e) => handleParamChange('region', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="us-east-1">US East (N. Virginia)</option>
                <option value="us-west-2">US West (Oregon)</option>
                <option value="eu-west-1">Europe (Ireland)</option>
                <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Experience Level
              </label>
              <select
                value={userParams.experienceLevel}
                onChange={(e) => handleParamChange('experienceLevel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                AWS Experience
              </label>
              <select
                value={userParams.awsExperience}
                onChange={(e) => handleParamChange('awsExperience', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="none">None</option>
                <option value="some">Some</option>
                <option value="experienced">Experienced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                DevOps Experience
              </label>
              <select
                value={userParams.devopsExperience}
                onChange={(e) => handleParamChange('devopsExperience', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="none">None</option>
                <option value="some">Some</option>
                <option value="experienced">Experienced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Available
              </label>
              <select
                value={userParams.timeAvailable}
                onChange={(e) => handleParamChange('timeAvailable', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="limited">Limited</option>
                <option value="adequate">Adequate</option>
                <option value="plenty">Plenty</option>
              </select>
            </div>
          </div>
          
          {/* Checkboxes */}
          <div className="mt-4 space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={userParams.hasTeamSupport}
                onChange={(e) => handleParamChange('hasTeamSupport', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Has team support available</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={userParams.firstTimeAWS}
                onChange={(e) => handleParamChange('firstTimeAWS', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">First time using AWS</span>
            </label>
          </div>
        </div>

        {/* Pattern Information */}
        {currentPattern && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
              Selected Pattern: {currentPattern.name}
            </h3>
            <p className="text-gray-600 text-sm mb-3">
              {currentPattern.description}
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Complexity:</span>
                <span className="ml-2 font-medium">
                  {currentPattern.characteristics.complexity}/5
                </span>
              </div>
              <div>
                <span className="text-gray-500">Scalability:</span>
                <span className="ml-2 font-medium">
                  {currentPattern.characteristics.scalability}/5
                </span>
              </div>
              <div>
                <span className="text-gray-500">Cost:</span>
                <span className="ml-2 font-medium">
                  ${currentPattern.costEstimate.monthly.min}-${currentPattern.costEstimate.monthly.max}/mo
                </span>
              </div>
              <div>
                <span className="text-gray-500">Services:</span>
                <span className="ml-2 font-medium">
                  {currentPattern.services.length} services
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Deployment Guide */}
      {currentPattern && (
        <DeploymentGuide
          architecturePattern={currentPattern}
          userParameters={userParams}
          onStepComplete={handleStepComplete}
          onDeploymentComplete={handleDeploymentComplete}
        />
      )}

      {/* Interactive Features Demo */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Interactive Features Demo</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Command Copying Demo */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Command Copying</h4>
            <div className="bg-gray-900 text-green-400 p-3 rounded text-sm font-mono relative group">
              <pre>aws s3 mb s3://my-test-bucket-{Math.random().toString(36).substring(7)}</pre>
              <button 
                className="absolute top-2 right-2 p-1 bg-gray-700 hover:bg-gray-600 rounded text-white opacity-0 group-hover:opacity-100 transition-all"
                onClick={() => navigator.clipboard.writeText('aws s3 mb s3://my-test-bucket')}
              >
                📋
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Hover to see copy button</p>
          </div>

          {/* Progress Tracking Demo */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Progress Tracking</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-sm text-gray-700">Prerequisites validated</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">2</span>
                </div>
                <span className="text-sm text-gray-700">Build application (in progress)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 text-xs">3</span>
                </div>
                <span className="text-sm text-gray-500">Deploy to AWS (pending)</span>
              </div>
            </div>
          </div>

          {/* Validation Demo */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Step Validation</h4>
            <div className="bg-green-50 border border-green-200 rounded p-2">
              <div className="flex items-center space-x-2 text-green-800">
                <span className="text-sm">✓ Validation passed</span>
              </div>
              <p className="text-xs text-green-700 mt-1">S3 bucket created successfully</p>
            </div>
          </div>

          {/* Automated Testing Demo */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Automated Testing</h4>
            <div className="bg-blue-50 border border-blue-200 rounded p-2">
              <div className="flex items-center space-x-2 text-blue-800">
                <span className="text-sm">🧪 3 tests passed</span>
              </div>
              <p className="text-xs text-blue-700 mt-1">All deployment tests completed successfully</p>
            </div>
          </div>

          {/* Success Confirmation Demo */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Success Confirmation</h4>
            <div className="bg-green-50 border border-green-200 rounded p-2">
              <div className="flex items-center space-x-2 text-green-800">
                <span className="text-sm">🎉 Deployment successful</span>
              </div>
              <p className="text-xs text-green-700 mt-1">All validation checks passed</p>
            </div>
          </div>

          {/* Rollback Demo */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Rollback Available</h4>
            <div className="bg-red-50 border border-red-200 rounded p-2">
              <div className="flex items-center space-x-2 text-red-800">
                <span className="text-sm">🔄 Emergency rollback ready</span>
              </div>
              <p className="text-xs text-red-700 mt-1">Can undo deployment if needed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Summary */}
      <div className="bg-gray-100 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Configuration Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Pattern:</span>
            <div>{selectedPattern}</div>
          </div>
          <div>
            <span className="font-medium">App Name:</span>
            <div>{userParams.appName}</div>
          </div>
          <div>
            <span className="font-medium">Region:</span>
            <div>{userParams.region}</div>
          </div>
          <div>
            <span className="font-medium">Experience:</span>
            <div>{userParams.experienceLevel}</div>
          </div>
          <div>
            <span className="font-medium">AWS Experience:</span>
            <div>{userParams.awsExperience}</div>
          </div>
          <div>
            <span className="font-medium">Services:</span>
            <div>{currentPattern?.services.length || 0} services</div>
          </div>
          <div>
            <span className="font-medium">Team Support:</span>
            <div>{userParams.hasTeamSupport ? 'Yes' : 'No'}</div>
          </div>
          <div>
            <span className="font-medium">First Time AWS:</span>
            <div>{userParams.firstTimeAWS ? 'Yes' : 'No'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeploymentGuideTest;