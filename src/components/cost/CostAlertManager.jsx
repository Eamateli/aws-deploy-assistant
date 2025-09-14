// CostAlertManager.jsx - Cost alerting thresholds and monitoring suggestions
import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  Shield, 
  TrendingUp, 
  DollarSign,
  Clock,
  Mail,
  Smartphone,
  Settings,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  Info,
  BarChart3,
  Target,
  Zap
} from 'lucide-react';
import { formatPrice } from '../../utils/regionalPricing.js';

/**
 * Cost alerting and monitoring management component
 */
const CostAlertManager = ({ 
  currentCosts, 
  projectedCosts,
  currency = 'USD',
  onAlertsChange 
}) => {
  const [alerts, setAlerts] = useState([]);
  const [alertTemplates, setAlertTemplates] = useState([]);
  const [monitoringRecommendations, setMonitoringRecommendations] = useState([]);
  const [isCreatingAlert, setIsCreatingAlert] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);

  useEffect(() => {
    initializeDefaultAlerts();
    generateMonitoringRecommendations();
  }, [currentCosts, projectedCosts]);

  const initializeDefaultAlerts = () => {
    const defaultAlerts = [
      {
        id: 'monthly-budget',
        name: 'Monthly Budget Alert',
        type: 'budget',
        threshold: Math.max(currentCosts?.netMonthlyCost * 1.2 || 100, 50),
        thresholdType: 'absolute',
        period: 'monthly',
        enabled: true,
        notifications: ['email'],
        description: 'Alert when monthly costs exceed budget',
        severity: 'medium',
        actions: ['email-notification', 'dashboard-alert']
      },
      {
        id: 'growth-rate',
        name: 'Cost Growth Rate Alert',
        type: 'growth',
        threshold: 25,
        thresholdType: 'percentage',
        period: 'monthly',
        enabled: true,
        notifications: ['email', 'sms'],
        description: 'Alert when cost growth exceeds 25% month-over-month',
        severity: 'high',
        actions: ['email-notification', 'sms-notification', 'dashboard-alert']
      },
      {
        id: 'free-tier-usage',
        name: 'Free Tier Usage Alert',
        type: 'free-tier',
        threshold: 80,
        thresholdType: 'percentage',
        period: 'monthly',
        enabled: true,
        notifications: ['email'],
        description: 'Alert when free tier usage exceeds 80%',
        severity: 'low',
        actions: ['email-notification']
      },
      {
        id: 'service-anomaly',
        name: 'Service Cost Anomaly',
        type: 'anomaly',
        threshold: 50,
        thresholdType: 'percentage',
        period: 'daily',
        enabled: false,
        notifications: ['email'],
        description: 'Alert when individual service costs spike unexpectedly',
        severity: 'high',
        actions: ['email-notification', 'dashboard-alert']
      }
    ];

    setAlerts(defaultAlerts);
    
    // Generate alert templates
    const templates = generateAlertTemplates();
    setAlertTemplates(templates);
  };

  const generateAlertTemplates = () => {
    return [
      {
        id: 'startup-budget',
        name: 'Startup Budget Template',
        description: 'Conservative alerts for startups',
        alerts: [
          { name: 'Monthly Budget', threshold: 100, type: 'budget' },
          { name: 'Growth Alert', threshold: 30, type: 'growth' },
          { name: 'Free Tier Alert', threshold: 75, type: 'free-tier' }
        ]
      },
      {
        id: 'enterprise-monitoring',
        name: 'Enterprise Monitoring',
        description: 'Comprehensive monitoring for enterprise',
        alerts: [
          { name: 'Monthly Budget', threshold: 5000, type: 'budget' },
          { name: 'Growth Alert', threshold: 15, type: 'growth' },
          { name: 'Service Anomaly', threshold: 25, type: 'anomaly' },
          { name: 'Daily Spend', threshold: 200, type: 'daily-budget' }
        ]
      },
      {
        id: 'cost-optimization',
        name: 'Cost Optimization Focus',
        description: 'Alerts focused on cost optimization opportunities',
        alerts: [
          { name: 'RI Opportunity', threshold: 100, type: 'ri-opportunity' },
          { name: 'Unused Resources', threshold: 10, type: 'waste-detection' },
          { name: 'Spot Instance Savings', threshold: 50, type: 'spot-opportunity' }
        ]
      }
    ];
  };

  const generateMonitoringRecommendations = () => {
    const recommendations = [];
    
    // Basic monitoring recommendations
    recommendations.push({
      id: 'cost-explorer',
      title: 'Enable AWS Cost Explorer',
      description: 'Get detailed cost and usage reports with filtering and grouping capabilities',
      priority: 'high',
      category: 'reporting',
      implementation: [
        'Navigate to AWS Cost Management Console',
        'Enable Cost Explorer (free for all accounts)',
        'Set up custom reports for your services',
        'Create saved reports for regular monitoring'
      ],
      benefits: [
        'Detailed cost breakdown by service, region, and time',
        'Historical cost analysis and trends',
        'Forecasting capabilities',
        'Custom filtering and grouping'
      ],
      cost: 'Free',
      timeToImplement: '15 minutes'
    });

    recommendations.push({
      id: 'budgets',
      title: 'Set Up AWS Budgets',
      description: 'Create budgets with automatic alerts for cost and usage thresholds',
      priority: 'high',
      category: 'alerting',
      implementation: [
        'Go to AWS Budgets in the Cost Management Console',
        'Create a cost budget for your monthly spending',
        'Set alert thresholds at 50%, 80%, and 100% of budget',
        'Configure email notifications for budget alerts'
      ],
      benefits: [
        'Proactive cost monitoring',
        'Automatic email and SNS notifications',
        'Budget vs actual spending tracking',
        'Forecasted spend alerts'
      ],
      cost: 'First 2 budgets free, $0.02/day per additional budget',
      timeToImplement: '10 minutes'
    });

    recommendations.push({
      id: 'cost-anomaly-detection',
      title: 'Enable Cost Anomaly Detection',
      description: 'Use machine learning to detect unusual spending patterns automatically',
      priority: 'medium',
      category: 'monitoring',
      implementation: [
        'Navigate to Cost Anomaly Detection in AWS Console',
        'Create cost monitors for your services',
        'Set up notification preferences',
        'Configure anomaly detection sensitivity'
      ],
      benefits: [
        'Automatic detection of cost spikes',
        'Machine learning-based analysis',
        'Reduces manual monitoring overhead',
        'Early warning for unexpected costs'
      ],
      cost: 'Free',
      timeToImplement: '20 minutes'
    });

    if (currentCosts?.netMonthlyCost > 100) {
      recommendations.push({
        id: 'rightsizing-recommendations',
        title: 'Enable AWS Compute Optimizer',
        description: 'Get ML-powered recommendations for optimal instance sizing',
        priority: 'medium',
        category: 'optimization',
        implementation: [
          'Enable AWS Compute Optimizer in your account',
          'Wait 12-24 hours for data collection',
          'Review rightsizing recommendations',
          'Implement recommended instance changes'
        ],
        benefits: [
          'Identify over-provisioned resources',
          'Get specific instance type recommendations',
          'Potential cost savings of 10-25%',
          'Performance optimization insights'
        ],
        cost: 'Free',
        timeToImplement: '30 minutes setup + ongoing review'
      });
    }

    recommendations.push({
      id: 'cost-allocation-tags',
      title: 'Implement Cost Allocation Tags',
      description: 'Tag resources for detailed cost tracking and allocation',
      priority: 'medium',
      category: 'organization',
      implementation: [
        'Define a tagging strategy (environment, project, team)',
        'Apply tags to all AWS resources',
        'Activate cost allocation tags in billing console',
        'Create cost reports grouped by tags'
      ],
      benefits: [
        'Track costs by project or team',
        'Better cost accountability',
        'Detailed cost allocation reports',
        'Improved resource management'
      ],
      cost: 'Free',
      timeToImplement: '1-2 hours initial setup'
    });

    setMonitoringRecommendations(recommendations);
  };

  const createAlert = (alertData) => {
    const newAlert = {
      id: `alert-${Date.now()}`,
      ...alertData,
      createdAt: new Date(),
      lastTriggered: null,
      triggerCount: 0
    };
    
    setAlerts(prev => [...prev, newAlert]);
    setIsCreatingAlert(false);
    onAlertsChange?.([...alerts, newAlert]);
  };

  const updateAlert = (alertId, updates) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, ...updates } : alert
    ));
    setEditingAlert(null);
  };

  const deleteAlert = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const toggleAlert = (alertId) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, enabled: !alert.enabled } : alert
    ));
  };

  const applyTemplate = (template) => {
    const templateAlerts = template.alerts.map(alertTemplate => ({
      id: `template-${template.id}-${Date.now()}-${Math.random()}`,
      name: alertTemplate.name,
      type: alertTemplate.type,
      threshold: alertTemplate.threshold,
      thresholdType: 'absolute',
      period: 'monthly',
      enabled: true,
      notifications: ['email'],
      description: `Template alert: ${alertTemplate.name}`,
      severity: 'medium',
      actions: ['email-notification']
    }));

    setAlerts(prev => [...prev, ...templateAlerts]);
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'text-blue-600 bg-blue-100',
      medium: 'text-yellow-600 bg-yellow-100',
      high: 'text-red-600 bg-red-100'
    };
    return colors[severity] || colors.medium;
  };

  const getTypeIcon = (type) => {
    const icons = {
      budget: DollarSign,
      growth: TrendingUp,
      'free-tier': Shield,
      anomaly: AlertTriangle,
      'ri-opportunity': Target,
      'waste-detection': Trash2,
      'spot-opportunity': Zap
    };
    return icons[type] || Bell;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell size={20} className="text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Cost Alert Manager</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsCreatingAlert(true)}
              className="flex items-center space-x-1 bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded font-medium transition-colors"
            >
              <Plus size={16} />
              <span>New Alert</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Alert Templates */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Quick Setup Templates</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {alertTemplates.map(template => (
              <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">{template.name}</h5>
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                <div className="text-xs text-gray-500 mb-3">
                  {template.alerts.length} alerts included
                </div>
                <button
                  onClick={() => applyTemplate(template)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded text-sm font-medium transition-colors"
                >
                  Apply Template
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Current Alerts */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Active Alerts ({alerts.filter(a => a.enabled).length})</h4>
          
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell size={48} className="mx-auto mb-2 opacity-50" />
              <p>No cost alerts configured</p>
              <p className="text-sm mt-1">Create alerts to monitor your AWS spending</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map(alert => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  currency={currency}
                  onToggle={() => toggleAlert(alert.id)}
                  onEdit={() => setEditingAlert(alert)}
                  onDelete={() => deleteAlert(alert.id)}
                  getSeverityColor={getSeverityColor}
                  getTypeIcon={getTypeIcon}
                />
              ))}
            </div>
          )}
        </div>

        {/* Monitoring Recommendations */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
            <BarChart3 size={16} />
            <span>Monitoring Recommendations</span>
          </h4>
          
          <div className="space-y-4">
            {monitoringRecommendations.map(recommendation => (
              <MonitoringRecommendationCard
                key={recommendation.id}
                recommendation={recommendation}
              />
            ))}
          </div>
        </div>

        {/* Cost Monitoring Best Practices */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h5 className="font-medium text-blue-900 mb-3 flex items-center space-x-2">
            <Info size={16} />
            <span>Cost Monitoring Best Practices</span>
          </h5>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h6 className="font-medium mb-2">Alert Configuration</h6>
              <ul className="space-y-1 text-blue-700">
                <li>• Set multiple threshold levels (50%, 80%, 100%)</li>
                <li>• Use both absolute and percentage-based alerts</li>
                <li>• Configure different notification channels</li>
                <li>• Review and adjust thresholds monthly</li>
              </ul>
            </div>
            <div>
              <h6 className="font-medium mb-2">Monitoring Strategy</h6>
              <ul className="space-y-1 text-blue-700">
                <li>• Monitor both costs and usage metrics</li>
                <li>• Set up service-specific alerts</li>
                <li>• Use tags for cost allocation tracking</li>
                <li>• Implement automated responses where possible</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Alert Modal */}
      {(isCreatingAlert || editingAlert) && (
        <AlertModal
          alert={editingAlert}
          currency={currency}
          onSave={editingAlert ? 
            (updates) => updateAlert(editingAlert.id, updates) : 
            createAlert
          }
          onCancel={() => {
            setIsCreatingAlert(false);
            setEditingAlert(null);
          }}
        />
      )}
    </div>
  );
};

/**
 * Individual alert card component
 */
const AlertCard = ({ 
  alert, 
  currency, 
  onToggle, 
  onEdit, 
  onDelete, 
  getSeverityColor, 
  getTypeIcon 
}) => {
  const TypeIcon = getTypeIcon(alert.type);
  
  return (
    <div className={`border rounded-lg p-4 ${
      alert.enabled ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="flex items-center space-x-2 mt-1">
            <input
              type="checkbox"
              checked={alert.enabled}
              onChange={onToggle}
              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <TypeIcon size={16} className="text-gray-600" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h5 className="font-medium text-gray-900">{alert.name}</h5>
              <div className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                {alert.severity}
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>
                Threshold: {alert.thresholdType === 'percentage' ? `${alert.threshold}%` : formatPrice(alert.threshold, currency)}
              </span>
              <span>Period: {alert.period}</span>
              <span>Notifications: {alert.notifications.join(', ')}</span>
            </div>
            
            {alert.triggerCount > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                Triggered {alert.triggerCount} times • Last: {alert.lastTriggered?.toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onEdit}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={onDelete}
            className="text-gray-400 hover:text-red-600 p-1"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Monitoring recommendation card
 */
const MonitoringRecommendationCard = ({ recommendation }) => {
  const [expanded, setExpanded] = useState(false);
  
  const getPriorityColor = (priority) => {
    const colors = {
      high: 'border-red-300 bg-red-50 text-red-800',
      medium: 'border-yellow-300 bg-yellow-50 text-yellow-800',
      low: 'border-blue-300 bg-blue-50 text-blue-800'
    };
    return colors[priority] || colors.medium;
  };

  return (
    <div className={`border rounded-lg p-4 ${getPriorityColor(recommendation.priority)}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h5 className="font-medium">{recommendation.title}</h5>
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              recommendation.priority === 'high' ? 'bg-red-200 text-red-800' :
              recommendation.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
              'bg-blue-200 text-blue-800'
            }`}>
              {recommendation.priority} priority
            </div>
          </div>
          
          <p className="text-sm opacity-90 mb-2">{recommendation.description}</p>
          
          <div className="flex items-center space-x-4 text-sm opacity-75">
            <span>Cost: {recommendation.cost}</span>
            <span>Time: {recommendation.timeToImplement}</span>
            <span>Category: {recommendation.category}</span>
          </div>
        </div>
        
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm opacity-75 hover:opacity-100"
        >
          {expanded ? 'Less' : 'More'}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-current border-opacity-20 space-y-3">
          <div>
            <h6 className="font-medium mb-2">Implementation Steps:</h6>
            <ol className="list-decimal list-inside space-y-1 text-sm opacity-90">
              {recommendation.implementation.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
          
          <div>
            <h6 className="font-medium mb-2">Benefits:</h6>
            <ul className="list-disc list-inside space-y-1 text-sm opacity-90">
              {recommendation.benefits.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Alert creation/editing modal
 */
const AlertModal = ({ alert, currency, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: alert?.name || '',
    type: alert?.type || 'budget',
    threshold: alert?.threshold || 100,
    thresholdType: alert?.thresholdType || 'absolute',
    period: alert?.period || 'monthly',
    notifications: alert?.notifications || ['email'],
    description: alert?.description || '',
    severity: alert?.severity || 'medium',
    actions: alert?.actions || ['email-notification']
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {alert ? 'Edit Alert' : 'Create New Alert'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alert Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alert Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => updateField('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="budget">Budget Alert</option>
              <option value="growth">Growth Rate Alert</option>
              <option value="free-tier">Free Tier Usage</option>
              <option value="anomaly">Cost Anomaly</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Threshold
              </label>
              <input
                type="number"
                value={formData.threshold}
                onChange={(e) => updateField('threshold', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={formData.thresholdType}
                onChange={(e) => updateField('thresholdType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="absolute">Absolute ({currency})</option>
                <option value="percentage">Percentage (%)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Period
            </label>
            <select
              value={formData.period}
              onChange={(e) => updateField('period', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Severity
            </label>
            <select
              value={formData.severity}
              onChange={(e) => updateField('severity', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              rows="3"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded font-medium transition-colors"
            >
              {alert ? 'Update Alert' : 'Create Alert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CostAlertManager;