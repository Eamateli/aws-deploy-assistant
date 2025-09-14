// Regional Pricing Utilities
// Handle regional pricing variations and currency conversions

import { awsRegions, currencyRates } from '../data/awsPricing.js';

/**
 * Get regional pricing multiplier for a service
 * @param {string} serviceId - AWS service identifier
 * @param {string} region - AWS region
 * @returns {number} Pricing multiplier for the region
 */
export const getRegionalMultiplier = (serviceId, region) => {
  const regionInfo = awsRegions[region];
  if (!regionInfo) {
    console.warn(`Unknown region: ${region}, using default multiplier`);
    return 1.0;
  }

  // Some services have different regional variations
  const serviceSpecificMultipliers = {
    's3': getS3RegionalMultiplier(region),
    'cloudfront': getCloudFrontRegionalMultiplier(region),
    'ec2': getEC2RegionalMultiplier(region),
    'rds': getRDSRegionalMultiplier(region)
  };

  return serviceSpecificMultipliers[serviceId] || regionInfo.multiplier;
};

/**
 * S3 regional pricing variations
 */
const getS3RegionalMultiplier = (region) => {
  const s3Multipliers = {
    'us-east-1': 1.0,
    'us-east-2': 1.0,
    'us-west-1': 1.02,
    'us-west-2': 1.0,
    'eu-west-1': 1.02,
    'eu-west-2': 1.05,
    'eu-central-1': 1.08,
    'ap-southeast-1': 1.12,
    'ap-southeast-2': 1.15,
    'ap-northeast-1': 1.18
  };
  
  return s3Multipliers[region] || awsRegions[region]?.multiplier || 1.0;
};

/**
 * CloudFront regional pricing (based on edge location distribution)
 */
const getCloudFrontRegionalMultiplier = (region) => {
  // CloudFront pricing varies by geographic distribution, not origin region
  // But we can estimate based on primary user base location
  const cloudFrontMultipliers = {
    'us-east-1': 1.0,    // North America pricing
    'us-east-2': 1.0,
    'us-west-1': 1.0,
    'us-west-2': 1.0,
    'eu-west-1': 1.0,    // Europe pricing (same as NA for most tiers)
    'eu-west-2': 1.0,
    'eu-central-1': 1.0,
    'ap-southeast-1': 1.65, // Asia pricing is higher
    'ap-southeast-2': 1.65,
    'ap-northeast-1': 1.65
  };
  
  return cloudFrontMultipliers[region] || 1.0;
};

/**
 * EC2 regional pricing variations
 */
const getEC2RegionalMultiplier = (region) => {
  const ec2Multipliers = {
    'us-east-1': 1.0,
    'us-east-2': 1.0,
    'us-west-1': 1.05,
    'us-west-2': 1.0,
    'eu-west-1': 1.02,
    'eu-west-2': 1.05,
    'eu-central-1': 1.08,
    'ap-southeast-1': 1.15,
    'ap-southeast-2': 1.18,
    'ap-northeast-1': 1.20
  };
  
  return ec2Multipliers[region] || awsRegions[region]?.multiplier || 1.0;
};

/**
 * RDS regional pricing variations
 */
const getRDSRegionalMultiplier = (region) => {
  const rdsMultipliers = {
    'us-east-1': 1.0,
    'us-east-2': 1.0,
    'us-west-1': 1.05,
    'us-west-2': 1.0,
    'eu-west-1': 1.03,
    'eu-west-2': 1.06,
    'eu-central-1': 1.10,
    'ap-southeast-1': 1.18,
    'ap-southeast-2': 1.22,
    'ap-northeast-1': 1.25
  };
  
  return rdsMultipliers[region] || awsRegions[region]?.multiplier || 1.0;
};

/**
 * Convert price to different currency
 * @param {number} priceUSD - Price in USD
 * @param {string} targetCurrency - Target currency code
 * @returns {Object} Converted price with currency info
 */
export const convertCurrency = (priceUSD, targetCurrency = 'USD') => {
  const currencyInfo = currencyRates[targetCurrency];
  
  if (!currencyInfo) {
    console.warn(`Unknown currency: ${targetCurrency}, using USD`);
    return {
      amount: priceUSD,
      currency: 'USD',
      symbol: '$',
      rate: 1.0
    };
  }

  return {
    amount: priceUSD * currencyInfo.rate,
    currency: targetCurrency,
    symbol: currencyInfo.symbol,
    rate: currencyInfo.rate,
    originalUSD: priceUSD
  };
};

/**
 * Format price with currency symbol and appropriate decimal places
 * @param {number} amount - Price amount
 * @param {string} currency - Currency code
 * @param {Object} options - Formatting options
 * @returns {string} Formatted price string
 */
export const formatPrice = (amount, currency = 'USD', options = {}) => {
  const {
    showCurrency = true,
    decimalPlaces = 2,
    showSymbol = true
  } = options;

  const currencyInfo = currencyRates[currency] || currencyRates['USD'];
  
  // Determine appropriate decimal places based on currency
  let decimals = decimalPlaces;
  if (currency === 'JPY' || currency === 'KRW') {
    decimals = 0; // These currencies don't use decimal places
  }
  
  const formattedAmount = amount.toFixed(decimals);
  
  if (showSymbol) {
    return `${currencyInfo.symbol}${formattedAmount}${showCurrency && currency !== 'USD' ? ` ${currency}` : ''}`;
  } else {
    return `${formattedAmount} ${currency}`;
  }
};

/**
 * Get regional cost comparison for multiple regions
 * @param {number} basePrice - Base price in USD
 * @param {string} serviceId - Service identifier
 * @param {Array} regions - Array of regions to compare
 * @returns {Array} Regional price comparison
 */
export const getRegionalComparison = (basePrice, serviceId, regions = null) => {
  const compareRegions = regions || Object.keys(awsRegions);
  
  return compareRegions.map(region => {
    const multiplier = getRegionalMultiplier(serviceId, region);
    const regionalPrice = basePrice * multiplier;
    const regionInfo = awsRegions[region];
    
    return {
      region: region,
      regionName: regionInfo?.name || region,
      price: regionalPrice,
      multiplier: multiplier,
      savings: basePrice - regionalPrice,
      savingsPercentage: ((basePrice - regionalPrice) / basePrice) * 100,
      freeTierAvailable: regionInfo?.freeTierRegion || false
    };
  }).sort((a, b) => a.price - b.price); // Sort by price (cheapest first)
};

/**
 * Find the most cost-effective region for a service
 * @param {number} basePrice - Base price in USD
 * @param {string} serviceId - Service identifier
 * @param {Object} constraints - Regional constraints
 * @returns {Object} Recommended region with cost analysis
 */
export const findCostEffectiveRegion = (basePrice, serviceId, constraints = {}) => {
  const {
    allowedRegions = null,
    requireFreeTier = false,
    latencyRequirements = null,
    complianceRequirements = null
  } = constraints;

  let candidateRegions = Object.keys(awsRegions);
  
  // Apply constraints
  if (allowedRegions) {
    candidateRegions = candidateRegions.filter(region => allowedRegions.includes(region));
  }
  
  if (requireFreeTier) {
    candidateRegions = candidateRegions.filter(region => awsRegions[region].freeTierRegion);
  }
  
  // Apply compliance constraints (simplified)
  if (complianceRequirements) {
    if (complianceRequirements.includes('GDPR')) {
      candidateRegions = candidateRegions.filter(region => region.startsWith('eu-'));
    }
    if (complianceRequirements.includes('US-only')) {
      candidateRegions = candidateRegions.filter(region => region.startsWith('us-'));
    }
  }
  
  // Get regional comparison
  const comparison = getRegionalComparison(basePrice, serviceId, candidateRegions);
  
  if (comparison.length === 0) {
    return {
      error: 'No regions match the specified constraints',
      constraints: constraints
    };
  }
  
  const cheapestRegion = comparison[0];
  const mostExpensiveRegion = comparison[comparison.length - 1];
  
  return {
    recommended: cheapestRegion,
    alternatives: comparison.slice(1, 4), // Top 3 alternatives
    savings: {
      absolute: mostExpensiveRegion.price - cheapestRegion.price,
      percentage: ((mostExpensiveRegion.price - cheapestRegion.price) / mostExpensiveRegion.price) * 100
    },
    comparison: comparison,
    constraints: constraints
  };
};

/**
 * Calculate data transfer costs between regions
 * @param {string} sourceRegion - Source region
 * @param {string} destinationRegion - Destination region
 * @param {number} dataGB - Data transfer in GB
 * @returns {Object} Data transfer cost analysis
 */
export const calculateDataTransferCosts = (sourceRegion, destinationRegion, dataGB) => {
  // Simplified data transfer pricing
  const dataTransferRates = {
    sameRegion: 0,           // Free within same region
    crossRegion: 0.02,       // $0.02 per GB between regions
    internet: 0.09,          // $0.09 per GB to internet
    cloudfront: 0            // Free to CloudFront
  };
  
  let rate = dataTransferRates.internet; // Default to internet rate
  let transferType = 'internet';
  
  if (sourceRegion === destinationRegion) {
    rate = dataTransferRates.sameRegion;
    transferType = 'same-region';
  } else if (awsRegions[sourceRegion] && awsRegions[destinationRegion]) {
    rate = dataTransferRates.crossRegion;
    transferType = 'cross-region';
  }
  
  const cost = dataGB * rate;
  
  return {
    sourceRegion: sourceRegion,
    destinationRegion: destinationRegion,
    dataGB: dataGB,
    rate: rate,
    cost: cost,
    transferType: transferType,
    description: getTransferDescription(transferType)
  };
};

/**
 * Get description for transfer type
 */
const getTransferDescription = (transferType) => {
  const descriptions = {
    'same-region': 'Data transfer within the same AWS region (free)',
    'cross-region': 'Data transfer between different AWS regions',
    'internet': 'Data transfer from AWS to the internet',
    'cloudfront': 'Data transfer from AWS to CloudFront (free)'
  };
  
  return descriptions[transferType] || 'Data transfer cost';
};

/**
 * Get currency exchange rate trends (simulated)
 * @param {string} baseCurrency - Base currency (usually USD)
 * @param {string} targetCurrency - Target currency
 * @param {number} days - Number of days of historical data
 * @returns {Array} Exchange rate trend data
 */
export const getCurrencyTrends = (baseCurrency = 'USD', targetCurrency = 'EUR', days = 30) => {
  const baseRate = currencyRates[targetCurrency]?.rate || 1.0;
  const trends = [];
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Simulate rate fluctuation (±5% from base rate)
    const fluctuation = (Math.random() - 0.5) * 0.1; // ±5%
    const rate = baseRate * (1 + fluctuation);
    
    trends.push({
      date: date.toISOString().split('T')[0],
      rate: rate,
      change: i === days ? 0 : rate - trends[trends.length - 1]?.rate || 0
    });
  }
  
  return trends;
};

/**
 * Calculate cost impact of currency fluctuations
 * @param {number} monthlyUSDCost - Monthly cost in USD
 * @param {string} targetCurrency - Target currency
 * @param {number} fluctuationPercent - Expected fluctuation percentage
 * @returns {Object} Currency risk analysis
 */
export const calculateCurrencyRisk = (monthlyUSDCost, targetCurrency, fluctuationPercent = 5) => {
  const currentRate = currencyRates[targetCurrency]?.rate || 1.0;
  const currentCost = monthlyUSDCost * currentRate;
  
  const worstCaseRate = currentRate * (1 + fluctuationPercent / 100);
  const bestCaseRate = currentRate * (1 - fluctuationPercent / 100);
  
  const worstCaseCost = monthlyUSDCost * worstCaseRate;
  const bestCaseCost = monthlyUSDCost * bestCaseRate;
  
  return {
    currentCost: currentCost,
    worstCaseCost: worstCaseCost,
    bestCaseCost: bestCaseCost,
    potentialIncrease: worstCaseCost - currentCost,
    potentialDecrease: currentCost - bestCaseCost,
    riskPercentage: fluctuationPercent,
    currency: targetCurrency,
    recommendation: fluctuationPercent > 10 ? 
      'Consider hedging currency risk for large deployments' :
      'Currency risk is manageable for this cost level'
  };
};

export default {
  getRegionalMultiplier,
  convertCurrency,
  formatPrice,
  getRegionalComparison,
  findCostEffectiveRegion,
  calculateDataTransferCosts,
  getCurrencyTrends,
  calculateCurrencyRisk
};