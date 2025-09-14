// Deployment Guide Templates
// Step-by-step deployment guides for each architecture pattern

/**
 * Prerequisites definitions for different deployment types
 */
export const prerequisites = {
  awsCli: {
    id: 'aws-cli',
    name: 'AWS CLI',
    description: 'Command line interface for AWS services',
    required: true,
    installUrl: 'https://aws.amazon.com/cli/',
    checkCommand: 'aws --version',
    expectedOutput: 'aws-cli/'
  },
  
  awsAccount: {
    id: 'aws-account',
    name: 'AWS Account',
    description: 'Active AWS account with appropriate permissions',
    required: true,
    setupUrl: 'https://aws.amazon.com/free/',
    checkCommand: 'aws sts get-caller-identity',
    expectedOutput: 'Account'
  },

  nodejs: {
    id: 'nodejs',
    name: 'Node.js',
    description: 'JavaScript runtime for building applications',
    required: false,
    installUrl: 'https://nodejs.org/',
    checkCommand: 'node --version',
    expectedOutput: 'v',
    minVersion: '16.0.0'
  }
};

/**
 * Common deployment steps that can be reused across patterns
 */
export const commonSteps = {
  awsSetup: {
    id: 'aws-setup',
    title: 'Configure AWS CLI',
    description: 'Set up AWS credentials and default region',
    estimatedTime: '5 minutes',
    commands: ['aws configure'],
    explanation: 'This will prompt you for your AWS Access Key ID, Secret Access Key, default region, and output format.'
  }
};

/**
 * Deployment templates for each architecture pattern
 */
export const deploymentTemplates = {
  'static-spa': {
    id: 'static-spa',
    name: 'Static SPA Deployment',
    description: 'Deploy React/Vue SPA to S3 with CloudFront CDN',
    
    metadata: {
      estimatedTime: '15-30 minutes',
      difficulty: 'Beginner',
      cost: '$1-25/month',
      complexity: 2,
      automationLevel: 'High'
    },

    prerequisites: [
      prerequisites.awsCli,
      prerequisites.awsAccount,
      prerequisites.nodejs
    ],

    steps: [
      commonSteps.awsSetup,
      {
        id: 'build-app',
        title: 'Build your application',
        description: 'Create production build of your application',
        estimatedTime: '2-5 minutes',
        commands: ['npm install', 'npm run build'],
        explanation: 'This creates optimized production files in the build/ directory that will be uploaded to S3.',
        validation: {
          command: 'ls -la build/',
          expectedOutput: 'index.html',
          description: 'Verify that the build directory contains the main index.html file',
          successCriteria: ['index.html exists', 'static/ directory exists', 'Build size is reasonable']
        },
        testing: {
          suggestions: [
            'Open build/index.html in a browser to verify it loads correctly',
            'Check that all assets (CSS, JS, images) are properly referenced',
            'Verify that the application works without a development server'
          ],
          automatedTests: [
            {
              name: 'Build Output Validation',
              command: 'test -f build/index.html && echo "Build successful" || echo "Build failed"',
              expectedResult: 'Build successful'
            }
          ]
        },
        troubleshooting: [
          {
            issue: 'Build fails with memory error',
            solution: 'Try: NODE_OPTIONS="--max-old-space-size=4096" npm run build'
          },
          {
            issue: 'Build directory not found',
            solution: 'Make sure your package.json has a "build" script configured'
          }
        ]
      },
      {
        id: 'create-s3-bucket',
        title: 'Create S3 bucket for hosting',
        description: 'Create and configure S3 bucket for static website hosting',
        estimatedTime: '3 minutes',
        commands: [
          'aws s3 mb s3://{{bucketName}} --region {{region}}',
          'aws s3 website s3://{{bucketName}} --index-document index.html --error-document error.html'
        ],
        explanation: 'This creates an S3 bucket in your specified region and enables static website hosting.',
        validation: {
          command: 'aws s3 ls s3://{{bucketName}}',
          expectedOutput: 'bucket exists',
          description: 'Verify that the S3 bucket was created successfully',
          successCriteria: ['Bucket exists', 'Bucket is in correct region', 'Website hosting is enabled']
        },
        testing: {
          suggestions: [
            'Verify bucket exists in AWS Console',
            'Check bucket properties for website hosting configuration',
            'Ensure bucket is in the correct region'
          ],
          automatedTests: [
            {
              name: 'Bucket Existence Check',
              command: 'aws s3api head-bucket --bucket {{bucketName}}',
              expectedResult: 'No error (HTTP 200)'
            },
            {
              name: 'Website Configuration Check',
              command: 'aws s3api get-bucket-website --bucket {{bucketName}}',
              expectedResult: 'IndexDocument configuration present'
            }
          ]
        },
        rollback: {
          description: 'Remove the S3 bucket if deployment fails',
          commands: [
            'aws s3 rb s3://{{bucketName}} --force'
          ],
          warnings: ['This will permanently delete the bucket and all its contents']
        },
        troubleshooting: [
          {
            issue: 'Bucket name already exists',
            solution: 'S3 bucket names must be globally unique. Try adding a random suffix to your bucket name.'
          }
        ]
      },
      {
        id: 'configure-bucket-policy',
        title: 'Configure bucket policy for public access',
        description: 'Set up bucket policy to allow public read access',
        estimatedTime: '2 minutes',
        files: [
          {
            name: 'bucket-policy.json',
            content: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::{{bucketName}}/*"
    }
  ]
}`
          }
        ],
        commands: [
          'aws s3api put-bucket-policy --bucket {{bucketName}} --policy file://bucket-policy.json'
        ],
        explanation: 'This policy allows public read access to all objects in your bucket, which is required for static website hosting.'
      },
      {
        id: 'upload-files',
        title: 'Upload build files to S3',
        description: 'Sync your build directory to the S3 bucket',
        estimatedTime: '2-5 minutes',
        commands: [
          'aws s3 sync build/ s3://{{bucketName}} --delete'
        ],
        explanation: 'This uploads all files from your build directory to S3 and removes any files that no longer exist locally.',
        validation: {
          command: 'aws s3 ls s3://{{bucketName}}/index.html',
          expectedOutput: 'index.html',
          description: 'Verify that files were uploaded successfully to S3',
          successCriteria: ['All build files are uploaded', 'File sizes match local files', 'No upload errors']
        },
        testing: {
          suggestions: [
            'Check S3 console to verify all files are uploaded',
            'Test the S3 website URL to ensure it loads',
            'Verify that CSS and JS files are accessible'
          ],
          automatedTests: [
            {
              name: 'File Upload Verification',
              command: 'aws s3 ls s3://{{bucketName}}/ --recursive | wc -l',
              expectedResult: 'Multiple files listed'
            },
            {
              name: 'Website Accessibility Test',
              command: 'curl -I http://{{bucketName}}.s3-website-{{region}}.amazonaws.com',
              expectedResult: 'HTTP/1.1 200 OK'
            }
          ]
        },
        rollback: {
          description: 'Remove uploaded files if needed',
          commands: [
            'aws s3 rm s3://{{bucketName}} --recursive'
          ],
          warnings: ['This will delete all files in the bucket']
        }
      },
      {
        id: 'create-cloudfront',
        title: 'Create CloudFront distribution (Optional)',
        description: 'Set up CDN for better performance and HTTPS',
        estimatedTime: '5-10 minutes',
        files: [
          {
            name: 'cloudfront-config.json',
            content: `{
  "CallerReference": "{{timestamp}}",
  "Comment": "CloudFront distribution for {{appName}}",
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-{{bucketName}}",
    "ViewerProtocolPolicy": "redirect-to-https",
    "MinTTL": 0,
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {"Forward": "none"}
    }
  },
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-{{bucketName}}",
        "DomainName": "{{bucketName}}.s3-website-{{region}}.amazonaws.com",
        "CustomOriginConfig": {
          "HTTPPort": 80,
          "HTTPSPort": 443,
          "OriginProtocolPolicy": "http-only"
        }
      }
    ]
  },
  "Enabled": true,
  "DefaultRootObject": "index.html"
}`
          }
        ],
        commands: [
          'aws cloudfront create-distribution --distribution-config file://cloudfront-config.json'
        ],
        explanation: 'CloudFront provides global CDN, HTTPS, and better performance for your static site.',
        troubleshooting: [
          {
            issue: 'Distribution creation takes a long time',
            solution: 'CloudFront distributions can take 15-20 minutes to deploy globally. This is normal.'
          }
        ]
      }
    ],

    postDeployment: {
      validation: {
        title: 'Deployment Success Validation',
        description: 'Verify that your static SPA is deployed and accessible',
        checks: [
          {
            name: 'Website Accessibility',
            description: 'Verify your website loads correctly',
            manual: true,
            instructions: 'Open the S3 website URL and verify your application loads',
            successCriteria: ['Page loads without errors', 'All assets (CSS, JS, images) load', 'Application functions correctly']
          },
          {
            name: 'Performance Check',
            description: 'Verify website performance',
            automated: true,
            command: 'curl -w "@curl-format.txt" -o /dev/null -s http://{{bucketName}}.s3-website-{{region}}.amazonaws.com',
            successCriteria: ['Response time < 2 seconds', 'No HTTP errors', 'Content loads completely']
          },
          {
            name: 'CloudFront Distribution (if created)',
            description: 'Verify CloudFront is working',
            manual: true,
            instructions: 'Test the CloudFront URL and verify HTTPS works',
            successCriteria: ['HTTPS loads correctly', 'Content is served from edge locations', 'Cache headers are set']
          }
        ]
      },
      
      urls: [
        {
          name: 'S3 Website URL',
          template: 'http://{{bucketName}}.s3-website-{{region}}.amazonaws.com',
          primary: true
        },
        {
          name: 'CloudFront URL',
          template: 'https://{{cloudfrontDomain}}',
          conditional: true
        }
      ],
      
      successConfirmation: {
        title: 'Deployment Successful! 🎉',
        message: 'Your static SPA has been successfully deployed to AWS',
        checklist: [
          'S3 bucket created and configured for static hosting',
          'Application files uploaded to S3',
          'Website is accessible via S3 URL',
          'CloudFront distribution created (if selected)',
          'All validation checks passed'
        ]
      },
      
      nextSteps: [
        {
          title: 'Set up custom domain',
          description: 'Configure Route 53 for a custom domain name',
          priority: 'recommended',
          estimatedTime: '15 minutes'
        },
        {
          title: 'Configure CI/CD pipeline',
          description: 'Automate deployments with GitHub Actions or AWS CodePipeline',
          priority: 'recommended',
          estimatedTime: '30 minutes'
        },
        {
          title: 'Add error pages',
          description: 'Create custom 404 and error pages',
          priority: 'optional',
          estimatedTime: '10 minutes'
        },
        {
          title: 'Set up monitoring',
          description: 'Configure CloudWatch for monitoring and alerts',
          priority: 'recommended',
          estimatedTime: '20 minutes'
        }
      ],
      
      troubleshooting: {
        commonIssues: [
          {
            issue: 'Website shows 403 Forbidden error',
            causes: ['Bucket policy not set correctly', 'Files not uploaded', 'Index document not configured'],
            solutions: [
              'Verify bucket policy allows public read access',
              'Check that index.html exists in the bucket root',
              'Ensure website hosting is enabled with correct index document'
            ]
          },
          {
            issue: 'CSS/JS files not loading',
            causes: ['Incorrect file paths', 'CORS issues', 'Files not uploaded'],
            solutions: [
              'Check that all assets are uploaded to S3',
              'Verify file paths in your HTML are correct',
              'Ensure files have correct content-type headers'
            ]
          },
          {
            issue: 'CloudFront not working',
            causes: ['Distribution still deploying', 'Origin configuration incorrect', 'Cache issues'],
            solutions: [
              'Wait for distribution deployment to complete (15-20 minutes)',
              'Verify origin points to correct S3 website endpoint',
              'Create cache invalidation if needed'
            ]
          }
        ]
      },
      
      rollbackProcedure: {
        title: 'Complete Rollback Procedure',
        description: 'Remove all AWS resources created during deployment',
        steps: [
          {
            title: 'Delete CloudFront Distribution',
            commands: ['aws cloudfront delete-distribution --id {{distributionId}}'],
            warnings: ['Distribution must be disabled first', 'Can take 15-20 minutes']
          },
          {
            title: 'Empty and Delete S3 Bucket',
            commands: [
              'aws s3 rm s3://{{bucketName}} --recursive',
              'aws s3 rb s3://{{bucketName}}'
            ],
            warnings: ['This permanently deletes all uploaded files']
          },
          {
            title: 'Remove Route 53 Records (if created)',
            commands: ['aws route53 delete-hosted-zone --id {{hostedZoneId}}'],
            warnings: ['Only delete if you created a new hosted zone']
          }
        ],
        estimatedTime: '5-30 minutes',
        costImpact: 'Stops all ongoing charges for these resources'
      },
      
      estimatedCosts: {
        monthly: {
          low: '$1-5',
          medium: '$5-15',
          high: '$15-25'
        },
        breakdown: [
          'S3 storage: $0.023/GB/month',
          'S3 requests: $0.0004/1000 GET requests',
          'CloudFront: $0.085/GB data transfer',
          'Route 53: $0.50/hosted zone (if using custom domain)'
        ]
      }
    }
  },

  'serverless-api': {
    id: 'serverless-api',
    name: 'Serverless API Deployment',
    description: 'Deploy serverless API using Lambda and API Gateway',
    
    metadata: {
      estimatedTime: '30-60 minutes',
      difficulty: 'Intermediate',
      cost: '$5-150/month',
      complexity: 3,
      automationLevel: 'High'
    },

    prerequisites: [
      prerequisites.awsCli,
      prerequisites.awsAccount,
      {
        id: 'sam-cli',
        name: 'AWS SAM CLI',
        description: 'Serverless Application Model CLI for Lambda deployment',
        required: true,
        installUrl: 'https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html',
        checkCommand: 'sam --version',
        expectedOutput: 'SAM CLI'
      }
    ],

    steps: [
      commonSteps.awsSetup,
      {
        id: 'init-sam-project',
        title: 'Initialize SAM project',
        description: 'Create SAM template and project structure',
        estimatedTime: '5 minutes',
        files: [
          {
            name: 'template.yaml',
            content: `AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: Serverless API for {{appName}}

Globals:
  Function:
    Timeout: 30
    Runtime: {{runtime}}
    Environment:
      Variables:
        STAGE: !Ref Stage

Parameters:
  Stage:
    Type: String
    Default: dev

Resources:
  ApiFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: src/
      Handler: {{handler}}
      Events:
        ApiEvent:
          Type: Api
          Properties:
            Path: /{proxy+}
            Method: ANY
            RestApiId: !Ref ApiGateway
  
  ApiGateway:
    Type: AWS::Serverless::Api
    Properties:
      StageName: !Ref Stage
      Cors:
        AllowMethods: "'*'"
        AllowHeaders: "'*'"
        AllowOrigin: "'*'"

Outputs:
  ApiUrl:
    Description: "API Gateway endpoint URL"
    Value: !Sub "https://\${ApiGateway}.execute-api.\${AWS::Region}.amazonaws.com/\${Stage}/"
    Export:
      Name: !Sub "\${AWS::StackName}-ApiUrl"`
          }
        ],
        commands: [
          'mkdir -p src',
          'sam validate'
        ],
        explanation: 'This creates a SAM template that defines your Lambda function and API Gateway configuration.'
      },
      {
        id: 'create-lambda-function',
        title: 'Create Lambda function code',
        description: 'Write the main Lambda handler function',
        estimatedTime: '10 minutes',
        files: [
          {
            name: 'src/index.js',
            content: `exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));
    
    const response = {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
        body: JSON.stringify({
            message: 'Hello from {{appName}} API!',
            path: event.path,
            method: event.httpMethod,
            timestamp: new Date().toISOString()
        })
    };
    
    return response;
};`
          }
        ],
        explanation: 'This is a basic Lambda function that responds to HTTP requests through API Gateway.'
      },
      {
        id: 'build-and-deploy',
        title: 'Build and deploy the application',
        description: 'Use SAM to build and deploy your serverless application',
        estimatedTime: '10-15 minutes',
        commands: [
          'sam build',
          'sam deploy --guided --stack-name {{stackName}}'
        ],
        explanation: 'SAM build packages your function and SAM deploy creates all AWS resources defined in your template.',
        troubleshooting: [
          {
            issue: 'Deployment fails with permissions error',
            solution: 'Make sure your AWS credentials have permissions to create Lambda functions, API Gateway, and CloudFormation stacks.'
          },
          {
            issue: 'Build fails with dependency errors',
            solution: 'Make sure all dependencies are listed in package.json and run npm install before sam build.'
          }
        ]
      },
      {
        id: 'test-api',
        title: 'Test your API',
        description: 'Verify that your API is working correctly',
        estimatedTime: '5 minutes',
        commands: [
          'curl -X GET {{apiUrl}}',
          'sam logs -n ApiFunction --stack-name {{stackName}} --tail'
        ],
        explanation: 'Test your API endpoint and check the logs to ensure everything is working correctly.'
      }
    ],

    postDeployment: {
      urls: [
        {
          name: 'API Gateway URL',
          template: '{{apiUrl}}'
        }
      ],
      nextSteps: [
        'Add authentication with Cognito',
        'Set up DynamoDB for data storage',
        'Configure custom domain',
        'Add monitoring and alerting',
        'Set up CI/CD pipeline'
      ],
      estimatedCosts: {
        monthly: {
          low: '$5-15',
          medium: '$15-50',
          high: '$50-150'
        },
        breakdown: [
          'Lambda: $0.20 per 1M requests + $0.0000166667 per GB-second',
          'API Gateway: $3.50 per million requests',
          'CloudWatch Logs: $0.50 per GB ingested',
          'DynamoDB: $0.25 per GB/month (if added)'
        ]
      }
    }
  },

  'traditional-stack': {
    id: 'traditional-stack',
    name: 'Traditional Stack Deployment',
    description: 'Deploy full-stack application with EC2, ALB, and RDS',
    
    metadata: {
      estimatedTime: '1-3 hours',
      difficulty: 'Advanced',
      cost: '$60-400/month',
      complexity: 4,
      automationLevel: 'Medium'
    },

    prerequisites: [
      prerequisites.awsCli,
      prerequisites.awsAccount,
      {
        id: 'key-pair',
        name: 'EC2 Key Pair',
        description: 'SSH key pair for EC2 instance access',
        required: true,
        setupUrl: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-key-pairs.html',
        checkCommand: 'aws ec2 describe-key-pairs --key-names {{keyPair}}',
        expectedOutput: 'KeyName'
      }
    ],

    steps: [
      commonSteps.awsSetup,
      {
        id: 'create-vpc',
        title: 'Create VPC and networking',
        description: 'Set up Virtual Private Cloud with subnets and security groups',
        estimatedTime: '15 minutes',
        commands: [
          'aws ec2 create-vpc --cidr-block 10.0.0.0/16 --tag-specifications "ResourceType=vpc,Tags=[{Key=Name,Value={{appName}}-vpc}]"',
          'aws ec2 create-subnet --vpc-id {{vpcId}} --cidr-block 10.0.1.0/24 --availability-zone {{region}}a --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value={{appName}}-public-subnet}]"',
          'aws ec2 create-internet-gateway --tag-specifications "ResourceType=internet-gateway,Tags=[{Key=Name,Value={{appName}}-igw}]"',
          'aws ec2 attach-internet-gateway --vpc-id {{vpcId}} --internet-gateway-id {{igwId}}'
        ],
        explanation: 'This creates the network infrastructure needed for your application including VPC, subnets, and internet gateway.'
      },
      {
        id: 'create-security-groups',
        title: 'Create security groups',
        description: 'Configure firewall rules for web and database access',
        estimatedTime: '10 minutes',
        commands: [
          'aws ec2 create-security-group --group-name {{appName}}-web-sg --description "Security group for web servers" --vpc-id {{vpcId}}',
          'aws ec2 authorize-security-group-ingress --group-id {{webSgId}} --protocol tcp --port 80 --cidr 0.0.0.0/0',
          'aws ec2 authorize-security-group-ingress --group-id {{webSgId}} --protocol tcp --port 443 --cidr 0.0.0.0/0',
          'aws ec2 authorize-security-group-ingress --group-id {{webSgId}} --protocol tcp --port 22 --cidr 0.0.0.0/0'
        ],
        explanation: 'Security groups act as virtual firewalls controlling inbound and outbound traffic to your instances.'
      },
      {
        id: 'launch-ec2',
        title: 'Launch EC2 instances',
        description: 'Create and configure application servers',
        estimatedTime: '20 minutes',
        commands: [
          'aws ec2 run-instances --image-id {{amiId}} --count 2 --instance-type t3.small --key-name {{keyPair}} --security-group-ids {{webSgId}} --subnet-id {{subnetId}} --associate-public-ip-address --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value={{appName}}-web}]"'
        ],
        explanation: 'This launches EC2 instances that will host your application. We create 2 instances for high availability.'
      },
      {
        id: 'create-rds',
        title: 'Create RDS database',
        description: 'Set up managed database instance',
        estimatedTime: '20-30 minutes',
        commands: [
          'aws rds create-db-instance --db-instance-identifier {{appName}}-db --db-instance-class db.t3.micro --engine mysql --master-username admin --master-user-password {{dbPassword}} --allocated-storage 20 --vpc-security-group-ids {{dbSgId}} --db-subnet-group-name {{dbSubnetGroup}}'
        ],
        explanation: 'RDS provides a managed database service with automated backups, patching, and monitoring.',
        troubleshooting: [
          {
            issue: 'RDS creation takes a long time',
            solution: 'RDS instances can take 10-20 minutes to create. This is normal for database setup.'
          }
        ]
      },
      {
        id: 'create-load-balancer',
        title: 'Create Application Load Balancer',
        description: 'Set up load balancer to distribute traffic',
        estimatedTime: '15 minutes',
        commands: [
          'aws elbv2 create-load-balancer --name {{appName}}-alb --subnets {{subnetId}} --security-groups {{webSgId}}',
          'aws elbv2 create-target-group --name {{appName}}-targets --protocol HTTP --port 80 --vpc-id {{vpcId}}',
          'aws elbv2 register-targets --target-group-arn {{targetGroupArn}} --targets Id={{instanceId1}} Id={{instanceId2}}'
        ],
        explanation: 'The Application Load Balancer distributes incoming traffic across multiple EC2 instances for high availability.'
      },
      {
        id: 'deploy-application',
        title: 'Deploy application code',
        description: 'Install and configure your application on EC2 instances',
        estimatedTime: '30-45 minutes',
        commands: [
          'ssh -i {{keyPair}}.pem ec2-user@{{instancePublicIp}} "sudo yum update -y"',
          'ssh -i {{keyPair}}.pem ec2-user@{{instancePublicIp}} "sudo yum install -y nodejs npm"',
          'scp -i {{keyPair}}.pem -r . ec2-user@{{instancePublicIp}}:~/app/',
          'ssh -i {{keyPair}}.pem ec2-user@{{instancePublicIp}} "cd ~/app && npm install && npm start"'
        ],
        explanation: 'This installs your application dependencies and starts your application on each EC2 instance.'
      }
    ],

    postDeployment: {
      urls: [
        {
          name: 'Load Balancer URL',
          template: 'http://{{albDnsName}}'
        }
      ],
      nextSteps: [
        'Set up SSL certificate with ACM',
        'Configure auto-scaling groups',
        'Set up CloudWatch monitoring',
        'Configure automated backups',
        'Set up CI/CD pipeline'
      ],
      estimatedCosts: {
        monthly: {
          low: '$60-100',
          medium: '$100-250',
          high: '$250-400'
        },
        breakdown: [
          'EC2 instances: $17/month per t3.small instance',
          'RDS: $12/month for db.t3.micro',
          'ALB: $16/month base cost',
          'Data transfer: $0.09/GB',
          'EBS storage: $0.10/GB/month'
        ]
      }
    }
  },

  'container-stack': {
    id: 'container-stack',
    name: 'Container Platform Deployment',
    description: 'Deploy containerized application using ECS Fargate',
    
    metadata: {
      estimatedTime: '45-90 minutes',
      difficulty: 'Advanced',
      cost: '$50-300/month',
      complexity: 4,
      automationLevel: 'High'
    },

    prerequisites: [
      prerequisites.awsCli,
      prerequisites.awsAccount,
      {
        id: 'docker',
        name: 'Docker',
        description: 'Container platform for building and running applications',
        required: true,
        installUrl: 'https://docs.docker.com/get-docker/',
        checkCommand: 'docker --version',
        expectedOutput: 'Docker version'
      }
    ],

    steps: [
      commonSteps.awsSetup,
      {
        id: 'create-dockerfile',
        title: 'Create Dockerfile',
        description: 'Define how to build your application container',
        estimatedTime: '10 minutes',
        files: [
          {
            name: 'Dockerfile',
            content: `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

USER node

CMD ["npm", "start"]`
          }
        ],
        explanation: 'The Dockerfile defines how to build a container image for your application.'
      },
      {
        id: 'create-ecr-repo',
        title: 'Create ECR repository',
        description: 'Set up container registry to store your images',
        estimatedTime: '5 minutes',
        commands: [
          'aws ecr create-repository --repository-name {{ecrRepository}} --region {{region}}'
        ],
        explanation: 'ECR (Elastic Container Registry) stores your container images securely in AWS.'
      },
      {
        id: 'build-and-push',
        title: 'Build and push container image',
        description: 'Build your container and push to ECR',
        estimatedTime: '10-15 minutes',
        commands: [
          'aws ecr get-login-password --region {{region}} | docker login --username AWS --password-stdin {{accountId}}.dkr.ecr.{{region}}.amazonaws.com',
          'docker build -t {{ecrRepository}} .',
          'docker tag {{ecrRepository}}:{{imageTag}} {{accountId}}.dkr.ecr.{{region}}.amazonaws.com/{{ecrRepository}}:{{imageTag}}',
          'docker push {{accountId}}.dkr.ecr.{{region}}.amazonaws.com/{{ecrRepository}}:{{imageTag}}'
        ],
        explanation: 'This builds your container image and pushes it to ECR where ECS can access it.'
      },
      {
        id: 'create-ecs-cluster',
        title: 'Create ECS cluster',
        description: 'Set up container orchestration cluster',
        estimatedTime: '5 minutes',
        commands: [
          'aws ecs create-cluster --cluster-name {{clusterName}} --capacity-providers FARGATE --default-capacity-provider-strategy capacityProvider=FARGATE,weight=1'
        ],
        explanation: 'ECS cluster manages the compute resources for running your containers.'
      },
      {
        id: 'create-task-definition',
        title: 'Create ECS task definition',
        description: 'Define how your container should run',
        estimatedTime: '10 minutes',
        files: [
          {
            name: 'task-definition.json',
            content: `{
  "family": "{{taskDefinition}}",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::{{accountId}}:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "{{appName}}",
      "image": "{{accountId}}.dkr.ecr.{{region}}.amazonaws.com/{{ecrRepository}}:{{imageTag}}",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "essential": true,
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/{{taskDefinition}}",
          "awslogs-region": "{{region}}",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}`
          }
        ],
        commands: [
          'aws ecs register-task-definition --cli-input-json file://task-definition.json'
        ],
        explanation: 'Task definition specifies how your container should run, including CPU, memory, and networking.'
      },
      {
        id: 'create-service',
        title: 'Create ECS service',
        description: 'Deploy and manage your containerized application',
        estimatedTime: '15 minutes',
        commands: [
          'aws ecs create-service --cluster {{clusterName}} --service-name {{serviceName}} --task-definition {{taskDefinition}} --desired-count 2 --launch-type FARGATE --network-configuration "awsvpcConfiguration={subnets=[{{subnetId}}],securityGroups=[{{securityGroupId}}],assignPublicIp=ENABLED}"'
        ],
        explanation: 'ECS service ensures your containers are running and healthy, and can scale them as needed.'
      }
    ],

    postDeployment: {
      urls: [
        {
          name: 'Application URL',
          template: 'http://{{albDnsName}}'
        }
      ],
      nextSteps: [
        'Set up auto-scaling policies',
        'Configure service discovery',
        'Add monitoring with Container Insights',
        'Set up CI/CD pipeline with CodePipeline',
        'Configure secrets management'
      ],
      estimatedCosts: {
        monthly: {
          low: '$50-80',
          medium: '$80-150',
          high: '$150-300'
        },
        breakdown: [
          'Fargate: $0.04048 per vCPU per hour + $0.004445 per GB per hour',
          'ALB: $16/month base cost',
          'ECR: $0.10 per GB/month',
          'CloudWatch Logs: $0.50 per GB ingested',
          'Data transfer: $0.09/GB'
        ]
      }
    }
  }
};

export default {
  deploymentTemplates,
  prerequisites,
  commonSteps
};