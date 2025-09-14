import React, { useState } from 'react';
import { 
  CheckCircle, 
  Star, 
  DollarSign, 
  Zap, 
  Shield, 
  TrendingUp, 
  Clock, 
  Users,
  AlertTriangle,
  Info,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Copy,
  Download
} from 'lucide-react';
import ServiceCard from './ServiceCard';

/**
 * ArchitectureRecommendation - Complete architecture recommendation display
 * Shows architecture pattern with services, metrics, costs, and deployment information
 */
const ArchitectureRecommendation = ({ 
  recommendation, 
  isSelected = false, 
  onSelect, 
  onServiceSelect,
  onViewDeployment,
  showServices = true,
  className = '' 
}) => {
  const [servicesExpanded, setServicesExpanded] = useState(showServices);
  const [metricsExpanded, setMetricsExpanded] = useState(false);
  const [deploymentExpanded, setDeploymentExpanded] = useState(false);

  const { pattern, services, characteristics, costEstimate, pros, cons } = recommendation;

  // Get recommendation tier styling
  const getTierStyling = () => {
    switch (recommendation.rank) {
      case 1:
        return 'border-green-500 bg-gradient-to-br from-green-50 to-green-100 shadow-lg';
      case 2:
        return 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-md';
      case 3:
        return 'border-yellow-500 bg-gradient-to-br from-yellow-50 to-yellow-100 shadow-md';
      default:
        return 'border-gray-300 bg-white shadow-sm';
    }
  };

  // Get rank badge
  const getRankBadge = () => {
    const badges = {
      1: { label: 'Best Match', color: 'bg-green-500 text-white', icon: Star },
      2: { label: 'Good Option', color: 'bg-blue-500 text-white', icon: CheckCircle },
      3: { label: 'Alternative', color: 'bg-yellow-500 text-white', icon: Info }
    };
    
    const badge = badges[recommendation.rank] || { 
      label: 'Option', 
      color: 'bg-gray-500 text-white', 
      icon: Info 
    };
    
    const IconComponent = badge.icon;
    
    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        <IconComponent size={14} className="mr-1" />
        {badge.label}
      </div>
    );
  };

  // Get characteristic score display
  const getCharacteristicDisplay = (value, max = 5) => {
    const percentage = (value / max) * 100;
    const color = percentage >= 80 ? 'bg-green-500' : 
                  percentage >= 60 ? 'bg-blue-500' : 
                  percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500';
    
    return (
      <div className="flex items-center space-x-2">
        <div className="flex space-x-1">
          {Array.from({ length: max }, (_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${
                i < value ? color : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-gray-600">{value}/{max}</span>
      </div>
    );
  };

  return (
    <div className={`
      border-2 rounded-xl transition-all duration-300 cursor-pointer
      ${isSelected ? 'ring-4 ring-blue-500 ring-opacity-30 transform scale-[1.02]' : 'hover:shadow-lg'}
      ${getTierStyling()}
      ${className}
    `}>
      {/* Header */}
      <div 
        className="p-6"
        onClick={() => onSelect?.(recommendation)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-xl font-bold text-gray-900">
                {recommendation.name}
              </h3>
              {getRankBadge()}
            </div>
            
            <p className="text-gray-600 mb-4 leading-relaxed">
              {recommendation.description}
            </p>

            {/* Key Metrics Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-white bg-opacity-60 rounded-lg">
                <DollarSign className="mx-auto text-green-600 mb-1" size={20} />
                <div className="text-lg font-bold text-gray-900">
                  ${costEstimate?.monthly || 0}
                </div>
                <div className="text-xs text-gray-600">per month</div>
              </div>
              
              <div className="text-center p-3 bg-white bg-opacity-60 rounded-lg">
                <Zap className="mx-auto text-blue-600 mb-1" size={20} />
                <div className="text-lg font-bold text-gray-900">
                  {characteristics?.complexity || 3}/5
                </div>
                <div className="text-xs text-gray-600">complexity</div>
              </div>
              
              <div className="text-center p-3 bg-white bg-opacity-60 rounded-lg">
                <TrendingUp className="mx-auto text-purple-600 mb-1" size={20} />
                <div className="text-lg font-bold text-gray-900">
                  {characteristics?.scalability || 3}/5
                </div>
                <div className="text-xs text-gray-600">scalability</div>
              </div>
              
              <div className="text-center p-3 bg-white bg-opacity-60 rounded-lg">
                <Clock className="mx-auto text-orange-600 mb-1" size={20} />
                <div className="text-lg font-bold text-gray-900">
                  {pattern?.deployment?.timeEstimate || '30min'}
                </div>
                <div className="text-xs text-gray-600">setup time</div>
              </div>
            </div>

            {/* Confidence Score */}
            {recommendation.confidence && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Recommendation Confidence</span>
                  <span className="font-medium text-gray-900">
                    {Math.round(recommendation.confidence * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${recommendation.confidence * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Selection Indicator */}
          {isSelected && (
            <div className="flex-shrink-0 ml-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="text-white" size={24} />
              </div>
            </div>
          )}
        </div>

        {/* Quick Benefits */}
        {pros && pros.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {pros.slice(0, 4).map((pro, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full"
                >
                  <CheckCircle size={12} className="mr-1" />
                  {pro}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Warnings */}
        {recommendation.warnings && recommendation.warnings.length > 0 && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={16} />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Considerations</h4>
                <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                  {recommendation.warnings.map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Optimization Focus */}
        {recommendation.optimizationFocus && recommendation.optimizationFocus !== 'base' && (
          <div className="mb-4">
            <span className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
              <Zap size={12} className="mr-1" />
              Optimized for {recommendation.optimizationFocus}
            </span>
          </div>
        )}
      </div>

      {/* Expandable Sections */}
      <div className="border-t border-gray-200 bg-white bg-opacity-80">
        {/* Services Section */}
        <div className="border-b border-gray-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setServicesExpanded(!servicesExpanded);
            }}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-gray-900">
                AWS Services ({services?.length || 0})
              </h4>
              <span className="text-sm text-gray-500">
                ${costEstimate?.breakdown?.reduce((sum, item) => sum + item.cost, 0) || 0}/month total
              </span>
            </div>
            {servicesExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </button>
          
          {servicesExpanded && services && (
            <div className="px-6 pb-6">
              <div className="grid gap-4">
                {services.map((service, index) => (
                  <ServiceCard
                    key={service.serviceId || index}
                    service={service}
                    onSelect={onServiceSelect}
                    showDetails={false}
                    className="shadow-sm"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Detailed Metrics Section */}
        <div className="border-b border-gray-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMetricsExpanded(!metricsExpanded);
            }}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <h4 className="font-medium text-gray-900">Detailed Characteristics</h4>
            {metricsExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </button>
          
          {metricsExpanded && characteristics && (
            <div className="px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Complexity</span>
                      <span className="text-sm text-gray-600">{characteristics.complexity}/5</span>
                    </div>
                    {getCharacteristicDisplay(6 - characteristics.complexity)} {/* Invert for display */}
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Scalability</span>
                      <span className="text-sm text-gray-600">{characteristics.scalability}/5</span>
                    </div>
                    {getCharacteristicDisplay(characteristics.scalability)}
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Availability</span>
                      <span className="text-sm text-gray-600">{characteristics.availability || 4}/5</span>
                    </div>
                    {getCharacteristicDisplay(characteristics.availability || 4)}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Security</span>
                      <span className="text-sm text-gray-600">{characteristics.security || 4}/5</span>
                    </div>
                    {getCharacteristicDisplay(characteristics.security || 4)}
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Cost Efficiency</span>
                      <span className="text-sm text-gray-600">{6 - (characteristics.cost || 3)}/5</span>
                    </div>
                    {getCharacteristicDisplay(6 - (characteristics.cost || 3))} {/* Invert for display */}
                  </div>
                </div>
              </div>

              {/* Cost Breakdown */}
              {costEstimate?.breakdown && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-3">Cost Breakdown</h5>
                  <div className="space-y-2">
                    {costEstimate.breakdown.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">{item.service}</span>
                        <span className="font-medium text-gray-900">${item.cost}/month</span>
                      </div>
                    ))}
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between items-center text-sm font-medium">
                        <span className="text-gray-900">Total</span>
                        <span className="text-gray-900">${costEstimate.monthly}/month</span>
                      </div>
                    </div>
                  </div>
                  
                  {costEstimate.freeTierEligible && (
                    <div className="mt-3 p-2 bg-green-100 text-green-800 text-sm rounded">
                      <CheckCircle size={14} className="inline mr-1" />
                      Eligible for AWS Free Tier
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Deployment Information */}
        <div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeploymentExpanded(!deploymentExpanded);
            }}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <h4 className="font-medium text-gray-900">Deployment Information</h4>
            {deploymentExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </button>
          
          {deploymentExpanded && pattern?.deployment && (
            <div className="px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-900 mb-3">Deployment Details</h5>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Complexity:</span>
                      <span className="font-medium">{pattern.deployment.complexity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated Time:</span>
                      <span className="font-medium">{pattern.deployment.timeEstimate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Automation Level:</span>
                      <span className="font-medium">{pattern.deployment.automationLevel}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-900 mb-3">Prerequisites</h5>
                  <ul className="space-y-2 text-sm">
                    {pattern.deployment.prerequisites?.map((prereq, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle size={14} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{prereq}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="border-t border-gray-200 bg-white p-6">
        <div className="flex space-x-3">
          <button
            onClick={() => onSelect?.(recommendation)}
            className={`
              flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200
              ${isSelected 
                ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg' 
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
              }
            `}
          >
            {isSelected ? 'Selected Architecture' : 'Select This Architecture'}
          </button>
          
          {onViewDeployment && (
            <button
              onClick={() => onViewDeployment(recommendation)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              View Deployment Guide
            </button>
          )}
          
          <button
            onClick={() => {
              // Copy architecture summary to clipboard
              const summary = `${recommendation.name}\n${recommendation.description}\nEstimated Cost: $${costEstimate?.monthly || 0}/month`;
              navigator.clipboard.writeText(summary);
            }}
            className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            title="Copy summary"
          >
            <Copy size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArchitectureRecommendation;