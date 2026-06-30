# ⚡ Offline Media Compressor (کمپرسور آفلاین مدیا)

یک ابزار وب کاملاً آفلاین، امن و بسیار سریع برای فشرده‌سازی ویدیو و تصویر در مرورگر کاربر. این پروژه بدون نیاز به ارسال حتی ۱ بایت اطلاعات یا فایل به سرور‌های خارجی کار می‌کند و حریم خصوصی کاربران را ۱۰۰٪ تضمین می‌کند.

---

## ✨ ویژگی‌های کلیدی

- **🔒 ۱۰۰٪ آفلاین و حامی حریم خصوصی:** تمام پردازش‌ها (انکود ویدیو و تصویر) مستقیماً روی مرورگر دستگاه کاربر انجام می‌شود.
- **🎬 فشرده‌سازی قدرتمند ویدیو با FFmpeg.wasm:**
  - استفاده از هسته چند‌هسته‌ای (**Multi-Threaded WebAssembly**) جهت حداکثر سرعت ممکن.
  - پشتیبانی از تنظیم پریست سرعت انکود (پیش‌فرض روی `ultrafast` جهت اجرای سریع در مرورگر).
  - قابلیت تغییر رزولوشن (1080p, 720p, 480p, 360p) و کنترل دقیق نرخ فشرده‌سازی (CRF).
- **🖼️ فشرده‌سازی و تغییر فرمت تصاویر:**
  - پشتیبانی از فرمت‌های مدرن **WebP**، **JPEG** و **PNG**.
  - تغییر ابعاد (تغییر سایز هوشمند با حفظ تناسب ابعاد).
  - پیش‌نمایش زنده مقایسه‌ای (اسلایدر Before / After).
- **🎨 طراحی مدرن (Glassmorphism & Dark Mode):** رابط کاربری بسیار جذاب، واکنش‌گرا و سریع طراحی شده با React و Vanilla CSS.

---

## 🛠️ فناوری‌های استفاده شده

- **Core & Frontend:** React 19 + Vite
- **Video Engine:** `@ffmpeg/ffmpeg` + `@ffmpeg/core-mt` (Multi-threaded WebAssembly)
- **Image Engine:** HTML5 Canvas API
- **Styling:** Custom Modern Vanilla CSS (Glassmorphism UI)

---

## 🚀 راهنمای نصب و اجرا به صورت محلی

### ۱. دریافت پروژه
```bash
git clone https://github.com/YOUR_USERNAME/offline-compressor.git
cd offline-compressor
```

### ۲. نصب وابستگی‌ها
```bash
npm install
```

### ۳. دریافت فایل‌های آفلاین موتور FFmpeg (در صورت نیاز)
فایل‌های WebAssembly به صورت محلی در پوشه `public/ffmpeg` قرار دارند. جهت دانلود یا بروزرسانی دستی اسکریپت زیر را اجرا کنید:
```bash
node scripts/download-ffmpeg.js
```

### ۴. اجرای سرور توسعه محلی
```bash
npm run dev
```

> **توجه مهم درباره Cross-Origin Isolation:**  
> جهت کارکرد صحیح پردازش موازی و `SharedArrayBuffer` در مرورگر، هدرهای امنیتی `Cross-Origin-Opener-Policy: same-origin` و `Cross-Origin-Embedder-Policy: require-corp` در فایل `vite.config.js` تنظیم شده‌اند.

---

## 📄 لایسنس
این پروژه تحت لایسنس MIT منتشر شده و استفاده و توسعه آن برای عموم آزاد است.
