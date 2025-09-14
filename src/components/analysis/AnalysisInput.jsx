import React, { useState } from 'react';
import { Upload, FileText, ArrowRight, Code } from 'lucide-react';
import CodeUploader from './CodeUploader';
import ApplicationDescriptionForm from './ApplicationDescriptionForm';

/**
 * AnalysisInput - Combined interface for code upload and manual description
 * Provides both file upload and manual form input methods
 */
const AnalysisInput = ({ onAnalysisReady, className = '' }) => {
  const [inputMethod, setInputMethod] = useState('upload'); // 'upload' or 'manual'
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [manualDescription, setManualDescription] = useState({});
  const [isReady, setIsReady] = useState(false);

  // Handle file upload changes
  const handleFilesChange = (files) => {
    setUploadedFiles(files);
    updateReadyState(files, manualDescription);
  };

  // Handle manual description changes
  const handleDescriptionChange = (description) => {
    setManualDescription(description);
    updateReadyState(uploadedFiles, description);
  };

  // Update ready state based on input method and data
  const updateReadyState = (files, description) => {
    let ready = false;
    
    if (inputMethod === 'upload') {
      ready = files.length > 0;
    } else if (inputMethod === 'manual') {
      ready = description.description?.trim().length > 10 || 
             description.framework || 
             description.appTypes?.length > 0;
    }
    
    setIsReady(ready);
    
    // Notify parent component
    if (ready) {
      const analysisData = {
        method: inputMethod,
        files: inputMethod === 'upload' ? files : [],
        description: inputMethod === 'manual' ? description : {},
        timestamp: new Date().toISOString()
      };
      onAnalysisReady?.(analysisData);
    }
  };

  // Switch input method
  const switchInputMethod = (method) => {
    setInputMethod(method);
    setIsReady(false);
    updateReadyState(
      method === 'upload' ? uploadedFiles : [],
      method === 'manual' ? manualDescription : {}
    );
  };

  return (
    <div className={`max-w-6xl mx-auto ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <Code className="text-blue-600" size={32} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Analyze Your Application
        </h2>
        <p className="text-gray-600 text-lg max-w-3xl mx-auto">
          Help us understand your application by uploading your code files or describing it manually. 
          We'll analyze your requirements and recommend the perfect AWS architecture.
        </p>
      </div>

      {/* Input Method Selection */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => switchInputMethod('upload')}
              className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors ${
                inputMethod === 'upload'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Upload size={20} />
                <span>Upload Code Files</span>
              </div>
              <p className="text-xs mt-1 opacity-75">
                Drag & drop your project files for automatic analysis
              </p>
            </button>
            
            <button
              onClick={() => switchInputMethod('manual')}
              className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors ${
                inputMethod === 'manual'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <FileText size={20} />
                <span>Describe Manually</span>
              </div>
              <p className="text-xs mt-1 opacity-75">
                Fill out a form to describe your application requirements
              </p>
            </button>
          </nav>
        </div>

        <div className="p-8">
          {inputMethod === 'upload' ? (
            <div>
              <CodeUploader 
                onFilesChange={handleFilesChange}
                maxFiles={20}
                maxFileSize={2 * 1024 * 1024} // 2MB
                acceptedTypes={[
                  '.js', '.jsx', '.ts', '.tsx', 
                  '.py', '.php', '.java', '.cs',
                  '.json', '.yml', '.yaml', '.xml',
                  '.md', '.txt', '.html', '.css',
                  '.sql', '.env', '.dockerfile'
                ]}
              />
              
              {uploadedFiles.length > 0 && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-800">
                      {uploadedFiles.length} files uploaded successfully
                    </span>
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    Ready for analysis. Click "Analyze Application" to continue.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <ApplicationDescriptionForm 
                onDescriptionChange={handleDescriptionChange}
                initialData={manualDescription}
              />
              
              {isReady && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-800">
                      Application description completed
                    </span>
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    Ready for analysis. Click "Analyze Application" to continue.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Analysis Summary */}
      {isReady && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <ArrowRight className="mr-2" size={16} />
            Ready for Analysis
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Input Method</h4>
              <p className="text-gray-600">
                {inputMethod === 'upload' 
                  ? `Code files (${uploadedFiles.length} files)`
                  : 'Manual description'
                }
              </p>
            </div>
            
            {inputMethod === 'upload' && uploadedFiles.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Detected Files</h4>
                <div className="space-y-1">
                  {uploadedFiles.slice(0, 3).map((file) => (
                    <p key={file.id} className="text-gray-600 text-xs">
                      {file.name} ({Math.round(file.size / 1024)}KB)
                    </p>
                  ))}
                  {uploadedFiles.length > 3 && (
                    <p className="text-gray-500 text-xs">
                      +{uploadedFiles.length - 3} more files
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {inputMethod === 'manual' && manualDescription.framework && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Configuration</h4>
                <div className="space-y-1 text-xs text-gray-600">
                  {manualDescription.framework && (
                    <p>Framework: {manualDescription.framework}</p>
                  )}
                  {manualDescription.appTypes?.length > 0 && (
                    <p>Types: {manualDescription.appTypes.join(', ')}</p>
                  )}
                  {manualDescription.expectedTraffic && (
                    <p>Traffic: {manualDescription.expectedTraffic}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisInput;