import React, { useState } from 'react';
import JSZip from 'jszip';
import './BatchPanel.css';

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 \u0628\u0627\u06cc\u062a';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['\u0628\u0627\u06cc\u062a', '\u06a9\u06cc\u0644\u0648\u0628\u0627\u06cc\u062a', '\u0645\u06af\u0627\u0628\u0627\u06cc\u062a', '\u06af\u06cc\u06af\u0627\u0628\u0627\u06cc\u062a'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const BatchPanel = ({ files, type, onCompress, onReset, results, isCompressing, currentIndex }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const totalOriginal = files.reduce((sum, f) => sum + f.size, 0);
  const totalCompressed = results.reduce((sum, r) => sum + (r?.compressedSize || 0), 0);
  const completedCount = results.filter(r => r !== null).length;
  const allDone = completedCount === files.length;

  const handleDownloadAll = async () => {
    setIsDownloading(true);
    try {
      const zip = new JSZip();
      for (const result of results) {
        if (result && result.compressedFile) {
          const arrayBuffer = await result.compressedFile.arrayBuffer();
          zip.file(result.compressedFile.name, arrayBuffer);
        }
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'compressed_files.zip';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error creating ZIP:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="batch-panel glass-panel">
      <div className="batch-header">
        <button className="btn-back" onClick={onReset}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="batch-header-info">
          <h3>{files.length} \u0641\u0627\u06cc\u0644 \u0627\u0646\u062a\u062e\u0627\u0628 \u0634\u062f\u0647</h3>
          <p>\u062d\u062c\u0645 \u06a9\u0644: {formatBytes(totalOriginal)}</p>
        </div>
      </div>
      {(isCompressing || allDone) && (
        <div className="batch-progress">
          <div className="batch-progress-bar">
            <div className="batch-progress-fill" style={{ width: `${(completedCount / files.length) * 100}%` }} />
          </div>
          <span className="batch-progress-text">
            {allDone ? '\u2705 \u0647\u0645\u0647 \u0641\u0627\u06cc\u0644\u200c\u0647\u0627 \u0641\u0634\u0631\u062f\u0647 \u0634\u062f\u0646\u062f!' : `${completedCount} \u0627\u0632 ${files.length} \u062a\u06a9\u0645\u06cc\u0644 \u0634\u062f\u0647`}
          </span>
        </div>
      )}
      <div className="batch-file-list">
        {files.map((file, index) => {
          const result = results[index];
          const isCurrent = isCompressing && index === currentIndex;
          const isDone = result !== null;
          return (
            <div key={index} className={`batch-file-item ${isCurrent ? 'processing' : ''} ${isDone ? 'done' : ''}`}>
              <div className="batch-file-info">
                <span className="batch-file-status">{isDone ? '\u2705' : isCurrent ? '\u23f3' : '\u23f8\ufe0f'}</span>
                <div className="batch-file-details">
                  <span className="batch-file-name">{file.name}</span>
                  <span className="batch-file-size">{formatBytes(file.size)}</span>
                </div>
              </div>
              {isDone && result && (
                <div className="batch-file-result">
                  <span className="batch-file-ratio">-{result.ratio}%</span>
                  <span className="batch-file-new-size">{formatBytes(result.compressedSize)}</span>
                </div>
              )}
              {isCurrent && <div className="batch-file-loading"><div className="mini-spinner" /></div>}
            </div>
          );
        })}
      </div>
      {!isCompressing && !allDone && (
        <button className="btn btn-primary w-full mt-4" onClick={onCompress}>
          \u0634\u0631\u0648\u0639 \u0641\u0634\u0631\u062f\u0647\u200c\u0633\u0627\u0632\u06cc {files.length} \u0641\u0627\u06cc\u0644
        </button>
      )}
      {allDone && (
        <div className="batch-actions mt-4">
          {totalCompressed > 0 && (
            <div className="batch-total-stats">
              <span>\u06a9\u0627\u0647\u0634 \u06a9\u0644: <strong>{formatBytes(totalOriginal - totalCompressed)}</strong></span>
              <span className="batch-total-ratio">({((1 - totalCompressed / totalOriginal) * 100).toFixed(1)}%-)</span>
            </div>
          )}
          <div className="flex gap-4">
            <button className="btn btn-primary flex-1" onClick={handleDownloadAll} disabled={isDownloading}>
              {isDownloading ? '\u062f\u0631 \u062d\u0627\u0644 \u0622\u0645\u0627\u062f\u0647\u200c\u0633\u0627\u0632\u06cc ZIP...' : `\ud83d\udce6 \u062f\u0627\u0646\u0644\u0648\u062f \u0647\u0645\u0647 (ZIP)`}
            </button>
            <button className="btn btn-secondary" onClick={onReset}>\u0641\u0634\u0631\u062f\u0647\u200c\u0633\u0627\u0632\u06cc \u062c\u062f\u06cc\u062f</button>
          </div>
        </div>
      )}
    </div>
  );
};
