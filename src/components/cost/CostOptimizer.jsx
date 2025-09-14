// CostOptimizer.jsx - Cost optimization suggestions and recommendations
import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  TrendingDown, 
  DollarSign, 
  Lightbulb, 
  Target, 
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle,
  Info,
  BarChart3,
  Settings,
  Star,
  Database,
  Server,
  Globe
} from 'lucide-react';
import { formatPrice } from '../../utils/regionalPricing.js';

/**
 * Cost optimization component with suggestions and recommendations
 */
const CostOptimizer = ({ 
  currentArchitecture, 
  costResults, 
  currency = 'USD',
  onOptimizationApply 
}) => {
  const [optimizations, setOptimizations] = useState([]);
  const [selectedOptimizations, setSelectedOptimizations] = useState(new Set());
  const [projectedSavings, setProjectedSavings] = useState(0);
  const [optimizationCategories, setOptimizationCategories] = useState({});

  useEffect(() => {
    if (costResults && currentArchitecture) {
      generateOptimizations();
    }
  }, [costResults, currentArchitecture]);

  useEffect(() => {
    calculateProjectedSavings();
  }, [selectedOptimizations, optimizations]);

  const generateOptimizations = () => {
    const newOptimizations = [];
    
    // Service-specific optimizations
    costResults.serviceCosts.forEach(service => {
      newOptimizations.push(...generateServiceOptimizations(service, costResults));
    });

    // Architecture-level optimizations
    newOptimizations.push(...generateArchitectureOptimizations(currentArchitecture, costResults));

    // Free tier optimizations
    newOptimizations.push(...generateFreeTierOptimizations(costResults));

    // Regional optimizations
    newOptimizations.push(...generateRegionalOptimizations(costResults));

    // Reserved instance optimizations
    newOptimizations.push(...generateReservedInstanceOptimizations(costResults));

    setOptimizations(newOptimizations);
    
    // Categorize optimizations
    const categories = categorizeOptimizations(newOptimizations);
    setOptimizationCategories(categories);
  };

  const generateServiceOptimizations = (service, costResults) => {
    const optimizations = [];
    
    switch (service.serviceId) {
      case 'ec2':
        if (service.breakdown?.instanceType?.includes('large')) {
          optimizations.push({
            id: `ec2-rightsize-${service.serviceId}`,
            type: 'rightsizing',
            category: 'compute',
            title: 'Right-size EC2 Instances',
            description: `Your ${service.breakdown.instanceType} instances may be over-provisioned for current usage`,
            impact: 'high',
            effort: 'low',
            potentialSavings: service.monthlyCost * 0.3,
            timeToImplement: '15 minutes',
            riskLevel: 'low',
            steps: [
              'Monitor CPU and memory utilization for 1-2 weeks',
              'Identify instances with consistently low utilization (<20%)',
              'Test application performance with smaller instance types',
              'Gradually migrate to appropriately sized instances'
            ],
            prerequisites: ['CloudWatch monitoring enabled', 'Performance baseline established'],
            automationPossible: true
          });
        }
        
        if (service.monthlyCost > 50) {
          optimizations.push({
            id: `ec2-reserved-${service.serviceId}`,
            type: 'reserved-instances',
            category: 'compute',
            title: 'Consider Reserved Instances',
            description: 'Save up to 75% with 1-3 year Reserved Instance commitments',
            impact: 'high',
            effort: 'low',
            potentialSavings: service.monthlyCost * 0.4,
            timeToImplement: '5 minutes',
            riskLevel: 'medium',
            steps: [
              'Analyze usage patterns to ensure consistent workload',
              'Choose appropriate term (1 or 3 years)',
              'Select payment option (All Upfront, Partial Upfront, No Upfront)',
              'Purchase Reserved Instances through AWS Console'
            ],
            prerequisites: ['Stable workload for commitment period'],
            automationPossible: false
          });
        }
        break;

      case 's3':
        if (service.breakdown?.storageGB > 100) {
          optimizations.push({
            id: `s3-lifecycle-${service.serviceId}`,
            type: 'storage-optimization',
            category: 'storage',
            title: 'Implement S3 Lifecycle Policies',
            description: 'Automatically transition older objects to cheaper storage classes',
            impact: 'medium',
            effort: 'low',
            potentialSavings: service.monthlyCost * 0.25,
            timeToImplement: '30 minutes',
            riskLevel: 'low',
            steps: [
              'Analyze object access patterns',
              'Create lifecycle rules for infrequent access (IA) after 30 days',
              'Archive to Glacier after 90 days',
              'Delete old versions and incomplete uploads'
            ],
            prerequisites: ['S3 bucket versioning configured'],
            automationPossible: true
          });
        }
        break;

      case 'rds':
        if (service.breakdown?.instanceType?.includes('db.t')) {
          optimizations.push({
            id: `rds-burstable-${service.serviceId}`,
            type: 'performance-optimization',
            category: 'database',
            title: 'Optimize RDS Burstable Performance',
            description: 'Monitor CPU credits and consider upgrading if consistently low',
            impact: 'medium',
            effort: 'medium',
            potentialSavings: service.monthlyCost * 0.15,
            timeToImplement: '1 hour',
            riskLevel: 'medium',
            steps: [
              'Monitor CPU credit balance in CloudWatch',
              'Identify periods of credit depletion',
              'Consider upgrading to next instance size if needed',
              'Alternatively, optimize database queries'
            ],
            prerequisites: ['CloudWatch monitoring enabled', 'Performance Insights enabled'],
            automationPossible: false
          });
        }
        break;

      case 'lambda':
        if (service.breakdown?.totalRequests > 1000000) {
          optimizations.push({
            id: `lambda-provisioned-${service.serviceId}`,
            type: 'performance-optimization',
            category: 'compute',
            title: 'Consider Provisioned Concurrency',
            description: 'Reduce cold starts for high-traffic functions',
            impact: 'medium',
            effort: 'low',
            potentialSavings: service.monthlyCost * 0.1,
            timeToImplement: '20 minutes',
            riskLevel: 'low',
            steps: [
              'Identify functions with high invocation rates',
              'Monitor cold start metrics',
              'Configure provisioned concurrency for critical functions',
              'Monitor cost impact and adjust as needed'
            ],
            prerequisites: ['Lambda function metrics available'],
            automationPossible: true
          });
        }
        break;
    }

    return optimizations;
  };

  const generateArchitectureOptimizations = (architecture, costResults) => {
    const optimizations = [];
    
    // Serverless migration opportunity
    if (architecture.services.some(s => s.serviceId === 'ec2') && 
        costResults.usage?.monthly?.pageViews < 100000) {
      optimizations.push({
        id: 'serverless-migration',
        type: 'architecture-change',
        category: 'architecture',
        title: 'Consider Serverless Architecture',
        description: 'For your traffic level, serverless could reduce costs by 60-80%',
        impact: 'high',
        effort: 'high',
        potentialSavings: costResults.totalMonthlyCost * 0.7,
        timeToImplement: '2-4 weeks',
        riskLevel: 'medium',
        steps: [
          'Assess application compatibility with serverless',
          'Migrate API endpoints to Lambda functions',
          'Replace database with DynamoDB if applicable',
          'Implement serverless deployment pipeline'
        ],
        prerequisites: ['Stateless application design', 'API-based architecture'],
        automationPossible: false
      });
    }

    // CDN optimization
    if (!architecture.services.some(s => s.serviceId === 'cloudfront') && 
        costResults.breakdown.networking > 10) {
      optimizations.push({
        id: 'cdn-implementation',
        type: 'performance-optimization',
        category: 'networking',
        title: 'Implement CloudFront CDN',
        description: 'Reduce data transfer costs and improve performance',
        impact: 'medium',
        effort: 'medium',
        potentialSavings: costResults.breakdown.networking * 0.4,
        timeToImplement: '1-2 hours',
        riskLevel: 'low',
        steps: [
          'Create CloudFront distribution',
          'Configure origin settings',
          'Set up caching behaviors',
          'Update DNS to point to CloudFront'
        ],
        prerequisites: ['Domain name configured', 'SSL certificate available'],
        automationPossible: true
      });
    }

    return optimizations;
  };

  const generateFreeTierOptimizations = (costResults) => {
    const optimizations = [];
    
    if (costResults.freeTierSavings === 0) {
      optimizations.push({
        id: 'enable-free-tier',
        type: 'free-tier',
        category: 'billing',
        title: 'Enable Free Tier Benefits',
        description: 'You may be eligible for AWS Free Tier savings',
        impact: 'high',
        effort: 'low',
        potentialSavings: Math.min(costResults.totalMonthlyCost * 0.5, 100),
        timeToImplement: '10 minutes',
        riskLevel: 'low',
        steps: [
          'Verify account eligibility for Free Tier',
          'Review service usage against Free Tier limits',
          'Set up billing alerts to monitor usage',
          'Optimize services to stay within Free Tier limits'
        ],
        prerequisites: ['AWS account less than 12 months old'],
        automationPossible: false
      });
    }

    return optimizations;
  };

  const generateRegionalOptimizations = (costResults) => {
    const optimizations = [];
    
    // Simplified regional optimization suggestion
    if (costResults.region !== 'us-east-1') {
      optimizations.push({
        id: 'regional-optimization',
        type: 'regional',
        category: 'infrastructure',
        title: 'Consider US East (N. Virginia) Region',
        description: 'US East typically offers the lowest pricing for most services',
        impact: 'low',
        effort: 'high',
        potentialSavings: costResults.totalMonthlyCost * 0.05,
        timeToImplement: '1-2 days',
        riskLevel: 'high',
        steps: [
          'Assess latency impact for your users',
          'Review compliance and data residency requirements',
          'Plan migration strategy for existing resources',
          'Test application performance in target region'
        ],
        prerequisites: ['No regulatory constraints', 'Acceptable latency for users'],
        automationPossible: false
      });
    }

    return optimizations;
  };

  const generateReservedInstanceOptimizations = (costResults) => {
    const optimizations = [];
    
    const computeCost = costResults.breakdown.compute || 0;
    if (computeCost > 100) {
      // Calculate potential RI savings based on usage patterns
      const riSavings = computeCost * 0.4; // Conservative 40% savings estimate
      
      optimizations.push({
        id: 'reserved-instances-analysis',
        type: 'reserved-instances',
        category: 'compute',
        title: 'Reserved Instance Opportunity Analysis',
        description: 'Significant savings possible with Reserved Instances for steady workloads',
        impact: 'high',
        effort: 'medium',
        potentialSavings: riSavings,
        timeToImplement: '2-4 hours',
        riskLevel: 'medium',
        steps: [
          'Use AWS Cost Explorer to analyze usage patterns',
          'Identify instances with >75% utilization',
          'Calculate ROI for different RI terms and payment options',
          'Purchase RIs for qualified instances'
        ],
        prerequisites: ['Consistent workload for 1+ years', 'Cost Explorer access'],
        automationPossible: false,
        scenarioAnalysis: {
          oneYear: riSavings * 12,
          threeYear: riSavings * 36 * 1.2, // Additional savings for 3-year term
          paybackPeriod: 6 // months
        }
      });

      // Spot instance recommendations for development/testing
      if (costResults.usage?.monthly?.pageViews < 500000) {
        optimizations.push({
          id: 'spot-instances-dev',
          type: 'spot-instances',
          category: 'compute',
          title: 'Spot Instances for Development Workloads',
          description: 'Use Spot Instances for non-critical workloads to save up to 90%',
          impact: 'high',
          effort: 'medium',
          potentialSavings: computeCost * 0.7,
          timeToImplement: '4-8 hours',
          riskLevel: 'medium',
          steps: [
            'Identify fault-tolerant workloads suitable for Spot',
            'Implement Spot Fleet or Auto Scaling with mixed instance types',
            'Add interruption handling to applications',
            'Monitor Spot pricing and availability'
          ],
          prerequisites: ['Fault-tolerant application design', 'Flexible scheduling'],
          automationPossible: true
        });
      }
    }
    
    return optimizations;
  };

  const categorizeOptimizations = (optimizations) => {
    const categories = {};
    
    optimizations.forEach(opt => {
      if (!categories[opt.category]) {
        categories[opt.category] = [];
      }
      categories[opt.category].push(opt);
    });

    return categories;
  };

  const calculateProjectedSavings = () => {
    let totalSavings = 0;
    
    selectedOptimizations.forEach(optId => {
      const optimization = optimizations.find(opt => opt.id === optId);
      if (optimization) {
        totalSavings += optimization.potentialSavings;
      }
    });

    setProjectedSavings(totalSavings);
  };

  const toggleOptimization = (optimizationId) => {
    setSelectedOptimizations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(optimizationId)) {
        newSet.delete(optimizationId);
      } else {
        newSet.add(optimizationId);
      }
      return newSet;
    });
  };

  const getImpactIcon = (impact) => {
    switch (impact) {
      case 'high': return <TrendingDown className="text-green-500" size={16} />;
      case 'medium': return <Target className="text-yellow-500" size={16} />;
      case 'low': return <Zap className="text-blue-500" size={16} />;
      default: return <Info className="text-gray-500" size={16} />;
    }
  };

  const getRiskIcon = (risk) => {
    switch (risk) {
      case 'high': return <AlertTriangle className="text-red-500" size={14} />;
      case 'medium': return <AlertTriangle className="text-yellow-500" size={14} />;
      case 'low': return <CheckCircle className="text-green-500" size={14} />;
      default: return <Info className="text-gray-500" size={14} />;
    }
  };

  if (!costResults || optimizations.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="text-center py-8 text-gray-500">
          <Lightbulb size={48} className="mx-auto mb-2 opacity-50" />
          <p>No optimization opportunities found</p>
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
            <Lightbulb size={20} className="text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-900">Cost Optimization</h3>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Potential Monthly Savings</div>
            <div className="text-xl font-bold text-green-600">
              {formatPrice(projectedSavings, currency)}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-lg font-bold text-blue-600">{optimizations.length}</div>
            <div className="text-sm text-blue-800">Opportunities</div>
          </div>
          <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-lg font-bold text-green-600">
              {formatPrice(optimizations.reduce((sum, opt) => sum + opt.potentialSavings, 0), currency)}
            </div>
            <div className="text-sm text-green-800">Max Savings</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-lg font-bold text-yellow-600">
              {optimizations.filter(opt => opt.impact === 'high').length}
            </div>
            <div className="text-sm text-yellow-800">High Impact</div>
          </div>
          <div className="text-center p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="text-lg font-bold text-purple-600">
              {optimizations.filter(opt => opt.effort === 'low').length}
            </div>
            <div className="text-sm text-purple-800">Quick Wins</div>
          </div>
        </div>

        {/* Top Recommendations */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
            <Star size={16} className="text-yellow-500" />
            <span>Top Recommendations</span>
          </h4>
          
          <div className="space-y-3">
            {optimizations
              .sort((a, b) => b.potentialSavings - a.potentialSavings)
              .slice(0, 3)
              .map(optimization => (
                <OptimizationCard
                  key={optimization.id}
                  optimization={optimization}
                  currency={currency}
                  isSelected={selectedOptimizations.has(optimization.id)}
                  onToggle={() => toggleOptimization(optimization.id)}
                  getImpactIcon={getImpactIcon}
                  getRiskIcon={getRiskIcon}
                  showDetails={true}
                />
              ))}
          </div>
        </div>

        {/* All Optimizations by Category */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4">All Optimization Opportunities</h4>
          
          {Object.entries(optimizationCategories).map(([category, categoryOptimizations]) => (
            <div key={category} className="mb-6">
              <h5 className="font-medium text-gray-800 mb-3 capitalize flex items-center space-x-2">
                {getCategoryIcon(category)}
                <span>{category} Optimizations</span>
              </h5>
              
              <div className="space-y-3">
                {categoryOptimizations.map(optimization => (
                  <OptimizationCard
                    key={optimization.id}
                    optimization={optimization}
                    currency={currency}
                    isSelected={selectedOptimizations.has(optimization.id)}
                    onToggle={() => toggleOptimization(optimization.id)}
                    getImpactIcon={getImpactIcon}
                    getRiskIcon={getRiskIcon}
                    showDetails={false}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Implementation Plan */}
        {selectedOptimizations.size > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h5 className="font-medium text-green-900 mb-3">Implementation Plan</h5>
            <div className="space-y-2 mb-4">
              {Array.from(selectedOptimizations).map(optId => {
                const opt = optimizations.find(o => o.id === optId);
                return opt ? (
                  <div key={optId} className="flex justify-between items-center text-sm">
                    <span className="text-green-800">{opt.title}</span>
                    <span className="font-medium text-green-600">
                      {formatPrice(opt.potentialSavings, currency)}
                    </span>
                  </div>
                ) : null;
              })}
            </div>
            <div className="flex items-center justify-between">
              <div className="text-green-900">
                <span className="font-medium">Total Projected Savings: </span>
                <span className="text-lg font-bold">{formatPrice(projectedSavings, currency)}/month</span>
              </div>
              <button
                onClick={() => onOptimizationApply?.(Array.from(selectedOptimizations))}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium transition-colors"
              >
                Apply Selected
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Individual optimization card component
 */
const OptimizationCard = ({ 
  optimization, 
  currency, 
  isSelected, 
  onToggle, 
  getImpactIcon, 
  getRiskIcon,
  showDetails 
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
              {getImpactIcon(optimization.impact)}
              <h5 className="font-medium text-gray-900">{optimization.title}</h5>
              <div className="flex items-center space-x-1">
                {getRiskIcon(optimization.riskLevel)}
                <span className="text-xs text-gray-500 capitalize">{optimization.riskLevel} risk</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">{optimization.description}</p>
            
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <DollarSign size={14} className="text-green-600" />
                <span className="font-medium text-green-600">
                  {formatPrice(optimization.potentialSavings, currency)}/month
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock size={14} className="text-blue-600" />
                <span className="text-blue-600">{optimization.timeToImplement}</span>
              </div>
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                optimization.effort === 'low' ? 'bg-green-100 text-green-800' :
                optimization.effort === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {optimization.effort} effort
              </div>
            </div>
          </div>
        </div>
        
        {showDetails && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            {expanded ? '▼' : '▶'}
          </button>
        )}
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
          {/* Implementation Steps */}
          <div>
            <h6 className="font-medium text-gray-900 mb-2">Implementation Steps:</h6>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              {optimization.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>

          {/* Prerequisites */}
          {optimization.prerequisites && optimization.prerequisites.length > 0 && (
            <div>
              <h6 className="font-medium text-gray-900 mb-2">Prerequisites:</h6>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                {optimization.prerequisites.map((prereq, index) => (
                  <li key={index}>{prereq}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Automation */}
          {optimization.automationPossible && (
            <div className="bg-blue-50 border border-blue-200 rounded p-2">
              <div className="flex items-center space-x-2 text-blue-800">
                <Settings size={14} />
                <span className="text-sm font-medium">Automation Available</span>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                This optimization can be automated using AWS tools or scripts.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Get category icon
 */
const getCategoryIcon = (category) => {
  const icons = {
    compute: <BarChart3 size={16} className="text-blue-600" />,
    storage: <Shield size={16} className="text-green-600" />,
    networking: <Globe size={16} className="text-purple-600" />,
    database: <Database size={16} className="text-yellow-600" />,
    architecture: <Settings size={16} className="text-red-600" />,
    billing: <DollarSign size={16} className="text-indigo-600" />,
    infrastructure: <Server size={16} className="text-gray-600" />
  };
  
  return icons[category] || <Info size={16} className="text-gray-600" />;
};

export default CostOptimizer;