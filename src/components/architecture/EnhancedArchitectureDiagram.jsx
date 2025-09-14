import React, { useState, useEffect, useMemo } from 'react';
import { AlertCircle, Download, Loader, RefreshCw } from 'lucide-react';
import { generateArchitectureDiagram, preloadDiagram } from '../../utils/diagramGenerator';
import { generateLocalDiagram } from '../../utils/localDiagramGenerator';

const EnhancedArchitectureDiagram = ({ 
  architecture, 
  className = '', 
  showDownload = true,
  autoLoad = true 
}) => {
  const [diagram, setDiagram] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Memoize diagram generation to prevent unnecessary re-renders
  const diagramKey = useMemo(() => 
    architecture ? `${architecture.id}-${architecture.name}` : null, 
    [architecture]
  );

  useEffect(() => {
    if (!architecture || !autoLoad) return;

    const loadDiagram = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Try Kroki API first
        preloadDiagram(architecture);
        const result = await generateArchitectureDiagram(architecture);
        
        if (result.fallback || !result.url) {
          // Fall back to local SVG generation
          console.log('Using local diagram generator as fallback');
          const localSvg = generateLocalDiagram(architecture);
          const blob = new Blob([localSvg], { type: 'image/svg+xml' });
          const localUrl = URL.createObjectURL(blob);
          
          setDiagram({
            url: localUrl,
            alt: `Architecture diagram for ${architecture.name}`,
            title: `${architecture.name} Architecture`,
            isLocal: true
          });
        } else {
          setDiagram(result);
        }
      } catch (err) {
        console.error('Failed to load architecture diagram, using local fallback:', err);
        
        // Always fall back to local generation on any error
        try {
          const localSvg = generateLocalDiagram(architecture);
          const blob = new Blob([localSvg], { type: 'image/svg+xml' });
          const localUrl = URL.createObjectURL(blob);
          
          setDiagram({
            url: localUrl,
            alt: `Architecture diagram for ${architecture.name}`,
            title: `${architecture.name} Architecture`,
            isLocal: true
          });
        } catch (localErr) {
          console.error('Local diagram generation also failed:', localErr);
          setError('Failed to generate diagram');
        }
      } finally {
        setLoading(false);
      }
    };

    loadDiagram();
    
    // Cleanup blob URLs when component unmounts
    return () => {
      if (diagram?.isLocal && diagram?.url) {
        URL.revokeObjectURL(diagram.url);
      }
    };
  }, [architecture, autoLoad, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const handleDownload = () => {
    if (!diagram?.url) return;
    
    const link = document.createElement('a');
    link.href = diagram.url;
    link.download = `${architecture.name.replace(/\s+/g, '-').toLowerCase()}-architecture.svg`;
    
    if (diagram.isLocal) {
      // For local diagrams, we need to handle the download differently
      link.target = '_blank';
    }
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!architecture) {
    return (
      <div className={`p-8 text-center text-gray-500 dark:text-gray-400 ${className}`}>
        <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
        <p>No architecture selected</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`p-8 text-center ${className}`}>
        <Loader size={48} className="mx-auto mb-4 animate-spin text-blue-600 dark:text-blue-400" />
        <p className="text-gray-600 dark:text-gray-400">Generating architecture diagram...</p>
      </div>
    );
  }

  if (error && !diagram?.url) {
    return (
      <div className={`p-8 text-center ${className}`}>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <AlertCircle size={48} className="mx-auto mb-4 text-yellow-600 dark:text-yellow-400" />
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            Diagram Generation Failed
          </h3>
          <p className="text-yellow-700 dark:text-yellow-300 mb-4">
            {error}
          </p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw size={16} className="mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Diagram Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Architecture Diagram
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {architecture.name} - Interactive visualization
          </p>
        </div>
        
        {showDownload && diagram?.url && (
          <button
            onClick={handleDownload}
            className="inline-flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            title="Download diagram as SVG"
          >
            <Download size={16} className="mr-2" />
            Download
          </button>
        )}
      </div>

      {/* Diagram Container */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        {diagram?.url ? (
          <div className="relative">
            <img
              src={diagram.url}
              alt={diagram.alt}
              title={diagram.title}
              className="w-full h-auto max-h-96 object-contain bg-white dark:bg-gray-900"
              onError={(e) => {
                console.error('Diagram image failed to load');
                setError('Failed to load diagram image');
                e.target.style.display = 'none';
              }}
              onLoad={() => {
                // Clear any previous errors when image loads successfully
                setError(null);
              }}
            />
            
            {/* Overlay for dark mode compatibility */}
            <div className="absolute inset-0 bg-white dark:bg-gray-900 opacity-0 dark:opacity-10 pointer-events-none"></div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <AlertCircle size={32} className="mx-auto mb-3 text-gray-400 dark:text-gray-500" />
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                Diagram Unavailable
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                The architecture diagram could not be generated at this time.
              </p>
              <button
                onClick={handleRetry}
                className="inline-flex items-center px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <RefreshCw size={14} className="mr-2" />
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Diagram Info */}
      {diagram?.url && (
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {diagram.isLocal ? (
            'Generated locally using SVG • Optimized for performance'
          ) : (
            <>
              Generated using PlantUML via Kroki API • 
              <a 
                href="https://kroki.io" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-600 dark:hover:text-blue-400 ml-1"
              >
                Learn more
              </a>
            </>
          )}
        </div>
      )}

      {/* Error message for partial failures */}
      {error && diagram?.url && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <div className="flex items-start">
            <AlertCircle size={16} className="text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                Diagram loaded with warnings
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedArchitectureDiagram;