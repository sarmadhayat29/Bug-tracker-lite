const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
// Only watch the app and the shared package, not the entire monorepo root
const sharedRoot = path.resolve(projectRoot, '../../packages/shared');

const config = getDefaultConfig(projectRoot);

// 1. Watch the local folder and the shared package folder
config.watchFolders = [projectRoot, sharedRoot];

// 2. pnpm support: Enable symlink resolution
config.resolver.unstable_enableSymlinks = true;
config.resolver.unstable_enablePackageExports = true;

// 3. Ensure Metro can find modules in both locations
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(projectRoot, '../../node_modules'),
];

module.exports = config;
