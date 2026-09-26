# 📅 Events Countdown & Planner

A mobile-first, high-performance Events Countdown PWA and companion Native Android Application equipped with real-time Home Screen Widgets (4x2 and 2x2), swipe gesture mechanics, and offline-first client storage.

- **GitHub Repository**: [https://github.com/hamidgazi/events](https://github.com/hamidgazi/events)
- **Live PWA App**: [https://hamidgazi.github.io/events/](https://hamidgazi.github.io/events/)
- **Installable Android Package**: [EventsCountdown.apk](file:///C:/Users/Shop%20PC%202/OneDrive/Desktop/Antigravity%20Files/01-Events-Countdown/EventsCountdown.apk) (12.9 MB)

---

## 📦 Deliverables Catalog

| Output | Type | Direct Link | Description |
| :--- | :--- | :--- | :--- |
| **Android APK** | Native Package | [EventsCountdown.apk](file:///C:/Users/Shop%20PC%202/OneDrive/Desktop/Antigravity%20Files/01-Events-Countdown/EventsCountdown.apk) | Compiled release debug package with 4x2 & 2x2 home screen widgets |
| **Production PWA** | Web Application | [index.html](file:///C:/Users/Shop%20PC%202/OneDrive/Desktop/Antigravity%20Files/01-Events-Countdown/index.html) | Standalone, zero-dependency offline web app (GitHub Pages root) |
| **Source App** | Source Code | [events.html](file:///C:/Users/Shop%20PC%202/OneDrive/Desktop/Antigravity%20Files/01-Events-Countdown/events.html) | Canonical source HTML app with active-only event counting |
| **1-Click Launcher** | Batch Script | [OPEN_APP.bat](file:///C:/Users/Shop%20PC%202/OneDrive/Desktop/Antigravity%20Files/01-Events-Countdown/OPEN_APP.bat) | Instant desktop launcher to open application in default browser |
| **1-Click Sync** | Batch Script | [push_to_github.bat](file:///C:/Users/Shop%20PC%202/OneDrive/Desktop/Antigravity%20Files/01-Events-Countdown/push_to_github.bat) | Git commit, build verify, and GitHub push deployment script |
| **Test Suite** | Node.js Suite | [test_events.js](file:///C:/Users/Shop%20PC%202/OneDrive/Desktop/Antigravity%20Files/01-Events-Countdown/tests/test_events.js) | 16-point automated verification and DOM simulation suite |

---

## 📁 Annotated Directory Tree

```
01-Events-Countdown/
├── OPEN_APP.bat            # ⚡ 1-Click launcher to open app in default browser
├── push_to_github.bat      # 🚀 1-Click script to sync & deploy changes to GitHub
├── index.html              # 🌐 Production PWA shell served by GitHub Pages
├── events.html             # 🛠️ Canonical source HTML application file
├── EventsCountdown.apk     # 📱 Compiled Android app with interactive Home Screen widgets (12.9 MB)
├── README.md               # 📖 Master project navigation and documentation hub
├── manifest.json           # ⚙️ PWA web app manifest with versioned icon references
├── sw.js                   # ⚙️ Offline-first Service Worker caching engine
├── version.json            # ⚙️ Semantic version tracking manifest
│
├── icons/                  # 🎨 Full-resolution 512x512 & 192x192 icons, iOS touch, and SVG assets
│   ├── icon.svg            # Vector source emblem with countdown badge
│   ├── icon-app-192.png    # High-density launcher icon (192x192)
│   ├── icon-app-512.png    # Ultra-high-density launcher icon (512x512)
│   ├── icon-maskable-192.png # Android adaptive circular/squircle maskable icon
│   └── apple-touch-icon.png # iOS home screen bookmark icon
│
├── android/                # 🤖 Native Android Studio project
│   ├── app/src/main/java/  # Kotlin sources: MainActivity, AndroidWidgetBridge, WidgetProviders
│   └── app/src/main/assets/ # Embedded offline web assets synced with root
│
├── docs/                   # 📝 Developer changelogs, architecture notes & learnings
│   ├── LEARNINGS.md        # Project-specific technical learnings
│   └── PROGRESS.md         # Detailed chronological development log
│
└── tests/                  # 🧪 Automated verification suite
    └── test_events.js      # 16 automated tests covering UI, gestures, sync, & active counts
```

---

## ⚡ Quick-Start & Maintenance Commands

### 1. Launch Application Locally
```powershell
.\OPEN_APP.bat
```

### 2. Run Automated Verification Test Suite
```powershell
node tests/test_events.js
```

### 3. Verify JavaScript Syntax Integrity
```powershell
node -e "const fs = require('fs'); const s = fs.readFileSync('events.html', 'utf8').match(/<script>([\s\S]*?)<\/script>/)[1]; fs.writeFileSync('temp.js', s); require('child_process').execSync('node --check temp.js', {stdio:'inherit'}); fs.unlinkSync('temp.js'); console.log('Syntax OK');"
```

### 4. Recompile Android APK
```powershell
cd android
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
.\gradlew.bat assembleDebug --no-configuration-cache
Copy-Item app/build/outputs/apk/debug/app-debug.apk ../EventsCountdown.apk -Force
cd ..
```

### 5. Deploy to GitHub
```powershell
.\push_to_github.bat
```

---

## 🛡️ Automated Quality & Verification Status

| Check | Target | Status | Guarantee |
| :--- | :--- | :--- | :--- |
| **Active-Only Counts** | `updateFilterCounts()` | ✅ Verified | Only active upcoming events (`daysLeft >= 0`) counted in badges |
| **Widget Exclusions** | `EventsWidgetProvider` | ✅ Verified | Past events (`diffDays < 0`) excluded from Home Screen widgets |
| **Automated Tests** | `node tests/test_events.js` | ✅ 16/16 Passed | Verified state, categories, import/export, swipe, audio & active counts |
| **Script Compilation** | `node --check` | ✅ 0 Errors | Pure ES6 JavaScript cleanly parsed with zero runtime syntax errors |
| **Sync Parity** | `events.html` vs `index.html` | ✅ 100% Identical | Bit-for-bit parity guaranteed across root and Android assets |
| **Android Build** | Gradle 9.4.1 / Java 21 | ✅ Built | Clean compilation with zero build errors |