// Automatic Layout Algorithm for AWS Architecture Diagrams
// Positions services based on data flow and architectural patterns

/**
 * Layout Algorithm for AWS Architecture Diagrams
 * Automatically positions services based on their relationships and data flow
 */
export class ArchitectureLayoutEngine {
  constructor() {
    this.nodeWidth = 200;
    this.nodeHeight = 120;
    this.horizontalSpacing = 100;
    this.verticalSpacing = 80;
    this.layerSpacing = 250;
  }

  /**
   * Generate layout for an architecture recommendation
   * @param {Object} recommendation - Architecture recommendation with services
   * @returns {Object} Layout with positioned nodes and edges
   */
  generateLayout(recommendation) {
    const { services, pattern } = recommendation;
    
    // Analyze service relationships
    const relationships = this.analyzeServiceRelationships(services, pattern);
    
    // Create layers based on architectural tiers
    const layers = this.createArchitecturalLayers(services, relationships);
    
    // Position nodes within layers
    const nodes = this.positionNodes(layers);
    
    // Generate edges based on relationships
    const edges = this.generateEdges(relationships, nodes);
    
    return {
      nodes,
      edges,
      layout: {
        width: this.calculateLayoutWidth(layers),
        height: this.calculateLayoutHeight(layers),
        layers: layers.length
      }
    };
  }

  /**
   * Analyze relationships between services
   */
  analyzeServiceRelationships(services, pattern) {
    const relationships = [];
    const serviceMap = new Map(services.map(s => [s.serviceId, s]));

    // Define common AWS service relationships
    const relationshipRules = {
      // Frontend to CDN
      's3-cloudfront': {
        type: 'cdnDelivery',
        label: 'Static Content',
        direction: 's3 -> cloudfront'
      },
      
      // API Gateway to Lambda
      'api-gateway-lambda': {
        type: 'apiCall',
        label: 'Function Invocation',
        direction: 'api-gateway -> lambda'
      },
      
      // Lambda to Database
      'lambda-dynamodb': {
        type: 'dataFlow',
        label: 'Data Access',
        direction: 'lambda -> dynamodb'
      },
      'lambda-rds': {
        type: 'dataFlow',
        label: 'SQL Queries',
        direction: 'lambda -> rds'
      },
      
      // Load Balancer to Compute
      'alb-ec2': {
        type: 'networkFlow',
        label: 'HTTP Traffic',
        direction: 'alb -> ec2'
      },
      'alb-ecs': {
        type: 'networkFlow',
        label: 'Container Traffic',
        direction: 'alb -> ecs'
      },
      
      // Compute to Database
      'ec2-rds': {
        type: 'dataFlow',
        label: 'Database Connection',
        direction: 'ec2 -> rds'
      },
      'ecs-rds': {
        type: 'dataFlow',
        label: 'Database Connection',
        direction: 'ecs -> rds'
      },
      
      // Authentication flows
      'cognito-lambda': {
        type: 'authFlow',
        label: 'User Auth',
        direction: 'cognito -> lambda'
      },
      'cognito-api-gateway': {
        type: 'authFlow',
        label: 'API Auth',
        direction: 'cognito -> api-gateway'
      },
      
      // Monitoring connections
      'cloudwatch-lambda': {
        type: 'networkFlow',
        label: 'Logs & Metrics',
        direction: 'lambda -> cloudwatch'
      },
      'cloudwatch-ec2': {
        type: 'networkFlow',
        label: 'Logs & Metrics',
        direction: 'ec2 -> cloudwatch'
      },
      
      // Storage connections
      'ec2-s3': {
        type: 'dataFlow',
        label: 'File Storage',
        direction: 'ec2 -> s3'
      },
      'lambda-s3': {
        type: 'dataFlow',
        label: 'File Access',
        direction: 'lambda -> s3'
      }
    };

    // Find relationships based on services present
    for (const service1 of services) {
      for (const service2 of services) {
        if (service1.serviceId === service2.serviceId) continue;
        
        const relationshipKey = `${service1.serviceId}-${service2.serviceId}`;
        const reverseKey = `${service2.serviceId}-${service1.serviceId}`;
        
        if (relationshipRules[relationshipKey]) {
          relationships.push({
            ...relationshipRules[relationshipKey],
            source: service1.serviceId,
            target: service2.serviceId,
            sourceService: service1,
            targetService: service2
          });
        } else if (relationshipRules[reverseKey]) {
          const rule = relationshipRules[reverseKey];
          // Check if direction matches
          if (rule.direction.includes(`${service2.serviceId} ->`)) {
            relationships.push({
              ...rule,
              source: service2.serviceId,
              target: service1.serviceId,
              sourceService: service2,
              targetService: service1
            });
          }
        }
      }
    }

    return relationships;
  }

  /**
   * Create architectural layers (tiers)
   */
  createArchitecturalLayers(services, relationships) {
    const layers = [];
    const serviceMap = new Map(services.map(s => [s.serviceId, s]));
    const processed = new Set();

    // Define layer priorities for different service types
    const layerPriorities = {
      // Layer 0: External/User-facing
      'cloudfront': 0,
      'route53': 0,
      
      // Layer 1: Load Balancers and API Gateways
      'alb': 1,
      'api-gateway': 1,
      
      // Layer 2: Compute Services
      'lambda': 2,
      'ec2': 2,
      'ecs': 2,
      
      // Layer 3: Databases and Storage
      'rds': 3,
      'dynamodb': 3,
      's3': 3,
      
      // Layer 4: Supporting Services
      'cognito': 4,
      'cloudwatch': 4
    };

    // Initialize layers
    const maxLayers = 5;
    for (let i = 0; i < maxLayers; i++) {
      layers.push([]);
    }

    // Assign services to layers based on priorities
    for (const service of services) {
      const layerIndex = layerPriorities[service.serviceId] || 2; // Default to compute layer
      layers[layerIndex].push(service);
      processed.add(service.serviceId);
    }

    // Remove empty layers
    return layers.filter(layer => layer.length > 0);
  }

  /**
   * Position nodes within their layers
   */
  positionNodes(layers) {
    const nodes = [];
    let currentY = 0;

    for (let layerIndex = 0; layerIndex < layers.length; layerIndex++) {
      const layer = layers[layerIndex];
      const layerWidth = layer.length * (this.nodeWidth + this.horizontalSpacing) - this.horizontalSpacing;
      let currentX = -layerWidth / 2; // Center the layer

      for (let nodeIndex = 0; nodeIndex < layer.length; nodeIndex++) {
        const service = layer[nodeIndex];
        
        nodes.push({
          id: service.serviceId,
          type: 'awsService',
          position: {
            x: currentX,
            y: currentY
          },
          data: {
            service: service.serviceId,
            serviceDefinition: service.serviceDefinition,
            purpose: service.purpose,
            configuration: service.configuration,
            estimatedCost: service.estimatedCost,
            required: service.required,
            status: 'active'
          }
        });

        currentX += this.nodeWidth + this.horizontalSpacing;
      }

      currentY += this.nodeHeight + this.layerSpacing;
    }

    return nodes;
  }

  /**
   * Generate edges based on relationships
   */
  generateEdges(relationships, nodes) {
    const edges = [];
    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    for (let i = 0; i < relationships.length; i++) {
      const relationship = relationships[i];
      const sourceNode = nodeMap.get(relationship.source);
      const targetNode = nodeMap.get(relationship.target);

      if (sourceNode && targetNode) {
        edges.push({
          id: `edge-${i}`,
          source: relationship.source,
          target: relationship.target,
          type: relationship.type,
          data: {
            label: relationship.label
          },
          animated: relationship.type === 'userInteraction',
          style: this.getEdgeStyle(relationship.type)
        });
      }
    }

    return edges;
  }

  /**
   * Get edge styling based on type
   */
  getEdgeStyle(type) {
    const styles = {
      dataFlow: { strokeWidth: 3 },
      apiCall: { strokeWidth: 2 },
      cdnDelivery: { strokeWidth: 3 },
      authFlow: { strokeWidth: 2 },
      networkFlow: { strokeWidth: 2 },
      userInteraction: { strokeWidth: 3 }
    };

    return styles[type] || { strokeWidth: 2 };
  }

  /**
   * Calculate layout dimensions
   */
  calculateLayoutWidth(layers) {
    let maxWidth = 0;
    
    for (const layer of layers) {
      const layerWidth = layer.length * (this.nodeWidth + this.horizontalSpacing) - this.horizontalSpacing;
      maxWidth = Math.max(maxWidth, layerWidth);
    }
    
    return maxWidth + 200; // Add padding
  }

  calculateLayoutHeight(layers) {
    return layers.length * (this.nodeHeight + this.layerSpacing) + 200; // Add padding
  }

  /**
   * Optimize layout for better visualization
   */
  optimizeLayout(nodes, edges) {
    // Apply force-directed adjustments for better spacing
    const optimizedNodes = [...nodes];
    
    // Adjust positions to minimize edge crossings
    this.minimizeEdgeCrossings(optimizedNodes, edges);
    
    // Balance node distribution within layers
    this.balanceNodeDistribution(optimizedNodes);
    
    return optimizedNodes;
  }

  /**
   * Minimize edge crossings
   */
  minimizeEdgeCrossings(nodes, edges) {
    // Group nodes by Y position (layers)
    const layers = new Map();
    
    for (const node of nodes) {
      const y = node.position.y;
      if (!layers.has(y)) {
        layers.set(y, []);
      }
      layers.get(y).push(node);
    }

    // Sort nodes within each layer to minimize crossings
    for (const [y, layerNodes] of layers) {
      layerNodes.sort((a, b) => {
        // Calculate average target position for each node
        const aTargets = edges.filter(e => e.source === a.id).map(e => 
          nodes.find(n => n.id === e.target)?.position.x || 0
        );
        const bTargets = edges.filter(e => e.source === b.id).map(e => 
          nodes.find(n => n.id === e.target)?.position.x || 0
        );
        
        const aAvg = aTargets.length > 0 ? aTargets.reduce((sum, x) => sum + x, 0) / aTargets.length : a.position.x;
        const bAvg = bTargets.length > 0 ? bTargets.reduce((sum, x) => sum + x, 0) / bTargets.length : b.position.x;
        
        return aAvg - bAvg;
      });

      // Update positions
      const layerWidth = layerNodes.length * (this.nodeWidth + this.horizontalSpacing) - this.horizontalSpacing;
      let currentX = -layerWidth / 2;
      
      for (const node of layerNodes) {
        node.position.x = currentX;
        currentX += this.nodeWidth + this.horizontalSpacing;
      }
    }
  }

  /**
   * Balance node distribution within layers
   */
  balanceNodeDistribution(nodes) {
    // Group by layers and ensure even spacing
    const layers = new Map();
    
    for (const node of nodes) {
      const y = node.position.y;
      if (!layers.has(y)) {
        layers.set(y, []);
      }
      layers.get(y).push(node);
    }

    for (const [y, layerNodes] of layers) {
      if (layerNodes.length <= 1) continue;
      
      // Sort by current X position
      layerNodes.sort((a, b) => a.position.x - b.position.x);
      
      // Redistribute with even spacing
      const totalWidth = layerNodes.length * this.nodeWidth + (layerNodes.length - 1) * this.horizontalSpacing;
      let currentX = -totalWidth / 2;
      
      for (const node of layerNodes) {
        node.position.x = currentX;
        currentX += this.nodeWidth + this.horizontalSpacing;
      }
    }
  }

  /**
   * Generate responsive layout for different screen sizes
   */
  generateResponsiveLayout(recommendation, screenSize = 'desktop') {
    const baseLayout = this.generateLayout(recommendation);
    
    const scalingFactors = {
      mobile: { scale: 0.6, spacing: 0.7 },
      tablet: { scale: 0.8, spacing: 0.85 },
      desktop: { scale: 1.0, spacing: 1.0 }
    };
    
    const factor = scalingFactors[screenSize] || scalingFactors.desktop;
    
    // Scale node positions and spacing
    const scaledNodes = baseLayout.nodes.map(node => ({
      ...node,
      position: {
        x: node.position.x * factor.scale,
        y: node.position.y * factor.scale
      }
    }));
    
    return {
      ...baseLayout,
      nodes: scaledNodes,
      layout: {
        ...baseLayout.layout,
        width: baseLayout.layout.width * factor.scale,
        height: baseLayout.layout.height * factor.scale
      }
    };
  }
}

// Export instance
export const layoutEngine = new ArchitectureLayoutEngine();

export default {
  ArchitectureLayoutEngine,
  layoutEngine
};