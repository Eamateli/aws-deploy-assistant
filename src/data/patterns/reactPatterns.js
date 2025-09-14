/**
 * React-specific pattern matching rules
 * Loaded dynamically when React framework is detected
 */

export const reactPatterns = {
  'react-spa': {
    name: 'React Single Page Application',
    indicators: {
      files: ['package.json', 'src/App.jsx', 'public/index.html'],
      dependencies: ['react', 'react-dom', 'react-scripts'],
      content: ['jsx', 'useState', 'useEffect', 'React.', 'ReactDOM'],
      build: ['npm run build', 'yarn build', 'react-scripts build']
    },
    confidence_weights: {
      files: 0.3,
      dependencies: 0.4,
      content: 0.2,
      build: 0.1
    },
    architecture_recommendations: ['static-spa', 'container-stack'],
    requirements: {
      database: 'optional',
      auth: 'optional',
      realtime: 'optional',
      storage: 'optional'
    }
  },
  'react-ssr': {
    name: 'React Server-Side Rendered Application',
    indicators: {
      files: ['next.config.js', 'pages/', 'app/'],
      dependencies: ['next', 'react', 'react-dom'],
      content: ['getServerSideProps', 'getStaticProps', 'getStaticPaths'],
      build: ['next build', 'npm run build']
    },
    confidence_weights: {
      files: 0.4,
      dependencies: 0.3,
      content: 0.2,
      build: 0.1
    },
    architecture_recommendations: ['container-stack', 'traditional-stack'],
    requirements: {
      database: 'optional',
      auth: 'optional',
      realtime: 'optional',
      storage: 'optional'
    }
  },
  'react-native': {
    name: 'React Native Mobile Application',
    indicators: {
      files: ['metro.config.js', 'android/', 'ios/'],
      dependencies: ['react-native', '@react-native-community'],
      content: ['StyleSheet', 'View', 'Text', 'TouchableOpacity'],
      build: ['react-native run-android', 'react-native run-ios']
    },
    confidence_weights: {
      files: 0.4,
      dependencies: 0.3,
      content: 0.2,
      build: 0.1
    },
    architecture_recommendations: ['serverless-api', 'traditional-stack'],
    requirements: {
      database: 'required',
      auth: 'required',
      realtime: 'optional',
      storage: 'required'
    }
  }
};

export const reactOptimizations = {
  bundling: {
    splitChunks: true,
    lazyLoading: true,
    treeShaking: true
  },
  deployment: {
    staticOptimization: true,
    cdnFriendly: true,
    caching: 'aggressive'
  }
};

export default reactPatterns;