import { readFileSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, resolve as pathResolve, extname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load import map from root directory
const rootDir = pathResolve(__dirname, '../../');
const importMap = JSON.parse(readFileSync(pathResolve(rootDir, 'import-map.json'), 'utf-8'));

export async function resolve(specifier, context, defaultResolve) {
  // Check if specifier matches any alias
  for (const [alias, path] of Object.entries(importMap.imports)) {
    if (specifier.startsWith(alias)) {
      const resolvedPath = specifier.replace(alias, path);
      const fullPath = pathResolve(rootDir, resolvedPath);
      
      // Add .js extension if not present and it's a local file
      if (!extname(fullPath) && !resolvedPath.includes('node_modules')) {
        return {
          url: pathToFileURL(fullPath + '.js').href,
          shortCircuit: true
        };
      }
      
      return {
        url: pathToFileURL(fullPath).href,
        shortCircuit: true
      };
    }
  }

  // Fall back to default resolver
  return defaultResolve(specifier, context);
}
