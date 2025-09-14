// File analysis utilities for code pattern detection

/**
 * FileTypeDetector - Detects file types and categories
 */
export class FileTypeDetector {
  constructor() {
    this.fileTypes = {
      // Frontend files
      frontend: {
        javascript: ['.js', '.jsx', '.mjs', '.cjs'],
        typescript: ['.ts', '.tsx'],
        vue: ['.vue'],
        styles: ['.css', '.scss', '.sass', '.less', '.styl'],
        html: ['.html', '.htm'],
        templates: ['.hbs', '.ejs', '.pug', '.jade']
      },
      
      // Backend files
      backend: {
        nodejs: ['.js', '.mjs', '.cjs', '.ts'],
        python: ['.py', '.pyw', '.pyi'],
        php: ['.php', '.phtml'],
        ruby: ['.rb', '.rbw'],
        go: ['.go'],
        rust: ['.rs'],
        java: ['.java'],
        csharp: ['.cs']
      },
      
      // Configuration files
      config: {
        package: ['package.json', 'package-lock.json', 'yarn.lock'],
        build: ['webpack.config.js', 'vite.config.js', 'rollup.config.js', 'gulpfile.js'],
        env: ['.env', '.env.local', '.env.production', '.env.development'],
        docker: ['Dockerfile', 'docker-compose.yml', 'docker-compose.yaml'],
        ci: ['.github/workflows/', '.gitlab-ci.yml', '.travis.yml', 'Jenkinsfile'],
        framework: ['next.config.js', 'nuxt.config.js', 'vue.config.js', 'angular.json']
      },
      
      // Data files
      data: {
        json: ['.json'],
        yaml: ['.yml', '.yaml'],
        xml: ['.xml'],
        csv: ['.csv'],
        sql: ['.sql']
      },
      
      // Documentation
      docs: {
        markdown: ['.md', '.markdown'],
        text: ['.txt', '.rst'],
        readme: ['README.md', 'README.txt', 'README']
      }
    };
  }

  /**
   * Detect file type and category
   */
  detectFileType(fileName) {
    const normalizedName = fileName.toLowerCase();
    
    for (const [category, types] of Object.entries(this.fileTypes)) {
      for (const [type, extensions] of Object.entries(types)) {
        // Check exact filename matches
        if (extensions.includes(normalizedName)) {
          return { category, type, extension: normalizedName };
        }
        
        // Check extension matches
        for (const ext of extensions) {
          if (ext.startsWith('.') && normalizedName.endsWith(ext)) {
            return { category, type, extension: ext };
          }
          
          // Check directory patterns
          if (ext.endsWith('/') && normalizedName.includes(ext)) {
            return { category, type, extension: ext };
          }
        }
      }
    }
    
    return { category: 'unknown', type: 'unknown', extension: this.getFileExtension(fileName) };
  }

  /**
   * Get file extension
   */
  getFileExtension(fileName) {
    const lastDot = fileName.lastIndexOf('.');
    return lastDot > 0 ? fileName.substring(lastDot) : '';
  }

  /**
   * Check if file is a source code file
   */
  isSourceFile(fileName) {
    const { category } = this.detectFileType(fileName);
    return ['frontend', 'backend'].includes(category);
  }

  /**
   * Check if file is a configuration file
   */
  isConfigFile(fileName) {
    const { category } = this.detectFileType(fileName);
    return category === 'config';
  }

  /**
   * Categorize multiple files
   */
  categorizeFiles(files) {
    const categories = {
      frontend: [],
      backend: [],
      config: [],
      data: [],
      docs: [],
      unknown: []
    };

    for (const file of files) {
      const fileName = file.name || file;
      const { category } = this.detectFileType(fileName);
      
      if (categories[category]) {
        categories[category].push(file);
      } else {
        categories.unknown.push(file);
      }
    }

    return categories;
  }
}

/**
 * ContentParser - Parses and analyzes file content
 */
export class ContentParser {
  constructor() {
    this.parsers = {
      json: this.parseJSON.bind(this),
      javascript: this.parseJavaScript.bind(this),
      typescript: this.parseTypeScript.bind(this),
      python: this.parsePython.bind(this),
      html: this.parseHTML.bind(this),
      css: this.parseCSS.bind(this),
      yaml: this.parseYAML.bind(this),
      dockerfile: this.parseDockerfile.bind(this)
    };
  }

  /**
   * Parse file content based on type
   */
  parseContent(content, fileType) {
    const parser = this.parsers[fileType] || this.parseGeneric.bind(this);
    
    try {
      return parser(content);
    } catch (error) {
      return {
        success: false,
        error: error.message,
        content: content,
        metadata: {}
      };
    }
  }

  /**
   * Parse JSON files
   */
  parseJSON(content) {
    const parsed = JSON.parse(content);
    return {
      success: true,
      parsed: parsed,
      metadata: {
        keys: Object.keys(parsed),
        hasScripts: Boolean(parsed.scripts),
        hasDependencies: Boolean(parsed.dependencies || parsed.devDependencies)
      }
    };
  }

  /**
   * Parse JavaScript/TypeScript files
   */
  parseJavaScript(content) {
    const imports = this.extractImports(content);
    const exports = this.extractExports(content);
    const functions = this.extractFunctions(content);
    const classes = this.extractClasses(content);
    
    return {
      success: true,
      content: content,
      metadata: {
        imports: imports,
        exports: exports,
        functions: functions,
        classes: classes,
        hasJSX: /jsx?/i.test(content) || /<[A-Z]/.test(content),
        hasHooks: /use[A-Z]\w*/.test(content),
        hasAsync: /async|await/.test(content)
      }
    };
  }

  parseTypeScript(content) {
    const jsResult = this.parseJavaScript(content);
    
    return {
      ...jsResult,
      metadata: {
        ...jsResult.metadata,
        hasTypes: /:\s*\w+/.test(content),
        hasInterfaces: /interface\s+\w+/.test(content),
        hasGenerics: /<[A-Z]\w*>/.test(content)
      }
    };
  }

  /**
   * Parse Python files
   */
  parsePython(content) {
    const imports = this.extractPythonImports(content);
    const functions = this.extractPythonFunctions(content);
    const classes = this.extractPythonClasses(content);
    
    return {
      success: true,
      content: content,
      metadata: {
        imports: imports,
        functions: functions,
        classes: classes,
        hasFlask: /from\s+flask|import\s+flask/i.test(content),
        hasDjango: /from\s+django|import\s+django/i.test(content),
        hasFastAPI: /from\s+fastapi|import\s+fastapi/i.test(content),
        hasDecorators: /@\w+/.test(content)
      }
    };
  }

  /**
   * Parse HTML files
   */
  parseHTML(content) {
    const scripts = this.extractHTMLScripts(content);
    const links = this.extractHTMLLinks(content);
    const meta = this.extractHTMLMeta(content);
    
    return {
      success: true,
      content: content,
      metadata: {
        scripts: scripts,
        links: links,
        meta: meta,
        hasReactRoot: /id=['"]root['"]/.test(content),
        hasVueApp: /id=['"]app['"]/.test(content),
        title: this.extractHTMLTitle(content)
      }
    };
  }

  /**
   * Parse CSS files
   */
  parseCSS(content) {
    const classes = this.extractCSSClasses(content);
    const ids = this.extractCSSIds(content);
    
    return {
      success: true,
      content: content,
      metadata: {
        classes: classes,
        ids: ids,
        hasTailwind: /tailwind|@apply/.test(content),
        hasBootstrap: /bootstrap|btn-|col-/.test(content),
        hasVariables: /--\w+|var\(/.test(content)
      }
    };
  }

  /**
   * Parse YAML files
   */
  parseYAML(content) {
    // Simple YAML parsing - in production, use a proper YAML parser
    const lines = content.split('\n');
    const keys = lines
      .filter(line => line.includes(':') && !line.trim().startsWith('#'))
      .map(line => line.split(':')[0].trim());
    
    return {
      success: true,
      content: content,
      metadata: {
        keys: keys,
        hasServices: keys.includes('services'),
        hasVersion: keys.includes('version'),
        hasEnvironment: keys.includes('environment')
      }
    };
  }

  /**
   * Parse Dockerfile
   */
  parseDockerfile(content) {
    const instructions = content
      .split('\n')
      .filter(line => line.trim() && !line.trim().startsWith('#'))
      .map(line => line.split(' ')[0].toUpperCase());
    
    return {
      success: true,
      content: content,
      metadata: {
        instructions: instructions,
        baseImage: this.extractDockerBaseImage(content),
        hasNode: /node|npm|yarn/.test(content.toLowerCase()),
        hasPython: /python|pip/.test(content.toLowerCase()),
        exposedPorts: this.extractDockerPorts(content)
      }
    };
  }

  /**
   * Generic parser for unknown file types
   */
  parseGeneric(content) {
    return {
      success: true,
      content: content,
      metadata: {
        lineCount: content.split('\n').length,
        charCount: content.length,
        hasCode: /function|class|def|const|let|var/.test(content)
      }
    };
  }

  // Helper methods for extraction
  extractImports(content) {
    const importRegex = /import\s+.*?from\s+['"`]([^'"`]+)['"`]/g;
    const matches = [];
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      matches.push(match[1]);
    }
    
    return matches;
  }

  extractExports(content) {
    const exportRegex = /export\s+(?:default\s+)?(?:class|function|const|let|var)\s+(\w+)/g;
    const matches = [];
    let match;
    
    while ((match = exportRegex.exec(content)) !== null) {
      matches.push(match[1]);
    }
    
    return matches;
  }

  extractFunctions(content) {
    const functionRegex = /(?:function\s+(\w+)|const\s+(\w+)\s*=.*?=>|(\w+)\s*:\s*(?:async\s+)?function)/g;
    const matches = [];
    let match;
    
    while ((match = functionRegex.exec(content)) !== null) {
      matches.push(match[1] || match[2] || match[3]);
    }
    
    return matches.filter(Boolean);
  }

  extractClasses(content) {
    const classRegex = /class\s+(\w+)/g;
    const matches = [];
    let match;
    
    while ((match = classRegex.exec(content)) !== null) {
      matches.push(match[1]);
    }
    
    return matches;
  }

  extractPythonImports(content) {
    const importRegex = /(?:from\s+(\S+)\s+import|import\s+(\S+))/g;
    const matches = [];
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      matches.push(match[1] || match[2]);
    }
    
    return matches;
  }

  extractPythonFunctions(content) {
    const functionRegex = /def\s+(\w+)/g;
    const matches = [];
    let match;
    
    while ((match = functionRegex.exec(content)) !== null) {
      matches.push(match[1]);
    }
    
    return matches;
  }

  extractPythonClasses(content) {
    const classRegex = /class\s+(\w+)/g;
    const matches = [];
    let match;
    
    while ((match = classRegex.exec(content)) !== null) {
      matches.push(match[1]);
    }
    
    return matches;
  }

  extractHTMLScripts(content) {
    const scriptRegex = /<script[^>]*src=['"`]([^'"`]+)['"`]/g;
    const matches = [];
    let match;
    
    while ((match = scriptRegex.exec(content)) !== null) {
      matches.push(match[1]);
    }
    
    return matches;
  }

  extractHTMLLinks(content) {
    const linkRegex = /<link[^>]*href=['"`]([^'"`]+)['"`]/g;
    const matches = [];
    let match;
    
    while ((match = linkRegex.exec(content)) !== null) {
      matches.push(match[1]);
    }
    
    return matches;
  }

  extractHTMLMeta(content) {
    const metaRegex = /<meta[^>]*name=['"`]([^'"`]+)['"`][^>]*content=['"`]([^'"`]+)['"`]/g;
    const matches = {};
    let match;
    
    while ((match = metaRegex.exec(content)) !== null) {
      matches[match[1]] = match[2];
    }
    
    return matches;
  }

  extractHTMLTitle(content) {
    const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
    return titleMatch ? titleMatch[1] : null;
  }

  extractCSSClasses(content) {
    const classRegex = /\.([a-zA-Z][\w-]*)/g;
    const matches = [];
    let match;
    
    while ((match = classRegex.exec(content)) !== null) {
      matches.push(match[1]);
    }
    
    return [...new Set(matches)]; // Remove duplicates
  }

  extractCSSIds(content) {
    const idRegex = /#([a-zA-Z][\w-]*)/g;
    const matches = [];
    let match;
    
    while ((match = idRegex.exec(content)) !== null) {
      matches.push(match[1]);
    }
    
    return [...new Set(matches)]; // Remove duplicates
  }

  extractDockerBaseImage(content) {
    const fromMatch = content.match(/FROM\s+([^\s\n]+)/i);
    return fromMatch ? fromMatch[1] : null;
  }

  extractDockerPorts(content) {
    const exposeRegex = /EXPOSE\s+(\d+)/gi;
    const matches = [];
    let match;
    
    while ((match = exposeRegex.exec(content)) !== null) {
      matches.push(parseInt(match[1]));
    }
    
    return matches;
  }
}

/**
 * PackageAnalyzer - Specialized analyzer for package.json files
 */
export class PackageAnalyzer {
  constructor() {
    this.frameworkIndicators = {
      react: ['react', 'react-dom', 'react-scripts', '@types/react'],
      vue: ['vue', '@vue/cli', 'nuxt', 'vue-router'],
      angular: ['@angular/core', '@angular/cli', 'angular'],
      svelte: ['svelte', '@sveltejs/kit'],
      next: ['next'],
      gatsby: ['gatsby'],
      nuxt: ['nuxt']
    };

    this.toolIndicators = {
      typescript: ['typescript', '@types/node'],
      webpack: ['webpack', 'webpack-cli'],
      vite: ['vite'],
      rollup: ['rollup'],
      babel: ['@babel/core', '@babel/preset-env'],
      eslint: ['eslint'],
      prettier: ['prettier'],
      jest: ['jest'],
      cypress: ['cypress'],
      storybook: ['@storybook/react']
    };

    this.backendIndicators = {
      express: ['express'],
      fastify: ['fastify'],
      koa: ['koa'],
      nestjs: ['@nestjs/core'],
      socket: ['socket.io'],
      database: ['mongoose', 'sequelize', 'typeorm', 'prisma']
    };
  }

  /**
   * Analyze package.json content
   */
  analyzePackage(packageContent) {
    try {
      const pkg = typeof packageContent === 'string' 
        ? JSON.parse(packageContent) 
        : packageContent;

      const analysis = {
        name: pkg.name,
        version: pkg.version,
        type: pkg.type || 'commonjs',
        frameworks: this.detectFrameworks(pkg),
        tools: this.detectTools(pkg),
        backend: this.detectBackendLibs(pkg),
        scripts: this.analyzeScripts(pkg.scripts || {}),
        dependencies: this.analyzeDependencies(pkg),
        metadata: {
          hasWorkspaces: Boolean(pkg.workspaces),
          isPrivate: Boolean(pkg.private),
          hasEngines: Boolean(pkg.engines),
          nodeVersion: pkg.engines?.node
        }
      };

      return {
        success: true,
        analysis: analysis,
        confidence: this.calculatePackageConfidence(analysis)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        analysis: null
      };
    }
  }

  /**
   * Detect frameworks from dependencies
   */
  detectFrameworks(pkg) {
    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
      ...pkg.peerDependencies
    };

    const detected = {};
    
    for (const [framework, indicators] of Object.entries(this.frameworkIndicators)) {
      const matches = indicators.filter(dep => allDeps[dep]);
      if (matches.length > 0) {
        detected[framework] = {
          confidence: matches.length / indicators.length,
          dependencies: matches
        };
      }
    }

    return detected;
  }

  /**
   * Detect development tools
   */
  detectTools(pkg) {
    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies
    };

    const detected = {};
    
    for (const [tool, indicators] of Object.entries(this.toolIndicators)) {
      const matches = indicators.filter(dep => allDeps[dep]);
      if (matches.length > 0) {
        detected[tool] = {
          confidence: matches.length / indicators.length,
          dependencies: matches
        };
      }
    }

    return detected;
  }

  /**
   * Detect backend libraries
   */
  detectBackendLibs(pkg) {
    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies
    };

    const detected = {};
    
    for (const [category, indicators] of Object.entries(this.backendIndicators)) {
      const matches = indicators.filter(dep => allDeps[dep]);
      if (matches.length > 0) {
        detected[category] = {
          confidence: matches.length / indicators.length,
          dependencies: matches
        };
      }
    }

    return detected;
  }

  /**
   * Analyze npm scripts
   */
  analyzeScripts(scripts) {
    const analysis = {
      build: this.findBuildScript(scripts),
      start: this.findStartScript(scripts),
      dev: this.findDevScript(scripts),
      test: this.findTestScript(scripts),
      lint: this.findLintScript(scripts),
      deploy: this.findDeployScript(scripts),
      custom: this.findCustomScripts(scripts)
    };

    return {
      ...analysis,
      hasCI: Boolean(analysis.test || analysis.lint),
      hasBuild: Boolean(analysis.build),
      buildTool: this.detectBuildTool(scripts)
    };
  }

  /**
   * Analyze dependencies structure
   */
  analyzeDependencies(pkg) {
    const deps = pkg.dependencies || {};
    const devDeps = pkg.devDependencies || {};
    
    return {
      production: Object.keys(deps).length,
      development: Object.keys(devDeps).length,
      total: Object.keys(deps).length + Object.keys(devDeps).length,
      hasLockFile: Boolean(pkg.lockfileVersion),
      packageManager: this.detectPackageManager(pkg)
    };
  }

  /**
   * Calculate overall confidence score
   */
  calculatePackageConfidence(analysis) {
    let score = 0;
    let factors = 0;

    // Framework detection confidence
    const frameworkCount = Object.keys(analysis.frameworks).length;
    if (frameworkCount > 0) {
      const avgConfidence = Object.values(analysis.frameworks)
        .reduce((sum, fw) => sum + fw.confidence, 0) / frameworkCount;
      score += avgConfidence * 0.4;
      factors += 0.4;
    }

    // Scripts analysis
    if (analysis.scripts.hasBuild) {
      score += 0.2;
      factors += 0.2;
    }

    // Dependencies count
    if (analysis.dependencies.total > 0) {
      score += Math.min(analysis.dependencies.total / 20, 1) * 0.2;
      factors += 0.2;
    }

    // Tools detection
    const toolCount = Object.keys(analysis.tools).length;
    if (toolCount > 0) {
      score += Math.min(toolCount / 5, 1) * 0.2;
      factors += 0.2;
    }

    return factors > 0 ? score / factors : 0;
  }

  // Helper methods for script detection
  findBuildScript(scripts) {
    const buildKeys = ['build', 'compile', 'bundle'];
    for (const key of buildKeys) {
      if (scripts[key]) return { command: scripts[key], key };
    }
    return null;
  }

  findStartScript(scripts) {
    return scripts.start ? { command: scripts.start, key: 'start' } : null;
  }

  findDevScript(scripts) {
    const devKeys = ['dev', 'develop', 'serve'];
    for (const key of devKeys) {
      if (scripts[key]) return { command: scripts[key], key };
    }
    return null;
  }

  findTestScript(scripts) {
    const testKeys = ['test', 'test:unit', 'test:e2e'];
    for (const key of testKeys) {
      if (scripts[key]) return { command: scripts[key], key };
    }
    return null;
  }

  findLintScript(scripts) {
    const lintKeys = ['lint', 'eslint', 'check'];
    for (const key of lintKeys) {
      if (scripts[key]) return { command: scripts[key], key };
    }
    return null;
  }

  findDeployScript(scripts) {
    const deployKeys = ['deploy', 'publish', 'release'];
    for (const key of deployKeys) {
      if (scripts[key]) return { command: scripts[key], key };
    }
    return null;
  }

  findCustomScripts(scripts) {
    const standardKeys = ['start', 'build', 'test', 'dev', 'lint', 'deploy'];
    return Object.keys(scripts)
      .filter(key => !standardKeys.includes(key))
      .map(key => ({ command: scripts[key], key }));
  }

  detectBuildTool(scripts) {
    const allScripts = Object.values(scripts).join(' ');
    
    if (allScripts.includes('webpack')) return 'webpack';
    if (allScripts.includes('vite')) return 'vite';
    if (allScripts.includes('rollup')) return 'rollup';
    if (allScripts.includes('parcel')) return 'parcel';
    if (allScripts.includes('react-scripts')) return 'create-react-app';
    if (allScripts.includes('next')) return 'next';
    if (allScripts.includes('nuxt')) return 'nuxt';
    
    return 'unknown';
  }

  detectPackageManager(pkg) {
    if (pkg.packageManager) return pkg.packageManager.split('@')[0];
    if (pkg.lockfileVersion) return 'npm';
    return 'unknown';
  }
}

/**
 * ConfigAnalyzer - Analyzes configuration files
 */
export class ConfigAnalyzer {
  constructor() {
    this.configTypes = {
      'docker-compose.yml': this.analyzeDockerCompose.bind(this),
      'docker-compose.yaml': this.analyzeDockerCompose.bind(this),
      'Dockerfile': this.analyzeDockerfile.bind(this),
      '.env': this.analyzeEnvFile.bind(this),
      'webpack.config.js': this.analyzeWebpackConfig.bind(this),
      'vite.config.js': this.analyzeViteConfig.bind(this),
      'next.config.js': this.analyzeNextConfig.bind(this),
      'nuxt.config.js': this.analyzeNuxtConfig.bind(this)
    };
  }

  /**
   * Analyze configuration file
   */
  analyzeConfig(fileName, content) {
    const normalizedName = fileName.toLowerCase();
    
    // Find matching analyzer
    for (const [configName, analyzer] of Object.entries(this.configTypes)) {
      if (normalizedName.includes(configName.toLowerCase())) {
        return analyzer(content, fileName);
      }
    }

    return this.analyzeGenericConfig(content, fileName);
  }

  /**
   * Analyze Docker Compose file
   */
  analyzeDockerCompose(content) {
    const services = this.extractYAMLServices(content);
    const volumes = this.extractYAMLVolumes(content);
    const networks = this.extractYAMLNetworks(content);
    
    return {
      type: 'docker-compose',
      services: services,
      volumes: volumes,
      networks: networks,
      hasDatabase: services.some(s => 
        s.includes('postgres') || s.includes('mysql') || s.includes('mongo')
      ),
      hasRedis: services.some(s => s.includes('redis')),
      complexity: services.length + volumes.length + networks.length
    };
  }

  /**
   * Analyze Dockerfile
   */
  analyzeDockerfile(content) {
    const baseImage = this.extractDockerBaseImage(content);
    const ports = this.extractDockerPorts(content);
    const instructions = this.extractDockerInstructions(content);
    
    return {
      type: 'dockerfile',
      baseImage: baseImage,
      ports: ports,
      instructions: instructions,
      runtime: this.detectDockerRuntime(baseImage),
      isMultiStage: content.includes('FROM') && content.split('FROM').length > 2
    };
  }

  /**
   * Analyze environment file
   */
  analyzeEnvFile(content) {
    const variables = this.extractEnvVariables(content);
    
    return {
      type: 'environment',
      variables: variables,
      hasDatabase: variables.some(v => 
        v.includes('DB_') || v.includes('DATABASE_')
      ),
      hasAuth: variables.some(v => 
        v.includes('JWT_') || v.includes('AUTH_') || v.includes('SECRET')
      ),
      hasAWS: variables.some(v => 
        v.includes('AWS_') || v.includes('S3_')
      )
    };
  }

  /**
   * Analyze Webpack config
   */
  analyzeWebpackConfig(content) {
    return {
      type: 'webpack',
      hasDevServer: content.includes('devServer'),
      hasHMR: content.includes('hot') || content.includes('HotModuleReplacement'),
      hasOptimization: content.includes('optimization'),
      plugins: this.extractWebpackPlugins(content),
      loaders: this.extractWebpackLoaders(content)
    };
  }

  /**
   * Analyze Vite config
   */
  analyzeViteConfig(content) {
    return {
      type: 'vite',
      hasReact: content.includes('@vitejs/plugin-react'),
      hasVue: content.includes('@vitejs/plugin-vue'),
      hasTypeScript: content.includes('typescript'),
      plugins: this.extractVitePlugins(content),
      hasProxy: content.includes('proxy')
    };
  }

  /**
   * Analyze Next.js config
   */
  analyzeNextConfig(content) {
    return {
      type: 'next',
      hasImages: content.includes('images'),
      hasRewrites: content.includes('rewrites'),
      hasRedirects: content.includes('redirects'),
      hasAPI: content.includes('api'),
      isStatic: content.includes('output') && content.includes('export')
    };
  }

  /**
   * Analyze Nuxt config
   */
  analyzeNuxtConfig(content) {
    return {
      type: 'nuxt',
      hasSSR: !content.includes('ssr: false'),
      hasModules: content.includes('modules'),
      hasPlugins: content.includes('plugins'),
      hasMiddleware: content.includes('middleware')
    };
  }

  /**
   * Generic config analyzer
   */
  analyzeGenericConfig(content, fileName) {
    return {
      type: 'generic',
      fileName: fileName,
      isJSON: this.isValidJSON(content),
      isYAML: this.looksLikeYAML(content),
      lineCount: content.split('\n').length,
      hasComments: content.includes('#') || content.includes('//')
    };
  }

  // Helper methods
  extractYAMLServices(content) {
    const serviceMatch = content.match(/services:\s*\n([\s\S]*?)(?=\n\w|\n$|$)/);
    if (!serviceMatch) return [];
    
    const servicesSection = serviceMatch[1];
    const serviceNames = servicesSection.match(/^\s*(\w+):/gm);
    
    return serviceNames ? serviceNames.map(s => s.trim().replace(':', '')) : [];
  }

  extractYAMLVolumes(content) {
    const volumeMatch = content.match(/volumes:\s*\n([\s\S]*?)(?=\n\w|\n$|$)/);
    if (!volumeMatch) return [];
    
    const volumesSection = volumeMatch[1];
    const volumeNames = volumesSection.match(/^\s*(\w+):/gm);
    
    return volumeNames ? volumeNames.map(v => v.trim().replace(':', '')) : [];
  }

  extractYAMLNetworks(content) {
    const networkMatch = content.match(/networks:\s*\n([\s\S]*?)(?=\n\w|\n$|$)/);
    if (!networkMatch) return [];
    
    const networksSection = networkMatch[1];
    const networkNames = networksSection.match(/^\s*(\w+):/gm);
    
    return networkNames ? networkNames.map(n => n.trim().replace(':', '')) : [];
  }

  extractDockerBaseImage(content) {
    const fromMatch = content.match(/FROM\s+([^\s\n]+)/i);
    return fromMatch ? fromMatch[1] : null;
  }

  extractDockerPorts(content) {
    const exposeRegex = /EXPOSE\s+(\d+)/gi;
    const matches = [];
    let match;
    
    while ((match = exposeRegex.exec(content)) !== null) {
      matches.push(parseInt(match[1]));
    }
    
    return matches;
  }

  extractDockerInstructions(content) {
    return content
      .split('\n')
      .filter(line => line.trim() && !line.trim().startsWith('#'))
      .map(line => line.split(' ')[0].toUpperCase())
      .filter((instruction, index, arr) => arr.indexOf(instruction) === index);
  }

  detectDockerRuntime(baseImage) {
    if (!baseImage) return 'unknown';
    
    const image = baseImage.toLowerCase();
    if (image.includes('node')) return 'node';
    if (image.includes('python')) return 'python';
    if (image.includes('nginx')) return 'nginx';
    if (image.includes('apache')) return 'apache';
    if (image.includes('php')) return 'php';
    if (image.includes('java')) return 'java';
    if (image.includes('golang') || image.includes('go:')) return 'go';
    
    return 'unknown';
  }

  extractEnvVariables(content) {
    return content
      .split('\n')
      .filter(line => line.trim() && !line.trim().startsWith('#') && line.includes('='))
      .map(line => line.split('=')[0].trim());
  }

  extractWebpackPlugins(content) {
    const pluginMatches = content.match(/new\s+(\w+Plugin)/g);
    return pluginMatches ? pluginMatches.map(p => p.replace('new ', '')) : [];
  }

  extractWebpackLoaders(content) {
    const loaderMatches = content.match(/['"`][\w-]+-loader['"`]/g);
    return loaderMatches ? loaderMatches.map(l => l.replace(/['"`]/g, '')) : [];
  }

  extractVitePlugins(content) {
    const pluginMatches = content.match(/(\w+)\(\)/g);
    return pluginMatches ? pluginMatches.map(p => p.replace('()', '')) : [];
  }

  isValidJSON(content) {
    try {
      JSON.parse(content);
      return true;
    } catch {
      return false;
    }
  }

  looksLikeYAML(content) {
    return content.includes(':') && 
           (content.includes('  ') || content.includes('\t')) &&
           !content.includes('{') && 
           !content.includes('[');
  }
}

/**
 * Main FileAnalyzer - Coordinates all file analysis utilities
 */
export class FileAnalyzer {
  constructor() {
    this.fileTypeDetector = new FileTypeDetector();
    this.contentParser = new ContentParser();
    this.packageAnalyzer = new PackageAnalyzer();
    this.configAnalyzer = new ConfigAnalyzer();
  }

  /**
   * Perform comprehensive file analysis
   */
  analyzeFiles(files) {
    const results = {
      summary: {
        totalFiles: files.length,
        categories: {},
        confidence: 0
      },
      files: [],
      packageJson: null,
      configs: [],
      patterns: {
        frameworks: {},
        tools: {},
        infrastructure: {}
      }
    };

    // Categorize files
    const categories = this.fileTypeDetector.categorizeFiles(files);
    results.summary.categories = Object.fromEntries(
      Object.entries(categories).map(([cat, fileList]) => [cat, fileList.length])
    );

    // Analyze each file
    for (const file of files) {
      const fileName = file.name || file;
      const content = file.content || '';
      
      const fileType = this.fileTypeDetector.detectFileType(fileName);
      const analysis = {
        name: fileName,
        type: fileType,
        size: content.length,
        analysis: null
      };

      // Special handling for package.json
      if (fileName === 'package.json') {
        const packageResult = this.packageAnalyzer.analyzePackage(content);
        results.packageJson = packageResult;
        analysis.analysis = packageResult;
      }
      // Configuration files
      else if (fileType.category === 'config') {
        const configResult = this.configAnalyzer.analyzeConfig(fileName, content);
        results.configs.push(configResult);
        analysis.analysis = configResult;
      }
      // Source code files
      else if (this.fileTypeDetector.isSourceFile(fileName)) {
        const contentResult = this.contentParser.parseContent(content, fileType.type);
        analysis.analysis = contentResult;
      }

      results.files.push(analysis);
    }

    // Extract patterns from analysis
    this.extractPatterns(results);
    
    // Calculate overall confidence
    results.summary.confidence = this.calculateAnalysisConfidence(results);

    return results;
  }

  /**
   * Extract technology patterns from file analysis
   */
  extractPatterns(results) {
    // Extract from package.json
    if (results.packageJson?.success) {
      const pkg = results.packageJson.analysis;
      results.patterns.frameworks = pkg.frameworks;
      results.patterns.tools = pkg.tools;
    }

    // Extract from config files
    for (const config of results.configs) {
      if (config.type === 'docker-compose') {
        results.patterns.infrastructure.containerization = {
          type: 'docker-compose',
          services: config.services,
          confidence: 0.9
        };
      }
      
      if (config.hasDatabase) {
        results.patterns.infrastructure.database = {
          detected: true,
          confidence: 0.8
        };
      }
    }

    // Extract from source files
    const sourceFiles = results.files.filter(f => 
      f.analysis?.success && f.type.category === 'frontend'
    );

    for (const file of sourceFiles) {
      const metadata = file.analysis.metadata;
      
      if (metadata?.hasJSX) {
        results.patterns.frameworks.react = {
          confidence: 0.7,
          source: 'jsx-detection'
        };
      }
      
      if (metadata?.hasHooks) {
        results.patterns.frameworks.react = {
          ...results.patterns.frameworks.react,
          confidence: Math.max(results.patterns.frameworks.react?.confidence || 0, 0.8),
          hooks: true
        };
      }
    }
  }

  /**
   * Calculate overall analysis confidence
   */
  calculateAnalysisConfidence(results) {
    let totalConfidence = 0;
    let factors = 0;

    // Package.json confidence
    if (results.packageJson?.success) {
      totalConfidence += results.packageJson.confidence * 0.4;
      factors += 0.4;
    }

    // Config files confidence
    if (results.configs.length > 0) {
      totalConfidence += Math.min(results.configs.length / 3, 1) * 0.3;
      factors += 0.3;
    }

    // Source files confidence
    const sourceFileCount = results.files.filter(f => 
      f.type.category === 'frontend' || f.type.category === 'backend'
    ).length;
    
    if (sourceFileCount > 0) {
      totalConfidence += Math.min(sourceFileCount / 10, 1) * 0.3;
      factors += 0.3;
    }

    return factors > 0 ? totalConfidence / factors : 0;
  }
}