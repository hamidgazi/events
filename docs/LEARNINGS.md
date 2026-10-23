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

### 3. Active-Only Event Counting & Home Screen Widget Exclusion
* **Finding**: Counting total events with `events.length` or displaying past events on home screen widgets as "X days ago" causes user frustration because countdown tools are meant to track upcoming obligations.
* **Solution**:
  1. In `updateFilterCounts()`, filter events with `daysLeft(e.date) >= 0` before computing `counts.all` and category counts `counts[k]`. Past events are segregated into the collapsible past events view.
  2. In Android `EventsWidgetProvider.kt`, enforce `diffDays >= 0` during `parseAndSortEvents()` so past events never take over the widget. When no active events remain, the widget transitions to an elegant empty state.

---

## 🧠 Cognitive Ergonomics & Mobile UI Psychology (v1.2.0 Redesign)

### 1. Hero Countdown Spotlight & Temporal Anchoring
* **Finding**: A long flat list forces the user's brain to scan and compare every date to find their most urgent priority, increasing decision fatigue.
* **Solution**: Spotlight the single nearest active event in a prominent **Hero Card** anchored at the top of the viewport. Featuring live seconds/minutes tickers and an urgency-tuned ambient glow, users instantly grasp their next deadline in under 200ms without scrolling.

### 2. Miller's Law Horizon Chunking (7±2 Working Memory)
* **Finding**: Unchunked lists exceeding 7 items overwhelm short-term working memory.
* **Solution**: Chunk subsequent events into distinct psychological time horizons:
  - **🔥 This Week (1–7 days)**: Immediate high-priority focus.
  - **🗓️ This Month (8–30 days)**: Mid-range planning window.
  - **⏳ Later On (>30 days)**: Low-urgency upcoming milestones.
* **Result**: Each bucket rarely exceeds 3–5 items, keeping cognitive load well within Miller's $7 \pm 2$ limit and providing clear temporal structure.

### 3. Bottom Thumb Dock (Steven Hoober Thumb Zone)
* **Finding**: Modern smartphones have 6.5"+ displays. Placing primary actions (like Add Event, Filters, and Settings) in top headers forces painful finger overextension or awkward two-handed grips.
* **Solution**: Transition to a floating glassmorphic **Bottom Thumb Dock** pinned to the lower edge with `env(safe-area-inset-bottom)`. The elevated `[+]` FAB sits squarely in the user's natural thumb sweep arc, while secondary options (Export, Import, Sound, Share) are tucked into an ergonomic `(⋯) More` bottom sheet.

### 4. Zero-Dependency RFC 5545 iCalendar (.ics) Generation
* **Finding**: Mobile users frequently want countdown events added to their phone's native Google Calendar or Apple Calendar without signing into third-party cloud integrations or OAuth APIs.
* **Solution**: Format an RFC 5545 standard `.ics` payload directly in vanilla JavaScript:
  ```javascript
  const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Events Countdown App//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:' + (evt.id || Date.now()) + '@eventscountdown.app',
      'DTSTART;VALUE=DATE:' + dtStart,
      'DTEND;VALUE=DATE:' + dtEnd,
      'SUMMARY:' + evt.name,
      'DESCRIPTION:' + (evt.notes || ''),
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
  ].join('\r\n');
  ```
  Triggering download via a data `Blob` (`text/calendar;charset=utf-8`) immediately prompts Android and iOS to open the event in the device's default Calendar app with 1 tap.

### 5. Smart Keyword Auto-Categorization & Tactile Chips
* **Finding**: Dropdown selects (`<select>`) have high interaction friction on touchscreens, requiring 3-4 taps to open an OS picker and choose an option.
* **Solution**: Replace standard dropdowns with horizontal scrollable category chip pills and bind an `input` listener to the title field. As the user types (e.g. *"Doctor checkup"*, *"Mom birthday"*), the app instantly auto-detects the matching category (`reminder`, `birthday`), highlights the corresponding chip, and displays a subtle `✨ Auto-detected Reminder` feedback badge.


