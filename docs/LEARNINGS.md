# 📚 Project Learnings & Technical Lessons (Events Countdown)

This document records architectural decisions, critical mobile quirks, operating system behaviors, and lessons learned during development so they can be reused across future projects.

---

## 📱 Mobile PWA & WebAPK Quirks

### 1. WebAPK Package Freezing
* **Finding**: When an app is installed on Android via Chrome ("Install app" or "Add to Home screen"), Android creates an actual native application (`.apk`) using Google's WebAPK minting service.
* **Quirk**: The launcher icon and the native opening splash screen are compiled **directly into the installed APK**. Even if the website icons are changed on the server, the phone will keep showing the old icon on the launcher and splash screen until either the old app is uninstalled and re-added, or the WebAPK package ID changes.
* **Lesson**: Always version the manifest `id` property (e.g. `"id": "events-countdown-pwa-v112"`) and provide query-busted icon paths (`icon.png?v=...`) to force Android to recognize a new app identity.

### 2. Icon Sizing & Aspect Ratio Rendering
* **Finding**: When capturing PNGs from SVG using headless browsers, setting the outer window size or element screenshot without resetting body margins (Chrome default `margin: 8px`) or taking screenshots of an element with incomplete viewports results in cropped/sliced images (e.g. `192x49` or `504x369`).
* **Solution**: Use an in-browser HTML5 `<canvas>` rasterizer via `ctx.drawImage(img, 0, 0, targetSize, targetSize)` and `canvas.toDataURL('image/png')`. This produces bit-perfect, unclipped square PNGs (exact `512x512` and `192x192`).
* **Android Maskable Safe Zone**: Android adaptive icons apply circular or squircle masks that crop the outer 10-20% of an icon. Maskable icons must have a full-bleed background (e.g. `#0d1117`) with the core graphic centered within the 40% radius safe circle.

### 3. Safari Apple Touch Icon Limitations
* **Finding**: iOS Safari strictly requires a real PNG image file for `<link rel="apple-touch-icon">`. It completely ignores SVG and SVG data-URIs (`data:image/svg+xml,...`). If an SVG is linked, iOS displays a blank or generic gray icon.
* **Solution**: Always include `<link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">` pointing to a physical PNG file.

---

## ⚡ Zero-Latency Startup Engineering

### 1. Navigation Cache-First in Service Workers
* **Finding**: Standard Stale-While-Revalidate on navigation requests still incurs a noticeable 1-3 second delay on mobile while Chrome initiates a network probe.
* **Solution**: Intercept `event.request.mode === 'navigate'` and immediately return `caches.match('index.html')`. This yields instant 0ms cold-start launches even on slow mobile networks.
* **Deferred Operations**: Always defer remote update checks (e.g. `version.json`) by 1.5–2 seconds and register the Service Worker inside `window.addEventListener('load')` so that network calls never compete with initial UI rendering.

### 2. CSS Content Containment
* **Finding**: In long lists of animated/swipeable cards, the browser recalculates layout and repaints for cards off-screen.
* **Solution**: Applying `content-visibility: auto` and `contain-intrinsic-size: 0 100px` allows the browser layout engine to skip rendering off-screen DOM nodes, making initial page mount and scroll 10x faster.

---

## 🤖 Android Native Hybrid Architecture

### 1. Ultra-Lightweight Native Wrappers
* **Finding**: Standard mobile frameworks (Flutter, React Native) produce 30–80 MB APKs.
* **Solution**: A pure vanilla Android Native `WebView` wrapper with Java 21 and zero third-party dependencies produces a tiny **~1.5 MB APK** that launches instantly and uses minimal RAM/battery.

### 2. Bidirectional Web-to-Widget Synchronization
* **Pattern**: Expose `@JavascriptInterface` on the Android `WebView`.
* **Flow**:
  1. User creates/edits event in HTML $\rightarrow$ JavaScript calls `window.AndroidWidget.syncEvents(json)`.
  2. Android app writes JSON to `SharedPreferences`.
  3. Android triggers `AppWidgetManager.notifyAppWidgetViewDataChanged()`.
  4. The Home Screen Widget reflects the new countdown immediately on the phone wallpaper without opening the app.
