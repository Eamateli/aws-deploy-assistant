#!/usr/bin/env node

/**
 * Bundle Size Analysis Script
 * Analyzes the actual build output and reports on bundle optimization effectiveness
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

function formatSize(bytes) {
  return (bytes / 1024).toFixed(2) + ' KB';
}

function analyzeBundleOutput() {
  const distPath = path.join(process.cwd(), 'dist');
  const jsPath = path.join(distPath, 'js');
  const cssPath = path.join(distPath, 'css');
  
  console.log('🔍 Bundle Size Analysis Report');
  console.log('================================\n');
  
  // Analyze JavaScript bundles
  console.log('📦 JavaScript Bundles:');
  console.log('----------------------');
  
  let totalJSSize = 0;
  const jsFiles = fs.readdirSync(jsPath);
  const bundleAnalysis = [];
  
  jsFiles.forEach(file => {
    const filePath = path.join(jsPath, file);
    const size = getFileSize(filePath);
    totalJSSize += size;
    
    let bundleType = 'other';
    if (file.includes('react-vendor')) bundleType = 'react-vendor';
    else if (file.includes('vendor')) bundleType = 'vendor';
    else if (file.includes('index')) bundleType = 'main';
    else if (file.includes('architecture')) bundleType = 'architecture';
    else if (file.includes('deployment')) bundleType = 'deployment';
    else if (file.includes('cost')) bundleType = 'cost';
    else if (file.includes('utils')) bundleType = 'utils';
    else if (file.includes('data')) bundleType = 'data';
    
    bundleAnalysis.push({
      file,
      size,
      type: bundleType,
      sizeFormatted: formatSize(size)
    });
  });
  
  // Sort by size (largest first)
  bundleAnalysis.sort((a, b) => b.size - a.size);
  
  bundleAnalysis.forEach(bundle => {
    const percentage = ((bundle.size / totalJSSize) * 100).toFixed(1);
    console.log(`  ${bundle.file.padEnd(35)} ${bundle.sizeFormatted.padStart(10)} (${percentage}%)`);
  });
  
  console.log(`\n  Total JS Size: ${formatSize(totalJSSize)}\n`);
  
  // Analyze CSS bundles
  console.log('🎨 CSS Bundles:');
  console.log('---------------');
  
  let totalCSSSize = 0;
  try {
    const cssFiles = fs.readdirSync(cssPath);
    cssFiles.forEach(file => {
      const filePath = path.join(cssPath, file);
      const size = getFileSize(filePath);
      totalCSSSize += size;
      console.log(`  ${file.padEnd(35)} ${formatSize(size).padStart(10)}`);
    });
  } catch (error) {
    console.log('  No CSS files found');
  }
  
  console.log(`\n  Total CSS Size: ${formatSize(totalCSSSize)}\n`);
  
  // Bundle optimization analysis
  console.log('⚡ Optimization Analysis:');
  console.log('------------------------');
  
  const criticalBundles = bundleAnalysis.filter(b => 
    b.type === 'main' || b.type === 'react-vendor' || b.type === 'vendor'
  );
  const lazyBundles = bundleAnalysis.filter(b => 
    b.type === 'architecture' || b.type === 'deployment' || b.type === 'cost' || b.type === 'utils' || b.type === 'data'
  );
  
  const criticalSize = criticalBundles.reduce((sum, b) => sum + b.size, 0);
  const lazySize = lazyBundles.reduce((sum, b) => sum + b.size, 0);
  const totalSize = totalJSSize + totalCSSSize;
  
  console.log(`  Critical Path Size: ${formatSize(criticalSize)} (${((criticalSize / totalJSSize) * 100).toFixed(1)}% of JS)`);
  console.log(`  Lazy Loaded Size:   ${formatSize(lazySize)} (${((lazySize / totalJSSize) * 100).toFixed(1)}% of JS)`);
  console.log(`  Total Bundle Size:  ${formatSize(totalSize)}`);
  
  // Performance recommendations
  console.log('\n🚀 Performance Assessment:');
  console.log('--------------------------');
  
  const assessments = [];
  
  if (totalSize < 500 * 1024) {
    assessments.push('✅ Total bundle size is under 500KB - Excellent!');
  } else if (totalSize < 1000 * 1024) {
    assessments.push('⚠️  Total bundle size is under 1MB - Good, but could be optimized');
  } else {
    assessments.push('❌ Total bundle size exceeds 1MB - Needs optimization');
  }
  
  if (criticalSize < 300 * 1024) {
    assessments.push('✅ Critical path is under 300KB - Great for initial load!');
  } else if (criticalSize < 500 * 1024) {
    assessments.push('⚠️  Critical path is under 500KB - Acceptable');
  } else {
    assessments.push('❌ Critical path exceeds 500KB - Consider more code splitting');
  }
  
  const lazyRatio = lazySize / totalJSSize;
  if (lazyRatio > 0.4) {
    assessments.push('✅ Good code splitting - 40%+ of code is lazy loaded');
  } else if (lazyRatio > 0.2) {
    assessments.push('⚠️  Moderate code splitting - Consider more lazy loading');
  } else {
    assessments.push('❌ Poor code splitting - Most code loads upfront');
  }
  
  const largestBundle = bundleAnalysis[0];
  if (largestBundle.size < 250 * 1024) {
    assessments.push('✅ No single bundle exceeds 250KB - Good chunk sizing');
  } else {
    assessments.push(`⚠️  Largest bundle (${largestBundle.file}) is ${largestBundle.sizeFormatted} - Consider splitting`);
  }
  
  assessments.forEach(assessment => console.log(`  ${assessment}`));
  
  // Estimated performance metrics
  console.log('\n📊 Estimated Performance:');
  console.log('-------------------------');
  
  const estimatedGzipSize = totalJSSize * 0.3; // Rough gzip estimate
  const estimatedLoadTime = criticalSize / (100 * 1024); // Assume 100KB/s on 3G
  const estimatedParseTime = totalJSSize / (1000 * 1024); // Assume 1MB/s parse speed
  
  console.log(`  Estimated Gzipped Size: ${formatSize(estimatedGzipSize)}`);
  console.log(`  Estimated Load Time (3G): ${estimatedLoadTime.toFixed(1)}s`);
  console.log(`  Estimated Parse Time: ${(estimatedParseTime * 1000).toFixed(0)}ms`);
  
  // Bundle composition
  console.log('\n📈 Bundle Composition:');
  console.log('---------------------');
  
  const composition = {};
  bundleAnalysis.forEach(bundle => {
    if (!composition[bundle.type]) {
      composition[bundle.type] = { size: 0, count: 0 };
    }
    composition[bundle.type].size += bundle.size;
    composition[bundle.type].count += 1;
  });
  
  Object.entries(composition).forEach(([type, data]) => {
    const percentage = ((data.size / totalJSSize) * 100).toFixed(1);
    console.log(`  ${type.padEnd(15)} ${formatSize(data.size).padStart(10)} (${percentage}%) - ${data.count} file(s)`);
  });
  
  console.log('\n✨ Bundle optimization analysis complete!\n');
  
  return {
    totalSize,
    criticalSize,
    lazySize,
    bundleCount: bundleAnalysis.length,
    assessments
  };
}

// Run the analysis
try {
  analyzeBundleOutput();
} catch (error) {
  console.error('❌ Error analyzing bundle:', error.message);
  console.log('\n💡 Make sure to run "npm run build" first');
  process.exit(1);
}

export { analyzeBundleOutput };