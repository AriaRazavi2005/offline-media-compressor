import React, { useState, useRef, useCallback } from 'react';
import './Dropzone.css';

export const Dropzone = ({ onFileSelected, accept, type }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  }, []);

  const processFile = useCallback((file) => {
    if (!file) return;
    
    // Validate file type prefix
    if (type === 'image' && !file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }
    if (type === 'video' && !file.type.startsWith('video/')) {
      alert('Please upload a video file.');
      return;
    }

    onFileSelected(file);
  }, [type, onFileSelected]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [processFile]);

  const handleChange = useCallback((e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  }, [processFile]);

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div 
      className={`dropzone glass-panel ${isDragActive ? 'drag-active' : ''}`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      <input 
        ref={fileInputRef}
        type="file" 
        className="file-input-hidden" 
        accept={accept}
        onChange={handleChange}
      />
      <div className="dropzone-content">
        <div className="dropzone-icon">
          {type === 'image' ? (
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 2.25-4.5 2.25V9.75z" />
            </svg>
          )}
        </div>
        <h3>کشیدن و رها کردن فایل</h3>
        <p>فایل خود را به اینجا بکشید یا برای انتخاب فایل کلیک کنید</p>
        <button type="button" className="btn btn-secondary mt-4" onClick={onButtonClick}>
          انتخاب فایل
        </button>
        <span className="file-formats">
          فرمت‌های پشتیبانی شده: {type === 'image' ? 'PNG, JPG, WebP' : 'MP4, WebM, QuickTime'}
        </span>
      </div>
    </div>
  );
};
