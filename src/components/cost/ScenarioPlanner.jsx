// ScenarioPlanner.jsx - Traffic growth projections and scenario planning
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  BarChart3, 
  Target, 
  AlertTriangle,
  DollarSign,
  Users,
  Globe,
  Zap,
  ArrowUp,
  ArrowDown,
  Info,
  Settings,
  Play,
  Pause
} from 'lucide-react';
import { calculateCostProjections, calculateArchitectureCosts } from '../../utils/costCalculator.js';
import { formatPrice } from '../../utils/regionalPricing.js';

/**
 * Scenario planning component for traffic growth projections
 */
const ScenarioPlanner = ({ 
  architecturePattern, 
  baseConfig,
  currency = 'USD',
  onScenarioChange 
}) => {
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState('moderate');
  const [timeHorizon, setTimeHorizon] = useState(12); // months
  const [customGrowthRate, setCustomGrowthRate] = useState(15); // percentage per month
  const [isCalculating, setIsCalculating] = useState(false);
  const [projections, setProjections] = useState(null);
  const [alertThresholds, setAlertThresholds] = useState({
    monthly: 100,
    yearly: 1000,
    growthRate: 50 // percentage increase
  });

  // Predefined growth scenarios
  const growthScenarios = {
    conservative: {
      name: 'Conservative Growth',
      description: 'Steady, predictable growth pattern',
      monthlyGrowthRate: 5,
      color: 'blue',
      icon: TrendingUp,
      pattern: 'linear'
    },
    moderate: {
      name: 'Moderate Growth',
      description: 'Typical startup growth trajectory',
      monthlyGrowthRate: 15,
      color: 'green',
      icon: Target,
      pattern: 'exponential'
    },
    aggressive: {
      name: 'Aggressive Growth',
      description: 'Viral growth or major marketing push',
      monthlyGrowthRate: 30,
      color: 'purple',
      icon: ArrowUp,
      pattern: 'exponential'
    },
    seasonal: {
      name: 'Seasonal Pattern',
      description: 'Cyclical growth with peaks and valleys',
      monthlyGrowthRate: 10,
      color: 'orange',
      icon: Calendar,
      pattern: 'seasonal'
    },
    custom: {
      name: 'Custom Scenario',
      description: 'Define your own growth parameters',
      monthlyGrowthRate: customGrowthRate,
      color: 'gray',
      icon: Settings,
      pattern: 'custom'
    }
  };

  useEffect(() => {
    if (architecturePattern && baseConfig) {
      calculateScenarios();
    }
  }, [architecturePattern, baseConfig, selectedScenario, timeHorizon, customGrowthRate]);

  const calculateScenarios = async () => {
    setIsCalculating(true);
    try {
      const scenario = growthScenarios[selectedScenario];
      const projectionData = await generateProjections(scenario);
      setProjections(projectionData);
      onScenarioChange?.(projectionData);
    } catch (error) {
      console.error('Scenario calculation failed:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const generateProjections = async (scenario) => {
    const projections = [];
    let currentUsage = { ...baseConfig.usage };
    
    for (let month = 1; month <= timeHorizon; month++) {
      // Apply growth pattern
      const growthMultiplier = calculateGrowthMultiplier(scenario, month);
      
      const projectedUsage = {
        ...currentUsage,
        monthly: {
          ...currentUsage.monthly,
          pageViews: Math.floor(currentUsage.monthly.pageViews * growthMultiplier),
          uniqueUsers: Math.floor(currentUsage.monthly.uniqueUsers * growthMultiplier),
          apiRequests: Math.floor(currentUsage.monthly.apiRequests * growthMultiplier),
          dataTransfer: Math.floor(currentUsage.monthly.dataTransfer * growthMultiplier)
        }
      };

      // Calculate costs for this month
      const costs = await calculateArchitectureCosts(architecturePattern, {
        ...baseConfig,
        customUsage: projectedUsage,
        includeFreeTier: month <= 12 // Free tier only for first 12 months
      });

      projections.push({
        month: month,
        date: new Date(Date.now() + month * 30 * 24 * 60 * 60 * 1000),
        usage: projectedUsage,
        costs: costs,
        growthRate: ((growthMultiplier - 1) * 100).toFixed(1),
        alerts: generateAlerts(costs, month, alertThresholds)
      });
    }

    return {
      scenario: scenario,
      projections: projections,
      summary: calculateSummary(projections),
      recommendations: generateRecommendations(projections, scenario)
    };
  };

  const calculateGrowthMultiplier = (scenario, month) => {
    const baseRate = scenario.monthlyGrowthRate / 100;
    
    switch (scenario.pattern) {
      case 'linear':
        return 1 + (baseRate * month);
      
      case 'exponential':
        return Math.pow(1 + baseRate, month);
      
      case 'seasonal':
        // Simulate seasonal pattern with sine wave
        const seasonalFactor = 1 + 0.3 * Math.sin((month - 1) * Math.PI / 6);
        return (1 + baseRate * month) * seasonalFactor;
      
      case 'custom':
        return Math.pow(1 + baseRate, month);
      
      default:
        return Math.pow(1 + baseRate, month);
    }
  };

  const generateAlerts = (costs, month, thresholds) => {
    const alerts = [];
    
    // Monthly cost threshold
    if (costs.netMonthlyCost > thresholds.monthly) {
      alerts.push({
        type: 'cost-threshold',
        severity: costs.netMonthlyCost > thresholds.monthly * 2 ? 'high' : 'medium',
        message: `Monthly cost exceeds ${formatPrice(thresholds.monthly, currency)} threshold`,
        value: costs.netMonthlyCost
      });
    }

    // Growth rate alert
    if (month > 1) {
      const growthRate = ((costs.netMonthlyCost / (projections?.projections?.[month - 2]?.costs?.netMonthlyCost || costs.netMonthlyCost)) - 1) * 100;
      if (growthRate > thresholds.growthRate) {
        alerts.push({
          type: 'growth-rate',
          severity: 'high',
          message: `Cost growth rate of ${growthRate.toFixed(1)}% exceeds ${thresholds.growthRate}% threshold`,
          value: growthRate
        });
      }
    }

    // Free tier expiration
    if (month === 12) {
      alerts.push({
        type: 'free-tier-expiration',
        severity: 'medium',
        message: 'AWS Free Tier benefits will expire this month',
        value: costs.freeTierSavings
      });
    }

    return alerts;
  };

  const calculateSummary = (projections) => {
    const totalCost = projections.reduce((sum, p) => sum + p.costs.netMonthlyCost, 0);
    const avgMonthlyCost = totalCost / projections.length;
    const finalMonth = projections[projections.length - 1];
    const firstMonth = projections[0];
    
    const totalGrowth = ((finalMonth.usage.monthly.pageViews / firstMonth.usage.monthly.pageViews) - 1) * 100;
    const costGrowth = ((finalMonth.costs.netMonthlyCost / firstMonth.costs.netMonthlyCost) - 1) * 100;

    return {
      totalCost: totalCost,
      avgMonthlyCost: avgMonthlyCost,
      finalMonthlyCost: finalMonth.costs.netMonthlyCost,
      totalGrowth: totalGrowth,
      costGrowth: costGrowth,
      peakMonth: projections.reduce((max, p) => p.costs.netMonthlyCost > max.costs.netMonthlyCost ? p : max),
      totalAlerts: projections.reduce((sum, p) => sum + p.alerts.length, 0)
    };
  };

  const generateRecommendations = (projections, scenario) => {
    const recommendations = [];
    const summary = calculateSummary(projections);

    // Reserved instance recommendations
    if (summary.avgMonthlyCost > 100) {
      recommendations.push({
        type: 'reserved-instances',
        priority: 'high',
        title: 'Consider Reserved Instances',
        description: `With consistent growth, Reserved Instances could save up to 75% on compute costs`,
        impact: `Potential savings: ${formatPrice(summary.avgMonthlyCost * 0.4, currency)}/month`,
        timeframe: 'Implement by month 3-6'
      });
    }

    // Auto-scaling recommendations
    if (scenario.pattern === 'seasonal' || scenario.monthlyGrowthRate > 20) {
      recommendations.push({
        type: 'auto-scaling',
        priority: 'high',
        title: 'Implement Auto-Scaling',
        description: 'Variable traffic patterns require automatic scaling to optimize costs',
        impact: 'Reduce costs during low-traffic periods by 30-50%',
        timeframe: 'Implement immediately'
      });
    }

    // Architecture migration
    if (summary.finalMonthlyCost > 500) {
      recommendations.push({
        type: 'architecture-review',
        priority: 'medium',
        title: 'Review Architecture for Scale',
        description: 'Consider migrating to more scalable services as costs increase',
        impact: 'Optimize for high-scale operations',
        timeframe: 'Plan for month 6-9'
      });
    }

    // Cost monitoring
    recommendations.push({
      type: 'monitoring',
      priority: 'medium',
      title: 'Set Up Cost Monitoring',
      description: 'Implement automated cost alerts and budgets',
      impact: 'Prevent unexpected cost overruns',
      timeframe: 'Implement immediately'
    });

    return recommendations;
  };

  const updateAlertThreshold = (type, value) => {
    setAlertThresholds(prev => ({
      ...prev,
      [type]: parseFloat(value)
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp size={20} className="text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Scenario Planning</h3>
          </div>
          <div className="flex items-center space-x-2">
            {isCalculating && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent"></div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Scenario Selection */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Growth Scenarios</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {Object.entries(growthScenarios).map(([key, scenario]) => {
              const Icon = scenario.icon;
              const isSelected = selectedScenario === key;
              
              return (
                <button
                  key={key}
                  onClick={() => setSelectedScenario(key)}
                  className={`p-4 border rounded-lg text-left transition-all ${
                    isSelected 
                      ? `border-${scenario.color}-500 bg-${scenario.color}-50` 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon size={16} className={`text-${scenario.color}-600`} />
                    <span className="font-medium text-sm">{scenario.name}</span>
                  </div>
                  <div className="text-xs text-gray-600 mb-2">{scenario.description}</div>
                  <div className="text-xs font-medium text-gray-800">
                    {scenario.monthlyGrowthRate}% monthly growth
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Time Horizon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Horizon (months)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="3"
                max="36"
                step="3"
                value={timeHorizon}
                onChange={(e) => setTimeHorizon(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-900 w-12">
                {timeHorizon}m
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>3 months</span>
              <span>3 years</span>
            </div>
          </div>

          {/* Custom Growth Rate */}
          {selectedScenario === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Growth Rate (%)
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={customGrowthRate}
                  onChange={(e) => setCustomGrowthRate(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-900 w-12">
                  {customGrowthRate}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Alert Thresholds */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
            <AlertTriangle size={16} className="text-yellow-600" />
            <span>Cost Alert Thresholds</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Cost Alert ({currency})
              </label>
              <input
                type="number"
                value={alertThresholds.monthly}
                onChange={(e) => updateAlertThreshold('monthly', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yearly Cost Alert ({currency})
              </label>
              <input
                type="number"
                value={alertThresholds.yearly}
                onChange={(e) => updateAlertThreshold('yearly', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="1000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Growth Rate Alert (%)
              </label>
              <input
                type="number"
                value={alertThresholds.growthRate}
                onChange={(e) => updateAlertThreshold('growthRate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="50"
              />
            </div>
          </div>
        </div>

        {/* Projections Results */}
        {projections && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {formatPrice(projections.summary.totalCost, currency)}
                </div>
                <div className="text-sm text-blue-800">Total Cost ({timeHorizon}m)</div>
              </div>
              <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {formatPrice(projections.summary.avgMonthlyCost, currency)}
                </div>
                <div className="text-sm text-green-800">Avg Monthly Cost</div>
              </div>
              <div className="text-center p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="text-lg font-bold text-purple-600">
                  {projections.summary.totalGrowth.toFixed(0)}%
                </div>
                <div className="text-sm text-purple-800">Traffic Growth</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-lg font-bold text-yellow-600">
                  {projections.summary.totalAlerts}
                </div>
                <div className="text-sm text-yellow-800">Cost Alerts</div>
              </div>
            </div>

            {/* Cost Projection Chart */}
            <ProjectionChart 
              projections={projections.projections}
              currency={currency}
              scenario={projections.scenario}
            />

            {/* Recommendations */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Recommendations</h4>
              <div className="space-y-3">
                {projections.recommendations.map((rec, index) => (
                  <RecommendationCard key={index} recommendation={rec} />
                ))}
              </div>
            </div>

            {/* Monthly Breakdown */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Monthly Projections</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2">Month</th>
                      <th className="text-right py-2">Page Views</th>
                      <th className="text-right py-2">Users</th>
                      <th className="text-right py-2">Monthly Cost</th>
                      <th className="text-right py-2">Growth Rate</th>
                      <th className="text-center py-2">Alerts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projections.projections.slice(0, 12).map((projection, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-2 font-medium">Month {projection.month}</td>
                        <td className="text-right py-2">
                          {projection.usage.monthly.pageViews.toLocaleString()}
                        </td>
                        <td className="text-right py-2">
                          {projection.usage.monthly.uniqueUsers.toLocaleString()}
                        </td>
                        <td className="text-right py-2 font-medium">
                          {formatPrice(projection.costs.netMonthlyCost, currency)}
                        </td>
                        <td className="text-right py-2">
                          <span className={`${
                            parseFloat(projection.growthRate) > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {projection.growthRate > 0 ? '+' : ''}{projection.growthRate}%
                          </span>
                        </td>
                        <td className="text-center py-2">
                          {projection.alerts.length > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                              {projection.alerts.length}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/**
 * Simple projection chart component
 */
const ProjectionChart = ({ projections, currency, scenario }) => {
  const maxCost = Math.max(...projections.map(p => p.costs.netMonthlyCost));
  
  return (
    <div>
      <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
        <BarChart3 size={16} />
        <span>Cost Projection - {scenario.name}</span>
      </h4>
      
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-end space-x-1 h-32">
          {projections.slice(0, 12).map((projection, index) => {
            const height = (projection.costs.netMonthlyCost / maxCost) * 100;
            const hasAlerts = projection.alerts.length > 0;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className={`w-full rounded-t transition-all ${
                    hasAlerts ? 'bg-red-400' : 'bg-blue-400'
                  } hover:opacity-80`}
                  style={{ height: `${height}%` }}
                  title={`Month ${projection.month}: ${formatPrice(projection.costs.netMonthlyCost, currency)}`}
                ></div>
                <div className="text-xs text-gray-600 mt-1">
                  M{projection.month}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>{formatPrice(0, currency)}</span>
          <span>{formatPrice(maxCost, currency)}</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Recommendation card component
 */
const RecommendationCard = ({ recommendation }) => {
  const getPriorityColor = (priority) => {
    const colors = {
      high: 'border-red-300 bg-red-50 text-red-800',
      medium: 'border-yellow-300 bg-yellow-50 text-yellow-800',
      low: 'border-blue-300 bg-blue-50 text-blue-800'
    };
    return colors[priority] || colors.low;
  };

  return (
    <div className={`p-4 border rounded-lg ${getPriorityColor(recommendation.priority)}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="font-medium mb-1">{recommendation.title}</div>
          <div className="text-sm opacity-90 mb-2">{recommendation.description}</div>
          <div className="text-sm font-medium mb-1">{recommendation.impact}</div>
          <div className="text-xs opacity-75">{recommendation.timeframe}</div>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-medium ${
          recommendation.priority === 'high' ? 'bg-red-200 text-red-800' :
          recommendation.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
          'bg-blue-200 text-blue-800'
        }`}>
          {recommendation.priority} priority
        </div>
      </div>
    </div>
  );
};

export default ScenarioPlanner;