import React, { useState, useRef, useCallback } from 'react';
import './Dropzone.css';

export const Dropzone = ({ onFileSelected, onFilesSelected, accept, type, multiple = false }) => {
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

  const processFiles = useCallback((files) => {
    if (!files || files.length === 0) return;
    const validFiles = Array.from(files).filter(file => {
      if (type === 'image' && !file.type.startsWith('image/')) return false;
      if (type === 'video' && !file.type.startsWith('video/')) return false;
      return true;
    });
    if (validFiles.length === 0) {
      alert(type === 'image' ? '\u0644\u0637\u0641\u0627\u064b \u0641\u0627\u06cc\u0644 \u062a\u0635\u0648\u06cc\u0631\u06cc \u0627\u0646\u062a\u062e\u0627\u0628 \u06a9\u0646\u06cc\u062f.' : '\u0644\u0637\u0641\u0627\u064b \u0641\u0627\u06cc\u0644 \u0648\u06cc\u062f\u06cc\u0648\u06cc\u06cc \u0627\u0646\u062a\u062e\u0627\u0628 \u06a9\u0646\u06cc\u062f.');
      return;
    }
    if (multiple && onFilesSelected) {
      onFilesSelected(validFiles);
    } else if (onFileSelected) {
      onFileSelected(validFiles[0]);
    }
  }, [type, onFileSelected, onFilesSelected, multiple]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const handleChange = useCallback((e) => {
    e.preventDefault();
    if (e.target.files) processFiles(e.target.files);
  }, [processFiles]);

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
        multiple={multiple}
      />
      <div className="dropzone-content">
        <div className="dropzone-icon">
          {type === 'image' ? (
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
            </svg>
          )}
        </div>
        <h3>{multiple ? '\u0641\u0627\u06cc\u0644\u200c\u0647\u0627 \u0631\u0627 \u0628\u06a9\u0634\u06cc\u062f \u0648 \u0631\u0647\u0627 \u06a9\u0646\u06cc\u062f' : '\u0641\u0627\u06cc\u0644 \u062e\u0648\u062f \u0631\u0627 \u0628\u06a9\u0634\u06cc\u062f \u0648 \u0631\u0647\u0627 \u06a9\u0646\u06cc\u062f'}</h3>
        <p>{multiple ? '\u0641\u0627\u06cc\u0644\u200c\u0647\u0627\u06cc \u062e\u0648\u062f \u0631\u0627 \u0628\u0647 \u0627\u06cc\u0646\u062c\u0627 \u0628\u06a9\u0634\u06cc\u062f \u06cc\u0627 \u0628\u0631\u0627\u06cc \u0627\u0646\u062a\u062e\u0627\u0628 \u06a9\u0644\u06cc\u06a9 \u06a9\u0646\u06cc\u062f' : '\u0641\u0627\u06cc\u0644 \u062e\u0648\u062f \u0631\u0627 \u0628\u0647 \u0627\u06cc\u0646\u062c\u0627 \u0628\u06a9\u0634\u06cc\u062f \u06cc\u0627 \u0628\u0631\u0627\u06cc \u0627\u0646\u062a\u062e\u0627\u0628 \u06a9\u0644\u06cc\u06a9 \u06a9\u0646\u06cc\u062f'}</p>
        <button type="button" className="btn btn-secondary mt-4" onClick={() => fileInputRef.current.click()}>
          {multiple ? '\u0627\u0646\u062a\u062e\u0627\u0628 \u0641\u0627\u06cc\u0644\u200c\u0647\u0627' : '\u0627\u0646\u062a\u062e\u0627\u0628 \u0641\u0627\u06cc\u0644'}
        </button>
        <span className="file-formats">
          {type === 'image' ? '\ud83d\udcf7 PNG, JPG, WebP, AVIF' : '\ud83c\udfac MP4, WebM, MOV'}
        </span>
      </div>
    </div>
  );
};
