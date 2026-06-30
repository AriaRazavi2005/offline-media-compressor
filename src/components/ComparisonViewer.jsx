import React, { useState, useRef, useEffect, useCallback } from 'react';
import './ComparisonViewer.css';

export const ComparisonViewer = ({ originalUrl, compressedUrl, height = 400 }) => {
  const [sliderPosition, setSliderPosition] = useState(50); // 0 to 100
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(position);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return;
    if (e.touches && e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  }, [isDragging, handleMove]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  }, [isDragging, handleMove]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  return (
    <div 
      className="comparison-viewer"
      ref={containerRef}
      onMouseDown={() => setIsDragging(true)}
      onTouchStart={() => setIsDragging(true)}
      style={{ height: `${height}px` }}
    >
      {/* Original Image (Left/Background) */}
      <div className="image-original">
        <img src={originalUrl} alt="Original" draggable="false" />
        <span className="badge badge-left">اصلی</span>
      </div>

      {/* Compressed Image (Right/Foreground Clip) */}
      <div 
        className="image-compressed" 
        style={{ width: `${sliderPosition}%` }}
      >
        <div className="image-compressed-wrapper" style={{ width: containerRef.current ? containerRef.current.getBoundingClientRect().width : '100%' }}>
          <img src={compressedUrl} alt="Compressed" draggable="false" />
        </div>
        <span className="badge badge-right">فشرده شده</span>
      </div>

      {/* Slider Bar & Handle */}
      <div className="slider-bar" style={{ left: `${sliderPosition}%` }}>
        <div className="slider-handle">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
          </svg>
        </div>
      </div>
    </div>
  );
};
