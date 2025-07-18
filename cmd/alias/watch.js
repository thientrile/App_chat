#!/usr/bin/env node

/**
 * Alias Watcher
 * 
 * Watches import-map.json for changes and automatically syncs to jsconfig.json
 */

import { watch } from 'fs';
import { resolve } from 'path';
import { syncAliases } from './sync.js';

const ROOT_DIR = resolve(process.cwd());
const IMPORT_MAP_PATH = resolve(ROOT_DIR, 'import-map.json');

console.log('👀 Watching import-map.json for changes...');
console.log(`📁 File: ${IMPORT_MAP_PATH}`);
console.log('🛑 Press Ctrl+C to stop watching\n');

// Initial sync
syncAliases();

// Watch for changes
const watcher = watch(IMPORT_MAP_PATH, (eventType, filename) => {
  if (eventType === 'change') {
    console.log(`\n📝 import-map.json changed, syncing...`);
    
    // Add small delay to ensure file write is complete
    setTimeout(() => {
      syncAliases();
      console.log('👀 Watching for next change...\n');
    }, 100);
  }
});

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping watcher...');
  watcher.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  watcher.close();
  process.exit(0);
});
