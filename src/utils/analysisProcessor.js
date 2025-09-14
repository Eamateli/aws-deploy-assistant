// Analysis result processing and validation utilities

/**
 * AnalysisValidator - Validates analysis results and confidence scores
 */
export class AnalysisValidator {
  constructor() {
    this.thresholds = {
      minimum: 0.3,    // Minimum confidence to consider valid
      good: 0.6,       // Good confidence level
      excellent: 0.8   // Excellent confidence level
    };

    this.requiredFields = {
      framework: ['framework', 'confidence'],
      appType: ['appType', 'confidence'],
      infrastructure: ['requirements', 'complexity', 'confidence']
    };
  }

  /**
   * Validate complete analysis result
   */
  validateAnalysis(analysisResult) {
    const validation = {
      isValid: true,
      confidence: 'unknown',
      issues: [],
      warnings: [],
      suggestions: []
    };

    try {
      // Check required structure
      this.validateStructure(analysisResult, validation);
      
      // Validate individual components
      this.validateFrameworkResult(analysisResult.framework, validation);
      this.validateAppTypeResult(analysisResult.appType, validation);
      this.validateInfrastructureResult(analysisResult.infrastructure, validation);
      
      // Validate overall confidence
      this.validateOverallConfidence(analysisResult.confidence, validation);
      
      // Check for consistency between results
      this.validateConsistency(analysisResult, validation);
      
      // Determine confidence level
      validation.confidence = this.determineConfidenceLevel(analysisResult.confidence);
      
      // Generate suggestions for improvement
      this.generateSuggestions(analysisResult, validation);

    } catch (error) {
      validation.isValid = false;
      validation.issues.push(`Validation error: ${error.message}`);
    }

    return validation;
  }

  /**
   * Validate basic structure
   */
  validateStructure(result, validation) {
    const requiredTopLevel = ['framework', 'appType', 'infrastructure', 'confidence', 'timestamp'];
    
    for (const field of requiredTopLevel) {
      if (!(field in result)) {
        validation.issues.push(`Missing required field: ${field}`);
        validation.isValid = false;
      }
    }

    // Check timestamp validity
    if (result.timestamp) {
      const timestamp = new Date(result.timestamp);
      if (isNaN(timestamp.getTime())) {
        validation.warnings.push('Invalid timestamp format');
      }
    }
  }

  /**
   * Validate framework detection result
   */
  validateFrameworkResult(framework, validation) {
    if (!framework) {
      validation.issues.push('Framework result is missing');
      validation.isValid = false;
      return;
    }

    // Check required fields
    for (const field of this.requiredFields.framework) {
      if (!(field in framework)) {
        validation.issues.push(`Framework missing field: ${field}`);
        validation.isValid = false;
      }
    }

    // Validate confidence range
    if (typeof framework.confidence !== 'number' || 
        framework.confidence < 0 || 
        framework.confidence > 1) {
      validation.issues.push('Framework confidence must be between 0 and 1');
      validation.isValid = false;
    }

    // Check for unknown framework with low confidence
    if (framework.framework === 'unknown' && framework.confidence > 0.5) {
      validation.warnings.push('Unknown framework detected with high confidence - may indicate detection error');
    }

    // Validate alternatives structure
    if (framework.alternatives && !Array.isArray(framework.alternatives)) {
      validation.warnings.push('Framework alternatives should be an array');
    }
  }

  /**
   * Validate app type detection result
   */
  validateAppTypeResult(appType, validation) {
    if (!appType) {
      validation.issues.push('App type result is missing');
      validation.isValid = false;
      return;
    }

    // Check required fields
    for (const field of this.requiredFields.appType) {
      if (!(field in appType)) {
        validation.issues.push(`App type missing field: ${field}`);
        validation.isValid = false;
      }
    }

    // Validate confidence range
    if (typeof appType.confidence !== 'number' || 
        appType.confidence < 0 || 
        appType.confidence > 1) {
      validation.issues.push('App type confidence must be between 0 and 1');
      validation.isValid = false;
    }

    // Validate known app types
    const validAppTypes = ['spa', 'ssr', 'api', 'fullstack', 'static', 'unknown'];
    if (!validAppTypes.includes(appType.appType)) {
      validation.warnings.push(`Unexpected app type: ${appType.appType}`);
    }
  }

  /**
   * Validate infrastructure detection result
   */
  validateInfrastructureResult(infrastructure, validation) {
    if (!infrastructure) {
      validation.issues.push('Infrastructure result is missing');
      validation.isValid = false;
      return;
    }

    // Check required fields
    for (const field of this.requiredFields.infrastructure) {
      if (!(field in infrastructure)) {
        validation.issues.push(`Infrastructure missing field: ${field}`);
        validation.isValid = false;
      }
    }

    // Validate confidence range
    if (typeof infrastructure.confidence !== 'number' || 
        infrastructure.confidence < 0 || 
        infrastructure.confidence > 1) {
      validation.issues.push('Infrastructure confidence must be between 0 and 1');
      validation.isValid = false;
    }

    // Validate complexity range
    if (typeof infrastructure.complexity !== 'number' || 
        infrastructure.complexity < 1 || 
        infrastructure.complexity > 5) {
      validation.issues.push('Infrastructure complexity must be between 1 and 5');
      validation.isValid = false;
    }

    // Validate requirements structure
    if (infrastructure.requirements && typeof infrastructure.requirements !== 'object') {
      validation.issues.push('Infrastructure requirements must be an object');
      validation.isValid = false;
    }
  }

  /**
   * Validate overall confidence
   */
  validateOverallConfidence(confidence, validation) {
    if (typeof confidence !== 'number' || confidence < 0 || confidence > 1) {
      validation.issues.push('Overall confidence must be between 0 and 1');
      validation.isValid = false;
    }

    if (confidence < this.thresholds.minimum) {
      validation.warnings.push('Overall confidence is very low - results may be unreliable');
    }
  }

  /**
   * Validate consistency between results
   */
  validateConsistency(result, validation) {
    const { framework, appType, infrastructure } = result;

    // Check framework-appType consistency
    if (framework.framework === 'react' && appType.appType === 'api') {
      validation.warnings.push('React framework detected but app type is API - may indicate full-stack app');
    }

    if (framework.framework === 'nodejs' && appType.appType === 'spa') {
      validation.warnings.push('Node.js framework detected but app type is SPA - may indicate SSR or full-stack');
    }

    // Check infrastructure-appType consistency
    if (appType.appType === 'static' && infrastructure.requirements?.database) {
      validation.warnings.push('Static site detected but database requirements found - may be incorrect');
    }

    if (appType.appType === 'api' && !infrastructure.requirements?.database) {
      validation.suggestions.push('API detected without database - consider if data persistence is needed');
    }

    // Check confidence consistency
    const confidences = [framework.confidence, appType.confidence, infrastructure.confidence];
    const maxDiff = Math.max(...confidences) - Math.min(...confidences);
    
    if (maxDiff > 0.5) {
      validation.warnings.push('Large confidence difference between detection components - results may be inconsistent');
    }
  }

  /**
   * Determine confidence level description
   */
  determineConfidenceLevel(confidence) {
    if (confidence >= this.thresholds.excellent) return 'excellent';
    if (confidence >= this.thresholds.good) return 'good';
    if (confidence >= this.thresholds.minimum) return 'fair';
    return 'low';
  }

  /**
   * Generate improvement suggestions
   */
  generateSuggestions(result, validation) {
    const { framework, appType, infrastructure } = result;

    // Low confidence suggestions
    if (framework.confidence < this.thresholds.good) {
      validation.suggestions.push('Consider uploading more source files to improve framework detection');
    }

    if (appType.confidence < this.thresholds.good) {
      validation.suggestions.push('Include routing or API files to better determine application type');
    }

    if (infrastructure.confidence < this.thresholds.good) {
      validation.suggestions.push('Add configuration files (docker-compose.yml, .env) to improve infrastructure detection');
    }

    // Missing information suggestions
    if (framework.framework === 'unknown') {
      validation.suggestions.push('Upload package.json or main application files for better framework detection');
    }

    if (!infrastructure.requirements || Object.keys(infrastructure.requirements).length === 0) {
      validation.suggestions.push('Consider adding database, authentication, or storage requirements to your description');
    }
  }
}

/**
 * ResultCombiner - Combines multiple analysis results and handles conflicts
 */
export class ResultCombiner {
  constructor() {
    this.combineStrategies = {
      framework: this.combineFrameworkResults.bind(this),
      appType: this.combineAppTypeResults.bind(this),
      infrastructure: this.combineInfrastructureResults.bind(this)
    };
  }

  /**
   * Combine multiple analysis results
   */
  combineResults(results) {
    if (!Array.isArray(results) || results.length === 0) {
      throw new Error('Results must be a non-empty array');
    }

    if (results.length === 1) {
      return results[0];
    }

    const combined = {
      timestamp: new Date().toISOString(),
      framework: this.combineFrameworkResults(results.map(r => r.framework)),
      appType: this.combineAppTypeResults(results.map(r => r.appType)),
      infrastructure: this.combineInfrastructureResults(results.map(r => r.infrastructure)),
      confidence: 0,
      sources: results.length,
      input: this.combineInputInfo(results.map(r => r.input))
    };

    // Calculate combined confidence
    combined.confidence = this.calculateCombinedConfidence(combined);

    return combined;
  }

  /**
   * Combine framework detection results
   */
  combineFrameworkResults(frameworks) {
    const frameworkCounts = {};
    let totalConfidence = 0;
    let totalWeight = 0;

    // Count occurrences and weight by confidence
    for (const fw of frameworks) {
      if (!fw || fw.framework === 'unknown') continue;

      const framework = fw.framework;
      const confidence = fw.confidence || 0;

      if (!frameworkCounts[framework]) {
        frameworkCounts[framework] = {
          count: 0,
          totalConfidence: 0,
          maxConfidence: 0,
          alternatives: []
        };
      }

      frameworkCounts[framework].count++;
      frameworkCounts[framework].totalConfidence += confidence;
      frameworkCounts[framework].maxConfidence = Math.max(
        frameworkCounts[framework].maxConfidence, 
        confidence
      );

      totalConfidence += confidence;
      totalWeight++;

      // Collect alternatives
      if (fw.alternatives) {
        frameworkCounts[framework].alternatives.push(...fw.alternatives);
      }
    }

    // Find best framework
    let bestFramework = 'unknown';
    let bestScore = 0;
    const alternatives = [];

    for (const [framework, data] of Object.entries(frameworkCounts)) {
      // Score = (count weight * avg confidence) + max confidence boost
      const avgConfidence = data.totalConfidence / data.count;
      const score = (data.count / frameworks.length * 0.6) + (avgConfidence * 0.4);

      if (score > bestScore) {
        if (bestFramework !== 'unknown') {
          alternatives.push({
            framework: bestFramework,
            confidence: bestScore,
            name: bestFramework
          });
        }
        bestFramework = framework;
        bestScore = score;
      } else {
        alternatives.push({
          framework: framework,
          confidence: score,
          name: framework
        });
      }
    }

    return {
      framework: bestFramework,
      name: bestFramework,
      confidence: bestScore,
      score: bestScore,
      alternatives: alternatives.sort((a, b) => b.confidence - a.confidence)
    };
  }

  /**
   * Combine app type detection results
   */
  combineAppTypeResults(appTypes) {
    const typeCounts = {};
    
    for (const at of appTypes) {
      if (!at || at.appType === 'unknown') continue;

      const appType = at.appType;
      const confidence = at.confidence || 0;

      if (!typeCounts[appType]) {
        typeCounts[appType] = {
          count: 0,
          totalConfidence: 0,
          maxConfidence: 0
        };
      }

      typeCounts[appType].count++;
      typeCounts[appType].totalConfidence += confidence;
      typeCounts[appType].maxConfidence = Math.max(
        typeCounts[appType].maxConfidence,
        confidence
      );
    }

    // Find best app type
    let bestAppType = 'unknown';
    let bestScore = 0;
    const alternatives = [];

    for (const [appType, data] of Object.entries(typeCounts)) {
      const avgConfidence = data.totalConfidence / data.count;
      const score = (data.count / appTypes.length * 0.5) + (avgConfidence * 0.5);

      if (score > bestScore) {
        if (bestAppType !== 'unknown') {
          alternatives.push({
            appType: bestAppType,
            confidence: bestScore,
            name: bestAppType
          });
        }
        bestAppType = appType;
        bestScore = score;
      } else {
        alternatives.push({
          appType: appType,
          confidence: score,
          name: appType
        });
      }
    }

    return {
      appType: bestAppType,
      name: bestAppType,
      confidence: bestScore,
      score: bestScore,
      alternatives: alternatives.sort((a, b) => b.confidence - a.confidence)
    };
  }

  /**
   * Combine infrastructure detection results
   */
  combineInfrastructureResults(infrastructures) {
    const combinedRequirements = {};
    const complexities = [];
    const confidences = [];

    for (const infra of infrastructures) {
      if (!infra) continue;

      // Combine requirements
      if (infra.requirements) {
        for (const [type, req] of Object.entries(infra.requirements)) {
          if (!combinedRequirements[type]) {
            combinedRequirements[type] = {
              required: false,
              confidence: 0,
              type: type,
              sources: 0
            };
          }

          combinedRequirements[type].sources++;
          combinedRequirements[type].confidence = Math.max(
            combinedRequirements[type].confidence,
            req.confidence || 0
          );

          if (req.required) {
            combinedRequirements[type].required = true;
          }
        }
      }

      if (typeof infra.complexity === 'number') {
        complexities.push(infra.complexity);
      }

      if (typeof infra.confidence === 'number') {
        confidences.push(infra.confidence);
      }
    }

    // Calculate combined metrics
    const avgComplexity = complexities.length > 0 
      ? Math.round(complexities.reduce((sum, c) => sum + c, 0) / complexities.length)
      : 1;

    const avgConfidence = confidences.length > 0
      ? confidences.reduce((sum, c) => sum + c, 0) / confidences.length
      : 0;

    return {
      requirements: combinedRequirements,
      complexity: Math.min(Math.max(avgComplexity, 1), 5),
      confidence: avgConfidence
    };
  }

  /**
   * Combine input information
   */
  combineInputInfo(inputs) {
    const combined = {
      type: 'combined',
      fileCount: 0,
      hasDescription: false,
      sources: inputs.length
    };

    for (const input of inputs) {
      if (input) {
        combined.fileCount += input.fileCount || 0;
        combined.hasDescription = combined.hasDescription || input.hasDescription || false;
      }
    }

    return combined;
  }

  /**
   * Calculate combined confidence score
   */
  calculateCombinedConfidence(combined) {
    const weights = [0.4, 0.3, 0.3]; // Framework, AppType, Infrastructure
    const confidences = [
      combined.framework.confidence,
      combined.appType.confidence,
      combined.infrastructure.confidence
    ];

    let weightedSum = 0;
    let totalWeight = 0;

    confidences.forEach((confidence, index) => {
      if (confidence > 0) {
        weightedSum += confidence * weights[index];
        totalWeight += weights[index];
      }
    });

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }
}

/**
 * FallbackHandler - Handles low confidence scenarios and provides fallbacks
 */
export class FallbackHandler {
  constructor() {
    this.fallbackStrategies = {
      framework: this.getFrameworkFallback.bind(this),
      appType: this.getAppTypeFallback.bind(this),
      infrastructure: this.getInfrastructureFallback.bind(this)
    };

    this.defaultRecommendations = {
      unknown: {
        framework: 'react',
        appType: 'spa',
        infrastructure: {
          requirements: {},
          complexity: 1,
          confidence: 0.1
        }
      }
    };
  }

  /**
   * Handle low confidence analysis results
   */
  handleLowConfidence(analysisResult, validation) {
    const handled = {
      ...analysisResult,
      fallbacksApplied: [],
      originalConfidence: analysisResult.confidence,
      suggestions: validation.suggestions || []
    };

    // Apply fallbacks for low confidence components
    if (analysisResult.framework.confidence < 0.3) {
      handled.framework = this.getFrameworkFallback(analysisResult);
      handled.fallbacksApplied.push('framework');
    }

    if (analysisResult.appType.confidence < 0.3) {
      handled.appType = this.getAppTypeFallback(analysisResult);
      handled.fallbacksApplied.push('appType');
    }

    if (analysisResult.infrastructure.confidence < 0.3) {
      handled.infrastructure = this.getInfrastructureFallback(analysisResult);
      handled.fallbacksApplied.push('infrastructure');
    }

    // Recalculate confidence with fallbacks
    handled.confidence = this.calculateFallbackConfidence(handled);

    // Add fallback-specific suggestions
    this.addFallbackSuggestions(handled);

    return handled;
  }

  /**
   * Get framework fallback based on other detected patterns
   */
  getFrameworkFallback(result) {
    // If app type suggests SPA, default to React
    if (result.appType.appType === 'spa') {
      return {
        framework: 'react',
        name: 'React',
        confidence: 0.4,
        fallback: true,
        reason: 'SPA detected, defaulting to React'
      };
    }

    // If app type suggests API, default to Node.js
    if (result.appType.appType === 'api') {
      return {
        framework: 'nodejs',
        name: 'Node.js',
        confidence: 0.4,
        fallback: true,
        reason: 'API detected, defaulting to Node.js'
      };
    }

    // If static site, no framework needed
    if (result.appType.appType === 'static') {
      return {
        framework: 'none',
        name: 'Static HTML/CSS/JS',
        confidence: 0.5,
        fallback: true,
        reason: 'Static site detected'
      };
    }

    // Default fallback
    return {
      framework: 'react',
      name: 'React',
      confidence: 0.3,
      fallback: true,
      reason: 'Default fallback for web applications'
    };
  }

  /**
   * Get app type fallback based on detected framework
   */
  getAppTypeFallback(result) {
    const framework = result.framework.framework;

    // Frontend frameworks suggest SPA
    if (['react', 'vue', 'angular'].includes(framework)) {
      return {
        appType: 'spa',
        name: 'Single Page Application',
        confidence: 0.4,
        fallback: true,
        reason: `${framework} framework suggests SPA`
      };
    }

    // Backend frameworks suggest API
    if (['nodejs', 'python', 'php'].includes(framework)) {
      return {
        appType: 'api',
        name: 'API/Backend Service',
        confidence: 0.4,
        fallback: true,
        reason: `${framework} framework suggests API`
      };
    }

    // Default to SPA for web applications
    return {
      appType: 'spa',
      name: 'Single Page Application',
      confidence: 0.3,
      fallback: true,
      reason: 'Default fallback for web applications'
    };
  }

  /**
   * Get infrastructure fallback based on app type and framework
   */
  getInfrastructureFallback(result) {
    const requirements = {};
    let complexity = 1;

    // Add basic requirements based on app type
    if (result.appType.appType === 'api') {
      requirements.database = {
        required: true,
        confidence: 0.3,
        type: 'database',
        fallback: true
      };
      complexity = 2;
    }

    if (result.appType.appType === 'fullstack') {
      requirements.database = {
        required: true,
        confidence: 0.4,
        type: 'database',
        fallback: true
      };
      requirements.auth = {
        required: true,
        confidence: 0.3,
        type: 'auth',
        fallback: true
      };
      complexity = 3;
    }

    return {
      requirements: requirements,
      complexity: complexity,
      confidence: 0.3,
      fallback: true,
      reason: `Basic infrastructure for ${result.appType.appType} application`
    };
  }

  /**
   * Calculate confidence with fallbacks applied
   */
  calculateFallbackConfidence(result) {
    const weights = [0.4, 0.3, 0.3];
    const confidences = [
      result.framework.confidence,
      result.appType.confidence,
      result.infrastructure.confidence
    ];

    // Apply penalty for fallbacks
    const fallbackPenalty = result.fallbacksApplied.length * 0.1;
    
    let weightedSum = 0;
    let totalWeight = 0;

    confidences.forEach((confidence, index) => {
      if (confidence > 0) {
        weightedSum += confidence * weights[index];
        totalWeight += weights[index];
      }
    });

    const baseConfidence = totalWeight > 0 ? weightedSum / totalWeight : 0;
    return Math.max(baseConfidence - fallbackPenalty, 0.1);
  }

  /**
   * Add suggestions specific to fallback scenarios
   */
  addFallbackSuggestions(result) {
    if (result.fallbacksApplied.includes('framework')) {
      result.suggestions.push('Framework detection used fallback - upload more source files for better accuracy');
    }

    if (result.fallbacksApplied.includes('appType')) {
      result.suggestions.push('App type detection used fallback - include routing or API files for better classification');
    }

    if (result.fallbacksApplied.includes('infrastructure')) {
      result.suggestions.push('Infrastructure detection used fallback - add configuration files or describe your requirements');
    }

    // General improvement suggestions
    result.suggestions.push('Consider providing a more detailed description of your application');
    result.suggestions.push('Upload additional configuration files (package.json, docker-compose.yml, .env)');
  }
}

/**
 * AnalysisCache - Caches analysis results for optimization
 */
export class AnalysisCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  /**
   * Generate cache key from input
   */
  generateKey(input) {
    const keyData = {
      description: input.description || '',
      fileCount: input.files?.length || 0,
      fileNames: input.files?.map(f => f.name).sort() || [],
      contentHash: this.hashContent(input.files || [])
    };

    return JSON.stringify(keyData);
  }

  /**
   * Get cached result
   */
  get(input) {
    const key = this.generateKey(input);
    const cached = this.cache.get(key);

    if (cached && this.isValidCache(cached)) {
      // Move to end (LRU)
      this.cache.delete(key);
      this.cache.set(key, cached);
      return cached.result;
    }

    return null;
  }

  /**
   * Set cache result
   */
  set(input, result) {
    const key = this.generateKey(input);
    
    // Remove oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      result: result,
      timestamp: Date.now(),
      ttl: 30 * 60 * 1000 // 30 minutes
    });
  }

  /**
   * Check if cached result is still valid
   */
  isValidCache(cached) {
    return Date.now() - cached.timestamp < cached.ttl;
  }

  /**
   * Hash file content for cache key
   */
  hashContent(files) {
    let hash = 0;
    const content = files.map(f => f.content || '').join('');
    
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return hash.toString();
  }

  /**
   * Clear cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.hitRate || 0
    };
  }
}

/**
 * Main AnalysisProcessor - Coordinates all processing utilities
 */
export class AnalysisProcessor {
  constructor(options = {}) {
    this.validator = new AnalysisValidator();
    this.combiner = new ResultCombiner();
    this.fallbackHandler = new FallbackHandler();
    this.cache = new AnalysisCache(options.cacheSize || 100);
    
    this.options = {
      enableCache: options.enableCache !== false,
      enableFallbacks: options.enableFallbacks !== false,
      strictValidation: options.strictValidation || false
    };
  }

  /**
   * Process analysis result with validation and fallbacks
   */
  processAnalysis(analysisResult, input = null) {
    try {
      // Check cache first
      if (this.options.enableCache && input) {
        const cached = this.cache.get(input);
        if (cached) {
          return {
            ...cached,
            fromCache: true
          };
        }
      }

      // Validate the analysis result
      const validation = this.validator.validateAnalysis(analysisResult);
      
      let processed = {
        ...analysisResult,
        validation: validation,
        processed: true,
        processingTimestamp: new Date().toISOString()
      };

      // Apply fallbacks if needed and enabled
      if (this.options.enableFallbacks && 
          (validation.confidence === 'low' || !validation.isValid)) {
        processed = this.fallbackHandler.handleLowConfidence(processed, validation);
      }

      // Cache the result
      if (this.options.enableCache && input) {
        this.cache.set(input, processed);
      }

      return processed;

    } catch (error) {
      return {
        ...analysisResult,
        validation: {
          isValid: false,
          confidence: 'error',
          issues: [`Processing error: ${error.message}`],
          warnings: [],
          suggestions: []
        },
        processed: true,
        processingError: error.message
      };
    }
  }

  /**
   * Process multiple analysis results
   */
  processMultipleAnalyses(results, input = null) {
    try {
      // Combine multiple results
      const combined = this.combiner.combineResults(results);
      
      // Process the combined result
      return this.processAnalysis(combined, input);

    } catch (error) {
      return {
        validation: {
          isValid: false,
          confidence: 'error',
          issues: [`Multi-analysis processing error: ${error.message}`],
          warnings: [],
          suggestions: []
        },
        processed: true,
        processingError: error.message
      };
    }
  }

  /**
   * Generate alternative suggestions
   */
  generateAlternatives(analysisResult) {
    const alternatives = [];

    // Framework alternatives
    if (analysisResult.framework.alternatives) {
      for (const alt of analysisResult.framework.alternatives.slice(0, 2)) {
        alternatives.push({
          type: 'framework',
          suggestion: alt.framework,
          confidence: alt.confidence,
          reason: `Alternative framework detection with ${(alt.confidence * 100).toFixed(0)}% confidence`
        });
      }
    }

    // App type alternatives
    if (analysisResult.appType.alternatives) {
      for (const alt of analysisResult.appType.alternatives.slice(0, 2)) {
        alternatives.push({
          type: 'appType',
          suggestion: alt.appType,
          confidence: alt.confidence,
          reason: `Alternative app type with ${(alt.confidence * 100).toFixed(0)}% confidence`
        });
      }
    }

    // Infrastructure alternatives based on app type
    if (analysisResult.appType.appType === 'spa' && 
        analysisResult.infrastructure.requirements?.database) {
      alternatives.push({
        type: 'infrastructure',
        suggestion: 'Consider if database is really needed for SPA',
        confidence: 0.7,
        reason: 'SPAs typically use external APIs for data'
      });
    }

    return alternatives.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Get processing statistics
   */
  getStats() {
    return {
      cache: this.cache.getStats(),
      options: this.options
    };
  }
}