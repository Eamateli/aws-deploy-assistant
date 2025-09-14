// AWS Cost Calculator Engine
// Comprehensive cost calculation with traffic-based algorithms and free tier optimization

import { 
  awsServicePricing, 
  awsRegions, 
  freeTierLimits, 
  trafficPatterns,
  currencyRates 
} from '../data/awsPricing.js';

/**
 * Calculate costs for an architecture pattern
 * @param {Object} architecturePattern - Architecture pattern with services
 * @param {Object} options - Calculation options
 * @returns {Object} Detailed cost breakdown
 */
export const calculateArchitectureCosts = (architecturePattern, options = {}) => {
  const {
    region = 'us-east-1',
    trafficLevel = 'medium',
    currency = 'USD',
    includeFreeTier = true,
    customUsage = null
  } = options;

  const usage = customUsage || trafficPatterns[trafficLevel];
  const regionInfo = awsRegions[region];
  const currencyInfo = currencyRates[currency];

  const serviceCosts = [];
  let totalMonthlyCost = 0;
  let freeTierSavings = 0;

  // Calculate cost for each service in the architecture
  for (const service of architecturePattern.services) {
    const serviceCost = calculateServiceCost(
      service.serviceId,
      usage,
      region,
      includeFreeTier,
      service.configuration
    );

    serviceCosts.push({
      serviceId: service.serviceId,
      serviceName: awsServicePricing[service.serviceId]?.name || service.serviceId,
      purpose: service.purpose,
      ...serviceCost
    });

    totalMonthlyCost += serviceCost.monthlyCost;
    freeTierSavings += serviceCost.freeTierSavings || 0;
  }

  // Apply regional pricing multiplier
  const regionalMultiplier = regionInfo?.multiplier || 1.0;
  totalMonthlyCost *= regionalMultiplier;

  // Convert to target currency
  const convertedCost = totalMonthlyCost * currencyInfo.rate;
  const convertedSavings = freeTierSavings * currencyInfo.rate;

  return {
    totalMonthlyCost: convertedCost,
    freeTierSavings: convertedSavings,
    netMonthlyCost: convertedCost - convertedSavings,
    currency: currency,
    currencySymbol: currencyInfo.symbol,
    region: region,
    regionName: regionInfo?.name || region,
    trafficLevel: trafficLevel,
    usage: usage,
    serviceCosts: serviceCosts,
    breakdown: {
      compute: serviceCosts.filter(s => awsServicePricing[s.serviceId]?.category === 'compute')
        .reduce((sum, s) => sum + s.monthlyCost, 0),
      storage: serviceCosts.filter(s => awsServicePricing[s.serviceId]?.category === 'storage')
        .reduce((sum, s) => sum + s.monthlyCost, 0),
      networking: serviceCosts.filter(s => awsServicePricing[s.serviceId]?.category === 'networking')
        .reduce((sum, s) => sum + s.monthlyCost, 0),
      database: serviceCosts.filter(s => awsServicePricing[s.serviceId]?.category === 'database')
        .reduce((sum, s) => sum + s.monthlyCost, 0),
      other: serviceCosts.filter(s => !['compute', 'storage', 'networking', 'database']
        .includes(awsServicePricing[s.serviceId]?.category))
        .reduce((sum, s) => sum + s.monthlyCost, 0)
    },
    optimizations: generateCostOptimizations(serviceCosts, usage, includeFreeTier)
  };
};

/**
 * Calculate cost for a specific AWS service
 * @param {string} serviceId - AWS service identifier
 * @param {Object} usage - Usage patterns
 * @param {string} region - AWS region
 * @param {boolean} includeFreeTier - Whether to apply free tier
 * @param {Object} configuration - Service configuration
 * @returns {Object} Service cost breakdown
 */
export const calculateServiceCost = (serviceIdOrService, usage, region = 'us-east-1', includeFreeTier = true, configuration = {}) => {
  // Handle both old interface (service object) and new interface (serviceId string)
  let serviceId, serviceConfig;
  
  if (typeof serviceIdOrService === 'string') {
    serviceId = serviceIdOrService;
    serviceConfig = configuration;
  } else {
    // Legacy interface - service object
    const service = serviceIdOrService;
    serviceId = service.service?.toLowerCase() || service.serviceId;
    serviceConfig = service.config || {};
    
    // Map legacy traffic object to usage
    if (usage && !usage.monthly) {
      usage = {
        monthly: {
          pageViews: usage.monthlyPageviews || usage.pageViews || serviceConfig.requests || 0,
          uniqueUsers: usage.monthlyUniqueUsers || usage.uniqueUsers || 0,
          dataTransfer: usage.dataTransfer || 0,
          apiRequests: usage.monthlyApiCalls || usage.apiRequests || serviceConfig.monthlyInvocations || 0,
          storageUsage: usage.storageUsage || serviceConfig.storage || 0,
          computeHours: usage.computeHours || 730
        }
      };
    }
  }

  const pricing = awsServicePricing[serviceId];
  if (!pricing) {
    return {
      monthlyCost: 0,
      monthly: 0, // Legacy compatibility
      breakdown: {},
      error: serviceId === 'unknownservice' ? 'Unknown service type' : `Pricing not available for service: ${serviceId}`,
      freeTierEligible: false
    };
  }

  let result;
  switch (serviceId) {
    case 'ec2':
      result = calculateEC2Cost(usage, pricing, includeFreeTier, serviceConfig);
      break;
    case 'lambda':
      result = calculateLambdaCost(usage, pricing, includeFreeTier, serviceConfig);
      break;
    case 'ecs':
      result = calculateECSCost(usage, pricing, includeFreeTier, serviceConfig);
      break;
    case 's3':
      result = calculateS3Cost(usage, pricing, includeFreeTier);
      break;
    case 'rds':
      result = calculateRDSCost(usage, pricing, includeFreeTier, serviceConfig);
      break;
    case 'dynamodb':
      result = calculateDynamoDBCost(usage, pricing, includeFreeTier, serviceConfig);
      break;
    case 'cloudfront':
      result = calculateCloudFrontCost(usage, pricing, includeFreeTier);
      break;
    case 'alb':
      result = calculateALBCost(usage, pricing);
      break;
    case 'api-gateway':
      result = calculateAPIGatewayCost(usage, pricing, includeFreeTier);
      break;
    case 'route53':
      result = calculateRoute53Cost(usage, pricing);
      break;
    case 'cognito':
      result = calculateCognitoCost(usage, pricing, includeFreeTier);
      break;
    case 'cloudwatch':
      result = calculateCloudWatchCost(usage, pricing, includeFreeTier);
      break;
    default:
      result = {
        monthlyCost: 0,
        breakdown: {},
        error: `Cost calculation not implemented for service: ${serviceId}`
      };
  }

  // Add legacy compatibility fields
  if (result && !result.monthly) {
    result.monthly = result.monthlyCost;
  }
  if (result && result.freeTierSavings > 0) {
    result.freeTierEligible = true;
  }

  return result;
};

/**
 * Calculate EC2 costs
 */
const calculateEC2Cost = (usage, pricing, includeFreeTier, configuration = {}) => {
  const instanceType = configuration.instanceType || 't3.small';
  const instanceCount = configuration.instanceCount || 1;
  const storageSize = configuration.storageSize || 20; // GB
  
  const instance = pricing.instances[instanceType];
  if (!instance) {
    return { monthlyCost: 0, error: `Unknown instance type: ${instanceType}` };
  }

  const hoursPerMonth = 730; // Average hours per month
  let computeCost = instance.pricePerHour * hoursPerMonth * instanceCount;
  let storageCost = pricing.storage.gp3.pricePerGBMonth * storageSize;
  
  let freeTierSavings = 0;
  
  if (includeFreeTier && instance.freeTierEligible) {
    const freeTierHours = Math.min(usage.monthly?.computeHours || 730, freeTierLimits.ec2.hours);
    freeTierSavings = instance.pricePerHour * freeTierHours;
    computeCost = Math.max(0, computeCost - freeTierSavings);
  }

  return {
    monthlyCost: computeCost + storageCost,
    freeTierSavings: freeTierSavings,
    breakdown: {
      compute: computeCost,
      storage: storageCost,
      instanceType: instanceType,
      instanceCount: instanceCount,
      storageSize: storageSize
    }
  };
};

/**
 * Calculate Lambda costs
 */
const calculateLambdaCost = (usage, pricing, includeFreeTier, configuration = {}) => {
  const requests = usage.monthly?.apiRequests || configuration.monthlyInvocations || 100000;
  const avgDuration = configuration.averageExecutionTime || 200; // ms
  const memorySize = configuration.memorySize || 512; // MB
  
  const gbSeconds = (requests * avgDuration / 1000) * (memorySize / 1024);
  
  let requestCost = requests * pricing.pricing.requests;
  let computeCost = gbSeconds * pricing.pricing.computeTime;
  
  let freeTierSavings = 0;
  
  if (includeFreeTier) {
    const freeRequests = Math.min(requests, freeTierLimits.lambda.requests);
    const freeGBSeconds = Math.min(gbSeconds, freeTierLimits.lambda.computeTime);
    
    freeTierSavings = (freeRequests * pricing.pricing.requests) + 
                     (freeGBSeconds * pricing.pricing.computeTime);
    
    requestCost = Math.max(0, requestCost - (freeRequests * pricing.pricing.requests));
    computeCost = Math.max(0, computeCost - (freeGBSeconds * pricing.pricing.computeTime));
  }

  return {
    monthlyCost: requestCost + computeCost,
    freeTierSavings: freeTierSavings,
    breakdown: {
      invocations: requestCost, // Legacy compatibility
      duration: computeCost, // Legacy compatibility
      requests: requestCost,
      compute: computeCost,
      totalRequests: requests,
      gbSeconds: gbSeconds,
      memorySize: memorySize
    }
  };
};

/**
 * Calculate ECS Fargate costs
 */
const calculateECSCost = (usage, pricing, includeFreeTier, configuration = {}) => {
  const vcpu = configuration.vcpu || 0.25;
  const memory = configuration.memory || 0.5; // GB
  const hoursPerMonth = usage.monthly?.computeHours || 730;
  
  const vcpuCost = vcpu * pricing.fargate.vcpu * hoursPerMonth;
  const memoryCost = memory * pricing.fargate.memory * hoursPerMonth;
  
  return {
    monthlyCost: vcpuCost + memoryCost,
    freeTierSavings: 0, // ECS Fargate doesn't have free tier
    breakdown: {
      vcpu: vcpuCost,
      memory: memoryCost,
      vcpuAmount: vcpu,
      memoryAmount: memory,
      hours: hoursPerMonth
    }
  };
};

/**
 * Calculate S3 costs
 */
const calculateS3Cost = (usage, pricing, includeFreeTier) => {
  const storageGB = usage.monthly?.storageUsage || 5;
  const getRequests = usage.monthly?.pageViews || 1000;
  const putRequests = Math.ceil(getRequests * 0.1); // Assume 10% put requests
  const dataTransferGB = usage.monthly?.dataTransfer || 1;
  
  let storageCost = storageGB * pricing.storage.standard.first50TB;
  let requestCost = (getRequests / 1000 * pricing.requests.get) + 
                   (putRequests / 1000 * pricing.requests.put);
  let transferCost = calculateS3DataTransferCost(dataTransferGB, pricing.dataTransfer);
  
  let freeTierSavings = 0;
  
  if (includeFreeTier) {
    const freeStorage = Math.min(storageGB, freeTierLimits.s3.storage);
    const freeGetRequests = Math.min(getRequests, freeTierLimits.s3.requests.get);
    const freePutRequests = Math.min(putRequests, freeTierLimits.s3.requests.put);
    const freeTransfer = Math.min(dataTransferGB, freeTierLimits.s3.dataTransfer);
    
    freeTierSavings = (freeStorage * pricing.storage.standard.first50TB) +
                     (freeGetRequests / 1000 * pricing.requests.get) +
                     (freePutRequests / 1000 * pricing.requests.put) +
                     (freeTransfer * pricing.dataTransfer.out.next9GB);
    
    storageCost = Math.max(0, storageCost - (freeStorage * pricing.storage.standard.first50TB));
    requestCost = Math.max(0, requestCost - 
      ((freeGetRequests / 1000 * pricing.requests.get) + 
       (freePutRequests / 1000 * pricing.requests.put)));
    transferCost = Math.max(0, transferCost - (freeTransfer * pricing.dataTransfer.out.next9GB));
  }

  return {
    monthlyCost: storageCost + requestCost + transferCost,
    freeTierSavings: freeTierSavings,
    breakdown: {
      storage: storageCost,
      requests: requestCost,
      dataTransfer: transferCost,
      storageGB: storageGB,
      getRequests: getRequests,
      putRequests: putRequests,
      transferGB: dataTransferGB
    }
  };
};

/**
 * Calculate S3 data transfer costs with tiered pricing
 */
const calculateS3DataTransferCost = (dataTransferGB, pricing) => {
  let cost = 0;
  let remaining = dataTransferGB;
  
  // First 1GB is free
  if (remaining > 1) {
    remaining -= 1;
    
    // Next 9GB
    const next9GB = Math.min(remaining, 9);
    cost += next9GB * pricing.out.next9GB;
    remaining -= next9GB;
    
    // Next 40GB
    if (remaining > 0) {
      const next40GB = Math.min(remaining, 40);
      cost += next40GB * pricing.out.next40GB;
      remaining -= next40GB;
      
      // Next 100GB
      if (remaining > 0) {
        const next100GB = Math.min(remaining, 100);
        cost += next100GB * pricing.out.next100GB;
        remaining -= next100GB;
        
        // Over 150GB
        if (remaining > 0) {
          cost += remaining * pricing.out.over150GB;
        }
      }
    }
  }
  
  return cost;
};

/**
 * Calculate RDS costs
 */
const calculateRDSCost = (usage, pricing, includeFreeTier, configuration = {}) => {
  const instanceType = configuration.instanceType || 'db.t3.micro';
  const storageSize = configuration.storageSize || 20; // GB
  const backupRetention = configuration.backupRetention || 7; // days
  
  const instance = pricing.instances[instanceType];
  if (!instance) {
    return { monthlyCost: 0, error: `Unknown RDS instance type: ${instanceType}` };
  }

  const hoursPerMonth = 730;
  let computeCost = instance.pricePerHour * hoursPerMonth;
  let storageCost = storageSize * pricing.storage.gp2.pricePerGBMonth;
  let backupCost = (storageSize * backupRetention / 30) * pricing.backup.pricePerGBMonth;
  
  let freeTierSavings = 0;
  
  if (includeFreeTier && instance.freeTierEligible) {
    const freeTierHours = Math.min(hoursPerMonth, freeTierLimits.rds.hours);
    const freeTierStorage = Math.min(storageSize, freeTierLimits.rds.storage);
    
    freeTierSavings = (freeTierHours * instance.pricePerHour) + 
                     (freeTierStorage * pricing.storage.gp2.pricePerGBMonth);
    
    computeCost = Math.max(0, computeCost - (freeTierHours * instance.pricePerHour));
    storageCost = Math.max(0, storageCost - (freeTierStorage * pricing.storage.gp2.pricePerGBMonth));
  }

  return {
    monthlyCost: computeCost + storageCost + backupCost,
    freeTierSavings: freeTierSavings,
    breakdown: {
      instance: computeCost, // Legacy compatibility
      storage: storageCost,
      backup: backupCost,
      compute: computeCost,
      instanceType: instanceType,
      storageSize: storageSize,
      backupRetention: backupRetention
    }
  };
};

/**
 * Calculate DynamoDB costs
 */
const calculateDynamoDBCost = (usage, pricing, includeFreeTier, configuration = {}) => {
  const billingMode = configuration.billingMode || 'on-demand';
  const storageGB = usage.monthly?.storageUsage || 1;
  
  let cost = 0;
  let freeTierSavings = 0;
  const breakdown = { storage: 0 };
  
  if (billingMode === 'on-demand') {
    const readRequests = (usage.monthly?.apiRequests || 0) * 0.7; // 70% reads
    const writeRequests = (usage.monthly?.apiRequests || 0) * 0.3; // 30% writes
    
    const readCost = (readRequests / 1000000) * pricing.onDemand.readRequests;
    const writeCost = (writeRequests / 1000000) * pricing.onDemand.writeRequests;
    
    breakdown.reads = readCost;
    breakdown.writes = writeCost;
    cost = readCost + writeCost;
  } else {
    // Provisioned capacity
    const readCapacity = configuration.readCapacity || 5;
    const writeCapacity = configuration.writeCapacity || 5;
    
    const readCost = readCapacity * pricing.provisioned.readCapacity * 730;
    const writeCost = writeCapacity * pricing.provisioned.writeCapacity * 730;
    
    breakdown.readCapacity = readCost;
    breakdown.writeCapacity = writeCost;
    cost = readCost + writeCost;
    
    if (includeFreeTier) {
      const freeReadCapacity = Math.min(readCapacity, freeTierLimits.dynamodb.readCapacity);
      const freeWriteCapacity = Math.min(writeCapacity, freeTierLimits.dynamodb.writeCapacity);
      
      freeTierSavings = (freeReadCapacity * pricing.provisioned.readCapacity * 730) +
                       (freeWriteCapacity * pricing.provisioned.writeCapacity * 730);
      
      cost = Math.max(0, cost - freeTierSavings);
    }
  }
  
  // Storage cost
  let storageCost = storageGB * pricing.onDemand.storage;
  
  if (includeFreeTier) {
    const freeStorage = Math.min(storageGB, freeTierLimits.dynamodb.storage);
    const freeStorageCost = freeStorage * pricing.onDemand.storage;
    freeTierSavings += freeStorageCost;
    storageCost = Math.max(0, storageCost - freeStorageCost);
  }
  
  breakdown.storage = storageCost;
  
  return {
    monthlyCost: cost + storageCost,
    freeTierSavings: freeTierSavings,
    breakdown: breakdown
  };
};

/**
 * Calculate CloudFront costs
 */
const calculateCloudFrontCost = (usage, pricing, includeFreeTier) => {
  const dataTransferGB = usage.monthly?.dataTransfer || 10;
  const requests = usage.monthly?.pageViews || 10000;
  
  // Assume North America pricing for simplicity
  let transferCost = calculateCloudFrontDataTransferCost(dataTransferGB, pricing.dataTransfer.northAmerica);
  let requestCost = (requests / 10000) * pricing.requests.https;
  
  let freeTierSavings = 0;
  
  if (includeFreeTier) {
    const freeTransfer = Math.min(dataTransferGB, freeTierLimits.cloudfront.dataTransfer);
    const freeRequests = Math.min(requests, freeTierLimits.cloudfront.requests);
    
    freeTierSavings = (freeTransfer * pricing.dataTransfer.northAmerica.first10TB) +
                     ((freeRequests / 10000) * pricing.requests.https);
    
    transferCost = Math.max(0, transferCost - (freeTransfer * pricing.dataTransfer.northAmerica.first10TB));
    requestCost = Math.max(0, requestCost - ((freeRequests / 10000) * pricing.requests.https));
  }

  return {
    monthlyCost: transferCost + requestCost,
    freeTierSavings: freeTierSavings,
    breakdown: {
      dataTransfer: transferCost,
      requests: requestCost,
      transferGB: dataTransferGB,
      totalRequests: requests
    }
  };
};

/**
 * Calculate CloudFront data transfer costs with tiered pricing
 */
const calculateCloudFrontDataTransferCost = (dataTransferGB, regionPricing) => {
  let cost = 0;
  let remaining = dataTransferGB;
  
  // First 10TB
  const first10TB = Math.min(remaining, 10240); // 10TB in GB
  cost += first10TB * regionPricing.first10TB;
  remaining -= first10TB;
  
  if (remaining > 0) {
    // Next 40TB
    const next40TB = Math.min(remaining, 40960);
    cost += next40TB * regionPricing.next40TB;
    remaining -= next40TB;
    
    if (remaining > 0) {
      // Next 100TB
      const next100TB = Math.min(remaining, 102400);
      cost += next100TB * regionPricing.next100TB;
      remaining -= next100TB;
      
      if (remaining > 0) {
        // Over 150TB
        cost += remaining * regionPricing.over500TB;
      }
    }
  }
  
  return cost;
};

/**
 * Calculate Application Load Balancer costs
 */
const calculateALBCost = (usage, pricing) => {
  const hoursPerMonth = 730;
  const lcuHours = Math.max(1, Math.ceil((usage.monthly?.pageViews || 0) / 25000)); // Rough LCU estimation
  
  const hourlyCost = pricing.pricing.hourly * hoursPerMonth;
  const lcuCost = pricing.pricing.lcu * lcuHours * hoursPerMonth;
  
  return {
    monthlyCost: hourlyCost + lcuCost,
    freeTierSavings: 0,
    breakdown: {
      hourly: hourlyCost,
      lcu: lcuCost,
      lcuHours: lcuHours
    }
  };
};

/**
 * Calculate API Gateway costs
 */
const calculateAPIGatewayCost = (usage, pricing, includeFreeTier) => {
  const requests = usage.monthly?.apiRequests || 100000;
  
  let requestCost = (requests / 1000000) * pricing.rest.requests;
  let freeTierSavings = 0;
  
  if (includeFreeTier) {
    const freeRequests = Math.min(requests, freeTierLimits.apiGateway.requests);
    freeTierSavings = (freeRequests / 1000000) * pricing.rest.requests;
    requestCost = Math.max(0, requestCost - freeTierSavings);
  }

  return {
    monthlyCost: requestCost,
    freeTierSavings: freeTierSavings,
    breakdown: {
      requests: requestCost,
      totalRequests: requests
    }
  };
};

/**
 * Calculate Route 53 costs
 */
const calculateRoute53Cost = (usage, pricing) => {
  const hostedZones = 1;
  const queries = usage.monthly?.pageViews || 10000;
  
  const hostedZoneCost = hostedZones * pricing.pricing.hostedZone;
  const queryCost = (queries / 1000000) * pricing.pricing.queries.standard;
  
  return {
    monthlyCost: hostedZoneCost + queryCost,
    freeTierSavings: 0,
    breakdown: {
      hostedZones: hostedZoneCost,
      queries: queryCost,
      totalQueries: queries
    }
  };
};

/**
 * Calculate Cognito costs
 */
const calculateCognitoCost = (usage, pricing, includeFreeTier) => {
  const mau = usage.monthly?.uniqueUsers || 1000;
  
  let mauCost = mau * pricing.userPools.mau;
  let freeTierSavings = 0;
  
  if (includeFreeTier) {
    const freeMau = Math.min(mau, pricing.userPools.freeTier);
    freeTierSavings = freeMau * pricing.userPools.mau;
    mauCost = Math.max(0, mauCost - freeTierSavings);
  }

  return {
    monthlyCost: mauCost,
    freeTierSavings: freeTierSavings,
    breakdown: {
      mau: mauCost,
      totalMau: mau
    }
  };
};

/**
 * Calculate CloudWatch costs
 */
const calculateCloudWatchCost = (usage, pricing, includeFreeTier) => {
  const metrics = 10; // Assume 10 custom metrics
  const alarms = 5; // Assume 5 alarms
  const logsGB = 1; // Assume 1GB of logs
  
  let metricCost = metrics * pricing.metrics.custom;
  let alarmCost = alarms * pricing.alarms.standard;
  let logCost = logsGB * pricing.logs.ingestion;
  
  let freeTierSavings = 0;
  
  if (includeFreeTier) {
    const freeMetrics = Math.min(metrics, freeTierLimits.cloudwatch.metrics);
    const freeAlarms = Math.min(alarms, freeTierLimits.cloudwatch.alarms);
    const freeLogs = Math.min(logsGB, freeTierLimits.cloudwatch.logs);
    
    freeTierSavings = (freeMetrics * pricing.metrics.custom) +
                     (freeAlarms * pricing.alarms.standard) +
                     (freeLogs * pricing.logs.ingestion);
    
    metricCost = Math.max(0, metricCost - (freeMetrics * pricing.metrics.custom));
    alarmCost = Math.max(0, alarmCost - (freeAlarms * pricing.alarms.standard));
    logCost = Math.max(0, logCost - (freeLogs * pricing.logs.ingestion));
  }

  return {
    monthlyCost: metricCost + alarmCost + logCost,
    freeTierSavings: freeTierSavings,
    breakdown: {
      metrics: metricCost,
      alarms: alarmCost,
      logs: logCost,
      totalMetrics: metrics,
      totalAlarms: alarms,
      totalLogsGB: logsGB
    }
  };
};

/**
 * Generate cost optimization recommendations
 * @param {Array} serviceCosts - Array of service cost breakdowns
 * @param {Object} usage - Usage patterns
 * @param {boolean} includeFreeTier - Whether free tier is included
 * @returns {Array} Optimization recommendations
 */
const generateCostOptimizations = (serviceCosts, usage, includeFreeTier) => {
  const optimizations = [];
  
  // Check for free tier opportunities
  if (!includeFreeTier) {
    optimizations.push({
      type: 'free-tier',
      title: 'Enable Free Tier Benefits',
      description: 'You could save money by utilizing AWS Free Tier for eligible services',
      impact: 'high',
      savings: 'Up to $50-100/month for the first 12 months'
    });
  }
  
  // Check for over-provisioned resources
  serviceCosts.forEach(service => {
    if (service.serviceId === 'ec2' && service.breakdown.instanceType?.includes('large')) {
      optimizations.push({
        type: 'rightsizing',
        title: 'Consider Smaller EC2 Instances',
        description: `Your ${service.breakdown.instanceType} instance might be over-provisioned for ${usage.name} traffic`,
        impact: 'medium',
        savings: 'Up to 50% on compute costs'
      });
    }
    
    if (service.serviceId === 'rds' && service.breakdown.storageSize > usage.monthly.storageUsage * 5) {
      optimizations.push({
        type: 'storage',
        title: 'Optimize RDS Storage',
        description: 'Your RDS storage allocation seems higher than needed',
        impact: 'low',
        savings: 'Up to 20% on database costs'
      });
    }
  });
  
  // Check for serverless opportunities
  const hasEC2 = serviceCosts.some(s => s.serviceId === 'ec2');
  const hasLambda = serviceCosts.some(s => s.serviceId === 'lambda');
  
  if (hasEC2 && !hasLambda && usage.monthly.pageViews < 100000) {
    optimizations.push({
      type: 'serverless',
      title: 'Consider Serverless Architecture',
      description: 'For your traffic level, serverless could be more cost-effective',
      impact: 'high',
      savings: 'Up to 70% for low-traffic applications'
    });
  }
  
  // Check for reserved instance opportunities
  const ec2Service = serviceCosts.find(s => s.serviceId === 'ec2');
  if (ec2Service && ec2Service.monthlyCost > 50) {
    optimizations.push({
      type: 'reserved-instances',
      title: 'Consider Reserved Instances',
      description: 'For consistent workloads, Reserved Instances offer significant savings',
      impact: 'high',
      savings: 'Up to 75% compared to On-Demand pricing'
    });
  }
  
  return optimizations;
};

/**
 * Compare costs across different traffic levels
 * @param {Object} architecturePattern - Architecture pattern
 * @param {Object} options - Base options
 * @returns {Object} Cost comparison across traffic levels
 */
export const compareTrafficCosts = (architecturePattern, options = {}) => {
  const trafficLevels = ['low', 'medium', 'high', 'enterprise'];
  const comparison = {};
  
  trafficLevels.forEach(level => {
    comparison[level] = calculateArchitectureCosts(architecturePattern, {
      ...options,
      trafficLevel: level
    });
  });
  
  return comparison;
};

/**
 * Calculate cost projections over time
 * @param {Object} architecturePattern - Architecture pattern
 * @param {Object} options - Calculation options
 * @param {number} months - Number of months to project
 * @returns {Array} Monthly cost projections
 */
export const calculateCostProjections = (architecturePattern, options = {}, months = 12) => {
  const projections = [];
  const baseTrafficLevel = options.trafficLevel || 'medium';
  
  for (let month = 1; month <= months; month++) {
    // Simulate traffic growth over time
    const growthFactor = 1 + (month - 1) * 0.1; // 10% growth per month
    const adjustedUsage = {
      ...trafficPatterns[baseTrafficLevel],
      monthly: {
        ...trafficPatterns[baseTrafficLevel].monthly,
        pageViews: Math.floor(trafficPatterns[baseTrafficLevel].monthly.pageViews * growthFactor),
        uniqueUsers: Math.floor(trafficPatterns[baseTrafficLevel].monthly.uniqueUsers * growthFactor),
        apiRequests: Math.floor(trafficPatterns[baseTrafficLevel].monthly.apiRequests * growthFactor),
        dataTransfer: Math.floor(trafficPatterns[baseTrafficLevel].monthly.dataTransfer * growthFactor)
      }
    };
    
    const costs = calculateArchitectureCosts(architecturePattern, {
      ...options,
      customUsage: adjustedUsage,
      includeFreeTier: month <= 12 // Free tier only for first 12 months
    });
    
    projections.push({
      month: month,
      costs: costs,
      usage: adjustedUsage,
      growthFactor: growthFactor
    });
  }
  
  return projections;
};

// Export individual functions for testing
export { calculateServiceCost };

export const calculateArchitectureCost = (architecture, traffic, options = {}) => {
  const services = architecture.services || [];
  let totalCost = 0;
  const serviceCosts = [];

  // Convert traffic to usage format if needed
  const usage = traffic.monthly ? traffic : {
    monthly: {
      pageViews: traffic.monthlyPageviews || traffic.pageViews || 0,
      uniqueUsers: traffic.monthlyUniqueUsers || traffic.uniqueUsers || 0,
      dataTransfer: traffic.dataTransfer || 0,
      apiRequests: traffic.monthlyApiCalls || traffic.apiRequests || 0,
      storageUsage: traffic.storageUsage || 0,
      computeHours: traffic.computeHours || 730
    }
  };

  services.forEach(service => {
    const serviceId = service.serviceId || service.service;
    const cost = calculateServiceCost(serviceId, usage, options.region, options.includeFreeTier, service.configuration || service.config);
    serviceCosts.push({
      service: service.service || serviceId,
      serviceId: serviceId,
      ...cost
    });
    totalCost += cost.monthlyCost || 0;
  });

  return {
    total: { monthly: totalCost },
    services: serviceCosts,
    range: {
      min: totalCost * 0.8,
      typical: totalCost,
      max: totalCost * 1.5
    },
    annual: totalCost * 12,
    freeTierSavings: serviceCosts.reduce((sum, s) => sum + (s.freeTierSavings || 0), 0)
  };
};

export const optimizeCostForTraffic = (architecture, traffic) => {
  const recommendations = [];

  if (traffic.monthlyPageviews > 500000 && traffic.predictableLoad) {
    recommendations.push({
      type: 'reserved-instances',
      savings: 0.3 // 30% savings
    });
  }

  if (architecture.services?.some(s => s.service === 'EC2' && s.config?.workloadType === 'batch')) {
    recommendations.push({
      type: 'spot-instances',
      savings: 0.7 // 70% savings
    });
  }

  if (traffic.monthlyPageviews < 5000 && traffic.irregular) {
    recommendations.push({
      type: 'serverless-migration',
      newServices: ['Lambda']
    });
  }

  return { recommendations };
};

export const calculateFreeTierSavings = (usage) => {
  const savings = { total: 0 };

  if (usage.S3) {
    savings.S3 = {
      storage: Math.min(usage.S3.storage, 5) * 0.023,
      requests: Math.min(usage.S3.requests, 20000) * 0.0004 / 1000
    };
    savings.total += savings.S3.storage + savings.S3.requests;
  }

  if (usage.Lambda) {
    savings.Lambda = {
      invocations: Math.min(usage.Lambda.invocations, 1000000) * 0.0000002,
      duration: Math.min(usage.Lambda.gbSeconds, 400000) * 0.0000166667
    };
    savings.total += savings.Lambda.invocations + savings.Lambda.duration;
  }

  return savings;
};

export default {
  calculateArchitectureCosts,
  calculateServiceCost,
  compareTrafficCosts,
  calculateCostProjections,
  calculateArchitectureCost,
  optimizeCostForTraffic,
  calculateFreeTierSavings
};