// Deployment Validation and Testing Utilities
// Provides validation, testing, and rollback functionality for deployments

/**
 * Validate a deployment step
 * @param {Object} step - Deployment step with validation configuration
 * @param {Object} parameters - Deployment parameters for command substitution
 * @returns {Promise<Object>} Validation result
 */
export const validateDeploymentStep = async (step, parameters = {}) => {
  if (!step.validation) {
    return {
      success: true,
      message: 'No validation configured for this step',
      skipped: true
    };
  }

  const validation = step.validation;
  const command = substituteParameters(validation.command, parameters);
  
  try {
    // Simulate command execution (in browser environment)
    const result = await simulateCommandExecution(command, validation.expectedOutput);
    
    return {
      success: result.success,
      message: result.success ? 
        `✅ ${validation.description || 'Validation passed'}` :
        `❌ ${validation.description || 'Validation failed'}`,
      command: command,
      output: result.output,
      expectedOutput: validation.expectedOutput,
      successCriteria: validation.successCriteria || [],
      timestamp: new Date().toISOString(),
      details: result.details
    };
  } catch (error) {
    return {
      success: false,
      message: `❌ Validation error: ${error.message}`,
      command: command,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Run automated tests for a deployment step
 * @param {Object} step - Deployment step with testing configuration
 * @param {Object} parameters - Deployment parameters
 * @returns {Promise<Object>} Test results
 */
export const runAutomatedTests = async (step, parameters = {}) => {
  if (!step.testing || !step.testing.automatedTests) {
    return {
      success: true,
      message: 'No automated tests configured',
      tests: [],
      skipped: true
    };
  }

  const tests = step.testing.automatedTests;
  const results = [];
  let allPassed = true;

  for (const test of tests) {
    try {
      const command = substituteParameters(test.command, parameters);
      const result = await simulateCommandExecution(command, test.expectedResult);
      
      const testResult = {
        name: test.name,
        command: command,
        success: result.success,
        output: result.output,
        expectedResult: test.expectedResult,
        timestamp: new Date().toISOString(),
        duration: result.duration
      };
      
      results.push(testResult);
      
      if (!result.success) {
        allPassed = false;
      }
    } catch (error) {
      results.push({
        name: test.name,
        command: test.command,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      allPassed = false;
    }
  }

  return {
    success: allPassed,
    message: allPassed ? 
      `✅ All ${results.length} tests passed` :
      `❌ ${results.filter(r => !r.success).length} of ${results.length} tests failed`,
    tests: results,
    summary: {
      total: results.length,
      passed: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    }
  };
};

/**
 * Validate entire deployment success
 * @param {Object} deploymentGuide - Complete deployment guide
 * @param {Object} parameters - Deployment parameters
 * @returns {Promise<Object>} Overall validation result
 */
export const validateDeploymentSuccess = async (deploymentGuide, parameters = {}) => {
  if (!deploymentGuide.postDeployment?.validation) {
    return {
      success: true,
      message: 'No post-deployment validation configured',
      skipped: true
    };
  }

  const validation = deploymentGuide.postDeployment.validation;
  const results = [];
  let allPassed = true;

  for (const check of validation.checks) {
    try {
      let result;
      
      if (check.automated && check.command) {
        // Run automated check
        const command = substituteParameters(check.command, parameters);
        result = await simulateCommandExecution(command, check.successCriteria);
        
        results.push({
          name: check.name,
          description: check.description,
          type: 'automated',
          success: result.success,
          command: command,
          output: result.output,
          successCriteria: check.successCriteria,
          timestamp: new Date().toISOString()
        });
      } else {
        // Manual check - simulate user confirmation
        result = await simulateManualCheck(check);
        
        results.push({
          name: check.name,
          description: check.description,
          type: 'manual',
          success: result.success,
          instructions: check.instructions,
          successCriteria: check.successCriteria,
          userConfirmed: result.userConfirmed,
          timestamp: new Date().toISOString()
        });
      }
      
      if (!result.success) {
        allPassed = false;
      }
    } catch (error) {
      results.push({
        name: check.name,
        description: check.description,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      allPassed = false;
    }
  }

  return {
    success: allPassed,
    message: allPassed ? 
      '🎉 Deployment validation successful!' :
      '⚠️ Some validation checks failed',
    checks: results,
    summary: {
      total: results.length,
      passed: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      manual: results.filter(r => r.type === 'manual').length,
      automated: results.filter(r => r.type === 'automated').length
    },
    title: validation.title,
    description: validation.description
  };
};

/**
 * Generate rollback plan for deployment
 * @param {Object} deploymentGuide - Complete deployment guide
 * @param {Array} completedSteps - Steps that were completed
 * @param {Object} parameters - Deployment parameters
 * @returns {Object} Rollback plan
 */
export const generateRollbackPlan = (deploymentGuide, completedSteps = [], parameters = {}) => {
  const rollbackSteps = [];
  
  // Add step-specific rollbacks (in reverse order)
  for (let i = completedSteps.length - 1; i >= 0; i--) {
    const stepIndex = completedSteps[i];
    const step = deploymentGuide.steps[stepIndex];
    
    if (step.rollback) {
      rollbackSteps.push({
        title: `Rollback: ${step.title}`,
        description: step.rollback.description,
        commands: step.rollback.commands.map(cmd => substituteParameters(cmd, parameters)),
        warnings: step.rollback.warnings || [],
        stepIndex: stepIndex,
        originalStep: step.title
      });
    }
  }
  
  // Add complete rollback procedure if available
  if (deploymentGuide.postDeployment?.rollbackProcedure) {
    const procedure = deploymentGuide.postDeployment.rollbackProcedure;
    
    rollbackSteps.push({
      title: procedure.title,
      description: procedure.description,
      steps: procedure.steps.map(step => ({
        ...step,
        commands: step.commands.map(cmd => substituteParameters(cmd, parameters))
      })),
      estimatedTime: procedure.estimatedTime,
      costImpact: procedure.costImpact,
      isCompleteRollback: true
    });
  }

  return {
    hasRollbackSteps: rollbackSteps.length > 0,
    steps: rollbackSteps,
    summary: {
      totalSteps: rollbackSteps.length,
      estimatedTime: calculateRollbackTime(rollbackSteps),
      riskLevel: assessRollbackRisk(rollbackSteps)
    },
    warnings: extractAllWarnings(rollbackSteps),
    recommendations: generateRollbackRecommendations(rollbackSteps)
  };
};

/**
 * Simulate command execution (browser-safe)
 * @param {string} command - Command to simulate
 * @param {string} expectedOutput - Expected output pattern
 * @returns {Promise<Object>} Simulation result
 */
const simulateCommandExecution = async (command, expectedOutput) => {
  const startTime = Date.now();
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
  
  const duration = Date.now() - startTime;
  
  // Simulate different success rates based on command type
  let successRate = 0.8; // Default 80% success rate
  
  if (command.includes('aws s3 ls')) {
    successRate = 0.9; // S3 list operations usually work
  } else if (command.includes('curl')) {
    successRate = 0.7; // HTTP requests can fail more often
  } else if (command.includes('test -f')) {
    successRate = 0.95; // File existence checks are reliable
  } else if (command.includes('aws cloudfront')) {
    successRate = 0.6; // CloudFront operations can be slower/fail
  }
  
  const success = Math.random() < successRate;
  
  if (success) {
    return {
      success: true,
      output: generateMockOutput(command, expectedOutput),
      duration: duration,
      details: `Command executed successfully in ${duration}ms`
    };
  } else {
    return {
      success: false,
      output: generateMockError(command),
      duration: duration,
      details: `Command failed after ${duration}ms`
    };
  }
};

/**
 * Simulate manual check (user confirmation)
 * @param {Object} check - Manual check configuration
 * @returns {Promise<Object>} Manual check result
 */
const simulateManualCheck = async (check) => {
  // Simulate user taking time to perform manual check
  await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
  
  // Simulate 85% success rate for manual checks
  const success = Math.random() < 0.85;
  
  return {
    success: success,
    userConfirmed: success,
    message: success ? 
      'User confirmed the check passed' : 
      'User reported issues with this check'
  };
};

/**
 * Generate mock command output
 * @param {string} command - Command that was run
 * @param {string} expectedOutput - Expected output pattern
 * @returns {string} Mock output
 */
const generateMockOutput = (command, expectedOutput) => {
  if (command.includes('aws s3 ls')) {
    return '2024-01-15 10:30:45       1024 index.html\n2024-01-15 10:30:45       2048 static/css/main.css';
  }
  
  if (command.includes('curl')) {
    return 'HTTP/1.1 200 OK\nContent-Type: text/html\nContent-Length: 1024';
  }
  
  if (command.includes('test -f')) {
    return 'Build successful';
  }
  
  if (command.includes('wc -l')) {
    return '15'; // Number of files
  }
  
  return expectedOutput || 'Command completed successfully';
};

/**
 * Generate mock error output
 * @param {string} command - Command that failed
 * @returns {string} Mock error
 */
const generateMockError = (command) => {
  if (command.includes('aws s3')) {
    return 'NoSuchBucket: The specified bucket does not exist';
  }
  
  if (command.includes('curl')) {
    return 'curl: (7) Failed to connect to host';
  }
  
  if (command.includes('test -f')) {
    return 'File not found';
  }
  
  return 'Command execution failed';
};

/**
 * Substitute parameters in command strings
 * @param {string} template - Template string with {{parameter}} placeholders
 * @param {Object} parameters - Parameter values
 * @returns {string} String with parameters substituted
 */
const substituteParameters = (template, parameters) => {
  if (typeof template !== 'string') return template;
  
  return template.replace(/\{\{(\w+)\}\}/g, (match, paramName) => {
    const value = parameters[paramName];
    if (value === undefined || value === '') {
      return match; // Keep placeholder if no value
    }
    return value;
  });
};

/**
 * Calculate estimated rollback time
 * @param {Array} rollbackSteps - Rollback steps
 * @returns {string} Estimated time
 */
const calculateRollbackTime = (rollbackSteps) => {
  let totalMinutes = 0;
  
  rollbackSteps.forEach(step => {
    if (step.estimatedTime) {
      const timeMatch = step.estimatedTime.match(/(\d+)/);
      if (timeMatch) {
        totalMinutes += parseInt(timeMatch[1]);
      }
    } else {
      // Default estimate based on number of commands
      const commandCount = step.commands?.length || step.steps?.length || 1;
      totalMinutes += commandCount * 2; // 2 minutes per command
    }
  });
  
  if (totalMinutes < 60) {
    return `${totalMinutes} minutes`;
  }
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
};

/**
 * Assess rollback risk level
 * @param {Array} rollbackSteps - Rollback steps
 * @returns {string} Risk level
 */
const assessRollbackRisk = (rollbackSteps) => {
  let riskScore = 0;
  
  rollbackSteps.forEach(step => {
    // Increase risk for destructive operations
    if (step.commands?.some(cmd => cmd.includes('delete') || cmd.includes('rm'))) {
      riskScore += 2;
    }
    
    // Increase risk for warnings
    if (step.warnings?.length > 0) {
      riskScore += step.warnings.length;
    }
    
    // Increase risk for complete rollbacks
    if (step.isCompleteRollback) {
      riskScore += 3;
    }
  });
  
  if (riskScore <= 2) return 'Low';
  if (riskScore <= 5) return 'Medium';
  return 'High';
};

/**
 * Extract all warnings from rollback steps
 * @param {Array} rollbackSteps - Rollback steps
 * @returns {Array} All warnings
 */
const extractAllWarnings = (rollbackSteps) => {
  const warnings = [];
  
  rollbackSteps.forEach(step => {
    if (step.warnings) {
      warnings.push(...step.warnings);
    }
    
    if (step.steps) {
      step.steps.forEach(subStep => {
        if (subStep.warnings) {
          warnings.push(...subStep.warnings);
        }
      });
    }
  });
  
  return [...new Set(warnings)]; // Remove duplicates
};

/**
 * Generate rollback recommendations
 * @param {Array} rollbackSteps - Rollback steps
 * @returns {Array} Recommendations
 */
const generateRollbackRecommendations = (rollbackSteps) => {
  const recommendations = [];
  
  if (rollbackSteps.length > 3) {
    recommendations.push('Consider performing rollback in phases to minimize risk');
  }
  
  if (rollbackSteps.some(step => step.warnings?.length > 0)) {
    recommendations.push('Review all warnings carefully before proceeding');
  }
  
  if (rollbackSteps.some(step => step.isCompleteRollback)) {
    recommendations.push('Back up any important data before complete rollback');
  }
  
  recommendations.push('Test rollback commands in a safe environment first if possible');
  recommendations.push('Keep a record of rollback actions for future reference');
  
  return recommendations;
};

export default {
  validateDeploymentStep,
  runAutomatedTests,
  validateDeploymentSuccess,
  generateRollbackPlan
};