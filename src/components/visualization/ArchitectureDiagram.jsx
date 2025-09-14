import React, { useState, useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';

import AWSServiceNode from './AWSServiceNode';
import { edgeTypes } from './CustomEdges';
import { layoutEngine } from '../../utils/layoutAlgorithm';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Download, 
  RotateCcw,
  Layout,
  Info,
  Settings
} from 'lucide-react';

/**
 * ArchitectureDiagram - Interactive AWS architecture visualization
 * Uses React Flow to render AWS services and their connections
 */
const ArchitectureDiagram = ({ 
  recommendation, 
  onNodeClick, 
  onNodeSelect,
  className = '',
  height = '600px',
  showControls = true,
  showMinimap = true,
  interactive = true
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [layoutMode, setLayoutMode] = useState('auto'); // 'auto' or 'manual'
  const [showGrid, setShowGrid] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

  // Define custom node types
  const nodeTypes = useMemo(() => ({
    awsService: AWSServiceNode
  }), []);

  // Generate layout when recommendation changes
  useEffect(() => {
    if (recommendation && recommendation.services) {
      generateDiagramLayout();
    }
  }, [recommendation]);

  const generateDiagramLayout = useCallback(() => {
    if (!recommendation) return;

    try {
      const layout = layoutEngine.generateLayout(recommendation);
      
      // Set nodes with proper data structure
      const diagramNodes = layout.nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          onSelect: handleNodeSelect
        }
      }));

      // Set edges with labels if enabled
      const diagramEdges = layout.edges.map(edge => ({
        ...edge,
        data: {
          ...edge.data,
          label: showLabels ? edge.data.label : undefined
        }
      }));

      setNodes(diagramNodes);
      setEdges(diagramEdges);
    } catch (error) {
      console.error('Error generating diagram layout:', error);
    }
  }, [recommendation, showLabels]);

  // Handle node selection
  const handleNodeSelect = useCallback((nodeData) => {
    setSelectedNode(nodeData);
    onNodeSelect?.(nodeData);
  }, [onNodeSelect]);

  // Handle node click
  const handleNodeClick = useCallback((event, node) => {
    handleNodeSelect(node.data);
    onNodeClick?.(event, node);
  }, [onNodeClick, handleNodeSelect]);

  // Handle edge connection (for manual layout mode)
  const onConnect = useCallback((params) => {
    if (layoutMode === 'manual') {
      setEdges((eds) => addEdge(params, eds));
    }
  }, [layoutMode, setEdges]);

  // Reset layout to auto-generated
  const resetLayout = useCallback(() => {
    generateDiagramLayout();
  }, [generateDiagramLayout]);

  // Toggle layout mode
  const toggleLayoutMode = useCallback(() => {
    setLayoutMode(prev => prev === 'auto' ? 'manual' : 'auto');
  }, []);

  // Export diagram as PNG
  const exportDiagram = useCallback(() => {
    // This would implement PNG export functionality
    // For now, we'll just log the action
    console.log('Exporting diagram as PNG...');
    // Implementation would use html2canvas or similar library
  }, []);

  // Get minimap node color based on service category
  const getMinimapNodeColor = (node) => {
    const category = node.data?.serviceDefinition?.category;
    const colors = {
      compute: '#f97316',
      storage: '#3b82f6',
      database: '#10b981',
      networking: '#8b5cf6',
      security: '#ef4444',
      monitoring: '#f59e0b'
    };
    return colors[category] || '#6b7280';
  };

  if (!recommendation || !recommendation.services) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 ${className}`} style={{ height }}>
        <div className="text-center">
          <Layout className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Architecture Selected</h3>
          <p className="text-gray-600">Select an architecture recommendation to view the diagram.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-white rounded-lg border border-gray-200 shadow-lg ${className}`} style={{ height }}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={interactive ? onNodesChange : undefined}
          onEdgesChange={interactive ? onEdgesChange : undefined}
          onConnect={interactive ? onConnect : undefined}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.1}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          nodesDraggable={interactive && layoutMode === 'manual'}
          nodesConnectable={interactive && layoutMode === 'manual'}
          elementsSelectable={interactive}
        >
          {/* Background */}
          <Background 
            variant={showGrid ? 'dots' : 'lines'} 
            gap={20} 
            size={1}
            color="#e5e7eb"
          />

          {/* Controls */}
          {showControls && (
            <Controls 
              position="bottom-right"
              showInteractive={false}
            />
          )}

          {/* Minimap */}
          {showMinimap && (
            <MiniMap
              position="bottom-left"
              nodeColor={getMinimapNodeColor}
              nodeStrokeWidth={2}
              zoomable
              pannable
              style={{
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb'
              }}
            />
          )}

          {/* Custom Panel with Diagram Info */}
          <Panel position="top-left" className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">
                  {recommendation.name}
                </h3>
                <p className="text-xs text-gray-600">
                  {recommendation.services?.length || 0} services • 
                  ${recommendation.costEstimate?.monthly || 0}/month
                </p>
              </div>

              {/* Legend */}
              <div>
                <h4 className="text-xs font-medium text-gray-700 mb-2">Connection Types</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-0.5 bg-green-500"></div>
                    <span className="text-gray-600">Data Flow</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-0.5 bg-blue-500 border-dashed border-t"></div>
                    <span className="text-gray-600">API Calls</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-0.5 bg-purple-500"></div>
                    <span className="text-gray-600">CDN Delivery</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-0.5 bg-red-500 border-dashed border-t"></div>
                    <span className="text-gray-600">Auth Flow</span>
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          {/* Custom Controls Panel */}
          <Panel position="top-right" className="bg-white rounded-lg shadow-lg border border-gray-200 p-2">
            <div className="flex flex-col space-y-2">
              <button
                onClick={resetLayout}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                title="Reset Layout"
              >
                <RotateCcw size={16} />
              </button>
              
              <button
                onClick={toggleLayoutMode}
                className={`p-2 rounded transition-colors ${
                  layoutMode === 'manual' 
                    ? 'text-blue-600 bg-blue-100' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
                title={`Switch to ${layoutMode === 'auto' ? 'Manual' : 'Auto'} Layout`}
              >
                <Layout size={16} />
              </button>
              
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`p-2 rounded transition-colors ${
                  showGrid 
                    ? 'text-blue-600 bg-blue-100' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
                title="Toggle Grid"
              >
                <Settings size={16} />
              </button>
              
              <button
                onClick={() => setShowLabels(!showLabels)}
                className={`p-2 rounded transition-colors ${
                  showLabels 
                    ? 'text-blue-600 bg-blue-100' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
                title="Toggle Labels"
              >
                <Info size={16} />
              </button>
              
              <button
                onClick={exportDiagram}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                title="Export Diagram"
              >
                <Download size={16} />
              </button>
            </div>
          </Panel>
        </ReactFlow>
      </ReactFlowProvider>

      {/* Selected Node Details */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-xs">
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900 text-sm">
              {selectedNode.serviceDefinition?.name || selectedNode.service}
            </h4>
            <p className="text-xs text-gray-600">
              {selectedNode.purpose || selectedNode.serviceDefinition?.description}
            </p>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Monthly Cost:</span>
              <span className="font-medium text-green-600">
                ${selectedNode.estimatedCost || selectedNode.serviceDefinition?.pricing?.estimatedMonthly?.typical || 0}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Complexity:</span>
              <span className="font-medium text-orange-600">
                {selectedNode.serviceDefinition?.complexity || 3}/5
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Wrapper component to ensure ReactFlowProvider is available
const ArchitectureDiagramWrapper = (props) => {
  return (
    <ReactFlowProvider>
      <ArchitectureDiagram {...props} />
    </ReactFlowProvider>
  );
};

export default ArchitectureDiagramWrapper;