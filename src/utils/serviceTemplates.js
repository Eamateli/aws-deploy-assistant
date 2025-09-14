// Service Template Generator
// Generates deployment templates and configurations for AWS services

/**
 * Template Generator for AWS Services
 * Creates deployment templates, CLI commands, and configuration files
 */
export class ServiceTemplateGenerator {
  constructor() {
    this.templateCache = new Map();
  }

  /**
   * Generate deployment template for a complete architecture
   */
  generateArchitectureTemplate(pattern, serviceConfigs, options = {}) {
    const template = {
      metadata: {
        name: pattern.name,
        description: pattern.description,
        generatedAt: new Date().toISOString(),
        estimatedCost: this.calculateTotalCost(serviceConfigs),
        deploymentTime: pattern.deployment?.timeEstimate || 'Unknown'
      },
      
      services: serviceConfigs.map(config => ({
        id: config.serviceId,
        name: config.serviceDefinition.name,
        purpose: config.purpose,
        required: config.required,
        configuration: config.configuration,
        estimatedCost: config.estimatedCost,
        template: this.generateServiceTemplate(config)
      })),
      
      deploymentSteps: this.generateDeploymentSteps(pattern, serviceConfigs),
      
      templates: {
        cloudFormation: this.generateCloudFormationTemplate(serviceConfigs),
        terraform: this.generateTerraformTemplate(serviceConfigs),
        cdk: this.generateCDKTemplate(serviceConfigs),
        cli: this.generateCLICommands(serviceConfigs)
      }
    };

    return template;
  }

  /**
   * Generate service-specific template
   */
  generateServiceTemplate(serviceConfig) {
    const { serviceId, serviceDefinition, configuration } = serviceConfig;
    
    switch (serviceId) {
      case 's3':
        return this.generateS3Template(configuration);
      case 'lambda':
        return this.generateLambdaTemplate(configuration);
      case 'ec2':
        return this.generateEC2Template(configuration);
      case 'rds':
        return this.generateRDSTemplate(configuration);
      case 'cloudfront':
        return this.generateCloudFrontTemplate(configuration);
      case 'api-gateway':
        return this.generateAPIGatewayTemplate(configuration);
      case 'alb':
        return this.generateALBTemplate(configuration);
      case 'ecs':
        return this.generateECSTemplate(configuration);
      default:
        return this.generateGenericTemplate(serviceConfig);
    }
  }

  /**
   * S3 Template Generation
   */
  generateS3Template(config) {
    return {
      cloudFormation: {
        Type: 'AWS::S3::Bucket',
        Properties: {
          BucketName: '${BucketName}',
          WebsiteConfiguration: config.websiteHosting ? {
            IndexDocument: 'index.html',
            ErrorDocument: 'error.html'
          } : undefined,
          VersioningConfiguration: config.versioning ? {
            Status: 'Enabled'
          } : undefined,
          PublicAccessBlockConfiguration: config.bucketPolicy === 'public-read' ? {
            BlockPublicAcls: false,
            BlockPublicPolicy: false,
            IgnorePublicAcls: false,
            RestrictPublicBuckets: false
          } : undefined
        }
      },
      
      terraform: `
resource "aws_s3_bucket" "main" {
  bucket = var.bucket_name
  
  ${config.websiteHosting ? `
  website {
    index_document = "index.html"
    error_document = "error.html"
  }` : ''}
}

${config.versioning ? `
resource "aws_s3_bucket_versioning" "main" {
  bucket = aws_s3_bucket.main.id
  versioning_configuration {
    status = "Enabled"
  }
}` : ''}
      `.trim(),
      
      cli: [
        `aws s3 mb s3://\${BUCKET_NAME}`,
        config.websiteHosting ? `aws s3 website s3://\${BUCKET_NAME} --index-document index.html --error-document error.html` : null,
        config.bucketPolicy === 'public-read' ? `aws s3api put-bucket-policy --bucket \${BUCKET_NAME} --policy file://bucket-policy.json` : null
      ].filter(Boolean)
    };
  }

  /**
   * Lambda Template Generation
   */
  generateLambdaTemplate(config) {
    return {
      cloudFormation: {
        Type: 'AWS::Lambda::Function',
        Properties: {
          FunctionName: '${FunctionName}',
          Runtime: config.runtime || 'nodejs18.x',
          Handler: 'index.handler',
          Code: {
            ZipFile: 'exports.handler = async (event) => { return { statusCode: 200, body: "Hello World" }; };'
          },
          Timeout: parseInt(config.timeout?.replace('s', '')) || 30,
          MemorySize: parseInt(config.memory?.replace('MB', '')) || 512,
          Role: { 'Fn::GetAtt': ['LambdaExecutionRole', 'Arn'] }
        }
      },
      
      terraform: `
resource "aws_lambda_function" "main" {
  filename         = "function.zip"
  function_name    = var.function_name
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "${config.runtime || 'nodejs18.x'}"
  timeout         = ${parseInt(config.timeout?.replace('s', '')) || 30}
  memory_size     = ${parseInt(config.memory?.replace('MB', '')) || 512}
}
      `.trim(),
      
      cli: [
        `zip function.zip index.js`,
        `aws lambda create-function --function-name \${FUNCTION_NAME} --runtime ${config.runtime || 'nodejs18.x'} --role \${LAMBDA_ROLE_ARN} --handler index.handler --zip-file fileb://function.zip`
      ]
    };
  }

  /**
   * EC2 Template Generation
   */
  generateEC2Template(config) {
    return {
      cloudFormation: {
        Type: 'AWS::EC2::Instance',
        Properties: {
          ImageId: '${AMI_ID}',
          InstanceType: config.instanceType || 't3.micro',
          KeyName: '${KeyPairName}',
          SecurityGroupIds: ['${SecurityGroupId}'],
          SubnetId: '${SubnetId}',
          UserData: {
            'Fn::Base64': {
              'Fn::Sub': `#!/bin/bash
yum update -y
yum install -y nodejs npm
# Add your application setup here`
            }
          }
        }
      },
      
      terraform: `
resource "aws_instance" "main" {
  ami           = var.ami_id
  instance_type = "${config.instanceType || 't3.micro'}"
  key_name      = var.key_pair_name
  
  vpc_security_group_ids = [aws_security_group.main.id]
  subnet_id              = var.subnet_id
  
  user_data = base64encode(<<-EOF
    #!/bin/bash
    yum update -y
    yum install -y nodejs npm
    # Add your application setup here
  EOF
  )
  
  tags = {
    Name = var.instance_name
  }
}
      `.trim(),
      
      cli: [
        `aws ec2 run-instances --image-id \${AMI_ID} --count 1 --instance-type ${config.instanceType || 't3.micro'} --key-name \${KEY_PAIR} --security-group-ids \${SECURITY_GROUP_ID} --subnet-id \${SUBNET_ID}`
      ]
    };
  }

  /**
   * RDS Template Generation
   */
  generateRDSTemplate(config) {
    return {
      cloudFormation: {
        Type: 'AWS::RDS::DBInstance',
        Properties: {
          DBInstanceIdentifier: '${DBInstanceId}',
          DBInstanceClass: config.instanceClass || 'db.t3.micro',
          Engine: config.engine || 'mysql',
          MasterUsername: '${DBUsername}',
          MasterUserPassword: '${DBPassword}',
          AllocatedStorage: '20',
          VPCSecurityGroups: ['${DBSecurityGroupId}'],
          DBSubnetGroupName: '${DBSubnetGroup}',
          MultiAZ: config.multiAZ || false,
          BackupRetentionPeriod: config.backups === 'automated' ? 7 : 0
        }
      },
      
      terraform: `
resource "aws_db_instance" "main" {
  identifier = var.db_identifier
  
  engine         = "${config.engine || 'mysql'}"
  engine_version = var.engine_version
  instance_class = "${config.instanceClass || 'db.t3.micro'}"
  
  allocated_storage = 20
  storage_type      = "gp2"
  
  db_name  = var.database_name
  username = var.db_username
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  
  multi_az               = ${config.multiAZ || false}
  backup_retention_period = ${config.backups === 'automated' ? 7 : 0}
  
  skip_final_snapshot = true
}
      `.trim(),
      
      cli: [
        `aws rds create-db-instance --db-instance-identifier \${DB_IDENTIFIER} --db-instance-class ${config.instanceClass || 'db.t3.micro'} --engine ${config.engine || 'mysql'} --master-username \${DB_USERNAME} --master-user-password \${DB_PASSWORD} --allocated-storage 20`
      ]
    };
  }

  /**
   * CloudFront Template Generation
   */
  generateCloudFrontTemplate(config) {
    return {
      cloudFormation: {
        Type: 'AWS::CloudFront::Distribution',
        Properties: {
          DistributionConfig: {
            Origins: [{
              Id: 'S3Origin',
              DomainName: '${S3BucketDomainName}',
              S3OriginConfig: {
                OriginAccessIdentity: ''
              }
            }],
            DefaultCacheBehavior: {
              TargetOriginId: 'S3Origin',
              ViewerProtocolPolicy: 'redirect-to-https',
              Compress: config.compression || true,
              CachePolicyId: '4135ea2d-6df8-44a3-9df3-4b5a84be39ad' // Managed-CachingOptimized
            },
            Enabled: true,
            DefaultRootObject: 'index.html'
          }
        }
      },
      
      terraform: `
resource "aws_cloudfront_distribution" "main" {
  origin {
    domain_name = aws_s3_bucket.main.bucket_regional_domain_name
    origin_id   = "S3-\${aws_s3_bucket.main.id}"
    
    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.main.cloudfront_access_identity_path
    }
  }
  
  enabled             = true
  default_root_object = "index.html"
  
  default_cache_behavior {
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-\${aws_s3_bucket.main.id}"
    compress               = ${config.compression || true}
    viewer_protocol_policy = "redirect-to-https"
    
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }
  
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  
  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
      `.trim(),
      
      cli: [
        `# CloudFront distributions are complex to create via CLI`,
        `# Use AWS Console or Infrastructure as Code tools`
      ]
    };
  }

  /**
   * Generate deployment steps
   */
  generateDeploymentSteps(pattern, serviceConfigs) {
    const steps = [];
    
    // Prerequisites
    steps.push({
      title: 'Prerequisites',
      description: 'Set up required tools and accounts',
      commands: [
        'aws configure # Configure AWS CLI with your credentials',
        'aws sts get-caller-identity # Verify AWS access'
      ],
      estimatedTime: '5 minutes'
    });

    // Service-specific steps
    for (const config of serviceConfigs.filter(c => c.required)) {
      const serviceSteps = this.generateServiceDeploymentSteps(config);
      steps.push(...serviceSteps);
    }

    // Final configuration
    steps.push({
      title: 'Final Configuration',
      description: 'Configure services to work together',
      commands: [
        '# Update application configuration with service endpoints',
        '# Test connectivity between services',
        '# Set up monitoring and alerting'
      ],
      estimatedTime: '10 minutes'
    });

    return steps;
  }

  /**
   * Generate service-specific deployment steps
   */
  generateServiceDeploymentSteps(serviceConfig) {
    const template = serviceConfig.template;
    if (!template || !template.cli) return [];

    return [{
      title: `Deploy ${serviceConfig.serviceDefinition.name}`,
      description: serviceConfig.purpose,
      commands: template.cli,
      estimatedTime: '5-10 minutes',
      service: serviceConfig.serviceId
    }];
  }

  /**
   * Generate CloudFormation template
   */
  generateCloudFormationTemplate(serviceConfigs) {
    const template = {
      AWSTemplateFormatVersion: '2010-09-09',
      Description: 'Generated AWS architecture template',
      Parameters: {},
      Resources: {},
      Outputs: {}
    };

    for (const config of serviceConfigs) {
      if (config.template?.cloudFormation) {
        const resourceName = this.toPascalCase(config.serviceId);
        template.Resources[resourceName] = config.template.cloudFormation;
      }
    }

    return JSON.stringify(template, null, 2);
  }

  /**
   * Generate Terraform template
   */
  generateTerraformTemplate(serviceConfigs) {
    let terraform = `# Generated Terraform configuration
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

`;

    for (const config of serviceConfigs) {
      if (config.template?.terraform) {
        terraform += `\n# ${config.serviceDefinition.name}\n`;
        terraform += config.template.terraform + '\n';
      }
    }

    return terraform;
  }

  /**
   * Generate CDK template (TypeScript)
   */
  generateCDKTemplate(serviceConfigs) {
    let cdk = `import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class GeneratedStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

`;

    for (const config of serviceConfigs) {
      const serviceName = this.toCamelCase(config.serviceId);
      cdk += `    // ${config.serviceDefinition.name}\n`;
      cdk += `    const ${serviceName} = new cdk.aws_${config.serviceId}.${this.getCDKConstruct(config.serviceId)}(this, '${this.toPascalCase(config.serviceId)}', {\n`;
      cdk += `      // Configuration based on your requirements\n`;
      cdk += `    });\n\n`;
    }

    cdk += `  }
}`;

    return cdk;
  }

  /**
   * Generate CLI commands
   */
  generateCLICommands(serviceConfigs) {
    const commands = [];
    
    for (const config of serviceConfigs) {
      if (config.template?.cli) {
        commands.push({
          service: config.serviceDefinition.name,
          purpose: config.purpose,
          commands: config.template.cli
        });
      }
    }
    
    return commands;
  }

  /**
   * Calculate total estimated cost
   */
  calculateTotalCost(serviceConfigs) {
    const total = serviceConfigs.reduce((sum, config) => {
      return sum + (config.estimatedCost || 0);
    }, 0);

    return {
      monthly: Math.round(total),
      annual: Math.round(total * 12),
      breakdown: serviceConfigs.map(config => ({
        service: config.serviceDefinition.name,
        cost: config.estimatedCost || 0
      }))
    };
  }

  /**
   * Utility methods
   */
  toPascalCase(str) {
    return str.replace(/(^\w|-\w)/g, (match) => 
      match.replace('-', '').toUpperCase()
    );
  }

  toCamelCase(str) {
    const pascal = this.toPascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
  }

  getCDKConstruct(serviceId) {
    const constructs = {
      's3': 'Bucket',
      'lambda': 'Function',
      'ec2': 'Instance',
      'rds': 'DatabaseInstance',
      'cloudfront': 'Distribution',
      'api-gateway': 'RestApi',
      'alb': 'ApplicationLoadBalancer',
      'ecs': 'Cluster'
    };
    
    return constructs[serviceId] || 'Resource';
  }

  /**
   * Generate generic template for unknown services
   */
  generateGenericTemplate(serviceConfig) {
    return {
      cloudFormation: {
        Type: `AWS::${serviceConfig.serviceDefinition.category}::Resource`,
        Properties: {
          // Generic properties
        }
      },
      terraform: `# ${serviceConfig.serviceDefinition.name} configuration needed`,
      cli: [`# ${serviceConfig.serviceDefinition.name} CLI commands needed`]
    };
  }
}

// Export instance
export const templateGenerator = new ServiceTemplateGenerator();

export default {
  ServiceTemplateGenerator,
  templateGenerator
};