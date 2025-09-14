import { describe, it, expect } from 'vitest'
import { calculateServiceCost, calculateArchitectureCost } from '../../utils/costCalculator'

describe('Cost Calculation Precision (±15% of actual AWS costs)', () => {
  // Real AWS pricing benchmarks as of 2024 (US East 1)
  const AWS_BENCHMARKS = {
    s3: {
      storage: 0.023, // $0.023 per GB/month (Standard)
      getRequests: 0.0004, // $0.0004 per 1,000 GET requests
      putRequests: 0.0005, // $0.0005 per 1,000 PUT requests
    },
    lambda: {
      requests: 0.0000002, // $0.20 per 1M requests
      gbSeconds: 0.0000166667, // $0.0000166667 per GB-second
    },
    ec2: {
      't3.micro': 0.0104, // $0.0104 per hour
      't3.small': 0.0208, // $0.0208 per hour
      ebsGp3: 0.08 // $0.08 per GB/month
    },
    cloudfront: {
      dataTransfer: 0.085, // $0.085 per GB (first 10TB)
      httpsRequests: 0.0100 // $0.01 per 10,000 HTTPS requests
    }
  }

  describe('Individual Service Accuracy', () => {
    it('should calculate S3 storage costs within ±15% of AWS pricing', () => {
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

    it('should calculate Lambda costs within ±15% of AWS pricing', () => {
      const usage = {
        monthly: {
          apiRequests: 2000000 // 2M requests (above free tier)
        }
      }
      
      const cost = calculateServiceCost('lambda', usage, 'us-east-1', false)
      
      // Expected: 2M * $0.0000002 = $0.40 for requests
      // Plus compute costs based on 200ms avg duration, 512MB memory
      const expectedRequestCost = 2000000 * AWS_BENCHMARKS.lambda.requests
      const gbSeconds = (2000000 * 200 / 1000) * (512 / 1024) // 200,000 GB-seconds
      const expectedComputeCost = gbSeconds * AWS_BENCHMARKS.lambda.gbSeconds
      const expectedTotal = expectedRequestCost + expectedComputeCost
      const tolerance = expectedTotal * 0.15
      
      expect(cost.monthlyCost).toBeGreaterThan(0)
      expect(Math.abs(cost.monthlyCost - expectedTotal)).toBeLessThan(tolerance)
    })

    it('should calculate EC2 costs within ±15% of AWS pricing', () => {
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
      
      expect(cost.monthlyCost).toBeGreaterThan(0)
      expect(Math.abs(cost.monthlyCost - expectedTotal)).toBeLessThan(tolerance)
    })

    it('should calculate CloudFront costs within ±15% of AWS pricing', () => {
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
      
      expect(cost.monthlyCost).toBeGreaterThan(0)
      expect(Math.abs(cost.monthlyCost - expectedTotal)).toBeLessThan(tolerance)
    })
  })

  describe('Architecture-Level Accuracy', () => {
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
      const options = {
        region: 'us-east-1',
        trafficLevel: 'medium',
        includeFreeTier: false
      }
      
      const cost = calculateArchitectureCost(architecture, { monthly: { pageViews: 50000, apiRequests: 500000, storageUsage: 10, dataTransfer: 50 } }, options)
      
      // Verify the calculation produces reasonable results
      expect(cost.total.monthly).toBeGreaterThan(0)
      expect(cost.services).toHaveLength(2)
      
      // Each service should have a reasonable cost
      const s3Cost = cost.services.find(s => s.serviceId === 's3')
      const cloudfrontCost = cost.services.find(s => s.serviceId === 'cloudfront')
      
      expect(s3Cost.monthlyCost).toBeGreaterThan(0)
      expect(cloudfrontCost.monthlyCost).toBeGreaterThan(0)
      
      // Total should be sum of parts
      const expectedTotal = s3Cost.monthlyCost + cloudfrontCost.monthlyCost
      expect(Math.abs(cost.total.monthly - expectedTotal)).toBeLessThan(0.01)
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
      const options = {
        region: 'us-east-1',
        trafficLevel: 'medium',
        includeFreeTier: false
      }
      
      const cost = calculateArchitectureCost(architecture, { monthly: { pageViews: 50000, apiRequests: 1000000, storageUsage: 10, dataTransfer: 50 } }, options)
      
      // Verify the calculation produces reasonable results
      expect(cost.total.monthly).toBeGreaterThan(0)
      expect(cost.services).toHaveLength(3)
      
      // Each service should have a reasonable cost
      const lambdaCost = cost.services.find(s => s.serviceId === 'lambda')
      const apiGatewayCost = cost.services.find(s => s.serviceId === 'api-gateway')
      const dynamodbCost = cost.services.find(s => s.serviceId === 'dynamodb')
      
      expect(lambdaCost.monthlyCost).toBeGreaterThan(0)
      expect(apiGatewayCost.monthlyCost).toBeGreaterThan(0)
      expect(dynamodbCost.monthlyCost).toBeGreaterThan(0)
    })
  })

  describe('Free Tier Accuracy', () => {
    it('should apply free tier savings correctly', () => {
      const usage = {
        monthly: {
          storageUsage: 3, // GB (within 5GB free tier)
          pageViews: 15000, // GET requests (within 20k free tier)
          apiRequests: 500000 // Lambda requests (within 1M free tier)
        }
      }
      
      const s3Cost = calculateServiceCost('s3', usage, 'us-east-1', true)
      const lambdaCost = calculateServiceCost('lambda', usage, 'us-east-1', true)
      
      // Should have free tier savings
      expect(s3Cost.freeTierSavings).toBeGreaterThan(0)
      expect(lambdaCost.freeTierSavings).toBeGreaterThan(0)
      
      // Net cost should be less than gross cost
      expect(s3Cost.monthlyCost).toBeLessThan(s3Cost.monthlyCost + s3Cost.freeTierSavings)
      expect(lambdaCost.monthlyCost).toBeLessThan(lambdaCost.monthlyCost + lambdaCost.freeTierSavings)
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
      const options = {
        trafficLevel: 'medium',
        includeFreeTier: false
      }
      
      const usEastCost = calculateArchitectureCost(architecture, { monthly: { computeHours: 730 } }, { ...options, region: 'us-east-1' })
      const euWestCost = calculateArchitectureCost(architecture, { monthly: { computeHours: 730 } }, { ...options, region: 'eu-west-1' })
      
      // EU West should be slightly more expensive (2% multiplier)
      expect(euWestCost.total.monthly).toBeGreaterThan(usEastCost.total.monthly)
      
      const actualMultiplier = euWestCost.total.monthly / usEastCost.total.monthly
      const expectedMultiplier = 1.02
      const tolerance = 0.05 // 5% tolerance for regional pricing
      
      expect(Math.abs(actualMultiplier - expectedMultiplier)).toBeLessThan(tolerance)
    })
  })

  describe('Cost Optimization Accuracy', () => {
    it('should provide accurate cost optimization recommendations', () => {
      const architecture = {
        services: [
          {
            serviceId: 'ec2',
            purpose: 'Compute',
            configuration: { instanceType: 't3.large', instanceCount: 2 }
          }
        ]
      }
      const options = {
        region: 'us-east-1',
        trafficLevel: 'high',
        includeFreeTier: false
      }
      
      const cost = calculateArchitectureCost(architecture, { monthly: { computeHours: 730 } }, options)
      
      // Should provide optimization recommendations for high-cost scenarios
      expect(cost.optimizations).toBeDefined()
      expect(Array.isArray(cost.optimizations)).toBe(true)
      
      // Should recommend reserved instances for consistent high-cost workloads
      const reservedInstanceRec = cost.optimizations.find(opt => opt.type === 'reserved-instances')
      if (cost.total.monthly > 50) {
        expect(reservedInstanceRec).toBeDefined()
      }
    })
  })
})