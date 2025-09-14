// CostBreakdown.jsx - Detailed cost breakdown visualization component
import React, { useState } from 'react';
import { 
  PieChart, 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  Info, 
  ChevronDown, 
  ChevronRight,
  Server,
  Database,
  Globe,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';
import { formatPrice } from '../../utils/regionalPricing.js';

/**
 * Comprehensive cost breakdown component
 */
const CostBreakdown = ({ 
  costResults, 
  currency = 'USD',
  showDetails = true,
  showOptimizations = true 
}) => {
  const [expandedServices, setExpandedServices] = useState(new Set());
  const [viewMode, setViewMode] = useState('category'); // 'category' or 'service'
  const [showFreeTier, setShowFreeTier] = useState(true);

  if (!costResults) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="text-center py-8 text-gray-500">
          <PieChart size={48} className="mx-auto mb-2 opacity-50" />
          <p>No cost data available</p>
        </div>
      </div>
    );
  }

  const toggleServiceExpansion = (serviceId) => {
    setExpandedServices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(serviceId)) {
        newSet.delete(serviceId);
      } else {
        newSet.add(serviceId);
      }
      return newSet;
    });
  };

  const getCategoryIcon = (category) => {
    const icons = {
      compute: Server,
      storage: Database,
      networking: Globe,
      database: Database,
      security: Shield,
      monitoring: BarChart3,
      other: Info
    };
    return icons[category] || Info;
  };

  const getCategoryColor = (category) => {
    const colors = {
      compute: 'bg-blue-500',
      storage: 'bg-green-500',
      networking: 'bg-purple-500',
      database: 'bg-yellow-500',
      security: 'bg-red-500',
      monitoring: 'bg-indigo-500',
      other: 'bg-gray-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  const totalCost = costResults.totalMonthlyCost;
  const netCost = costResults.netMonthlyCost;
  const freeTierSavings = costResults.freeTierSavings || 0;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PieChart size={20} className="text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Cost Breakdown</h3>
          </div>
          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('category')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'category' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                By Category
              </button>
              <button
                onClick={() => setViewMode('service')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'service' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                By Service
              </button>
            </div>

            {/* Free Tier Toggle */}
            <button
              onClick={() => setShowFreeTier(!showFreeTier)}
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
            >
              {showFreeTier ? <Eye size={14} /> : <EyeOff size={14} />}
              <span className="text-sm">Free Tier</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Cost Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {formatPrice(totalCost, currency)}
            </div>
            <div className="text-sm text-blue-800">Total Monthly Cost</div>
          </div>
          
          {freeTierSavings > 0 && showFreeTier && (
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                -{formatPrice(freeTierSavings, currency)}
              </div>
              <div className="text-sm text-green-800">Free Tier Savings</div>
            </div>
          )}
          
          <div className="text-center p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {formatPrice(netCost, currency)}
            </div>
            <div className="text-sm text-gray-600">Net Monthly Cost</div>
          </div>
        </div>

        {/* Visual Breakdown */}
        {viewMode === 'category' ? (
          <CategoryBreakdown 
            breakdown={costResults.breakdown}
            totalCost={totalCost}
            currency={currency}
            getCategoryIcon={getCategoryIcon}
            getCategoryColor={getCategoryColor}
          />
        ) : (
          <ServiceBreakdown 
            serviceCosts={costResults.serviceCosts}
            totalCost={totalCost}
            currency={currency}
            expandedServices={expandedServices}
            toggleServiceExpansion={toggleServiceExpansion}
            showFreeTier={showFreeTier}
          />
        )}

        {/* Detailed Service List */}
        {showDetails && (
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Service Details</h4>
            <div className="space-y-3">
              {costResults.serviceCosts.map((service, index) => (
                <ServiceDetailCard
                  key={index}
                  service={service}
                  currency={currency}
                  isExpanded={expandedServices.has(service.serviceId)}
                  onToggle={() => toggleServiceExpansion(service.serviceId)}
                  showFreeTier={showFreeTier}
                />
              ))}
            </div>
          </div>
        )}

        {/* Cost Optimizations */}
        {showOptimizations && costResults.optimizations && costResults.optimizations.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Cost Optimization Opportunities</h4>
            <div className="space-y-3">
              {costResults.optimizations.map((optimization, index) => (
                <OptimizationCard
                  key={index}
                  optimization={optimization}
                  currency={currency}
                />
              ))}
            </div>
          </div>
        )}

        {/* Usage Insights */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h5 className="font-medium text-blue-900 mb-3">Usage Insights</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-blue-700">Traffic Level: {costResults.trafficLevel}</div>
              <div className="text-blue-600 mt-1">
                {costResults.usage?.monthly?.pageViews?.toLocaleString()} monthly page views
              </div>
            </div>
            <div>
              <div className="text-blue-700">Region: {costResults.regionName}</div>
              <div className="text-blue-600 mt-1">
                {costResults.serviceCosts.length} services configured
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Category-based cost breakdown
 */
const CategoryBreakdown = ({ 
  breakdown, 
  totalCost, 
  currency, 
  getCategoryIcon, 
  getCategoryColor 
}) => {
  const categories = Object.entries(breakdown).filter(([_, cost]) => cost > 0);
  
  return (
    <div>
      <h4 className="font-medium text-gray-900 mb-4">Cost by Category</h4>
      <div className="space-y-3">
        {categories.map(([category, cost]) => {
          const percentage = (cost / totalCost) * 100;
          const Icon = getCategoryIcon(category);
          const colorClass = getCategoryColor(category);
          
          return (
            <div key={category} className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded ${colorClass}`}></div>
              <Icon size={16} className="text-gray-600" />
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900 capitalize">{category}</span>
                  <span className="text-sm text-gray-600">
                    {formatPrice(cost, currency)} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className={`h-2 rounded-full ${colorClass}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Service-based cost breakdown
 */
const ServiceBreakdown = ({ 
  serviceCosts, 
  totalCost, 
  currency, 
  expandedServices, 
  toggleServiceExpansion,
  showFreeTier 
}) => {
  const sortedServices = [...serviceCosts].sort((a, b) => b.monthlyCost - a.monthlyCost);
  
  return (
    <div>
      <h4 className="font-medium text-gray-900 mb-4">Cost by Service</h4>
      <div className="space-y-2">
        {sortedServices.map((service, index) => {
          const percentage = (service.monthlyCost / totalCost) * 100;
          const netCost = service.monthlyCost - (showFreeTier ? (service.freeTierSavings || 0) : 0);
          
          return (
            <div key={index} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <div>
                    <div className="font-medium text-gray-900">{service.serviceName}</div>
                    <div className="text-xs text-gray-500">{service.purpose}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {formatPrice(netCost, currency)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {percentage.toFixed(1)}% of total
                  </div>
                  {showFreeTier && service.freeTierSavings > 0 && (
                    <div className="text-xs text-green-600">
                      -{formatPrice(service.freeTierSavings, currency)} free tier
                    </div>
                  )}
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div 
                  className="bg-blue-500 h-1.5 rounded-full"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Detailed service card component
 */
const ServiceDetailCard = ({ 
  service, 
  currency, 
  isExpanded, 
  onToggle, 
  showFreeTier 
}) => {
  const netCost = service.monthlyCost - (showFreeTier ? (service.freeTierSavings || 0) : 0);
  
  return (
    <div className="border border-gray-200 rounded-lg">
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <div>
              <div className="font-medium text-gray-900">{service.serviceName}</div>
              <div className="text-sm text-gray-600">{service.purpose}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-medium">{formatPrice(netCost, currency)}</div>
            {showFreeTier && service.freeTierSavings > 0 && (
              <div className="text-sm text-green-600">
                -{formatPrice(service.freeTierSavings, currency)} saved
              </div>
            )}
          </div>
        </div>
      </div>
      
      {isExpanded && service.breakdown && (
        <div className="px-4 pb-4 border-t border-gray-200 bg-gray-50">
          <div className="pt-3 space-y-2">
            {Object.entries(service.breakdown).map(([key, value]) => (
              typeof value === 'number' && value > 0 && (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-gray-600 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </span>
                  <span className="font-medium">
                    {formatPrice(value, currency)}
                  </span>
                </div>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Cost optimization card component
 */
const OptimizationCard = ({ optimization, currency }) => {
  const getImpactColor = (impact) => {
    const colors = {
      high: 'border-green-300 bg-green-50 text-green-800',
      medium: 'border-yellow-300 bg-yellow-50 text-yellow-800',
      low: 'border-blue-300 bg-blue-50 text-blue-800'
    };
    return colors[impact] || colors.low;
  };

  return (
    <div className={`p-4 border rounded-lg ${getImpactColor(optimization.impact)}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="font-medium mb-1">{optimization.title}</div>
          <div className="text-sm opacity-90 mb-2">{optimization.description}</div>
          <div className="text-sm font-medium">
            Potential savings: {optimization.savings}
          </div>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-medium ${
          optimization.impact === 'high' ? 'bg-green-200 text-green-800' :
          optimization.impact === 'medium' ? 'bg-yellow-200 text-yellow-800' :
          'bg-blue-200 text-blue-800'
        }`}>
          {optimization.impact} impact
        </div>
      </div>
    </div>
  );
};

export default CostBreakdown;