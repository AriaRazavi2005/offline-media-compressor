import React, { useState, useEffect } from 'react';
import { Dropzone } from './components/Dropzone';
import { CompressorPanel } from './components/CompressorPanel';
import { useImageCompressor } from './hooks/useImageCompressor';
import { useVideoCompressor } from './hooks/useVideoCompressor';

function App() {
  const [activeTab, setActiveTab] = useState('image'); // 'image' | 'video'
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Image states
  const { 
    compressImage, 
    isCompressing: isImageCompressing, 
    error: imageError 
  } = useImageCompressor();
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

  // Diagnostic states
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [isCrossIsolated, setIsCrossIsolated] = useState(false);
  const [hasSharedArrayBuffer, setHasSharedArrayBuffer] = useState(false);

  // Hook into console logs to show in UI for diagnostic purposes
  useEffect(() => {
    setIsCrossIsolated(!!window.crossOriginIsolated);
    setHasSharedArrayBuffer(typeof window.SharedArrayBuffer !== 'undefined');

    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    const appendLog = (type, args) => {
      const msg = args
        .map(arg => {
          if (arg instanceof Error) return arg.message + '\n' + arg.stack;
          if (typeof arg === 'object') {
            try { return JSON.stringify(arg); } catch (e) { return '[Object]'; }
          }
          return String(arg);
        })
        .join(' ');
      
      setConsoleLogs(prev => [
        ...prev.slice(-49), // Keep last 50 logs
        { type, msg, time: new Date().toLocaleTimeString() }
      ]);
    };

    console.log = (...args) => {
      originalLog(...args);
      appendLog('info', args);
    };
    console.error = (...args) => {
      originalError(...args);
      appendLog('error', args);
    };
    console.warn = (...args) => {
      originalWarn(...args);
      appendLog('warn', args);
    };

    // Log initial browser settings
    console.log('System Diagnostic initialized.');
    console.log('crossOriginIsolated:', !!window.crossOriginIsolated);
    console.log('SharedArrayBuffer:', typeof window.SharedArrayBuffer !== 'undefined');

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  // Pre-load FFmpeg in background when switching to video tab
  useEffect(() => {
    if (activeTab === 'video' && !isVideoLoaded && !isVideoLoading) {
      console.log('Tab switched to video, triggering loadFFmpeg...');
      loadFFmpeg();
    }
  }, [activeTab, isVideoLoaded, isVideoLoading, loadFFmpeg]);

  const handleFileSelected = (file) => {
    console.log('File selected:', file.name, 'size:', file.size, 'type:', file.type);
    setSelectedFile(file);
    setImageResult(null);
    setVideoResult(null);
  };

  const handleCompress = async (options) => {
    if (!selectedFile) return;

    if (activeTab === 'image') {
      try {
        console.log('Starting image compression with options:', options);
        const result = await compressImage(selectedFile, options);
        setImageResult(result);
        console.log('Image compression finished.');
      } catch (err) {
        console.error('Image compression failed:', err);
      }
    } else {
      try {
        console.log('Starting video compression with options:', options);
        const result = await compressVideo(selectedFile, options);
        setVideoResult(result);
        console.log('Video compression finished.');
      } catch (err) {
        console.error('Video compression failed:', err);
      }
    }
  };

  const handleReset = () => {
    console.log('Resetting state...');
    setSelectedFile(null);
    setImageResult(null);
    setVideoResult(null);
  };

  const handleTabChange = (tab) => {
    console.log('Switching tab to:', tab);
    setActiveTab(tab);
    handleReset();
  };

  // Re-run loading if it fails or gets stuck
  const handleRetryLoadFFmpeg = () => {
    console.log('Retrying FFmpeg engine loading...');
    loadFFmpeg();
  };

  return (
    <div className="container" style={{ paddingBottom: '100px' }}>
      {/* Header */}
      <header className="header">
        <h1>کمپرسور آفلاین رسانه</h1>
        <p>فشرده‌سازی عکس و ویدیو کاملاً آفلاین، بدون نیاز به اینترنت و با حفظ کامل حریم خصوصی</p>
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 2.25-4.5 2.25V9.75z" />
          </svg>
          فشرده‌سازی ویدیو
        </button>
      </div>

      {/* Main Content */}
      <main className="main-content">
        {/* Loading FFmpeg Indicator for Video Tab */}
        {activeTab === 'video' && isVideoLoading && !selectedFile && (
          <div className="glass-panel text-center" style={{ padding: '3rem 2rem' }}>
            <div className="spinner-container">
              <div className="loading-spinner"></div>
            </div>
            <h3 style={{ marginTop: '1.5rem', fontSize: '1.2rem', direction: 'rtl' }}>در حال راه‌اندازی موتور فشرده‌سازی ویدیو...</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem', direction: 'rtl' }}>
              این فرآیند فقط یک‌بار هنگام ورود به تب ویدیو انجام می‌شود و فایل‌های موردنیاز را به صورت آفلاین بارگذاری می‌کند.
            </p>
            <div style={{ marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={handleRetryLoadFFmpeg}>
                تلاش مجدد بارگذاری موتور
              </button>
            </div>
          </div>
        )}

        {/* Normal Workflow */}
        {!(activeTab === 'video' && isVideoLoading && !selectedFile) && (
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

      {/* Persistent Diagnostics Panel */}
      <div className={`diagnostics-panel glass-panel ${showDiagnostics ? 'expanded' : ''}`}>
        <div className="diagnostics-header" onClick={() => setShowDiagnostics(!showDiagnostics)}>
          <span className="panel-title">سیستم عیب‌یابی (Diagnostic Logs)</span>
          <span className="toggle-icon">{showDiagnostics ? '▼' : '▲'}</span>
        </div>
        
        {showDiagnostics && (
          <div className="diagnostics-body">
            <div className="env-status grid">
              <div className="status-badge">
                شبیه‌سازی ایزولاسیون (crossOriginIsolated): 
                <span className={isCrossIsolated ? 'text-success' : 'text-danger'}>
                  {isCrossIsolated ? ' فعال (محیط امن)' : ' غیرفعال'}
                </span>
              </div>
              <div className="status-badge">
                حافظه اشتراکی (SharedArrayBuffer): 
                <span className={hasSharedArrayBuffer ? 'text-success' : 'text-danger'}>
                  {hasSharedArrayBuffer ? ' پشتیبانی شده' : ' پشتیبانی نشده'}
                </span>
              </div>
            </div>
            
            <div className="logs-terminal">
              {consoleLogs.length === 0 ? (
                <div className="empty-logs">هیچ لاگی ثبت نشده است.</div>
              ) : (
                consoleLogs.map((log, index) => (
                  <div key={index} className={`log-line type-${log.type}`}>
                    <span className="log-time">[{log.time}]</span>
                    <span className="log-msg">{log.msg}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Styles for spinner & diagnostics */}
      <style>{`
        .spinner-container {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 3px solid var(--border-color);
          border-top-color: var(--accent-cyan);
          border-radius: 50%;
          animation: rotate 1s linear infinite, pulse 2s infinite;
        }

        /* Diagnostics panel styles */
        .diagnostics-panel {
          position: fixed;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 90%;
          max-width: 1000px;
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
          z-index: 9999;
          transition: var(--transition);
          background: rgba(10, 11, 16, 0.95);
        }
        
        .diagnostics-header {
          padding: 10px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          border-bottom: 1px solid var(--border-color);
        }
        
        .panel-title {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-secondary);
        }
        
        .toggle-icon {
          color: var(--text-secondary);
          font-size: 0.75rem;
        }
        
        .diagnostics-body {
          max-height: 250px;
          overflow-y: auto;
          padding: 15px;
        }
        
        .env-status {
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 12px;
          font-size: 0.8rem;
          direction: rtl;
        }
        
        .status-badge {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          padding: 6px 12px;
          border-radius: 6px;
        }
        
        .text-success { color: var(--success); font-weight: bold; }
        .text-danger { color: var(--error); font-weight: bold; }
        
        .logs-terminal {
          background: #020205;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 10px;
          font-family: monospace;
          font-size: 0.75rem;
          height: 150px;
          overflow-y: auto;
          text-align: left;
        }
        
        .log-line {
          margin-bottom: 4px;
          white-space: pre-wrap;
          word-break: break-all;
        }
        
        .log-time {
          color: var(--text-muted);
          margin-right: 5px;
        }
        
        .type-info { color: #ccc; }
        .type-warn { color: #f59e0b; }
        .type-error { color: #ef4444; }
        
        .empty-logs {
          color: var(--text-muted);
          text-align: center;
          padding-top: 50px;
        }
      `}</style>
    </div>
  );
}

export default App;
