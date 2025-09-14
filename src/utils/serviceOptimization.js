// Service Selection and Optimization Logic
// Advanced algorithms for optimizing AWS service selection based on user preferences

import { awsServices, architecturePatterns } from '../data/architecturePatterns';

/**
 * Service Optimization Engine
 * Optimizes service selection based on cost, performance, and simplicity preferences
 */
export class ServiceOptimizer {
  constructor() {
    this.services = awsServices;
    this.patterns = architecturePatterns;
    this.optimizationStrategies = {
      cost: this.optimizeForCost.bind(this),
      performance: this.optimizeForPerformance.bind(this),
      simplicity: this.optimizeForSimplicity.bind(this),
      scalability: this.optimizeForScalability.bind(this)
    };
  }

  /**
   * Generate optimized service recommendations
   * @param {Object} basePattern - Base architecture pattern
   * @param {Object} requirements - Application requirements
   * @param {Object} preferences - User optimization preferences
   * @returns {Array} Array of optimized architecture variants
   */
  generateOptimizedVariants(basePattern, requirements, preferences = {}) {
    const variants = [];
    
    // Generate base recommendation
    const baseRecommendation = this.createBaseRecommendation(basePattern, requirements);
    variants.push(baseRecommendation);

    // Generate optimization variants based on preferences
    if (preferences.cost_priority >= 4) {
      const costOptimized = this.optimizeForCost(basePattern, requirements, preferences);
      if (costOptimized && this.isDifferentFromBase(costOptimized, baseRecommendation)) {
        variants.push(costOptimized);
      }
    }

    if (preferences.performance_requirements >= 4) {
      const performanceOptimized = this.optimizeForPerformance(basePattern, requirements, preferences);
      if (performanceOptimized && this.isDifferentFromBase(performanceOptimized, baseRecommendation)) {
        variants.push(performanceOptimized);
      }
    }

    if (preferences.complexity_tolerance <= 2) {
      const simplicityOptimized = this.optimizeForSimplicity(basePattern, requirements, preferences);
      if (simplicityOptimized && this.isDifferentFromBase(simplicityOptimized, baseRecommendation)) {
        variants.push(simplicityOptimized);
      }
    }

    // Always generate a scalability-optimized variant for comparison
    const scalabilityOptimized = this.optimizeForScalability(basePattern, requirements, preferences);
    if (scalabilityOptimized && this.isDifferentFromBase(scalabilityOptimized, baseRecommendation)) {
      variants.push(scalabilityOptimized);
    }

    // Rank variants by overall suitability
    return this.rankVariants(variants, requirements, preferences);
  }

  /**
   * Create base recommendation without optimization
   */
  createBaseRecommendation(pattern, requirements) {
    const services = this.selectBaseServices(pattern, requirements);
    
    return {
      id: `${pattern.id}-base`,
      name: pattern.name,
      description: pattern.description,
      variant: 'base',
      pattern,
      services,
      characteristics: { ...pattern.characteristics },
      costEstimate: this.calculateTotalCost(services, requirements),
      pros: [...pattern.pros],
      cons: [...pattern.cons],
      optimizationFocus: 'balanced',
      confidence: 0.9
    };
  }

  /**
   * Optimize for cost - minimize monthly spend
   */
  optimizeForCost(pattern, requirements, preferences) {
    const services = this.selectBaseServices(pattern, requirements);
    const optimizedServices = [];

    for (const service of services) {
      const costOptimizedService = this.optimizeServiceForCost(service, requirements);
      optimizedServices.push(costOptimizedService);
    }

    // Replace expensive services with cheaper alternatives
    const alternativeServices = this.findCostAlternatives(optimizedServices, requirements);
    
    const characteristics = {
      ...pattern.characteristics,
      cost: Math.max(1, pattern.characteristics.cost - 2), // Reduce cost rating
      complexity: Math.min(5, pattern.characteristics.complexity + 1) // May increase complexity
    };

    return {
      id: `${pattern.id}-cost-optimized`,
      name: `${pattern.name} (Cost Optimized)`,
      description: `${pattern.description} - Optimized for minimal cost`,
      variant: 'cost-optimized',
      pattern,
      services: alternativeServices,
      characteristics,
      costEstimate: this.calculateTotalCost(alternativeServices, requirements),
      pros: [
        'Minimized monthly costs',
        'Pay-per-use pricing where possible',
        'Free tier eligible services',
        ...pattern.pros.filter(pro => !pro.includes('cost'))
      ],
      cons: [
        'May have performance limitations',
        'Potential cold start delays',
        'Limited scalability options',
        ...pattern.cons
      ],
      optimizationFocus: 'cost',
      confidence: 0.85,
      savings: this.calculateSavings(services, alternativeServices, requirements)
    };
  }

  /**
   * Optimize for performance - minimize latency and maximize throughput
   */
  optimizeForPerformance(pattern, requirements, preferences) {
    const services = this.selectBaseServices(pattern, requirements);
    const optimizedServices = [];

    for (const service of services) {
      const performanceOptimizedService = this.optimizeServiceForPerformance(service, requirements);
      optimizedServices.push(performanceOptimizedService);
    }

    // Add performance-enhancing services
    const enhancedServices = this.addPerformanceEnhancements(optimizedServices, requirements);
    
    const characteristics = {
      ...pattern.characteristics,
      scalability: Math.min(5, pattern.characteristics.scalability + 1),
      availability: Math.min(5, pattern.characteristics.availability + 1),
      cost: Math.min(5, pattern.characteristics.cost + 1) // May increase cost
    };

    return {
      id: `${pattern.id}-performance-optimized`,
      name: `${pattern.name} (Performance Optimized)`,
      description: `${pattern.description} - Optimized for high performance`,
      variant: 'performance-optimized',
      pattern,
      services: enhancedServices,
      characteristics,
      costEstimate: this.calculateTotalCost(enhancedServices, requirements),
      pros: [
        'Optimized for low latency',
        'High throughput capabilities',
        'Enhanced caching layers',
        'Multi-AZ deployment',
        ...pattern.pros.filter(pro => !pro.includes('performance'))
      ],
      cons: [
        'Higher operational costs',
        'More complex configuration',
        'Over-provisioned for low traffic',
        ...pattern.cons.filter(con => !con.includes('cost'))
      ],
      optimizationFocus: 'performance',
      confidence: 0.88
    };
  }

  /**
   * Optimize for simplicity - minimize complexity and management overhead
   */
  optimizeForSimplicity(pattern, requirements, preferences) {
    const services = this.selectBaseServices(pattern, requirements);
    const simplifiedServices = [];

    for (const service of services) {
      const simplifiedService = this.simplifyService(service, requirements);
      if (simplifiedService) {
        simplifiedServices.push(simplifiedService);
      }
    }

    // Remove optional services and use managed alternatives
    const managedServices = this.preferManagedServices(simplifiedServices, requirements);
    
    const characteristics = {
      ...pattern.characteristics,
      complexity: Math.max(1, pattern.characteristics.complexity - 2),
      cost: Math.min(5, pattern.characteristics.cost + 1), // Managed services may cost more
      scalability: Math.max(1, pattern.characteristics.scalability - 1) // May reduce flexibility
    };

    return {
      id: `${pattern.id}-simplicity-optimized`,
      name: `${pattern.name} (Simplified)`,
      description: `${pattern.description} - Optimized for ease of management`,
      variant: 'simplicity-optimized',
      pattern,
      services: managedServices,
      characteristics,
      costEstimate: this.calculateTotalCost(managedServices, requirements),
      pros: [
        'Minimal management overhead',
        'Fully managed services',
        'Automated scaling and backups',
        'Reduced operational complexity',
        ...pattern.pros.filter(pro => pro.includes('managed') || pro.includes('automatic'))
      ],
      cons: [
        'Less customization options',
        'Vendor lock-in',
        'May be over-simplified for complex needs',
        ...pattern.cons.filter(con => con.includes('control') || con.includes('customization'))
      ],
      optimizationFocus: 'simplicity',
      confidence: 0.82
    };
  }

  /**
   * Optimize for scalability - handle traffic spikes and growth
   */
  optimizeForScalability(pattern, requirements, preferences) {
    const services = this.selectBaseServices(pattern, requirements);
    const scalableServices = [];

    for (const service of services) {
      const scalableService = this.optimizeServiceForScalability(service, requirements);
      scalableServices.push(scalableService);
    }

    // Add auto-scaling and load balancing
    const enhancedServices = this.addScalabilityEnhancements(scalableServices, requirements);
    
    const characteristics = {
      ...pattern.characteristics,
      scalability: 5,
      availability: Math.min(5, pattern.characteristics.availability + 1),
      complexity: Math.min(5, pattern.characteristics.complexity + 1),
      cost: Math.min(5, pattern.characteristics.cost + 1)
    };

    return {
      id: `${pattern.id}-scalability-optimized`,
      name: `${pattern.name} (Scalability Optimized)`,
      description: `${pattern.description} - Optimized for high scalability`,
      variant: 'scalability-optimized',
      pattern,
      services: enhancedServices,
      characteristics,
      costEstimate: this.calculateTotalCost(enhancedServices, requirements),
      pros: [
        'Handles traffic spikes automatically',
        'Horizontal scaling capabilities',
        'Multi-region deployment ready',
        'Auto-scaling groups configured',
        ...pattern.pros.filter(pro => pro.includes('scal'))
      ],
      cons: [
        'Higher baseline costs',
        'Complex monitoring setup',
        'Over-engineered for stable traffic',
        ...pattern.cons
      ],
      optimizationFocus: 'scalability',
      confidence: 0.87
    };
  }

  /**
   * Select base services for a pattern
   */
  selectBaseServices(pattern, requirements) {
    const selectedServices = [];
    
    for (const serviceConfig of pattern.services) {
      const service = {
        ...serviceConfig,
        serviceDefinition: this.services[serviceConfig.serviceId],
        selected: serviceConfig.required || this.shouldIncludeOptionalService(serviceConfig, requirements)
      };
      
      if (service.selected) {
        selectedServices.push(service);
      }
    }
    
    return selectedServices;
  }

  /**
   * Determine if optional service should be included
   */
  shouldIncludeOptionalService(serviceConfig, requirements) {
    const { serviceId } = serviceConfig;
    
    switch (serviceId) {
      case 'cognito':
        return requirements.auth;
      case 'dynamodb':
      case 'rds':
        return requirements.database;
      case 'route53':
        return requirements.customDomain;
      case 'cloudwatch':
        return true; // Always include monitoring
      default:
        return false;
    }
  }

  /**
   * Optimize individual service for cost
   */
  optimizeServiceForCost(service, requirements) {
    const optimizedConfig = { ...service.configuration };
    
    switch (service.serviceId) {
      case 'ec2':
        optimizedConfig.instanceType = 't3.micro';
        optimizedConfig.autoScaling = false;
        break;
      case 'rds':
        optimizedConfig.instanceClass = 'db.t3.micro';
        optimizedConfig.multiAZ = false;
        optimizedConfig.backups = 'manual';
        break;
      case 'lambda':
        optimizedConfig.memory = '128MB';
        optimizedConfig.timeout = '15s';
        break;
      case 'dynamodb':
        optimizedConfig.billingMode = 'on-demand';
        break;
    }
    
    return {
      ...service,
      configuration: optimizedConfig,
      optimizations: ['cost-reduced-resources', 'minimal-configuration']
    };
  }

  /**
   * Optimize individual service for performance
   */
  optimizeServiceForPerformance(service, requirements) {
    const optimizedConfig = { ...service.configuration };
    
    switch (service.serviceId) {
      case 'ec2':
        optimizedConfig.instanceType = 't3.large';
        optimizedConfig.autoScaling = true;
        optimizedConfig.multiAZ = true;
        break;
      case 'rds':
        optimizedConfig.instanceClass = 'db.t3.small';
        optimizedConfig.multiAZ = true;
        optimizedConfig.readReplicas = true;
        break;
      case 'lambda':
        optimizedConfig.memory = '1024MB';
        optimizedConfig.timeout = '60s';
        optimizedConfig.provisioned = true;
        break;
      case 'cloudfront':
        optimizedConfig.caching = 'aggressive';
        optimizedConfig.compression = true;
        break;
    }
    
    return {
      ...service,
      configuration: optimizedConfig,
      optimizations: ['performance-enhanced', 'multi-az-deployment']
    };
  }

  /**
   * Simplify service configuration
   */
  simplifyService(service, requirements) {
    const simplifiedConfig = { ...service.configuration };
    
    // Remove complex configurations
    delete simplifiedConfig.customVPC;
    delete simplifiedConfig.advancedSecurity;
    delete simplifiedConfig.customNetworking;
    
    // Use defaults and managed options
    switch (service.serviceId) {
      case 'ec2':
        // Replace with Lambda if possible
        if (requirements.appType === 'api') {
          return null; // Will be replaced by Lambda
        }
        break;
      case 'rds':
        simplifiedConfig.engine = 'mysql'; // Use simple, well-supported engine
        simplifiedConfig.managedBackups = true;
        break;
    }
    
    return {
      ...service,
      configuration: simplifiedConfig,
      optimizations: ['simplified-config', 'managed-defaults']
    };
  }

  /**
   * Optimize service for scalability
   */
  optimizeServiceForScalability(service, requirements) {
    const optimizedConfig = { ...service.configuration };
    
    switch (service.serviceId) {
      case 'ec2':
        optimizedConfig.autoScaling = true;
        optimizedConfig.minInstances = 2;
        optimizedConfig.maxInstances = 10;
        optimizedConfig.targetTracking = true;
        break;
      case 'rds':
        optimizedConfig.readReplicas = true;
        optimizedConfig.connectionPooling = true;
        break;
      case 'lambda':
        optimizedConfig.reservedConcurrency = 100;
        optimizedConfig.provisioned = true;
        break;
      case 'dynamodb':
        optimizedConfig.autoScaling = true;
        optimizedConfig.globalTables = true;
        break;
    }
    
    return {
      ...service,
      configuration: optimizedConfig,
      optimizations: ['auto-scaling-enabled', 'high-availability']
    };
  }

  /**
   * Find cost-effective alternatives
   */
  findCostAlternatives(services, requirements) {
    const alternatives = [];
    
    for (const service of services) {
      let alternative = service;
      
      // Replace expensive services with cheaper alternatives
      switch (service.serviceId) {
        case 'ec2':
          if (requirements.appType === 'api') {
            alternative = this.createLambdaAlternative(service);
          }
          break;
        case 'rds':
          if (!requirements.complexQueries) {
            alternative = this.createDynamoDBAlternative(service);
          }
          break;
        case 'alb':
          if (requirements.traffic === 'low') {
            alternative = this.createAPIGatewayAlternative(service);
          }
          break;
      }
      
      alternatives.push(alternative);
    }
    
    return alternatives;
  }

  /**
   * Add performance enhancements
   */
  addPerformanceEnhancements(services, requirements) {
    const enhanced = [...services];
    
    // Add caching layer if not present
    if (!services.some(s => s.serviceId === 'elasticache')) {
      enhanced.push(this.createElastiCacheService());
    }
    
    // Add CDN if not present
    if (!services.some(s => s.serviceId === 'cloudfront')) {
      enhanced.push(this.createCloudFrontService());
    }
    
    return enhanced;
  }

  /**
   * Prefer managed services for simplicity
   */
  preferManagedServices(services, requirements) {
    return services.map(service => {
      const managedConfig = { ...service.configuration };
      
      // Enable managed features
      managedConfig.managedUpdates = true;
      managedConfig.automatedBackups = true;
      managedConfig.managedSecurity = true;
      
      return {
        ...service,
        configuration: managedConfig,
        optimizations: [...(service.optimizations || []), 'fully-managed']
      };
    });
  }

  /**
   * Add scalability enhancements
   */
  addScalabilityEnhancements(services, requirements) {
    const enhanced = [...services];
    
    // Ensure load balancer is present for multi-instance setups
    if (services.some(s => s.serviceId === 'ec2') && 
        !services.some(s => s.serviceId === 'alb')) {
      enhanced.push(this.createALBService());
    }
    
    // Add auto-scaling configuration
    enhanced.forEach(service => {
      if (service.serviceId === 'ec2' || service.serviceId === 'ecs') {
        service.configuration.autoScaling = true;
        service.configuration.scalingPolicies = {
          targetCPU: 70,
          targetMemory: 80,
          scaleOutCooldown: 300,
          scaleInCooldown: 300
        };
      }
    });
    
    return enhanced;
  }

  /**
   * Calculate total cost for services
   */
  calculateTotalCost(services, requirements) {
    const traffic = requirements.traffic || 'low';
    const trafficMultipliers = { low: 1, medium: 2, high: 4 };
    const multiplier = trafficMultipliers[traffic];
    
    let totalCost = 0;
    const breakdown = [];
    
    for (const service of services) {
      const serviceDefinition = service.serviceDefinition || this.services[service.serviceId];
      if (!serviceDefinition) continue;
      
      const baseCost = serviceDefinition.pricing.estimatedMonthly.typical;
      const adjustedCost = baseCost * multiplier;
      
      totalCost += adjustedCost;
      breakdown.push({
        service: serviceDefinition.name,
        cost: Math.round(adjustedCost),
        serviceId: service.serviceId
      });
    }
    
    return {
      monthly: Math.round(totalCost),
      annual: Math.round(totalCost * 12),
      breakdown,
      traffic,
      freeTierEligible: totalCost < 20 && traffic === 'low'
    };
  }

  /**
   * Calculate savings between two service configurations
   */
  calculateSavings(originalServices, optimizedServices, requirements) {
    const originalCost = this.calculateTotalCost(originalServices, requirements);
    const optimizedCost = this.calculateTotalCost(optimizedServices, requirements);
    
    const monthlySavings = originalCost.monthly - optimizedCost.monthly;
    const percentageSavings = originalCost.monthly > 0 ? 
      Math.round((monthlySavings / originalCost.monthly) * 100) : 0;
    
    return {
      monthly: monthlySavings,
      annual: monthlySavings * 12,
      percentage: percentageSavings
    };
  }

  /**
   * Rank variants by overall suitability
   */
  rankVariants(variants, requirements, preferences) {
    return variants.map(variant => {
      const suitabilityScore = this.calculateVariantSuitability(variant, requirements, preferences);
      return {
        ...variant,
        suitabilityScore,
        rank: 0 // Will be set after sorting
      };
    }).sort((a, b) => b.suitabilityScore - a.suitabilityScore)
      .map((variant, index) => ({ ...variant, rank: index + 1 }));
  }

  /**
   * Calculate variant suitability score
   */
  calculateVariantSuitability(variant, requirements, preferences) {
    let score = variant.confidence || 0.8;
    
    // Adjust based on preferences
    if (preferences.cost_priority >= 4 && variant.optimizationFocus === 'cost') {
      score += 0.2;
    }
    
    if (preferences.performance_requirements >= 4 && variant.optimizationFocus === 'performance') {
      score += 0.2;
    }
    
    if (preferences.complexity_tolerance <= 2 && variant.optimizationFocus === 'simplicity') {
      score += 0.2;
    }
    
    // Adjust based on requirements match
    if (requirements.traffic === 'high' && variant.characteristics.scalability >= 4) {
      score += 0.1;
    }
    
    if (requirements.budget && variant.costEstimate.monthly <= requirements.budget) {
      score += 0.1;
    }
    
    return Math.min(score, 1.0);
  }

  /**
   * Check if variant is different from base
   */
  isDifferentFromBase(variant, baseRecommendation) {
    if (!variant || !baseRecommendation) return false;
    
    // Compare service configurations
    const variantServices = variant.services.map(s => s.serviceId).sort();
    const baseServices = baseRecommendation.services.map(s => s.serviceId).sort();
    
    return JSON.stringify(variantServices) !== JSON.stringify(baseServices) ||
           variant.costEstimate.monthly !== baseRecommendation.costEstimate.monthly;
  }

  /**
   * Helper methods to create alternative services
   */
  createLambdaAlternative(ec2Service) {
    return {
      serviceId: 'lambda',
      purpose: 'Serverless compute (replaces EC2)',
      required: true,
      serviceDefinition: this.services.lambda,
      configuration: {
        runtime: 'nodejs18.x',
        memory: '512MB',
        timeout: '30s'
      },
      replacement: ec2Service.serviceId
    };
  }

  createDynamoDBAlternative(rdsService) {
    return {
      serviceId: 'dynamodb',
      purpose: 'NoSQL database (replaces RDS)',
      required: true,
      serviceDefinition: this.services.dynamodb,
      configuration: {
        billingMode: 'on-demand',
        encryption: true
      },
      replacement: rdsService.serviceId
    };
  }

  createAPIGatewayAlternative(albService) {
    return {
      serviceId: 'api-gateway',
      purpose: 'API management (replaces ALB)',
      required: true,
      serviceDefinition: this.services['api-gateway'],
      configuration: {
        type: 'REST',
        cors: true
      },
      replacement: albService.serviceId
    };
  }

  createElastiCacheService() {
    return {
      serviceId: 'elasticache',
      purpose: 'In-memory caching',
      required: false,
      serviceDefinition: {
        id: 'elasticache',
        name: 'Amazon ElastiCache',
        category: 'database',
        pricing: { estimatedMonthly: { typical: 15 } }
      },
      configuration: {
        engine: 'redis',
        nodeType: 'cache.t3.micro'
      }
    };
  }

  createCloudFrontService() {
    return {
      serviceId: 'cloudfront',
      purpose: 'Content delivery network',
      required: false,
      serviceDefinition: this.services.cloudfront,
      configuration: {
        caching: 'aggressive',
        compression: true
      }
    };
  }

  createALBService() {
    return {
      serviceId: 'alb',
      purpose: 'Application load balancer',
      required: true,
      serviceDefinition: this.services.alb,
      configuration: {
        scheme: 'internet-facing',
        targetType: 'instance'
      }
    };
  }
}

/**
 * Service Compatibility Validator
 * Validates service combinations and resolves conflicts
 */
export class ServiceCompatibilityValidator {
  constructor() {
    this.incompatibleCombinations = [
      ['lambda', 'ec2'], // Don't use both for same purpose
      ['rds', 'dynamodb'], // Choose one database type
      ['alb', 'api-gateway'] // Choose one routing method
    ];
    
    this.requiredCombinations = [
      { if: 'ec2', then: ['alb', 'cloudwatch'] },
      { if: 'rds', then: ['cloudwatch'] },
      { if: 'lambda', then: ['api-gateway', 'cloudwatch'] }
    ];
  }

  /**
   * Validate service combination
   */
  validateServices(services) {
    const issues = [];
    const serviceIds = services.map(s => s.serviceId);
    
    // Check for incompatible combinations
    for (const [service1, service2] of this.incompatibleCombinations) {
      if (serviceIds.includes(service1) && serviceIds.includes(service2)) {
        issues.push({
          type: 'conflict',
          severity: 'warning',
          message: `${service1} and ${service2} serve similar purposes. Consider using only one.`,
          services: [service1, service2],
          suggestion: this.suggestResolution(service1, service2)
        });
      }
    }
    
    // Check for missing required services
    for (const rule of this.requiredCombinations) {
      if (serviceIds.includes(rule.if)) {
        for (const requiredService of rule.then) {
          if (!serviceIds.includes(requiredService)) {
            issues.push({
              type: 'missing',
              severity: 'error',
              message: `${rule.if} requires ${requiredService} for proper operation.`,
              services: [rule.if],
              suggestion: `Add ${requiredService} to the architecture`
            });
          }
        }
      }
    }
    
    return {
      valid: issues.filter(i => i.severity === 'error').length === 0,
      issues
    };
  }

  /**
   * Suggest resolution for conflicts
   */
  suggestResolution(service1, service2) {
    const resolutions = {
      'lambda-ec2': 'Use Lambda for APIs and event processing, EC2 for long-running applications',
      'rds-dynamodb': 'Use RDS for relational data, DynamoDB for key-value and document data',
      'alb-api-gateway': 'Use ALB for EC2/ECS, API Gateway for Lambda functions'
    };
    
    const key = [service1, service2].sort().join('-');
    return resolutions[key] || 'Review architecture requirements and choose the most appropriate service';
  }

  /**
   * Auto-resolve conflicts where possible
   */
  autoResolveConflicts(services, preferences = {}) {
    const resolved = [...services];
    const serviceIds = resolved.map(s => s.serviceId);
    
    // Auto-resolve based on preferences
    if (serviceIds.includes('lambda') && serviceIds.includes('ec2')) {
      if (preferences.cost_priority >= 4) {
        // Remove EC2, keep Lambda
        return resolved.filter(s => s.serviceId !== 'ec2');
      } else if (preferences.complexity_tolerance <= 2) {
        // Remove Lambda, keep EC2
        return resolved.filter(s => s.serviceId !== 'lambda');
      }
    }
    
    return resolved;
  }
}

// Export instances
export const serviceOptimizer = new ServiceOptimizer();
export const compatibilityValidator = new ServiceCompatibilityValidator();

export default {
  ServiceOptimizer,
  ServiceCompatibilityValidator,
  serviceOptimizer,
  compatibilityValidator
};