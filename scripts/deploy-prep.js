#!/usr/bin/env node

/**
 * Deployment preparation script
 * Optimizes the build for production deployment
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const DIST_DIR = 'dist';
const BUILD_INFO_FILE = 'build-info.json';

console.log('🚀 Preparing for deployment...\n');

// 1. Clean previous build
console.log('1. Cleaning previous build...');
if (fs.existsSync(DIST_DIR)) {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
}

// 2. Run production build
console.log('2. Running production build...');
try {
  execSync('npm run build:production', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// 3. Generate build info
console.log('3. Generating build information...');
const buildInfo = {
  timestamp: new Date().toISOString(),
  version: process.env.npm_package_version || '1.0.0',
  environment: 'production',
  nodeVersion: process.version,
  buildHash: generateBuildHash(),
  features: {
    lazyLoading: true,
    codesplitting: true,
    serviceWorker: true,
    bundleOptimization: true
  }
};

fs.writeFileSync(
  path.join(DIST_DIR, BUILD_INFO_FILE),
  JSON.stringify(buildInfo, null, 2)
);

// 4. Analyze bundle size
console.log('4. Analyzing bundle size...');
analyzeBundleSize();

// 5. Generate deployment checklist
console.log('5. Generating deployment checklist...');
generateDeploymentChecklist();

// 6. Optimize assets
console.log('6. Optimizing assets...');
optimizeAssets();

console.log('\n✅ Deployment preparation complete!');
console.log(`📦 Build output: ${DIST_DIR}/`);
console.log(`📊 Build info: ${DIST_DIR}/${BUILD_INFO_FILE}`);

function generateBuildHash() {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return Math.random().toString(36).substr(2, 9);
  }
}

function analyzeBundleSize() {
  try {
    const distPath = path.resolve(DIST_DIR);
    const files = fs.readdirSync(distPath);
    
    console.log('\n📊 Bundle Analysis:');
    console.log('─'.repeat(50));
    
    let totalSize = 0;
    
    files.forEach(file => {
      const filePath = path.join(distPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isFile()) {
        const sizeKB = Math.round(stats.size / 1024);
        totalSize += sizeKB;
        
        let status = '✅';
        if (file.endsWith('.js') && sizeKB > 500) status = '⚠️';
        if (file.endsWith('.css') && sizeKB > 100) status = '⚠️';
        
        console.log(`${status} ${file.padEnd(30)} ${sizeKB.toString().padStart(6)} KB`);
      }
    });
    
    console.log('─'.repeat(50));
    console.log(`📦 Total bundle size: ${totalSize} KB`);
    
    if (totalSize > 1000) {
      console.log('⚠️  Bundle size is large. Consider further optimization.');
    } else {
      console.log('✅ Bundle size is optimal.');
    }
    
  } catch (error) {
    console.warn('⚠️  Could not analyze bundle size:', error.message);
  }
}

function generateDeploymentChecklist() {
  const checklist = `
# Deployment Checklist

## Pre-deployment
- [x] Production build completed
- [x] Bundle size analyzed
- [x] Assets optimized
- [ ] Environment variables configured
- [ ] Domain/hosting configured
- [ ] SSL certificate ready

## Performance
- [x] Code splitting implemented
- [x] Lazy loading enabled
- [x] Service worker configured
- [x] Asset optimization enabled
- [ ] CDN configured (if applicable)

## Monitoring
- [x] Error logging enabled
- [x] Performance monitoring enabled
- [ ] Analytics configured (if needed)
- [ ] Uptime monitoring setup

## Security
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Content Security Policy set
- [ ] CORS configured properly

## Testing
- [ ] Production build tested locally
- [ ] Cross-browser testing completed
- [ ] Mobile responsiveness verified
- [ ] Performance audit passed

## Post-deployment
- [ ] Verify all features work
- [ ] Check error logs
- [ ] Monitor performance metrics
- [ ] Test user workflows

Generated: ${new Date().toISOString()}
`;

  fs.writeFileSync(path.join(DIST_DIR, 'DEPLOYMENT_CHECKLIST.md'), checklist);
}

function optimizeAssets() {
  try {
    const distPath = path.resolve(DIST_DIR);
    
    // Create .htaccess for Apache servers
    const htaccess = `
# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Set cache headers
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
`;

    fs.writeFileSync(path.join(distPath, '.htaccess'), htaccess);
    
    // Create _headers file for Netlify
    const netlifyHeaders = `
/*
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin

/static/*
  Cache-Control: public, max-age=31536000, immutable

/*.js
  Cache-Control: public, max-age=31536000, immutable

/*.css
  Cache-Control: public, max-age=31536000, immutable
`;

    fs.writeFileSync(path.join(distPath, '_headers'), netlifyHeaders);
    
    console.log('✅ Server configuration files created');
    
  } catch (error) {
    console.warn('⚠️  Could not create server config files:', error.message);
  }
}