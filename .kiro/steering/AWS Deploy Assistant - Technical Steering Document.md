<!------------------------------------------------------------------------------------
   Add Rules to this file or a short description and have Kiro refine them for you:   
   # AWS Deploy Assistant - Technical Steering Document

## Architecture Overview

### Technology Stack

**Frontend Framework:** React 18+ with Hooks
- **Styling:** Tailwind CSS (available in Kiro)
- **State Management:** React Context + useReducer pattern
- **Routing:** React Router (if needed for multi-page flow)
- **Icons:** Lucide React (available in Kiro)
- **Diagrams:** React Flow for interactive architecture visualization

### Component Architecture

```
src/
├── components/
│   ├── core/                    # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Layout.jsx
│   │   └── LoadingSpinner.jsx
│   ├── analysis/               # Code analysis features
│   │   ├── CodeUploader.jsx
│   │   ├── PatternDetector.jsx
│   │   └── RequirementsAnalyzer.jsx
│   ├── recommendations/        # AWS service recommendations
│   │   ├── ServiceRecommender.jsx
│   │   ├── ServiceCard.jsx
│   │   └── AlternativeOptions.jsx
│   ├── architecture/           # Architecture visualization
│   │   ├── ArchitectureDiagram.jsx
│   │   ├── AWSServiceNode.jsx
│   │   └── ConnectionFlow.jsx
│   ├── deployment/            # Deployment guidance
│   │   ├── DeploymentGuide.jsx
│   │   ├── StepByStep.jsx
│   │   └── CommandCopier.jsx
│   └── cost/                  # Cost estimation
│       ├── CostCalculator.jsx
│       ├── CostBreakdown.jsx
│       └── OptimizationTips.jsx
├── data/
│   ├── awsPatterns.json       # Pattern matching rules
│   ├── servicePricing.json    # AWS pricing data
│   └── deploymentTemplates.json
├── context/
│   ├── AppContext.jsx         # Global state management
│   └── AnalysisContext.jsx    # Analysis-specific state
├── hooks/
│   ├── usePatternMatching.js  # Custom pattern detection
│   ├── useCostCalculation.js  # Cost estimation logic
│   └── useDeploymentGuide.js  # Guide generation
├── utils/
│   ├── patternMatchers.js     # Core analysis logic
│   ├── costCalculators.js     # Pricing calculations
│   └── templateGenerators.js  # Template creation
└── App.jsx                    # Main application component
```

### Data Models

#### Application Analysis Result
```javascript
{
  id: "analysis_uuid",
  timestamp: "2025-08-17T10:30:00Z",
  input: {
    type: "code_upload" | "description",
    content: "...",
    files: [...]
  },
  detected: {
    framework: "react" | "vue" | "nodejs" | "python" | "unknown",
    appType: "spa" | "ssr" | "api" | "fullstack" | "static",
    database: "required" | "optional" | "none",
    auth: boolean,
    realtime: boolean,
    storage: boolean,
    expectedTraffic: "low" | "medium" | "high",
    complexity: 1-5
  },
  recommendations: {
    primary: ArchitectureRecommendation,
    alternatives: [ArchitectureRecommendation]
  }
}
```

#### Architecture Recommendation
```javascript
{
  id: "arch_uuid",
  name: "Serverless SPA",
  description: "...",
  services: [
    {
      service: "S3",
      purpose: "Static hosting",
      config: {...},
      required: true
    }
  ],
  architecture: {
    type: "serverless" | "traditional" | "containerized",
    complexity: 1-5,
    scalability: 1-5,
    maintainability: 1-5
  },
  cost: {
    monthly: { min: 10, max: 50, typical: 25 },
    traffic_based: true,
    free_tier_eligible: true
  },
  deployment: {
    steps: [DeploymentStep],
    estimated_time: "30 minutes",
    prerequisites: ["AWS CLI", "Node.js"]
  }
}
```

#### AWS Service Configuration
```javascript
{
  service: "S3",
  category: "storage" | "compute" | "database" | "networking" | "security",
  description: "...",
  use_cases: ["static hosting", "file storage"],
  pricing: {
    model: "storage + requests",
    free_tier: "5GB storage, 20k requests",
    typical_cost: "$0.023/GB/month"
  },
  setup_complexity: 1-5,
  learning_curve: 1-5,
  icon: "database" // Lucide icon name
}
```

### Pattern Matching Engine

#### Core Pattern Detection Logic
```javascript
// Framework Detection
const detectFramework = (codeContent, fileList) => {
  const patterns = {
    react: {
      files: ['package.json', 'src/App.jsx', 'public/index.html'],
      content: ['react', 'jsx', 'useState', 'useEffect']
    },
    vue: {
      files: ['package.json', 'src/App.vue'],
      content: ['vue', '.vue', 'v-if', 'v-for']
    },
    nodejs: {
      files: ['package.json', 'server.js', 'app.js'],
      content: ['express', 'app.listen', 'require(']
    },
    python: {
      files: ['requirements.txt', 'app.py', 'main.py'],
      content: ['flask', 'django', 'fastapi', 'def ']
    }
  };
  
  // Scoring algorithm implementation
  return calculatePatternScores(patterns, codeContent, fileList);
};

// Architecture Pattern Matching
const matchArchitecturePattern = (analysisResult) => {
  const patterns = {
    'static-spa': {
      conditions: {
        framework: ['react', 'vue', 'angular'],
        appType: 'spa',
        database: 'none',
        api_calls: 'external'
      },
      services: ['S3', 'CloudFront', 'Route53'],
      cost_range: [5, 20]
    },
    'fullstack-traditional': {
      conditions: {
        framework: ['nodejs', 'python'],
        database: 'required',
        auth: true
      },
      services: ['EC2', 'ALB', 'RDS', 'S3'],
      cost_range: [50, 200]
    },
    'serverless-api': {
      conditions: {
        appType: 'api',
        database: 'optional',
        realtime: false
      },
      services: ['Lambda', 'API Gateway', 'DynamoDB'],
      cost_range: [10, 100]
    }
  };
  
  return findBestMatch(patterns, analysisResult);
};
```

### State Management Strategy

#### Global App Context
```javascript
const AppContext = createContext();

const initialState = {
  currentStep: 'upload', // upload -> analysis -> recommendations -> deployment
  analysis: null,
  selectedRecommendation: null,
  deploymentGuide: null,
  costEstimate: null,
  preferences: {
    experience_level: 'beginner',
    cost_priority: 'medium',
    complexity_tolerance: 'low'
  }
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ANALYSIS_RESULT':
      return { ...state, analysis: action.payload, currentStep: 'recommendations' };
    case 'SELECT_RECOMMENDATION':
      return { ...state, selectedRecommendation: action.payload, currentStep: 'deployment' };
    case 'GENERATE_DEPLOYMENT_GUIDE':
      return { ...state, deploymentGuide: action.payload };
    default:
      return state;
  }
};
```

### Performance Considerations

#### Optimization Strategies
1. **Code Splitting:** Use React.lazy() for heavy components
2. **Memoization:** useMemo for expensive calculations
3. **Virtual Scrolling:** For large service lists
4. **Debounced Analysis:** Prevent excessive re-analysis
5. **Cached Patterns:** Store common patterns in localStorage

#### Bundle Size Management
- Tree-shake unused AWS service data
- Lazy load deployment templates
- Compress pattern matching rules
- Use dynamic imports for diagram components

### Error Handling & Validation

#### Robust Error Boundaries
```javascript
class AnalysisErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorType: null };
  }

  static getDerivedStateFromError(error) {
    if (error.name === 'PatternMatchingError') {
      return { hasError: true, errorType: 'pattern_matching' };
    }
    return { hasError: true, errorType: 'unknown' };
  }

  render() {
    if (this.state.hasError) {
      return <AnalysisErrorFallback errorType={this.state.errorType} />;
    }
    return this.props.children;
  }
}
```

#### Input Validation
- File type validation (package.json, source files)
- Code content sanitization
- Reasonable file size limits
- Pattern confidence thresholds

### Integration Points

#### React Flow Configuration
```javascript
const nodeTypes = {
  aws_service: AWSServiceNode,
  data_flow: DataFlowNode,
  external_service: ExternalServiceNode
};

const edgeTypes = {
  data_connection: DataConnectionEdge,
  api_call: APICallEdge,
  dependency: DependencyEdge
};
```

#### Kiro Hooks Integration
```javascript
// .kiro/hooks/update-patterns.js
module.exports = {
  onSpecUpdate: (spec) => {
    if (spec.name.includes('pattern')) {
      updatePatternDatabase(spec.content);
    }
  },
  onTaskComplete: (task) => {
    generateUsageMetrics(task);
  }
};
```

### Testing Strategy

#### Unit Testing Focus Areas
- Pattern matching accuracy
- Cost calculation precision
- Template generation correctness
- State management reliability

#### Integration Testing
- End-to-end analysis workflow
- Architecture diagram rendering
- Deployment guide generation
- Cross-browser compatibility

### Deployment & Production Considerations

#### Environment Configuration
```javascript
const config = {
  development: {
    pattern_confidence_threshold: 0.6,
    cost_buffer_percentage: 20,
    debug_mode: true
  },
  production: {
    pattern_confidence_threshold: 0.8,
    cost_buffer_percentage: 30,
    debug_mode: false
  }
};
```

#### Performance Monitoring
- Pattern matching execution time
- Diagram rendering performance
- User interaction analytics
- Error occurrence rates

---

*This technical architecture ensures scalable, maintainable, and performant development while maximizing the capabilities of the Kiro platform.*
-------------------------------------------------------------------------------------> 