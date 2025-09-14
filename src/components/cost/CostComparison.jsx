// CostComparison.jsx - Compare costs across different architecture options
import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  CheckCircle, 
  AlertTriangle,
  Info,
  Star,
  Zap,
  Shield,
  Globe,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { architecturePatterns } from '../../data/architecturePatterns.js';
import { calculateArchitectureCosts, compareTrafficCosts } from '../../utils/costCalculator.js';
import { formatPrice } from '../../utils/regionalPricing.js';
import { trafficPatterns } from '../../data/awsPricing.js';

/**
 * Cost comparison component for different architecture options
 */
const CostComparison = ({ 
  baseConfiguration = {},
  onArchitectureSelect,
  showRecommendations = true 
}) => {
  const [comparisonResults, setComparisonResults] = useState({});
  const [selectedTrafficLevel, setSelectedTrafficLevel] = useState('medium');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [includeFreeTier, setIncludeFreeTier] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [sortBy, setSortBy] = useState('cost'); // 'cost', 'complexity', 'scalability'

  useEffect(() => {
    calculateAllArchitectures();
  }, [selectedTrafficLevel, selectedCurrency, includeFreeTier]);

  const calculateAllArchitectures = async () => {
    setIsCalculating(true);
    try {
      const results = {};
      
      for (const [patternId, pattern] of Object.entries(architecturePatterns)) {
        const costs = calculateArchitectureCosts(pattern, {
          trafficLevel: selectedTrafficLevel,
          currency: selectedCurrency,
          includeFreeTier: includeFreeTier,
          ...baseConfiguration
        });
        
        results[patternId] = {
          pattern,
          costs,
          score: calculateArchitectureScore(pattern, costs)
        };
      }
      
      setComparisonResults(results);
    } catch (error) {
      console.error('Failed to calculate architecture costs:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const calculateArchitectureScore = (pattern, costs) => {
    // Calculate a composite score based on cost, complexity, and scalability
    const costScore = Math.max(0, 100 - (costs.netMonthlyCost / 10)); // Lower cost = higher score
    const complexityScore = (6 - pattern.characteristics.complexity) * 20; // Lower complexity = higher score
    const scalabilityScore = pattern.characteristics.scalability * 20; // Higher scalability = higher score
    
    return Math.round((costScore + complexityScore + scalabilityScore) / 3);
  };

  const getSortedArchitectures = () => {
    const architectures = Object.entries(comparisonResults);
    
    return architectures.sort((a, b) => {
      const [, dataA] = a;
      const [, dataB] = b;
      
      switch (sortBy) {
        case 'cost':
          return dataA.costs.netMonthlyCost - dataB.costs.netMonthlyCost;
        case 'complexity':
          return dataA.pattern.characteristics.complexity - dataB.pattern.characteristics.complexity;
        case 'scalability':
          return dataB.pattern.characteristics.scalability - dataA.pattern.characteristics.scalability;
        case 'score':
          return dataB.score - dataA.score;
        default:
          return dataA.costs.netMonthlyCost - dataB.costs.netMonthlyCost;
      }
    });
  };

  const getRecommendation = () => {
    const architectures = getSortedArchitectures();
    if (architectures.length === 0) return null;

    const [bestId, bestData] = architectures[0];
    const trafficData = trafficPatterns[selectedTrafficLevel];
    
    let reason = '';
    if (trafficData.monthly.pageViews < 10000) {
      reason = 'For low traffic, this architecture offers the best cost efficiency';
    } else if (trafficData.monthly.pageViews > 1000000) {
      reason = 'For high traffic, this architecture provides the best scalability';
    } else {
      reason = 'This architecture offers the best balance of cost and performance';
    }

    return {
      architecture: bestData,
      id: bestId,
      reason
    };
  };

  const recommendation = getRecommendation();

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 size={20} className="text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Architecture Cost Comparison</h3>
          </div>
          {isCalculating && (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Configuration Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Traffic Level
            </label>
            <select
              value={selectedTrafficLevel}
              onChange={(e) => setSelectedTrafficLevel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.entries(trafficPatterns).map(([id, pattern]) => (
                <option key={id} value={id}>
                  {pattern.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="cost">Lowest Cost</option>
              <option value="complexity">Lowest Complexity</option>
              <option value="scalability">Highest Scalability</option>
              <option value="score">Best Overall Score</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={includeFreeTier}
                onChange={(e) => setIncludeFreeTier(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Include Free Tier</span>
            </label>
          </div>
        </div>

        {/* Recommendation */}
        {showRecommendations && recommendation && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Star className="text-green-600 mt-0.5" size={20} />
              <div className="flex-1">
                <h4 className="font-medium text-green-900 mb-1">
                  Recommended: {recommendation.architecture.pattern.name}
                </h4>
                <p className="text-sm text-green-800 mb-2">{recommendation.reason}</p>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="font-medium text-green-600">
                    {formatPrice(recommendation.architecture.costs.netMonthlyCost, selectedCurrency)}/month
                  </span>
                  <span className="text-green-700">
                    Score: {recommendation.architecture.score}/100
                  </span>
                </div>
              </div>
              <button
                onClick={() => onArchitectureSelect?.(recommendation.id, recommendation.architecture)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium transition-colors"
              >
                Select
              </button>
            </div>
          </div>
        )}

        {/* Architecture Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {getSortedArchitectures().map(([patternId, data], index) => (
            <ArchitectureComparisonCard
              key={patternId}
              patternId={patternId}
              data={data}
              currency={selectedCurrency}
              isRecommended={recommendation?.id === patternId}
              rank={index + 1}
              onSelect={() => onArchitectureSelect?.(patternId, data)}
            />
          ))}
        </div>

        {/* Detailed Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-4 py-3 text-left font-medium text-gray-900">
                  Architecture
                </th>
                <th className="border border-gray-200 px-4 py-3 text-center font-medium text-gray-900">
                  Monthly Cost
                </th>
                <th className="border border-gray-200 px-4 py-3 text-center font-medium text-gray-900">
                  Complexity
                </th>
                <th className="border border-gray-200 px-4 py-3 text-center font-medium text-gray-900">
                  Scalability
                </th>
                <th className="border border-gray-200 px-4 py-3 text-center font-medium text-gray-900">
                  Services
                </th>
                <th className="border border-gray-200 px-4 py-3 text-center font-medium text-gray-900">
                  Score
                </th>
              </tr>
            </thead>
            <tbody>
              {getSortedArchitectures().map(([patternId, data], index) => (
                <tr key={patternId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-200 px-4 py-3">
                    <div className="flex items-center space-x-2">
                      {recommendation?.id === patternId && (
                        <Star className="text-yellow-500" size={16} />
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{data.pattern.name}</div>
                        <div className="text-sm text-gray-600">{data.pattern.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="border border-gray-200 px-4 py-3 text-center">
                    <div className="font-medium">
                      {formatPrice(data.costs.netMonthlyCost, selectedCurrency)}
                    </div>
                    {data.costs.freeTierSavings > 0 && includeFreeTier && (
                      <div className="text-xs text-green-600">
                        -{formatPrice(data.costs.freeTierSavings, selectedCurrency)} saved
                      </div>
                    )}
                  </td>
                  <td className="border border-gray-200 px-4 py-3 text-center">
                    <ComplexityIndicator level={data.pattern.characteristics.complexity} />
                  </td>
                  <td className="border border-gray-200 px-4 py-3 text-center">
                    <ScalabilityIndicator level={data.pattern.characteristics.scalability} />
                  </td>
                  <td className="border border-gray-200 px-4 py-3 text-center">
                    <span className="text-sm text-gray-600">
                      {data.pattern.services.length} services
                    </span>
                  </td>
                  <td className="border border-gray-200 px-4 py-3 text-center">
                    <div className={`inline-flex items-center px-2 py-1 rounded text-sm font-medium ${
                      data.score >= 80 ? 'bg-green-100 text-green-800' :
                      data.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {data.score}/100
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Traffic Level Impact */}
        <TrafficLevelComparison 
          architectures={comparisonResults}
          currency={selectedCurrency}
          includeFreeTier={includeFreeTier}
        />
      </div>
    </div>
  );
};

/**
 * Individual architecture comparison card
 */
const ArchitectureComparisonCard = ({ 
  patternId, 
  data, 
  currency, 
  isRecommended, 
  rank, 
  onSelect 
}) => {
  const { pattern, costs, score } = data;

  return (
    <div className={`border rounded-lg p-4 transition-all hover:shadow-md ${
      isRecommended ? 'border-green-500 bg-green-50' : 'border-gray-200'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            rank === 1 ? 'bg-yellow-500 text-white' :
            rank === 2 ? 'bg-gray-400 text-white' :
            rank === 3 ? 'bg-orange-500 text-white' :
            'bg-gray-200 text-gray-600'
          }`}>
            {rank}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{pattern.name}</h4>
            <p className="text-sm text-gray-600 mt-1">{pattern.description}</p>
          </div>
        </div>
        {isRecommended && (
          <Star className="text-yellow-500" size={20} />
        )}
      </div>

      <div className="space-y-3">
        {/* Cost */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Monthly Cost</span>
          <div className="text-right">
            <div className="font-bold text-lg">
              {formatPrice(costs.netMonthlyCost, currency)}
            </div>
            {costs.freeTierSavings > 0 && (
              <div className="text-xs text-green-600">
                -{formatPrice(costs.freeTierSavings, currency)} saved
              </div>
            )}
          </div>
        </div>

        {/* Characteristics */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-600">Complexity</div>
            <ComplexityIndicator level={pattern.characteristics.complexity} />
          </div>
          <div>
            <div className="text-gray-600">Scalability</div>
            <ScalabilityIndicator level={pattern.characteristics.scalability} />
          </div>
        </div>

        {/* Services */}
        <div>
          <div className="text-sm text-gray-600 mb-2">Services ({pattern.services.length})</div>
          <div className="flex flex-wrap gap-1">
            {pattern.services.slice(0, 4).map((service, index) => (
              <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {service.serviceId.toUpperCase()}
              </span>
            ))}
            {pattern.services.length > 4 && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                +{pattern.services.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Score and Action */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <div className={`px-2 py-1 rounded text-sm font-medium ${
            score >= 80 ? 'bg-green-100 text-green-800' :
            score >= 60 ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            Score: {score}/100
          </div>
          <button
            onClick={onSelect}
            className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
          >
            <span>Select</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Complexity indicator component
 */
const ComplexityIndicator = ({ level }) => {
  const getColor = () => {
    if (level <= 2) return 'text-green-600';
    if (level <= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getLabel = () => {
    if (level <= 2) return 'Low';
    if (level <= 3) return 'Medium';
    return 'High';
  };

  return (
    <div className={`text-sm font-medium ${getColor()}`}>
      {getLabel()} ({level}/5)
    </div>
  );
};

/**
 * Scalability indicator component
 */
const ScalabilityIndicator = ({ level }) => {
  const getColor = () => {
    if (level >= 4) return 'text-green-600';
    if (level >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getLabel = () => {
    if (level >= 4) return 'High';
    if (level >= 3) return 'Medium';
    return 'Low';
  };

  return (
    <div className={`text-sm font-medium ${getColor()}`}>
      {getLabel()} ({level}/5)
    </div>
  );
};

/**
 * Traffic level comparison component
 */
const TrafficLevelComparison = ({ architectures, currency, includeFreeTier }) => {
  const [selectedArchitecture, setSelectedArchitecture] = useState(null);

  useEffect(() => {
    // Auto-select first architecture for comparison
    const firstArch = Object.keys(architectures)[0];
    if (firstArch && !selectedArchitecture) {
      setSelectedArchitecture(firstArch);
    }
  }, [architectures, selectedArchitecture]);

  if (!selectedArchitecture || !architectures[selectedArchitecture]) {
    return null;
  }

  const pattern = architectures[selectedArchitecture].pattern;
  const trafficComparison = compareTrafficCosts(pattern, {
    currency: currency,
    includeFreeTier: includeFreeTier
  });

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h5 className="font-medium text-gray-900">Cost by Traffic Level</h5>
        <select
          value={selectedArchitecture}
          onChange={(e) => setSelectedArchitecture(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {Object.entries(architectures).map(([id, data]) => (
            <option key={id} value={id}>
              {data.pattern.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(trafficComparison).map(([level, costs]) => (
          <div key={level} className="bg-white border border-gray-200 rounded p-3 text-center">
            <div className="text-sm text-gray-600 capitalize mb-1">{level}</div>
            <div className="font-bold text-gray-900">
              {formatPrice(costs.netMonthlyCost, currency)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {costs.usage.monthly.pageViews.toLocaleString()} views
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CostComparison;