// AWS Service Icons
export { default as EC2Icon } from './EC2Icon.jsx';
export { default as S3Icon } from './S3Icon.jsx';
export { default as RDSIcon } from './RDSIcon.jsx';
export { default as ALBIcon } from './ALBIcon.jsx';
export { default as LambdaIcon } from './LambdaIcon.jsx';
export { default as CloudFrontIcon } from './CloudFrontIcon.jsx';
export { default as APIGatewayIcon } from './APIGatewayIcon.jsx';
export { default as DynamoDBIcon } from './DynamoDBIcon.jsx';
export { default as Route53Icon } from './Route53Icon.jsx';
export { default as CloudWatchIcon } from './CloudWatchIcon.jsx';
export { default as ECSIcon } from './ECSIcon.jsx';
export { default as FargateIcon } from './FargateIcon.jsx';

// Icon mapping for easy lookup
export const getAWSIcon = (serviceName) => {
  const iconMap = {
    'EC2': EC2Icon,
    'S3': S3Icon,
    'RDS': RDSIcon,
    'ALB': ALBIcon,
    'Lambda': LambdaIcon,
    'CloudFront': CloudFrontIcon,
    'API Gateway': APIGatewayIcon,
    'DynamoDB': DynamoDBIcon,
    'Route53': Route53Icon,
    'CloudWatch': CloudWatchIcon,
    'ECS': ECSIcon,
    'Fargate': FargateIcon
  };
  
  return iconMap[serviceName] || EC2Icon; // Default fallback
};

// AWS Documentation URLs
export const getAWSDocumentationUrl = (serviceName) => {
  const docUrls = {
    'EC2': 'https://docs.aws.amazon.com/ec2/',
    'S3': 'https://docs.aws.amazon.com/s3/',
    'RDS': 'https://docs.aws.amazon.com/rds/',
    'ALB': 'https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html',
    'Lambda': 'https://docs.aws.amazon.com/lambda/',
    'CloudFront': 'https://docs.aws.amazon.com/cloudfront/',
    'API Gateway': 'https://docs.aws.amazon.com/apigateway/',
    'DynamoDB': 'https://docs.aws.amazon.com/dynamodb/',
    'Route53': 'https://docs.aws.amazon.com/route53/',
    'CloudWatch': 'https://docs.aws.amazon.com/cloudwatch/',
    'ECS': 'https://docs.aws.amazon.com/ecs/',
    'Fargate': 'https://docs.aws.amazon.com/fargate/'
  };
  
  return docUrls[serviceName] || 'https://docs.aws.amazon.com/';
};