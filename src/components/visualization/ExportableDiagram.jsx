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
import DiagramControls from './DiagramControls';
import { layoutEngine } from '../../utils/layoutAlgorithm';
import { exportManager, stateManager, layoutManager } from '../../utils/diagramExport';
import { 
  Download, 
  Share2, 
  Save, 
  Link2, 
  Check,
  AlertCircle,
  Loader2,
  Camera,
  FileText,
  Database
} from 'lucide-react';

/**
 * ExportableDiagram - Enhanced diagram with export and sharing capabilities
 * Includes PNG export, state persistence, URL sharing, and responsive layout
 */
const ExportableDiagramContent = ({ 
  recommendation, 
  onNodeClick, 
  onNodeSelect,
  onNodeConfigure,
  className = '',
  height = '600px',
  showControls = true,
  showMinimap = true,
  interactive = true,
  enableExport = true,
  enableSharing = true
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [layoutMode, setLayoutMode] = useState('auto');
  const [interactionMode, setInteractionMode] = useState('select');
  const [showGrid, setShowGrid] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showTooltips, setShowTooltips] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('detailed');
  
  // Export and sharing states
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState(null);
  const [shareUrl, setShareUrl] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [savedDiagrams, setSavedDiagrams] = useState([]);

  const reactFlowInstance = useReactFlow();
  const diagramRef = useRef(null);

  // Define custom node types
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

  // Load saved diagrams on mount
  useEffect(() => {
    setSavedDiagrams(stateManager.getSavedDiagrams());
    
    // Check for diagram in URL
    const urlDiagram = stateManager.loadDiagramFromURL();
    if (urlDiagram) {
      loadDiagramFromState(urlDiagram);
    }
  }, []);

  // Generate layout when recommendation changes
  useEffect(() => {
    if (recommendation && recommendation.services) {
      generateDiagramLayout();
    }
  }, [recommendation, filterCategory, searchTerm]);

  // Add responsive layout listener
  useEffect(() => {
    const cleanup = layoutManager.addResizeListener((screenSize) => {
      if (nodes.length > 0) {
        adaptLayoutForScreenSize(screenSize);
      }
    });
    
    return cleanup;
  }, [nodes]);

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
      
      // Adapt for current screen size
      const screenSize = layoutManager.getCurrentScreenSize();
      const adaptedLayout = layoutManager.adaptLayoutForScreenSize(layout, screenSize);
      
      // Set nodes with enhanced data structure
      const diagramNodes = adaptedLayout.nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          onSelect: handleNodeSelect,
          onConfigure: handleNodeConfigure,
          interactive: interactive,
          viewMode: adaptedLayout.layout?.viewMode || viewMode
        },
        draggable: interactive && layoutMode === 'manual',
        selectable: interactive
      }));

      // Set edges with conditional labels
      const diagramEdges = adaptedLayout.edges.map(edge => ({
        ...edge,
        data: {
          ...edge.data,
          label: showLabels ? edge.data.label : undefined
        },
        selectable: interactive
      }));

      setNodes(diagramNodes);
      setEdges(diagramEdges);
    } catch (error) {
      console.error('Error generating diagram layout:', error);
    }
  }, [recommendation, filterCategory, searchTerm, showLabels, interactive, layoutMode, viewMode]);

  // Adapt layout for screen size
  const adaptLayoutForScreenSize = useCallback((screenSize) => {
    const currentDiagramData = { nodes, edges, layout: {} };
    const adaptedLayout = layoutManager.adaptLayoutForScreenSize(currentDiagramData, screenSize);
    
    setNodes(adaptedLayout.nodes);
    setViewMode(adaptedLayout.nodes[0]?.data?.viewMode || viewMode);
  }, [nodes, edges, viewMode]);

  // Load diagram from state
  const loadDiagramFromState = useCallback((diagramState) => {
    if (diagramState.nodes) {
      setNodes(diagramState.nodes);
    }
    if (diagramState.edges) {
      setEdges(diagramState.edges);
    }
  }, []);

  // Handle node hover
  const handleNodeHover = useCallback((nodeData) => {
    // Handle hover logic if needed
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

  // Handle node double-click
  const handleNodeDoubleClick = useCallback((event, node) => {
    event.stopPropagation();
    onNodeConfigure?.(node.data);
  }, [onNodeConfigure]);

  // Handle node configuration
  const handleNodeConfigure = useCallback((nodeData) => {
    onNodeConfigure?.(nodeData);
  }, [onNodeConfigure]);

  // Export functions
  const handleExport = useCallback(async (format) => {
    if (!enableExport) return;
    
    setIsExporting(true);
    setExportStatus(null);

    try {
      const diagramData = {
        nodes,
        edges,
        layout: {},
        recommendationId: recommendation?.id,
        architectureName: recommendation?.name,
        totalCost: recommendation?.costEstimate?.monthly
      };

      switch (format) {
        case 'png':
          if (diagramRef.current) {
            const blob = await exportManager.exportAsPNG(diagramRef.current, {
              filename: `${recommendation?.name || 'architecture'}-diagram.png`
            });
            exportManager.downloadFile(
              blob, 
              `${recommendation?.name || 'architecture'}-diagram.png`,
              'image/png'
            );
            setExportStatus({ type: 'success', message: 'PNG exported successfully!' });
          }
          break;

        case 'svg':
          const svgContent = exportManager.exportAsSVG(diagramData);
          exportManager.downloadFile(
            svgContent,
            `${recommendation?.name || 'architecture'}-diagram.svg`,
            'image/svg+xml'
          );
          setExportStatus({ type: 'success', message: 'SVG exported successfully!' });
          break;

        case 'json':
          const jsonContent = exportManager.exportAsJSON(diagramData);
          exportManager.downloadFile(
            jsonContent,
            `${recommendation?.name || 'architecture'}-diagram.json`,
            'application/json'
          );
          setExportStatus({ type: 'success', message: 'JSON exported successfully!' });
          break;

        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus({ type: 'error', message: `Export failed: ${error.message}` });
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportStatus(null), 3000);
    }
  }, [nodes, edges, recommendation, enableExport]);

  // Save diagram
  const handleSave = useCallback(() => {
    try {
      const diagramState = {
        nodes,
        edges,
        metadata: {
          recommendationId: recommendation?.id,
          architectureName: recommendation?.name,
          totalCost: recommendation?.costEstimate?.monthly
        }
      };

      const diagramId = stateManager.saveDiagramState(
        diagramState,
        recommendation?.name || 'Untitled Architecture'
      );

      setSavedDiagrams(stateManager.getSavedDiagrams());
      setExportStatus({ type: 'success', message: 'Diagram saved successfully!' });
      
      setTimeout(() => setExportStatus(null), 3000);
    } catch (error) {
      console.error('Save failed:', error);
      setExportStatus({ type: 'error', message: `Save failed: ${error.message}` });
      setTimeout(() => setExportStatus(null), 3000);
    }
  }, [nodes, edges, recommendation]);

  // Share diagram
  const handleShare = useCallback(async (method) => {
    if (!enableSharing) return;

    try {
      const diagramState = {
        nodes,
        edges,
        metadata: {
          recommendationId: recommendation?.id,
          architectureName: recommendation?.name,
          totalCost: recommendation?.costEstimate?.monthly
        }
      };

      switch (method) {
        case 'url':
          const shareableUrl = stateManager.generateShareableURL(diagramState);
          setShareUrl(shareableUrl);
          setShowShareModal(true);
          break;

        case 'copy':
          const copyUrl = stateManager.generateShareableURL(diagramState);
          await stateManager.copyToClipboard(copyUrl);
          setExportStatus({ type: 'success', message: 'Share link copied to clipboard!' });
          setTimeout(() => setExportStatus(null), 3000);
          break;

        default:
          throw new Error(`Unsupported share method: ${method}`);
      }
    } catch (error) {
      console.error('Share failed:', error);
      setExportStatus({ type: 'error', message: `Share failed: ${error.message}` });
      setTimeout(() => setExportStatus(null), 3000);
    }
  }, [nodes, edges, recommendation, enableSharing]);

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

  // Get minimap node color
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
          <Database className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Architecture Selected</h3>
          <p className="text-gray-600">Select an architecture recommendation to view the exportable diagram.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-white rounded-lg border border-gray-200 shadow-lg ${className}`} style={{ height }}>
      <div ref={diagramRef} className="w-full h-full">
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

          {/* Export Status */}
          {exportStatus && (
            <Panel position="top-center" className="z-50">
              <div className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg shadow-lg border
                ${exportStatus.type === 'success' 
                  ? 'bg-green-100 border-green-300 text-green-800' 
                  : 'bg-red-100 border-red-300 text-red-800'
                }
              `}>
                {exportStatus.type === 'success' ? (
                  <Check size={16} />
                ) : (
                  <AlertCircle size={16} />
                )}
                <span className="text-sm font-medium">{exportStatus.message}</span>
              </div>
            </Panel>
          )}

          {/* Loading Overlay */}
          {isExporting && (
            <Panel position="center" className="z-50">
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
                <div className="flex items-center space-x-3">
                  <Loader2 className="animate-spin text-blue-600" size={24} />
                  <span className="text-gray-700 font-medium">Exporting diagram...</span>
                </div>
              </div>
            </Panel>
          )}
        </ReactFlow>
      </div>

      {/* Enhanced Diagram Controls */}
      <DiagramControls
        position="top-right"
        layoutMode={layoutMode}
        onLayoutModeChange={setLayoutMode}
        onResetLayout={generateDiagramLayout}
        onFitView={() => reactFlowInstance?.fitView({ padding: 0.2 })}
        interactionMode={interactionMode}
        onInteractionModeChange={setInteractionMode}
        showGrid={showGrid}
        onToggleGrid={setShowGrid}
        showLabels={showLabels}
        onToggleLabels={setShowLabels}
        showTooltips={showTooltips}
        onToggleTooltips={setShowTooltips}
        showMinimap={showMinimap}
        onToggleMinimap={setShowMinimap}
        filterCategory={filterCategory}
        onFilterCategoryChange={setFilterCategory}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        availableCategories={getServiceCategories()}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onExport={handleExport}
        onSave={handleSave}
        onShare={handleShare}
        onZoomIn={() => reactFlowInstance?.zoomIn()}
        onZoomOut={() => reactFlowInstance?.zoomOut()}
        compact={true}
      />

      {/* Share Modal */}
      {showShareModal && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Diagram</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shareable Link
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                  />
                  <button
                    onClick={() => stateManager.copyToClipboard(shareUrl)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Link2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className="text-xs text-gray-500">
                This link contains the complete diagram state and can be shared with others.
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Wrapper component to ensure ReactFlowProvider is available
const ExportableDiagram = (props) => {
  return (
    <ReactFlowProvider>
      <ExportableDiagramContent {...props} />
    </ReactFlowProvider>
  );
};

export default ExportableDiagram;