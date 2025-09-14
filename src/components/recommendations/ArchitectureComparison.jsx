import React, { useState } from 'react';
import { 
  ArrowRight, 
  DollarSign, 
  Zap, 
  TrendingUp, 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Minus,
  BarChart3,
  Filter,
  RotateCcw
} from 'lucide-react';

/**
 * ArchitectureComparison - Side-by-side comparison of architecture options
 * Allows users to compare multiple architectures across different criteria
 */
const ArchitectureComparison = ({ 
  architectures = [], 
  onSelect, 
  selectedArchitecture,
  className = '' 
}) => {
  const [comparisonCriteria, setComparisonCriteria] = useState([
    'cost', 'complexity', 'scalability', 'security', 'deployment'
  ]);
  const [showAllCriteria, setShowAllCriteria] = useState(false);

  // Limit to 3 architectures for comparison
  const compareArchitectures = architectures.slice(0, 3);

  // Get comparison value for a criterion
  const getComparisonValue = (architecture, criterion) => {
    const { characteristics, costEstimate, pattern } = architecture;
    
    switch (criterion) {
      case 'cost':
        return {
          value: costEstimate?.monthly || 0,
          display: `$${costEstimate?.monthly || 0}/mo`,
          numeric: costEstimate?.monthly || 0,
          lower_is_better: true
        };
      case 'complexity':
        return {
          value: characteristics?.complexity || 3,
          display: `${characteristics?.complexity || 3}/5`,
          numeric: characteristics?.complexity || 3,
          lower_is_better: true
        };
      case 'scalability':
        return {
          value: characteristics?.scalability || 3,
          display: `${characteristics?.scalability || 3}/5`,
          numeric: characteristics?.scalability || 3,
          lower_is_better: false
        };
      case 'security':
        return {
          value: characteristics?.security || 4,
          display: `${characteristics?.security || 4}/5`,
          numeric: characteristics?.security || 4,
          lower_is_better: false
        };
      case 'availability':
        return {
          value: characteristics?.availability || 4,
          display: `${characteristics?.availability || 4}/5`,
          numeric: characteristics?.availability || 4,
          lower_is_better: false
        };
      case 'deployment':
        return {
          value: pattern?.deployment?.timeEstimate || 'Unknown',
          display: pattern?.deployment?.timeEstimate || 'Unknown',
          numeric: this.parseTimeEstimate(pattern?.deployment?.timeEstimate),
          lower_is_better: true
        };
      default:
        return { value: 'N/A', display: 'N/A', numeric: 0 };
    }
  };

  // Parse time estimate to minutes for comparison
  const parseTimeEstimate = (timeStr) => {
    if (!timeStr) return 60; // Default 1 hour
    
    const match = timeStr.match(/(\d+)(?:-(\d+))?\s*(min|hour|hr)/i);
    if (!match) return 60;
    
    const [, min, max, unit] = match;
    const avgTime = max ? (parseInt(min) + parseInt(max)) / 2 : parseInt(min);
    
    return unit.toLowerCase().startsWith('hour') || unit.toLowerCase() === 'hr' 
      ? avgTime * 60 
      : avgTime;
  };

  // Get winner for a criterion
  const getWinner = (criterion) => {
    if (compareArchitectures.length < 2) return null;
    
    const values = compareArchitectures.map((arch, index) => ({
      index,
      ...getComparisonValue(arch, criterion)
    }));
    
    const validValues = values.filter(v => typeof v.numeric === 'number' && !isNaN(v.numeric));
    if (validValues.length === 0) return null;
    
    const sortedValues = validValues.sort((a, b) => 
      validValues[0].lower_is_better ? a.numeric - b.numeric : b.numeric - a.numeric
    );
    
    return sortedValues[0].index;
  };

  // Get comparison icon
  const getComparisonIcon = (criterion) => {
    const icons = {
      cost: DollarSign,
      complexity: Zap,
      scalability: TrendingUp,
      security: Shield,
      availability: Shield,
      deployment: Clock
    };
    return icons[criterion] || BarChart3;
  };

  // Get criterion color
  const getCriterionColor = (criterion) => {
    const colors = {
      cost: 'text-green-600',
      complexity: 'text-orange-600',
      scalability: 'text-blue-600',
      security: 'text-red-600',
      availability: 'text-purple-600',
      deployment: 'text-yellow-600'
    };
    return colors[criterion] || 'text-gray-600';
  };

  // Calculate overall winner
  const getOverallWinner = () => {
    const scores = compareArchitectures.map(() => 0);
    
    comparisonCriteria.forEach(criterion => {
      const winner = getWinner(criterion);
      if (winner !== null) {
        scores[winner]++;
      }
    });
    
    const maxScore = Math.max(...scores);
    return scores.indexOf(maxScore);
  };

  const overallWinner = getOverallWinner();

  if (compareArchitectures.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <BarChart3 className="mx-auto text-gray-400 mb-4" size={48} />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Architectures to Compare</h3>
        <p className="text-gray-600">Select multiple architecture options to see a comparison.</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Architecture Comparison
            </h3>
            <p className="text-gray-600">
              Compare {compareArchitectures.length} architecture options side by side
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAllCriteria(!showAllCriteria)}
              className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter size={16} />
              <span>{showAllCriteria ? 'Show Less' : 'Show All'}</span>
            </button>
            
            <button
              onClick={() => setComparisonCriteria(['cost', 'complexity', 'scalability', 'security', 'deployment'])}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <RotateCcw size={16} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Architecture Headers */}
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left p-4 w-48">
                <div className="text-sm font-medium text-gray-600">Criteria</div>
              </th>
              {compareArchitectures.map((architecture, index) => (
                <th key={index} className="text-center p-4 min-w-64">
                  <div className={`
                    p-4 rounded-lg border-2 transition-all
                    ${selectedArchitecture?.id === architecture.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 bg-gray-50'
                    }
                    ${index === overallWinner ? 'ring-2 ring-green-500 ring-opacity-50' : ''}
                  `}>
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <h4 className="font-semibold text-gray-900 text-center">
                        {architecture.name}
                      </h4>
                      {index === overallWinner && (
                        <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          Best Overall
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {architecture.description}
                    </p>
                    
                    <div className="flex items-center justify-center space-x-4 text-sm">
                      <div className="text-center">
                        <div className="font-medium text-green-600">
                          ${architecture.costEstimate?.monthly || 0}
                        </div>
                        <div className="text-gray-500">per month</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="font-medium text-blue-600">
                          {Math.round((architecture.confidence || 0.8) * 100)}%
                        </div>
                        <div className="text-gray-500">confidence</div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => onSelect?.(architecture)}
                      className={`
                        w-full mt-3 px-4 py-2 rounded-lg font-medium transition-colors
                        ${selectedArchitecture?.id === architecture.id
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                        }
                      `}
                    >
                      {selectedArchitecture?.id === architecture.id ? 'Selected' : 'Select'}
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Comparison Rows */}
          <tbody>
            {comparisonCriteria.slice(0, showAllCriteria ? undefined : 5).map((criterion) => {
              const Icon = getComparisonIcon(criterion);
              const winner = getWinner(criterion);
              
              return (
                <tr key={criterion} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <Icon className={getCriterionColor(criterion)} size={20} />
                      <div>
                        <div className="font-medium text-gray-900 capitalize">
                          {criterion}
                        </div>
                        <div className="text-sm text-gray-500">
                          {criterion === 'cost' && 'Monthly operational cost'}
                          {criterion === 'complexity' && 'Setup and management difficulty'}
                          {criterion === 'scalability' && 'Ability to handle growth'}
                          {criterion === 'security' && 'Built-in security features'}
                          {criterion === 'availability' && 'Uptime and reliability'}
                          {criterion === 'deployment' && 'Time to deploy'}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  {compareArchitectures.map((architecture, index) => {
                    const value = getComparisonValue(architecture, criterion);
                    const isWinner = winner === index;
                    
                    return (
                      <td key={index} className="p-4 text-center">
                        <div className={`
                          inline-flex items-center justify-center px-3 py-2 rounded-lg font-medium
                          ${isWinner 
                            ? 'bg-green-100 text-green-800 ring-2 ring-green-500 ring-opacity-50' 
                            : 'bg-gray-100 text-gray-700'
                          }
                        `}>
                          {isWinner && <CheckCircle size={16} className="mr-2" />}
                          {value.display}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Services Comparison */}
      <div className="border-t border-gray-200 p-6">
        <h4 className="font-medium text-gray-900 mb-4">Services Included</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {compareArchitectures.map((architecture, index) => (
            <div key={index} className="space-y-3">
              <h5 className="font-medium text-gray-800">{architecture.name}</h5>
              <div className="space-y-2">
                {architecture.services?.slice(0, 5).map((service, serviceIndex) => (
                  <div key={serviceIndex} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">
                      {service.serviceDefinition?.name || service.serviceId}
                    </span>
                    <span className="text-gray-500">
                      ${service.estimatedCost || 0}/mo
                    </span>
                  </div>
                ))}
                {architecture.services?.length > 5 && (
                  <div className="text-sm text-gray-500">
                    +{architecture.services.length - 5} more services
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pros and Cons Comparison */}
      <div className="border-t border-gray-200 p-6">
        <h4 className="font-medium text-gray-900 mb-4">Pros & Cons</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {compareArchitectures.map((architecture, index) => (
            <div key={index} className="space-y-4">
              <h5 className="font-medium text-gray-800">{architecture.name}</h5>
              
              {/* Pros */}
              {architecture.pros && architecture.pros.length > 0 && (
                <div>
                  <h6 className="text-sm font-medium text-green-800 mb-2 flex items-center">
                    <CheckCircle size={14} className="mr-1" />
                    Advantages
                  </h6>
                  <ul className="space-y-1">
                    {architecture.pros.slice(0, 3).map((pro, proIndex) => (
                      <li key={proIndex} className="text-sm text-gray-700 flex items-start">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Cons */}
              {architecture.cons && architecture.cons.length > 0 && (
                <div>
                  <h6 className="text-sm font-medium text-orange-800 mb-2 flex items-center">
                    <Minus size={14} className="mr-1" />
                    Considerations
                  </h6>
                  <ul className="space-y-1">
                    {architecture.cons.slice(0, 3).map((con, conIndex) => (
                      <li key={conIndex} className="text-sm text-gray-700 flex items-start">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Summary and Recommendation */}
      <div className="border-t border-gray-200 bg-gray-50 p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="text-blue-600" size={24} />
          </div>
          
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 mb-2">Comparison Summary</h4>
            <p className="text-gray-700 mb-3">
              Based on the comparison across {comparisonCriteria.length} criteria, 
              <strong className="text-gray-900"> {compareArchitectures[overallWinner]?.name}</strong> appears 
              to be the best overall match for your requirements.
            </p>
            
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Best choice</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">Currently selected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchitectureComparison;