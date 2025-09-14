import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  useReactFlow,
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
  Settings,
  Move,
  MousePointer,
  Hand,
  Search,
  Filter,
  Eye,
  EyeOff
} from 'lucide-react';

/**
 * InteractiveDiagram - Enhanced interactive AWS architecture visualization
 * Includes hover tooltips, click handlers, drag-and-drop, and advanced controls
 */
const InteractiveDiagramContent = ({ 
  recommendation, 
  onNodeClick, 
  onNodeSelect,
  onNodeConfigure,
  className = '',
  height = '600px',
  showControls = true,
  showMinimap = true,
  interactive = true
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [layoutMode, setLayoutMode] = useState('auto');
  const [interactionMode, setInteractionMode] = useState('select'); // 'select', 'pan', 'zoom'
  const [showGrid, setShowGrid] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showTooltips, setShowTooltips] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('detailed'); // 'detailed', 'compact', 'minimal'

  const reactFlowInstance = useReactFlow();
  const tooltipRef = useRef(null);

  // Define custom node types with enhanced interactivity
  const nodeTypes = {
    awsService: (props) => (
      <AWSServiceNode
        {...props}
        onMouseEnter={() => handleNodeHover(props.data)}
        onMouseLeave={() => handleNodeHover(null)}
        onClick={(e) => handleNodeClick(e, props)}
        onDoubleClick={(e) => handleNodeDoubleClick(e, props)}
        showTooltips={showTooltips}
        viewMode={viewMode}
      />
    )
  };

  // Generate layout when recommendation changes
  useEffect(() => {
    if (recommendation && recommendation.services) {
      generateDiagramLayout();
    }
  }, [recommendation, filterCategory, searchTerm]);

  const generateDiagramLayout = useCallback(() => {
    if (!recommendation) return;

    try {
      // Filter services based on category and search
      let filteredServices = recommendation.services;
      
      if (filterCategory !== 'all') {
        filteredServices = filteredServices.filter(service => 
          service.serviceDefinition?.category === filterCategory
        );
      }
      
      if (searchTerm) {
        filteredServices = filteredServices.filter(service =>
          service.serviceDefinition?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.serviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.purpose?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      const filteredRecommendation = {
        ...recommendation,
        services: filteredServices
      };

      const layout = layoutEngine.generateLayout(filteredRecommendation);
      
      // Set nodes with enhanced data structure
      const diagramNodes = layout.nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          onSelect: handleNodeSelect,
          onConfigure: handleNodeConfigure,
          interactive: interactive,
          viewMode: viewMode
        },
        draggable: interactive && layoutMode === 'manual',
        selectable: interactive
      }));

      // Set edges with conditional labels
      const diagramEdges = layout.edges.map(edge => ({
        ...edge,
        data: {
          ...edge.data,
          label: showLabels ? edge.data.label : undefined
        },
        selectable: interactive,
        style: {
          ...edge.style,
          opacity: filterCategory === 'all' ? 1 : 0.6
        }
      }));

      setNodes(diagramNodes);
      setEdges(diagramEdges);
    } catch (error) {
      console.error('Error generating diagram layout:', error);
    }
  }, [recommendation, filterCategory, searchTerm, showLabels, interactive, layoutMode, viewMode]);

  // Handle node hover for tooltips
  const handleNodeHover = useCallback((nodeData) => {
    setHoveredNode(nodeData);
  }, []);

  // Handle node selection
  const handleNodeSelect = useCallback((nodeData) => {
    setSelectedNode(nodeData);
    onNodeSelect?.(nodeData);
  }, [onNodeSelect]);

  // Handle node click
  const handleNodeClick = useCallback((event, node) => {
    event.stopPropagation();
    handleNodeSelect(node.data);
    onNodeClick?.(event, node);
  }, [onNodeClick, handleNodeSelect]);

  // Handle node double-click for configuration
  const handleNodeDoubleClick = useCallback((event, node) => {
    event.stopPropagation();
    onNodeConfigure?.(node.data);
  }, [onNodeConfigure]);

  // Handle node configuration
  const handleNodeConfigure = useCallback((nodeData) => {
    onNodeConfigure?.(nodeData);
  }, [onNodeConfigure]);

  // Zoom controls
  const zoomIn = useCallback(() => {
    reactFlowInstance.zoomIn();
  }, [reactFlowInstance]);

  const zoomOut = useCallback(() => {
    reactFlowInstance.zoomOut();
  }, [reactFlowInstance]);

  const fitView = useCallback(() => {
    reactFlowInstance.fitView({ padding: 0.2 });
  }, [reactFlowInstance]);

  // Reset layout to auto-generated
  const resetLayout = useCallback(() => {
    generateDiagramLayout();
    fitView();
  }, [generateDiagramLayout, fitView]);

  // Toggle layout mode
  const toggleLayoutMode = useCallback(() => {
    setLayoutMode(prev => {
      const newMode = prev === 'auto' ? 'manual' : 'auto';
      if (newMode === 'auto') {
        generateDiagramLayout();
      }
      return newMode;
    });
  }, [generateDiagramLayout]);

  // Export diagram as PNG
  const exportDiagram = useCallback(() => {
    if (reactFlowInstance) {
      const viewport = reactFlowInstance.getViewport();
      const nodes = reactFlowInstance.getNodes();
      const edges = reactFlowInstance.getEdges();
      
      // Create export data
      const exportData = {
        viewport,
        nodes: nodes.map(node => ({
          id: node.id,
          position: node.position,
          data: {
            service: node.data.service,
            purpose: node.data.purpose
          }
        })),
        edges: edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: edge.type
        }))
      };
      
      console.log('Exporting diagram:', exportData);
      // Implementation would use html2canvas or similar library
    }
  }, [reactFlowInstance]);

  // Handle interaction mode changes
  const setInteractionModeHandler = useCallback((mode) => {
    setInteractionMode(mode);
    
    // Update React Flow interaction settings
    if (reactFlowInstance) {
      switch (mode) {
        case 'pan':
          reactFlowInstance.setOptions({
            nodesDraggable: false,
            nodesConnectable: false,
            elementsSelectable: false,
            panOnDrag: true
          });
          break;
        case 'select':
          reactFlowInstance.setOptions({
            nodesDraggable: layoutMode === 'manual',
            nodesConnectable: layoutMode === 'manual',
            elementsSelectable: true,
            panOnDrag: false
          });
          break;
        case 'zoom':
          reactFlowInstance.setOptions({
            nodesDraggable: false,
            nodesConnectable: false,
            elementsSelectable: false,
            panOnDrag: false
          });
          break;
      }
    }
  }, [reactFlowInstance, layoutMode]);

  // Get available service categories
  const getServiceCategories = useCallback(() => {
    if (!recommendation?.services) return [];
    
    const categories = new Set(
      recommendation.services
        .map(service => service.serviceDefinition?.category)
        .filter(Boolean)
    );
    
    return Array.from(categories);
  }, [recommendation]);

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
          <p className="text-gray-600">Select an architecture recommendation to view the interactive diagram.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-white rounded-lg border border-gray-200 shadow-lg ${className}`} style={{ height }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={interactive ? onNodesChange : undefined}
        onEdgesChange={interactive ? onEdgesChange : undefined}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={handleNodeDoubleClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={3}
        nodesDraggable={interactive && layoutMode === 'manual' && interactionMode === 'select'}
        nodesConnectable={interactive && layoutMode === 'manual'}
        elementsSelectable={interactive && interactionMode === 'select'}
        panOnDrag={interactionMode === 'pan'}
        zoomOnScroll={interactionMode !== 'pan'}
        zoomOnPinch={true}
        zoomOnDoubleClick={interactionMode === 'zoom'}
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

        {/* Diagram Info Panel */}
        <Panel position="top-left" className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">
                {recommendation.name}
              </h3>
              <p className="text-xs text-gray-600">
                {nodes.length} services • ${recommendation.costEstimate?.monthly || 0}/month
              </p>
            </div>

            {/* Search and Filter */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-2 top-1.5 text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                {getServiceCategories().map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
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
                  <div className="w-4 h-0.5 bg-blue-500" style={{ borderTop: '1px dashed' }}></div>
                  <span className="text-gray-600">API Calls</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-0.5 bg-purple-500"></div>
                  <span className="text-gray-600">CDN Delivery</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-0.5 bg-red-500" style={{ borderTop: '1px dashed' }}></div>
                  <span className="text-gray-600">Auth Flow</span>
                </div>
              </div>
            </div>
          </div>
        </Panel>

        {/* Enhanced Controls Panel */}
        <Panel position="top-right" className="bg-white rounded-lg shadow-lg border border-gray-200 p-2">
          <div className="space-y-3">
            {/* Interaction Mode */}
            <div className="flex flex-col space-y-1">
              <span className="text-xs font-medium text-gray-700 px-1">Mode</span>
              <div className="flex space-x-1">
                <button
                  onClick={() => setInteractionModeHandler('select')}
                  className={`p-1.5 rounded transition-colors ${
                    interactionMode === 'select' 
                      ? 'text-blue-600 bg-blue-100' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                  title="Select Mode"
                >
                  <MousePointer size={14} />
                </button>
                <button
                  onClick={() => setInteractionModeHandler('pan')}
                  className={`p-1.5 rounded transition-colors ${
                    interactionMode === 'pan' 
                      ? 'text-blue-600 bg-blue-100' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                  title="Pan Mode"
                >
                  <Hand size={14} />
                </button>
                <button
                  onClick={() => setInteractionModeHandler('zoom')}
                  className={`p-1.5 rounded transition-colors ${
                    interactionMode === 'zoom' 
                      ? 'text-blue-600 bg-blue-100' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                  title="Zoom Mode"
                >
                  <ZoomIn size={14} />
                </button>
              </div>
            </div>

            {/* Layout Controls */}
            <div className="flex flex-col space-y-1">
              <span className="text-xs font-medium text-gray-700 px-1">Layout</span>
              <div className="flex space-x-1">
                <button
                  onClick={resetLayout}
                  className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                  title="Reset Layout"
                >
                  <RotateCcw size={14} />
                </button>
                
                <button
                  onClick={toggleLayoutMode}
                  className={`p-1.5 rounded transition-colors ${
                    layoutMode === 'manual' 
                      ? 'text-blue-600 bg-blue-100' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                  title={`Switch to ${layoutMode === 'auto' ? 'Manual' : 'Auto'} Layout`}
                >
                  <Layout size={14} />
                </button>
                
                <button
                  onClick={fitView}
                  className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                  title="Fit View"
                >
                  <Maximize2 size={14} />
                </button>
              </div>
            </div>

            {/* View Options */}
            <div className="flex flex-col space-y-1">
              <span className="text-xs font-medium text-gray-700 px-1">View</span>
              <div className="flex space-x-1">
                <button
                  onClick={() => setShowGrid(!showGrid)}
                  className={`p-1.5 rounded transition-colors ${
                    showGrid 
                      ? 'text-blue-600 bg-blue-100' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                  title="Toggle Grid"
                >
                  <Settings size={14} />
                </button>
                
                <button
                  onClick={() => setShowLabels(!showLabels)}
                  className={`p-1.5 rounded transition-colors ${
                    showLabels 
                      ? 'text-blue-600 bg-blue-100' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                  title="Toggle Labels"
                >
                  <Info size={14} />
                </button>
                
                <button
                  onClick={() => setShowTooltips(!showTooltips)}
                  className={`p-1.5 rounded transition-colors ${
                    showTooltips 
                      ? 'text-blue-600 bg-blue-100' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                  title="Toggle Tooltips"
                >
                  {showTooltips ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              </div>
            </div>

            {/* Export */}
            <div className="pt-2 border-t border-gray-200">
              <button
                onClick={exportDiagram}
                className="w-full p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors flex items-center justify-center space-x-1"
                title="Export Diagram"
              >
                <Download size={14} />
                <span className="text-xs">Export</span>
              </button>
            </div>
          </div>
        </Panel>
      </ReactFlow>

      {/* Selected Node Details */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-xs z-10">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900 text-sm">
                {selectedNode.serviceDefinition?.name || selectedNode.service}
              </h4>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <p className="text-xs text-gray-600">
              {selectedNode.purpose || selectedNode.serviceDefinition?.description}
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Cost:</span>
                <div className="font-medium text-green-600">
                  ${selectedNode.estimatedCost || selectedNode.serviceDefinition?.pricing?.estimatedMonthly?.typical || 0}/mo
                </div>
              </div>
              <div>
                <span className="text-gray-500">Complexity:</span>
                <div className="font-medium text-orange-600">
                  {selectedNode.serviceDefinition?.complexity || 3}/5
                </div>
              </div>
            </div>
            {onNodeConfigure && (
              <button
                onClick={() => handleNodeConfigure(selectedNode)}
                className="w-full mt-2 px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
              >
                Configure Service
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Wrapper component to ensure ReactFlowProvider is available
const InteractiveDiagram = (props) => {
  return (
    <ReactFlowProvider>
      <InteractiveDiagramContent {...props} />
    </ReactFlowProvider>
  );
};

export default InteractiveDiagram;