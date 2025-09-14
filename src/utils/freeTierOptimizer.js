// Free Tier Optimizer
// Utilities for optimizing AWS architectures to maximize free tier benefits

import { freeTierLimits, awsServicePricing } from '../data/awsPricing.js';

/**
 * Analyze free tier eligibility for an architecture
 * @param {Object} architecturePattern - Architecture pattern with services
 * @param {Object} usage - Usage patterns
 * @returns {Object} Free tier analysis and recommendations
 */
export const analyzeFreeTierEligibility = (architecturePattern, usage) => {
  const eligibleServices = [];
  const ineligibleServices = [];
  const optimizations = [];
  let totalPotentialSavings = 0;

  architecturePattern.services.forEach(service => {
    const analysis = analyzeServiceFreeTier(service.serviceId, usage, service.configuration);
    
    if (analysis.eligible) {
      eligibleServices.push({
        ...service,
        ...analysis
      });
      totalPotentialSavings += analysis.monthlySavings;
    } else {
      ineligibleServices.push({
        ...service,
        ...analysis
      });
    }
    
    if (analysis.optimizations) {
      optimizations.push(...analysis.optimizations);
    }
  });

  return {
    eligibleServices,
    ineligibleServices,
    optimizations,
    totalPotentialSavings,
    summary: {
      eligibleCount: eligibleServices.length,
      totalServices: architecturePattern.services.length,
      eligibilityPercentage: Math.round((eligibleServices.length / architecturePattern.services.length) * 100)
    },
    recommendations: generateFreeTierRecommendations(eligibleServices, ineligibleServices, usage)
  };
};

/**
 * Analyze free tier eligibility for a specific service
 * @param {string} serviceId - AWS service identifier
 * @param {Object} usage - Usage patterns
 * @param {Object} configuration - Service configuration
 * @returns {Object} Service-specific free tier analysis
 */
const analyzeServiceFreeTier = (serviceId, usage, configuration = {}) => {
  const limits = freeTierLimits[serviceId];
  const pricing = awsServicePricing[serviceId];
  
  if (!limits || !pricing) {
    return {
      eligible: false,
      reason: 'No free tier available for this service',
      monthlySavings: 0
    };
  }

  switch (serviceId) {
    case 'ec2':
      return analyzeEC2FreeTier(usage, configuration, limits, pricing);
    case 'lambda':
      return analyzeLambdaFreeTier(usage, limits, pricing);
    case 's3':
      return analyzeS3FreeTier(usage, limits, pricing);
    case 'rds':
      return analyzeRDSFreeTier(usage, configuration, limits, pricing);
    case 'dynamodb':
      return analyzeDynamoDBFreeTier(usage, configuration, limits, pricing);
    case 'cloudfront':
      return analyzeCloudFrontFreeTier(usage, limits, pricing);
    case 'api-gateway':
      return analyzeAPIGatewayFreeTier(usage, limits, pricing);
    case 'cloudwatch':
      return analyzeCloudWatchFreeTier(usage, limits, pricing);
    default:
      return {
        eligible: false,
        reason: 'Free tier analysis not implemented for this service',
        monthlySavings: 0
      };
  }
};

/**
 * Analyze EC2 free tier eligibility
 */
const analyzeEC2FreeTier = (usage, configuration, limits, pricing) => {
  const instanceType = configuration.instanceType || 't3.small';
  const instanceCount = configuration.instanceCount || 1;
  const hoursNeeded = usage.monthly.computeHours || 730;
  
  const isEligibleInstance = limits.instanceTypes.includes(instanceType);
  const withinHourLimit = hoursNeeded <= limits.hours;
  const singleInstance = instanceCount === 1;
  
  if (!isEligibleInstance) {
    return {
      eligible: false,
      reason: `Instance type ${instanceType} is not eligible for free tier. Eligible types: ${limits.instanceTypes.join(', ')}`,
      monthlySavings: 0,
      optimizations: [{
        type: 'instance-type',
        title: 'Switch to Free Tier Eligible Instance',
        description: `Consider using ${limits.instanceTypes[0]} instead of ${instanceType}`,
        impact: 'high',
        potentialSavings: pricing.instances[instanceType]?.pricePerHour * Math.min(hoursNeeded, limits.hours) || 0
      }]
    };
  }
  
  if (!singleInstance) {
    return {
      eligible: false,
      reason: 'Free tier only covers one instance',
      monthlySavings: 0,
      optimizations: [{
        type: 'instance-count',
        title: 'Reduce to Single Instance',
        description: 'Free tier only covers one EC2 instance',
        impact: 'medium',
        potentialSavings: pricing.instances[instanceType]?.pricePerHour * limits.hours || 0
      }]
    };
  }
  
  const freeHours = Math.min(hoursNeeded, limits.hours);
  const monthlySavings = freeHours * (pricing.instances[instanceType]?.pricePerHour || 0);
  
  return {
    eligible: true,
    coverage: withinHourLimit ? 'full' : 'partial',
    freeHours: freeHours,
    totalHours: hoursNeeded,
    monthlySavings: monthlySavings,
    details: {
      instanceType: instanceType,
      eligibleHours: limits.hours,
      usedHours: hoursNeeded,
      remainingHours: Math.max(0, limits.hours - hoursNeeded)
    }
  };
};

/**
 * Analyze Lambda free tier eligibility
 */
const analyzeLambdaFreeTier = (usage, limits, pricing) => {
  const requests = usage.monthly.apiRequests || 100000;
  const avgDuration = 200; // ms
  const memorySize = 512; // MB
  const gbSeconds = (requests * avgDuration / 1000) * (memorySize / 1024);
  
  const withinRequestLimit = requests <= limits.requests;
  const withinComputeLimit = gbSeconds <= limits.computeTime;
  
  const freeRequests = Math.min(requests, limits.requests);
  const freeGBSeconds = Math.min(gbSeconds, limits.computeTime);
  
  const requestSavings = freeRequests * pricing.pricing.requests;
  const computeSavings = freeGBSeconds * pricing.pricing.computeTime;
  const monthlySavings = requestSavings + computeSavings;
  
  return {
    eligible: true,
    coverage: (withinRequestLimit && withinComputeLimit) ? 'full' : 'partial',
    freeRequests: freeRequests,
    freeGBSeconds: freeGBSeconds,
    monthlySavings: monthlySavings,
    details: {
      requestLimit: limits.requests,
      computeLimit: limits.computeTime,
      usedRequests: requests,
      usedGBSeconds: gbSeconds,
      remainingRequests: Math.max(0, limits.requests - requests),
      remainingGBSeconds: Math.max(0, limits.computeTime - gbSeconds)
    }
  };
};

/**
 * Analyze S3 free tier eligibility
 */
const analyzeS3FreeTier = (usage, limits, pricing) => {
  const storageGB = usage.monthly.storageUsage || 5;
  const getRequests = usage.monthly.pageViews || 1000;
  const putRequests = Math.ceil(getRequests * 0.1);
  const dataTransfer = usage.monthly.dataTransfer || 1;
  
  const withinStorageLimit = storageGB <= limits.storage;
  const withinGetRequestLimit = getRequests <= limits.requests.get;
  const withinPutRequestLimit = putRequests <= limits.requests.put;
  const withinTransferLimit = dataTransfer <= 15; // 15GB free transfer
  
  const freeStorage = Math.min(storageGB, limits.storage);
  const freeGetRequests = Math.min(getRequests, limits.requests.get);
  const freePutRequests = Math.min(putRequests, limits.requests.put);
  const freeTransfer = Math.min(dataTransfer, 15);
  
  const storageSavings = freeStorage * pricing.storage.standard.first50TB;
  const requestSavings = (freeGetRequests / 1000 * pricing.requests.get) + 
                        (freePutRequests / 1000 * pricing.requests.put);
  const transferSavings = freeTransfer * 0.09; // Approximate transfer cost
  
  const monthlySavings = storageSavings + requestSavings + transferSavings;
  
  return {
    eligible: true,
    coverage: (withinStorageLimit && withinGetRequestLimit && withinPutRequestLimit && withinTransferLimit) ? 'full' : 'partial',
    freeStorage: freeStorage,
    freeRequests: { get: freeGetRequests, put: freePutRequests },
    freeTransfer: freeTransfer,
    monthlySavings: monthlySavings,
    details: {
      storageLimit: limits.storage,
      requestLimits: limits.requests,
      usedStorage: storageGB,
      usedRequests: { get: getRequests, put: putRequests },
      usedTransfer: dataTransfer,
      remainingStorage: Math.max(0, limits.storage - storageGB),
      remainingRequests: {
        get: Math.max(0, limits.requests.get - getRequests),
        put: Math.max(0, limits.requests.put - putRequests)
      }
    }
  };
};

/**
 * Analyze RDS free tier eligibility
 */
const analyzeRDSFreeTier = (usage, configuration, limits, pricing) => {
  const instanceType = configuration.instanceType || 'db.t3.micro';
  const storageSize = configuration.storageSize || 20;
  const hoursNeeded = 730; // Assume always-on database
  
  const isEligibleInstance = limits.instanceTypes.includes(instanceType);
  const withinHourLimit = hoursNeeded <= limits.hours;
  const withinStorageLimit = storageSize <= limits.storage;
  
  if (!isEligibleInstance) {
    return {
      eligible: false,
      reason: `Instance type ${instanceType} is not eligible for free tier. Eligible types: ${limits.instanceTypes.join(', ')}`,
      monthlySavings: 0,
      optimizations: [{
        type: 'instance-type',
        title: 'Switch to Free Tier Eligible RDS Instance',
        description: `Consider using ${limits.instanceTypes[0]} instead of ${instanceType}`,
        impact: 'high',
        potentialSavings: pricing.instances[instanceType]?.pricePerHour * limits.hours || 0
      }]
    };
  }
  
  const freeHours = Math.min(hoursNeeded, limits.hours);
  const freeStorage = Math.min(storageSize, limits.storage);
  
  const computeSavings = freeHours * (pricing.instances[instanceType]?.pricePerHour || 0);
  const storageSavings = freeStorage * pricing.storage.gp2.pricePerGBMonth;
  const monthlySavings = computeSavings + storageSavings;
  
  return {
    eligible: true,
    coverage: (withinHourLimit && withinStorageLimit) ? 'full' : 'partial',
    freeHours: freeHours,
    freeStorage: freeStorage,
    monthlySavings: monthlySavings,
    details: {
      instanceType: instanceType,
      hourLimit: limits.hours,
      storageLimit: limits.storage,
      usedHours: hoursNeeded,
      usedStorage: storageSize,
      remainingHours: Math.max(0, limits.hours - hoursNeeded),
      remainingStorage: Math.max(0, limits.storage - storageSize)
    }
  };
};

/**
 * Analyze DynamoDB free tier eligibility
 */
const analyzeDynamoDBFreeTier = (usage, configuration, limits, pricing) => {
  const storageGB = usage.monthly.storageUsage || 1;
  const billingMode = configuration.billingMode || 'provisioned';
  
  let monthlySavings = 0;
  let coverage = 'full';
  
  if (billingMode === 'provisioned') {
    const readCapacity = configuration.readCapacity || 5;
    const writeCapacity = configuration.writeCapacity || 5;
    
    const freeReadCapacity = Math.min(readCapacity, limits.readCapacity);
    const freeWriteCapacity = Math.min(writeCapacity, limits.writeCapacity);
    
    const readSavings = freeReadCapacity * pricing.provisioned.readCapacity * 730;
    const writeSavings = freeWriteCapacity * pricing.provisioned.writeCapacity * 730;
    
    monthlySavings += readSavings + writeSavings;
    
    if (readCapacity > limits.readCapacity || writeCapacity > limits.writeCapacity) {
      coverage = 'partial';
    }
  }
  
  const freeStorage = Math.min(storageGB, limits.storage);
  const storageSavings = freeStorage * pricing.onDemand.storage;
  monthlySavings += storageSavings;
  
  if (storageGB > limits.storage) {
    coverage = 'partial';
  }
  
  return {
    eligible: true,
    coverage: coverage,
    freeStorage: freeStorage,
    monthlySavings: monthlySavings,
    details: {
      storageLimit: limits.storage,
      capacityLimits: {
        read: limits.readCapacity,
        write: limits.writeCapacity
      },
      usedStorage: storageGB,
      remainingStorage: Math.max(0, limits.storage - storageGB)
    }
  };
};

/**
 * Analyze CloudFront free tier eligibility
 */
const analyzeCloudFrontFreeTier = (usage, limits, pricing) => {
  const dataTransfer = usage.monthly.dataTransfer || 10;
  const requests = usage.monthly.pageViews || 10000;
  
  const withinTransferLimit = dataTransfer <= limits.dataTransfer;
  const withinRequestLimit = requests <= limits.requests;
  
  const freeTransfer = Math.min(dataTransfer, limits.dataTransfer);
  const freeRequests = Math.min(requests, limits.requests);
  
  const transferSavings = freeTransfer * pricing.dataTransfer.northAmerica.first10TB;
  const requestSavings = (freeRequests / 10000) * pricing.requests.https;
  const monthlySavings = transferSavings + requestSavings;
  
  return {
    eligible: true,
    coverage: (withinTransferLimit && withinRequestLimit) ? 'full' : 'partial',
    freeTransfer: freeTransfer,
    freeRequests: freeRequests,
    monthlySavings: monthlySavings,
    details: {
      transferLimit: limits.dataTransfer,
      requestLimit: limits.requests,
      usedTransfer: dataTransfer,
      usedRequests: requests,
      remainingTransfer: Math.max(0, limits.dataTransfer - dataTransfer),
      remainingRequests: Math.max(0, limits.requests - requests)
    }
  };
};

/**
 * Analyze API Gateway free tier eligibility
 */
const analyzeAPIGatewayFreeTier = (usage, limits, pricing) => {
  const requests = usage.monthly.apiRequests || 100000;
  
  const withinRequestLimit = requests <= limits.requests;
  const freeRequests = Math.min(requests, limits.requests);
  const monthlySavings = (freeRequests / 1000000) * pricing.rest.requests;
  
  return {
    eligible: true,
    coverage: withinRequestLimit ? 'full' : 'partial',
    freeRequests: freeRequests,
    monthlySavings: monthlySavings,
    details: {
      requestLimit: limits.requests,
      usedRequests: requests,
      remainingRequests: Math.max(0, limits.requests - requests)
    }
  };
};

/**
 * Analyze CloudWatch free tier eligibility
 */
const analyzeCloudWatchFreeTier = (usage, limits, pricing) => {
  const metrics = 10;
  const alarms = 5;
  const logsGB = 1;
  
  const freeMetrics = Math.min(metrics, limits.metrics);
  const freeAlarms = Math.min(alarms, limits.alarms);
  const freeLogs = Math.min(logsGB, limits.logs);
  
  const metricSavings = freeMetrics * pricing.metrics.custom;
  const alarmSavings = freeAlarms * pricing.alarms.standard;
  const logSavings = freeLogs * pricing.logs.ingestion;
  const monthlySavings = metricSavings + alarmSavings + logSavings;
  
  return {
    eligible: true,
    coverage: (metrics <= limits.metrics && alarms <= limits.alarms && logsGB <= limits.logs) ? 'full' : 'partial',
    freeMetrics: freeMetrics,
    freeAlarms: freeAlarms,
    freeLogs: freeLogs,
    monthlySavings: monthlySavings,
    details: {
      metricLimit: limits.metrics,
      alarmLimit: limits.alarms,
      logLimit: limits.logs,
      usedMetrics: metrics,
      usedAlarms: alarms,
      usedLogs: logsGB
    }
  };
};

/**
 * Generate free tier recommendations
 * @param {Array} eligibleServices - Services eligible for free tier
 * @param {Array} ineligibleServices - Services not eligible for free tier
 * @param {Object} usage - Usage patterns
 * @returns {Array} Recommendations for maximizing free tier benefits
 */
const generateFreeTierRecommendations = (eligibleServices, ineligibleServices, usage) => {
  const recommendations = [];
  
  // Recommend enabling free tier if not already
  if (eligibleServices.length > 0) {
    recommendations.push({
      type: 'enable-free-tier',
      priority: 'high',
      title: 'Maximize Free Tier Benefits',
      description: `You can save $${eligibleServices.reduce((sum, s) => sum + s.monthlySavings, 0).toFixed(2)}/month by utilizing AWS Free Tier`,
      actions: [
        'Ensure you\'re using a new AWS account (free tier is for first 12 months)',
        'Monitor your free tier usage in the AWS Billing Console',
        'Set up billing alerts to avoid unexpected charges'
      ]
    });
  }
  
  // Recommend optimizations for ineligible services
  ineligibleServices.forEach(service => {
    if (service.optimizations) {
      service.optimizations.forEach(opt => {
        recommendations.push({
          type: 'optimization',
          priority: opt.impact === 'high' ? 'high' : 'medium',
          title: opt.title,
          description: opt.description,
          service: service.serviceId,
          potentialSavings: opt.potentialSavings
        });
      });
    }
  });
  
  // Recommend architecture changes for better free tier utilization
  if (usage.monthly.pageViews < 50000) {
    recommendations.push({
      type: 'architecture',
      priority: 'medium',
      title: 'Consider Serverless Architecture',
      description: 'For your traffic level, a serverless architecture could maximize free tier benefits',
      actions: [
        'Use Lambda instead of EC2 for compute',
        'Use DynamoDB instead of RDS for database',
        'Use S3 for static hosting instead of EC2'
      ]
    });
  }
  
  // Recommend monitoring and alerts
  recommendations.push({
    type: 'monitoring',
    priority: 'medium',
    title: 'Set Up Free Tier Monitoring',
    description: 'Monitor your free tier usage to avoid unexpected charges',
    actions: [
      'Enable AWS Free Tier usage alerts',
      'Set up billing alerts for $1, $5, and $10',
      'Review AWS Cost Explorer monthly',
      'Use AWS Budgets to track spending'
    ]
  });
  
  return recommendations;
};

/**
 * Calculate free tier utilization percentage
 * @param {Object} architecturePattern - Architecture pattern
 * @param {Object} usage - Usage patterns
 * @returns {Object} Free tier utilization analysis
 */
export const calculateFreeTierUtilization = (architecturePattern, usage) => {
  const analysis = analyzeFreeTierEligibility(architecturePattern, usage);
  
  let totalUtilization = 0;
  let serviceCount = 0;
  
  analysis.eligibleServices.forEach(service => {
    if (service.details) {
      let serviceUtilization = 0;
      
      // Calculate utilization based on service type
      switch (service.serviceId) {
        case 'ec2':
          serviceUtilization = Math.min(1, service.details.usedHours / service.details.eligibleHours);
          break;
        case 'lambda':
          const requestUtil = service.details.usedRequests / service.details.requestLimit;
          const computeUtil = service.details.usedGBSeconds / service.details.computeLimit;
          serviceUtilization = Math.max(requestUtil, computeUtil);
          break;
        case 's3':
          const storageUtil = service.details.usedStorage / service.details.storageLimit;
          const s3RequestUtil = Math.max(
            service.details.usedRequests.get / service.details.requestLimits.get,
            service.details.usedRequests.put / service.details.requestLimits.put
          );
          serviceUtilization = Math.max(storageUtil, s3RequestUtil);
          break;
        default:
          serviceUtilization = 0.5; // Default assumption
      }
      
      totalUtilization += Math.min(1, serviceUtilization);
      serviceCount++;
    }
  });
  
  const averageUtilization = serviceCount > 0 ? totalUtilization / serviceCount : 0;
  
  return {
    averageUtilization: averageUtilization,
    utilizationPercentage: Math.round(averageUtilization * 100),
    status: averageUtilization < 0.5 ? 'under-utilized' : 
            averageUtilization < 0.8 ? 'well-utilized' : 'near-limit',
    recommendations: generateUtilizationRecommendations(averageUtilization, analysis)
  };
};

/**
 * Generate utilization recommendations
 */
const generateUtilizationRecommendations = (utilization, analysis) => {
  const recommendations = [];
  
  if (utilization < 0.3) {
    recommendations.push({
      type: 'under-utilized',
      title: 'Free Tier Under-Utilized',
      description: 'You\'re not fully utilizing your free tier benefits',
      suggestion: 'Consider expanding your application or adding more features'
    });
  } else if (utilization > 0.8) {
    recommendations.push({
      type: 'near-limit',
      title: 'Approaching Free Tier Limits',
      description: 'You\'re close to exceeding free tier limits',
      suggestion: 'Monitor usage closely and consider optimization strategies'
    });
  }
  
  return recommendations;
};

export default {
  analyzeFreeTierEligibility,
  calculateFreeTierUtilization
};