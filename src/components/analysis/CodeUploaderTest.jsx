import React, { useState } from 'react';
import CodeUploader from './CodeUploader';

/**
 * Test component for CodeUploader functionality
 */
const CodeUploaderTest = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleFilesChange = (files) => {
    console.log('Files changed:', files);
    setUploadedFiles(files);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            CodeUploader Test
          </h1>
          <p className="text-gray-600">
            Test the file upload and example loading functionality
          </p>
        </div>

        <CodeUploader 
          onFilesChange={handleFilesChange}
          maxFiles={20}
          maxFileSize={1024 * 1024} // 1MB
        />

        {/* Display uploaded files info */}
        {uploadedFiles.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Analysis Results ({uploadedFiles.length} files)
            </h3>
            
            <div className="space-y-4">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{file.name}</h4>
                    <span className="text-sm text-gray-500">
                      {Math.round(file.size / 1024)}KB
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    Lines: {file.content.split('\n').length}
                  </div>
                  
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-700">
                      View Content
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-x-auto max-h-40 overflow-y-auto">
                      {file.content}
                    </pre>
                  </details>
                </div>
              ))}
            </div>

            {/* Simple pattern detection test */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Quick Pattern Detection</h4>
              <div className="text-sm text-blue-800">
                {uploadedFiles.some(f => f.name === 'package.json') && (
                  <div>✓ package.json detected - Node.js/React project</div>
                )}
                {uploadedFiles.some(f => f.name.endsWith('.jsx')) && (
                  <div>✓ JSX files detected - React application</div>
                )}
                {uploadedFiles.some(f => f.name === 'server.js' || f.name === 'app.js') && (
                  <div>✓ Server file detected - Backend application</div>
                )}
                {uploadedFiles.some(f => f.name === 'requirements.txt') && (
                  <div>✓ requirements.txt detected - Python application</div>
                )}
                {uploadedFiles.some(f => f.content.includes('express')) && (
                  <div>✓ Express.js detected in code</div>
                )}
                {uploadedFiles.some(f => f.content.includes('react')) && (
                  <div>✓ React detected in code</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeUploaderTest;