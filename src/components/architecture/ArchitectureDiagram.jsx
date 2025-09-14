import React, { useMemo, useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  ConnectionLineType,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  Database, Server, Globe, Zap, Cloud, Shield, 
  BarChart3, HardDrive, Cpu, Network, Download
} from 'lucide-react';

// Custom node component for AWS services
const AWSServiceNode = ({ data }) => {
  const { service, purpose, cost, category, selected } = data;
  
  const getIcon = (serviceName) => {
    const iconMap = {
      'S3': Database,
      'CloudFront': Globe,
      'Route53': Server,
      'Lambda': Zap,
      'API Gateway': Network,
      'DynamoDB': Database,
      'EC2': Server,
      'ALB': Cloud,
      'RDS': Database,
      'ECS': Cpu,
      'Fargate': Cpu,
      'CloudWatch': BarChart3,
      'ECR': HardDrive
    };
    return iconMap[serviceName] || Server;
  };

  const Icon = getIcon(service);
  
  const categoryColors = {
    compute: 'border-orange-400 bg-orange-50',
    storage: 'border-blue-400 bg-blue-50',
    database: 'border-green-400 bg-green-50',
    networking: 'border-purple-400 bg-purple-50',
    monitoring: 'border-yellow-400 bg-yellow-50'
  };

  return (
    <div className={`
      p-4 rounded-lg border-2 bg-white shadow-lg min-w-32 max-w-48
      ${selected ? 'border-blue-500 shadow-blue-200' : categoryColors[category] || 'border-gray-300 bg-gray-50'}
      transition-all duration-200 hover:shadow-xl
    `}>
      <div className="flex items-center space-x-2 mb-2">
        <Icon size={20} className="text-gray-700" />
        <h4 className="font-semibold text-sm text-gray-900 truncate">{service}</h4>
      </div>
      <p className="text-xs text-gray-600 mb-1 line-clamp-2">{purpose}</p>
      <p className="text-xs text-green-600 font-medium truncate">{cost}</p>
    </div>
  );
};

// Custom edge component for data flow
const DataFlowEdge = ({ id, sourceX, sourceY, targetX, targetY, style = {} }) => {
  const edgePath = `M${sourceX},${sourceY} C${sourceX + 50},${sourceY} ${targetX - 50},${targetY} ${targetX},${targetY}`;
  
  return (
    <g>
      <path
        id={id}
        style={{ ...style, stroke: '#6366f1', strokeWidth: 2 }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd="url(#react-flow__arrowclosed)"
      />
    </g>
  );
};

const ArchitectureDiagram = ({ architecture, onServiceSelect, className = '' }) => {
  // Memoize node and edge generation for performance
  const { initialNodes, initialEdges } = useMemo(() => {
    if (!architecture || !architecture.services) {
      return { initialNodes: [], initialEdges: [] };
    }

    const nodes = architecture.services.map((service, index) => ({
      id: `service-${index}`,
      type: 'awsService',
      position: { 
        x: (index % 3) * 200 + 50, 
        y: Math.floor(index / 3) * 150 + 50 
      },
      data: {
        service: service.name,
        purpose: service.purpose,
        cost: service.cost,
        category: service.category,
        selected: false
      }
    }));

    // Generate edges based on typical data flow patterns
    const edges = [];
    if (nodes.length > 1) {
      for (let i = 0; i < nodes.length - 1; i++) {
        edges.push({
          id: `edge-${i}`,
          source: nodes[i].id,
          target: nodes[i + 1].id,
          type: 'dataFlow',
          animated: true,
          style: { stroke: '#6366f1', strokeWidth: 2 }
        });
      }
    }

    return { initialNodes: nodes, initialEdges: edges };
  }, [architecture]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event, node) => {
    // Update node selection state
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          selected: n.id === node.id ? !n.data.selected : false
        }
      }))
    );
    
    if (onServiceSelect) {
      onServiceSelect(node.data);
    }
  }, [setNodes, onServiceSelect]);

  const nodeTypes = useMemo(() => ({
    awsService: AWSServiceNode
  }), []);

  const edgeTypes = useMemo(() => ({
    dataFlow: DataFlowEdge
  }), []);

  if (!architecture || !architecture.services || architecture.services.length === 0) {
    return (
      <div className={`h-96 border border-gray-300 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500">
          <Network size={48} className="mx-auto mb-4 opacity-50" />
          <p>No architecture selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-96 border border-gray-300 rounded-lg ${className}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.5}
        maxZoom={2}
      >
        <Background color="#f1f5f9" gap={20} />
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
            const categoryColors = {
              compute: '#fb923c',
              storage: '#60a5fa',
              database: '#4ade80',
              networking: '#a78bfa',
              monitoring: '#fbbf24'
            };
            return categoryColors[node.data?.category] || '#9ca3af';
          }}
          className="bg-white border border-gray-300 rounded"
        />
        <Panel position="top-right" className="bg-white p-2 rounded shadow border">
          <div className="text-xs text-gray-600">
            <p className="font-medium mb-1">{architecture.name}</p>
            <p>Click services for details</p>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default React.memo(ArchitectureDiagram);