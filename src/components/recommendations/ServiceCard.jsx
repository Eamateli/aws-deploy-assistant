import React, { useState } from 'react';
import { 
  Info, 
  DollarSign, 
  Zap, 
  Shield, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';

/**
 * ServiceCard - Individual AWS service display component
 * Shows service details, pricing, characteristics, and configuration options
 */
const ServiceCard = ({ 
  service, 
  isSelected = false, 
  onSelect, 
  onConfigure,
  showDetails = false,
  className = '' 
}) => {
  const [expanded, setExpanded] = useState(showDetails);
  const [configExpanded, setConfigExpanded] = useState(false);

  const serviceDefinition = service.serviceDefinition;
  const Icon = serviceDefinition?.icon || Zap;
  
  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      compute: 'text-orange-500 bg-orange-100',
      storage: 'text-blue-500 bg-blue-100',
      database: 'text-green-500 bg-green-100',
      networking: 'text-purple-500 bg-purple-100',
      security: 'text-red-500 bg-red-100',
      monitoring: 'text-yellow-500 bg-yellow-100'
    };
    return colors[category] || 'text-gray-500 bg-gray-100';
  };

  // Get complexity indicator
  const getComplexityIndicator = (complexity) => {
    const level = complexity || 3;
    const colors = ['bg-green-400', 'bg-green-400', 'bg-yellow-400', 'bg-orange-400', 'bg-red-400'];
    const labels = ['Very Easy', 'Easy', 'Moderate', 'Complex', 'Very Complex'];
    
    return {
      color: colors[level - 1] || colors[2],
      label: labels[level - 1] || labels[2],
      dots: Array.from({ length: 5 }, (_, i) => i < level)
    };
  };

  // Get tier styling
  const getTierStyling = (tier) => {
    const styles = {
      recommended: 'border-green-500 bg-green-50 shadow-lg',
      suitable: 'border-blue-500 bg-blue-50 shadow-md',
      acceptable: 'border-yellow-500 bg-yellow-50 shadow-sm',
      'not-recommended': 'border-red-500 bg-red-50 shadow-sm'
    };
    return styles[tier] || 'border-gray-200 bg-white';
  };

  // Get tier badge
  const getTierBadge = (tier) => {
    const badges = {
      recommended: { label: 'Recommended', color: 'bg-green-500 text-white' },
      suitable: { label: 'Suitable', color: 'bg-blue-500 text-white' },
      acceptable: { label: 'Acceptable', color: 'bg-yellow-500 text-white' },
      'not-recommended': { label: 'Not Recommended', color: 'bg-red-500 text-white' }
    };
    return badges[tier] || badges.suitable;
  };

  const complexity = getComplexityIndicator(serviceDefinition?.complexity);
  const tierBadge = getTierBadge(service.tier);

  return (
    <div className={`
      border-2 rounded-lg transition-all duration-200 cursor-pointer
      ${isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
      ${getTierStyling(service.tier)}
      ${className}
    `}>
      {/* Header */}
      <div 
        className="p-6"
        onClick={() => onSelect?.(service)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4">
            {/* Service Icon */}
            <div className={`
              p-3 rounded-lg flex-shrink-0
              ${getCategoryColor(serviceDefinition?.category)}
            `}>
              <Icon size={24} />
            </div>
            
            {/* Service Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {serviceDefinition?.name || service.serviceId}
                </h3>
                <span className={`
                  px-2 py-1 text-xs font-medium rounded-full
                  ${tierBadge.color}
                `}>
                  {tierBadge.label}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">
                {service.purpose || serviceDefinition?.description}
              </p>
              
              {/* Quick Stats */}
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <DollarSign size={14} className="text-green-600" />
                  <span className="text-gray-700">
                    ${service.estimatedCost || serviceDefinition?.pricing?.estimatedMonthly?.typical || 0}/mo
                  </span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <div className="flex space-x-1">
                    {complexity.dots.map((filled, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          filled ? complexity.color : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600 text-xs ml-1">
                    {complexity.label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Selection Indicator */}
          {isSelected && (
            <CheckCircle className="text-green-500 flex-shrink-0" size={24} />
          )}
        </div>

        {/* Ranking Score */}
        {service.score && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Suitability Score</span>
              <span className="font-medium text-gray-900">
                {Math.round(service.score.overall * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${service.score.overall * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Key Benefits */}
        {serviceDefinition?.pros && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {serviceDefinition.pros.slice(0, 3).map((pro, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full"
                >
                  <CheckCircle size={12} className="mr-1" />
                  {pro}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Expand/Collapse Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
        >
          <span>{expanded ? 'Less Details' : 'More Details'}</span>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="p-6 space-y-6">
            {/* Detailed Characteristics */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Service Characteristics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {serviceDefinition?.scalability || 3}/5
                  </div>
                  <div className="text-xs text-gray-600">Scalability</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {serviceDefinition?.complexity ? (6 - serviceDefinition.complexity) : 3}/5
                  </div>
                  <div className="text-xs text-gray-600">Ease of Use</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {serviceDefinition?.pricing?.estimatedMonthly ? 
                      (serviceDefinition.pricing.estimatedMonthly.typical <= 20 ? 5 : 
                       serviceDefinition.pricing.estimatedMonthly.typical <= 50 ? 4 :
                       serviceDefinition.pricing.estimatedMonthly.typical <= 100 ? 3 : 2) : 3}/5
                  </div>
                  <div className="text-xs text-gray-600">Cost Efficiency</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 mb-1">
                    4/5
                  </div>
                  <div className="text-xs text-gray-600">Reliability</div>
                </div>
              </div>
            </div>

            {/* Pricing Details */}
            {serviceDefinition?.pricing && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Pricing Information</h4>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Pricing Model</div>
                      <div className="font-medium capitalize">
                        {serviceDefinition.pricing.model}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Free Tier</div>
                      <div className="font-medium">
                        {serviceDefinition.pricing.freeTier || 'Not available'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Estimated Range</div>
                      <div className="font-medium">
                        ${serviceDefinition.pricing.estimatedMonthly?.min || 0} - 
                        ${serviceDefinition.pricing.estimatedMonthly?.max || 100}/month
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Typical Cost</div>
                      <div className="font-medium text-green-600">
                        ${serviceDefinition.pricing.estimatedMonthly?.typical || 25}/month
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Use Cases */}
            {serviceDefinition?.useCases && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Common Use Cases</h4>
                <div className="flex flex-wrap gap-2">
                  {serviceDefinition.useCases.map((useCase, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                    >
                      {useCase}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Pros and Cons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {serviceDefinition?.pros && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <CheckCircle className="text-green-500 mr-2" size={16} />
                    Advantages
                  </h4>
                  <ul className="space-y-2">
                    {serviceDefinition.pros.map((pro, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {serviceDefinition?.cons && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <AlertTriangle className="text-orange-500 mr-2" size={16} />
                    Considerations
                  </h4>
                  <ul className="space-y-2">
                    {serviceDefinition.cons.map((con, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Configuration Options */}
            {service.configuration && (
              <div>
                <button
                  onClick={() => setConfigExpanded(!configExpanded)}
                  className="flex items-center space-x-2 text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                >
                  <span>Configuration Details</span>
                  {configExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                
                {configExpanded && (
                  <div className="mt-3 bg-white rounded-lg p-4 border border-gray-200">
                    <div className="space-y-3">
                      {Object.entries(service.configuration).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {typeof value === 'boolean' ? (value ? 'Enabled' : 'Disabled') : 
                             typeof value === 'object' ? JSON.stringify(value) : 
                             String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Ranking Breakdown */}
            {service.score?.breakdown && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Score Breakdown</h4>
                <div className="space-y-3">
                  {Object.entries(service.score.breakdown).map(([criterion, data]) => (
                    <div key={criterion}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600 capitalize">
                          {criterion}
                        </span>
                        <span className="text-sm font-medium">
                          {Math.round((data.score || 0) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{ width: `${(data.score || 0) * 100}%` }}
                        />
                      </div>
                      {data.reasons && data.reasons.length > 0 && (
                        <div className="mt-1">
                          <span className="text-xs text-gray-500">
                            {data.reasons[0]}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => onSelect?.(service)}
                className={`
                  flex-1 px-4 py-2 rounded-lg font-medium transition-colors
                  ${isSelected 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                  }
                `}
              >
                {isSelected ? 'Selected' : 'Select Service'}
              </button>
              
              {onConfigure && (
                <button
                  onClick={() => onConfigure(service)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Configure
                </button>
              )}
              
              <button
                onClick={() => window.open(`https://aws.amazon.com/${service.serviceId}/`, '_blank')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-1"
              >
                <ExternalLink size={16} />
                <span>AWS Docs</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceCard;