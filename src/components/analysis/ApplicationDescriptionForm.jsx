import React, { useState } from 'react';
import { 
  Code, 
  Server, 
  Database, 
  Globe, 
  Smartphone, 
  Users, 
  TrendingUp,
  Info,
  ChevronDown
} from 'lucide-react';

/**
 * ApplicationDescriptionForm - Manual application description interface
 * Allows users to describe their application through structured inputs
 */
const ApplicationDescriptionForm = ({ 
  onDescriptionChange, 
  initialData = {},
  className = '' 
}) => {
  const [formData, setFormData] = useState({
    description: initialData.description || '',
    framework: initialData.framework || '',
    appTypes: initialData.appTypes || [],
    expectedTraffic: initialData.expectedTraffic || 'low',
    features: initialData.features || [],
    database: initialData.database || '',
    deployment: initialData.deployment || '',
    ...initialData
  });

  // Framework options with descriptions
  const frameworkOptions = [
    { 
      value: 'react', 
      label: 'React', 
      description: 'Popular JavaScript library for building user interfaces',
      icon: Code 
    },
    { 
      value: 'vue', 
      label: 'Vue.js', 
      description: 'Progressive JavaScript framework for building UIs',
      icon: Code 
    },
    { 
      value: 'angular', 
      label: 'Angular', 
      description: 'Platform for building mobile and desktop web applications',
      icon: Code 
    },
    { 
      value: 'nodejs', 
      label: 'Node.js', 
      description: 'JavaScript runtime for server-side applications',
      icon: Server 
    },
    { 
      value: 'python', 
      label: 'Python', 
      description: 'Flask, Django, or FastAPI web applications',
      icon: Server 
    },
    { 
      value: 'php', 
      label: 'PHP', 
      description: 'Laravel, Symfony, or vanilla PHP applications',
      icon: Server 
    },
    { 
      value: 'java', 
      label: 'Java', 
      description: 'Spring Boot or other Java web frameworks',
      icon: Server 
    },
    { 
      value: 'dotnet', 
      label: '.NET', 
      description: 'ASP.NET Core or .NET Framework applications',
      icon: Server 
    },
    { 
      value: 'other', 
      label: 'Other', 
      description: 'Different framework or custom solution',
      icon: Code 
    }
  ];

  // Application type options
  const appTypeOptions = [
    {
      value: 'spa',
      label: 'Single Page Application (SPA)',
      description: 'Frontend-only app that runs in the browser',
      icon: Globe,
      examples: 'React dashboard, Vue portfolio, Angular admin panel'
    },
    {
      value: 'api',
      label: 'REST API / Backend Service',
      description: 'Server-side application providing API endpoints',
      icon: Server,
      examples: 'User management API, payment service, data processing'
    },
    {
      value: 'fullstack',
      label: 'Full-Stack Application',
      description: 'Combined frontend and backend in one application',
      icon: Database,
      examples: 'E-commerce site, social platform, CMS'
    },
    {
      value: 'static',
      label: 'Static Website',
      description: 'Simple website with HTML, CSS, and minimal JavaScript',
      icon: Globe,
      examples: 'Company website, blog, documentation site'
    },
    {
      value: 'mobile-api',
      label: 'Mobile App Backend',
      description: 'API specifically designed for mobile applications',
      icon: Smartphone,
      examples: 'iOS/Android app backend, push notifications, user sync'
    }
  ];

  // Traffic estimation options
  const trafficOptions = [
    {
      value: 'low',
      label: 'Low Traffic',
      description: 'Up to 10K monthly visitors',
      details: '< 1K daily active users, personal projects, small business',
      icon: Users,
      color: 'text-green-600'
    },
    {
      value: 'medium',
      label: 'Medium Traffic',
      description: '10K - 100K monthly visitors',
      details: '1K - 10K daily active users, growing business, regional app',
      icon: Users,
      color: 'text-yellow-600'
    },
    {
      value: 'high',
      label: 'High Traffic',
      description: '100K+ monthly visitors',
      details: '10K+ daily active users, established business, viral potential',
      icon: TrendingUp,
      color: 'text-red-600'
    }
  ];

  // Feature options that affect architecture
  const featureOptions = [
    {
      value: 'auth',
      label: 'User Authentication',
      description: 'Login, registration, user management',
      impact: 'Requires secure session management and user database'
    },
    {
      value: 'database',
      label: 'Database Storage',
      description: 'Persistent data storage and retrieval',
      impact: 'Needs managed database service (RDS, DynamoDB)'
    },
    {
      value: 'file-upload',
      label: 'File Upload/Storage',
      description: 'Image, document, or media file handling',
      impact: 'Requires object storage (S3) and CDN'
    },
    {
      value: 'realtime',
      label: 'Real-time Features',
      description: 'Live chat, notifications, live updates',
      impact: 'Needs WebSocket support or real-time services'
    },
    {
      value: 'payments',
      label: 'Payment Processing',
      description: 'E-commerce, subscriptions, transactions',
      impact: 'Requires secure payment integration and compliance'
    },
    {
      value: 'search',
      label: 'Search Functionality',
      description: 'Full-text search, filtering, indexing',
      impact: 'May need search service (Elasticsearch, CloudSearch)'
    },
    {
      value: 'analytics',
      label: 'Analytics & Reporting',
      description: 'User tracking, business metrics, dashboards',
      impact: 'Requires data processing and visualization tools'
    },
    {
      value: 'api-integration',
      label: 'Third-party APIs',
      description: 'External service integration (social, maps, etc.)',
      impact: 'Needs secure API key management and rate limiting'
    }
  ];

  // Database options
  const databaseOptions = [
    { value: 'none', label: 'No Database', description: 'Static content only' },
    { value: 'sql', label: 'SQL Database', description: 'MySQL, PostgreSQL (structured data)' },
    { value: 'nosql', label: 'NoSQL Database', description: 'MongoDB, DynamoDB (flexible schema)' },
    { value: 'both', label: 'Both SQL & NoSQL', description: 'Hybrid approach for different data types' },
    { value: 'unsure', label: 'Not Sure', description: 'Let us recommend based on your needs' }
  ];

  // Update form data and notify parent
  const updateFormData = (updates) => {
    const newFormData = { ...formData, ...updates };
    setFormData(newFormData);
    onDescriptionChange?.(newFormData);
  };

  // Handle text input changes
  const handleInputChange = (field, value) => {
    updateFormData({ [field]: value });
  };

  // Handle multi-select changes (app types, features)
  const handleMultiSelectChange = (field, value) => {
    const currentValues = formData[field] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    updateFormData({ [field]: newValues });
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Application Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Describe Your Application
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Tell us about your application: What does it do? Who are your users? What are the main features? Any special requirements?"
          className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
        />
        <p className="mt-2 text-xs text-gray-500">
          Be specific about functionality, user interactions, and business requirements
        </p>
      </div>

      {/* Framework Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Primary Framework/Technology
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {frameworkOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = formData.framework === option.value;
            
            return (
              <button
                key={option.value}
                onClick={() => handleInputChange('framework', option.value)}
                className={`p-4 text-left border-2 rounded-lg transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <Icon className={`mt-1 flex-shrink-0 ${
                    isSelected ? 'text-blue-600' : 'text-gray-500'
                  }`} size={20} />
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium ${
                      isSelected ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {option.label}
                    </h4>
                    <p className={`text-xs mt-1 ${
                      isSelected ? 'text-blue-700' : 'text-gray-600'
                    }`}>
                      {option.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Application Type Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Application Type (Select all that apply)
        </label>
        <div className="space-y-3">
          {appTypeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = formData.appTypes.includes(option.value);
            
            return (
              <div
                key={option.value}
                onClick={() => handleMultiSelectChange('appTypes', option.value)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex items-center mt-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}} // Handled by parent div onClick
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                  <Icon className={`mt-1 flex-shrink-0 ${
                    isSelected ? 'text-blue-600' : 'text-gray-500'
                  }`} size={20} />
                  <div className="flex-1">
                    <h4 className={`font-medium ${
                      isSelected ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {option.label}
                    </h4>
                    <p className={`text-sm mt-1 ${
                      isSelected ? 'text-blue-700' : 'text-gray-600'
                    }`}>
                      {option.description}
                    </p>
                    <p className={`text-xs mt-2 italic ${
                      isSelected ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      Examples: {option.examples}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expected Traffic */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Expected Traffic Level
        </label>
        <div className="space-y-3">
          {trafficOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = formData.expectedTraffic === option.value;
            
            return (
              <div
                key={option.value}
                onClick={() => handleInputChange('expectedTraffic', option.value)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex items-center mt-1">
                    <input
                      type="radio"
                      name="traffic"
                      checked={isSelected}
                      onChange={() => {}} // Handled by parent div onClick
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                  </div>
                  <Icon className={`mt-1 flex-shrink-0 ${option.color}`} size={20} />
                  <div className="flex-1">
                    <h4 className={`font-medium ${
                      isSelected ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {option.label}
                    </h4>
                    <p className={`text-sm mt-1 ${
                      isSelected ? 'text-blue-700' : 'text-gray-600'
                    }`}>
                      {option.description}
                    </p>
                    <p className={`text-xs mt-1 ${
                      isSelected ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {option.details}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Features Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Required Features (Select all that apply)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {featureOptions.map((option) => {
            const isSelected = formData.features.includes(option.value);
            
            return (
              <div
                key={option.value}
                onClick={() => handleMultiSelectChange('features', option.value)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex items-center mt-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}} // Handled by parent div onClick
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium text-sm ${
                      isSelected ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {option.label}
                    </h4>
                    <p className={`text-xs mt-1 ${
                      isSelected ? 'text-blue-700' : 'text-gray-600'
                    }`}>
                      {option.description}
                    </p>
                    <div className={`mt-2 flex items-start space-x-1 ${
                      isSelected ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      <Info size={12} className="mt-0.5 flex-shrink-0" />
                      <p className="text-xs">
                        {option.impact}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Database Preference */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Database Preference
        </label>
        <div className="space-y-2">
          {databaseOptions.map((option) => {
            const isSelected = formData.database === option.value;
            
            return (
              <div
                key={option.value}
                onClick={() => handleInputChange('database', option.value)}
                className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="database"
                    checked={isSelected}
                    onChange={() => {}} // Handled by parent div onClick
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <span className={`font-medium text-sm ${
                      isSelected ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {option.label}
                    </span>
                    <span className={`ml-2 text-xs ${
                      isSelected ? 'text-blue-700' : 'text-gray-600'
                    }`}>
                      {option.description}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      {(formData.description || formData.framework || formData.appTypes.length > 0) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <Info className="mr-2" size={16} />
            Configuration Summary
          </h4>
          <div className="space-y-2 text-sm text-gray-700">
            {formData.framework && (
              <div>
                <span className="font-medium">Framework:</span> {
                  frameworkOptions.find(f => f.value === formData.framework)?.label
                }
              </div>
            )}
            {formData.appTypes.length > 0 && (
              <div>
                <span className="font-medium">App Types:</span> {
                  formData.appTypes.map(type => 
                    appTypeOptions.find(t => t.value === type)?.label
                  ).join(', ')
                }
              </div>
            )}
            {formData.expectedTraffic && (
              <div>
                <span className="font-medium">Expected Traffic:</span> {
                  trafficOptions.find(t => t.value === formData.expectedTraffic)?.label
                }
              </div>
            )}
            {formData.features.length > 0 && (
              <div>
                <span className="font-medium">Features:</span> {
                  formData.features.map(feature => 
                    featureOptions.find(f => f.value === feature)?.label
                  ).join(', ')
                }
              </div>
            )}
            {formData.database && formData.database !== 'none' && (
              <div>
                <span className="font-medium">Database:</span> {
                  databaseOptions.find(d => d.value === formData.database)?.label
                }
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationDescriptionForm;