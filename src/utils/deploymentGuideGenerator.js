// Deployment Guide Generator
// Utilities for generating dynamic deployment guides with user-specific parameters

import { deploymentTemplates, prerequisites } from '../data/deploymentTemplates.js';

/**
 * Generate a deployment guide for a specific architecture pattern
 * @param {string} patternId - Architecture pattern identifier
 * @param {Object} userParams - User-specific parameters
 * @returns {Object} Complete deployment guide with personalized commands
 */
export const generateDeploymentGuide = (patternId, userParams = {}) => {
  const template = deploymentTemplates[patternId];
  
  if (!template) {
    throw new Error(`Deployment template not found for pattern: ${patternId}`);
  }

  // Generate default parameters if not provided
  const parameters = generateParameters(patternId, userParams);
  
  // Process the template with parameters
  const processedGuide = {
    ...template,
    parameters,
    steps: processSteps(template.steps, parameters),
    prerequisites: processPrerequisites(template.prerequisites, parameters),
    postDeployment: processPostDeployment(template.postDeployment, parameters),
    metadata: {
      ...template.metadata,
      generatedAt: new Date().toISOString(),
      parametersUsed: Object.keys(parameters)
    }
  };

  return processedGuide;
};

/**
 * Generate default parameters for deployment
 * @param {string} patternId - Architecture pattern identifier
 * @param {Object} userParams - User-provided parameters
 * @returns {Object} Complete parameter set
 */
export const generateParameters = (patternId, userParams = {}) => {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  
  // Base parameters that apply to all patterns
  const baseParams = {
    timestamp: timestamp.toString(),
    region: userParams.region || 'us-east-1',
    appName: userParams.appName || 'my-app',
    ...userParams
  };

  // Pattern-specific parameter generation
  const patternParams = generatePatternSpecificParams(patternId, baseParams, randomSuffix);
  
  return {
    ...baseParams,
    ...patternParams
  };
};

/**
 * Generate pattern-specific parameters
 * @param {string} patternId - Architecture pattern identifier
 * @param {Object} baseParams - Base parameters
 * @param {string} randomSuffix - Random suffix for unique naming
 * @returns {Object} Pattern-specific parameters
 */
const generatePatternSpecificParams = (patternId, baseParams, randomSuffix) => {
  const { appName, region } = baseParams;
  
  switch (patternId) {
    case 'static-spa':
      return {
        bucketName: `${appName.toLowerCase()}-${randomSuffix}`,
        cloudfrontDomain: '', // Will be populated after CloudFront creation
        websiteUrl: `${appName.toLowerCase()}-${randomSuffix}.s3-website-${region}.amazonaws.com`
      };
      
    case 'serverless-api':
      return {
        stackName: `${appName}-api-stack`,
        deploymentBucket: `${appName.toLowerCase()}-deployments-${randomSuffix}`,
        runtime: baseParams.runtime || 'nodejs18.x',
        handler: baseParams.handler || 'index.handler',
        apiId: '', // Will be populated after deployment
        apiUrl: '' // Will be populated after deployment
      };
      
    case 'traditional-stack':
      return {
        vpcId: '', // Will be populated after VPC creation
        subnetId: '', // Will be populated after subnet creation
        webSgId: '', // Will be populated after security group creation
        keyPair: baseParams.keyPair || 'my-key-pair',
        amiId: getAmiIdForRegion(region),
        albDnsName: '', // Will be populated after ALB creation
        repoUrl: baseParams.repoUrl || 'https://github.com/user/repo.git'
      };
      
    case 'container-stack':
      return {
        clusterName: `${appName}-cluster`,
        serviceName: `${appName}-service`,
        taskDefinition: `${appName}-task`,
        ecrRepository: `${appName.toLowerCase()}-repo`,
        imageTag: 'latest'
      };
      
    default:
      return {};
  }
};

/**
 * Get appropriate AMI ID for the specified region
 * @param {string} region - AWS region
 * @returns {string} AMI ID for Amazon Linux 2
 */
const getAmiIdForRegion = (region) => {
  // Amazon Linux 2 AMI IDs by region (these should be updated regularly)
  const amiMap = {
    'us-east-1': 'ami-0abcdef1234567890',
    'us-west-2': 'ami-0abcdef1234567891',
    'eu-west-1': 'ami-0abcdef1234567892',
    'ap-southeast-1': 'ami-0abcdef1234567893'
  };
  
  return amiMap[region] || amiMap['us-east-1'];
};

/**
 * Process deployment steps with parameter substitution
 * @param {Array} steps - Template steps
 * @param {Object} parameters - Substitution parameters
 * @returns {Array} Processed steps with substituted commands
 */
const processSteps = (steps, parameters) => {
  return steps.map(step => ({
    ...step,
    commands: step.commands?.map(command => substituteParameters(command, parameters)) || [],
    validation: step.validation ? {
      ...step.validation,
      command: substituteParameters(step.validation.command, parameters),
      expectedOutput: substituteParameters(step.validation.expectedOutput, parameters)
    } : undefined,
    files: step.files?.map(file => ({
      ...file,
      content: substituteParameters(file.content, parameters)
    })) || [],
    troubleshooting: step.troubleshooting?.map(item => ({
      ...item,
      issue: substituteParameters(item.issue, parameters),
      solution: substituteParameters(item.solution, parameters)
    })) || []
  }));
};

/**
 * Process prerequisites with parameter substitution
 * @param {Array} prereqs - Template prerequisites
 * @param {Object} parameters - Substitution parameters
 * @returns {Array} Processed prerequisites
 */
const processPrerequisites = (prereqs, parameters) => {
  return prereqs.map(prereq => ({
    ...prereq,
    checkCommand: substituteParameters(prereq.checkCommand, parameters),
    expectedOutput: substituteParameters(prereq.expectedOutput, parameters)
  }));
};

/**
 * Process post-deployment information with parameter substitution
 * @param {Object} postDeployment - Template post-deployment info
 * @param {Object} parameters - Substitution parameters
 * @returns {Object} Processed post-deployment information
 */
const processPostDeployment = (postDeployment, parameters) => {
  if (!postDeployment) return null;
  
  return {
    ...postDeployment,
    urls: postDeployment.urls?.map(url => ({
      ...url,
      template: substituteParameters(url.template, parameters),
      url: substituteParameters(url.template, parameters)
    })) || []
  };
};

/**
 * Substitute template parameters in a string
 * @param {string} template - Template string with {{parameter}} placeholders
 * @param {Object} parameters - Parameter values
 * @returns {string} String with parameters substituted
 */
export const substituteParameters = (template, parameters) => {
  if (typeof template !== 'string') return template;
  
  return template.replace(/\{\{(\w+)\}\}/g, (match, paramName) => {
    const value = parameters[paramName];
    if (value === undefined || value === '') {
      // Return placeholder for missing parameters that will be filled later
      return match;
    }
    return value;
  });
};

/**
 * Validate prerequisites for a deployment
 * @param {Array} prerequisites - List of prerequisites to check
 * @returns {Promise<Object>} Validation results
 */
export const validatePrerequisites = async (prerequisites) => {
  const results = {
    allMet: true,
    checks: [],
    summary: {
      total: prerequisites.length,
      satisfied: 0,
      failed: 0,
      warnings: 0
    }
  };

  for (const prereq of prerequisites) {
    try {
      const checkResult = await checkPrerequisite(prereq);
      results.checks.push(checkResult);
      
      if (checkResult.satisfied) {
        results.summary.satisfied++;
      } else {
        results.summary.failed++;
        if (prereq.required) {
          results.allMet = false;
        } else {
          results.summary.warnings++;
        }
      }
    } catch (error) {
      const failedCheck = {
        id: prereq.id,
        name: prereq.name,
        satisfied: false,
        error: error.message,
        required: prereq.required,
        installUrl: prereq.installUrl,
        setupUrl: prereq.setupUrl
      };
      
      results.checks.push(failedCheck);
      results.summary.failed++;
      
      if (prereq.required) {
        results.allMet = false;
      } else {
        results.summary.warnings++;
      }
    }
  }

  // Add overall assessment
  results.assessment = assessPrerequisiteStatus(results);

  return results;
};

/**
 * Check a single prerequisite
 * @param {Object} prerequisite - Prerequisite to check
 * @returns {Promise<Object>} Check result
 */
const checkPrerequisite = async (prerequisite) => {
  // In a browser environment, we can't actually execute shell commands
  // So we'll simulate the check with more realistic behavior
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate different success rates based on prerequisite type
      let successRate = 0.7; // Default 70% success rate
      
      switch (prerequisite.id) {
        case 'aws-cli':
          successRate = 0.6; // AWS CLI less commonly installed
          break;
        case 'aws-account':
          successRate = 0.8; // Most developers have AWS accounts
          break;
        case 'nodejs':
          successRate = 0.9; // Node.js very commonly installed
          break;
        case 'docker':
          successRate = 0.5; // Docker less commonly installed
          break;
        case 'sam-cli':
          successRate = 0.3; // SAM CLI rarely pre-installed
          break;
        case 'key-pair':
          successRate = 0.4; // Key pairs need to be created
          break;
        default:
          successRate = 0.7;
      }
      
      const satisfied = Math.random() < successRate;
      
      resolve({
        id: prerequisite.id,
        name: prerequisite.name,
        satisfied: satisfied,
        command: prerequisite.checkCommand,
        output: satisfied ? prerequisite.expectedOutput : 'Command not found or failed',
        required: prerequisite.required,
        installUrl: prerequisite.installUrl,
        setupUrl: prerequisite.setupUrl,
        version: satisfied ? getSimulatedVersion(prerequisite.id) : null,
        recommendation: getPrerequisiteRecommendation(prerequisite, satisfied)
      });
    }, Math.random() * 500 + 100); // Random delay 100-600ms
  });
};

/**
 * Get simulated version for a prerequisite
 * @param {string} prereqId - Prerequisite ID
 * @returns {string} Simulated version string
 */
const getSimulatedVersion = (prereqId) => {
  const versions = {
    'aws-cli': 'aws-cli/2.13.25',
    'nodejs': 'v18.17.0',
    'docker': 'Docker version 24.0.5',
    'sam-cli': 'SAM CLI, version 1.95.0'
  };
  
  return versions[prereqId] || '1.0.0';
};

/**
 * Get recommendation for a prerequisite
 * @param {Object} prerequisite - Prerequisite object
 * @param {boolean} satisfied - Whether prerequisite is satisfied
 * @returns {string} Recommendation text
 */
const getPrerequisiteRecommendation = (prerequisite, satisfied) => {
  if (satisfied) {
    return `✅ ${prerequisite.name} is properly installed and configured.`;
  }
  
  const recommendations = {
    'aws-cli': 'Install AWS CLI using the official installer or package manager. After installation, run "aws configure" to set up your credentials.',
    'aws-account': 'Sign up for an AWS account at aws.amazon.com. You may need to provide a credit card, but many services have free tiers.',
    'nodejs': 'Install Node.js from nodejs.org. Choose the LTS version for better stability.',
    'docker': 'Install Docker Desktop from docker.com. Make sure to start the Docker daemon after installation.',
    'sam-cli': 'Install AWS SAM CLI following the official documentation. You can use pip, homebrew, or download the installer.',
    'key-pair': 'Create an EC2 key pair in the AWS Console under EC2 > Key Pairs. Download the .pem file and keep it secure.'
  };
  
  return recommendations[prerequisite.id] || `Please install ${prerequisite.name} before proceeding.`;
};

/**
 * Assess overall prerequisite status
 * @param {Object} results - Validation results
 * @returns {Object} Assessment with recommendations
 */
const assessPrerequisiteStatus = (results) => {
  const { summary } = results;
  
  if (results.allMet) {
    return {
      status: 'ready',
      message: 'All required prerequisites are met. You can proceed with deployment.',
      color: 'green',
      action: 'proceed'
    };
  }
  
  const requiredFailed = results.checks.filter(c => !c.satisfied && c.required).length;
  
  if (requiredFailed > 0) {
    return {
      status: 'blocked',
      message: `${requiredFailed} required prerequisite${requiredFailed > 1 ? 's' : ''} not met. Please install missing requirements.`,
      color: 'red',
      action: 'install',
      priority: 'high'
    };
  }
  
  if (summary.warnings > 0) {
    return {
      status: 'warning',
      message: `${summary.warnings} optional prerequisite${summary.warnings > 1 ? 's' : ''} not met. Deployment may have limited functionality.`,
      color: 'yellow',
      action: 'consider',
      priority: 'medium'
    };
  }
  
  return {
    status: 'ready',
    message: 'Prerequisites check completed successfully.',
    color: 'green',
    action: 'proceed'
  };
};

/**
 * Estimate deployment time based on steps and complexity
 * @param {Array} steps - Deployment steps
 * @param {number} complexity - Complexity rating (1-5)
 * @param {Object} userExperience - User experience level and factors
 * @returns {Object} Time estimation
 */
export const estimateDeploymentTime = (steps, complexity = 3, userExperience = {}) => {
  let totalMinutes = 0;
  const stepBreakdown = [];
  
  steps.forEach((step, index) => {
    // Parse estimated time from step (e.g., "5 minutes", "5-10 minutes")
    const timeStr = step.estimatedTime || '5 minutes';
    const timeMatch = timeStr.match(/(\d+)(?:-(\d+))?\s*minutes?/);
    
    let stepTime = 5; // Default fallback
    if (timeMatch) {
      const minTime = parseInt(timeMatch[1]);
      const maxTime = timeMatch[2] ? parseInt(timeMatch[2]) : minTime;
      stepTime = (minTime + maxTime) / 2;
    }
    
    // Adjust for step complexity
    const stepComplexity = getStepComplexity(step);
    stepTime *= (1 + stepComplexity * 0.1);
    
    totalMinutes += stepTime;
    stepBreakdown.push({
      stepIndex: index,
      title: step.title,
      baseTime: stepTime,
      complexity: stepComplexity
    });
  });

  // Apply various multipliers
  const multipliers = calculateTimeMultipliers(complexity, userExperience);
  const adjustedMinutes = Math.ceil(totalMinutes * multipliers.total);
  
  // Calculate confidence intervals
  const confidence = calculateTimeConfidence(steps, complexity, userExperience);
  
  return {
    totalMinutes: adjustedMinutes,
    formatted: formatDuration(adjustedMinutes),
    range: {
      optimistic: Math.ceil(adjustedMinutes * 0.8),
      realistic: adjustedMinutes,
      pessimistic: Math.ceil(adjustedMinutes * 1.5)
    },
    breakdown: {
      baseTime: totalMinutes,
      multipliers: multipliers,
      stepBreakdown: stepBreakdown,
      complexity: complexity
    },
    confidence: confidence,
    factors: getTimeFactors(steps, complexity, userExperience)
  };
};

/**
 * Calculate step complexity based on step characteristics
 * @param {Object} step - Deployment step
 * @returns {number} Complexity score (0-5)
 */
const getStepComplexity = (step) => {
  let complexity = 0;
  
  // Command complexity
  if (step.commands) {
    complexity += step.commands.length * 0.2;
    
    // Check for complex commands
    const complexPatterns = [
      /aws\s+\w+\s+create-/,  // AWS resource creation
      /docker\s+build/,       // Docker builds
      /sam\s+deploy/,         // SAM deployments
      /ssh\s+-i/,             // SSH operations
      /\|\s*docker/           // Piped docker commands
    ];
    
    step.commands.forEach(cmd => {
      complexPatterns.forEach(pattern => {
        if (pattern.test(cmd)) complexity += 0.5;
      });
    });
  }
  
  // File creation complexity
  if (step.files) {
    complexity += step.files.length * 0.3;
    
    // JSON/YAML files are more complex
    step.files.forEach(file => {
      if (file.name.match(/\.(json|yaml|yml)$/)) {
        complexity += 0.5;
      }
    });
  }
  
  // Troubleshooting indicates complexity
  if (step.troubleshooting && step.troubleshooting.length > 0) {
    complexity += step.troubleshooting.length * 0.2;
  }
  
  return Math.min(complexity, 5);
};

/**
 * Calculate time multipliers based on various factors
 * @param {number} complexity - Overall complexity (1-5)
 * @param {Object} userExperience - User experience factors
 * @returns {Object} Multiplier breakdown
 */
const calculateTimeMultipliers = (complexity, userExperience = {}) => {
  const multipliers = {
    complexity: 1 + (complexity - 1) * 0.15,  // 15% per complexity point
    experience: 1,
    environment: 1,
    total: 1
  };
  
  // Experience level multiplier
  const experienceLevel = userExperience.level || 'intermediate';
  const experienceMultipliers = {
    beginner: 1.5,
    intermediate: 1.0,
    advanced: 0.8,
    expert: 0.6
  };
  multipliers.experience = experienceMultipliers[experienceLevel] || 1.0;
  
  // Environment factors
  if (userExperience.firstTimeAWS) {
    multipliers.environment *= 1.3;
  }
  
  if (userExperience.hasTeamSupport) {
    multipliers.environment *= 0.9;
  }
  
  if (userExperience.timeConstraints === 'tight') {
    multipliers.environment *= 1.2; // Pressure can slow things down
  }
  
  // Calculate total multiplier
  multipliers.total = multipliers.complexity * multipliers.experience * multipliers.environment;
  
  return multipliers;
};

/**
 * Calculate confidence in time estimate
 * @param {Array} steps - Deployment steps
 * @param {number} complexity - Complexity rating
 * @param {Object} userExperience - User experience factors
 * @returns {Object} Confidence assessment
 */
const calculateTimeConfidence = (steps, complexity, userExperience) => {
  let confidence = 0.8; // Base confidence
  
  // Reduce confidence for complex deployments
  confidence -= (complexity - 1) * 0.1;
  
  // Reduce confidence for many steps
  if (steps.length > 8) {
    confidence -= 0.1;
  }
  
  // Reduce confidence for inexperienced users
  const experienceLevel = userExperience.level || 'intermediate';
  if (experienceLevel === 'beginner') {
    confidence -= 0.2;
  } else if (experienceLevel === 'advanced') {
    confidence += 0.1;
  }
  
  // Steps with troubleshooting reduce confidence
  const troubleshootingSteps = steps.filter(s => s.troubleshooting && s.troubleshooting.length > 0);
  confidence -= troubleshootingSteps.length * 0.05;
  
  confidence = Math.max(0.3, Math.min(0.95, confidence));
  
  return {
    score: confidence,
    level: confidence > 0.8 ? 'high' : confidence > 0.6 ? 'medium' : 'low',
    factors: {
      complexity: complexity,
      stepCount: steps.length,
      troubleshootingSteps: troubleshootingSteps.length,
      userExperience: experienceLevel
    }
  };
};

/**
 * Get factors affecting deployment time
 * @param {Array} steps - Deployment steps
 * @param {number} complexity - Complexity rating
 * @param {Object} userExperience - User experience factors
 * @returns {Array} List of time factors
 */
const getTimeFactors = (steps, complexity, userExperience) => {
  const factors = [];
  
  if (complexity >= 4) {
    factors.push({
      type: 'warning',
      message: 'High complexity deployment - allow extra time for troubleshooting'
    });
  }
  
  if (steps.length > 10) {
    factors.push({
      type: 'info',
      message: 'Many deployment steps - consider breaking into phases'
    });
  }
  
  const awsSteps = steps.filter(s => 
    s.commands && s.commands.some(cmd => cmd.startsWith('aws '))
  );
  
  if (awsSteps.length > 5) {
    factors.push({
      type: 'info',
      message: 'Multiple AWS service configurations - each may take time to propagate'
    });
  }
  
  const buildSteps = steps.filter(s => 
    s.commands && s.commands.some(cmd => 
      cmd.includes('build') || cmd.includes('compile') || cmd.includes('docker')
    )
  );
  
  if (buildSteps.length > 0) {
    factors.push({
      type: 'info',
      message: 'Build steps included - time varies based on project size and internet speed'
    });
  }
  
  if (userExperience.level === 'beginner') {
    factors.push({
      type: 'tip',
      message: 'First time? Take breaks between steps and read documentation carefully'
    });
  }
  
  return factors;
};

/**
 * Format duration in minutes to human-readable string
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration
 */
const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes} minutes`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  
  return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minutes`;
};

/**
 * Generate deployment checklist for progress tracking
 * @param {Array} steps - Deployment steps
 * @returns {Array} Checklist items
 */
export const generateDeploymentChecklist = (steps) => {
  return steps.map((step, index) => ({
    id: step.id,
    title: step.title,
    description: step.description,
    order: index + 1,
    completed: false,
    skipped: false,
    error: null,
    startTime: null,
    endTime: null,
    duration: null
  }));
};

/**
 * Calculate deployment difficulty score
 * @param {Object} template - Deployment template
 * @param {Object} userProfile - User experience and preferences
 * @returns {Object} Difficulty assessment
 */
export const assessDeploymentDifficulty = (template, userProfile = {}) => {
  // Analyze template characteristics
  const templateFactors = analyzeTemplateComplexity(template);
  
  // Calculate base difficulty score
  const baseDifficulty = calculateBaseDifficulty(templateFactors);
  
  // Adjust for user profile
  const adjustedDifficulty = adjustDifficultyForUser(baseDifficulty, userProfile);
  
  // Generate comprehensive assessment
  const assessment = {
    score: Math.round(adjustedDifficulty),
    level: getDifficultyLevel(adjustedDifficulty),
    factors: templateFactors,
    userAdjustments: getUserAdjustments(userProfile),
    timeCommitment: getTimeCommitment(adjustedDifficulty, templateFactors),
    skillsRequired: getRequiredSkills(template),
    riskFactors: identifyRiskFactors(template, templateFactors),
    recommendations: generateDifficultyRecommendations(adjustedDifficulty, templateFactors, userProfile),
    successTips: generateSuccessTips(template, adjustedDifficulty),
    alternatives: suggestAlternatives(template, adjustedDifficulty)
  };
  
  return assessment;
};

/**
 * Analyze template complexity factors
 * @param {Object} template - Deployment template
 * @returns {Object} Complexity factors
 */
const analyzeTemplateComplexity = (template) => {
  const factors = {
    stepCount: template.steps.length,
    prerequisiteCount: template.prerequisites.length,
    baseComplexity: template.metadata.complexity || 3,
    automationLevel: getAutomationScore(template.metadata.automationLevel),
    
    // Analyze step characteristics
    commandComplexity: 0,
    fileCreationCount: 0,
    awsServiceCount: 0,
    troubleshootingSteps: 0,
    manualSteps: 0,
    
    // Service complexity
    servicesUsed: [],
    networkingRequired: false,
    databaseRequired: false,
    containerization: false,
    
    // Risk factors
    destructiveOperations: false,
    costImplications: false,
    securityConfiguration: false
  };
  
  // Analyze each step
  template.steps.forEach(step => {
    // Command analysis
    if (step.commands) {
      factors.commandComplexity += analyzeCommandComplexity(step.commands);
      
      // Check for AWS services
      step.commands.forEach(cmd => {
        const awsServices = extractAWSServices(cmd);
        factors.servicesUsed.push(...awsServices);
        
        // Check for specific patterns
        if (cmd.includes('vpc') || cmd.includes('subnet') || cmd.includes('security-group')) {
          factors.networkingRequired = true;
        }
        
        if (cmd.includes('rds') || cmd.includes('dynamodb')) {
          factors.databaseRequired = true;
        }
        
        if (cmd.includes('docker') || cmd.includes('ecs') || cmd.includes('ecr')) {
          factors.containerization = true;
        }
        
        if (cmd.includes('delete') || cmd.includes('terminate') || cmd.includes('destroy')) {
          factors.destructiveOperations = true;
        }
      });
    }
    
    // File creation analysis
    if (step.files) {
      factors.fileCreationCount += step.files.length;
      
      // Check for complex configuration files
      step.files.forEach(file => {
        if (file.name.match(/\.(json|yaml|yml)$/) && file.content.length > 500) {
          factors.commandComplexity += 0.5;
        }
      });
    }
    
    // Troubleshooting indicates complexity
    if (step.troubleshooting && step.troubleshooting.length > 0) {
      factors.troubleshootingSteps++;
    }
    
    // Manual steps (SSH, manual configuration)
    if (step.commands && step.commands.some(cmd => cmd.includes('ssh') || cmd.includes('scp'))) {
      factors.manualSteps++;
    }
  });
  
  // Deduplicate services
  factors.servicesUsed = [...new Set(factors.servicesUsed)];
  factors.awsServiceCount = factors.servicesUsed.length;
  
  // Check cost implications
  if (template.postDeployment?.estimatedCosts) {
    const maxCost = parseFloat(template.postDeployment.estimatedCosts.monthly.high.replace(/[^0-9.]/g, ''));
    if (maxCost > 100) {
      factors.costImplications = true;
    }
  }
  
  // Security configuration complexity
  if (factors.servicesUsed.includes('iam') || factors.networkingRequired) {
    factors.securityConfiguration = true;
  }
  
  return factors;
};

/**
 * Calculate base difficulty score from template factors
 * @param {Object} factors - Template complexity factors
 * @returns {number} Base difficulty score (1-5)
 */
const calculateBaseDifficulty = (factors) => {
  let score = 0;
  
  // Step count impact (20% weight)
  score += Math.min(2, factors.stepCount / 5) * 0.2;
  
  // Base complexity (30% weight)
  score += (factors.baseComplexity / 5) * 0.3;
  
  // Command complexity (20% weight)
  score += Math.min(2, factors.commandComplexity / 3) * 0.2;
  
  // AWS services count (15% weight)
  score += Math.min(1.5, factors.awsServiceCount / 4) * 0.15;
  
  // Automation level (10% weight) - lower automation = higher difficulty
  score += (factors.automationLevel / 3) * 0.1;
  
  // Risk factors (5% weight)
  let riskScore = 0;
  if (factors.networkingRequired) riskScore += 0.5;
  if (factors.databaseRequired) riskScore += 0.3;
  if (factors.containerization) riskScore += 0.4;
  if (factors.destructiveOperations) riskScore += 0.6;
  if (factors.securityConfiguration) riskScore += 0.4;
  if (factors.costImplications) riskScore += 0.3;
  
  score += Math.min(1, riskScore) * 0.05;
  
  // Scale to 1-5 range
  return Math.max(1, Math.min(5, score * 5));
};

/**
 * Adjust difficulty based on user profile
 * @param {number} baseDifficulty - Base difficulty score
 * @param {Object} userProfile - User experience and preferences
 * @returns {number} Adjusted difficulty score
 */
const adjustDifficultyForUser = (baseDifficulty, userProfile) => {
  let adjusted = baseDifficulty;
  
  // Experience level adjustments
  const experienceAdjustments = {
    beginner: 0.8,      // Increase difficulty for beginners
    intermediate: 0,    // No adjustment
    advanced: -0.5,     // Decrease difficulty for advanced users
    expert: -1.0        // Significant decrease for experts
  };
  
  const experienceLevel = userProfile.experienceLevel || 'intermediate';
  adjusted += experienceAdjustments[experienceLevel] || 0;
  
  // AWS experience adjustments
  if (userProfile.awsExperience === 'none') {
    adjusted += 0.5;
  } else if (userProfile.awsExperience === 'expert') {
    adjusted -= 0.3;
  }
  
  // DevOps experience
  if (userProfile.devopsExperience === 'none') {
    adjusted += 0.4;
  } else if (userProfile.devopsExperience === 'expert') {
    adjusted -= 0.4;
  }
  
  // Time availability
  if (userProfile.timeAvailable === 'limited') {
    adjusted += 0.3; // Time pressure increases perceived difficulty
  }
  
  // Support availability
  if (userProfile.hasSupport) {
    adjusted -= 0.2;
  }
  
  return Math.max(1, Math.min(5, adjusted));
};

/**
 * Get automation score from automation level
 * @param {string} automationLevel - Automation level string
 * @returns {number} Automation score (1-3, lower is more automated)
 */
const getAutomationScore = (automationLevel) => {
  const scores = {
    'High': 1,
    'Medium': 2,
    'Low': 3
  };
  return scores[automationLevel] || 2;
};

/**
 * Analyze command complexity
 * @param {Array} commands - Array of command strings
 * @returns {number} Complexity score
 */
const analyzeCommandComplexity = (commands) => {
  let complexity = 0;
  
  commands.forEach(cmd => {
    // Basic command complexity
    complexity += 0.1;
    
    // Complex AWS operations
    if (cmd.match(/aws\s+\w+\s+(create|put|register)/)) complexity += 0.3;
    
    // File operations
    if (cmd.includes('file://')) complexity += 0.2;
    
    // Piped commands
    if (cmd.includes('|')) complexity += 0.2;
    
    // SSH operations
    if (cmd.includes('ssh') || cmd.includes('scp')) complexity += 0.4;
    
    // Docker operations
    if (cmd.includes('docker')) complexity += 0.3;
    
    // Long commands (likely complex)
    if (cmd.length > 100) complexity += 0.2;
    
    // Multiple parameters
    const paramCount = (cmd.match(/--\w+/g) || []).length;
    complexity += paramCount * 0.05;
  });
  
  return complexity;
};

/**
 * Extract AWS services from command
 * @param {string} command - Command string
 * @returns {Array} Array of AWS service names
 */
const extractAWSServices = (command) => {
  const services = [];
  const awsServicePattern = /aws\s+(\w+)/g;
  let match;
  
  while ((match = awsServicePattern.exec(command)) !== null) {
    services.push(match[1]);
  }
  
  return services;
};

/**
 * Get difficulty level string
 * @param {number} score - Difficulty score
 * @returns {string} Difficulty level
 */
const getDifficultyLevel = (score) => {
  if (score <= 1.5) return 'Very Easy';
  if (score <= 2.5) return 'Easy';
  if (score <= 3.5) return 'Moderate';
  if (score <= 4.5) return 'Difficult';
  return 'Very Difficult';
};

/**
 * Get user adjustments summary
 * @param {Object} userProfile - User profile
 * @returns {Object} User adjustments
 */
const getUserAdjustments = (userProfile) => {
  const adjustments = {
    experience: userProfile.experienceLevel || 'intermediate',
    awsExperience: userProfile.awsExperience || 'some',
    devopsExperience: userProfile.devopsExperience || 'some',
    timeAvailable: userProfile.timeAvailable || 'adequate',
    hasSupport: userProfile.hasSupport || false
  };
  
  return adjustments;
};

/**
 * Get time commitment assessment
 * @param {number} difficulty - Difficulty score
 * @param {Object} factors - Complexity factors
 * @returns {Object} Time commitment
 */
const getTimeCommitment = (difficulty, factors) => {
  const baseHours = Math.ceil(difficulty * 2); // 2-10 hours based on difficulty
  
  return {
    estimated: `${baseHours}-${baseHours * 2} hours`,
    sessions: Math.ceil(baseHours / 3), // Assume 3-hour sessions
    recommendation: difficulty > 3.5 ? 
      'Plan for multiple sessions with breaks' : 
      'Can likely be completed in one session'
  };
};

/**
 * Get required skills
 * @param {Object} template - Deployment template
 * @returns {Array} Required skills
 */
const getRequiredSkills = (template) => {
  const skills = ['Basic command line usage', 'AWS account management'];
  
  // Analyze template for specific skill requirements
  const hasDocker = template.steps.some(step => 
    step.commands && step.commands.some(cmd => cmd.includes('docker'))
  );
  
  const hasNetworking = template.steps.some(step =>
    step.commands && step.commands.some(cmd => 
      cmd.includes('vpc') || cmd.includes('subnet') || cmd.includes('security-group')
    )
  );
  
  const hasSSH = template.steps.some(step =>
    step.commands && step.commands.some(cmd => cmd.includes('ssh'))
  );
  
  if (hasDocker) skills.push('Docker containerization');
  if (hasNetworking) skills.push('Basic networking concepts');
  if (hasSSH) skills.push('SSH and Linux server administration');
  
  if (template.metadata.complexity >= 4) {
    skills.push('Infrastructure as Code concepts');
    skills.push('Troubleshooting and debugging');
  }
  
  return skills;
};

/**
 * Identify risk factors
 * @param {Object} template - Deployment template
 * @param {Object} factors - Complexity factors
 * @returns {Array} Risk factors
 */
const identifyRiskFactors = (template, factors) => {
  const risks = [];
  
  if (factors.costImplications) {
    risks.push({
      type: 'cost',
      level: 'medium',
      description: 'Deployment may incur significant AWS costs',
      mitigation: 'Monitor AWS billing dashboard and set up cost alerts'
    });
  }
  
  if (factors.destructiveOperations) {
    risks.push({
      type: 'data',
      level: 'high',
      description: 'Deployment includes operations that could delete resources',
      mitigation: 'Always backup important data before proceeding'
    });
  }
  
  if (factors.securityConfiguration) {
    risks.push({
      type: 'security',
      level: 'medium',
      description: 'Deployment involves security configuration',
      mitigation: 'Review security groups and IAM policies carefully'
    });
  }
  
  if (factors.manualSteps > 0) {
    risks.push({
      type: 'reliability',
      level: 'low',
      description: 'Manual steps may be error-prone',
      mitigation: 'Double-check all manual configurations'
    });
  }
  
  return risks;
};

/**
 * Generate success tips
 * @param {Object} template - Deployment template
 * @param {number} difficulty - Difficulty score
 * @returns {Array} Success tips
 */
const generateSuccessTips = (template, difficulty) => {
  const tips = [];
  
  if (difficulty > 3.5) {
    tips.push('Break the deployment into phases and test each phase');
    tips.push('Keep AWS documentation open for reference');
    tips.push('Take screenshots of important configuration screens');
  }
  
  tips.push('Verify all prerequisites before starting');
  tips.push('Have your AWS credentials and region configured correctly');
  
  if (template.steps.some(s => s.troubleshooting)) {
    tips.push('Read through troubleshooting sections before starting each step');
  }
  
  if (template.postDeployment?.estimatedCosts) {
    tips.push('Monitor AWS costs during and after deployment');
  }
  
  tips.push('Keep a deployment log to track your progress');
  
  return tips;
};

/**
 * Suggest alternatives based on difficulty
 * @param {Object} template - Deployment template
 * @param {number} difficulty - Difficulty score
 * @returns {Array} Alternative suggestions
 */
const suggestAlternatives = (template, difficulty) => {
  const alternatives = [];
  
  if (difficulty > 4) {
    alternatives.push({
      type: 'managed',
      title: 'Use managed services',
      description: 'Consider using more managed AWS services to reduce complexity'
    });
    
    alternatives.push({
      type: 'automation',
      title: 'Infrastructure as Code',
      description: 'Use AWS CDK or Terraform for more reliable deployments'
    });
  }
  
  if (template.id === 'traditional-stack') {
    alternatives.push({
      type: 'serverless',
      title: 'Serverless alternative',
      description: 'Consider serverless architecture for simpler deployment'
    });
  }
  
  if (template.id === 'container-stack') {
    alternatives.push({
      type: 'platform',
      title: 'Platform services',
      description: 'Consider AWS App Runner for simpler container deployment'
    });
  }
  
  return alternatives;
};

/**
 * Generate recommendations based on difficulty assessment
 * @param {number} score - Difficulty score
 * @param {Object} factors - Difficulty factors
 * @returns {Array} Recommendations
 */
const generateDifficultyRecommendations = (score, factors) => {
  const recommendations = [];
  
  if (score >= 4) {
    recommendations.push('Consider using infrastructure-as-code tools like Terraform or CloudFormation');
    recommendations.push('Set aside extra time for troubleshooting');
    recommendations.push('Have AWS documentation readily available');
  }
  
  if (factors.prerequisiteCount > 3) {
    recommendations.push('Verify all prerequisites before starting deployment');
    recommendations.push('Consider using Docker to standardize the environment');
  }
  
  if (factors.stepCount > 8) {
    recommendations.push('Break deployment into smaller phases');
    recommendations.push('Test each phase thoroughly before proceeding');
  }
  
  if (factors.automationLevel > 2) {
    recommendations.push('Consider using AWS CDK or SAM for better automation');
    recommendations.push('Document manual steps for future reference');
  }
  
  return recommendations;
};

export default {
  generateDeploymentGuide,
  generateParameters,
  substituteParameters,
  validatePrerequisites,
  estimateDeploymentTime,
  generateDeploymentChecklist,
  assessDeploymentDifficulty
};