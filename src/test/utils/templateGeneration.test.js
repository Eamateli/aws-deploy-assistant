import { describe, it, expect, beforeEach } from 'vitest';
import { ServiceTemplateGenerator, templateGenerator } from '../../utils/serviceTemplates.js';

describe('Template Generation Correctness', () => {
  let generator;
  
  beforeEach(() => {
    generator = new ServiceTemplateGenerator();
  });

  describe('Service Template Generation', () => {
    describe('S3 Template Generation', () => {
      it('should generate correct S3 CloudFormation template for static hosting', () => {
        const config = {
          websiteHosting: true,
          bucketPolicy: 'public-read',
          versioning: false
        };

        const template = generator.generateS3Template(config);

        expect(template.cloudFormation).toEqual({
          Type: 'AWS::S3::Bucket',
          Properties: {
            BucketName: '${BucketName}',
            WebsiteConfiguration: {
              IndexDocument: 'index.html',
              ErrorDocument: 'error.html'
            },
            VersioningConfiguration: undefined,
            PublicAccessBlockConfiguration: {
              BlockPublicAcls: false,
              BlockPublicPolicy: false,
              IgnorePublicAcls: false,
              RestrictPublicBuckets: false
            }
          }
        });

        expect(template.cli).toContain('aws s3 mb s3://${BUCKET_NAME}');
        expect(template.cli).toContain('aws s3 website s3://${BUCKET_NAME} --index-document index.html --error-document error.html');
        expect(template.terraform).toContain('resource "aws_s3_bucket" "main"');
      });

      it('should generate correct S3 template for private storage', () => {
        const config = {
          websiteHosting: false,
          bucketPolicy: 'private',
          versioning: true
        };

        const template = generator.generateS3Template(config);

        expect(template.cloudFormation.Properties.WebsiteConfiguration).toBeUndefined();
        expect(template.cloudFormation.Properties.PublicAccessBlockConfiguration).toBeUndefined();
        expect(template.cloudFormation.Properties.VersioningConfiguration).toEqual({
          Status: 'Enabled'
        });
        expect(template.terraform).toContain('versioning_configuration');
      });
    });

    describe('Lambda Template Generation', () => {
      it('should generate correct Lambda CloudFormation template with default settings', () => {
        const config = {};

        const template = generator.generateLambdaTemplate(config);

        expect(template.cloudFormation).toEqual({
          Type: 'AWS::Lambda::Function',
          Properties: {
            FunctionName: '${FunctionName}',
            Runtime: 'nodejs18.x',
            Handler: 'index.handler',
            Code: {
              ZipFile: 'exports.handler = async (event) => { return { statusCode: 200, body: "Hello World" }; };'
            },
            Timeout: 30,
            MemorySize: 512,
            Role: { 'Fn::GetAtt': ['LambdaExecutionRole', 'Arn'] }
          }
        });

        expect(template.cli).toContain('zip function.zip index.js');
        expect(template.terraform).toContain('resource "aws_lambda_function" "main"');
      });

      it('should generate correct Lambda template with custom configuration', () => {
        const config = {
          runtime: 'python3.9',
          timeout: '60s',
          memory: '1024MB'
        };

        const template = generator.generateLambdaTemplate(config);

        expect(template.cloudFormation.Properties.Runtime).toBe('python3.9');
        expect(template.cloudFormation.Properties.Timeout).toBe(60);
        expect(template.cloudFormation.Properties.MemorySize).toBe(1024);
        expect(template.terraform).toContain('runtime         = "python3.9"');
        expect(template.terraform).toContain('timeout         = 60');
        expect(template.terraform).toContain('memory_size     = 1024');
      });
    });

    describe('EC2 Template Generation', () => {
      it('should generate correct EC2 CloudFormation template', () => {
        const config = {
          instanceType: 't3.small'
        };

        const template = generator.generateEC2Template(config);

        expect(template.cloudFormation).toEqual({
          Type: 'AWS::EC2::Instance',
          Properties: {
            ImageId: '${AMI_ID}',
            InstanceType: 't3.small',
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
        });

        expect(template.terraform).toContain('instance_type = "t3.small"');
        expect(template.cli[0]).toContain('--instance-type t3.small');
      });

      it('should use default instance type when not specified', () => {
        const config = {};

        const template = generator.generateEC2Template(config);

        expect(template.cloudFormation.Properties.InstanceType).toBe('t3.micro');
        expect(template.terraform).toContain('instance_type = "t3.micro"');
      });
    });

    describe('RDS Template Generation', () => {
      it('should generate correct RDS CloudFormation template with MySQL', () => {
        const config = {
          engine: 'mysql',
          instanceClass: 'db.t3.small',
          multiAZ: true,
          backups: 'automated'
        };

        const template = generator.generateRDSTemplate(config);

        expect(template.cloudFormation).toEqual({
          Type: 'AWS::RDS::DBInstance',
          Properties: {
            DBInstanceIdentifier: '${DBInstanceId}',
            DBInstanceClass: 'db.t3.small',
            Engine: 'mysql',
            MasterUsername: '${DBUsername}',
            MasterUserPassword: '${DBPassword}',
            AllocatedStorage: '20',
            VPCSecurityGroups: ['${DBSecurityGroupId}'],
            DBSubnetGroupName: '${DBSubnetGroup}',
            MultiAZ: true,
            BackupRetentionPeriod: 7
          }
        });

        expect(template.terraform).toContain('engine         = "mysql"');
        expect(template.terraform).toContain('instance_class = "db.t3.small"');
        expect(template.terraform).toContain('multi_az               = true');
        expect(template.terraform).toContain('backup_retention_period = 7');
      });

      it('should handle PostgreSQL with no backups', () => {
        const config = {
          engine: 'postgres',
          instanceClass: 'db.t3.micro',
          multiAZ: false,
          backups: 'none'
        };

        const template = generator.generateRDSTemplate(config);

        expect(template.cloudFormation.Properties.Engine).toBe('postgres');
        expect(template.cloudFormation.Properties.MultiAZ).toBe(false);
        expect(template.cloudFormation.Properties.BackupRetentionPeriod).toBe(0);
      });
    });

    describe('CloudFront Template Generation', () => {
      it('should generate correct CloudFront CloudFormation template', () => {
        const config = {
          compression: true
        };

        const template = generator.generateCloudFrontTemplate(config);

        expect(template.cloudFormation).toEqual({
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
                Compress: true,
                CachePolicyId: '4135ea2d-6df8-44a3-9df3-4b5a84be39ad'
              },
              Enabled: true,
              DefaultRootObject: 'index.html'
            }
          }
        });

        expect(template.terraform).toContain('resource "aws_cloudfront_distribution" "main"');
        expect(template.terraform).toContain('compress               = true');
      });
    });
  });

  describe('Architecture Template Generation', () => {
    it('should generate complete architecture template', () => {
      const pattern = {
        name: 'Static SPA',
        description: 'Static single page application hosting',
        deployment: {
          timeEstimate: '20 minutes'
        }
      };

      const serviceConfigs = [
        {
          serviceId: 's3',
          serviceDefinition: { name: 'S3' },
          purpose: 'Static hosting',
          required: true,
          configuration: { websiteHosting: true },
          estimatedCost: 5,
          template: generator.generateS3Template({ websiteHosting: true })
        },
        {
          serviceId: 'cloudfront',
          serviceDefinition: { name: 'CloudFront' },
          purpose: 'CDN',
          required: true,
          configuration: { compression: true },
          estimatedCost: 10,
          template: generator.generateCloudFrontTemplate({ compression: true })
        }
      ];

      const template = generator.generateArchitectureTemplate(pattern, serviceConfigs);

      expect(template.metadata.name).toBe('Static SPA');
      expect(template.metadata.description).toBe('Static single page application hosting');
      expect(template.metadata.deploymentTime).toBe('20 minutes');
      expect(template.metadata.estimatedCost.monthly).toBe(15);
      expect(template.metadata.estimatedCost.annual).toBe(180);

      expect(template.services).toHaveLength(2);
      expect(template.services[0].id).toBe('s3');
      expect(template.services[1].id).toBe('cloudfront');

      expect(template.templates.cloudFormation).toContain('AWSTemplateFormatVersion');
      expect(template.templates.terraform).toContain('terraform {');
      expect(template.templates.cdk).toContain('import * as cdk');
      expect(template.templates.cli).toHaveLength(2);
    });
  });

  describe('CloudFormation Template Generation', () => {
    it('should generate valid CloudFormation JSON', () => {
      const serviceConfigs = [
        {
          serviceId: 's3',
          template: {
            cloudFormation: {
              Type: 'AWS::S3::Bucket',
              Properties: { BucketName: 'test-bucket' }
            }
          }
        },
        {
          serviceId: 'lambda',
          template: {
            cloudFormation: {
              Type: 'AWS::Lambda::Function',
              Properties: { FunctionName: 'test-function' }
            }
          }
        }
      ];

      const cfTemplate = generator.generateCloudFormationTemplate(serviceConfigs);
      const parsed = JSON.parse(cfTemplate);

      expect(parsed.AWSTemplateFormatVersion).toBe('2010-09-09');
      expect(parsed.Description).toBe('Generated AWS architecture template');
      expect(parsed.Resources.S3).toEqual({
        Type: 'AWS::S3::Bucket',
        Properties: { BucketName: 'test-bucket' }
      });
      expect(parsed.Resources.Lambda).toEqual({
        Type: 'AWS::Lambda::Function',
        Properties: { FunctionName: 'test-function' }
      });
    });
  });

  describe('Terraform Template Generation', () => {
    it('should generate valid Terraform configuration', () => {
      const serviceConfigs = [
        {
          serviceId: 's3',
          serviceDefinition: { name: 'S3 Bucket' },
          template: {
            terraform: 'resource "aws_s3_bucket" "main" {\n  bucket = "test-bucket"\n}'
          }
        },
        {
          serviceId: 'lambda',
          serviceDefinition: { name: 'Lambda Function' },
          template: {
            terraform: 'resource "aws_lambda_function" "main" {\n  function_name = "test-function"\n}'
          }
        }
      ];

      const tfTemplate = generator.generateTerraformTemplate(serviceConfigs);

      expect(tfTemplate).toContain('terraform {');
      expect(tfTemplate).toContain('required_providers {');
      expect(tfTemplate).toContain('provider "aws" {');
      expect(tfTemplate).toContain('variable "aws_region" {');
      expect(tfTemplate).toContain('# S3 Bucket');
      expect(tfTemplate).toContain('resource "aws_s3_bucket" "main"');
      expect(tfTemplate).toContain('# Lambda Function');
      expect(tfTemplate).toContain('resource "aws_lambda_function" "main"');
    });
  });

  describe('CDK Template Generation', () => {
    it('should generate valid CDK TypeScript code', () => {
      const serviceConfigs = [
        {
          serviceId: 's3',
          serviceDefinition: { name: 'S3 Bucket' }
        },
        {
          serviceId: 'lambda',
          serviceDefinition: { name: 'Lambda Function' }
        }
      ];

      const cdkTemplate = generator.generateCDKTemplate(serviceConfigs);

      expect(cdkTemplate).toContain("import * as cdk from 'aws-cdk-lib'");
      expect(cdkTemplate).toContain("import { Construct } from 'constructs'");
      expect(cdkTemplate).toContain('export class GeneratedStack extends cdk.Stack');
      expect(cdkTemplate).toContain('// S3 Bucket');
      expect(cdkTemplate).toContain('const s3 = new cdk.aws_s3.Bucket');
      expect(cdkTemplate).toContain('// Lambda Function');
      expect(cdkTemplate).toContain('const lambda = new cdk.aws_lambda.Function');
    });
  });

  describe('CLI Commands Generation', () => {
    it('should generate CLI commands for all services', () => {
      const serviceConfigs = [
        {
          serviceDefinition: { name: 'S3 Bucket' },
          purpose: 'Static hosting',
          template: {
            cli: ['aws s3 mb s3://test-bucket', 'aws s3 website s3://test-bucket']
          }
        },
        {
          serviceDefinition: { name: 'Lambda Function' },
          purpose: 'Serverless compute',
          template: {
            cli: ['zip function.zip index.js', 'aws lambda create-function']
          }
        }
      ];

      const cliCommands = generator.generateCLICommands(serviceConfigs);

      expect(cliCommands).toHaveLength(2);
      expect(cliCommands[0].service).toBe('S3 Bucket');
      expect(cliCommands[0].purpose).toBe('Static hosting');
      expect(cliCommands[0].commands).toContain('aws s3 mb s3://test-bucket');
      expect(cliCommands[1].service).toBe('Lambda Function');
      expect(cliCommands[1].commands).toContain('zip function.zip index.js');
    });
  });

  describe('Deployment Steps Generation', () => {
    it('should generate deployment steps with prerequisites and service steps', () => {
      const pattern = {
        name: 'Test Pattern'
      };

      const serviceConfigs = [
        {
          serviceId: 's3',
          serviceDefinition: { name: 'S3 Bucket' },
          purpose: 'Static hosting',
          required: true,
          template: {
            cli: ['aws s3 mb s3://test-bucket']
          }
        },
        {
          serviceId: 'cloudfront',
          serviceDefinition: { name: 'CloudFront' },
          purpose: 'CDN',
          required: false,
          template: {
            cli: ['# CloudFront setup']
          }
        }
      ];

      const steps = generator.generateDeploymentSteps(pattern, serviceConfigs);

      expect(steps).toHaveLength(3); // Prerequisites + S3 (required only) + Final config
      expect(steps[0].title).toBe('Prerequisites');
      expect(steps[0].commands).toContain('aws configure # Configure AWS CLI with your credentials');
      expect(steps[1].title).toBe('Deploy S3 Bucket');
      expect(steps[1].service).toBe('s3');
      expect(steps[2].title).toBe('Final Configuration');
    });
  });

  describe('Utility Methods', () => {
    it('should convert strings to PascalCase correctly', () => {
      expect(generator.toPascalCase('s3')).toBe('S3');
      expect(generator.toPascalCase('api-gateway')).toBe('ApiGateway');
      expect(generator.toPascalCase('application-load-balancer')).toBe('ApplicationLoadBalancer');
    });

    it('should convert strings to camelCase correctly', () => {
      expect(generator.toCamelCase('s3')).toBe('s3');
      expect(generator.toCamelCase('api-gateway')).toBe('apiGateway');
      expect(generator.toCamelCase('application-load-balancer')).toBe('applicationLoadBalancer');
    });

    it('should get correct CDK construct names', () => {
      expect(generator.getCDKConstruct('s3')).toBe('Bucket');
      expect(generator.getCDKConstruct('lambda')).toBe('Function');
      expect(generator.getCDKConstruct('ec2')).toBe('Instance');
      expect(generator.getCDKConstruct('rds')).toBe('DatabaseInstance');
      expect(generator.getCDKConstruct('unknown')).toBe('Resource');
    });
  });

  describe('Cost Calculation', () => {
    it('should calculate total costs correctly', () => {
      const serviceConfigs = [
        {
          serviceDefinition: { name: 'S3' },
          estimatedCost: 5
        },
        {
          serviceDefinition: { name: 'CloudFront' },
          estimatedCost: 10
        },
        {
          serviceDefinition: { name: 'Lambda' },
          estimatedCost: 15
        }
      ];

      const totalCost = generator.calculateTotalCost(serviceConfigs);

      expect(totalCost.monthly).toBe(30);
      expect(totalCost.annual).toBe(360);
      expect(totalCost.breakdown).toHaveLength(3);
      expect(totalCost.breakdown[0]).toEqual({ service: 'S3', cost: 5 });
      expect(totalCost.breakdown[1]).toEqual({ service: 'CloudFront', cost: 10 });
      expect(totalCost.breakdown[2]).toEqual({ service: 'Lambda', cost: 15 });
    });

    it('should handle missing cost estimates', () => {
      const serviceConfigs = [
        {
          serviceDefinition: { name: 'S3' },
          estimatedCost: 5
        },
        {
          serviceDefinition: { name: 'CloudFront' }
          // No estimatedCost
        }
      ];

      const totalCost = generator.calculateTotalCost(serviceConfigs);

      expect(totalCost.monthly).toBe(5);
      expect(totalCost.breakdown[1]).toEqual({ service: 'CloudFront', cost: 0 });
    });
  });

  describe('Generic Template Generation', () => {
    it('should generate generic template for unknown services', () => {
      const serviceConfig = {
        serviceDefinition: {
          name: 'Unknown Service',
          category: 'Compute'
        }
      };

      const template = generator.generateGenericTemplate(serviceConfig);

      expect(template.cloudFormation.Type).toBe('AWS::Compute::Resource');
      expect(template.terraform).toContain('# Unknown Service configuration needed');
      expect(template.cli[0]).toContain('# Unknown Service CLI commands needed');
    });
  });

  describe('Template Validation', () => {
    it('should generate syntactically valid JSON for CloudFormation', () => {
      const serviceConfigs = [
        {
          serviceId: 's3',
          template: {
            cloudFormation: {
              Type: 'AWS::S3::Bucket',
              Properties: { BucketName: 'test' }
            }
          }
        }
      ];

      const cfTemplate = generator.generateCloudFormationTemplate(serviceConfigs);
      
      expect(() => JSON.parse(cfTemplate)).not.toThrow();
      const parsed = JSON.parse(cfTemplate);
      expect(parsed).toHaveProperty('AWSTemplateFormatVersion');
      expect(parsed).toHaveProperty('Resources');
    });

    it('should generate valid Terraform syntax', () => {
      const serviceConfigs = [
        {
          serviceId: 's3',
          serviceDefinition: { name: 'S3' },
          template: {
            terraform: 'resource "aws_s3_bucket" "main" {\n  bucket = "test"\n}'
          }
        }
      ];

      const tfTemplate = generator.generateTerraformTemplate(serviceConfigs);
      
      // Basic syntax validation
      expect(tfTemplate).toMatch(/terraform\s*{/);
      expect(tfTemplate).toMatch(/provider\s+"aws"\s*{/);
      expect(tfTemplate).toMatch(/resource\s+"aws_s3_bucket"\s+"main"\s*{/);
    });

    it('should generate valid TypeScript syntax for CDK', () => {
      const serviceConfigs = [
        {
          serviceId: 's3',
          serviceDefinition: { name: 'S3' }
        }
      ];

      const cdkTemplate = generator.generateCDKTemplate(serviceConfigs);
      
      // Basic TypeScript syntax validation
      expect(cdkTemplate).toMatch(/import.*from/);
      expect(cdkTemplate).toMatch(/export class.*extends/);
      expect(cdkTemplate).toMatch(/constructor\(/);
      expect(cdkTemplate).toMatch(/new cdk\./);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty service configurations', () => {
      const pattern = { name: 'Empty Pattern' };
      const serviceConfigs = [];

      const template = generator.generateArchitectureTemplate(pattern, serviceConfigs);

      expect(template.services).toHaveLength(0);
      expect(template.metadata.estimatedCost.monthly).toBe(0);
      expect(template.deploymentSteps).toHaveLength(2); // Prerequisites + Final config
    });

    it('should handle services without templates', () => {
      const serviceConfigs = [
        {
          serviceId: 's3',
          serviceDefinition: { name: 'S3' },
          // No template property
        }
      ];

      const cfTemplate = generator.generateCloudFormationTemplate(serviceConfigs);
      const parsed = JSON.parse(cfTemplate);

      expect(Object.keys(parsed.Resources)).toHaveLength(0);
    });

    it('should handle invalid configuration gracefully', () => {
      const config = {
        timeout: 'invalid',
        memory: 'invalid'
      };

      const template = generator.generateLambdaTemplate(config);

      // Should fall back to defaults when parsing fails
      expect(template.cloudFormation.Properties.Timeout).toBe(30);
      expect(template.cloudFormation.Properties.MemorySize).toBe(512);
    });
  });
});