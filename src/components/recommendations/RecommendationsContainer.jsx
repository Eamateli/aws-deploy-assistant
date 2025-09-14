import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  BarChart3, 
  Settings, 
  Filter, 
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Info,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import ArchitectureRecommendation from './ArchitectureRecommendation';
import ArchitectureComparison from './ArchitectureComparison';
import { patternMatcher, serviceOptimizer } from '../../utils/patternMatching';
import { serviceRanker, recommendationEngine } from '../../utils/serviceRanking';

/**
 * RecommendationsContainer - Main container for architecture recommendations
 * Orchestrates the recommendation generation and display process
 */
const RecommendationsContainer = ({ 
  analysisResult, 
  onRecommendationSelect, 
  onViewDeployment,
  preferences = {},
  className = '' 
}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'comparison'
  const [filterCriteria, setFilterCriteria] = useState({
    maxCost: null,
    maxComplexity: 5,
    minScalability: 1,
    optimizationFocus: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Generate recommendations when analysis result changes
  useEffect(() => {
    if (analysisResult) {
      generateRecommendations();
    }
  }, [analysisResult, preferences]);

  const generateRecommendations = async () => {
    setLoading(true);
    
    try {
      // Step 1: Match architecture patterns
      const patternMatches = patternMatcher.matchPatterns(analysisResult, preferences);
      
      // Step 2: Generate optimized variants for top patterns
      const allRecommendations = [];
      
      for (const match of patternMatches.slice(0, 3)) { // Top 3 patterns
        // Generate base recommendation
        const baseServices = serviceOptimizer.selectBaseServices(match.pattern, analysisResult.requirements);
        const rankedServices = serviceRanker.rankServices(baseServices, analysisResult.requirements, preferences);
        
        const baseRecommendation = {
          id: `${match.pattern.id}-base`,
          name: match.pattern.name,
          description: match.pattern.description,
          variant: 'base',
          pattern: match.pattern,
          services: rankedServices,
          characteristics: match.pattern.characteristics,
          costEstimate: calculateTotalCost(rankedServices, analysisResult.requirements),
          pros: match.pattern.pros,
          cons: match.pattern.cons,
          confidence: match.confidence,
          score: match.score,
          reasons: match.reasons,
          warnings: match.warnings
        };
        
        allRecommendations.push(baseRecommendation);
        
        // Generate optimized variants
        const variants = serviceOptimizer.generateOptimizedVariants(
          match.pattern, 
          analysisResult.requirements, 
          preferences
        );
        
        allRecommendations.push(...variants);
      }
      
      // Step 3: Rank all recommendations
      const rankedRecommendations = rankRecommendations(allRecommendations);
      
      // Step 4: Apply filters
      const filteredRecommendations = applyFilters(rankedRecommendations);
      
      setRecommendations(filteredRecommendations);
      
      // Auto-select the top recommendation
      if (filteredRecommendations.length > 0) {
        setSelectedRecommendation(filteredRecommendations[0]);
      }
      
    } catch (error) {
      console.error('Error generating recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalCost = (services, requirements) => {
    const traffic = requirements.traffic || 'low';
    const trafficMultipliers = { low: 1, medium: 2, high: 4 };
    const multiplier = trafficMultipliers[traffic];
    
    let totalCost = 0;
    const breakdown = [];
    
    for (const service of services) {
      const serviceDefinition = service.serviceDefinition;
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
  };

  const rankRecommendations = (recommendations) => {
    // Calculate suitability scores
    const scoredRecommendations = recommendations.map(rec => {
      let suitabilityScore = rec.confidence || 0.8;
      
      // Adjust based on preferences
      if (preferences.cost_priority >= 4 && rec.variant === 'cost-optimized') {
        suitabilityScore += 0.2;
      }
      
      if (preferences.performance_requirements >= 4 && rec.variant === 'performance-optimized') {
        suitabilityScore += 0.2;
      }
      
      if (preferences.complexity_tolerance <= 2 && rec.variant === 'simplicity-optimized') {
        suitabilityScore += 0.2;
      }
      
      return {
        ...rec,
        suitabilityScore: Math.min(suitabilityScore, 1.0)
      };
    });
    
    // Sort by suitability score
    const sorted = scoredRecommendations.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
    
    // Add rank and tier
    return sorted.map((rec, index) => ({
      ...rec,
      rank: index + 1,
      tier: index === 0 ? 'recommended' : 
            index <= 2 ? 'suitable' : 
            index <= 4 ? 'acceptable' : 'not-recommended'
    }));
  };

  const applyFilters = (recommendations) => {
    return recommendations.filter(rec => {
      // Cost filter
      if (filterCriteria.maxCost && rec.costEstimate.monthly > filterCriteria.maxCost) {
        return false;
      }
      
      // Complexity filter
      if (rec.characteristics.complexity > filterCriteria.maxComplexity) {
        return false;
      }
      
      // Scalability filter
      if (rec.characteristics.scalability < filterCriteria.minScalability) {
        return false;
      }
      
      // Optimization focus filter
      if (filterCriteria.optimizationFocus !== 'all' && 
          rec.variant !== filterCriteria.optimizationFocus) {
        return false;
      }
      
      return true;
    });
  };

  const handleRecommendationSelect = (recommendation) => {
    setSelectedRecommendation(recommendation);
    onRecommendationSelect?.(recommendation);
  };

  const handleFilterChange = (newFilters) => {
    setFilterCriteria({ ...filterCriteria, ...newFilters });
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Generating Recommendations
          </h3>
          <p className="text-gray-600">
            Analyzing your requirements and matching optimal AWS architectures...
          </p>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Recommendations Found
        </h3>
        <p className="text-gray-600 mb-4">
          We couldn't generate suitable recommendations based on your analysis.
        </p>
        <button
          onClick={generateRecommendations}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              AWS Architecture Recommendations
            </h2>
            <p className="text-gray-600">
              Based on your {analysisResult.detected?.name || 'application'}, 
              we've identified {recommendations.length} suitable architecture options.
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors
                ${showFilters 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <Filter size={16} />
              <span>Filters</span>
            </button>
            
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`
                  px-4 py-2 text-sm font-medium transition-colors
                  ${viewMode === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode('comparison')}
                className={`
                  px-4 py-2 text-sm font-medium transition-colors
                  ${viewMode === 'comparison' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                Compare
              </button>
            </div>
          </div>
        </div>

        {/* Analysis Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="text-blue-600" size={20} />
              <span className="font-medium text-blue-900">Detected Pattern</span>
            </div>
            <div className="text-sm text-blue-800">
              {analysisResult.detected?.name || 'Unknown'}
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="text-green-600" size={20} />
              <span className="font-medium text-green-900">Confidence</span>
            </div>
            <div className="text-sm text-green-800">
              {Math.round((analysisResult.confidence || 0.8) * 100)}%
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="text-purple-600" size={20} />
              <span className="font-medium text-purple-900">Traffic Level</span>
            </div>
            <div className="text-sm text-purple-800 capitalize">
              {analysisResult.requirements?.traffic || 'Low'}
            </div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="text-orange-600" size={20} />
              <span className="font-medium text-orange-900">Est. Cost Range</span>
            </div>
            <div className="text-sm text-orange-800">
              ${Math.min(...recommendations.map(r => r.costEstimate.monthly))} - 
              ${Math.max(...recommendations.map(r => r.costEstimate.monthly))}/mo
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Monthly Cost
                </label>
                <select
                  value={filterCriteria.maxCost || ''}
                  onChange={(e) => handleFilterChange({ 
                    maxCost: e.target.value ? parseInt(e.target.value) : null 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">No limit</option>
                  <option value="25">Under $25</option>
                  <option value="50">Under $50</option>
                  <option value="100">Under $100</option>
                  <option value="200">Under $200</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Complexity
                </label>
                <select
                  value={filterCriteria.maxComplexity}
                  onChange={(e) => handleFilterChange({ maxComplexity: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="2">Simple (1-2)</option>
                  <option value="3">Moderate (1-3)</option>
                  <option value="4">Advanced (1-4)</option>
                  <option value="5">Any complexity</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Scalability
                </label>
                <select
                  value={filterCriteria.minScalability}
                  onChange={(e) => handleFilterChange({ minScalability: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="1">Any scalability</option>
                  <option value="3">Moderate (3+)</option>
                  <option value="4">High (4+)</option>
                  <option value="5">Maximum (5)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Optimization Focus
                </label>
                <select
                  value={filterCriteria.optimizationFocus}
                  onChange={(e) => handleFilterChange({ optimizationFocus: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All variants</option>
                  <option value="base">Base recommendations</option>
                  <option value="cost-optimized">Cost optimized</option>
                  <option value="performance-optimized">Performance optimized</option>
                  <option value="simplicity-optimized">Simplicity optimized</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recommendations Display */}
      {viewMode === 'list' ? (
        <div className="space-y-6">
          {recommendations.map((recommendation) => (
            <ArchitectureRecommendation
              key={recommendation.id}
              recommendation={recommendation}
              isSelected={selectedRecommendation?.id === recommendation.id}
              onSelect={handleRecommendationSelect}
              onViewDeployment={onViewDeployment}
              showServices={true}
            />
          ))}
        </div>
      ) : (
        <ArchitectureComparison
          architectures={recommendations.slice(0, 3)}
          selectedArchitecture={selectedRecommendation}
          onSelect={handleRecommendationSelect}
        />
      )}

      {/* Action Bar */}
      {selectedRecommendation && (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Ready to proceed with {selectedRecommendation.name}?
              </h3>
              <p className="text-gray-600">
                Estimated monthly cost: ${selectedRecommendation.costEstimate.monthly} • 
                Setup time: {selectedRecommendation.pattern?.deployment?.timeEstimate || '30 minutes'}
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => onViewDeployment?.(selectedRecommendation)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                View Deployment Guide
              </button>
              
              <button
                onClick={() => handleRecommendationSelect(selectedRecommendation)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
              >
                <span>Continue with This Architecture</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationsContainer;