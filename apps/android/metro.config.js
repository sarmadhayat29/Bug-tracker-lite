const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const sharedRoot = path.resolve(projectRoot, '../../packages/shared');

const config = getDefaultConfig(projectRoot);

// Expo detects pnpm/npm/yarn workspaces from the root package.json and sets
// watchFolders/nodeModulesPaths. Also watch the shared workspace package.
config.watchFolders = [...new Set([...(config.watchFolders ?? []), sharedRoot])];

config.resolver.unstable_enableSymlinks = true;
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
