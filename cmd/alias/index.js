/**
 * Alias Management Utilities
 * 
 * This module provides utilities for managing aliases in the project:
 * - Sync aliases from import-map.json to jsconfig.json
 * - Watch for changes and auto-sync
 * - Add new aliases via command line
 */

export { syncAliases } from './sync.js';

// Re-export for convenience
export * from './sync.js';
