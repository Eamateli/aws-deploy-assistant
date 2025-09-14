/**
 * AWS Architecture Patterns
 * Optimized for dynamic loading and tree shaking
 */

import { 
  S3Icon, CloudFrontIcon, Route53Icon, LambdaIcon, APIGatewayIcon, 
  DynamoDBIcon, CloudWatchIcon, EC2Icon, ALBIcon, RDSIcon, 
  ECSIcon, FargateIcon
} from '../assets/aws-icons';

export const architecturePatterns = {
  'static-spa': {
    id: 'static-spa',
    name: 'Static SPA Hosting',
    description: 'Serverless hosting for React/Vue SPAs using S3 and CloudFront',
    services: [
      { name: 'S3', purpose: 'Static hosting', icon: S3Icon, cost: '$0.023/GB', category: 'storage' },
      { name: 'CloudFront', purpose: 'Global CDN', icon: CloudFrontIcon, cost: '$0.085/GB', category: 'networking' },
      { name: 'Route53', purpose: 'DNS management', icon: Route53Icon, cost: '$0.50/hosted zone', category: 'networking' }
    ],
    complexity: 2,
    cost: { min: 5, max: 25, typical: 12 },
    deploymentTime: '15-30 minutes',
    scalability: 5,
    pros: ['Extremely cost-effective', 'Automatic scaling', 'Global CDN', 'HTTPS included'],
    cons: ['Static content only', 'No server-side processing', 'Limited to frontend apps']
  },
  'serverless-api': {
    id: 'serverless-api',
    name: 'Serverless API',
    description: 'Pay-per-request API using Lambda and API Gateway',
    services: [
      { name: 'Lambda', purpose: 'Serverless compute', icon: LambdaIcon, cost: '$0.20/1M requests', category: 'compute' },
      { name: 'API Gateway', purpose: 'API management', icon: APIGatewayIcon, cost: '$3.50/1M requests', category: 'networking' },
      { name: 'DynamoDB', purpose: 'NoSQL database', icon: DynamoDBIcon, cost: '$0.25/GB', category: 'database' },
      { name: 'CloudWatch', purpose: 'Monitoring', icon: CloudWatchIcon, cost: '$0.50/GB logs', category: 'monitoring' }
    ],
    complexity: 3,
    cost: { min: 10, max: 100, typical: 35 },
    deploymentTime: '30-45 minutes',
    scalability: 5,
    pros: ['Pay per use', 'Auto-scaling', 'No server management', 'Built-in monitoring'],
    cons: ['Cold start latency', 'Vendor lock-in', 'Complex debugging', '15-minute timeout limit']
  },
  'traditional-stack': {
    id: 'traditional-stack',
    name: 'Traditional Stack',
    description: 'Classic setup with EC2, Load Balancer, and RDS',
    services: [
      { name: 'EC2', purpose: 'Virtual servers', icon: EC2Icon, cost: '$8.5/month (t3.small)', category: 'compute' },
      { name: 'ALB', purpose: 'Load balancing', icon: ALBIcon, cost: '$16/month + $0.008/LCU', category: 'networking' },
      { name: 'RDS', purpose: 'Managed database', icon: RDSIcon, cost: '$15/month (t3.micro)', category: 'database' },
      { name: 'S3', purpose: 'File storage', icon: S3Icon, cost: '$0.023/GB', category: 'storage' }
    ],
    complexity: 4,
    cost: { min: 50, max: 200, typical: 95 },
    deploymentTime: '1-2 hours',
    scalability: 4,
    pros: ['Full control', 'Predictable performance', 'Any technology stack', 'Easy debugging'],
    cons: ['Higher base cost', 'Server management required', 'Manual scaling', 'Security responsibility']
  },
  'container-stack': {
    id: 'container-stack',
    name: 'Container Platform',
    description: 'Modern containerized deployment with ECS and Fargate',
    services: [
      { name: 'ECS', purpose: 'Container orchestration', icon: ECSIcon, cost: 'No additional charge', category: 'compute' },
      { name: 'Fargate', purpose: 'Serverless containers', icon: FargateIcon, cost: '$0.04048/vCPU/hour', category: 'compute' },
      { name: 'ALB', purpose: 'Load balancing', icon: ALBIcon, cost: '$16/month + $0.008/LCU', category: 'networking' },
      { name: 'RDS', purpose: 'Managed database', icon: RDSIcon, cost: '$15/month (t3.micro)', category: 'database' }
    ],
    complexity: 4,
    cost: { min: 75, max: 250, typical: 120 },
    deploymentTime: '45-90 minutes',
    scalability: 5,
    pros: ['Container benefits', 'Auto-scaling', 'No server management', 'Easy CI/CD'],
    cons: ['Container complexity', 'Higher cost than serverless', 'Learning curve', 'Networking complexity']
  }
};

export default architecturePatterns;