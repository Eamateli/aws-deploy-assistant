<!------------------------------------------------------------------------------------
   Add Rules to this file or a short description and have Kiro refine them for you:
   # AWS Deploy Assistant - Structure Steering Document

## Project Organization

### Directory Structure
```
aws-deploy-assistant/
├── .kiro/                           # Kiro configuration and workflows
│   ├── specs/                       # Feature specifications
│   │   ├── code-analyzer.md         # Code analysis engine spec
│   │   ├── aws-recommender.md       # Service recommendation spec
│   │   ├── architecture-diagram.md  # Diagram visualization spec
│   │   ├── deployment-guide.md      # Guide generation spec
│   │   └── cost-calculator.md       # Cost estimation spec
│   ├── steering/                    # High-level guidance documents
│   │   ├── product.md              # Product strategy and vision
│   │   ├── structure.md            # This document
│   │   └── tech.md                 # Technical architecture
│   ├── hooks/                      # Automation and CI hooks
│   │   ├── update-patterns.js      # Pattern database updates
│   │   ├── validate-specs.js       # Spec validation
│   │   └── generate-docs.js        # Documentation generation
│   └── kiro.config.json           # Kiro platform configuration
├── src/
│   ├── components/                  # React components (organized by feature)
│   │   ├── core/                   # Reusable UI components
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Layout.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── Tooltip.jsx
│   │   ├── analysis/               # Code analysis components
│   │   │   ├── CodeUploader.jsx
│   │   │   ├── FileAnalyzer.jsx
│   │   │   ├── PatternDetector.jsx
│   │   │   ├── RequirementsForm.jsx
│   │   │   └── AnalysisResults.jsx
│   │   ├── recommendations/        # Service recommendation components
│   │   │   ├── ServiceRecommender.jsx
│   │   │   ├── ServiceCard.jsx
│   │   │   ├── ServiceComparison.jsx
│   │   │   ├── AlternativeOptions.jsx
│   │   │   └── RecommendationSummary.jsx
│   │   ├── architecture/           # Architecture visualization
│   │   │   ├── ArchitectureDiagram.jsx
│   │   │   ├── AWSServiceNode.jsx
│   │   │   ├── ConnectionFlow.jsx
│   │   │   ├── DiagramControls.jsx
│   │   │   └── DiagramExporter.jsx
│   │   ├── deployment/             # Deployment guidance
│   │   │   ├── DeploymentGuide.jsx
│   │   │   ├── StepByStep.jsx
│   │   │   ├── CommandCopier.jsx
│   │   │   ├── PrerequisiteChecker.jsx
│   │   │   └── ProgressTracker.jsx
│   │   └── cost/                   # Cost estimation
│   │       ├── CostCalculator.jsx
│   │       ├── CostBreakdown.jsx
│   │       ├── CostComparison.jsx
│   │       ├── OptimizationTips.jsx
│   │       └── PricingChart.jsx
│   ├── data/                       # Static data and configuration
│   │   ├── awsPatterns.json        # Pattern matching rules
│   │   ├── serviceCatalog.json     # AWS service definitions
│   │   ├── pricingData.json        # AWS pricing information
│   │   ├── deploymentTemplates.json # Deployment templates
│   │   └── architectureTemplates.json # Architecture patterns
│   ├── context/                    # React Context providers
│   │   ├── AppContext.jsx          # Global application state
│   │   ├── AnalysisContext.jsx     # Analysis workflow state
│   │   ├── ThemeContext.jsx        # UI theme and preferences
│   │   └── NotificationContext.jsx # Toast notifications
│   ├── hooks/                      # Custom React hooks
│   │   ├── usePatternMatching.js   # Pattern detection logic
│   │   ├── useCostCalculation.js   # Cost estimation
│   │   ├── useDeploymentGuide.js   # Guide generation
│   │   ├── useArchitectureDiagram.js # Diagram management
│   │   ├── useFileAnalysis.js      # File parsing and analysis
│   │   └── useLocalStorage.js      # Persistent storage
│   ├── utils/                      # Utility functions
│   │   ├── patternMatchers.js      # Core pattern matching
│   │   ├── costCalculators.js      # Pricing calculations
│   │   ├── templateGenerators.js   # Template creation
│   │   ├── fileProcessors.js       # File parsing utilities
│   │   ├── validators.js           # Input validation
│   │   └── formatters.js           # Data formatting
│   ├── styles/                     # CSS and styling
│   │   ├── globals.css             # Global styles
│   │   ├── components.css          # Component-specific styles
│   │   └── animations.css          # Animation definitions
│   └── App.jsx                     # Root application component
├── public/                         # Static assets
│   ├── index.html
│   ├── manifest.json
│   ├── icons/                      # Application icons
│   └── aws-icons/                  # AWS service icons
├── docs/                           # Documentation
│   ├── README.md                   # Project overview
│   ├── SETUP.md                    # Development setup
│   ├── PATTERNS.md                 # Pattern matching guide
│   ├── DEPLOYMENT.md               # Deployment instructions
│   └── CONTRIBUTING.md             # Contribution guidelines
├── tests/                          # Test files
│   ├── components/                 # Component tests
│   ├── utils/                      # Utility function tests
│   ├── data/                       # Test data sets
│   └── integration/                # Integration tests
├── package.json                    # Dependencies and scripts
├── tailwind.config.js             # Tailwind CSS configuration
├── vite.config.js                 # Vite build configuration
└── .gitignore                     # Git ignore rules
```

## Development Workflow

### Kiro Spec-Driven Development Process

#### 1. Specification Phase
- **Steering Documents** (Current Phase)
  - Product strategy and vision
  - Technical architecture decisions
  - Project structure and organization

#### 2. Feature Specification Phase
- **Detailed Specs** for each major component
  - Functional requirements
  - User interface mockups
  - API definitions
  - Test cases

#### 3. Implementation Phase
- **Task Breakdown** from specs
  - Granular development tasks
  - Dependencies and ordering
  - Acceptance criteria

#### 4. Quality Assurance Phase
- **Validation** against specs
  - Feature completeness
  - Performance benchmarks
  - User experience testing

### File Naming Conventions

#### Components
- **PascalCase** for component files: `ServiceRecommender.jsx`
- **camelCase** for utility files: `patternMatchers.js`
- **kebab-case** for spec files: `code-analyzer.md`
- **UPPERCASE** for constants: `AWS_REGIONS.js`

#### Directory Organization
- **Feature-based** grouping for components
- **Functionality-based** grouping for utilities
- **Type-based** grouping for data files

### Data Organization

#### Pattern Matching Data Structure
```json
{
  "patterns": {
    "react-spa": {
      "name": "React Single Page Application",
      "indicators": {
        "files": ["package.json", "src/App.jsx", "public/index.html"],
        "dependencies": ["react", "react-dom"],
        "content_patterns": ["jsx", "useState", "useEffect"],
        "build_commands": ["npm run build", "yarn build"]
      },
      "confidence_weights": {
        "files": 0.3,
        "dependencies": 0.4,
        "content": 0.2,
        "build": 0.1
      },
      "recommendations": ["static-spa-pattern"]
    }
  },
  "architectures": {
    "static-spa-pattern": {
      "name": "Static SPA Hosting",
      "services": ["S3", "CloudFront", "Route53"],
      "cost_estimate": [5, 25],
      "complexity": 2,
      "deployment_time": "15-30 minutes"
    }
  }
}
```

#### Service Catalog Structure
```json
{
  "services": {
    "S3": {
      "name": "Simple Storage Service",
      "category": "Storage",
      "description": "Object storage service",
      "use_cases": ["static hosting", "file storage", "backup"],
      "pricing": {
        "storage": "$0.023/GB/month",
        "requests": "$0.0004/1000 GET requests",
        "free_tier": "5GB storage, 20k GET requests"
      },
      "setup_complexity": 2,
      "learning_curve": 2,
      "icon": "database"
    }
  }
}
```

### Component Architecture Patterns

#### Container/Presentation Pattern
```
analysis/
├── AnalysisContainer.jsx          # State management and logic
├── AnalysisView.jsx               # Pure presentation component
├── components/                    # Sub-components
│   ├── FileUpload.jsx
│   ├── ProgressIndicator.jsx
│   └── ResultsDisplay.jsx
└── hooks/
    └── useAnalysisLogic.js        # Custom hook for analysis logic
```

#### Context Provider Pattern
```javascript
// Context structure for each major feature
const AnalysisContext = createContext({
  state: {
    files: [],
    analysis: null,
    loading: false,
    error: null
  },
  actions: {
    uploadFiles: () => {},
    analyzeCode: () => {},
    clearAnalysis: () => {}
  }
});
```

### State Management Strategy

#### Global State (App Context)
- Current workflow step
- Selected recommendation
- User preferences
- Application settings

#### Feature State (Feature Contexts)
- Analysis results and progress
- Diagram state and layout
- Cost calculation parameters
- Deployment guide progress

#### Local State (Component State)
- Form inputs
- UI interactions
- Temporary data
- Animation states

### Error Handling Structure

#### Error Categories
1. **User Input Errors**
   - Invalid file formats
   - Missing required information
   - Unsupported patterns

2. **Analysis Errors**
   - Pattern matching failures
   - Insufficient confidence scores
   - Conflicting indicators

3. **System Errors**
   - Network failures
   - Performance issues
   - Browser compatibility

#### Error Boundary Hierarchy
```
App
├── AnalysisErrorBoundary
├── RecommendationErrorBoundary
├── DiagramErrorBoundary
└── DeploymentErrorBoundary
```

### Testing Structure

#### Unit Tests
- **Utils:** Pattern matching algorithms
- **Hooks:** Custom hook logic
- **Components:** Individual component behavior

#### Integration Tests
- **Workflow:** End-to-end user journeys
- **Data Flow:** Context and state management
- **UI Interactions:** Component integration

#### Performance Tests
- **Bundle Size:** Code splitting effectiveness
- **Rendering:** Component performance
- **Analysis Speed:** Pattern matching efficiency

### Documentation Standards

#### Code Documentation
- **JSDoc** comments for all functions
- **PropTypes** or TypeScript for component interfaces
- **README** files for each major directory

#### Specification Documentation
- **User Stories** for each feature
- **Acceptance Criteria** for all requirements
- **Design Decisions** with rationale

### Build and Deployment Structure

#### Build Configuration
- **Development:** Hot reloading, source maps, verbose logging
- **Production:** Minification, optimization, error tracking
- **Testing:** Coverage reports, performance metrics

#### Asset Management
- **Code Splitting:** Route-based and component-based
- **Asset Optimization:** Image compression, icon bundling
- **Caching Strategy:** Static assets and dynamic content

---

*This structure ensures maintainable, scalable development while maximizing collaboration and code quality throughout the hackathon and beyond.* 
-------------------------------------------------------------------------------------> 