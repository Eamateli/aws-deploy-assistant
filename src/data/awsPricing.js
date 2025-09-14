// AWS Pricing Database
// Comprehensive pricing data for major AWS services with regional variations

/**
 * AWS Regions with pricing multipliers
 */
export const awsRegions = {
  'us-east-1': {
    name: 'US East (N. Virginia)',
    multiplier: 1.0,
    currency: 'USD',
    freeTierRegion: true
  },
  'us-east-2': {
    name: 'US East (Ohio)',
    multiplier: 1.0,
    currency: 'USD',
    freeTierRegion: true
  },
  'us-west-1': {
    name: 'US West (N. California)',
    multiplier: 1.05,
    currency: 'USD',
    freeTierRegion: true
  },
  'us-west-2': {
    name: 'US West (Oregon)',
    multiplier: 1.0,
    currency: 'USD',
    freeTierRegion: true
  },
  'eu-west-1': {
    name: 'Europe (Ireland)',
    multiplier: 1.02,
    currency: 'USD',
    freeTierRegion: true
  },
  'eu-west-2': {
    name: 'Europe (London)',
    multiplier: 1.05,
    currency: 'USD',
    freeTierRegion: true
  },
  'eu-central-1': {
    name: 'Europe (Frankfurt)',
    multiplier: 1.08,
    currency: 'USD',
    freeTierRegion: true
  },
  'ap-southeast-1': {
    name: 'Asia Pacific (Singapore)',
    multiplier: 1.12,
    currency: 'USD',
    freeTierRegion: true
  },
  'ap-southeast-2': {
    name: 'Asia Pacific (Sydney)',
    multiplier: 1.15,
    currency: 'USD',
    freeTierRegion: true
  },
  'ap-northeast-1': {
    name: 'Asia Pacific (Tokyo)',
    multiplier: 1.18,
    currency: 'USD',
    freeTierRegion: true
  }
};

/**
 * Free Tier Limits for AWS Services
 */
export const freeTierLimits = {
  ec2: {
    hours: 750, // per month
    instanceTypes: ['t2.micro', 't3.micro'],
    duration: 12 // months
  },
  s3: {
    storage: 5, // GB
    requests: {
      get: 20000,
      put: 2000
    },
    dataTransfer: 15, // GB out
    duration: 12 // months
  },
  lambda: {
    requests: 1000000, // per month
    computeTime: 400000, // GB-seconds per month
    duration: 'always'
  },
  rds: {
    hours: 750, // per month
    instanceTypes: ['db.t2.micro', 'db.t3.micro'],
    storage: 20, // GB
    duration: 12 // months
  },
  dynamodb: {
    storage: 25, // GB
    readCapacity: 25, // RCU
    writeCapacity: 25, // WCU
    duration: 'always'
  },
  cloudfront: {
    dataTransfer: 1000, // GB per month
    requests: 10000000, // per month
    duration: 12 // months
  },
  apiGateway: {
    requests: 1000000, // per month
    duration: 12 // months
  },
  cloudwatch: {
    metrics: 10,
    alarms: 10,
    logs: 5, // GB
    duration: 'always'
  }
};

/**
 * AWS Service Pricing Data
 */
export const awsServicePricing = {
  // Compute Services
  ec2: {
    name: 'Amazon EC2',
    category: 'compute',
    pricingModel: 'hourly',
    instances: {
      't2.micro': {
        vcpu: 1,
        memory: 1,
        pricePerHour: 0.0116,
        freeTierEligible: true
      },
      't2.small': {
        vcpu: 1,
        memory: 2,
        pricePerHour: 0.023
      },
      't2.medium': {
        vcpu: 2,
        memory: 4,
        pricePerHour: 0.0464
      },
      't3.micro': {
        vcpu: 2,
        memory: 1,
        pricePerHour: 0.0104,
        freeTierEligible: true
      },
      't3.small': {
        vcpu: 2,
        memory: 2,
        pricePerHour: 0.0208
      },
      't3.medium': {
        vcpu: 2,
        memory: 4,
        pricePerHour: 0.0416
      },
      't3.large': {
        vcpu: 2,
        memory: 8,
        pricePerHour: 0.0832
      },
      'm5.large': {
        vcpu: 2,
        memory: 8,
        pricePerHour: 0.096
      },
      'm5.xlarge': {
        vcpu: 4,
        memory: 16,
        pricePerHour: 0.192
      },
      'c5.large': {
        vcpu: 2,
        memory: 4,
        pricePerHour: 0.085
      }
    },
    storage: {
      gp3: {
        pricePerGBMonth: 0.08,
        iopsPrice: 0.005, // per provisioned IOPS per month
        throughputPrice: 0.04 // per MB/s per month
      },
      gp2: {
        pricePerGBMonth: 0.10
      }
    }
  },

  lambda: {
    name: 'AWS Lambda',
    category: 'compute',
    pricingModel: 'usage',
    pricing: {
      requests: 0.0000002, // per request
      computeTime: 0.0000166667, // per GB-second
      provisioned: {
        concurrency: 0.0000097222, // per GB-hour
        requests: 0.0000002 // per request
      }
    },
    freeTier: freeTierLimits.lambda
  },

  ecs: {
    name: 'Amazon ECS',
    category: 'compute',
    pricingModel: 'resource',
    fargate: {
      vcpu: 0.04048, // per vCPU per hour
      memory: 0.004445 // per GB per hour
    },
    ec2: {
      // Uses EC2 pricing + no additional charge for ECS
      additionalCharge: 0
    }
  },

  // Storage Services
  s3: {
    name: 'Amazon S3',
    category: 'storage',
    pricingModel: 'usage',
    storage: {
      standard: {
        first50TB: 0.023, // per GB per month
        next450TB: 0.022,
        over500TB: 0.021
      },
      standardIA: {
        pricePerGB: 0.0125,
        retrievalFee: 0.01 // per GB retrieved
      },
      glacier: {
        pricePerGB: 0.004,
        retrievalFee: 0.03 // per GB retrieved
      }
    },
    requests: {
      put: 0.0005, // per 1000 requests
      get: 0.0004, // per 1000 requests
      delete: 0, // free
      list: 0.0005 // per 1000 requests
    },
    dataTransfer: {
      out: {
        first1GB: 0, // free
        next9GB: 0.09, // per GB
        next40GB: 0.085,
        next100GB: 0.07,
        over150GB: 0.05
      },
      cloudfront: 0, // free to CloudFront
      sameRegion: 0 // free within same region
    },
    freeTier: freeTierLimits.s3
  },

  // Database Services
  rds: {
    name: 'Amazon RDS',
    category: 'database',
    pricingModel: 'hourly',
    instances: {
      'db.t2.micro': {
        vcpu: 1,
        memory: 1,
        pricePerHour: 0.017,
        freeTierEligible: true
      },
      'db.t3.micro': {
        vcpu: 2,
        memory: 1,
        pricePerHour: 0.017,
        freeTierEligible: true
      },
      'db.t3.small': {
        vcpu: 2,
        memory: 2,
        pricePerHour: 0.034
      },
      'db.t3.medium': {
        vcpu: 2,
        memory: 4,
        pricePerHour: 0.068
      },
      'db.r5.large': {
        vcpu: 2,
        memory: 16,
        pricePerHour: 0.126
      }
    },
    storage: {
      gp2: {
        pricePerGBMonth: 0.115
      },
      gp3: {
        pricePerGBMonth: 0.115,
        iopsPrice: 0.20, // per provisioned IOPS per month
        throughputPrice: 2.50 // per MB/s per month
      }
    },
    backup: {
      pricePerGBMonth: 0.095
    },
    freeTier: freeTierLimits.rds
  },

  dynamodb: {
    name: 'Amazon DynamoDB',
    category: 'database',
    pricingModel: 'capacity',
    onDemand: {
      readRequests: 0.25, // per million read request units
      writeRequests: 1.25, // per million write request units
      storage: 0.25 // per GB per month
    },
    provisioned: {
      readCapacity: 0.00013, // per RCU per hour
      writeCapacity: 0.00065, // per WCU per hour
      storage: 0.25 // per GB per month
    },
    freeTier: freeTierLimits.dynamodb
  },

  // Networking Services
  cloudfront: {
    name: 'Amazon CloudFront',
    category: 'networking',
    pricingModel: 'usage',
    dataTransfer: {
      northAmerica: {
        first10TB: 0.085, // per GB
        next40TB: 0.080,
        next100TB: 0.060,
        next350TB: 0.040,
        over500TB: 0.030
      },
      europe: {
        first10TB: 0.085,
        next40TB: 0.080,
        next100TB: 0.060,
        next350TB: 0.040,
        over500TB: 0.030
      },
      asia: {
        first10TB: 0.140,
        next40TB: 0.135,
        next100TB: 0.120,
        next350TB: 0.100,
        over500TB: 0.080
      }
    },
    requests: {
      http: 0.0075, // per 10,000 requests
      https: 0.0100 // per 10,000 requests
    },
    freeTier: freeTierLimits.cloudfront
  },

  alb: {
    name: 'Application Load Balancer',
    category: 'networking',
    pricingModel: 'fixed_plus_usage',
    pricing: {
      hourly: 0.0225, // per hour
      lcu: 0.008 // per LCU per hour
    }
  },

  apiGateway: {
    name: 'API Gateway',
    category: 'networking',
    pricingModel: 'usage',
    rest: {
      requests: 3.50, // per million requests
      caching: {
        '0.5GB': 0.02, // per hour
        '1.6GB': 0.038,
        '6.1GB': 0.20,
        '13.5GB': 0.25,
        '28.4GB': 0.50,
        '58.2GB': 1.00,
        '118GB': 1.90,
        '237GB': 3.80
      }
    },
    websocket: {
      messages: 1.00, // per million messages
      connections: 0.25 // per million connection minutes
    },
    freeTier: freeTierLimits.apiGateway
  },

  route53: {
    name: 'Amazon Route 53',
    category: 'networking',
    pricingModel: 'usage',
    pricing: {
      hostedZone: 0.50, // per hosted zone per month
      queries: {
        standard: 0.40, // per million queries
        latency: 0.60,
        geolocation: 0.70,
        weighted: 0.60,
        alias: 0 // free
      },
      healthChecks: {
        basic: 0.50, // per health check per month
        calculated: 1.00
      }
    }
  },

  // Security Services
  cognito: {
    name: 'Amazon Cognito',
    category: 'security',
    pricingModel: 'usage',
    userPools: {
      mau: 0.0055, // per monthly active user
      freeTier: 50000 // MAU
    },
    identityPools: {
      syncOperations: 0.15 // per 10,000 sync operations
    }
  },

  // Monitoring Services
  cloudwatch: {
    name: 'Amazon CloudWatch',
    category: 'monitoring',
    pricingModel: 'usage',
    metrics: {
      standard: 0.30, // per metric per month
      detailed: 0.30,
      custom: 0.30
    },
    alarms: {
      standard: 0.10, // per alarm per month
      highResolution: 0.30
    },
    logs: {
      ingestion: 0.50, // per GB ingested
      storage: 0.03, // per GB per month
      insights: 0.005 // per GB scanned
    },
    dashboards: {
      perDashboard: 3.00 // per dashboard per month
    },
    freeTier: freeTierLimits.cloudwatch
  }
};

/**
 * Traffic-based usage patterns for cost calculations
 */
export const trafficPatterns = {
  low: {
    name: 'Low Traffic',
    description: 'Personal projects, small websites',
    monthly: {
      pageViews: 1000,
      uniqueUsers: 100,
      dataTransfer: 1, // GB
      apiRequests: 10000,
      storageUsage: 1, // GB
      computeHours: 100
    }
  },
  medium: {
    name: 'Medium Traffic',
    description: 'Small business, growing applications',
    monthly: {
      pageViews: 50000,
      uniqueUsers: 5000,
      dataTransfer: 50, // GB
      apiRequests: 500000,
      storageUsage: 10, // GB
      computeHours: 500
    }
  },
  high: {
    name: 'High Traffic',
    description: 'Popular applications, enterprise use',
    monthly: {
      pageViews: 1000000,
      uniqueUsers: 100000,
      dataTransfer: 1000, // GB
      apiRequests: 10000000,
      storageUsage: 100, // GB
      computeHours: 2000
    }
  },
  enterprise: {
    name: 'Enterprise Traffic',
    description: 'Large scale applications',
    monthly: {
      pageViews: 10000000,
      uniqueUsers: 1000000,
      dataTransfer: 10000, // GB
      apiRequests: 100000000,
      storageUsage: 1000, // GB
      computeHours: 8760 // 24/7
    }
  }
};

/**
 * Currency conversion rates (USD base)
 */
export const currencyRates = {
  USD: { symbol: '$', rate: 1.0, name: 'US Dollar' },
  EUR: { symbol: '€', rate: 0.85, name: 'Euro' },
  GBP: { symbol: '£', rate: 0.73, name: 'British Pound' },
  JPY: { symbol: '¥', rate: 110.0, name: 'Japanese Yen' },
  CAD: { symbol: 'C$', rate: 1.25, name: 'Canadian Dollar' },
  AUD: { symbol: 'A$', rate: 1.35, name: 'Australian Dollar' },
  INR: { symbol: '₹', rate: 74.0, name: 'Indian Rupee' },
  BRL: { symbol: 'R$', rate: 5.2, name: 'Brazilian Real' }
};

export default {
  awsRegions,
  freeTierLimits,
  awsServicePricing,
  trafficPatterns,
  currencyRates
};