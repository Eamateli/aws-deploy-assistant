// CostCalculatorTest.jsx - Test component for cost calculation features
import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Globe, 
  Shield, 
  Calculator,
  BarChart3,
  PieChart,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { architecturePatterns } from '../../data/architecturePatterns.js';
import { trafficPatterns, currencyRates, awsRegions } from '../../data/awsPricing.js';
import { 
  calculateArchitectureCosts, 
  compareTrafficCosts, 
  calculateCostProjections 
} from '../../utils/costCalculator.js';
import { analyzeFreeTierEligibility } from '../../utils/freeTierOptimizer.js';
import { 
  getRegionalComparison, 
  convertCurrency, 
  formatPrice 
} from '../../utils/regionalPricing.js';

/**
 * Main cost calculator test component
 */
const CostCalculatorTest = () => {
  const [selectedPattern, setSelectedPattern] = useState('static-spa');
  const [selectedTraffic, setSelectedTraffic] = useState('medium');
  const [selectedRegion, setSelectedRegion] = useState('us-east-1');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [includeFreeTier, setIncludeFreeTier] = useState(true);
  
  const [costResults, setCostResults] = useState(null);
  const [trafficComparison, setTrafficComparison] = useState(null);
  const [freeTierAnalysis, setFreeTierAnalysis] = useState(null);
  const [regionalComparison, setRegionalComparison] = useState(null);
  const [costProjections, setCostProjections] = useState(null);

  // Calculate costs when parameters change
  useEffect(() => {
    const pattern = architecturePatterns[selectedPattern];
    if (pattern) {
      // Main cost calculation
      const costs = calculateArchitectureCosts(pattern, {
        region: selectedRegion,
        trafficLevel: selectedTraffic,
        currency: selectedCurrency,
        includeFreeTier: includeFreeTier
      });
      setCostResults(costs);

      // Traffic comparison
      const trafficComp = compareTrafficCosts(pattern, {
        region: selectedRegion,
        currency: selectedCurrency,
        includeFreeTier: includeFreeTier
      });
      setTrafficComparison(trafficComp);

      // Free tier analysis
      const freeTier = analyzeFreeTierEligibility(pattern, trafficPatterns[selectedTraffic]);
      setFreeTierAnalysis(freeTier);

      // Regional comparison
      const regional = getRegionalComparison(costs.totalMonthlyCost, 'ec2');
      setRegionalComparison(regional.slice(0, 5)); // Top 5 regions

      // Cost projections
      const projections = calculateCostProjections(pattern, {
        region: selectedRegion,
        trafficLevel: selectedTraffic,
        currency: selectedCurrency
      }, 12);
      setCostProjections(projections);
    }
  }, [selectedPattern, selectedTraffic, selectedRegion, selectedCurrency, includeFreeTier]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AWS Cost Calculator Test</h1>
        <p className="text-gray-600">
          Comprehensive cost analysis with traffic-based calculations, free tier optimization, and regional pricing
        </p>
      </div>

      {/* Configuration Panel */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Configuration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Architecture Pattern */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Architecture Pattern
            </label>
            <select
              value={selectedPattern}
              onChange={(e) => setSelectedPattern(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.entries(architecturePatterns).map(([id, pattern]) => (
                <option key={id} value={id}>
                  {pattern.name}
                </option>
              ))}
            </select>
          </div>

          {/* Traffic Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Traffic Level
            </label>
            <select
              value={selectedTraffic}
              onChange={(e) => setSelectedTraffic(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.entries(trafficPatterns).map(([id, pattern]) => (
                <option key={id} value={id}>
                  {pattern.name}
                </option>
              ))}
            </select>
          </div>

          {/* Region */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AWS Region
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.entries(awsRegions).map(([id, region]) => (
                <option key={id} value={id}>
                  {region.name}
                </option>
              ))}
            </select>
          </div>

          {/* Currency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.entries(currencyRates).map(([code, info]) => (
                <option key={code} value={code}>
                  {info.symbol} {code}
                </option>
              ))}
            </select>
          </div>

          {/* Free Tier Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Options
            </label>
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
      </div>

      {/* Cost Results */}
      {costResults && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Cost Summary */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <DollarSign size={20} />
              <span>Monthly Cost Estimate</span>
            </h3>
            
            <div className="space-y-4">
              <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  {formatPrice(costResults.netMonthlyCost, selectedCurrency)}
                </div>
                <div className="text-sm text-blue-800">Net Monthly Cost</div>
                {costResults.freeTierSavings > 0 && (
                  <div className="text-xs text-green-600 mt-1">
                    Saves {formatPrice(costResults.freeTierSavings, selectedCurrency)} with Free Tier
                  </div>
                )}
              </div>

              {/* Cost Breakdown by Category */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Cost Breakdown</h4>
                {Object.entries(costResults.breakdown).map(([category, cost]) => (
                  cost > 0 && (
                    <div key={category} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 capitalize">{category}</span>
                      <span className="text-sm font-medium">
                        {formatPrice(cost, selectedCurrency)}
                      </span>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>

          {/* Service Costs */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <BarChart3 size={20} />
              <span>Service Costs</span>
            </h3>
            
            <div className="space-y-3">
              {costResults.serviceCosts.map((service, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <div className="font-medium text-gray-900">{service.serviceName}</div>
                      <div className="text-xs text-gray-500">{service.purpose}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {formatPrice(service.monthlyCost, selectedCurrency)}
                      </div>
                      {service.freeTierSavings > 0 && (
                        <div className="text-xs text-green-600">
                          -{formatPrice(service.freeTierSavings, selectedCurrency)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Service breakdown */}
                  {service.breakdown && (
                    <div className="text-xs text-gray-500 space-y-1">
                      {Object.entries(service.breakdown).map(([key, value]) => (
                        typeof value === 'number' && value > 0 && (
                          <div key={key} className="flex justify-between">
                            <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                            <span>{formatPrice(value, selectedCurrency)}</span>
                          </div>
                        )
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Traffic Comparison */}
      {trafficComparison && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <TrendingUp size={20} />
            <span>Cost by Traffic Level</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(trafficComparison).map(([level, costs]) => (
              <div key={level} className={`p-4 border rounded-lg ${
                level === selectedTraffic ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}>
                <div className="text-center">
                  <div className="font-medium text-gray-900 capitalize">{level}</div>
                  <div className="text-2xl font-bold text-gray-900 mt-2">
                    {formatPrice(costs.netMonthlyCost, selectedCurrency)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {costs.usage.monthly.pageViews.toLocaleString()} page views
                  </div>
                  {costs.freeTierSavings > 0 && (
                    <div className="text-xs text-green-600 mt-1">
                      -{formatPrice(costs.freeTierSavings, selectedCurrency)} free tier
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Free Tier Analysis */}
      {freeTierAnalysis && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Shield size={20} />
            <span>Free Tier Analysis</span>
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Summary */}
            <div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="text-green-500" size={20} />
                  <span className="font-medium text-green-900">Free Tier Benefits</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {formatPrice(freeTierAnalysis.totalPotentialSavings, selectedCurrency)}
                </div>
                <div className="text-sm text-green-800">Potential monthly savings</div>
                <div className="text-xs text-green-700 mt-1">
                  {freeTierAnalysis.summary.eligibleCount} of {freeTierAnalysis.summary.totalServices} services eligible
                </div>
              </div>

              {/* Eligible Services */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Eligible Services</h4>
                <div className="space-y-2">
                  {freeTierAnalysis.eligibleServices.map((service, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-green-50 border border-green-200 rounded">
                      <span className="text-sm text-green-900">{service.serviceId.toUpperCase()}</span>
                      <span className="text-sm font-medium text-green-600">
                        {formatPrice(service.monthlySavings, selectedCurrency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
              <div className="space-y-3">
                {freeTierAnalysis.recommendations.map((rec, index) => (
                  <div key={index} className={`p-3 border rounded-lg ${
                    rec.priority === 'high' ? 'border-red-200 bg-red-50' :
                    rec.priority === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                    'border-blue-200 bg-blue-50'
                  }`}>
                    <div className="flex items-start space-x-2">
                      <AlertCircle size={16} className={`mt-0.5 ${
                        rec.priority === 'high' ? 'text-red-500' :
                        rec.priority === 'medium' ? 'text-yellow-500' :
                        'text-blue-500'
                      }`} />
                      <div>
                        <div className="font-medium text-sm">{rec.title}</div>
                        <div className="text-xs text-gray-600 mt-1">{rec.description}</div>
                        {rec.potentialSavings && (
                          <div className="text-xs text-green-600 mt-1">
                            Potential savings: {formatPrice(rec.potentialSavings, selectedCurrency)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Regional Comparison */}
      {regionalComparison && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Globe size={20} />
            <span>Regional Cost Comparison</span>
          </h3>
          
          <div className="space-y-3">
            {regionalComparison.map((region, index) => (
              <div key={region.region} className={`flex justify-between items-center p-3 border rounded-lg ${
                region.region === selectedRegion ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}>
                <div>
                  <div className="font-medium text-gray-900">{region.regionName}</div>
                  <div className="text-xs text-gray-500">{region.region}</div>
                  {region.freeTierAvailable && (
                    <div className="text-xs text-green-600">Free Tier Available</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {formatPrice(region.price, selectedCurrency)}
                  </div>
                  {index === 0 && (
                    <div className="text-xs text-green-600">Cheapest</div>
                  )}
                  {region.savings > 0 && (
                    <div className="text-xs text-green-600">
                      Save {formatPrice(region.savings, selectedCurrency)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cost Projections */}
      {costProjections && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <PieChart size={20} />
            <span>12-Month Cost Projection</span>
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Projection Chart (simplified) */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Monthly Costs Over Time</h4>
              <div className="space-y-2">
                {costProjections.slice(0, 6).map((projection, index) => (
                  <div key={index} className="flex justify-between items-center p-2 border border-gray-200 rounded">
                    <span className="text-sm text-gray-600">Month {projection.month}</span>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {formatPrice(projection.costs.netMonthlyCost, selectedCurrency)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {Math.round((projection.growthFactor - 1) * 100)}% growth
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Stats */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Projection Summary</h4>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm text-blue-800">Year 1 Total Cost</div>
                  <div className="text-xl font-bold text-blue-600">
                    {formatPrice(
                      costProjections.reduce((sum, p) => sum + p.costs.netMonthlyCost, 0),
                      selectedCurrency
                    )}
                  </div>
                </div>
                
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-sm text-green-800">Free Tier Savings (Year 1)</div>
                  <div className="text-xl font-bold text-green-600">
                    {formatPrice(
                      costProjections.reduce((sum, p) => sum + (p.costs.freeTierSavings || 0), 0),
                      selectedCurrency
                    )}
                  </div>
                </div>
                
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-sm text-yellow-800">Average Monthly Cost</div>
                  <div className="text-xl font-bold text-yellow-600">
                    {formatPrice(
                      costProjections.reduce((sum, p) => sum + p.costs.netMonthlyCost, 0) / costProjections.length,
                      selectedCurrency
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cost Optimizations */}
      {costResults?.optimizations && costResults.optimizations.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Calculator size={20} />
            <span>Cost Optimization Recommendations</span>
          </h3>
          
          <div className="space-y-3">
            {costResults.optimizations.map((opt, index) => (
              <div key={index} className={`p-4 border rounded-lg ${
                opt.impact === 'high' ? 'border-green-300 bg-green-50' :
                opt.impact === 'medium' ? 'border-yellow-300 bg-yellow-50' :
                'border-blue-300 bg-blue-50'
              }`}>
                <div className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    opt.impact === 'high' ? 'bg-green-500' :
                    opt.impact === 'medium' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`}></div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{opt.title}</div>
                    <div className="text-sm text-gray-600 mt-1">{opt.description}</div>
                    <div className="text-sm text-green-600 mt-2 font-medium">
                      Potential savings: {opt.savings}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    opt.impact === 'high' ? 'bg-green-200 text-green-800' :
                    opt.impact === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                    'bg-blue-200 text-blue-800'
                  }`}>
                    {opt.impact} impact
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CostCalculatorTest;