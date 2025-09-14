import React, { useState } from 'react';
import { Settings, ChevronDown, ChevronUp } from 'lucide-react';
import Button from './Button';
import Card from './Card';
import ValidationMessage from './ValidationMessage';

const ManualFallback = ({ 
  detected = {}, 
  onConfirm, 
  onCancel,
  title = "Review Detection Results",
  message = "Please review and correct the detected patterns below."
}) => {
  const [framework, setFramework] = useState(detected.framework || '');
  const [appType, setAppType] = useState(detected.appType || '');
  const [database, setDatabase] = useState(detected.database || 'none');
  const [auth, setAuth] = useState(detected.auth || false);
  const [realtime, setRealtime] = useState(detected.realtime || false);
  const [storage, setStorage] = useState(detected.storage || false);
  const [traffic, setTraffic] = useState(detected.expectedTraffic || 'low');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errors, setErrors] = useState([]);

  const frameworkOptions = [
    { value: 'react', label: 'React', description: 'React.js single page application' },
    { value: 'vue', label: 'Vue.js', description: 'Vue.js application' },
    { value: 'angular', label: 'Angular', description: 'Angular application' },
    { value: 'nodejs', label: 'Node.js', description: 'Node.js backend application' },
    { value: 'python', label: 'Python', description: 'Python web application (Flask/Django/FastAPI)' },
    { value: 'static', label: 'Static HTML', description: 'Static HTML/CSS/JS website' },
    { value: 'other', label: 'Other', description: 'Other framework or custom application' }
  ];

  const appTypeOptions = [
    { value: 'spa', label: 'Single Page App', description: 'Frontend app that calls external APIs' },
    { value: 'ssr', label: 'Server-Side Rendered', description: 'App with server-side rendering' },
    { value: 'api', label: 'API/Backend', description: 'REST API or backend service' },
    { value: 'fullstack', label: 'Full-Stack', description: 'Combined frontend and backend' },
    { value: 'static', label: 'Static Site', description: 'Static website with no backend' }
  ];

  const databaseOptions = [
    { value: 'none', label: 'No Database', description: 'No persistent data storage needed' },
    { value: 'required', label: 'Database Required', description: 'Needs persistent data storage' },
    { value: 'optional', label: 'Database Optional', description: 'May need database in the future' }
  ];

  const trafficOptions = [
    { value: 'low', label: 'Low Traffic', description: 'Less than 1,000 users/month' },
    { value: 'medium', label: 'Medium Traffic', description: '1,000 - 100,000 users/month' },
    { value: 'high', label: 'High Traffic', description: 'More than 100,000 users/month' }
  ];

  const validateSelections = () => {
    const newErrors = [];
    
    if (!framework) {
      newErrors.push({
        type: 'FRAMEWORK_REQUIRED',
        message: 'Please select a framework'
      });
    }
    
    if (!appType) {
      newErrors.push({
        type: 'APP_TYPE_REQUIRED',
        message: 'Please select an application type'
      });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleConfirm = () => {
    if (!validateSelections()) return;

    const correctedDetection = {
      framework,
      appType,
      database,
      auth,
      realtime,
      storage,
      expectedTraffic: traffic,
      complexity: calculateComplexity(),
      confidence: 1.0, // Manual selection = 100% confidence
      manuallyConfirmed: true
    };

    onConfirm(correctedDetection);
  };

  const calculateComplexity = () => {
    let complexity = 1;
    if (database === 'required') complexity += 1;
    if (auth) complexity += 1;
    if (realtime) complexity += 1;
    if (storage) complexity += 1;
    if (traffic === 'high') complexity += 1;
    return Math.min(complexity, 5);
  };

  return (
    <Card title={title} className="max-w-2xl mx-auto">
      <div className="space-y-6">
        <p className="text-gray-600">{message}</p>

        {errors.length > 0 && (
          <ValidationMessage messages={errors} />
        )}

        {/* Framework Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Framework *
          </label>
          <select
            value={framework}
            onChange={(e) => setFramework(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a framework...</option>
            {frameworkOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label} - {option.description}
              </option>
            ))}
          </select>
        </div>

        {/* Application Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Application Type *
          </label>
          <select
            value={appType}
            onChange={(e) => setAppType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select application type...</option>
            {appTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label} - {option.description}
              </option>
            ))}
          </select>
        </div>

        {/* Advanced Options Toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <Settings size={16} />
          <span>Advanced Options</span>
          {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showAdvanced && (
          <div className="space-y-4 border-t pt-4">
            {/* Database Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Database Requirements
              </label>
              <select
                value={database}
                onChange={(e) => setDatabase(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {databaseOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label} - {option.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Feature Checkboxes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={auth}
                  onChange={(e) => setAuth(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">User Authentication</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={realtime}
                  onChange={(e) => setRealtime(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Real-time Features</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={storage}
                  onChange={(e) => setStorage(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">File Storage</span>
              </label>
            </div>

            {/* Traffic Expectations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Traffic
              </label>
              <select
                value={traffic}
                onChange={(e) => setTraffic(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {trafficOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label} - {option.description}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Confirm Selection
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ManualFallback;