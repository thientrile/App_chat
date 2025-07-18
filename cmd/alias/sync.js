#!/usr/bin/env node

/**
 * Alias Sync Utility
 * 
 * Automatically syncs aliases from import-map.json to jsconfig.json
 * This ensures VS Code IntelliSense works with all defined aliases
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const ROOT_DIR = resolve(process.cwd());
const IMPORT_MAP_PATH = resolve(ROOT_DIR, 'import-map.json');
const JSCONFIG_PATH = resolve(ROOT_DIR, 'jsconfig.json');

function syncAliases() {
  try {
    // Read import-map.json
    console.log('📖 Reading import-map.json...');
    const importMap = JSON.parse(readFileSync(IMPORT_MAP_PATH, 'utf-8'));
    
    // Read existing jsconfig.json
    console.log('📖 Reading jsconfig.json...');
    const jsconfig = JSON.parse(readFileSync(JSCONFIG_PATH, 'utf-8'));
    
    // Convert import-map format to jsconfig paths format
    console.log('🔄 Converting aliases...');
    const paths = {};
    
    for (const [alias, path] of Object.entries(importMap.imports)) {
      // Convert @alias/ to @alias/* for jsconfig
      const jsconfigAlias = alias.endsWith('/') ? alias + '*' : alias + '/*';
      // Convert ./path/ to ["path/*"] for jsconfig
      const jsconfigPath = path.startsWith('./') ? path.substring(2) : path;
      const finalPath = jsconfigPath.endsWith('/') ? jsconfigPath + '*' : jsconfigPath + '/*';
      
      paths[jsconfigAlias] = [finalPath];
    }
    
    // Update jsconfig compilerOptions.paths
    if (!jsconfig.compilerOptions) {
      jsconfig.compilerOptions = {};
    }
    
    jsconfig.compilerOptions.paths = paths;
    
    // Write updated jsconfig.json
    console.log('💾 Writing updated jsconfig.json...');
    writeFileSync(JSCONFIG_PATH, JSON.stringify(jsconfig, null, 2) + '\n', 'utf-8');
    
    console.log('✅ Aliases synced successfully!');
    console.log(`📊 Synced ${Object.keys(paths).length} aliases:`);
    
    Object.keys(paths).forEach(alias => {
      console.log(`   ${alias} → ${paths[alias][0]}`);
    });
    
  } catch (error) {
    console.error('❌ Error syncing aliases:', error.message);
    process.exit(1);
  }
}

// Run if called directly  
if (process.argv[1].endsWith('sync.js')) {
  console.log('🚀 Starting alias sync...');
  syncAliases();
}

export { syncAliases };
