#!/usr/bin/env node
/**
 * Collect platform build artifacts into dist-builds/ for Supabase upload.
 *
 * Usage: node scripts/package-builds.mjs
 */

import { existsSync, mkdirSync, copyFileSync, rmSync, readFileSync, writeFileSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT = resolve(ROOT, 'dist-builds');

const DESKTOP_INSTALLER = resolve(
  ROOT,
  'apps/desktop/src-tauri/target/release/bundle/nsis/bug-tracker-lite_1.0.0_x64-setup.exe',
);
const DESKTOP_FALLBACK = resolve(
  ROOT,
  'apps/desktop/src-tauri/target/release/bundle/nsis/Desktop.exe',
);
const ANDROID_APK_CANDIDATES = [
  resolve(ROOT, 'apps/android/android/app/build/outputs/apk/release/app-release.apk'),
  resolve(ROOT, 'apps/android/android/app/build/outputs/apk/debug/app-debug.apk'),
];

const OUTPUT_FILES = {
  android: 'Android.apk',
  desktop: 'bug-tracker-lite_1.0.0_x64-setup.exe',
  extension: 'ChromeExtension.zip',
};

function log(msg) {
  console.log(msg);
}

function ensureDir(dir) {
  mkdirSync(dir, { recursive: true });
}

function copyDesktop() {
  const src = existsSync(DESKTOP_INSTALLER) ? DESKTOP_INSTALLER : DESKTOP_FALLBACK;
  if (!existsSync(src)) {
    throw new Error(
      'Windows installer not found. Run: pnpm build:shared && pnpm build:web && pnpm build:desktop',
    );
  }
  const dest = join(OUT, OUTPUT_FILES.desktop);
  copyFileSync(src, dest);
  log(`✓ Windows: ${dest}`);
  return dest;
}

function copyAndroid() {
  const src = ANDROID_APK_CANDIDATES.find((p) => existsSync(p));
  if (!src) {
    log('⚠ Android APK not found. Skipping (build with Gradle or EAS, then re-run this script).');
    return null;
  }
  const dest = join(OUT, OUTPUT_FILES.android);
  copyFileSync(src, dest);
  log(`✓ Android: ${dest}`);
  return dest;
}

function zipExtension() {
  const extDir = resolve(ROOT, 'apps/extension');
  const staging = join(OUT, '.extension-staging');
  const zipPath = join(OUT, OUTPUT_FILES.extension);

  if (!existsSync(resolve(extDir, 'dist/popup.js'))) {
    log('Building Chrome extension...');
    execSync('pnpm build:extension', { cwd: ROOT, stdio: 'inherit' });
  }

  if (existsSync(staging)) rmSync(staging, { recursive: true, force: true });
  ensureDir(staging);
  ensureDir(join(staging, 'dist'));

  for (const file of ['manifest.json', 'popup.html', 'popup.css']) {
    copyFileSync(join(extDir, file), join(staging, file));
  }

  execSync(`xcopy /E /I /Y "${join(extDir, 'dist')}" "${join(staging, 'dist')}"`, {
    shell: true,
    stdio: 'pipe',
  });

  const iconsDir = join(extDir, 'icons');
  if (existsSync(iconsDir)) {
    execSync(`xcopy /E /I /Y "${iconsDir}" "${join(staging, 'icons')}"`, {
      shell: true,
      stdio: 'pipe',
    });
  } else {
    log('⚠ Extension icons/ folder missing — zip will still be created.');
  }

  if (existsSync(zipPath)) rmSync(zipPath, { force: true });

  execSync(
    `powershell -NoProfile -Command "Compress-Archive -Path '${staging}\\*' -DestinationPath '${zipPath}' -Force"`,
    { stdio: 'inherit' },
  );

  rmSync(staging, { recursive: true, force: true });
  log(`✓ Chrome Extension: ${zipPath}`);
  return zipPath;
}

function writeUploadReadme(present) {
  const readme = `# Upload these files to Supabase

Bucket name: **builds** (public)

Upload each file to the **root** of the bucket (not inside a subfolder):

${present.map((f) => `- \`${f}\``).join('\n')}

After upload, public URLs will look like:

\`\`\`
https://<your-project>.supabase.co/storage/v1/object/public/builds/Android.apk
https://<your-project>.supabase.co/storage/v1/object/public/builds/bug-tracker-lite_1.0.0_x64-setup.exe
https://<your-project>.supabase.co/storage/v1/object/public/builds/ChromeExtension.zip
\`\`\`

Then open the web app at \`/downloads\` and click Download on each card.
`;

  writeFileSync(join(OUT, 'UPLOAD_README.md'), readme, 'utf8');
  log(`✓ Instructions: ${join(OUT, 'UPLOAD_README.md')}`);
}

function main() {
  log('📦 Packaging build artifacts into dist-builds/\n');
  ensureDir(OUT);

  const present = [];
  const desktop = copyDesktop();
  present.push(OUTPUT_FILES.desktop);

  const extension = zipExtension();
  present.push(OUTPUT_FILES.extension);

  const android = copyAndroid();
  if (android) present.push(OUTPUT_FILES.android);

  writeUploadReadme(present);

  log('\nDone. Upload everything in dist-builds/ to your Supabase **builds** bucket.');
  if (!android) {
    log('\nTo build Android APK locally:');
    log('  cd apps/android/android');
    log('  .\\gradlew assembleRelease');
    log('  node ../../scripts/package-builds.mjs');
  }
}

main();
