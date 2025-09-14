// Service Ranking Algorithm
// Advanced ranking system for AWS services based on multiple criteria

import { awsServices } from '../data/architecturePatterns';

/**
 * Service Ranking Engine
 * Ranks AWS services based on user preferences, requirements, and context
 */
export class ServiceRanker {
  constructor() {
    this.services = awsServices;
    this.rankingCriteria = {
      cost: { weight: 0.25, direction: 'lower' }, // Lower cost is better
      complexity: { weight: 0.20, direction: 'preference' }, // Based on user tolerance
      scalability: { weight: 0.20, direction: 'higher' }, // Higher scalability is better
      reliability: { weight: 0.15, direction: 'higher' }, // Higher reliability is better
      performance: { weight: 0.10, direction: 'higher' }, // Higher performance is better
      maturity: { weight: 0.10, direction: 'higher' } // More mature services are safer
    };
  }

  /**
   * Rank services for a specific use case
   * @param {Array} candidateServices - Services to rank
   * @param {Object} requirements - Application requirements
   * @param {Object} preferences - User preferences
   * @param {Object} context - Additional context (traffic, budget, etc.)
   * @returns {Array} Ranked list of services with scores
   */
  rankServices(candidateServices, requirements, preferences = {}, context = {}) {
    const rankedServices = candidateServices.map(service => {
      const score = this.calculateServiceScore(service, requirements, preferences, context);
      return {
        ...service,
        score,
        ranking: {
          overall: score.overall,
          breakdown: score.breakdown,
          reasons: score.reasons,
          warnings: score.warnings
        }
      };
    });

    // Sort by overall score (descending)
    rankedServices.sort((a, b) => b.score.overall - a.score.overall);

    // Add rank position
    return rankedServices.map((service, index) => ({
      ...service,
      rank: index + 1,
      tier: this.getTier(service.score.overall)
    }));
  }

  /**
   * Calculate comprehensive score for a service
   */
  calculateServiceScore(service, requirements, preferences, context) {
    const breakdown = {};
    const reasons = [];
    const warnings = [];
    let totalScore = 0;

    // Cost scoring
    const costScore = this.scoreCost(service, requirements, context);
    breakdown.cost = costScore;
    totalScore += costScore.score * this.rankingCriteria.cost.weight;
    reasons.push(...costScore.reasons);
    warnings.push(...costScore.warnings);

    // Complexity scoring
    const complexityScore = this.scoreComplexity(service, preferences);
    breakdown.complexity = complexityScore;
    totalScore += complexityScore.score * this.rankingCriteria.complexity.weight;
    reasons.push(...complexityScore.reasons);

    // Scalability scoring
    const scalabilityScore = this.scoreScalability(service, requirements, context);
    breakdown.scalability = scalabilityScore;
    totalScore += scalabilityScore.score * this.rankingCriteria.scalability.weight;
    reasons.push(...scalabilityScore.reasons);

    // Reliability scoring
    const reliabilityScore = this.scoreReliability(service, requirements);
    breakdown.reliability = reliabilityScore;
    totalScore += reliabilityScore.score * this.rankingCriteria.reliability.weight;
    reasons.push(...reliabilityScore.reasons);

    // Performance scoring
    const performanceScore = this.scorePerformance(service, requirements, context);
    breakdown.performance = performanceScore;
    totalScore += performanceScore.score * this.rankingCriteria.performance.weight;
    reasons.push(...performanceScore.reasons);

    // Maturity scoring
    const maturityScore = this.scoreMaturity(service);
    breakdown.maturity = maturityScore;
    totalScore += maturityScore.score * this.rankingCriteria.maturity.weight;
    reasons.push(...maturityScore.reasons);

    return {
      overall: Math.min(totalScore, 1.0),
      breakdown,
      reasons: reasons.filter(Boolean),
      warnings: warnings.filter(Boolean)
    };
  }

  /**
   * Score service based on cost considerations
   */
  scoreCost(service, requirements, context) {
    const serviceDefinition = service.serviceDefinition || this.services[service.serviceId];
    if (!serviceDefinition) return { score: 0.5, reasons: [], warnings: [] };

    const reasons = [];
    const warnings = [];
    let score = 0.5; // Default neutral score

    const pricing = serviceDefinition.pricing;
    const estimatedCost = pricing.estimatedMonthly.typical;
    const traffic = requirements.traffic || context.traffic || 'low';
    const budget = context.budget;

    // Adjust cost based on traffic
    const trafficMultipliers = { low: 1, medium: 2, high: 4 };
    const adjustedCost = estimatedCost * trafficMultipliers[traffic];

    // Score based on cost level
    if (adjustedCost <= 10) {
      score = 1.0;
      reasons.push('Very cost-effective');
    } else if (adjustedCost <= 50) {
      score = 0.8;
      reasons.push('Reasonably priced');
    } else if (adjustedCost <= 100) {
      score = 0.6;
      reasons.push('Moderate cost');
    } else if (adjustedCost <= 200) {
      score = 0.4;
      reasons.push('Higher cost service');
    } else {
      score = 0.2;
      reasons.push('Premium pricing');
      warnings.push('High monthly cost - consider alternatives');
    }

    // Free tier bonus
    if (pricing.freeTier && pricing.freeTier !== 'None') {
      score += 0.1;
      reasons.push('Free tier available');
    }

    // Budget consideration
    if (budget && adjustedCost > budget * 0.8) {
      score *= 0.7;
      warnings.push('May exceed budget constraints');
    }

    // Pay-per-use bonus for variable workloads
    if (pricing.model === 'per-request' && traffic !== 'high') {
      score += 0.1;
      reasons.push('Pay-per-use pricing model');
    }

    return {
      score: Math.min(score, 1.0),
      reasons,
      warnings,
      estimatedCost: adjustedCost
    };
  }

  /**
   * Score service based on complexity
   */
  scoreComplexity(service, preferences) {
    const serviceDefinition = service.serviceDefinition || this.services[service.serviceId];
    if (!serviceDefinition) return { score: 0.5, reasons: [] };

    const reasons = [];
    const complexity = serviceDefinition.complexity || 3;
    const tolerance = preferences.complexity_tolerance || 3;

    let score;

    // Score based on complexity vs tolerance
    if (tolerance >= 4) {
      // High tolerance - complexity doesn't matter much
      score = 0.8;
      reasons.push('Complexity acceptable for experienced users');
    } else if (tolerance <= 2) {
      // Low tolerance - prefer simple services
      score = (6 - complexity) / 5;
      if (complexity <= 2) {
        reasons.push('Simple to set up and manage');
      } else {
        reasons.push('May be complex for beginners');
      }
    } else {
      // Medium tolerance
      score = complexity <= 3 ? 0.8 : 0.6;
      reasons.push(complexity <= 3 ? 'Moderate complexity' : 'Requires some expertise');
    }

    // Managed service bonus for low complexity tolerance
    if (tolerance <= 2 && serviceDefinition.category !== 'compute') {
      score += 0.1;
      reasons.push('Fully managed service');
    }

    return {
      score: Math.min(score, 1.0),
      reasons
    };
  }

  /**
   * Score service based on scalability requirements
   */
  scoreScalability(service, requirements, context) {
    const serviceDefinition = service.serviceDefinition || this.services[service.serviceId];
    if (!serviceDefinition) return { score: 0.5, reasons: [] };

    const reasons = [];
    const scalability = serviceDefinition.scalability || 3;
    const traffic = requirements.traffic || context.traffic || 'low';
    const expectedGrowth = context.expectedGrowth || 'moderate';

    let score = scalability / 5; // Base score from service scalability

    // Adjust based on traffic requirements
    switch (traffic) {
      case 'low':
        if (scalability >= 3) {
          score = 1.0;
          reasons.push('Excellent scalability for current needs');
        }
        break;
      case 'medium':
        if (scalability >= 4) {
          score = 1.0;
          reasons.push('Handles medium traffic well');
        } else if (scalability === 3) {
          score = 0.7;
          reasons.push('Adequate for medium traffic');
        }
        break;
      case 'high':
        if (scalability === 5) {
          score = 1.0;
          reasons.push('Excellent for high traffic scenarios');
        } else if (scalability === 4) {
          score = 0.8;
          reasons.push('Good scalability for high traffic');
        } else {
          score = 0.4;
          reasons.push('Limited scalability for high traffic');
        }
        break;
    }

    // Growth consideration
    if (expectedGrowth === 'rapid' && scalability >= 4) {
      score += 0.1;
      reasons.push('Supports rapid growth');
    }

    // Auto-scaling bonus
    if (service.configuration?.autoScaling) {
      score += 0.1;
      reasons.push('Auto-scaling configured');
    }

    return {
      score: Math.min(score, 1.0),
      reasons
    };
  }

  /**
   * Score service based on reliability requirements
   */
  scoreReliability(service, requirements) {
    const serviceDefinition = service.serviceDefinition || this.services[service.serviceId];
    if (!serviceDefinition) return { score: 0.5, reasons: [] };

    const reasons = [];
    let score = 0.7; // Base reliability score

    // AWS managed services get reliability bonus
    if (serviceDefinition.category !== 'compute' || serviceDefinition.id === 'lambda') {
      score += 0.2;
      reasons.push('AWS managed service with high availability');
    }

    // Multi-AZ configuration bonus
    if (service.configuration?.multiAZ) {
      score += 0.1;
      reasons.push('Multi-AZ deployment for high availability');
    }

    // Backup configuration bonus
    if (service.configuration?.backups === 'automated' || 
        service.configuration?.automatedBackups) {
      score += 0.1;
      reasons.push('Automated backup and recovery');
    }

    // Critical application requirements
    if (requirements.criticality === 'high') {
      if (serviceDefinition.id === 'lambda' || serviceDefinition.id === 's3') {
        score += 0.1;
        reasons.push('Highly reliable for critical applications');
      }
    }

    return {
      score: Math.min(score, 1.0),
      reasons
    };
  }

  /**
   * Score service based on performance requirements
   */
  scorePerformance(service, requirements, context) {
    const serviceDefinition = service.serviceDefinition || this.services[service.serviceId];
    if (!serviceDefinition) return { score: 0.5, reasons: [] };

    const reasons = [];
    let score = 0.6; // Base performance score

    const performanceReq = requirements.performance_requirements || 
                          context.performance_requirements || 3;

    // Service-specific performance characteristics
    switch (serviceDefinition.id) {
      case 'lambda':
        if (performanceReq <= 3) {
          score = 0.8;
          reasons.push('Good performance for most use cases');
        } else {
          score = 0.5;
          reasons.push('Cold starts may affect performance');
        }
        break;
      
      case 'ec2':
        if (performanceReq >= 4) {
          score = 0.9;
          reasons.push('Dedicated resources for high performance');
        } else {
          score = 0.7;
          reasons.push('Consistent performance');
        }
        break;
      
      case 'dynamodb':
        if (performanceReq >= 4) {
          score = 0.9;
          reasons.push('Single-digit millisecond latency');
        } else {
          score = 0.8;
          reasons.push('Fast NoSQL performance');
        }
        break;
      
      case 'rds':
        score = 0.7;
        reasons.push('Reliable database performance');
        break;
      
      case 'cloudfront':
        score = 0.9;
        reasons.push('Global edge locations for fast content delivery');
        break;
    }

    // Configuration-based performance improvements
    if (service.configuration?.caching === 'aggressive') {
      score += 0.1;
      reasons.push('Aggressive caching for better performance');
    }

    if (service.configuration?.provisioned) {
      score += 0.1;
      reasons.push('Provisioned capacity for consistent performance');
    }

    return {
      score: Math.min(score, 1.0),
      reasons
    };
  }

  /**
   * Score service based on maturity and stability
   */
  scoreMaturity(service) {
    const serviceDefinition = service.serviceDefinition || this.services[service.serviceId];
    if (!serviceDefinition) return { score: 0.5, reasons: [] };

    const reasons = [];
    let score = 0.7; // Base maturity score

    // Well-established services
    const matureServices = ['s3', 'ec2', 'rds', 'cloudfront', 'route53'];
    if (matureServices.includes(serviceDefinition.id)) {
      score = 0.9;
      reasons.push('Mature and well-established service');
    }

    // Newer but stable services
    const stableServices = ['lambda', 'dynamodb', 'api-gateway', 'ecs'];
    if (stableServices.includes(serviceDefinition.id)) {
      score = 0.8;
      reasons.push('Stable service with good track record');
    }

    // Community and documentation
    score += 0.1;
    reasons.push('Extensive documentation and community support');

    return {
      score: Math.min(score, 1.0),
      reasons
    };
  }

  /**
   * Get tier classification based on score
   */
  getTier(score) {
    if (score >= 0.8) return 'recommended';
    if (score >= 0.6) return 'suitable';
    if (score >= 0.4) return 'acceptable';
    return 'not-recommended';
  }

  /**
   * Generate service comparison matrix
   */
  generateComparisonMatrix(services, criteria = null) {
    const usedCriteria = criteria || Object.keys(this.rankingCriteria);
    const matrix = {
      services: services.map(s => ({
        id: s.serviceId,
        name: s.serviceDefinition?.name || s.serviceId,
        overall: s.score?.overall || 0
      })),
      criteria: usedCriteria,
      scores: {}
    };

    // Build score matrix
    for (const criterion of usedCriteria) {
      matrix.scores[criterion] = services.map(service => ({
        serviceId: service.serviceId,
        score: service.score?.breakdown?.[criterion]?.score || 0,
        reasons: service.score?.breakdown?.[criterion]?.reasons || []
      }));
    }

    return matrix;
  }

  /**
   * Find best alternative services
   */
  findAlternatives(primaryService, candidateServices, requirements, preferences) {
    const alternatives = candidateServices.filter(service => 
      service.serviceId !== primaryService.serviceId &&
      service.serviceDefinition?.category === primaryService.serviceDefinition?.category
    );

    if (alternatives.length === 0) return [];

    const rankedAlternatives = this.rankServices(alternatives, requirements, preferences);
    
    return rankedAlternatives.slice(0, 3).map(alt => ({
      ...alt,
      comparisonWithPrimary: this.compareServices(primaryService, alt, requirements)
    }));
  }

  /**
   * Compare two services directly
   */
  compareServices(service1, service2, requirements) {
    const comparison = {
      cost: this.compareServiceCost(service1, service2, requirements),
      complexity: this.compareServiceComplexity(service1, service2),
      scalability: this.compareServiceScalability(service1, service2),
      performance: this.compareServicePerformance(service1, service2)
    };

    // Determine overall winner
    const scores = Object.values(comparison);
    const service1Wins = scores.filter(c => c.winner === 'service1').length;
    const service2Wins = scores.filter(c => c.winner === 'service2').length;

    comparison.overall = {
      winner: service1Wins > service2Wins ? 'service1' : 
              service2Wins > service1Wins ? 'service2' : 'tie',
      summary: `${service1.serviceDefinition?.name || service1.serviceId} vs ${service2.serviceDefinition?.name || service2.serviceId}`
    };

    return comparison;
  }

  compareServiceCost(service1, service2, requirements) {
    const cost1 = service1.score?.breakdown?.cost?.estimatedCost || 0;
    const cost2 = service2.score?.breakdown?.cost?.estimatedCost || 0;

    return {
      winner: cost1 < cost2 ? 'service1' : cost1 > cost2 ? 'service2' : 'tie',
      difference: Math.abs(cost1 - cost2),
      percentage: cost1 > 0 ? Math.round(Math.abs(cost1 - cost2) / Math.max(cost1, cost2) * 100) : 0
    };
  }

  compareServiceComplexity(service1, service2) {
    const complexity1 = service1.serviceDefinition?.complexity || 3;
    const complexity2 = service2.serviceDefinition?.complexity || 3;

    return {
      winner: complexity1 < complexity2 ? 'service1' : complexity1 > complexity2 ? 'service2' : 'tie',
      difference: Math.abs(complexity1 - complexity2)
    };
  }

  compareServiceScalability(service1, service2) {
    const scalability1 = service1.serviceDefinition?.scalability || 3;
    const scalability2 = service2.serviceDefinition?.scalability || 3;

    return {
      winner: scalability1 > scalability2 ? 'service1' : scalability1 < scalability2 ? 'service2' : 'tie',
      difference: Math.abs(scalability1 - scalability2)
    };
  }

  compareServicePerformance(service1, service2) {
    const perf1 = service1.score?.breakdown?.performance?.score || 0.5;
    const perf2 = service2.score?.breakdown?.performance?.score || 0.5;

    return {
      winner: perf1 > perf2 ? 'service1' : perf1 < perf2 ? 'service2' : 'tie',
      difference: Math.abs(perf1 - perf2)
    };
  }
}

/**
 * Service Recommendation Engine
 * Combines ranking with intelligent recommendations
 */
export class ServiceRecommendationEngine {
  constructor() {
    this.ranker = new ServiceRanker();
  }

  /**
   * Generate comprehensive service recommendations
   */
  generateRecommendations(services, requirements, preferences = {}, context = {}) {
    // Rank all services
    const rankedServices = this.ranker.rankServices(services, requirements, preferences, context);

    // Group by tier
    const recommendations = {
      primary: rankedServices.filter(s => s.tier === 'recommended'),
      alternative: rankedServices.filter(s => s.tier === 'suitable'),
      fallback: rankedServices.filter(s => s.tier === 'acceptable'),
      notRecommended: rankedServices.filter(s => s.tier === 'not-recommended')
    };

    // Add insights and explanations
    recommendations.insights = this.generateInsights(rankedServices, requirements, preferences);
    recommendations.tradeoffs = this.identifyTradeoffs(rankedServices);
    recommendations.optimizationSuggestions = this.generateOptimizationSuggestions(rankedServices, preferences);

    return recommendations;
  }

  /**
   * Generate insights about the recommendations
   */
  generateInsights(rankedServices, requirements, preferences) {
    const insights = [];

    // Cost insights
    const costs = rankedServices.map(s => s.score.breakdown.cost.estimatedCost).filter(Boolean);
    if (costs.length > 0) {
      const avgCost = costs.reduce((a, b) => a + b, 0) / costs.length;
      const minCost = Math.min(...costs);
      const maxCost = Math.max(...costs);

      insights.push({
        type: 'cost',
        message: `Monthly costs range from $${minCost} to $${maxCost}, averaging $${Math.round(avgCost)}`,
        impact: 'medium'
      });
    }

    // Complexity insights
    const complexServices = rankedServices.filter(s => 
      (s.serviceDefinition?.complexity || 3) >= 4
    );
    if (complexServices.length > 0 && preferences.complexity_tolerance <= 2) {
      insights.push({
        type: 'complexity',
        message: `${complexServices.length} services may be complex for your experience level`,
        impact: 'high',
        services: complexServices.map(s => s.serviceId)
      });
    }

    // Scalability insights
    if (requirements.traffic === 'high') {
      const lowScalabilityServices = rankedServices.filter(s => 
        (s.serviceDefinition?.scalability || 3) < 4
      );
      if (lowScalabilityServices.length > 0) {
        insights.push({
          type: 'scalability',
          message: `Consider alternatives for high traffic requirements`,
          impact: 'high',
          services: lowScalabilityServices.map(s => s.serviceId)
        });
      }
    }

    return insights;
  }

  /**
   * Identify key tradeoffs in the recommendations
   */
  identifyTradeoffs(rankedServices) {
    const tradeoffs = [];

    // Cost vs Performance tradeoff
    const highPerf = rankedServices.filter(s => s.score.breakdown.performance.score >= 0.8);
    const lowCost = rankedServices.filter(s => s.score.breakdown.cost.score >= 0.8);
    
    if (highPerf.length > 0 && lowCost.length > 0) {
      const overlap = highPerf.filter(s => lowCost.includes(s));
      if (overlap.length === 0) {
        tradeoffs.push({
          type: 'cost-vs-performance',
          message: 'Higher performance options typically cost more',
          highPerformance: highPerf.slice(0, 2).map(s => s.serviceId),
          lowCost: lowCost.slice(0, 2).map(s => s.serviceId)
        });
      }
    }

    // Simplicity vs Flexibility tradeoff
    const simple = rankedServices.filter(s => (s.serviceDefinition?.complexity || 3) <= 2);
    const flexible = rankedServices.filter(s => s.serviceDefinition?.category === 'compute');
    
    if (simple.length > 0 && flexible.length > 0) {
      tradeoffs.push({
        type: 'simplicity-vs-flexibility',
        message: 'Simpler services may offer less customization',
        simple: simple.slice(0, 2).map(s => s.serviceId),
        flexible: flexible.slice(0, 2).map(s => s.serviceId)
      });
    }

    return tradeoffs;
  }

  /**
   * Generate optimization suggestions
   */
  generateOptimizationSuggestions(rankedServices, preferences) {
    const suggestions = [];

    // Cost optimization suggestions
    if (preferences.cost_priority >= 4) {
      const expensiveServices = rankedServices.filter(s => 
        s.score.breakdown.cost.estimatedCost > 50
      );
      
      if (expensiveServices.length > 0) {
        suggestions.push({
          type: 'cost-optimization',
          message: 'Consider serverless alternatives to reduce costs',
          services: expensiveServices.map(s => s.serviceId),
          action: 'Replace with Lambda and managed services'
        });
      }
    }

    // Performance optimization suggestions
    if (preferences.performance_requirements >= 4) {
      suggestions.push({
        type: 'performance-optimization',
        message: 'Add caching and CDN for better performance',
        action: 'Consider ElastiCache and CloudFront'
      });
    }

    // Simplicity optimization suggestions
    if (preferences.complexity_tolerance <= 2) {
      suggestions.push({
        type: 'simplicity-optimization',
        message: 'Use fully managed services to reduce complexity',
        action: 'Prefer Lambda, RDS, and other managed services'
      });
    }

    return suggestions;
  }
}

// Export instances
export const serviceRanker = new ServiceRanker();
export const recommendationEngine = new ServiceRecommendationEngine();

export default {
  ServiceRanker,
  ServiceRecommendationEngine,
  serviceRanker,
  recommendationEngine
};