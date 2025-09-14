import { useState, useCallback, useMemo } from 'react';
import { 
  validateFile, 
  validateFileList, 
  validateDescription, 
  validateAnalysisInput,
  validateConfidence,
  createFieldValidator,
  validationRules,
  formatValidationErrors
} from '../utils/validators';

export const useValidation = (initialData = {}) => {
  const [errors, setErrors] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [isValidating, setIsValidating] = useState(false);

  const clearErrors = useCallback(() => {
    setErrors([]);
    setWarnings([]);
  }, []);

  const addError = useCallback((error) => {
    setErrors(prev => [...prev, error]);
  }, []);

  const addWarning = useCallback((warning) => {
    setWarnings(prev => [...prev, warning]);
  }, []);

  const validateFiles = useCallback((files) => {
    if (!files || files.length === 0) return { isValid: true, errors: [], warnings: [] };
    
    const validation = validateFileList(files);
    return {
      isValid: validation.isValid,
      errors: formatValidationErrors(validation.errors),
      warnings: formatValidationErrors(validation.warnings)
    };
  }, []);

  const validateText = useCallback((text) => {
    if (!text || text.trim().length === 0) return { isValid: true, errors: [] };
    
    const validation = validateDescription(text);
    return {
      isValid: validation.isValid,
      errors: formatValidationErrors(validation.errors)
    };
  }, []);

  const validateAnalysis = useCallback((input) => {
    const validation = validateAnalysisInput(input);
    return {
      isValid: validation.isValid,
      errors: formatValidationErrors(validation.errors)
    };
  }, []);

  const validateAnalysisConfidence = useCallback((analysisResult, threshold = 0.7) => {
    return validateConfidence(analysisResult, threshold);
  }, []);

  const runValidation = useCallback(async (data, validationType = 'analysis') => {
    setIsValidating(true);
    clearErrors();

    try {
      let validation;
      
      switch (validationType) {
        case 'files':
          validation = validateFiles(data);
          break;
        case 'description':
          validation = validateText(data);
          break;
        case 'analysis':
          validation = validateAnalysis(data);
          break;
        case 'confidence':
          validation = validateAnalysisConfidence(data.result, data.threshold);
          break;
        default:
          validation = { isValid: true, errors: [], warnings: [] };
      }

      if (validation.errors && validation.errors.length > 0) {
        setErrors(validation.errors);
      }
      
      if (validation.warnings && validation.warnings.length > 0) {
        setWarnings(validation.warnings);
      }

      return validation;
    } catch (error) {
      const errorObj = {
        type: 'VALIDATION_ERROR',
        message: 'An error occurred during validation',
        severity: 'error',
        originalError: error
      };
      setErrors([errorObj]);
      return { isValid: false, errors: [errorObj] };
    } finally {
      setIsValidating(false);
    }
  }, [validateFiles, validateText, validateAnalysis, validateAnalysisConfidence, clearErrors]);

  const hasErrors = useMemo(() => errors.length > 0, [errors]);
  const hasWarnings = useMemo(() => warnings.length > 0, [warnings]);
  const isValid = useMemo(() => !hasErrors, [hasErrors]);

  return {
    // State
    errors,
    warnings,
    isValidating,
    hasErrors,
    hasWarnings,
    isValid,
    
    // Actions
    validateFiles,
    validateText,
    validateAnalysis,
    validateAnalysisConfidence,
    runValidation,
    clearErrors,
    addError,
    addWarning,
    
    // Utilities
    formatValidationErrors
  };
};

export const useFieldValidation = (rules = []) => {
  const [fieldErrors, setFieldErrors] = useState([]);
  const [fieldWarnings, setFieldWarnings] = useState([]);
  const [touched, setTouched] = useState(false);

  const validator = useMemo(() => createFieldValidator(rules), [rules]);

  const validate = useCallback((value) => {
    const result = validator(value);
    setFieldErrors(result.errors || []);
    setFieldWarnings(result.warnings || []);
    return result;
  }, [validator]);

  const validateOnChange = useCallback((value) => {
    if (touched) {
      return validate(value);
    }
    return { isValid: true, errors: [], warnings: [] };
  }, [validate, touched]);

  const validateOnBlur = useCallback((value) => {
    setTouched(true);
    return validate(value);
  }, [validate]);

  const clearValidation = useCallback(() => {
    setFieldErrors([]);
    setFieldWarnings([]);
    setTouched(false);
  }, []);

  const hasFieldErrors = useMemo(() => fieldErrors.length > 0, [fieldErrors]);
  const hasFieldWarnings = useMemo(() => fieldWarnings.length > 0, [fieldWarnings]);
  const isFieldValid = useMemo(() => !hasFieldErrors, [hasFieldErrors]);

  return {
    // State
    fieldErrors,
    fieldWarnings,
    touched,
    hasFieldErrors,
    hasFieldWarnings,
    isFieldValid,
    
    // Actions
    validate,
    validateOnChange,
    validateOnBlur,
    clearValidation,
    setTouched
  };
};

// Pre-configured validation hooks for common use cases
export const useFileUploadValidation = () => {
  return useValidation();
};

export const useDescriptionValidation = () => {
  const rules = [
    validationRules.required('Please provide a description of your application'),
    validationRules.minLength(10, 'Description must be at least 10 characters'),
    validationRules.maxLength(5000, 'Description must be less than 5000 characters')
  ];
  
  return useFieldValidation(rules);
};

export const useFrameworkValidation = () => {
  const frameworks = ['react', 'vue', 'angular', 'nodejs', 'python', 'static'];
  const rules = [
    validationRules.required('Please select a framework'),
    validationRules.oneOf(frameworks, 'Please select a valid framework')
  ];
  
  return useFieldValidation(rules);
};

export default useValidation;