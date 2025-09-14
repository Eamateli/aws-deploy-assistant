// File validation utilities
export const validateFile = (file) => {
  const errors = [];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const SUPPORTED_EXTENSIONS = [
    '.js', '.jsx', '.ts', '.tsx', '.json', '.py', '.html', '.css', '.md', 
    '.yml', '.yaml', '.xml', '.txt', '.env', '.gitignore', '.dockerignore'
  ];

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    errors.push({
      type: 'FILE_TOO_LARGE',
      message: `File "${file.name}" exceeds 10MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB)`,
      file: file.name,
      severity: 'error'
    });
  }

  // Check file extension
  const extension = '.' + file.name.split('.').pop().toLowerCase();
  if (!SUPPORTED_EXTENSIONS.includes(extension) && !file.name.includes('Dockerfile')) {
    errors.push({
      type: 'UNSUPPORTED_FILE_TYPE',
      message: `File type "${extension}" is not supported`,
      file: file.name,
      severity: 'warning'
    });
  }

  // Check for empty files
  if (file.size === 0) {
    errors.push({
      type: 'EMPTY_FILE',
      message: `File "${file.name}" is empty`,
      file: file.name,
      severity: 'warning'
    });
  }

  return {
    isValid: errors.filter(e => e.severity === 'error').length === 0,
    errors,
    warnings: errors.filter(e => e.severity === 'warning')
  };
};

export const validateFileList = (files) => {
  const allErrors = [];
  const allWarnings = [];
  let totalSize = 0;
  const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB total
  const MAX_FILE_COUNT = 50;

  // Check file count
  if (files.length > MAX_FILE_COUNT) {
    allErrors.push({
      type: 'TOO_MANY_FILES',
      message: `Too many files uploaded (${files.length}). Maximum is ${MAX_FILE_COUNT}`,
      severity: 'error'
    });
  }

  // Validate each file
  files.forEach(file => {
    const validation = validateFile(file);
    allErrors.push(...validation.errors.filter(e => e.severity === 'error'));
    allWarnings.push(...validation.warnings);
    totalSize += file.size;
  });

  // Check total size
  if (totalSize > MAX_TOTAL_SIZE) {
    allErrors.push({
      type: 'TOTAL_SIZE_TOO_LARGE',
      message: `Total upload size exceeds 50MB limit (${(totalSize / 1024 / 1024).toFixed(1)}MB)`,
      severity: 'error'
    });
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
    totalSize,
    fileCount: files.length
  };
};

// Text input validation
export const validateDescription = (description) => {
  const errors = [];
  const MIN_LENGTH = 10;
  const MAX_LENGTH = 5000;

  if (!description || description.trim().length === 0) {
    errors.push({
      type: 'DESCRIPTION_REQUIRED',
      message: 'Application description is required',
      severity: 'error'
    });
  } else if (description.trim().length < MIN_LENGTH) {
    errors.push({
      type: 'DESCRIPTION_TOO_SHORT',
      message: `Description must be at least ${MIN_LENGTH} characters (currently ${description.trim().length})`,
      severity: 'error'
    });
  } else if (description.length > MAX_LENGTH) {
    errors.push({
      type: 'DESCRIPTION_TOO_LONG',
      message: `Description must be less than ${MAX_LENGTH} characters (currently ${description.length})`,
      severity: 'error'
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    characterCount: description ? description.length : 0
  };
};

// Analysis input validation
export const validateAnalysisInput = (input) => {
  const errors = [];
  const { files = [], description = '', framework = '', appType = '' } = input;

  // Must have either files or description
  if (files.length === 0 && !description.trim()) {
    errors.push({
      type: 'NO_INPUT_PROVIDED',
      message: 'Please provide either files or a description of your application',
      severity: 'error'
    });
  }

  // Validate files if provided
  if (files.length > 0) {
    const fileValidation = validateFileList(files);
    errors.push(...fileValidation.errors);
  }

  // Validate description if provided
  if (description.trim()) {
    const descValidation = validateDescription(description);
    errors.push(...descValidation.errors);
  }

  // Validate manual selections
  if (framework && !['react', 'vue', 'angular', 'nodejs', 'python', 'static'].includes(framework)) {
    errors.push({
      type: 'INVALID_FRAMEWORK',
      message: 'Selected framework is not supported',
      severity: 'error'
    });
  }

  if (appType && !['spa', 'ssr', 'api', 'fullstack', 'static'].includes(appType)) {
    errors.push({
      type: 'INVALID_APP_TYPE',
      message: 'Selected application type is not supported',
      severity: 'error'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Confidence threshold validation
export const validateConfidence = (analysisResult, minConfidence = 0.7) => {
  const { confidence = 0, detected = {} } = analysisResult;
  
  if (confidence < minConfidence) {
    return {
      isValid: false,
      needsManualInput: true,
      message: `Analysis confidence is low (${Math.round(confidence * 100)}%). Please review and confirm the detected patterns.`,
      suggestions: [
        'Verify the detected framework is correct',
        'Confirm the application type matches your project',
        'Add more specific details in the description',
        'Upload additional configuration files'
      ],
      detected
    };
  }

  return {
    isValid: true,
    needsManualInput: false,
    confidence
  };
};

// Form field validation
export const createFieldValidator = (rules) => {
  return (value) => {
    const errors = [];
    
    for (const rule of rules) {
      const result = rule(value);
      if (result !== true) {
        errors.push({
          type: rule.name || 'VALIDATION_ERROR',
          message: result,
          severity: rule.severity || 'error'
        });
      }
    }
    
    return {
      isValid: errors.filter(e => e.severity === 'error').length === 0,
      errors,
      warnings: errors.filter(e => e.severity === 'warning')
    };
  };
};

// Common validation rules
export const validationRules = {
  required: (message = 'This field is required') => {
    const rule = (value) => {
      if (!value || (typeof value === 'string' && !value.trim())) {
        return message;
      }
      return true;
    };
    rule.name = 'REQUIRED';
    return rule;
  },

  minLength: (min, message) => {
    const rule = (value) => {
      if (value && value.length < min) {
        return message || `Must be at least ${min} characters`;
      }
      return true;
    };
    rule.name = 'MIN_LENGTH';
    return rule;
  },

  maxLength: (max, message) => {
    const rule = (value) => {
      if (value && value.length > max) {
        return message || `Must be less than ${max} characters`;
      }
      return true;
    };
    rule.name = 'MAX_LENGTH';
    return rule;
  },

  pattern: (regex, message) => {
    const rule = (value) => {
      if (value && !regex.test(value)) {
        return message || 'Invalid format';
      }
      return true;
    };
    rule.name = 'PATTERN';
    return rule;
  },

  oneOf: (options, message) => {
    const rule = (value) => {
      if (value && !options.includes(value)) {
        return message || `Must be one of: ${options.join(', ')}`;
      }
      return true;
    };
    rule.name = 'ONE_OF';
    return rule;
  }
};

// Validation error formatter
export const formatValidationErrors = (errors) => {
  return errors.map(error => ({
    ...error,
    id: `${error.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }));
};

// Additional validation functions for tests
export const validateFileUpload = (files) => {
  const errors = [];
  const suggestions = [];
  const MAX_FILES = 20;
  const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  
  const SUPPORTED_TYPES = [
    'application/json', 'text/javascript', 'text/plain', 
    'text/html', 'text/css', 'application/x-yaml'
  ];

  // Check file count
  if (files.length > MAX_FILES) {
    errors.push({
      type: 'TOO_MANY_FILES',
      message: `Too many files (${files.length}). Maximum allowed: ${MAX_FILES}`,
      maxFiles: MAX_FILES
    });
  }

  let totalSize = 0;
  const validFiles = [];

  files.forEach(file => {
    totalSize += file.size;

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      errors.push({
        type: 'FILE_TOO_LARGE',
        message: `File ${file.name} is too large`,
        file: file.name,
        maxSize: '10MB'
      });
    } else {
      // Check file type
      if (!SUPPORTED_TYPES.includes(file.type) && !file.name.match(/\.(js|jsx|ts|tsx|json|py|html|css|md|yml|yaml|txt|env)$/i)) {
        errors.push({
          type: 'UNSUPPORTED_FILE_TYPE',
          message: `Unsupported file type: ${file.name}`,
          file: file.name
        });
      } else {
        validFiles.push(file);
      }
    }

    // Check for problematic paths
    if (file.name.includes('node_modules/')) {
      suggestions.push('Avoid uploading node_modules directory');
    }
    if (file.name.includes('.git/')) {
      suggestions.push('Exclude .git directory from uploads');
    }
  });

  // Check total size
  if (totalSize > MAX_TOTAL_SIZE) {
    errors.push({
      type: 'TOTAL_SIZE_TOO_LARGE',
      message: 'Total upload size exceeds limit',
      maxSize: '50MB'
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    validFiles,
    suggestions: [...new Set(suggestions)] // Remove duplicates
  };
};

export const validateApplicationDescription = (description) => {
  const errors = [];
  const warnings = [];
  const suggestions = [];

  if (!description || description.length < 20) {
    errors.push({
      type: 'DESCRIPTION_TOO_SHORT',
      message: 'Description is too short',
      minLength: 20
    });
  }

  if (description && description.length > 1000) {
    errors.push({
      type: 'DESCRIPTION_TOO_LONG',
      message: 'Description is too long',
      maxLength: 1000
    });
  }

  // Check for potentially malicious content
  if (description && (description.includes('<script>') || description.includes('javascript:') || description.includes('eval('))) {
    warnings.push({
      type: 'POTENTIALLY_UNSAFE_CONTENT',
      message: 'Description contains potentially unsafe content'
    });
  }

  // Provide suggestions for improvement
  if (description && description.length < 50) {
    suggestions.push('Include the technology stack (React, Node.js, etc.)');
    suggestions.push('Describe the main features or purpose');
    suggestions.push('Mention any special requirements (database, auth, etc.)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions
  };
};

export const validateArchitectureSelection = (selection) => {
  const errors = [];
  const warnings = [];
  
  const validArchitectures = ['static-spa', 'serverless-api', 'traditional-stack', 'container-based'];
  const validPreferences = ['low', 'medium', 'high'];
  const validRegions = ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'];

  if (!validArchitectures.includes(selection.architectureId)) {
    errors.push({
      type: 'INVALID_ARCHITECTURE_ID',
      message: 'Invalid architecture selected'
    });
  }

  if (selection.preferences) {
    Object.entries(selection.preferences).forEach(([key, value]) => {
      if (!validPreferences.includes(value)) {
        errors.push({
          type: 'INVALID_PREFERENCE_VALUE',
          message: `Invalid preference value for ${key}`,
          field: key
        });
      }
    });
  }

  if (selection.customizations?.region && !validRegions.includes(selection.customizations.region)) {
    warnings.push({
      type: 'INVALID_REGION',
      message: 'Selected region may not be optimal'
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const sanitizeUserInput = (input) => {
  if (!input) return '';
  
  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // Remove SQL injection patterns
  sanitized = sanitized.replace(/DROP\s+TABLE/gi, '');
  sanitized = sanitized.replace(/--/g, '');
  
  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  return sanitized;
};

export default {
  validateFile,
  validateFileList,
  validateDescription,
  validateAnalysisInput,
  validateConfidence,
  createFieldValidator,
  validationRules,
  formatValidationErrors,
  validateFileUpload,
  validateApplicationDescription,
  validateArchitectureSelection,
  sanitizeUserInput
};