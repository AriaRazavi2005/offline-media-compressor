import { useState, useCallback } from 'react';

export const useImageCompressor = () => {
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState(null);

  const compressImage = useCallback(async (file, options = {}) => {
    const {
      quality = 0.8, // 0 to 1
      format = 'image/webp', // image/jpeg, image/png, image/webp
      maxWidth = null,
      maxHeight = null,
    } = options;

    setIsCompressing(true);
    setError(null);

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          try {
            // Calculate new dimensions while maintaining aspect ratio
            let width = img.width;
            let height = img.height;

            if (maxWidth && width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }

            if (maxHeight && height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }

            // Create Canvas
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Compress to blob
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  const err = new Error('Canvas to Blob conversion failed.');
                  setError(err.message);
                  setIsCompressing(false);
                  reject(err);
                  return;
                }

                const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + `_compressed.${format.split('/')[1]}`, {
                  type: format,
                  lastModified: Date.now(),
                });

                const result = {
                  originalName: file.name,
                  originalSize: file.size,
                  originalWidth: img.width,
                  originalHeight: img.height,
                  compressedFile,
                  compressedSize: compressedFile.size,
                  compressedWidth: width,
                  compressedHeight: height,
                  compressedUrl: URL.createObjectURL(compressedFile),
                  ratio: ((1 - compressedFile.size / file.size) * 100).toFixed(1),
                };

                setIsCompressing(false);
                resolve(result);
              },
              format,
              quality
            );
          } catch (err) {
            setError(err.message);
            setIsCompressing(false);
            reject(err);
          }
        };

        img.onerror = () => {
          const err = new Error('Failed to load image.');
          setError(err.message);
          setIsCompressing(false);
          reject(err);
        };

        img.src = event.target.result;
      };

      reader.onerror = () => {
        const err = new Error('Failed to read file.');
        setError(err.message);
        setIsCompressing(false);
        reject(err);
      };

      reader.readAsDataURL(file);
    });
  }, []);

  return { compressImage, isCompressing, error };
};
