import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { Dropzone } from './components/Dropzone';
import { CompressorPanel } from './components/CompressorPanel';
import { BatchPanel } from './components/BatchPanel';
import { useImageCompressor } from './hooks/useImageCompressor';
import { useVideoCompressor } from './hooks/useVideoCompressor';

const CONFETTI_COLORS = ['#00e5ff', '#7c4dff', '#ff4081', '#00e676', '#ffab40', '#448aff'];

function Confetti() {
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 1.5,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 6 + Math.random() * 8,
    rotation: Math.random() * 360,
  }));

  return (
    <div className="confetti-container">
      {pieces.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            backgroundColor: p.color,
            width: `${p.size}px`,
            height: `${p.size}px`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('image');
  const [mode, setMode] = useState('single'); // 'single' | 'batch'
  const [selectedFile, setSelectedFile] = useState(null);
  const [batchFiles, setBatchFiles] = useState([]);
  const [batchResults, setBatchResults] = useState([]);
  const [batchIndex, setBatchIndex] = useState(-1);
  const [isBatchCompressing, setIsBatchCompressing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Image states
  const { compressImage, isCompressing: isImageCompressing, error: imageError } = useImageCompressor();
  const [imageResult, setImageResult] = useState(null);

  // Video states
  const {
    loadFFmpeg,
    compressVideo,
    isLoaded: isVideoLoaded,
    isLoading: isVideoLoading,
    isCompressing: isVideoCompressing,
    progress: videoProgress,
    error: videoError
  } = useVideoCompressor();
  const [videoResult, setVideoResult] = useState(null);

  // Pre-load FFmpeg when switching to video tab
  useEffect(() => {
    if (activeTab === 'video' && !isVideoLoaded && !isVideoLoading) {
      loadFFmpeg();
    }
  }, [activeTab, isVideoLoaded, isVideoLoading, loadFFmpeg]);

  // Trigger confetti and auto-dismiss
  const triggerConfetti = useCallback(() => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3500);
  }, []);

  const addToHistory = useCallback((result) => {
    setHistory(prev => [{
      ...result,
      timestamp: new Date().toLocaleTimeString('fa-IR'),
    }, ...prev].slice(0, 20));
  }, []);

  const handleFileSelected = (file) => {
    setSelectedFile(file);
    setImageResult(null);
    setVideoResult(null);
  };

  const handleFilesSelected = (files) => {
    setBatchFiles(files);
    setBatchResults(new Array(files.length).fill(null));
    setBatchIndex(-1);
  };

  const handleCompress = async (options) => {
    if (!selectedFile) return;
    if (activeTab === 'image') {
      try {
        const result = await compressImage(selectedFile, options);
        setImageResult(result);
        addToHistory(result);
        triggerConfetti();
      } catch (err) {
        console.error('Image compression failed:', err);
      }
    } else {
      try {
        const result = await compressVideo(selectedFile, options);
        setVideoResult(result);
        addToHistory(result);
        triggerConfetti();
      } catch (err) {
        console.error('Video compression failed:', err);
      }
    }
  };

  const handleBatchCompress = async () => {
    if (batchFiles.length === 0) return;
    setIsBatchCompressing(true);
    const newResults = [...batchResults];

    for (let i = 0; i < batchFiles.length; i++) {
      setBatchIndex(i);
      try {
        const result = await compressImage(batchFiles[i], {
          quality: 0.8,
          format: 'image/webp',
        });
        newResults[i] = result;
        setBatchResults([...newResults]);
        addToHistory(result);
      } catch (err) {
        console.error(`Batch compression failed for ${batchFiles[i].name}:`, err);
        newResults[i] = null;
        setBatchResults([...newResults]);
      }
    }

    setIsBatchCompressing(false);
    setBatchIndex(-1);
    triggerConfetti();
  };

  const handleReset = () => {
    setSelectedFile(null);
    setImageResult(null);
    setVideoResult(null);
    setBatchFiles([]);
    setBatchResults([]);
    setBatchIndex(-1);
    setIsBatchCompressing(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setMode('single');
    handleReset();
  };

  return (
    <div className="app-wrapper">
      <div className="container">
        {showConfetti && <Confetti />}

        {/* Header */}
        <header className="header">
          <h1>کمپرسور آفلاین مدیا</h1>
          <p>فشرده‌سازی عکس و ویدیو کاملاً آفلاین، بدون آپلود به سرور و با حفظ کامل حریم خصوصی</p>
          <div className="feature-badges">
            <span className="feature-badge">🔒 آفلاین و امن</span>
            <span className="feature-badge">⚡ سریع و رایگان</span>
            <span className="feature-badge">🎯 بدون افت کیفیت</span>
          </div>
        </header>

        {/* Tabs */}
        <div className="tabs-container">
          <button
            className={`tab-btn ${activeTab === 'image' ? 'active' : ''}`}
            onClick={() => handleTabChange('image')}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            فشرده‌سازی عکس
          </button>
          <button
            className={`tab-btn ${activeTab === 'video' ? 'active' : ''}`}
            onClick={() => handleTabChange('video')}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
            </svg>
            فشرده‌سازی ویدیو
          </button>
        </div>

        {/* Mode Toggle (only for images) */}
        {activeTab === 'image' && !selectedFile && batchFiles.length === 0 && (
          <div className="mode-toggle">
            <button className={`mode-btn ${mode === 'single' ? 'active' : ''}`} onClick={() => setMode('single')}>
              تکی
            </button>
            <button className={`mode-btn ${mode === 'batch' ? 'active' : ''}`} onClick={() => setMode('batch')}>
              دسته‌ای (چند فایل)
            </button>
          </div>
        )}

        {/* Main Content */}
        <main className="main-content">
          {/* Loading FFmpeg Indicator for Video Tab */}
          {activeTab === 'video' && isVideoLoading && !selectedFile && (
            <div className="glass-panel engine-loading">
              <div className="spinner-container">
                <div className="loading-spinner"></div>
              </div>
              <h3>در حال راه‌اندازی موتور فشرده‌سازی ویدیو...</h3>
              <p>این فرآیند فقط یک‌بار انجام می‌شود و فایل‌های موردنیاز را بارگذاری می‌کند.</p>
              <div style={{ marginTop: '1.5rem' }}>
                <button className="btn btn-secondary" onClick={loadFFmpeg}>تلاش مجدد</button>
              </div>
            </div>
          )}

          {/* Batch Mode */}
          {mode === 'batch' && activeTab === 'image' && !(activeTab === 'video' && isVideoLoading) && (
            <>
              {batchFiles.length === 0 ? (
                <Dropzone
                  onFilesSelected={handleFilesSelected}
                  accept="image/*"
                  type="image"
                  multiple={true}
                />
              ) : (
                <BatchPanel
                  files={batchFiles}
                  type="image"
                  onCompress={handleBatchCompress}
                  onReset={handleReset}
                  results={batchResults}
                  isCompressing={isBatchCompressing}
                  currentIndex={batchIndex}
                />
              )}
            </>
          )}

          {/* Single Mode */}
          {mode === 'single' && !(activeTab === 'video' && isVideoLoading && !selectedFile) && (
            <>
              {!selectedFile ? (
                <Dropzone
                  onFileSelected={handleFileSelected}
                  accept={activeTab === 'image' ? 'image/*' : 'video/*'}
                  type={activeTab}
                />
              ) : (
                <CompressorPanel
                  file={selectedFile}
                  type={activeTab}
                  onCompress={handleCompress}
                  isCompressing={activeTab === 'image' ? isImageCompressing : isVideoCompressing}
                  progress={activeTab === 'image' ? 0 : videoProgress}
                  error={activeTab === 'image' ? imageError : videoError}
                  result={activeTab === 'image' ? imageResult : videoResult}
                  onReset={handleReset}
                />
              )}
            </>
          )}
        </main>

        {/* Compression History */}
        {history.length > 0 && (
          <div className="history-section">
            <div className="glass-panel">
              <div className="history-header" onClick={() => setShowHistory(!showHistory)}>
                <h3>📋 تاریخچه فشرده‌سازی ({history.length})</h3>
                <span className={`history-toggle ${showHistory ? 'open' : ''}`}>▼</span>
              </div>
              {showHistory && (
                <div className="history-list">
                  {history.map((item, idx) => (
                    <div key={idx} className="history-item">
                      <div className="history-item-info">
                        <span className="history-item-name">{item.originalName}</span>
                        <span className="history-item-meta">{item.timestamp}</span>
                      </div>
                      <span className="history-item-ratio">-{item.ratio}%</span>
                      <a
                        href={item.compressedUrl}
                        download={item.compressedFile?.name}
                        className="history-download-btn"
                      >
                        دانلود
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-links">
          <a href="https://github.com/AriaRazavi2005/offline-media-compressor" target="_blank" rel="noopener noreferrer">
            GitHub ↗
          </a>
        </div>
        <p>ساخته شده با ❤️ | نسخه 2.0 — تمام پردازش‌ها آفلاین و در مرورگر شما انجام می‌شود</p>
      </footer>
    </div>
  );
}

export default App;
