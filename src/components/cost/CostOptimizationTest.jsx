// CostOptimizationTest.jsx - Test component for cost optimization features
import React, { useState } from 'react';
import CostOptimizationDashboard from './CostOptimizationDashboard.jsx';
import { architecturePatterns } from '../../data/architecturePatterns.js';

/**
 * Test component for cost optimization features
 */
const CostOptimizationTest = () => {
  const [selectedPattern, setSelectedPattern] = useState('static-spa');

  // Mock cost results for testing
  const mockCostResults = {
    totalMonthlyCost: 125.50,
    freeTierSavings: 25.00,
    netMonthlyCost: 100.50,
    currency: 'USD',
    region: 'us-east-1',
    regionName: 'US East (N. Virginia)',
    trafficLevel: 'medium',
    usage: {
      monthly: {
        pageViews: 50000,
        uniqueUsers: 5000,
        apiRequests: 100000,
        dataTransfer: 10,
        storageUsage: 5,
        computeHours: 730
      }
    },
    serviceCosts: [
      {
        serviceId: 'ec2',
        serviceName: 'Amazon EC2',
        purpose: 'Application hosting',
        monthlyCost: 60.00,
        freeTierSavings: 15.00,
        breakdown: {
          compute: 45.00,
          storage: 15.00,
          instanceType: 't3.small',
          instanceCount: 1,
          storageSize: 20
        }
      },
      {
        serviceId: 's3',
        serviceName: 'Amazon S3',
        purpose: 'Static assets',
        monthlyCost: 15.50,
        freeTierSavings: 5.00,
        breakdown: {
          storage: 10.00,
          requests: 3.50,
          dataTransfer: 2.00,
          storageGB: 10,
          getRequests: 10000,
          putRequests: 1000
        }
      },
      {
        serviceId: 'cloudfront',
        serviceName: 'Amazon CloudFront',
        purpose: 'CDN',
        monthlyCost: 25.00,
        freeTierSavings: 5.00,
        breakdown: {
          dataTransfer: 20.00,
          requests: 5.00,
          transferGB: 50,
          totalRequests: 50000
        }
      },
      {
        serviceId: 'rds',
        serviceName: 'Amazon RDS',
        purpose: 'Database',
        monthlyCost: 25.00,
        freeTierSavings: 0.00,
        breakdown: {
          compute: 20.00,
          storage: 5.00,
          instanceType: 'db.t3.micro',
          storageSize: 20
        }
      }
    ],
    breakdown: {
      compute: 85.00,
      storage: 20.00,
      networking: 15.50,
      database: 5.00,
      other: 0.00
    }
  };

  const handleOptimizationApply = (optimization) => {
    console.log('Applied optimization:', optimization);
    alert(`Applied optimization: ${optimization.type}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Cost Optimization Test Dashboard
          </h1>
          
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">
              Architecture Pattern:
            </label>
            <select
              value={selectedPattern}
              onChange={(e) => setSelectedPattern(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.entries(architecturePatterns).map(([id, pattern]) => (
                <option key={id} value={id}>
                  {pattern.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cost Optimization Dashboard */}
        <CostOptimizationDashboard
          architecturePattern={architecturePatterns[selectedPattern]}
          costResults={mockCostResults}
          currency="USD"
          onOptimizationApply={handleOptimizationApply}
        />

        {/* Test Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Test Information</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• This is a test environment with mock cost data</p>
            <p>• Selected Pattern: {architecturePatterns[selectedPattern]?.name}</p>
            <p>• Mock Monthly Cost: ${mockCostResults.netMonthlyCost}</p>
            <p>• Test all tabs: Overview, Cost Optimizer, Scenario Planning, Reserved Instances, Cost Alerts</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostOptimizationTest;