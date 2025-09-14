// CostOptimizationDashboard.jsx - Comprehensive cost optimization and scenario planning dashboard
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  Bell, 
  Shield, 
  BarChart3,
  Settings,
  Lightbulb,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import CostOptimizer from './CostOptimizer.jsx';
import ScenarioPlanner from './ScenarioPlanner.jsx';
import ReservedInstanceOptimizer from './ReservedInstanceOptimizer.jsx';
import CostAlertManager from './CostAlertManager.jsx';
import { formatPrice } from '../../utils/regionalPricing.js';
import { calculateCostProjections } from '../../utils/costCalculator.js';

/**
 * Comprehensive cost optimization dashboard
 */
const CostOptimizationDashboard = ({ 
  architecturePattern, 
  costResults, 
  currency = 'USD',
  onOptimizationApply 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [optimizationSummary, setOptimizationSummary] = useState(null);
  const [scenarioData, setScenarioData] = useState(null);
  const [alertsData, setAlertsData] = useState(null);
  const [riRecommendations, setRiRecommendations] = useState(null);

  useEffect(() => {
    if (costResults && architecturePattern) {
      generateOptimizationSummary();
    }
  }, [costResults, architecturePattern]);

  const generateOptimizationSummary = async () => {
    try {
      // Calculate 12-month projections for scenario analysis
      const projections = await calculateCostProjections(
        architecturePattern, 
        { 
          region: 'us-east-1',
          currency: currency,
          trafficLevel: 'medium'
        }, 
        12
      );

      const summary = {
        currentMonthlyCost: costResults.netMonthlyCost,
        projectedYearlyCost: projections.reduce((sum, p) => sum + p.costs.netMonthlyCost, 0),
        potentialSavings: {
          immediate: costResults.netMonthlyCost * 0.25, // 25% immediate optimization
          reserved: costResults.breakdown?.compute * 0.4 || 0, // 40% RI savings
          spot: costResults.breakdown?.compute * 0.7 || 0, // 70% spot savings
          architecture: costResults.netMonthlyCost * 0.6 || 0 // 60% serverless migration
        },
        riskAssessment: calculateRiskAssessment(costResults, projections),
        recommendations: generateTopRecommendations(costResults, projections)
      };

      setOptimizationSummary(summary);
    } catch (error) {
      console.error('Failed to generate optimization summary:', error);
    }
  };

  const calculateRiskAssessment = (costs, projections) => {
    const finalProjection = projections[projections.length - 1];
    const costGrowth = ((finalProjection.costs.netMonthlyCost / costs.netMonthlyCost) - 1) * 100;
    
    let riskLevel = 'low';
    let riskFactors = [];

    if (costGrowth > 200) {
      riskLevel = 'high';
      riskFactors.push('Rapid cost growth projected');
    } else if (costGrowth > 100) {
      riskLevel = 'medium';
      riskFactors.push('Moderate cost growth expected');
    }

    if (costs.freeTierSavings > costs.netMonthlyCost * 0.5) {
      riskFactors.push('Heavy reliance on free tier benefits');
    }

    if (!costs.breakdown?.compute && costs.netMonthlyCost > 100) {
      riskFactors.push('Limited optimization opportunities');
    }

    return {
      level: riskLevel,
      factors: riskFactors,
      score: Math.min(100, costGrowth + (riskFactors.length * 20))
    };
  };

  const generateTopRecommendations = (costs, projections) => {
    const recommendations = [];
    
    // Immediate cost optimization
    if (costs.netMonthlyCost > 50) {
      recommendations.push({
        id: 'immediate-optimization',
        title: 'Immediate Cost Optimization',
        description: 'Quick wins to reduce current spending',
        impact: 'high',
        effort: 'low',
        timeframe: '1-2 weeks',
        savings: costs.netMonthlyCost * 0.15
      });
    }

    // Reserved instances for consistent workloads
    if (costs.breakdown?.compute > 100) {
      recommendations.push({
        id: 'reserved-instances',
        title: 'Reserved Instance Strategy',
        description: 'Long-term savings for predictable workloads',
        impact: 'high',
        effort: 'medium',
        timeframe: '1-3 months',
        savings: costs.breakdown.compute * 0.4
      });
    }

    // Architecture optimization
    const finalCost = projections[projections.length - 1]?.costs?.netMonthlyCost || costs.netMonthlyCost;
    if (finalCost > 500) {
      recommendations.push({
        id: 'architecture-review',
        title: 'Architecture Optimization',
        description: 'Redesign for scale and cost efficiency',
        impact: 'high',
        effort: 'high',
        timeframe: '3-6 months',
        savings: finalCost * 0.4
      });
    }

    // Cost monitoring and alerting
    recommendations.push({
      id: 'cost-monitoring',
      title: 'Cost Monitoring Setup',
      description: 'Proactive cost management and alerting',
      impact: 'medium',
      effort: 'low',
      timeframe: '1 week',
      savings: costs.netMonthlyCost * 0.1 // Prevent overruns
    });

    return recommendations.slice(0, 4); // Top 4 recommendations
  };

  const handleScenarioChange = (scenarioData) => {
    setScenarioData(scenarioData);
  };

  const handleAlertsChange = (alerts) => {
    setAlertsData(alerts);
  };

  const handleRiRecommendationSelect = (recommendations) => {
    setRiRecommendations(recommendations);
    onOptimizationApply?.({ type: 'reserved-instances', recommendations });
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'optimizer', name: 'Cost Optimizer', icon: Lightbulb },
    { id: 'scenarios', name: 'Scenario Planning', icon: TrendingUp },
    { id: 'reserved', name: 'Reserved Instances', icon: Shield },
    { id: 'alerts', name: 'Cost Alerts', icon: Bell }
  ];

  if (!costResults) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="text-center py-8 text-gray-500">
          <DollarSign size={48} className="mx-auto mb-2 opacity-50" />
          <p>No cost data available for optimization</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target size={20} className="text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">Cost Optimization Dashboard</h3>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Current Monthly Cost</div>
            <div className="text-xl font-bold text-indigo-600">
              {formatPrice(costResults.netMonthlyCost, currency)}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={16} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <OptimizationOverview 
            costResults={costResults}
            optimizationSummary={optimizationSummary}
            scenarioData={scenarioData}
            currency={currency}
          />
        )}

        {activeTab === 'optimizer' && (
          <CostOptimizer
            currentArchitecture={architecturePattern}
            costResults={costResults}
            currency={currency}
            onOptimizationApply={onOptimizationApply}
          />
        )}

        {activeTab === 'scenarios' && (
          <ScenarioPlanner
            architecturePattern={architecturePattern}
            baseConfig={{ 
              usage: costResults.usage,
              region: costResults.region,
              currency: currency
            }}
            currency={currency}
            onScenarioChange={handleScenarioChange}
          />
        )}

        {activeTab === 'reserved' && (
          <ReservedInstanceOptimizer
            architecturePattern={architecturePattern}
            costResults={costResults}
            usagePatterns={{
              consistent: true,
              predictable: true,
              longTerm: true,
              faultTolerant: false
            }}
            currency={currency}
            onRecommendationSelect={handleRiRecommendationSelect}
          />
        )}

        {activeTab === 'alerts' && (
          <CostAlertManager
            currentCosts={costResults}
            projectedCosts={scenarioData?.projections}
            currency={currency}
            onAlertsChange={handleAlertsChange}
          />
        )}
      </div>
    </div>
  );
};

/**
 * Optimization overview component
 */
const OptimizationOverview = ({ 
  costResults, 
  optimizationSummary, 
  scenarioData, 
  currency 
}) => {
  if (!optimizationSummary) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent mx-auto mb-2"></div>
        <p>Analyzing optimization opportunities...</p>
      </div>
    );
  }

  const totalPotentialSavings = Object.values(optimizationSummary.potentialSavings)
    .reduce((sum, savings) => sum + savings, 0);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {formatPrice(optimizationSummary.currentMonthlyCost, currency)}
          </div>
          <div className="text-sm text-blue-800">Current Monthly</div>
        </div>
        <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {formatPrice(totalPotentialSavings, currency)}
          </div>
          <div className="text-sm text-green-800">Potential Savings</div>
        </div>
        <div className="text-center p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {formatPrice(optimizationSummary.projectedYearlyCost, currency)}
          </div>
          <div className="text-sm text-purple-800">Projected Yearly</div>
        </div>
        <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">
            {optimizationSummary.riskAssessment.score}
          </div>
          <div className="text-sm text-yellow-800">Risk Score</div>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className={`p-4 border rounded-lg ${
        optimizationSummary.riskAssessment.level === 'high' ? 'border-red-300 bg-red-50' :
        optimizationSummary.riskAssessment.level === 'medium' ? 'border-yellow-300 bg-yellow-50' :
        'border-green-300 bg-green-50'
      }`}>
        <div className="flex items-center space-x-2 mb-3">
          <AlertTriangle size={16} className={
            optimizationSummary.riskAssessment.level === 'high' ? 'text-red-600' :
            optimizationSummary.riskAssessment.level === 'medium' ? 'text-yellow-600' :
            'text-green-600'
          } />
          <h4 className="font-medium capitalize">
            {optimizationSummary.riskAssessment.level} Risk Assessment
          </h4>
        </div>
        <ul className="space-y-1 text-sm">
          {optimizationSummary.riskAssessment.factors.map((factor, index) => (
            <li key={index} className="flex items-center space-x-2">
              <div className="w-1 h-1 bg-current rounded-full"></div>
              <span>{factor}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Savings Breakdown */}
      <div>
        <h4 className="font-medium text-gray-900 mb-4">Potential Savings Breakdown</h4>
        <div className="space-y-3">
          {Object.entries(optimizationSummary.potentialSavings).map(([type, savings]) => {
            if (savings <= 0) return null;
            
            const percentage = (savings / optimizationSummary.currentMonthlyCost) * 100;
            
            return (
              <div key={type} className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-indigo-500 rounded"></div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900 capitalize">
                      {type.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </span>
                    <span className="text-sm text-gray-600">
                      {formatPrice(savings, currency)} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-indigo-500 h-2 rounded-full"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Recommendations */}
      <div>
        <h4 className="font-medium text-gray-900 mb-4">Top Recommendations</h4>
        <div className="space-y-3">
          {optimizationSummary.recommendations.map((rec, index) => (
            <div key={rec.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 mb-1">{rec.title}</h5>
                  <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Impact: {rec.impact}</span>
                    <span>Effort: {rec.effort}</span>
                    <span>Timeframe: {rec.timeframe}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-green-600">
                    {formatPrice(rec.savings, currency)}
                  </div>
                  <div className="text-xs text-gray-500">potential savings</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <h5 className="font-medium text-indigo-900 mb-3">Quick Actions</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button className="flex items-center space-x-2 bg-white border border-indigo-300 hover:border-indigo-400 text-indigo-700 px-4 py-2 rounded font-medium transition-colors">
            <Settings size={16} />
            <span>Set Up Cost Alerts</span>
          </button>
          <button className="flex items-center space-x-2 bg-white border border-indigo-300 hover:border-indigo-400 text-indigo-700 px-4 py-2 rounded font-medium transition-colors">
            <Calendar size={16} />
            <span>Plan Growth Scenarios</span>
          </button>
          <button className="flex items-center space-x-2 bg-white border border-indigo-300 hover:border-indigo-400 text-indigo-700 px-4 py-2 rounded font-medium transition-colors">
            <Shield size={16} />
            <span>Analyze Reserved Instances</span>
          </button>
          <button className="flex items-center space-x-2 bg-white border border-indigo-300 hover:border-indigo-400 text-indigo-700 px-4 py-2 rounded font-medium transition-colors">
            <Lightbulb size={16} />
            <span>Apply Optimizations</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CostOptimizationDashboard;