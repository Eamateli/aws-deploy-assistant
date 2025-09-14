import React from 'react';
import { ExternalLink } from 'lucide-react';

const EnhancedServiceCard = ({ service, isSelected, onClick, showDocLink = true }) => {
  const { name, purpose, cost, category, icon: Icon } = service;
  
  const categoryColors = {
    compute: 'border-orange-400 bg-orange-50 dark:bg-orange-900/20',
    storage: 'border-blue-400 bg-blue-50 dark:bg-blue-900/20',
    database: 'border-green-400 bg-green-50 dark:bg-green-900/20',
    networking: 'border-purple-400 bg-purple-50 dark:bg-purple-900/20',
    monitoring: 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
  };

  const getAWSDocumentationUrl = (serviceName) => {
    const serviceMap = {
      'S3': 'https://docs.aws.amazon.com/s3/',
      'CloudFront': 'https://docs.aws.amazon.com/cloudfront/',
      'Lambda': 'https://docs.aws.amazon.com/lambda/',
      'API Gateway': 'https://docs.aws.amazon.com/apigateway/',
      'DynamoDB': 'https://docs.aws.amazon.com/dynamodb/',
      'RDS': 'https://docs.aws.amazon.com/rds/',
      'EC2': 'https://docs.aws.amazon.com/ec2/',
      'ECS': 'https://docs.aws.amazon.com/ecs/',
      'Route53': 'https://docs.aws.amazon.com/route53/',
      'ALB': 'https://docs.aws.amazon.com/elasticloadbalancing/',
      'VPC': 'https://docs.aws.amazon.com/vpc/',
      'IAM': 'https://docs.aws.amazon.com/iam/',
      'CloudWatch': 'https://docs.aws.amazon.com/cloudwatch/',
      'Cognito': 'https://docs.aws.amazon.com/cognito/'
    };
    return serviceMap[serviceName] || 'https://docs.aws.amazon.com/';
  };

  const handleDocumentationClick = (e) => {
    e.stopPropagation();
    const docUrl = getAWSDocumentationUrl(name);
    window.open(docUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onClick={onClick}
      className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all bg-white dark:bg-gray-800 group ${
        isSelected 
          ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-md' 
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm'
      } ${categoryColors[category] || 'border-gray-300 bg-gray-50 dark:bg-gray-700'}`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <Icon size={24} className="text-gray-700 dark:text-gray-300" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate mb-2">{name}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{purpose}</p>
          <div className="flex items-center justify-between">
            <p className="text-xs text-green-600 dark:text-green-400 font-medium">{cost}</p>
            {showDocLink && (
              <button
                onClick={handleDocumentationClick}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                title={`View ${name} documentation`}
                aria-label={`Open ${name} documentation in new tab`}
              >
                <ExternalLink size={12} className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400" />
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Category badge */}
      <div className="absolute top-2 right-2">
        <span className={`
          inline-block px-2 py-1 text-xs font-medium rounded-full
          ${category === 'compute' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' : ''}
          ${category === 'storage' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : ''}
          ${category === 'database' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : ''}
          ${category === 'networking' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : ''}
          ${category === 'monitoring' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' : ''}
        `}>
          {category}
        </span>
      </div>
    </div>
  );
};

export default EnhancedServiceCard;