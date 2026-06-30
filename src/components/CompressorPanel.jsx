import React, { useState, useEffect } from 'react';
import { ComparisonViewer } from './ComparisonViewer';
import './CompressorPanel.css';

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const CompressorPanel = ({
  file,
  type,
  onCompress,
  isCompressing,
  progress,
  error,
  result,
  onReset
}) => {
  // Image Options
  const [imageFormat, setImageFormat] = useState('image/webp');
  const [imageQuality, setImageQuality] = useState(80);
  const [imageWidth, setImageWidth] = useState('');
  const [imageHeight, setImageHeight] = useState('');
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  // Video Options
  const [videoQuality, setVideoQuality] = useState(28); // CRF 18-35
  const [videoResolution, setVideoResolution] = useState('original');
  const [videoPreset, setVideoPreset] = useState('ultrafast');

  // Load original image/video dimensions
  useEffect(() => {
    if (!file) return;

    if (type === 'image') {
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height });
        setImageWidth(img.width);
        setImageHeight(img.height);
      };
      img.src = URL.createObjectURL(file);
    }
  }, [file, type]);

  const handleWidthChange = (val) => {
    setImageWidth(val);
    if (imageDimensions.width > 0) {
      // Keep aspect ratio
      const ratio = imageDimensions.height / imageDimensions.width;
      setImageHeight(Math.round(val * ratio));
    }
  };

  const handleHeightChange = (val) => {
    setImageHeight(val);
    if (imageDimensions.height > 0) {
      // Keep aspect ratio
      const ratio = imageDimensions.width / imageDimensions.height;
      setImageWidth(Math.round(val * ratio));
    }
  };

  const handleCompressClick = () => {
    if (type === 'image') {
      onCompress({
        quality: imageQuality / 100,
        format: imageFormat,
        maxWidth: imageWidth ? parseInt(imageWidth) : null,
        maxHeight: imageHeight ? parseInt(imageHeight) : null,
      });
    } else {
      onCompress({
        quality: videoQuality,
        resolution: videoResolution,
        preset: videoPreset,
      });
    }
  };

  // Helper text for video CRF quality
  const getVideoCRFText = (crf) => {
    if (crf <= 20) return 'کیفیت فوق‌العاده (حجم زیاد)';
    if (crf <= 25) return 'کیفیت بالا (کاهش حجم متوسط)';
    if (crf <= 30) return 'بهینه/استاندارد (کاهش حجم عالی)';
    return 'کیفیت پایین (حجم بسیار کم)';
  };

  return (
    <div className="compressor-panel glass-panel">
      {/* File Info Header */}
      <div className="panel-header">
        <button className="btn-back" onClick={onReset}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="file-info-text">
          <h4>{file.name}</h4>
          <p>
            حجم فایل: {formatBytes(file.size)}
            {type === 'image' && imageDimensions.width > 0 && ` | ابعاد اصلی: ${imageDimensions.width}x${imageDimensions.height} پیکسل`}
          </p>
        </div>
      </div>

      <div className="panel-body grid gap-6">
        {/* Settings Area */}
        {!result && !isCompressing && (
          <div className="settings-section">
            <h3 className="section-title">تنظیمات فشرده‌سازی</h3>
            
            {type === 'image' ? (
              /* Image Settings */
              <div className="settings-grid">
                <div className="form-group">
                  <label>فرمت خروجی</label>
                  <select value={imageFormat} onChange={(e) => setImageFormat(e.target.value)}>
                    <option value="image/webp">WebP (بهترین کاهش حجم)</option>
                    <option value="image/jpeg">JPEG (استاندارد)</option>
                    <option value="image/png">PNG (بدون افت کیفیت/بدون فشرده‌سازی زیاد)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="flex justify-between">
                    <span>کیفیت تصویر</span>
                    <span className="accent-text">{imageQuality}%</span>
                  </label>
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    value={imageQuality} 
                    onChange={(e) => setImageQuality(parseInt(e.target.value))} 
                    disabled={imageFormat === 'image/png'}
                  />
                  {imageFormat === 'image/png' && <span className="help-text">تنظیم کیفیت برای فرمت PNG غیرفعال است.</span>}
                </div>

                <div className="form-group dimensions-group">
                  <label>تغییر ابعاد تصویر (پیکسل)</label>
                  <div className="flex gap-4">
                    <div>
                      <span className="input-label">عرض</span>
                      <input 
                        type="number" 
                        value={imageWidth} 
                        onChange={(e) => handleWidthChange(e.target.value)} 
                        placeholder="عرض"
                      />
                    </div>
                    <div>
                      <span className="input-label">ارتفاع</span>
                      <input 
                        type="number" 
                        value={imageHeight} 
                        onChange={(e) => handleHeightChange(e.target.value)} 
                        placeholder="ارتفاع"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Video Settings */
              <div className="settings-grid">
                <div className="form-group">
                  <label>رزولوشن ویدیو</label>
                  <select value={videoResolution} onChange={(e) => setVideoResolution(e.target.value)}>
                    <option value="original">رزولوشن اصلی</option>
                    <option value="1080p">1080p Full HD</option>
                    <option value="720p">720p HD</option>
                    <option value="480p">480p SD</option>
                    <option value="360p">360p Mobile</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="flex justify-between">
                    <span>شدت فشرده‌سازی (CRF)</span>
                    <span className="accent-text">{videoQuality}</span>
                  </label>
                  <input 
                    type="range" 
                    min="18" 
                    max="35" 
                    value={videoQuality} 
                    onChange={(e) => setVideoQuality(parseInt(e.target.value))} 
                  />
                  <span className="help-text">{getVideoCRFText(videoQuality)}</span>
                </div>

                <div className="form-group">
                  <label>سرعت انکود (فشرده‌سازی)</label>
                  <select value={videoPreset} onChange={(e) => setVideoPreset(e.target.value)}>
                    <option value="ultrafast">فوق‌سریع (پیشنهاد شده برای مرورگر - سرعت عالی)</option>
                    <option value="veryfast">بسیار سریع</option>
                    <option value="fast">سریع</option>
                    <option value="medium">متوسط (نیاز به پردازش و زمان بیشتر)</option>
                    <option value="slow">کند (کیفیت بهتر، حجم کمتر، پردازش بسیار زیاد)</option>
                  </select>
                </div>
              </div>
            )}

            <button 
              className="btn btn-primary w-full mt-4" 
              onClick={handleCompressClick}
            >
              شروع فشرده‌سازی
            </button>
          </div>
        )}

        {/* Compressing State */}
        {isCompressing && (
          <div className="progress-section text-center">
            <h3 className="section-title">در حال فشرده‌سازی...</h3>
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="progress-percentage">{progress}%</span>
            <p className="loading-hint">
              {type === 'video' 
                ? 'فشرده‌سازی ویدیو به صورت آفلاین در مرورگر ممکن است چند دقیقه طول بکشد. لطفاً این تب را نبندید.' 
                : 'در حال پردازش و تغییر سایز تصویر...'}
            </p>
          </div>
        )}

        {/* Compression Result */}
        {result && (
          <div className="result-section grid gap-6">
            <h3 className="section-title">فشرده‌سازی با موفقیت انجام شد!</h3>
            
            {/* Comparison Stats */}
            <div className="stats-box grid">
              <div className="stat-item">
                <span className="stat-label">حجم اصلی</span>
                <span className="stat-val">{formatBytes(result.originalSize)}</span>
              </div>
              <div className="stat-item text-glow">
                <span className="stat-label">حجم جدید</span>
                <span className="stat-val">{formatBytes(result.compressedSize)}</span>
              </div>
              <div className="stat-item highlight">
                <span className="stat-label">کاهش حجم</span>
                <span className="stat-val">{result.ratio}%-</span>
              </div>
            </div>

            {/* Comparison Viewer for Images */}
            {type === 'image' && (
              <div className="comparison-container">
                <h4 className="viewer-title">مقایسه کیفیت تصویر قبل و بعد (اسلایدر را بکشید)</h4>
                <ComparisonViewer 
                  originalUrl={URL.createObjectURL(file)} 
                  compressedUrl={result.compressedUrl} 
                  height={350}
                />
              </div>
            )}

            {/* Comparison Players for Video */}
            {type === 'video' && (
              <div className="video-comparison grid gap-4">
                <div className="video-column glass-panel">
                  <h5>ویدیوی اصلی</h5>
                  <video controls src={URL.createObjectURL(file)} className="video-preview" />
                </div>
                <div className="video-column glass-panel highlight-border">
                  <h5>ویدیوی فشرده شده</h5>
                  <video controls src={result.compressedUrl} className="video-preview" />
                </div>
              </div>
            )}

            <div className="flex gap-4 mt-2">
              <a 
                href={result.compressedUrl} 
                download={result.compressedFile.name} 
                className="btn btn-primary flex-1"
              >
                دانلود فایل فشرده شده
              </a>
              <button className="btn btn-secondary" onClick={onReset}>
                فشرده‌سازی فایل جدید
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="error-box">
            <p>{error}</p>
            <button className="btn btn-secondary mt-4" onClick={onReset}>
              تلاش مجدد
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
