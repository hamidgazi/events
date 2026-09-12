# 📅 Events Countdown & Planner

A high-performance, mobile-first Events Countdown PWA and companion Native Android Application with live home screen widgets.

- **GitHub Repository**: [https://github.com/hamidgazi/events](https://github.com/hamidgazi/events)
- **Live PWA App**: [https://hamidgazi.github.io/events/](https://hamidgazi.github.io/events/)
- **Prebuilt APK**: `EventsCountdown.apk` (12.4 MB)

---

## ⚡ Quick Start

- **Open App**: Double-click `OPEN_APP.bat` or open `index.html` in your browser.
- **Deploy to GitHub**: Double-click `push_to_github.bat`.
- **Install on Android**: Copy `EventsCountdown.apk` to your phone or build via `android/`.

---

## 📁 Clean Directory Structure

```
01-Events-Countdown/
├── OPEN_APP.bat            # ⚡ 1-Click launcher to open app in browser
├── push_to_github.bat      # 🚀 1-Click script to sync & deploy to GitHub
├── index.html              # 🌐 Primary PWA application (served by GitHub Pages)
├── events.html             # 🛠️ Source HTML application file
├── EventsCountdown.apk     # 📱 Prebuilt installable Android package (12.4 MB)
├── README.md               # 📖 Project documentation
├── manifest.json           # ⚙️ PWA web app manifest
├── sw.js                   # ⚙️ Service Worker offline caching script
├── version.json            # ⚙️ Version tracking manifest
│
├── icons/                  # 🎨 All application icons & favicons
├── android/                # 🤖 Native Android Studio project (Compose & Widgets)
├── docs/                   # 📝 Developer changelogs & architecture notes
└── tests/                  # 🧪 Automated & manual test suites
```