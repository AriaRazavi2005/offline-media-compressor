import { useState, useCallback, useRef } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export const useVideoCompressor = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const ffmpegRef = useRef(null);

  const loadFFmpeg = useCallback(async () => {
    if (isLoaded || isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const ffmpeg = new FFmpeg();
      ffmpegRef.current = ffmpeg;

      ffmpeg.on('log', ({ message }) => {
        console.log('[FFmpeg Log]', message);
      });

      ffmpeg.on('progress', ({ progress: p }) => {
        setProgress(Math.round(p * 100));
      });

      const baseURL = window.location.origin + '/ffmpeg';

      // Load using local assets via Blob URLs to bypass Vite static resolution
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
      });

      setIsLoaded(true);
    } catch (err) {
      console.error('Failed to load FFmpeg.wasm:', err);
      setError('Failed to initialize video compressor. Check if browser supports WebAssembly and SharedArrayBuffer.');
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, isLoading]);

  const compressVideo = useCallback(async (file, options = {}) => {
    const {
      quality = 28, // CRF (Constant Rate Factor): 0 (lossless) to 51 (worst), default 28
      preset = 'ultrafast', // ultrafast, superfast, veryfast, faster, fast, medium, slow, slower, veryslow
      resolution = 'original', // original, 1080p, 720p, 480p, 360p
    } = options;

    if (!isLoaded && !ffmpegRef.current) {
      await loadFFmpeg();
    }

    const ffmpeg = ffmpegRef.current;
    if (!ffmpeg) {
      throw new Error('Video compressor not loaded.');
    }

    setIsCompressing(true);
    setProgress(0);
    setError(null);

    try {
      const inputName = 'input_' + file.name;
      const outputName = 'output_' + file.name.replace(/\.[^/.]+$/, "") + '.mp4';

      // Write file to FFmpeg Virtual File System
      await ffmpeg.writeFile(inputName, await fetchFile(file));

      // Construct FFmpeg arguments
      const args = ['-i', inputName];

      // 1. Resolution / Video filters
      let scaleFilter = '';
      if (resolution !== 'original') {
        const heightMap = {
          '1080p': 1080,
          '720p': 720,
          '480p': 480,
          '360p': 360,
        };
        const targetHeight = heightMap[resolution];
        if (targetHeight) {
          // scale=-2:height maintains aspect ratio and ensures dimensions are even (required for libx264)
          scaleFilter = `scale=-2:${targetHeight}`;
        }
      }

      if (scaleFilter) {
        args.push('-vf', scaleFilter);
      }

      // 2. Video codec & compression settings
      args.push('-vcodec', 'libx264');
      args.push('-crf', String(quality));
      args.push('-preset', preset);
      args.push('-threads', '0');

      // 3. Audio settings (copy audio to save time & CPU)
      args.push('-acodec', 'aac');
      args.push('-b:a', '128k');

      // 4. Output filename
      args.push(outputName);

      console.log('Running FFmpeg with arguments:', args);
      await ffmpeg.exec(args);

      // Read resulting file from virtual file system
      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data.buffer], { type: 'video/mp4' });

      // Clean up virtual files to free memory
      try {
        await ffmpeg.deleteFile(inputName);
        await ffmpeg.deleteFile(outputName);
      } catch (cleanupErr) {
        console.warn('Failed to clean up virtual file system files:', cleanupErr);
      }

      const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + `_compressed.mp4`, {
        type: 'video/mp4',
        lastModified: Date.now(),
      });

      setIsCompressing(false);
      setProgress(100);

      return {
        originalName: file.name,
        originalSize: file.size,
        compressedFile,
        compressedSize: compressedFile.size,
        compressedUrl: URL.createObjectURL(compressedFile),
        ratio: ((1 - compressedFile.size / file.size) * 100).toFixed(1),
      };
    } catch (err) {
      console.error('Error during video compression:', err);
      setError(err.message || 'Error occurred during video compression.');
      setIsCompressing(false);
      throw err;
    }
  }, [isLoaded, loadFFmpeg]);

  return {
    loadFFmpeg,
    compressVideo,
    isLoaded,
    isLoading,
    isCompressing,
    progress,
    error,
  };
};
