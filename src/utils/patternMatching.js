// Pattern Matching Utilities
// Advanced algorithms for matching analysis results to architecture patterns

import { architecturePatterns, awsServices } from '../data/architecturePatterns';

/**
 * Advanced Pattern Matching Algorithm
 * Uses weighted scoring to match analysis results to optimal architecture patterns
 */
export class PatternMatcher {
  constructor() {
    this.patterns = architecturePatterns;
    this.services = awsServices;
  }

  /**
   * Match analysis results to architecture patterns
   * @param {Object} analysisResult - Results from application analysis
   * @param {Object} preferences - User preferences for optimization
   * @returns {Array} Ranked list of pattern matches
   */
  matchPatterns(analysisResult, preferences = {}) {
    const { detected, requirements, confidence } = analysisResult;
    const matches = [];

    // Calculate match score for each pattern
    for (const [patternId, pattern] of Object.entries(this.patterns)) {
      const matchResult = this.calculatePatternScore(pattern, detected, requirements);
      
      if (matchResult.score >= 0.2) { // Minimum threshold
        matches.push({
          patternId,
          pattern,
          score: matchResult.score,
          confidence: Math.min(matchResult.score * confidence, 1),
          reasons: matchResult.reasons,
          warnings: matchResult.warnings,
          estimatedCost: this.calculatePatternCost(pattern, requirements),
          suitability: this.calculateSuitability(pattern, requirements, preferences)
        });
      }
    }

    // Sort by combined score (pattern match + user preferences)
    matches.sort((a, b) => {
      const scoreA = (a.score * 0.7) + (a.suitability * 0.3);
      const scoreB = (b.score * 0.7) + (b.suitability * 0.3);
      return scoreB - scoreA;
    });

    return matches;
  }

  /**
   * Calculate how well a pattern matches the detected application
   */
  calculatePatternScore(pattern, detected, requirements) {
    let score = 0;
    const reasons = [];
    const warnings = [];
    const weights = {
      appType: 0.35,
      framework: 0.25,
      requirements: 0.40
    };

    // App Type Matching
    const appTypeScore = this.scoreAppTypeMatch(pattern, detected);
    score += appTypeScore.score * weights.appType;
    reasons.push(...appTypeScore.reasons);
    warnings.push(...appTypeScore.warnings);

    // Framework Matching
    const frameworkScore = this.scoreFrameworkMatch(pattern, detected);
    score += frameworkScore.score * weights.framework;
    reasons.push(...frameworkScore.reasons);

    // Requirements Matching
    const requirementsScore = this.scoreRequirementsMatch(pattern, requirements);
    score += requirementsScore.score * weights.requirements;
    reasons.push(...requirementsScore.reasons);
    warnings.push(...requirementsScore.warnings);

    return { score, reasons, warnings };
  }

  /**
   * Score application type compatibility
   */
  scoreAppTypeMatch(pattern, detected) {
    const reasons = [];
    const warnings = [];
    let score = 0;

    if (!detected?.appType) {
      warnings.push('Application type not clearly detected');
      return { score: 0.5, reasons, warnings }; // Neutral score
    }

    const patternAppTypes = pattern.matchCriteria.appTypes || [];
    
    if (patternAppTypes.includes(detected.appType)) {
      score = 1.0;
      reasons.push(`Perfect match for ${detected.appType} applications`);
    } else if (this.isCompatibleAppType(detected.appType, patternAppTypes)) {
      score = 0.7;
      reasons.push(`Compatible with ${detected.appType} applications`);
    } else {
      score = 0.2;
      warnings.push(`Not primarily designed for ${detected.appType} applications`);
    }

    return { score, reasons, warnings };
  }

  /**
   * Score framework compatibility
   */
  scoreFrameworkMatch(pattern, detected) {
    const reasons = [];
    let score = 0;

    if (!detected?.framework) {
      return { score: 0.5, reasons }; // Neutral if no framework detected
    }

    const patternFrameworks = pattern.matchCriteria.frameworks || [];
    
    if (patternFrameworks.includes('any') || patternFrameworks.includes(detected.framework)) {
      score = 1.0;
      reasons.push(`Supports ${detected.framework} framework`);
    } else if (this.isCompatibleFramework(detected.framework, patternFrameworks)) {
      score = 0.6;
      reasons.push(`Can accommodate ${detected.framework} with modifications`);
    } else {
      score = 0.3;
      reasons.push(`Limited support for ${detected.framework}`);
    }

    return { score, reasons };
  }

  /**
   * Score requirements compatibility
   */
  scoreRequirementsMatch(pattern, requirements) {
    const reasons = [];
    const warnings = [];
    let totalScore = 0;
    let totalWeight = 0;

    const requirementChecks = [
      { key: 'database', weight: 0.3 },
      { key: 'auth', weight: 0.2 },
      { key: 'realtime', weight: 0.2 },
      { key: 'storage', weight: 0.15 },
      { key: 'traffic', weight: 0.15 }
    ];

    for (const check of requirementChecks) {
      const result = this.checkRequirement(pattern, requirements, check.key);
      totalScore += result.score * check.weight;
      totalWeight += check.weight;
      
      if (result.reason) reasons.push(result.reason);
      if (result.warning) warnings.push(result.warning);
    }

    return { 
      score: totalWeight > 0 ? totalScore / totalWeight : 0.5, 
      reasons, 
      warnings 
    };
  }

  /**
   * Check individual requirement compatibility
   */
  checkRequirement(pattern, requirements, requirementKey) {
    const patternReq = pattern.matchCriteria.requirements?.[requirementKey];
    const userReq = requirements[requirementKey];

    switch (requirementKey) {
      case 'database':
        return this.checkDatabaseRequirement(patternReq, userReq);
      case 'auth':
        return this.checkAuthRequirement(patternReq, userReq);
      case 'realtime':
        return this.checkRealtimeRequirement(patternReq, userReq);
      case 'storage':
        return this.checkStorageRequirement(patternReq, userReq);
      case 'traffic':
        return this.checkTrafficRequirement(pattern, userReq);
      default:
        return { score: 0.5 };
    }
  }

  checkDatabaseRequirement(patternReq, userReq) {
    if (patternReq === undefined) return { score: 0.5 };
    
    if (userReq && patternReq !== false) {
      return { 
        score: 1.0, 
        reason: 'Includes database services' 
      };
    } else if (!userReq && patternReq === false) {
      return { 
        score: 1.0, 
        reason: 'No database needed - perfect for static content' 
      };
    } else if (userReq && patternReq === false) {
      return { 
        score: 0.1, 
        warning: 'Database needed but pattern is database-free' 
      };
    } else if (!userReq && patternReq === true) {
      return { 
        score: 0.7, 
        reason: 'Database available if needed later' 
      };
    }
    
    return { score: 0.5 };
  }

  checkAuthRequirement(patternReq, userReq) {
    if (!userReq) return { score: 1.0 }; // No auth needed
    
    if (patternReq === false) {
      return { 
        score: 0.3, 
        warning: 'Authentication needed but not well-supported by this pattern' 
      };
    }
    
    return { 
      score: 0.9, 
      reason: 'Can integrate authentication services' 
    };
  }

  checkRealtimeRequirement(patternReq, userReq) {
    if (!userReq) return { score: 1.0 }; // No real-time needed
    
    if (patternReq === false) {
      return { 
        score: 0.2, 
        warning: 'Real-time features needed but not supported by this pattern' 
      };
    }
    
    return { 
      score: 0.8, 
      reason: 'Supports real-time features' 
    };
  }

  checkStorageRequirement(patternReq, userReq) {
    if (!userReq) return { score: 1.0 }; // No file storage needed
    
    // Most patterns can accommodate file storage via S3
    return { 
      score: 0.9, 
      reason: 'Can integrate file storage services' 
    };
  }

  checkTrafficRequirement(pattern, userTraffic) {
    const scalability = pattern.characteristics?.scalability || 3;
    
    switch (userTraffic) {
      case 'low':
        return { score: 1.0, reason: 'Suitable for low traffic' };
      case 'medium':
        return { 
          score: scalability >= 3 ? 1.0 : 0.6, 
          reason: scalability >= 3 ? 'Handles medium traffic well' : 'May need optimization for medium traffic'
        };
      case 'high':
        return { 
          score: scalability >= 4 ? 1.0 : 0.4, 
          reason: scalability >= 4 ? 'Excellent for high traffic' : 'May struggle with high traffic',
          warning: scalability < 4 ? 'Consider more scalable alternatives for high traffic' : undefined
        };
      default:
        return { score: 0.8 };
    }
  }

  /**
   * Calculate estimated costs for a pattern based on requirements
   */
  calculatePatternCost(pattern, requirements) {
    const baseCost = pattern.costEstimate?.monthly?.typical || 50;
    const traffic = requirements.traffic || 'low';
    
    // Adjust cost based on traffic
    const trafficMultipliers = {
      low: 1.0,
      medium: 2.0,
      high: 4.0
    };
    
    const adjustedCost = baseCost * trafficMultipliers[traffic];
    
    return {
      monthly: Math.round(adjustedCost),
      range: {
        min: Math.round(adjustedCost * 0.6),
        max: Math.round(adjustedCost * 1.8)
      },
      traffic,
      freeTierEligible: pattern.costEstimate?.freeTierEligible && traffic === 'low'
    };
  }

  /**
   * Calculate suitability based on user preferences
   */
  calculateSuitability(pattern, requirements, preferences) {
    let suitability = 0;
    const weights = {
      cost: preferences.cost_priority || 3,
      complexity: preferences.complexity_tolerance || 3,
      performance: preferences.performance_requirements || 3
    };
    
    // Normalize weights
    const totalWeight = weights.cost + weights.complexity + weights.performance;
    
    // Cost suitability (lower cost = higher suitability if cost is important)
    const costScore = this.calculateCostSuitability(pattern, weights.cost);
    suitability += (costScore * weights.cost) / totalWeight;
    
    // Complexity suitability
    const complexityScore = this.calculateComplexitySuitability(pattern, weights.complexity);
    suitability += (complexityScore * weights.complexity) / totalWeight;
    
    // Performance suitability
    const performanceScore = this.calculatePerformanceSuitability(pattern, weights.performance);
    suitability += (performanceScore * weights.performance) / totalWeight;
    
    return Math.min(suitability, 1.0);
  }

  calculateCostSuitability(pattern, costPriority) {
    const costLevel = pattern.characteristics?.cost || 3;
    
    // If cost is very important (5), prefer low-cost solutions
    // If cost is not important (1), cost doesn't matter much
    if (costPriority >= 4) {
      return (6 - costLevel) / 5; // Invert: low cost = high score
    } else if (costPriority <= 2) {
      return 0.8; // Cost doesn't matter much
    } else {
      return 0.6; // Neutral
    }
  }

  calculateComplexitySuitability(pattern, complexityTolerance) {
    const complexity = pattern.characteristics?.complexity || 3;
    
    // If tolerance is low, prefer simple solutions
    // If tolerance is high, complexity doesn't matter
    if (complexityTolerance <= 2) {
      return (6 - complexity) / 5; // Prefer low complexity
    } else if (complexityTolerance >= 4) {
      return 0.8; // Complexity is fine
    } else {
      return 0.6; // Neutral
    }
  }

  calculatePerformanceSuitability(pattern, performanceRequirements) {
    const scalability = pattern.characteristics?.scalability || 3;
    const availability = pattern.characteristics?.availability || 3;
    
    const performanceScore = (scalability + availability) / 10;
    
    // If performance is very important, prefer high-performance solutions
    if (performanceRequirements >= 4) {
      return performanceScore;
    } else if (performanceRequirements <= 2) {
      return 0.7; // Performance not critical
    } else {
      return 0.6; // Neutral
    }
  }

  /**
   * Helper methods for compatibility checking
   */
  isCompatibleAppType(detectedType, patternTypes) {
    const compatibility = {
      'spa': ['static', 'frontend'],
      'api': ['backend', 'microservices'],
      'fullstack': ['monolith', 'traditional'],
      'static': ['spa', 'frontend']
    };
    
    const compatibleTypes = compatibility[detectedType] || [];
    return patternTypes.some(type => compatibleTypes.includes(type));
  }

  isCompatibleFramework(detectedFramework, patternFrameworks) {
    const compatibility = {
      'react': ['javascript', 'frontend'],
      'vue': ['javascript', 'frontend'],
      'angular': ['javascript', 'frontend'],
      'nodejs': ['javascript', 'backend'],
      'python': ['backend'],
      'php': ['backend'],
      'java': ['backend']
    };
    
    const compatibleFrameworks = compatibility[detectedFramework] || [];
    return patternFrameworks.some(fw => compatibleFrameworks.includes(fw));
  }
}

/**
 * Service Configuration Generator
 * Generates specific service configurations based on detected requirements
 */
export class ServiceConfigGenerator {
  constructor() {
    this.services = awsServices;
  }

  /**
   * Generate service configurations for a pattern
   */
  generateServiceConfigs(pattern, requirements, preferences = {}) {
    const configs = [];
    
    for (const service of pattern.services) {
      const serviceDefinition = this.services[service.serviceId];
      if (!serviceDefinition) continue;
      
      const config = {
        ...service,
        serviceDefinition,
        configuration: this.customizeServiceConfig(
          service, 
          serviceDefinition, 
          requirements, 
          preferences
        ),
        estimatedCost: this.calculateServiceCost(serviceDefinition, requirements)
      };
      
      configs.push(config);
    }
    
    return configs;
  }

  /**
   * Customize service configuration based on requirements
   */
  customizeServiceConfig(service, serviceDefinition, requirements, preferences) {
    const baseConfig = { ...service.configuration };
    
    // Customize based on service type
    switch (serviceDefinition.category) {
      case 'compute':
        return this.customizeComputeConfig(baseConfig, requirements, preferences);
      case 'database':
        return this.customizeDatabaseConfig(baseConfig, requirements, preferences);
      case 'storage':
        return this.customizeStorageConfig(baseConfig, requirements, preferences);
      case 'networking':
        return this.customizeNetworkingConfig(baseConfig, requirements, preferences);
      default:
        return baseConfig;
    }
  }

  customizeComputeConfig(config, requirements, preferences) {
    // Adjust compute resources based on traffic expectations
    if (requirements.traffic === 'high') {
      config.instanceType = config.instanceType?.replace('micro', 'small') || 't3.small';
      config.autoScaling = true;
    } else if (requirements.traffic === 'low' && preferences.cost_priority >= 4) {
      config.instanceType = 't3.micro';
    }
    
    return config;
  }

  customizeDatabaseConfig(config, requirements, preferences) {
    // Adjust database configuration
    if (preferences.cost_priority >= 4) {
      config.multiAZ = false;
      config.instanceClass = 'db.t3.micro';
    } else if (preferences.performance_requirements >= 4) {
      config.multiAZ = true;
      config.instanceClass = 'db.t3.small';
    }
    
    return config;
  }

  customizeStorageConfig(config, requirements, preferences) {
    // Adjust storage configuration
    if (requirements.storage) {
      config.versioning = true;
      config.lifecycle = 'intelligent-tiering';
    }
    
    return config;
  }

  customizeNetworkingConfig(config, requirements, preferences) {
    // Adjust networking configuration
    if (requirements.traffic === 'high') {
      config.caching = 'aggressive';
      config.compression = true;
    }
    
    return config;
  }

  /**
   * Calculate estimated cost for a service
   */
  calculateServiceCost(serviceDefinition, requirements) {
    const baseCost = serviceDefinition.pricing.estimatedMonthly.typical;
    const traffic = requirements.traffic || 'low';
    
    const trafficMultipliers = {
      low: 1.0,
      medium: 1.5,
      high: 2.5
    };
    
    return Math.round(baseCost * trafficMultipliers[traffic]);
  }
}

// Export instances for use
export const patternMatcher = new PatternMatcher();
export const serviceConfigGenerator = new ServiceConfigGenerator();

export default {
  PatternMatcher,
  ServiceConfigGenerator,
  patternMatcher,
  serviceConfigGenerator
};