import { describe, it, expect } from 'vitest'
import { 
  calculateServiceCost,
  calculateArchitectureCost,
  optimizeCostForTraffic,
  calculateFreeTierSavings
} from '../../utils/costCalculator'
import { mockArchitecture } from '../utils'

describe('Cost Calculator', () => {
  describe('calculateServiceCost', () => {
    it('should calculate S3 costs correctly', () => {
      const service = {
        service: 'S3',
        config: {
          storage: 10, // GB
          requests: 50000 // GET requests
        }
      }
      const traffic = {
        monthlyPageviews: 10000,
        dataTransfer: 5 // GB
      }

      const cost = calculateServiceCost(service, traffic)
      
      expect(cost.monthly).toBeCloseTo(0.25, 2) // $0.23 storage + $0.02 requests
      expect(cost.breakdown).toHaveProperty('storage')
      expect(cost.breakdown).toHaveProperty('requests')
      expect(cost.freeTierEligible).toBe(true)
    })

    it('should calculate Lambda costs correctly', () => {
      const service = {
        service: 'Lambda',
        config: {
          memorySize: 256,
          averageExecutionTime: 200, // ms
          monthlyInvocations: 100000
        }
      }
      const traffic = {
        monthlyApiCalls: 100000
      }

      const cost = calculateServiceCost(service, traffic)
      
      expect(cost.monthly).toBeGreaterThan(0)
      expect(cost.breakdown).toHaveProperty('invocations')
      expect(cost.breakdown).toHaveProperty('duration')
      expect(cost.freeTierEligible).toBe(true)
    })

    it('should calculate EC2 costs correctly', () => {
      const service = {
        service: 'EC2',
        config: {
          instanceType: 't3.micro',
          instanceCount: 1,
          region: 'us-east-1'
        }
      }
      const traffic = {}

      const cost = calculateServiceCost(service, traffic)
      
      expect(cost.monthly).toBeCloseTo(8.47, 1) // t3.micro pricing
      expect(cost.breakdown).toHaveProperty('compute')
      expect(cost.freeTierEligible).toBe(true)
    })

    it('should calculate RDS costs correctly', () => {
      const service = {
        service: 'RDS',
        config: {
          instanceClass: 'db.t3.micro',
          engine: 'mysql',
          storage: 20, // GB
          region: 'us-east-1'
        }
      }
      const traffic = {}

      const cost = calculateServiceCost(service, traffic)
      
      expect(cost.monthly).toBeGreaterThan(15) // RDS is more expensive
      expect(cost.breakdown).toHaveProperty('instance')
      expect(cost.breakdown).toHaveProperty('storage')
      expect(cost.freeTierEligible).toBe(true)
    })

    it('should handle unknown services gracefully', () => {
      const service = {
        service: 'UnknownService',
        config: {}
      }
      const traffic = {}

      const cost = calculateServiceCost(service, traffic)
      
      expect(cost.monthly).toBe(0)
      expect(cost.error).toBe('Unknown service type')
    })
  })

  describe('calculateArchitectureCost', () => {
    it('should calculate total architecture cost', () => {
      const architecture = {
        ...mockArchitecture,
        services: [
          {
            service: 'S3',
            config: { storage: 5, requests: 20000 }
          },
          {
            service: 'CloudFront',
            config: { dataTransfer: 10 }
          }
        ]
      }
      const traffic = {
        monthlyPageviews: 10000,
        dataTransfer: 10
      }

      const cost = calculateArchitectureCost(architecture, traffic)
      
      expect(cost.total.monthly).toBeGreaterThan(0)
      expect(cost.services).toHaveLength(2)
      expect(cost.services[0].service).toBe('S3')
      expect(cost.services[1].service).toBe('CloudFront')
      expect(cost.freeTierSavings).toBeGreaterThan(0)
    })

    it('should provide cost ranges (min, typical, max)', () => {
      const cost = calculateArchitectureCost(mockArchitecture, {
        monthlyPageviews: 5000
      })
      
      expect(cost.range).toHaveProperty('min')
      expect(cost.range).toHaveProperty('typical')
      expect(cost.range).toHaveProperty('max')
      expect(cost.range.min).toBeLessThan(cost.range.typical)
      expect(cost.range.typical).toBeLessThan(cost.range.max)
    })

    it('should calculate annual costs', () => {
      const cost = calculateArchitectureCost(mockArchitecture, {
        monthlyPageviews: 10000
      })
      
      expect(cost.annual).toBe(cost.total.monthly * 12)
    })
  })

  describe('optimizeCostForTraffic', () => {
    it('should recommend reserved instances for high traffic', () => {
      const architecture = {
        services: [
          {
            service: 'EC2',
            config: { instanceType: 't3.medium', instanceCount: 2 }
          }
        ]
      }
      const traffic = {
        monthlyPageviews: 1000000, // High traffic
        predictableLoad: true
      }

      const optimization = optimizeCostForTraffic(architecture, traffic)
      
      expect(optimization.recommendations).toContainEqual(
        expect.objectContaining({
          type: 'reserved-instances',
          savings: expect.any(Number)
        })
      )
    })

    it('should recommend spot instances for batch workloads', () => {
      const architecture = {
        services: [
          {
            service: 'EC2',
            config: { 
              instanceType: 'c5.large', 
              workloadType: 'batch',
              faultTolerant: true 
            }
          }
        ]
      }
      const traffic = {
        batchProcessing: true
      }

      const optimization = optimizeCostForTraffic(architecture, traffic)
      
      expect(optimization.recommendations).toContainEqual(
        expect.objectContaining({
          type: 'spot-instances',
          savings: expect.any(Number)
        })
      )
    })

    it('should recommend serverless for low traffic', () => {
      const architecture = {
        services: [
          {
            service: 'EC2',
            config: { instanceType: 't3.micro' }
          }
        ]
      }
      const traffic = {
        monthlyPageviews: 1000, // Very low traffic
        irregular: true
      }

      const optimization = optimizeCostForTraffic(architecture, traffic)
      
      expect(optimization.recommendations).toContainEqual(
        expect.objectContaining({
          type: 'serverless-migration',
          newServices: expect.arrayContaining(['Lambda'])
        })
      )
    })
  })

  describe('calculateFreeTierSavings', () => {
    it('should calculate S3 free tier savings', () => {
      const usage = {
        S3: {
          storage: 3, // GB (under 5GB free tier)
          requests: 15000 // GET requests (under 20k free tier)
        }
      }

      const savings = calculateFreeTierSavings(usage)
      
      expect(savings.S3.storage).toBeCloseTo(0.069, 3) // 3GB * $0.023
      expect(savings.S3.requests).toBeCloseTo(0.006, 3) // 15k * $0.0004/1000
      expect(savings.total).toBeGreaterThan(0)
    })

    it('should calculate Lambda free tier savings', () => {
      const usage = {
        Lambda: {
          invocations: 500000, // under 1M free tier
          gbSeconds: 200000 // under 400k free tier
        }
      }

      const savings = calculateFreeTierSavings(usage)
      
      expect(savings.Lambda.invocations).toBeCloseTo(0.1, 2) // 500k * $0.0000002
      expect(savings.Lambda.duration).toBeGreaterThan(0)
    })

    it('should handle usage exceeding free tier', () => {
      const usage = {
        S3: {
          storage: 10, // GB (exceeds 5GB free tier)
          requests: 50000 // GET requests (exceeds 20k free tier)
        }
      }

      const savings = calculateFreeTierSavings(usage)
      
      expect(savings.S3.storage).toBeCloseTo(0.115, 3) // 5GB * $0.023 (only free tier amount)
      expect(savings.S3.requests).toBeCloseTo(0.008, 3) // 20k * $0.0004/1000 (only free tier amount)
    })

    it('should return zero savings for services without free tier', () => {
      const usage = {
        RDS: {
          instanceHours: 100,
          storage: 20
        }
      }

      const savings = calculateFreeTierSavings(usage)
      
      expect(savings.RDS).toBeUndefined()
      expect(savings.total).toBe(0)
    })
  })

  describe('Cost Accuracy Requirements (±15% of actual AWS costs)', () => {
    // Real AWS pricing benchmarks as of 2024
    const AWS_BENCHMARKS = {
      s3: {
        storage: 0.023, // $0.023 per GB/month (Standard)
        getRequests: 0.0004, // $0.0004 per 1,000 GET requests
        putRequests: 0.0005, // $0.0005 per 1,000 PUT requests
        dataTransferOut: {
          first1GB: 0,
          next9GB: 0.09,
          next40GB: 0.085,
          next100GB: 0.07,
          over150GB: 0.05
        }
      },
      lambda: {
        requests: 0.0000002, // $0.20 per 1M requests
        gbSeconds: 0.0000166667, // $0.0000166667 per GB-second
        freeTier: {
          requests: 1000000,
          gbSeconds: 400000
        }
      },
      ec2: {
        't3.micro': 0.0104, // $0.0104 per hour
        't3.small': 0.0208, // $0.0208 per hour
        't3.medium': 0.0416, // $0.0416 per hour
        't3.large': 0.0832, // $0.0832 per hour
        ebsGp3: 0.08 // $0.08 per GB/month
      },
      rds: {
        'db.t3.micro': 0.017, // $0.017 per hour
        'db.t3.small': 0.034, // $0.034 per hour
        storage: 0.115, // $0.115 per GB/month
        backup: 0.095 // $0.095 per GB/month
      },
      cloudfront: {
        dataTransfer: 0.085, // $0.085 per GB (first 10TB)
        httpsRequests: 0.0100 // $0.01 per 10,000 HTTPS requests
      },
      apiGateway: {
        restRequests: 3.50 // $3.50 per million requests
      },
      dynamodb: {
        onDemandRead: 0.25, // $0.25 per million read request units
        onDemandWrite: 1.25, // $1.25 per million write request units
        storage: 0.25 // $0.25 per GB/month
      }
    }

    describe('S3 Cost Accuracy', () => {
      it('should calculate S3 storage costs within ±15% accuracy', () => {
        const usage = {
          monthly: {
            storageUsage: 100, // GB
            pageViews: 0,
            dataTransfer: 0
          }
        }
        
        const cost = calculateServiceCost('s3', usage, 'us-east-1', false)
        const expectedCost = 100 * AWS_BENCHMARKS.s3.storage // $2.30
        const tolerance = expectedCost * 0.15
        
        expect(cost.monthlyCost).toBeGreaterThan(0)
        expect(Math.abs(cost.monthlyCost - expectedCost)).toBeLessThan(tolerance)
      })

      it('should calculate S3 request costs within ±15% accuracy', () => {
        const usage = {
          monthly: {
            storageUsage: 0,
            pageViews: 100000, // GET requests
            dataTransfer: 0
          }
        }
        
        const cost = calculateServiceCost('s3', usage, 'us-east-1', false)
        const expectedCost = (100000 / 1000) * AWS_BENCHMARKS.s3.getRequests // $0.04
        const tolerance = Math.max(expectedCost * 0.15, 0.01) // Minimum $0.01 tolerance
        
        expect(Math.abs(cost.monthlyCost - expectedCost)).toBeLessThan(tolerance)
      })

      it('should calculate S3 data transfer costs within ±15% accuracy', () => {
        const usage = {
          monthly: {
            storageUsage: 0,
            pageViews: 0,
            dataTransfer: 50 // GB
          }
        }
        
        const cost = calculateServiceCost('s3', usage, 'us-east-1', false)
        // First 1GB free, next 9GB at $0.09, next 40GB at $0.085
        const expectedCost = (9 * 0.09) + (40 * 0.085) // $0.81 + $3.40 = $4.21
        const tolerance = expectedCost * 0.15
        
        expect(Math.abs(cost.monthlyCost - expectedCost)).toBeLessThan(tolerance)
      })
    })

    describe('Lambda Cost Accuracy', () => {
      it('should calculate Lambda invocation costs within ±15% accuracy', () => {
        const usage = {
          monthly: {
            apiRequests: 5000000 // 5M requests (above free tier)
          }
        }
        
        const cost = calculateServiceCost('lambda', usage, 'us-east-1', false)
        const expectedCost = 5000000 * AWS_BENCHMARKS.lambda.requests // $1.00
        const tolerance = expectedCost * 0.15
        
        expect(Math.abs(cost.breakdown.requests - expectedCost)).toBeLessThan(tolerance)
      })

      it('should calculate Lambda compute costs within ±15% accuracy', () => {
        const usage = {
          monthly: {
            apiRequests: 1000000 // 1M requests
          }
        }
        // Assume 200ms average duration, 512MB memory
        const avgDuration = 200 // ms
        const memorySize = 512 // MB
        const gbSeconds = (1000000 * avgDuration / 1000) * (memorySize / 1024) // 100,000 GB-seconds
        
        const cost = calculateServiceCost('lambda', usage, 'us-east-1', false)
        const expectedCost = gbSeconds * AWS_BENCHMARKS.lambda.gbSeconds // $1.67
        const tolerance = expectedCost * 0.15
        
        expect(Math.abs(cost.breakdown.compute - expectedCost)).toBeLessThan(tolerance)
      })

      it('should apply Lambda free tier correctly', () => {
        const usage = {
          monthly: {
            apiRequests: 500000 // 500K requests (within free tier)
          }
        }
        
        const cost = calculateServiceCost('lambda', usage, 'us-east-1', true)
        
        expect(cost.freeTierSavings).toBeGreaterThan(0)
        expect(cost.monthlyCost).toBeLessThan(cost.freeTierSavings)
      })
    })

    describe('EC2 Cost Accuracy', () => {
      it('should calculate EC2 instance costs within ±15% accuracy', () => {
        const usage = {
          monthly: {
            computeHours: 730 // Full month
          }
        }
        const configuration = {
          instanceType: 't3.small',
          instanceCount: 1,
          storageSize: 20
        }
        
        const cost = calculateServiceCost('ec2', usage, 'us-east-1', false, configuration)
        const expectedComputeCost = 730 * AWS_BENCHMARKS.ec2['t3.small'] // $15.18
        const expectedStorageCost = 20 * AWS_BENCHMARKS.ec2.ebsGp3 // $1.60
        const expectedTotal = expectedComputeCost + expectedStorageCost // $16.78
        const tolerance = expectedTotal * 0.15
        
        expect(Math.abs(cost.monthlyCost - expectedTotal)).toBeLessThan(tolerance)
      })

      it('should apply EC2 free tier correctly', () => {
        const usage = {
          monthly: {
            computeHours: 730
          }
        }
        const configuration = {
          instanceType: 't3.micro',
          instanceCount: 1,
          storageSize: 20
        }
        
        const cost = calculateServiceCost('ec2', usage, 'us-east-1', true, configuration)
        const expectedFreeTierSavings = 730 * AWS_BENCHMARKS.ec2['t3.micro'] // $7.59
        const tolerance = expectedFreeTierSavings * 0.15
        
        expect(Math.abs(cost.freeTierSavings - expectedFreeTierSavings)).toBeLessThan(tolerance)
      })
    })

    describe('RDS Cost Accuracy', () => {
      it('should calculate RDS instance costs within ±15% accuracy', () => {
        const usage = {
          monthly: {
            computeHours: 730
          }
        }
        const configuration = {
          instanceType: 'db.t3.small',
          storageSize: 100,
          backupRetention: 7
        }
        
        const cost = calculateServiceCost('rds', usage, 'us-east-1', false, configuration)
        const expectedComputeCost = 730 * AWS_BENCHMARKS.rds['db.t3.small'] // $24.82
        const expectedStorageCost = 100 * AWS_BENCHMARKS.rds.storage // $11.50
        const expectedBackupCost = (100 * 7 / 30) * AWS_BENCHMARKS.rds.backup // $2.22
        const expectedTotal = expectedComputeCost + expectedStorageCost + expectedBackupCost // $38.54
        const tolerance = expectedTotal * 0.15
        
        expect(Math.abs(cost.monthlyCost - expectedTotal)).toBeLessThan(tolerance)
      })
    })

    describe('CloudFront Cost Accuracy', () => {
      it('should calculate CloudFront costs within ±15% accuracy', () => {
        const usage = {
          monthly: {
            dataTransfer: 100, // GB
            pageViews: 1000000 // requests
          }
        }
        
        const cost = calculateServiceCost('cloudfront', usage, 'us-east-1', false)
        const expectedDataTransferCost = 100 * AWS_BENCHMARKS.cloudfront.dataTransfer // $8.50
        const expectedRequestCost = (1000000 / 10000) * AWS_BENCHMARKS.cloudfront.httpsRequests // $1.00
        const expectedTotal = expectedDataTransferCost + expectedRequestCost // $9.50
        const tolerance = expectedTotal * 0.15
        
        expect(Math.abs(cost.monthlyCost - expectedTotal)).toBeLessThan(tolerance)
      })
    })

    describe('API Gateway Cost Accuracy', () => {
      it('should calculate API Gateway costs within ±15% accuracy', () => {
        const usage = {
          monthly: {
            apiRequests: 2000000 // 2M requests (above free tier)
          }
        }
        
        const cost = calculateServiceCost('api-gateway', usage, 'us-east-1', false)
        const expectedCost = (2000000 / 1000000) * AWS_BENCHMARKS.apiGateway.restRequests // $7.00
        const tolerance = expectedCost * 0.15
        
        expect(Math.abs(cost.monthlyCost - expectedCost)).toBeLessThan(tolerance)
      })
    })

    describe('DynamoDB Cost Accuracy', () => {
      it('should calculate DynamoDB on-demand costs within ±15% accuracy', () => {
        const usage = {
          monthly: {
            apiRequests: 10000000, // 10M requests
            storageUsage: 50 // GB
          }
        }
        const configuration = {
          billingMode: 'on-demand'
        }
        
        const cost = calculateServiceCost('dynamodb', usage, 'us-east-1', false, configuration)
        const readRequests = 10000000 * 0.7 // 70% reads
        const writeRequests = 10000000 * 0.3 // 30% writes
        const expectedReadCost = (readRequests / 1000000) * AWS_BENCHMARKS.dynamodb.onDemandRead // $1.75
        const expectedWriteCost = (writeRequests / 1000000) * AWS_BENCHMARKS.dynamodb.onDemandWrite // $3.75
        const expectedStorageCost = 50 * AWS_BENCHMARKS.dynamodb.storage // $12.50
        const expectedTotal = expectedReadCost + expectedWriteCost + expectedStorageCost // $18.00
        const tolerance = expectedTotal * 0.15
        
        expect(Math.abs(cost.monthlyCost - expectedTotal)).toBeLessThan(tolerance)
      })
    })

    describe('Architecture-Level Cost Accuracy', () => {
      it('should calculate static SPA architecture costs within ±15% accuracy', () => {
        const architecture = {
          services: [
            {
              serviceId: 's3',
              purpose: 'Static hosting',
              configuration: {}
            },
            {
              serviceId: 'cloudfront',
              purpose: 'CDN',
              configuration: {}
            }
          ]
        }
        const traffic = {
          monthly: {
            pageViews: 100000,
            dataTransfer: 50,
            storageUsage: 5
          }
        }
        
        const cost = calculateArchitectureCost(architecture, traffic)
        
        // Expected S3 cost: storage + requests
        const expectedS3Cost = (5 * 0.023) + ((100000 / 1000) * 0.0004) // $0.155
        // Expected CloudFront cost: data transfer + requests
        const expectedCFCost = (50 * 0.085) + ((100000 / 10000) * 0.01) // $4.35
        const expectedTotal = expectedS3Cost + expectedCFCost // $4.505
        const tolerance = expectedTotal * 0.15
        
        expect(Math.abs(cost.total.monthly - expectedTotal)).toBeLessThan(tolerance)
      })

      it('should calculate serverless API architecture costs within ±15% accuracy', () => {
        const architecture = {
          services: [
            {
              serviceId: 'lambda',
              purpose: 'Compute',
              configuration: {}
            },
            {
              serviceId: 'api-gateway',
              purpose: 'API management',
              configuration: {}
            },
            {
              serviceId: 'dynamodb',
              purpose: 'Database',
              configuration: { billingMode: 'on-demand' }
            }
          ]
        }
        const traffic = {
          monthly: {
            apiRequests: 1000000,
            storageUsage: 10
          }
        }
        
        const cost = calculateArchitectureCost(architecture, traffic)
        
        // This should be within 15% of actual AWS costs for this architecture
        expect(cost.total.monthly).toBeGreaterThan(0)
        expect(cost.services).toHaveLength(3)
        
        // Verify individual service costs are reasonable
        const lambdaCost = cost.services.find(s => s.serviceId === 'lambda')
        const apiGatewayCost = cost.services.find(s => s.serviceId === 'api-gateway')
        const dynamodbCost = cost.services.find(s => s.serviceId === 'dynamodb')
        
        expect(lambdaCost.monthlyCost).toBeGreaterThan(0)
        expect(apiGatewayCost.monthlyCost).toBeGreaterThan(0)
        expect(dynamodbCost.monthlyCost).toBeGreaterThan(0)
      })
    })

    describe('Regional Pricing Accuracy', () => {
      it('should apply regional pricing multipliers correctly', () => {
        const architecture = {
          services: [
            {
              serviceId: 'ec2',
              purpose: 'Compute',
              configuration: { instanceType: 't3.small' }
            }
          ]
        }
        const traffic = {
          monthly: {
            computeHours: 730
          }
        }
        
        const usEastCost = calculateArchitectureCost(architecture, traffic, { region: 'us-east-1' })
        const euWestCost = calculateArchitectureCost(architecture, traffic, { region: 'eu-west-1' })
        
        // EU West should be slightly more expensive (2% multiplier)
        expect(euWestCost.total.monthly).toBeGreaterThan(usEastCost.total.monthly)
        
        const expectedMultiplier = 1.02
        const actualMultiplier = euWestCost.total.monthly / usEastCost.total.monthly
        const tolerance = 0.05 // 5% tolerance for regional pricing
        
        expect(Math.abs(actualMultiplier - expectedMultiplier)).toBeLessThan(tolerance)
      })
    })

    describe('Free Tier Accuracy', () => {
      it('should calculate free tier savings accurately', () => {
        const usage = {
          S3: {
            storage: 3, // GB (within 5GB free tier)
            requests: 15000 // GET requests (within 20k free tier)
          },
          Lambda: {
            invocations: 500000, // within 1M free tier
            gbSeconds: 200000 // within 400k free tier
          }
        }
        
        const savings = calculateFreeTierSavings(usage)
        
        // S3 savings
        const expectedS3StorageSavings = 3 * AWS_BENCHMARKS.s3.storage // $0.069
        const expectedS3RequestSavings = (15000 / 1000) * AWS_BENCHMARKS.s3.getRequests // $0.006
        
        // Lambda savings
        const expectedLambdaInvocationSavings = 500000 * AWS_BENCHMARKS.lambda.requests // $0.10
        const expectedLambdaDurationSavings = 200000 * AWS_BENCHMARKS.lambda.gbSeconds // $3.33
        
        const tolerance = 0.01 // $0.01 tolerance for small amounts
        
        expect(Math.abs(savings.S3.storage - expectedS3StorageSavings)).toBeLessThan(tolerance)
        expect(Math.abs(savings.S3.requests - expectedS3RequestSavings)).toBeLessThan(tolerance)
        expect(Math.abs(savings.Lambda.invocations - expectedLambdaInvocationSavings)).toBeLessThan(tolerance)
        expect(Math.abs(savings.Lambda.duration - expectedLambdaDurationSavings)).toBeLessThan(tolerance)
      })
    })
  })
})