import React, { useState, useCallback, useRef } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle, Folder } from 'lucide-react';
import { getExampleProject } from '../../data/exampleProjects';

/**
 * CodeUploader - File drag-and-drop component for code analysis
 */
const CodeUploader = ({ 
  onFilesChange, 
  maxFiles = 20, 
  maxFileSize = 1024 * 1024, // 1MB default
  acceptedTypes = ['.js', '.jsx', '.ts', '.tsx', '.py', '.json', '.yml', '.yaml', '.md', '.html', '.css'],
  className = '' 
}) => {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState([]);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef(null);

  // File validation
  const validateFile = useCallback((file) => {
    const errors = [];
    
    // Check file size
    if (file.size > maxFileSize) {
      errors.push(`File "${file.name}" is too large (${formatFileSize(file.size)}). Maximum size is ${formatFileSize(maxFileSize)}.`);
    }
    
    // Check file type
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (acceptedTypes.length > 0 && !acceptedTypes.includes(fileExtension)) {
      errors.push(`File "${file.name}" has unsupported type. Accepted types: ${acceptedTypes.join(', ')}`);
    }
    
    return errors;
  }, [maxFileSize, acceptedTypes]);

  // Process files and read content
  const processFiles = useCallback(async (fileList) => {
    setProcessing(true);
    setErrors([]);
    
    const newFiles = [];
    const allErrors = [];
    
    for (const file of fileList) {
      // Validate file
      const fileErrors = validateFile(file);
      if (fileErrors.length > 0) {
        allErrors.push(...fileErrors);
        continue;
      }
      
      try {
        // Read file content
        const content = await readFileContent(file);
        
        const processedFile = {
          id: generateFileId(),
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          content: content,
          status: 'success'
        };
        
        newFiles.push(processedFile);
      } catch (error) {
        allErrors.push(`Failed to read file "${file.name}": ${error.message}`);
      }
    }
    
    // Check total file limit
    const totalFiles = files.length + newFiles.length;
    if (totalFiles > maxFiles) {
      allErrors.push(`Too many files. Maximum ${maxFiles} files allowed. Currently have ${files.length}, trying to add ${newFiles.length}.`);
      setErrors(allErrors);
      setProcessing(false);
      return;
    }
    
    if (allErrors.length > 0) {
      setErrors(allErrors);
    }
    
    if (newFiles.length > 0) {
      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);
      onFilesChange?.(updatedFiles);
    }
    
    setProcessing(false);
  }, [files, maxFiles, validateFile, onFilesChange]);

  // Read file content as text
  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      // Read as text for code files
      reader.readAsText(file);
    });
  };

  // Generate unique file ID
  const generateFileId = useCallback(() => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }, []);

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file type icon
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return <File className="w-4 h-4 text-yellow-500" />;
      case 'py':
        return <File className="w-4 h-4 text-blue-500" />;
      case 'json':
        return <File className="w-4 h-4 text-green-500" />;
      case 'yml':
      case 'yaml':
        return <File className="w-4 h-4 text-purple-500" />;
      case 'md':
        return <File className="w-4 h-4 text-gray-500" />;
      case 'html':
        return <File className="w-4 h-4 text-orange-500" />;
      case 'css':
        return <File className="w-4 h-4 text-blue-400" />;
      default:
        return <File className="w-4 h-4 text-gray-400" />;
    }
  };

  // Handle drag events
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  }, []);

  const handleDragOut = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileList = Array.from(e.dataTransfer.files);
      processFiles(fileList);
    }
  }, [processFiles]);

  // Handle file input change
  const handleFileInputChange = useCallback((e) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileList = Array.from(e.target.files);
      processFiles(fileList);
    }
  }, [processFiles]);

  // Remove file
  const removeFile = useCallback((fileId) => {
    const updatedFiles = files.filter(file => file.id !== fileId);
    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
  }, [files, onFilesChange]);

  // Clear all files
  const clearAllFiles = useCallback(() => {
    setFiles([]);
    setErrors([]);
    onFilesChange?.([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onFilesChange]);

  // Open file dialog
  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className={`w-full ${className}`}>
      {/* Drop Zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
          ${dragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${processing ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
        `}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
        />
        
        <div className="flex flex-col items-center space-y-4">
          <div className={`
            p-3 rounded-full transition-colors duration-200
            ${dragActive 
              ? 'bg-blue-100 dark:bg-blue-800' 
              : 'bg-gray-100 dark:bg-gray-800'
            }
          `}>
            <Upload className={`
              w-8 h-8 transition-colors duration-200
              ${dragActive 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-gray-500 dark:text-gray-400'
              }
            `} />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {dragActive ? 'Drop files here' : 'Upload your code files'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Drag and drop files here, or click to browse
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Supported: {acceptedTypes.join(', ')} • Max {maxFiles} files • {formatFileSize(maxFileSize)} per file
            </p>
          </div>
        </div>
        
        {processing && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Processing files...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Example Prompts */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Quick Examples
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <ExamplePrompt
            title="React SPA"
            description="E-commerce frontend"
            files={['package.json', 'src/App.jsx', 'src/components/']}
            onClick={() => loadExampleFiles('react-spa')}
          />
          <ExamplePrompt
            title="Node.js API"
            description="REST API with database"
            files={['package.json', 'server.js', 'routes/']}
            onClick={() => loadExampleFiles('nodejs-api')}
          />
          <ExamplePrompt
            title="Full-Stack App"
            description="React + Express + DB"
            files={['package.json', 'client/', 'server/']}
            onClick={() => loadExampleFiles('fullstack')}
          />
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                Upload Errors
              </h4>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Uploaded Files ({files.length}/{maxFiles})
            </h4>
            <button
              onClick={clearAllFiles}
              className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            >
              Clear All
            </button>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {files.map((file) => (
              <FileItem
                key={file.id}
                file={file}
                onRemove={() => removeFile(file.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * FileItem - Individual file display component
 */
const FileItem = ({ file, onRemove }) => {
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return <File className="w-4 h-4 text-yellow-500" />;
      case 'py':
        return <File className="w-4 h-4 text-blue-500" />;
      case 'json':
        return <File className="w-4 h-4 text-green-500" />;
      case 'yml':
      case 'yaml':
        return <File className="w-4 h-4 text-purple-500" />;
      case 'md':
        return <File className="w-4 h-4 text-gray-500" />;
      case 'html':
        return <File className="w-4 h-4 text-orange-500" />;
      case 'css':
        return <File className="w-4 h-4 text-blue-400" />;
      default:
        return <File className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        {getFileIcon(file.name)}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {file.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatFileSize(file.size)} • {file.content.split('\n').length} lines
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {file.status === 'success' && (
          <CheckCircle className="w-4 h-4 text-green-500" />
        )}
        <button
          onClick={onRemove}
          className="p-1 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
          title="Remove file"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

/**
 * ExamplePrompt - Quick example selection component
 */
const ExamplePrompt = ({ title, description, files, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="p-4 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
    >
      <div className="flex items-start space-x-3">
        <Folder className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
            {title}
          </h5>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            {description}
          </p>
          <div className="flex flex-wrap gap-1">
            {files.slice(0, 3).map((file, index) => (
              <span
                key={index}
                className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
              >
                {file}
              </span>
            ))}
            {files.length > 3 && (
              <span className="inline-block px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                +{files.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
};

  // Example file loading function
  const loadExampleFiles = useCallback((exampleType) => {
    const exampleProject = getExampleProject(exampleType);
    
    if (!exampleProject) {
      console.error(`Example project not found: ${exampleType}`);
      return;
    }

    // Convert example project files to the format expected by the component
    const exampleFiles = exampleProject.files.map(file => ({
      id: generateFileId(),
      name: file.name,
      size: new Blob([file.content]).size,
      type: 'text/plain',
      lastModified: Date.now(),
      content: file.content,
      status: 'success'
    }));

    // Clear existing files and set example files
    setFiles(exampleFiles);
    setErrors([]);
    onFilesChange?.(exampleFiles);
  }, [generateFileId, onFilesChange]);

export default CodeUploader;