# 📅 Events Countdown & Planner

A high-performance, mobile-first Events Countdown PWA and companion Native Android Application with live home screen widgets.

- **GitHub Repository**: [https://github.com/hamidgazi/events](https://github.com/hamidgazi/events)
- **Live PWA App**: [https://hamidgazi.github.io/events/](https://hamidgazi.github.io/events/)
- **Prebuilt APK**: EventsCountdown.apk (12.4 MB)

---

## 🌟 Key Features

### 1. Web / Progressive Web App (PWA)
- **Real-Time Countdown Engine**: Calculates days, hours, minutes, and seconds remaining with instant visual feedback.
- **Physics-Based Swipe Gestures**: Smooth 1:1 touch/pointer tracking with spring release dynamics and red swipe-to-delete action.
- **Data Backup & Restore**: Clean JSON export and import supporting both **Merge** and **Replace All** modes.
- **Micro-Haptics & Audio**: Synthesized Web Audio API sound feedback for taps and completions (with mute toggle).
- **Celebration Confetti**: Visual particle celebration when an event falls on the current day.
- **Zero-Latency Offline Mode**: Service worker (sw.js) cache-first strategy for instant 0ms offline loads.
- **Multi-Role Portals**: Includes Admin Dashboard (dmin_dashboard.html) and Visitor View (events_visitor.html).

### 2. Native Android App (ndroid/)
- **Jetpack Compose + Kotlin**: Native modern Android architecture.
- **Live Home Screen Widgets**:
  - 4x2 Widget: Detailed view showing upcoming event names, countdowns, and quick-add actions.
  - 2x2 Widget: Compact square widget highlighting the next closest event.
- **Bi-Directional Bridge**: Synchronizes events stored in PWA localStorage directly to Android widget SharedPreferences.

---

## 📁 Project Structure

`
01-Events-Countdown/
├── index.html              # Primary PWA application (served by GitHub Pages)
├── events.html             # Source HTML application file
├── admin_dashboard.html    # Admin management panel
├── events_visitor.html     # Read-only visitor view
├── approval_test.html      # UI & gesture acceptance test suite
├── EventsCountdown.apk     # Prebuilt installable Android package
├── manifest.json           # PWA web app manifest
├── sw.js                   # Service Worker offline caching script
├── version.json            # Version tracking manifest
├── push_to_github.bat      # 1-Click script to sync & deploy to GitHub
├── android/                # Native Android Studio project
│   ├── app/                # Android app module (Kotlin, Compose, Widgets)
│   ├── build.gradle.kts    # Gradle build configuration
│   └── gradlew.bat         # Gradle wrapper executable
└── tests/                  # End-to-end Python / Playwright test suite
`

---

## 🚀 How to Deploy / Push Changes

Simply double-click:
`at
push_to_github.bat
`
This script will:
1. Synchronize events.html to index.html.
2. Stage all web assets, manifest, and icons.
3. Commit and push directly to origin/main on GitHub.
4. Your changes go live instantly on [GitHub Pages](https://hamidgazi.github.io/events/).
