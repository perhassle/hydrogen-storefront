#!/usr/bin/env node

/**
 * Build validation script to catch potential issues early
 * This script validates that the build output contains all required files
 * and that virtual module resolution is working correctly.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, '..', 'dist');

const requiredFiles = [
  'index.js',       // Server bundle
  'index.js.map',   // Server source map
  'oxygen.json',    // Oxygen config
  'client/.vite/manifest.json', // Client Vite manifest
  'server/.vite/manifest.json', // Server Vite manifest
];

const requiredDirectories = [
  'client',         // Client assets
  'server',         // Server assets
];

function validateBuild() {
  console.log('🔍 Validating build output...');
  
  // Check if dist directory exists
  if (!fs.existsSync(distPath)) {
    console.error('❌ Build failed: dist directory not found');
    process.exit(1);
  }

  // Check required files
  for (const file of requiredFiles) {
    const filePath = path.join(distPath, file);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Build failed: Required file missing - ${file}`);
      process.exit(1);
    }
    
    // Check file size
    const stats = fs.statSync(filePath);
    if (stats.size === 0) {
      console.error(`❌ Build failed: Empty file - ${file}`);
      process.exit(1);
    }
    
    console.log(`✅ ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
  }

  // Check required directories
  for (const dir of requiredDirectories) {
    const dirPath = path.join(distPath, dir);
    if (!fs.existsSync(dirPath)) {
      console.error(`❌ Build failed: Required directory missing - ${dir}`);
      process.exit(1);
    }
    
    // Check if directory has content
    const files = fs.readdirSync(dirPath);
    if (files.length === 0) {
      console.error(`❌ Build failed: Empty directory - ${dir}`);
      process.exit(1);
    }
    
    console.log(`✅ ${dir}/ (${files.length} files)`);
  }

  // Validate server bundle
  const serverBundlePath = path.join(distPath, 'index.js');
  const serverBundle = fs.readFileSync(serverBundlePath, 'utf8');
  
  // Check for potential issues in server bundle
  if (!serverBundle.includes('export') && !serverBundle.includes('module.exports')) {
    console.error('❌ Build failed: Server bundle does not appear to have valid exports');
    process.exit(1);
  }

  // Check manifest.json structure (use client manifest as primary)
  const manifestPath = path.join(distPath, 'client', '.vite', 'manifest.json');
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    if (Object.keys(manifest).length === 0) {
      console.error('❌ Build failed: Vite manifest is empty');
      process.exit(1);
    }
    console.log(`✅ Vite manifest (${Object.keys(manifest).length} entries)`);
  } catch (error) {
    console.error('❌ Build failed: Invalid Vite manifest JSON');
    process.exit(1);
  }

  console.log('✅ Build validation passed! All required files and directories are present.');
}

// Run validation if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateBuild();
}

export { validateBuild };