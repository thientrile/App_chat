#!/usr/bin/env node

/**
 * Watch Server with Alias Sync
 * 
 * Combines Node.js --watch flag with alias auto-sync functionality
 * Watches both server files and import-map.json for changes
 */

import { spawn } from 'child_process';
import { watch } from 'fs';
import { resolve } from 'path';
import { syncAliases } from './sync.js';

const ROOT_DIR = resolve(process.cwd());
const IMPORT_MAP_PATH = resolve(ROOT_DIR, 'import-map.json');

console.log('🚀 Starting development server with alias watch...');
console.log('👀 Watching import-map.json for alias changes');
console.log('🔄 Using Node.js --watch for server auto-restart');
console.log('🛑 Press Ctrl+C to stop\n');

// Initial alias sync
console.log('🔄 Initial alias sync...');
syncAliases();

// Start server with Node.js --watch
const serverProcess = spawn('node', [
  '--import', './register-loader.js',
  '--watch',
  './cmd/server/server.js'
], {
  stdio: 'inherit'
});

// Watch import-map.json for alias changes
const aliasWatcher = watch(IMPORT_MAP_PATH, (eventType, filename) => {
  if (eventType === 'change') {
    console.log('\n📝 import-map.json changed, syncing aliases...');
    
    // Add small delay to ensure file write is complete
    setTimeout(() => {
      syncAliases();
      console.log('✅ Aliases synced, server will auto-restart if needed\n');
    }, 100);
  }
});

// Handle process cleanup
function cleanup() {
  console.log('\n🛑 Stopping development server...');
  
  // Close alias watcher
  aliasWatcher.close();
  
  // Kill server process
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill('SIGTERM');
  }
  
  console.log('✅ Development server stopped');
  process.exit(0);
}

// Handle signals
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Handle server process events
serverProcess.on('close', (code) => {
  if (code !== 0) {
    console.log(`\n❌ Server process exited with code ${code}`);
  }
  cleanup();
});

serverProcess.on('error', (error) => {
  console.error(`\n❌ Server process error: ${error.message}`);
  cleanup();
});
