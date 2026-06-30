import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const destDir = path.join(__dirname, '..', 'public', 'ffmpeg');

// Ensure destination directory exists
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const files = [
  'ffmpeg-core.js',
  'ffmpeg-core.wasm',
  'ffmpeg-core.worker.js' // optional for single-threaded but required for multi-threaded
];

// 1. Try to copy from node_modules if @ffmpeg/core is installed
const nodeModulesPath = path.join(__dirname, '..', 'node_modules', '@ffmpeg', 'core', 'dist', 'umd');
let copiedAll = true;

console.log('Checking node_modules for ffmpeg-core files...');
if (fs.existsSync(nodeModulesPath)) {
  for (const file of files) {
    const srcFile = path.join(nodeModulesPath, file);
    const destFile = path.join(destDir, file);
    if (fs.existsSync(srcFile)) {
      fs.copyFileSync(srcFile, destFile);
      console.log(`Copied ${file} from node_modules.`);
    } else {
      console.log(`File ${file} not found in node_modules/umd.`);
      if (file !== 'ffmpeg-core.worker.js') {
        copiedAll = false; // worker.js might not exist in single-threaded core
      }
    }
  }
} else {
  console.log('@ffmpeg/core not found in node_modules.');
  copiedAll = false;
}

// 2. If node_modules copy failed or files are missing, download them from unpkg
if (!copiedAll) {
  console.log('Downloading ffmpeg-core from unpkg CDN for offline capability...');
  const cdnBase = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core-mt@0.12.6/dist/esm';

  const download = async (fileName) => {
    const url = `${cdnBase}/${fileName}`;
    const destPath = path.join(destDir, fileName);

    console.log(`Downloading ${url}...`);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to download ${fileName}: ${response.statusText}`);
      }
      const buffer = await response.arrayBuffer();
      fs.writeFileSync(destPath, Buffer.from(buffer));
      console.log(`Saved ${fileName} to public/ffmpeg/`);
    } catch (err) {
      console.error(`Error downloading ${fileName}:`, err.message);
    }
  };

  for (const file of files) {
    await download(file);
  }
}

console.log('FFmpeg assets preparation complete!');
