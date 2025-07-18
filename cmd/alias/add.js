#!/usr/bin/env node

/**
 * Add Alias Utility
 * 
 * Adds a new alias to import-map.json and automatically syncs to jsconfig.json
 * 
 * Usage: node cmd/alias/add.js @newAlias ./path/to/directory
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { syncAliases } from './sync.js';

const ROOT_DIR = resolve(process.cwd());
const IMPORT_MAP_PATH = resolve(ROOT_DIR, 'import-map.json');

function addAlias(alias, path) {
  try {
    // Validate inputs
    if (!alias || !path) {
      throw new Error('Both alias and path are required');
    }
    
    // Ensure alias starts with @ and ends with /
    if (!alias.startsWith('@')) {
      alias = '@' + alias;
    }
    if (!alias.endsWith('/')) {
      alias = alias + '/';
    }
    
    // Ensure path starts with ./ and ends with /
    if (!path.startsWith('./')) {
      path = './' + path;
    }
    if (!path.endsWith('/')) {
      path = path + '/';
    }
    
    // Read existing import-map.json
    console.log('📖 Reading import-map.json...');
    const importMap = JSON.parse(readFileSync(IMPORT_MAP_PATH, 'utf-8'));
    
    // Check if alias already exists
    if (importMap.imports[alias]) {
      console.log(`⚠️  Alias ${alias} already exists: ${importMap.imports[alias]}`);
      console.log(`🔄 Updating to: ${path}`);
    } else {
      console.log(`➕ Adding new alias: ${alias} → ${path}`);
    }
    
    // Add/update alias
    importMap.imports[alias] = path;
    
    // Sort aliases alphabetically
    const sortedImports = {};
    Object.keys(importMap.imports)
      .sort()
      .forEach(key => {
        sortedImports[key] = importMap.imports[key];
      });
    importMap.imports = sortedImports;
    
    // Write updated import-map.json
    console.log('💾 Writing updated import-map.json...');
    writeFileSync(IMPORT_MAP_PATH, JSON.stringify(importMap, null, 2) + '\n', 'utf-8');
    
    // Sync to jsconfig.json
    console.log('🔄 Syncing to jsconfig.json...');
    syncAliases();
    
    console.log('✅ Alias added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding alias:', error.message);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

console.log('🚀 Add Alias Utility');
console.log('Arguments received:', args);

if (args.length < 2) {
  console.log('Usage: node cmd/alias/add.js <alias> <path>');
  console.log('Example: node cmd/alias/add.js @newAlias ./src/new-directory');
  process.exit(1);
}

const [alias, path] = args;
addAlias(alias, path);
