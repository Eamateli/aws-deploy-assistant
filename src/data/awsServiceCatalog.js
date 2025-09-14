// AWS Service Catalog with Icons and Metadata
// Comprehensive catalog of AWS services with official icons and service information

/**
 * AWS Service Categories
 */
export const serviceCategories = {
  compute: {
    name: 'Compute',
    color: '#FF9900',
    icon: 'cpu'
  },
  storage: {
    name: 'Storage',
    color: '#3F48CC',
    icon: 'hard-drive'
  },
  database: {
    name: 'Database',
    color: '#C925D1',
    icon: 'database'
  },
  networking: {
    name: 'Networking & Content Delivery',
    color: '#9D5AAE',
    icon: 'globe'
  },
  security: {
    name: 'Security, Identity & Compliance',
    color: '#DD344C',
    icon: 'shield'
  },
  monitoring: {
    name: 'Management & Governance',
    color: '#759C3E',
    icon: 'bar-chart3'
  },
  analytics: {
    name: 'Analytics',
    color: '#8C4FFF',
    icon: 'trending-up'
  },
  ml: {
    name: 'Machine Learning',
    color: '#01A88D',
    icon: 'cpu'
  }
};

/**
 * AWS Service Definitions with Icons
 * Icons reference AWS official service icons or Lucide React fallbacks
 */
export const awsServices = {
  // Compute Services
  ec2: {
    id: 'ec2',
    name: 'Amazon EC2',
    fullName: 'Amazon Elastic Compute Cloud',
    category: 'compute',
    description: 'Scalable virtual servers in the cloud',
    icon: 'server', // Lucide React icon
    awsIcon: 'ec2.svg', // AWS official icon
    complexity: 3,
    scalability: 5,
    reliability: 4,
    useCases: ['web servers', 'application hosting', 'batch processing'],
    pricing: {
      model: 'hourly',
      startingPrice: 0.0116,
      unit: 'per hour',
      freeTier: '750 hours/month for 12 months'
    }
  },

  lambda: {
    id: 'lambda',
    name: 'AWS Lambda',
    fullName: 'AWS Lambda',
    category: 'compute',
    description: 'Run code without thinking about servers',
    icon: 'zap',
    awsIcon: 'lambda.svg',
    complexity: 2,
    scalability: 5,
    reliability: 5,
    useCases: ['serverless functions', 'event processing', 'microservices'],
    pricing: {
      model: 'usage',
      startingPrice: 0.0000002,
      unit: 'per request',
      freeTier: '1M requests/month always free'
    }
  },

  ecs: {
    id: 'ecs',
    name: 'Amazon ECS',
    fullName: 'Amazon Elastic Container Service',
    category: 'compute',
    description: 'Run and scale containerized applications',
    icon: 'layers',
    awsIcon: 'ecs.svg',
    complexity: 4,
    scalability: 5,
    reliability: 4,
    useCases: ['containerized apps', 'microservices', 'batch processing'],
    pricing: {
      model: 'resource',
      startingPrice: 0.04048,
      unit: 'per vCPU per hour',
      freeTier: 'No additional charges for ECS'
    }
  },

  // Storage Services
  s3: {
    id: 's3',
    name: 'Amazon S3',
    fullName: 'Amazon Simple Storage Service',
    category: 'storage',
    description: 'Object storage built to store and retrieve any amount of data',
    icon: 'hard-drive',
    awsIcon: 's3.svg',
    complexity: 2,
    scalability: 5,
    reliability: 5,
    useCases: ['static websites', 'backup', 'data archiving', 'content distribution'],
    pricing: {
      model: 'usage',
      startingPrice: 0.023,
      unit: 'per GB per month',
      freeTier: '5 GB storage for 12 months'
    }
  },

  // Database Services
  rds: {
    id: 'rds',
    name: 'Amazon RDS',
    fullName: 'Amazon Relational Database Service',
    category: 'database',
    description: 'Managed relational database service',
    icon: 'database',
    awsIcon: 'rds.svg',
    complexity: 3,
    scalability: 4,
    reliability: 5,
    useCases: ['web applications', 'e-commerce', 'data warehousing'],
    pricing: {
      model: 'hourly',
      startingPrice: 0.017,
      unit: 'per hour',
      freeTier: '750 hours/month for 12 months'
    }
  },

  dynamodb: {
    id: 'dynamodb',
    name: 'Amazon DynamoDB',
    fullName: 'Amazon DynamoDB',
    category: 'database',
    description: 'Fast and flexible NoSQL database service',
    icon: 'database',
    awsIcon: 'dynamodb.svg',
    complexity: 2,
    scalability: 5,
    reliability: 5,
    useCases: ['mobile apps', 'web apps', 'gaming', 'IoT'],
    pricing: {
      model: 'capacity',
      startingPrice: 0.25,
      unit: 'per million read requests',
      freeTier: '25 GB storage always free'
    }
  },

  // Networking Services
  cloudfront: {
    id: 'cloudfront',
    name: 'Amazon CloudFront',
    fullName: 'Amazon CloudFront',
    category: 'networking',
    description: 'Global content delivery network (CDN)',
    icon: 'globe',
    awsIcon: 'cloudfront.svg',
    complexity: 2,
    scalability: 5,
    reliability: 5,
    useCases: ['website acceleration', 'video streaming', 'API acceleration'],
    pricing: {
      model: 'usage',
      startingPrice: 0.085,
      unit: 'per GB data transfer',
      freeTier: '1 TB data transfer for 12 months'
    }
  },

  alb: {
    id: 'alb',
    name: 'Application Load Balancer',
    fullName: 'Elastic Load Balancing - Application Load Balancer',
    category: 'networking',
    description: 'Distribute incoming application traffic',
    icon: 'network',
    awsIcon: 'elb.svg',
    complexity: 3,
    scalability: 5,
    reliability: 5,
    useCases: ['web applications', 'microservices', 'containerized apps'],
    pricing: {
      model: 'fixed_plus_usage',
      startingPrice: 0.0225,
      unit: 'per hour',
      freeTier: 'None'
    }
  },

  apiGateway: {
    id: 'api-gateway',
    name: 'API Gateway',
    fullName: 'Amazon API Gateway',
    category: 'networking',
    description: 'Create, publish, maintain, monitor, and secure APIs',
    icon: 'globe',
    awsIcon: 'api-gateway.svg',
    complexity: 3,
    scalability: 5,
    reliability: 5,
    useCases: ['REST APIs', 'WebSocket APIs', 'serverless backends'],
    pricing: {
      model: 'usage',
      startingPrice: 3.50,
      unit: 'per million requests',
      freeTier: '1M requests/month for 12 months'
    }
  },

  route53: {
    id: 'route53',
    name: 'Amazon Route 53',
    fullName: 'Amazon Route 53',
    category: 'networking',
    description: 'Scalable domain name system (DNS) web service',
    icon: 'globe',
    awsIcon: 'route53.svg',
    complexity: 2,
    scalability: 5,
    reliability: 5,
    useCases: ['domain registration', 'DNS routing', 'health checking'],
    pricing: {
      model: 'usage',
      startingPrice: 0.50,
      unit: 'per hosted zone per month',
      freeTier: 'None'
    }
  },

  // Security Services
  cognito: {
    id: 'cognito',
    name: 'Amazon Cognito',
    fullName: 'Amazon Cognito',
    category: 'security',
    description: 'Identity management for your web and mobile apps',
    icon: 'shield',
    awsIcon: 'cognito.svg',
    complexity: 3,
    scalability: 5,
    reliability: 5,
    useCases: ['user authentication', 'user management', 'access control'],
    pricing: {
      model: 'usage',
      startingPrice: 0.0055,
      unit: 'per monthly active user',
      freeTier: '50,000 MAU always free'
    }
  },

  // Monitoring Services
  cloudwatch: {
    id: 'cloudwatch',
    name: 'Amazon CloudWatch',
    fullName: 'Amazon CloudWatch',
    category: 'monitoring',
    description: 'Monitoring and observability service',
    icon: 'bar-chart3',
    awsIcon: 'cloudwatch.svg',
    complexity: 2,
    scalability: 5,
    reliability: 5,
    useCases: ['application monitoring', 'log management', 'performance tracking'],
    pricing: {
      model: 'usage',
      startingPrice: 0.30,
      unit: 'per metric per month',
      freeTier: '10 metrics and 10 alarms always free'
    }
  }
};

/**
 * Architecture Patterns with Service Mappings
 */
export const architecturePatterns = {
  'static-spa': {
    id: 'static-spa',
    name: 'Static SPA Hosting',
    description: 'Host static single-page applications with global CDN',
    complexity: 1,
    cost: { min: 5, max: 25, typical: 15 },
    services: ['s3', 'cloudfront', 'route53'],
    primaryServices: ['s3', 'cloudfront'],
    optionalServices: ['route53'],
    useCases: ['React apps', 'Vue apps', 'Angular apps', 'static websites']
  },

  'serverless-api': {
    id: 'serverless-api',
    name: 'Serverless API',
    description: 'Scalable serverless API with managed database',
    complexity: 2,
    cost: { min: 10, max: 100, typical: 35 },
    services: ['lambda', 'api-gateway', 'dynamodb', 'cloudwatch'],
    primaryServices: ['lambda', 'api-gateway', 'dynamodb'],
    optionalServices: ['cloudwatch'],
    useCases: ['REST APIs', 'microservices', 'mobile backends']
  },

  'traditional-stack': {
    id: 'traditional-stack',
    name: 'Traditional Web Stack',
    description: 'Classic web application with load balancer and database',
    complexity: 3,
    cost: { min: 50, max: 200, typical: 100 },
    services: ['ec2', 'alb', 'rds', 's3', 'cloudwatch'],
    primaryServices: ['ec2', 'alb', 'rds'],
    optionalServices: ['s3', 'cloudwatch'],
    useCases: ['web applications', 'e-commerce sites', 'content management']
  },

  'container-stack': {
    id: 'container-stack',
    name: 'Containerized Application',
    description: 'Modern containerized deployment with orchestration',
    complexity: 4,
    cost: { min: 75, max: 300, typical: 150 },
    services: ['ecs', 'alb', 'rds', 's3', 'cloudwatch'],
    primaryServices: ['ecs', 'alb', 'rds'],
    optionalServices: ['s3', 'cloudwatch'],
    useCases: ['microservices', 'containerized apps', 'scalable backends']
  }
};

/**
 * Service Icon Utilities
 */
export const getServiceIcon = (serviceId) => {
  const service = awsServices[serviceId];
  if (!service) return 'server';
  
  // Return Lucide React icon name for now
  // In production, this would return the AWS official icon path
  return service.icon;
};

export const getServiceIconUrl = (serviceId) => {
  const service = awsServices[serviceId];
  if (!service) return null;
  
  // Return AWS official icon URL
  return `/aws-icons/${service.awsIcon}`;
};

export const getCategoryIcon = (categoryId) => {
  const category = serviceCategories[categoryId];
  return category ? category.icon : 'server';
};

export const getCategoryColor = (categoryId) => {
  const category = serviceCategories[categoryId];
  return category ? category.color : '#FF9900';
};

/**
 * Service Filtering and Search
 */
export const getServicesByCategory = (categoryId) => {
  return Object.values(awsServices).filter(service => service.category === categoryId);
};

export const getServicesForPattern = (patternId) => {
  const pattern = architecturePatterns[patternId];
  if (!pattern) return [];
  
  return pattern.services.map(serviceId => awsServices[serviceId]).filter(Boolean);
};

export const searchServices = (query) => {
  const lowercaseQuery = query.toLowerCase();
  return Object.values(awsServices).filter(service => 
    service.name.toLowerCase().includes(lowercaseQuery) ||
    service.description.toLowerCase().includes(lowercaseQuery) ||
    service.useCases.some(useCase => useCase.toLowerCase().includes(lowercaseQuery))
  );
};

export default {
  serviceCategories,
  awsServices,
  architecturePatterns,
  getServiceIcon,
  getServiceIconUrl,
  getCategoryIcon,
  getCategoryColor,
  getServicesByCategory,
  getServicesForPattern,
  searchServices
};