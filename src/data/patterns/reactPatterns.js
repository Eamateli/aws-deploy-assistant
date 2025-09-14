/**
 * React-Specific Pattern Matching Rules
 * Enhanced patterns for React applications
 */

export const patterns = {
  'react-spa': {
    files: ['package.json', 'src/App.jsx', 'src/App.js', 'public/index.html'],
    dependencies: ['react', 'react-dom', 'react-router-dom'],
    content: ['jsx', 'useState', 'useEffect', 'BrowserRouter', 'Routes'],
    buildCommands: ['npm run build', 'yarn build'],
    confidence: 0.9
  },
  'react-ssr': {
    files: ['package.json', 'src/App.jsx', 'server.js', 'next.config.js'],
    dependencies: ['react', 'next', '@next/'],
    content: ['getServerSideProps', 'getStaticProps', 'pages/'],
    confidence: 0.9
  },
  'react-static': {
    files: ['package.json', 'src/App.jsx', 'gatsby-config.js'],
    dependencies: ['react', 'gatsby'],
    content: ['graphql', 'StaticQuery', 'useStaticQuery'],
    confidence: 0.9
  }
};

export const architectureRecommendations = {
  'react-spa': {
    primary: 'static-spa-hosting',
    alternatives: ['serverless-spa', 'cdn-spa']
  },
  'react-ssr': {
    primary: 'serverless-ssr',
    alternatives: ['container-ssr', 'traditional-ssr']
  },
  'react-static': {
    primary: 'static-hosting',
    alternatives: ['cdn-static']
  }
};

export default { patterns, architectureRecommendations };