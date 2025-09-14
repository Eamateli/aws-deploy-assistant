import React, { useState, useCallback } from 'react';
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
  EyeOff,
  Grid3X3,
  Tag,
  Layers,
  Share2,
  Save,
  Camera,
  Sliders
} from 'lucide-react';

/**
 * DiagramControls - Advanced control panel for interactive diagrams
 * Provides comprehensive controls for diagram interaction and customization
 */
const DiagramControls = ({
  // Layout controls
  layoutMode = 'auto',
  onLayoutModeChange,
  onResetLayout,
  onFitView,
  
  // Interaction controls
  interactionMode = 'select',
  onInteractionModeChange,
  
  // View controls
  showGrid = true,
  onToggleGrid,
  showLabels = true,
  onToggleLabels,
  showTooltips = true,
  onToggleTooltips,
  showMinimap = true,
  onToggleMinimap,
  
  // Filter controls
  filterCategory = 'all',
  onFilterCategoryChange,
  searchTerm = '',
  onSearchTermChange,
  availableCategories = [],
  
  // View mode controls
  viewMode = 'detailed',
  onViewModeChange,
  
  // Export controls
  onExport,
  onSave,
  onShare,
  
  // Zoom controls
  onZoomIn,
  onZoomOut,
  
  // Style
  position = 'top-right',
  compact = false,
  className = ''
}) => {
  const [expanded, setExpanded] = useState(!compact);
  const [activeTab, setActiveTab] = useState('layout');

  const tabs = [
    { id: 'layout', label: 'Layout', icon: Layout },
    { id: 'view', label: 'View', icon: Eye },
    { id: 'filter', label: 'Filter', icon: Filter },
    { id: 'export', label: 'Export', icon: Download }
  ];

  const interactionModes = [
    { id: 'select', label: 'Select', icon: MousePointer, description: 'Select and configure nodes' },
    { id: 'pan', label: 'Pan', icon: Hand, description: 'Pan around the diagram' },
    { id: 'zoom', label: 'Zoom', icon: ZoomIn, description: 'Zoom in/out on click' }
  ];

  const viewModes = [
    { id: 'detailed', label: 'Detailed', description: 'Full service information' },
    { id: 'compact', label: 'Compact', description: 'Essential information only' },
    { id: 'minimal', label: 'Minimal', description: 'Icons and names only' }
  ];

  const getPositionClasses = () => {
    const positions = {
      'top-left': 'top-4 left-4',
      'top-right': 'top-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'bottom-right': 'bottom-4 right-4'
    };
    return positions[position] || positions['top-right'];
  };

  const renderLayoutControls = () => (
    <div className="space-y-3">
      {/* Layout Mode */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">Layout Mode</label>
        <div className="flex space-x-1">
          <button
            onClick={() => onLayoutModeChange?.('auto')}
            className={`flex-1 px-2 py-1.5 text-xs rounded transition-colors ${
              layoutMode === 'auto'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Auto
          </button>
          <button
            onClick={() => onLayoutModeChange?.('manual')}
            className={`flex-1 px-2 py-1.5 text-xs rounded transition-colors ${
              layoutMode === 'manual'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Manual
          </button>
        </div>
      </div>

      {/* Interaction Mode */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">Interaction Mode</label>
        <div className="space-y-1">
          {interactionModes.map(mode => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => onInteractionModeChange?.(mode.id)}
                className={`w-full flex items-center space-x-2 px-2 py-1.5 text-xs rounded transition-colors ${
                  interactionMode === mode.id
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
                title={mode.description}
              >
                <Icon size={14} />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Layout Actions */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">Actions</label>
        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={onResetLayout}
            className="flex items-center justify-center space-x-1 px-2 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
          <button
            onClick={onFitView}
            className="flex items-center justify-center space-x-1 px-2 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            <Maximize2 size={12} />
            <span>Fit</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderViewControls = () => (
    <div className="space-y-3">
      {/* View Mode */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">View Mode</label>
        <select
          value={viewMode}
          onChange={(e) => onViewModeChange?.(e.target.value)}
          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          {viewModes.map(mode => (
            <option key={mode.id} value={mode.id}>
              {mode.label} - {mode.description}
            </option>
          ))}
        </select>
      </div>

      {/* Display Options */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">Display Options</label>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => onToggleGrid?.(e.target.checked)}
              className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <Grid3X3 size={12} className="text-gray-500" />
            <span className="text-xs text-gray-700">Show Grid</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showLabels}
              onChange={(e) => onToggleLabels?.(e.target.checked)}
              className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <Tag size={12} className="text-gray-500" />
            <span className="text-xs text-gray-700">Show Labels</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showTooltips}
              onChange={(e) => onToggleTooltips?.(e.target.checked)}
              className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <Info size={12} className="text-gray-500" />
            <span className="text-xs text-gray-700">Show Tooltips</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showMinimap}
              onChange={(e) => onToggleMinimap?.(e.target.checked)}
              className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <Layers size={12} className="text-gray-500" />
            <span className="text-xs text-gray-700">Show Minimap</span>
          </label>
        </div>
      </div>

      {/* Zoom Controls */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">Zoom</label>
        <div className="flex space-x-1">
          <button
            onClick={onZoomOut}
            className="flex-1 flex items-center justify-center px-2 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            <ZoomOut size={12} />
          </button>
          <button
            onClick={onZoomIn}
            className="flex-1 flex items-center justify-center px-2 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            <ZoomIn size={12} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderFilterControls = () => (
    <div className="space-y-3">
      {/* Search */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">Search Services</label>
        <div className="relative">
          <Search className="absolute left-2 top-1.5 text-gray-400" size={12} />
          <input
            type="text"
            placeholder="Search by name or purpose..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange?.(e.target.value)}
            className="w-full pl-6 pr-3 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">Filter by Category</label>
        <select
          value={filterCategory}
          onChange={(e) => onFilterCategoryChange?.(e.target.value)}
          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Categories</option>
          {availableCategories.map(category => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Quick Filters */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">Quick Filters</label>
        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={() => onFilterCategoryChange?.('compute')}
            className={`px-2 py-1.5 text-xs rounded transition-colors ${
              filterCategory === 'compute'
                ? 'bg-orange-100 text-orange-800 border border-orange-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Compute
          </button>
          <button
            onClick={() => onFilterCategoryChange?.('storage')}
            className={`px-2 py-1.5 text-xs rounded transition-colors ${
              filterCategory === 'storage'
                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Storage
          </button>
          <button
            onClick={() => onFilterCategoryChange?.('database')}
            className={`px-2 py-1.5 text-xs rounded transition-colors ${
              filterCategory === 'database'
                ? 'bg-green-100 text-green-800 border border-green-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Database
          </button>
          <button
            onClick={() => onFilterCategoryChange?.('networking')}
            className={`px-2 py-1.5 text-xs rounded transition-colors ${
              filterCategory === 'networking'
                ? 'bg-purple-100 text-purple-800 border border-purple-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Network
          </button>
        </div>
      </div>

      {/* Clear Filters */}
      <button
        onClick={() => {
          onFilterCategoryChange?.('all');
          onSearchTermChange?.('');
        }}
        className="w-full px-2 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
      >
        Clear All Filters
      </button>
    </div>
  );

  const renderExportControls = () => (
    <div className="space-y-3">
      {/* Export Options */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">Export Diagram</label>
        <div className="space-y-1">
          <button
            onClick={() => onExport?.('png')}
            className="w-full flex items-center space-x-2 px-2 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            <Camera size={12} />
            <span>Export as PNG</span>
          </button>
          <button
            onClick={() => onExport?.('svg')}
            className="w-full flex items-center space-x-2 px-2 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            <Download size={12} />
            <span>Export as SVG</span>
          </button>
          <button
            onClick={() => onExport?.('json')}
            className="w-full flex items-center space-x-2 px-2 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            <Save size={12} />
            <span>Export Data (JSON)</span>
          </button>
        </div>
      </div>

      {/* Share Options */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">Share</label>
        <div className="space-y-1">
          <button
            onClick={() => onShare?.('url')}
            className="w-full flex items-center space-x-2 px-2 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            <Share2 size={12} />
            <span>Share URL</span>
          </button>
          <button
            onClick={() => onSave?.()}
            className="w-full flex items-center space-x-2 px-2 py-1.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            <Save size={12} />
            <span>Save to Account</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'layout':
        return renderLayoutControls();
      case 'view':
        return renderViewControls();
      case 'filter':
        return renderFilterControls();
      case 'export':
        return renderExportControls();
      default:
        return renderLayoutControls();
    }
  };

  if (compact && !expanded) {
    return (
      <div className={`absolute ${getPositionClasses()} z-10 ${className}`}>
        <button
          onClick={() => setExpanded(true)}
          className="p-2 bg-white rounded-lg shadow-lg border border-gray-200 text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors"
        >
          <Sliders size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className={`absolute ${getPositionClasses()} z-10 ${className}`}>
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 w-64">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900">Diagram Controls</h3>
          {compact && (
            <button
              onClick={() => setExpanded(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-1 px-2 py-2 text-xs transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <Icon size={12} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-3">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default DiagramControls;