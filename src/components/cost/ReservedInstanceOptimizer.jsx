// ReservedInstanceOptimizer.jsx - Reserved Instance and Spot Instance recommendations
import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Clock, 
  DollarSign, 
  TrendingDown, 
  Calculator,
  AlertCircle,
  CheckCircle,
  Info,
  Zap,
  Target,
  Calendar,
  CreditCard,
  BarChart3
} from 'lucide-react';
import { formatPrice } from '../../utils/regionalPricing.js';

/**
 * Reserved Instance and Spot Instance optimization component
 */
const ReservedInstanceOptimizer = ({ 
  architecturePattern, 
  costResults, 
  usagePatterns,
  currency = 'USD',
  onRecommendationSelect 
}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [selectedRecommendations, setSelectedRecommendations] = useState(new Set());
  const [analysisResults, setAnalysisResults] = useState(null);
  const [viewMode, setViewMode] = useState('recommendations'); // 'recommendations' | 'calculator' | 'analysis'

  useEffect(() => {
    if (costResults && architecturePattern) {
      analyzeReservedInstanceOpportunities();
    }
  }, [costResults, architecturePattern, usagePatterns]);

  const analyzeReservedInstanceOpportunities = () => {
    const riRecommendations = [];
    const spotRecommendations = [];
    
    // Analyze each service for RI/Spot opportunities
    costResults.serviceCosts.forEach(service => {
      if (service.serviceId === 'ec2') {
        riRecommendations.push(...analyzeEC2ReservedInstances(service));
        spotRecommendations.push(...analyzeEC2SpotInstances(service));
      } else if (service.serviceId === 'rds') {
        riRecommendations.push(...analyzeRDSReservedInstances(service));
      } else if (service.serviceId === 'elasticache') {
        riRecommendations.push(...analyzeElastiCacheReservedInstances(service));
      }
    });

    const allRecommendations = [...riRecommendations, ...spotRecommendations];
    setRecommendations(allRecommendations);
    
    // Calculate analysis summary
    const analysis = calculateAnalysisSummary(allRecommendations);
    setAnalysisResults(analysis);
  };

  const analyzeEC2ReservedInstances = (service) => {
    const recommendations = [];
    const monthlyCost = service.monthlyCost;
    const instanceType = service.breakdown?.instanceType || 't3.small';
    const instanceCount = service.breakdown?.instanceCount || 1;
    
    // Only recommend RIs if monthly cost is significant
    if (monthlyCost < 50) {
      return recommendations;
    }

    // Calculate RI savings for different terms and payment options
    const riOptions = [
      {
        term: '1-year',
        paymentOption: 'no-upfront',
        discount: 0.31,
        upfrontCost: 0,
        description: '1 Year, No Upfront Payment'
      },
      {
        term: '1-year',
        paymentOption: 'partial-upfront',
        discount: 0.35,
        upfrontCost: monthlyCost * 6,
        description: '1 Year, Partial Upfront Payment'
      },
      {
        term: '1-year',
        paymentOption: 'all-upfront',
        discount: 0.40,
        upfrontCost: monthlyCost * 12 * 0.6,
        description: '1 Year, All Upfront Payment'
      },
      {
        term: '3-year',
        paymentOption: 'no-upfront',
        discount: 0.49,
        upfrontCost: 0,
        description: '3 Year, No Upfront Payment'
      },
      {
        term: '3-year',
        paymentOption: 'partial-upfront',
        discount: 0.56,
        upfrontCost: monthlyCost * 18,
        description: '3 Year, Partial Upfront Payment'
      },
      {
        term: '3-year',
        paymentOption: 'all-upfront',
        discount: 0.62,
        upfrontCost: monthlyCost * 36 * 0.38,
        description: '3 Year, All Upfront Payment'
      }
    ];

    riOptions.forEach(option => {
      const monthlySavings = monthlyCost * option.discount;
      const annualSavings = monthlySavings * 12;
      const termSavings = annualSavings * (option.term === '1-year' ? 1 : 3);
      const roi = option.upfrontCost > 0 ? (termSavings / option.upfrontCost) * 100 : Infinity;

      recommendations.push({
        id: `ec2-ri-${option.term}-${option.paymentOption}`,
        type: 'reserved-instance',
        service: 'EC2',
        instanceType: instanceType,
        instanceCount: instanceCount,
        term: option.term,
        paymentOption: option.paymentOption,
        description: option.description,
        currentMonthlyCost: monthlyCost,
        riMonthlyCost: monthlyCost - monthlySavings,
        monthlySavings: monthlySavings,
        annualSavings: annualSavings,
        termSavings: termSavings,
        upfrontCost: option.upfrontCost,
        discount: option.discount,
        roi: roi,
        paybackPeriod: option.upfrontCost > 0 ? option.upfrontCost / monthlySavings : 0,
        riskLevel: option.term === '1-year' ? 'low' : 'medium',
        suitability: calculateSuitability(usagePatterns, option),
        requirements: [
          'Consistent workload for commitment period',
          'Predictable usage patterns',
          option.upfrontCost > 0 ? 'Available upfront capital' : 'No upfront payment required'
        ]
      });
    });

    return recommendations;
  };

  const analyzeEC2SpotInstances = (service) => {
    const recommendations = [];
    const monthlyCost = service.monthlyCost;
    const instanceType = service.breakdown?.instanceType || 't3.small';
    
    // Spot instances are suitable for fault-tolerant workloads
    if (usagePatterns?.faultTolerant !== false) {
      const spotDiscount = 0.70; // Up to 70% savings
      const monthlySavings = monthlyCost * spotDiscount;
      
      recommendations.push({
        id: `ec2-spot-${instanceType}`,
        type: 'spot-instance',
        service: 'EC2',
        instanceType: instanceType,
        description: 'Spot Instances for fault-tolerant workloads',
        currentMonthlyCost: monthlyCost,
        spotMonthlyCost: monthlyCost - monthlySavings,
        monthlySavings: monthlySavings,
        annualSavings: monthlySavings * 12,
        discount: spotDiscount,
        upfrontCost: 0,
        riskLevel: 'high',
        suitability: calculateSpotSuitability(usagePatterns),
        requirements: [
          'Fault-tolerant application design',
          'Flexible start/stop times',
          'Stateless or externally stored state',
          'Interruption handling capability'
        ],
        considerations: [
          'Instances can be interrupted with 2-minute notice',
          'Pricing varies based on supply and demand',
          'Best for batch processing, CI/CD, testing',
          'Not suitable for production databases'
        ]
      });
    }

    return recommendations;
  };

  const analyzeRDSReservedInstances = (service) => {
    const recommendations = [];
    const monthlyCost = service.monthlyCost;
    const instanceType = service.breakdown?.instanceType || 'db.t3.micro';
    
    if (monthlyCost < 30) {
      return recommendations;
    }

    const riOptions = [
      {
        term: '1-year',
        paymentOption: 'no-upfront',
        discount: 0.28,
        upfrontCost: 0,
        description: '1 Year RDS Reserved Instance, No Upfront'
      },
      {
        term: '3-year',
        paymentOption: 'partial-upfront',
        discount: 0.45,
        upfrontCost: monthlyCost * 18,
        description: '3 Year RDS Reserved Instance, Partial Upfront'
      }
    ];

    riOptions.forEach(option => {
      const monthlySavings = monthlyCost * option.discount;
      const annualSavings = monthlySavings * 12;
      
      recommendations.push({
        id: `rds-ri-${option.term}-${option.paymentOption}`,
        type: 'reserved-instance',
        service: 'RDS',
        instanceType: instanceType,
        term: option.term,
        paymentOption: option.paymentOption,
        description: option.description,
        currentMonthlyCost: monthlyCost,
        riMonthlyCost: monthlyCost - monthlySavings,
        monthlySavings: monthlySavings,
        annualSavings: annualSavings,
        upfrontCost: option.upfrontCost,
        discount: option.discount,
        riskLevel: 'low',
        suitability: 'high',
        requirements: [
          'Consistent database usage',
          'Long-term application commitment'
        ]
      });
    });

    return recommendations;
  };

  const analyzeElastiCacheReservedInstances = (service) => {
    // Similar to RDS but for ElastiCache
    return [];
  };

  const calculateSuitability = (patterns, option) => {
    let score = 0;
    
    // Consistent usage patterns favor RIs
    if (patterns?.consistent === true) score += 30;
    if (patterns?.predictable === true) score += 25;
    
    // Longer terms require more stability
    if (option.term === '3-year') {
      if (patterns?.longTerm === true) score += 20;
      else score -= 10;
    }
    
    // Upfront payment considerations
    if (option.upfrontCost > 0) {
      if (patterns?.hasCapital === true) score += 15;
      else score -= 20;
    }
    
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  };

  const calculateSpotSuitability = (patterns) => {
    let score = 0;
    
    if (patterns?.faultTolerant === true) score += 40;
    if (patterns?.batchProcessing === true) score += 30;
    if (patterns?.flexible === true) score += 20;
    if (patterns?.stateless === true) score += 10;
    
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  };

  const calculateAnalysisSummary = (recommendations) => {
    const totalCurrentCost = recommendations.reduce((sum, rec) => sum + rec.currentMonthlyCost, 0);
    const totalPotentialSavings = recommendations.reduce((sum, rec) => sum + rec.monthlySavings, 0);
    const totalUpfrontCost = recommendations.reduce((sum, rec) => sum + (rec.upfrontCost || 0), 0);
    
    const riRecommendations = recommendations.filter(rec => rec.type === 'reserved-instance');
    const spotRecommendations = recommendations.filter(rec => rec.type === 'spot-instance');
    
    const bestRiOption = riRecommendations.reduce((best, rec) => 
      rec.roi > (best?.roi || 0) ? rec : best, null);
    
    return {
      totalCurrentCost,
      totalPotentialSavings,
      totalUpfrontCost,
      savingsPercentage: (totalPotentialSavings / totalCurrentCost) * 100,
      riCount: riRecommendations.length,
      spotCount: spotRecommendations.length,
      bestRiOption,
      recommendationScore: calculateRecommendationScore(recommendations)
    };
  };

  const calculateRecommendationScore = (recommendations) => {
    // Calculate overall recommendation confidence
    const avgSuitability = recommendations.reduce((sum, rec) => {
      const suitabilityScore = rec.suitability === 'high' ? 3 : rec.suitability === 'medium' ? 2 : 1;
      return sum + suitabilityScore;
    }, 0) / recommendations.length;
    
    return Math.min(100, avgSuitability * 33.33);
  };

  const toggleRecommendation = (recommendationId) => {
    setSelectedRecommendations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(recommendationId)) {
        newSet.delete(recommendationId);
      } else {
        newSet.add(recommendationId);
      }
      return newSet;
    });
  };

  const calculateSelectedSavings = () => {
    return recommendations
      .filter(rec => selectedRecommendations.has(rec.id))
      .reduce((sum, rec) => sum + rec.monthlySavings, 0);
  };

  const getRiskColor = (risk) => {
    const colors = {
      low: 'text-green-600 bg-green-100',
      medium: 'text-yellow-600 bg-yellow-100',
      high: 'text-red-600 bg-red-100'
    };
    return colors[risk] || colors.medium;
  };

  const getSuitabilityColor = (suitability) => {
    const colors = {
      high: 'text-green-600',
      medium: 'text-yellow-600',
      low: 'text-red-600'
    };
    return colors[suitability] || colors.medium;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield size={20} className="text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Reserved Instance Optimizer</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('recommendations')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'recommendations' 
                  ? 'bg-green-100 text-green-800' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Recommendations
            </button>
            <button
              onClick={() => setViewMode('calculator')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'calculator' 
                  ? 'bg-green-100 text-green-800' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Calculator
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Analysis Summary */}
        {analysisResults && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-lg font-bold text-blue-600">
                {formatPrice(analysisResults.totalCurrentCost, currency)}
              </div>
              <div className="text-sm text-blue-800">Current Monthly Cost</div>
            </div>
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-lg font-bold text-green-600">
                {formatPrice(analysisResults.totalPotentialSavings, currency)}
              </div>
              <div className="text-sm text-green-800">Potential Monthly Savings</div>
            </div>
            <div className="text-center p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="text-lg font-bold text-purple-600">
                {analysisResults.savingsPercentage.toFixed(0)}%
              </div>
              <div className="text-sm text-purple-800">Savings Percentage</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-lg font-bold text-yellow-600">
                {recommendations.length}
              </div>
              <div className="text-sm text-yellow-800">Recommendations</div>
            </div>
          </div>
        )}

        {viewMode === 'recommendations' && (
          <>
            {/* Recommendations List */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Optimization Recommendations</h4>
              
              {recommendations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Shield size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No Reserved Instance opportunities found</p>
                  <p className="text-sm mt-1">Your current usage may not benefit from Reserved Instances</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendations.map((recommendation) => (
                    <RecommendationCard
                      key={recommendation.id}
                      recommendation={recommendation}
                      currency={currency}
                      isSelected={selectedRecommendations.has(recommendation.id)}
                      onToggle={() => toggleRecommendation(recommendation.id)}
                      getRiskColor={getRiskColor}
                      getSuitabilityColor={getSuitabilityColor}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Selected Recommendations Summary */}
            {selectedRecommendations.size > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h5 className="font-medium text-green-900 mb-3">Selected Recommendations</h5>
                <div className="flex items-center justify-between">
                  <div className="text-green-900">
                    <span className="font-medium">Total Monthly Savings: </span>
                    <span className="text-lg font-bold">
                      {formatPrice(calculateSelectedSavings(), currency)}
                    </span>
                  </div>
                  <button
                    onClick={() => onRecommendationSelect?.(Array.from(selectedRecommendations))}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium transition-colors"
                  >
                    Apply Selected ({selectedRecommendations.size})
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {viewMode === 'calculator' && (
          <ReservedInstanceCalculator 
            currency={currency}
            onCalculationComplete={(result) => console.log('RI Calculation:', result)}
          />
        )}
      </div>
    </div>
  );
};

/**
 * Individual recommendation card
 */
const RecommendationCard = ({ 
  recommendation, 
  currency, 
  isSelected, 
  onToggle, 
  getRiskColor, 
  getSuitabilityColor 
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`border rounded-lg p-4 transition-all ${
      isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggle}
            className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
          />
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              {recommendation.type === 'reserved-instance' ? (
                <Shield size={16} className="text-green-600" />
              ) : (
                <Zap size={16} className="text-purple-600" />
              )}
              <h5 className="font-medium text-gray-900">{recommendation.description}</h5>
              <div className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(recommendation.riskLevel)}`}>
                {recommendation.riskLevel} risk
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
              <div>
                <div className="text-gray-600">Monthly Savings</div>
                <div className="font-medium text-green-600">
                  {formatPrice(recommendation.monthlySavings, currency)}
                </div>
              </div>
              <div>
                <div className="text-gray-600">Annual Savings</div>
                <div className="font-medium text-green-600">
                  {formatPrice(recommendation.annualSavings, currency)}
                </div>
              </div>
              <div>
                <div className="text-gray-600">Upfront Cost</div>
                <div className="font-medium">
                  {recommendation.upfrontCost > 0 
                    ? formatPrice(recommendation.upfrontCost, currency)
                    : 'None'
                  }
                </div>
              </div>
              <div>
                <div className="text-gray-600">Suitability</div>
                <div className={`font-medium capitalize ${getSuitabilityColor(recommendation.suitability)}`}>
                  {recommendation.suitability}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {recommendation.discount && (
                  <span className="font-medium text-green-600">
                    {(recommendation.discount * 100).toFixed(0)}% discount
                  </span>
                )}
                {recommendation.paybackPeriod > 0 && (
                  <span className="ml-2">
                    • {recommendation.paybackPeriod.toFixed(1)} month payback
                  </span>
                )}
              </div>
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                {expanded ? 'Less details' : 'More details'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
          {/* Requirements */}
          <div>
            <h6 className="font-medium text-gray-900 mb-2">Requirements:</h6>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              {recommendation.requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>

          {/* Considerations for Spot Instances */}
          {recommendation.considerations && (
            <div>
              <h6 className="font-medium text-gray-900 mb-2">Considerations:</h6>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                {recommendation.considerations.map((consideration, index) => (
                  <li key={index}>{consideration}</li>
                ))}
              </ul>
            </div>
          )}

          {/* ROI Information */}
          {recommendation.roi && recommendation.roi !== Infinity && (
            <div className="bg-blue-50 border border-blue-200 rounded p-2">
              <div className="flex items-center space-x-2 text-blue-800">
                <Target size={14} />
                <span className="text-sm font-medium">
                  ROI: {recommendation.roi.toFixed(0)}% over {recommendation.term}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Reserved Instance Calculator component
 */
const ReservedInstanceCalculator = ({ currency, onCalculationComplete }) => {
  const [config, setConfig] = useState({
    instanceType: 't3.small',
    instanceCount: 1,
    currentHourlyRate: 0.0208,
    utilizationHours: 730,
    term: '1-year',
    paymentOption: 'no-upfront'
  });

  const [results, setResults] = useState(null);

  useEffect(() => {
    calculateSavings();
  }, [config]);

  const calculateSavings = () => {
    const monthlyOnDemandCost = config.currentHourlyRate * config.utilizationHours * config.instanceCount;
    
    // RI discount rates (simplified)
    const discountRates = {
      '1-year': {
        'no-upfront': 0.31,
        'partial-upfront': 0.35,
        'all-upfront': 0.40
      },
      '3-year': {
        'no-upfront': 0.49,
        'partial-upfront': 0.56,
        'all-upfront': 0.62
      }
    };

    const discount = discountRates[config.term][config.paymentOption];
    const riMonthlyCost = monthlyOnDemandCost * (1 - discount);
    const monthlySavings = monthlyOnDemandCost - riMonthlyCost;
    
    const termMonths = config.term === '1-year' ? 12 : 36;
    const totalSavings = monthlySavings * termMonths;
    
    let upfrontCost = 0;
    if (config.paymentOption === 'all-upfront') {
      upfrontCost = riMonthlyCost * termMonths;
    } else if (config.paymentOption === 'partial-upfront') {
      upfrontCost = riMonthlyCost * termMonths * 0.5;
    }

    const calculationResults = {
      monthlyOnDemandCost,
      riMonthlyCost,
      monthlySavings,
      totalSavings,
      upfrontCost,
      discount,
      paybackPeriod: upfrontCost > 0 ? upfrontCost / monthlySavings : 0,
      roi: upfrontCost > 0 ? (totalSavings / upfrontCost) * 100 : Infinity
    };

    setResults(calculationResults);
    onCalculationComplete(calculationResults);
  };

  return (
    <div>
      <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
        <Calculator size={16} />
        <span>Reserved Instance Calculator</span>
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Configuration */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instance Type
            </label>
            <select
              value={config.instanceType}
              onChange={(e) => setConfig(prev => ({ ...prev, instanceType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="t3.micro">t3.micro</option>
              <option value="t3.small">t3.small</option>
              <option value="t3.medium">t3.medium</option>
              <option value="t3.large">t3.large</option>
              <option value="m5.large">m5.large</option>
              <option value="m5.xlarge">m5.xlarge</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instance Count
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={config.instanceCount}
              onChange={(e) => setConfig(prev => ({ ...prev, instanceCount: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Hourly Rate ($)
            </label>
            <input
              type="number"
              step="0.0001"
              value={config.currentHourlyRate}
              onChange={(e) => setConfig(prev => ({ ...prev, currentHourlyRate: parseFloat(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Utilization Hours
            </label>
            <input
              type="number"
              min="1"
              max="744"
              value={config.utilizationHours}
              onChange={(e) => setConfig(prev => ({ ...prev, utilizationHours: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Term
            </label>
            <select
              value={config.term}
              onChange={(e) => setConfig(prev => ({ ...prev, term: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="1-year">1 Year</option>
              <option value="3-year">3 Years</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Option
            </label>
            <select
              value={config.paymentOption}
              onChange={(e) => setConfig(prev => ({ ...prev, paymentOption: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="no-upfront">No Upfront</option>
              <option value="partial-upfront">Partial Upfront</option>
              <option value="all-upfront">All Upfront</option>
            </select>
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className="space-y-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-3">Calculation Results</h5>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Monthly Cost:</span>
                  <span className="font-medium">{formatPrice(results.monthlyOnDemandCost, currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">RI Monthly Cost:</span>
                  <span className="font-medium">{formatPrice(results.riMonthlyCost, currency)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">Monthly Savings:</span>
                  <span className="font-medium text-green-600">{formatPrice(results.monthlySavings, currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Savings ({config.term}):</span>
                  <span className="font-medium text-green-600">{formatPrice(results.totalSavings, currency)}</span>
                </div>
                {results.upfrontCost > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Upfront Cost:</span>
                      <span className="font-medium text-red-600">{formatPrice(results.upfrontCost, currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payback Period:</span>
                      <span className="font-medium">{results.paybackPeriod.toFixed(1)} months</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">Discount:</span>
                  <span className="font-medium text-green-600">{(results.discount * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservedInstanceOptimizer;