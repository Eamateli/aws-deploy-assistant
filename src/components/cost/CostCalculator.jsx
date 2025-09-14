import React, { useState, useMemo, useCallback } from 'react';
import { 
  DollarSign, TrendingUp, BarChart3, Settings, 
  Info, AlertCircle, Zap, Database, Globe
} from 'lucide-react';

const CostBreakdown = React.memo(({ breakdown, total, currency = 'USD' }) => {
  if (!breakdown || breakdown.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
        <p>No cost breakdown available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-gray-900 mb-4">Cost Breakdown</h4>
      {breakdown.map((item, index) => (
        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">{item.service}</span>
              <Info size={14} className="text-gray-400" title={item.description} />
            </div>
            <p className="text-sm text-gray-600">{item.description}</p>
          </div>
          <div className="text-right">
            <span className="font-semibold text-gray-900">
              ${item.cost.toFixed(2)}/{currency === 'USD' ? 'month' : 'mo'}
            </span>
          </div>
        </div>
      ))}
      <div className="border-t pt-3 mt-4">
        <div className="flex items-center justify-between text-lg font-bold">
          <span>Total Monthly Cost</span>
          <span className="text-green-600">${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
});

const TrafficSlider = React.memo(({ value, onChange, label, min = 0, max = 1000000, step = 1000 }) => {
  const formatValue = useCallback((val) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
    return val.toString();
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm text-gray-600">{formatValue(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );
});

const OptimizationTips = React.memo(({ architecture, costs, traffic }) => {
  const tips = useMemo(() => {
    const suggestions = [];
    
    if (costs.freeTierEligible) {
      suggestions.push({
        type: 'success',
        title: 'Free Tier Eligible',
        description: 'Your usage falls within AWS Free Tier limits. You may pay nothing for the first 12 months!',
        icon: Zap
      });
    }

    if (traffic.requests < 100000) {
      suggestions.push({
        type: 'info',
        title: 'Consider Serverless',
        description: 'With low traffic, serverless options like Lambda can be more cost-effective than always-on servers.',
        icon: Zap
      });
    }

    if (costs.monthly > 100) {
      suggestions.push({
        type: 'warning',
        title: 'Reserved Instances',
        description: 'For predictable workloads, Reserved Instances can save up to 75% compared to On-Demand pricing.',
        icon: TrendingUp
      });
    }

    if (architecture?.id === 'static-spa') {
      suggestions.push({
        type: 'info',
        title: 'CDN Optimization',
        description: 'Enable CloudFront compression and caching to reduce bandwidth costs and improve performance.',
        icon: Globe
      });
    }

    return suggestions;
  }, [architecture, costs, traffic]);

  if (tips.length === 0) return null;

  const typeStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800'
  };

  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-gray-900">Optimization Tips</h4>
      {tips.map((tip, index) => {
        const Icon = tip.icon;
        return (
          <div key={index} className={`p-3 rounded-lg border ${typeStyles[tip.type]}`}>
            <div className="flex items-start space-x-3">
              <Icon size={16} className="mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="font-medium">{tip.title}</h5>
                <p className="text-sm mt-1">{tip.description}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});

const CostCalculator = ({ architecture, onCostUpdate, className = '' }) => {
  const [traffic, setTraffic] = useState({
    requests: 10000,
    storage: 5,
    bandwidth: 10
  });
  const [region, setRegion] = useState('us-east-1');
  const [environment, setEnvironment] = useState('production');

  // Memoize cost calculation for performance
  const costs = useMemo(() => {
    if (!architecture || !architecture.services) {
      return { monthly: 0, breakdown: [], freeTierEligible: false, annual: 0 };
    }

    const calculateServiceCosts = () => {
      let totalCost = 0;
      const breakdown = [];

      architecture.services.forEach(service => {
        let serviceCost = 0;
        let description = '';

        switch (service.name) {
          case 'S3':
            serviceCost = (traffic.storage * 0.023) + (traffic.requests * 0.0004 / 1000);
            description = `${traffic.storage}GB storage + ${traffic.requests.toLocaleString()} requests`;
            break;
          case 'CloudFront':
            serviceCost = traffic.bandwidth * 0.085;
            description = `${traffic.bandwidth}GB data transfer`;
            break;
          case 'Route53':
            serviceCost = 0.50;
            description = '1 hosted zone';
            break;
          case 'Lambda':
            serviceCost = (traffic.requests * 0.20) / 1000000;
            description = `${traffic.requests.toLocaleString()} requests`;
            break;
          case 'API Gateway':
            serviceCost = (traffic.requests * 3.50) / 1000000;
            description = `${traffic.requests.toLocaleString()} API calls`;
            break;
          case 'DynamoDB':
            serviceCost = traffic.storage * 0.25;
            description = `${traffic.storage}GB storage`;
            break;
          case 'EC2':
            const instanceMultiplier = traffic.requests > 100000 ? 2 : 1;
            serviceCost = 8.5 * instanceMultiplier;
            description = `${instanceMultiplier}x t3.small instance${instanceMultiplier > 1 ? 's' : ''}`;
            break;
          case 'ALB':
            serviceCost = 16 + (traffic.requests * 0.008 / 1000);
            description = `Load balancer + ${traffic.requests.toLocaleString()} requests`;
            break;
          case 'RDS':
            serviceCost = 15;
            description = 't3.micro MySQL instance';
            break;
          case 'Fargate':
            const hours = 24 * 30;
            serviceCost = hours * 0.04048;
            description = `${hours} vCPU hours`;
            break;
          default:
            serviceCost = 5; // Default cost
            description = 'Base service cost';
        }

        // Apply environment multiplier
        if (environment === 'development') {
          serviceCost *= 0.5;
        }

        breakdown.push({
          service: service.name,
          cost: serviceCost,
          description
        });

        totalCost += serviceCost;
      });

      return {
        monthly: totalCost,
        breakdown,
        freeTierEligible: totalCost < 20,
        annual: totalCost * 12
      };
    };

    return calculateServiceCosts();
  }, [architecture, traffic, region, environment]);

  // Notify parent component of cost updates
  React.useEffect(() => {
    if (onCostUpdate) {
      onCostUpdate(costs);
    }
  }, [costs, onCostUpdate]);

  const updateTraffic = useCallback((field, value) => {
    setTraffic(prev => ({ ...prev, [field]: value }));
  }, []);

  if (!architecture) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-8 text-center ${className}`}>
        <DollarSign size={48} className="mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Cost Calculator</h3>
        <p className="text-gray-600">Select an architecture to see cost estimates.</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Cost Calculator</h3>
        <p className="text-gray-600">Estimate your monthly AWS costs based on usage</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Configuration Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Environment
            </label>
            <select
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="development">Development</option>
              <option value="production">Production</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AWS Region
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="us-east-1">US East (N. Virginia)</option>
              <option value="us-west-2">US West (Oregon)</option>
              <option value="eu-west-1">Europe (Ireland)</option>
              <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
            </select>
          </div>
        </div>

        {/* Traffic Sliders */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Expected Usage</h4>
          
          <TrafficSlider
            label="Monthly Requests"
            value={traffic.requests}
            onChange={(value) => updateTraffic('requests', value)}
            min={1000}
            max={10000000}
            step={1000}
          />

          <TrafficSlider
            label="Storage (GB)"
            value={traffic.storage}
            onChange={(value) => updateTraffic('storage', value)}
            min={1}
            max={1000}
            step={1}
          />

          <TrafficSlider
            label="Bandwidth (GB)"
            value={traffic.bandwidth}
            onChange={(value) => updateTraffic('bandwidth', value)}
            min={1}
            max={10000}
            step={1}
          />
        </div>

        {/* Cost Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6">
          <div className="text-center">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Estimated Monthly Cost</h4>
            <div className="text-4xl font-bold text-green-600 mb-2">
              ${costs.monthly.toFixed(2)}
            </div>
            <p className="text-sm text-gray-600">
              Annual: ${costs.annual.toFixed(2)} 
              {costs.freeTierEligible && (
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                  Free Tier Eligible
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Cost Breakdown */}
        <CostBreakdown 
          breakdown={costs.breakdown} 
          total={costs.monthly} 
        />

        {/* Optimization Tips */}
        <OptimizationTips 
          architecture={architecture}
          costs={costs}
          traffic={traffic}
        />
      </div>
    </div>
  );
};

export default React.memo(CostCalculator);