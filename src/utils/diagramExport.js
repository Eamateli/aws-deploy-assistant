// Diagram Export and Sharing Utilities
// Handles PNG export, state persistence, and URL sharing

/**
 * Diagram Export Manager
 * Handles various export formats and sharing options
 */
export class DiagramExportManager {
  constructor() {
    this.exportFormats = ['png', 'svg', 'json', 'pdf'];
    this.compressionQuality = 0.9;
  }

  /**
   * Export diagram as PNG image
   * @param {HTMLElement} diagramElement - The diagram container element
   * @param {Object} options - Export options
   * @returns {Promise<Blob>} PNG blob
   */
  async exportAsPNG(diagramElement, options = {}) {
    const {
      width = 1200,
      height = 800,
      backgroundColor = '#ffffff',
      scale = 2,
      filename = 'aws-architecture-diagram.png'
    } = options;

    try {
      // Dynamic import to avoid bundle size issues
      const html2canvas = await import('html2canvas');
      
      const canvas = await html2canvas.default(diagramElement, {
        width,
        height,
        scale,
        backgroundColor,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: true,
        logging: false
      });

      return new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/png', this.compressionQuality);
      });
    } catch (error) {
      console.error('PNG export failed:', error);
      throw new Error('Failed to export diagram as PNG');
    }
  }

  /**
   * Export diagram as SVG
   * @param {Object} diagramData - Diagram nodes and edges data
   * @param {Object} options - Export options
   * @returns {string} SVG string
   */
  exportAsSVG(diagramData, options = {}) {
    const {
      width = 1200,
      height = 800,
      backgroundColor = '#ffffff'
    } = options;

    const { nodes, edges } = diagramData;

    // Create SVG structure
    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
    
    // Background
    svg += `<rect width="100%" height="100%" fill="${backgroundColor}"/>`;
    
    // Define styles
    svg += `<defs>
      <style>
        .node-text { font-family: Arial, sans-serif; font-size: 12px; }
        .node-rect { stroke: #e5e7eb; stroke-width: 2; }
        .edge-line { stroke: #6b7280; stroke-width: 2; fill: none; }
        .edge-dashed { stroke-dasharray: 5,5; }
      </style>
    </defs>`;

    // Draw edges first (so they appear behind nodes)
    for (const edge of edges) {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      if (sourceNode && targetNode) {
        const x1 = sourceNode.position.x + 100; // Center of node
        const y1 = sourceNode.position.y + 60;
        const x2 = targetNode.position.x + 100;
        const y2 = targetNode.position.y + 60;
        
        const strokeColor = this.getEdgeColor(edge.type);
        const isDashed = ['apiCall', 'authFlow'].includes(edge.type);
        
        svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" 
                     stroke="${strokeColor}" 
                     class="edge-line ${isDashed ? 'edge-dashed' : ''}" />`;
        
        // Add edge label if present
        if (edge.data?.label) {
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;
          svg += `<text x="${midX}" y="${midY}" text-anchor="middle" 
                       class="node-text" fill="#374151">${edge.data.label}</text>`;
        }
      }
    }

    // Draw nodes
    for (const node of nodes) {
      const x = node.position.x;
      const y = node.position.y;
      const width = 200;
      const height = 120;
      
      const category = node.data.serviceDefinition?.category || 'compute';
      const fillColor = this.getCategoryColor(category);
      
      // Node rectangle
      svg += `<rect x="${x}" y="${y}" width="${width}" height="${height}" 
                   fill="${fillColor}" class="node-rect" rx="8"/>`;
      
      // Service name
      svg += `<text x="${x + 10}" y="${y + 25}" class="node-text" 
                   font-weight="bold" fill="#1f2937">
                ${node.data.serviceDefinition?.name || node.data.service}
              </text>`;
      
      // Purpose
      if (node.data.purpose) {
        svg += `<text x="${x + 10}" y="${y + 45}" class="node-text" fill="#6b7280">
                  ${this.truncateText(node.data.purpose, 25)}
                </text>`;
      }
      
      // Cost
      const cost = node.data.estimatedCost || 0;
      svg += `<text x="${x + 10}" y="${y + 65}" class="node-text" fill="#059669">
                $${cost}/mo
              </text>`;
    }

    svg += '</svg>';
    return svg;
  }

  /**
   * Export diagram data as JSON
   * @param {Object} diagramData - Complete diagram state
   * @returns {string} JSON string
   */
  exportAsJSON(diagramData) {
    const exportData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      diagram: {
        nodes: diagramData.nodes.map(node => ({
          id: node.id,
          type: node.type,
          position: node.position,
          data: {
            service: node.data.service,
            purpose: node.data.purpose,
            estimatedCost: node.data.estimatedCost,
            configuration: node.data.configuration
          }
        })),
        edges: diagramData.edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: edge.type,
          data: edge.data
        })),
        layout: diagramData.layout,
        metadata: {
          recommendationId: diagramData.recommendationId,
          architectureName: diagramData.architectureName,
          totalCost: diagramData.totalCost
        }
      }
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Download file with given content
   * @param {Blob|string} content - File content
   * @param {string} filename - File name
   * @param {string} mimeType - MIME type
   */
  downloadFile(content, filename, mimeType = 'application/octet-stream') {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  /**
   * Get edge color based on type
   */
  getEdgeColor(type) {
    const colors = {
      dataFlow: '#10b981',
      apiCall: '#3b82f6',
      cdnDelivery: '#8b5cf6',
      authFlow: '#ef4444',
      networkFlow: '#6b7280',
      userInteraction: '#f59e0b'
    };
    return colors[type] || '#6b7280';
  }

  /**
   * Get category color for nodes
   */
  getCategoryColor(category) {
    const colors = {
      compute: '#fed7aa',
      storage: '#bfdbfe',
      database: '#bbf7d0',
      networking: '#e9d5ff',
      security: '#fecaca',
      monitoring: '#fef3c7'
    };
    return colors[category] || '#f3f4f6';
  }

  /**
   * Truncate text to specified length
   */
  truncateText(text, maxLength) {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
}

/**
 * Diagram State Manager
 * Handles state persistence and URL sharing
 */
export class DiagramStateManager {
  constructor() {
    this.storageKey = 'aws-deploy-assistant-diagrams';
    this.maxStoredDiagrams = 10;
  }

  /**
   * Save diagram state to localStorage
   * @param {Object} diagramState - Complete diagram state
   * @param {string} name - Diagram name
   * @returns {string} Saved diagram ID
   */
  saveDiagramState(diagramState, name = 'Untitled Diagram') {
    const diagramId = this.generateDiagramId();
    const savedDiagram = {
      id: diagramId,
      name,
      timestamp: new Date().toISOString(),
      state: diagramState
    };

    try {
      const existingDiagrams = this.getSavedDiagrams();
      const updatedDiagrams = [savedDiagram, ...existingDiagrams.slice(0, this.maxStoredDiagrams - 1)];
      
      localStorage.setItem(this.storageKey, JSON.stringify(updatedDiagrams));
      return diagramId;
    } catch (error) {
      console.error('Failed to save diagram state:', error);
      throw new Error('Failed to save diagram');
    }
  }

  /**
   * Load diagram state from localStorage
   * @param {string} diagramId - Diagram ID
   * @returns {Object|null} Diagram state or null if not found
   */
  loadDiagramState(diagramId) {
    try {
      const savedDiagrams = this.getSavedDiagrams();
      const diagram = savedDiagrams.find(d => d.id === diagramId);
      return diagram ? diagram.state : null;
    } catch (error) {
      console.error('Failed to load diagram state:', error);
      return null;
    }
  }

  /**
   * Get all saved diagrams
   * @returns {Array} Array of saved diagrams
   */
  getSavedDiagrams() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to get saved diagrams:', error);
      return [];
    }
  }

  /**
   * Delete saved diagram
   * @param {string} diagramId - Diagram ID to delete
   */
  deleteDiagram(diagramId) {
    try {
      const savedDiagrams = this.getSavedDiagrams();
      const updatedDiagrams = savedDiagrams.filter(d => d.id !== diagramId);
      localStorage.setItem(this.storageKey, JSON.stringify(updatedDiagrams));
    } catch (error) {
      console.error('Failed to delete diagram:', error);
    }
  }

  /**
   * Generate shareable URL for diagram
   * @param {Object} diagramState - Diagram state to share
   * @returns {string} Shareable URL
   */
  generateShareableURL(diagramState) {
    try {
      // Compress the state for URL
      const compressedState = this.compressState(diagramState);
      const encodedState = btoa(JSON.stringify(compressedState));
      
      const baseURL = window.location.origin + window.location.pathname;
      return `${baseURL}?diagram=${encodedState}`;
    } catch (error) {
      console.error('Failed to generate shareable URL:', error);
      throw new Error('Failed to create shareable link');
    }
  }

  /**
   * Load diagram state from URL
   * @returns {Object|null} Diagram state from URL or null
   */
  loadDiagramFromURL() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const encodedState = urlParams.get('diagram');
      
      if (!encodedState) return null;
      
      const compressedState = JSON.parse(atob(encodedState));
      return this.decompressState(compressedState);
    } catch (error) {
      console.error('Failed to load diagram from URL:', error);
      return null;
    }
  }

  /**
   * Compress diagram state for URL sharing
   */
  compressState(state) {
    return {
      n: state.nodes?.map(node => ({
        i: node.id,
        p: node.position,
        s: node.data.service,
        c: node.data.estimatedCost
      })) || [],
      e: state.edges?.map(edge => ({
        i: edge.id,
        s: edge.source,
        t: edge.target,
        ty: edge.type
      })) || [],
      m: {
        n: state.metadata?.architectureName,
        c: state.metadata?.totalCost
      }
    };
  }

  /**
   * Decompress diagram state from URL
   */
  decompressState(compressed) {
    return {
      nodes: compressed.n?.map(node => ({
        id: node.i,
        position: node.p,
        data: {
          service: node.s,
          estimatedCost: node.c
        }
      })) || [],
      edges: compressed.e?.map(edge => ({
        id: edge.i,
        source: edge.s,
        target: edge.t,
        type: edge.ty
      })) || [],
      metadata: {
        architectureName: compressed.m?.n,
        totalCost: compressed.m?.c
      }
    };
  }

  /**
   * Generate unique diagram ID
   */
  generateDiagramId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Copy text to clipboard
   * @param {string} text - Text to copy
   */
  async copyToClipboard(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      throw new Error('Failed to copy to clipboard');
    }
  }
}

/**
 * Responsive Layout Manager
 * Handles layout adaptation for different screen sizes
 */
export class ResponsiveLayoutManager {
  constructor() {
    this.breakpoints = {
      mobile: 768,
      tablet: 1024,
      desktop: 1440
    };
  }

  /**
   * Get current screen size category
   * @returns {string} Screen size category
   */
  getCurrentScreenSize() {
    const width = window.innerWidth;
    
    if (width < this.breakpoints.mobile) return 'mobile';
    if (width < this.breakpoints.tablet) return 'tablet';
    if (width < this.breakpoints.desktop) return 'desktop';
    return 'large';
  }

  /**
   * Adapt diagram layout for screen size
   * @param {Object} diagramData - Original diagram data
   * @param {string} screenSize - Target screen size
   * @returns {Object} Adapted diagram data
   */
  adaptLayoutForScreenSize(diagramData, screenSize = null) {
    const targetSize = screenSize || this.getCurrentScreenSize();
    const scalingFactors = this.getScalingFactors(targetSize);
    
    return {
      ...diagramData,
      nodes: diagramData.nodes.map(node => ({
        ...node,
        position: {
          x: node.position.x * scalingFactors.position,
          y: node.position.y * scalingFactors.position
        },
        data: {
          ...node.data,
          viewMode: scalingFactors.viewMode
        }
      })),
      layout: {
        ...diagramData.layout,
        width: diagramData.layout.width * scalingFactors.layout,
        height: diagramData.layout.height * scalingFactors.layout
      }
    };
  }

  /**
   * Get scaling factors for different screen sizes
   */
  getScalingFactors(screenSize) {
    const factors = {
      mobile: {
        position: 0.5,
        layout: 0.6,
        viewMode: 'minimal'
      },
      tablet: {
        position: 0.7,
        layout: 0.8,
        viewMode: 'compact'
      },
      desktop: {
        position: 1.0,
        layout: 1.0,
        viewMode: 'detailed'
      },
      large: {
        position: 1.2,
        layout: 1.1,
        viewMode: 'detailed'
      }
    };
    
    return factors[screenSize] || factors.desktop;
  }

  /**
   * Add responsive event listeners
   * @param {Function} callback - Callback function for resize events
   */
  addResizeListener(callback) {
    let resizeTimeout;
    
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        callback(this.getCurrentScreenSize());
      }, 250);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Return cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }
}

// Export instances
export const exportManager = new DiagramExportManager();
export const stateManager = new DiagramStateManager();
export const layoutManager = new ResponsiveLayoutManager();

export default {
  DiagramExportManager,
  DiagramStateManager,
  ResponsiveLayoutManager,
  exportManager,
  stateManager,
  layoutManager
};