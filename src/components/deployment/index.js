// Deployment Components Index
// Centralized exports for all deployment-related components

export { default as DeploymentGuide } from './DeploymentGuide.jsx';
export { default as PrerequisiteChecker } from './PrerequisiteChecker.jsx';
export { default as DeploymentProgress, DeploymentTimeline } from './DeploymentProgress.jsx';
export { default as CommandCopier, CommandSequence, CommandValidator } from './CommandCopier.jsx';

// Re-export utilities for convenience
export {
  generateDeploymentGuide,
  generateParameters,
  substituteParameters,
  validatePrerequisites,
  estimateDeploymentTime,
  generateDeploymentChecklist,
  assessDeploymentDifficulty
} from '../../utils/deploymentGuideGenerator.js';

export {
  deploymentTemplates,
  prerequisites,
  commonSteps
} from '../../data/deploymentTemplates.js';