// Test utilities and mock data

export const mockArchitecture = {
  id: 'test-architecture',
  name: 'Test Architecture',
  services: [
    {
      service: 'S3',
      serviceId: 's3',
      purpose: 'Static hosting',
      config: {
        storage: 5,
        requests: 20000
      }
    },
    {
      service: 'CloudFront',
      serviceId: 'cloudfront',
      purpose: 'CDN',
      config: {
        dataTransfer: 10
      }
    }
  ]
};

export const mockTraffic = {
  monthlyPageviews: 10000,
  dataTransfer: 10,
  storageUsage: 5
};

export default {
  mockArchitecture,
  mockTraffic
};