import * as esbuild from 'esbuild';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables from the web app
const envPath = path.resolve(__dirname, '../web/.env.local');
let envConfig = {};
try {
  envConfig = dotenv.parse(fs.readFileSync(envPath));
} catch (e) {
  console.warn('Could not read ../web/.env.local - using default/empty env');
}

// Prepare define object for esbuild to inject env vars
const define = {
  // Required by React/other modules
  'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
};
for (const k in envConfig) {
  define[`process.env.${k}`] = JSON.stringify(envConfig[k]);
}

esbuild.build({
  entryPoints: ['src/popup.ts', 'src/background.ts', 'src/content.ts'],
  bundle: true,
  outdir: 'dist',
  define: define,
  minify: process.env.NODE_ENV === 'production',
  sourcemap: process.env.NODE_ENV !== 'production',
  format: 'esm', // Use ESM to match manifest config
}).then(() => {
  console.log('⚡ Extension build complete!');
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
