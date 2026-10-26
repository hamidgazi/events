# 📅 Events Countdown & Birthday Tracker (v1.6.1)

A mobile-first, high-performance Events Countdown PWA and companion Native Android Application equipped with real-time Home Screen Widgets (4x2 and 2x2), Pristine Date-Focused Cards (zero family labels, zero star/zodiac signs), Dual Sorting Engine (`📅 Upcoming` vs `👑 Eldest First`), Birthdays Tracked Pulse Summary Bar, Synchronized Versioning across Home and More Menu, Medium Ergonomic Card Rows (88px) with Complete Age Breakdown (`Age: 31 yrs, 7 mos, 9 days`), Smart Horizon Countdown (`7M 12D` for >1 month, exact days for ≤30 days), Perpetual Birthday Tracker & Age Engine, Hero Countdown Spotlight, Miller's Law Horizon Chunking, ergonomic Bottom Thumb Dock, 1-tap WhatsApp greetings, 1-tap iCalendar (.ics) export, and offline-first client storage.

- **GitHub Repository**: [https://github.com/hamidgazi/events](https://github.com/hamidgazi/events)
- **Live PWA App**: [https://hamidgazi.github.io/events/](https://hamidgazi.github.io/events/)
- **Installable Android Package**: [EventsCountdown.apk](file:///C:/Users/Shop%20PC%202/OneDrive/Desktop/Antigravity%20Files/01-Events-Countdown/EventsCountdown.apk) (12.9 MB)

---

## 📦 Deliverables Catalog

| Output | Type | Direct Link | Description |
| :--- | :--- | :--- | :--- |
| **Android APK** | Native Package | [EventsCountdown.apk](file:///C:/Users/Shop%20PC%202/OneDrive/Desktop/Antigravity%20Files/01-Events-Countdown/EventsCountdown.apk) | Compiled release package with 4x2 & 2x2 home screen widgets |
| **Production PWA** | Web Application | [index.html](file:///C:/Users/Shop%20PC%202/OneDrive/Desktop/Antigravity%20Files/01-Events-Countdown/index.html) | Standalone, zero-dependency offline web app (GitHub Pages root) |
| **Source App** | Source Code | [events.html](file:///C:/Users/Shop%20PC%202/OneDrive/Desktop/Antigravity%20Files/01-Events-Countdown/events.html) | Canonical source HTML app with medium card & smart horizon architecture |
| **Family Backup** | JSON Dataset | [family_birthdays.json](file:///C:/Users/Shop%20PC%202/OneDrive/Desktop/Antigravity%20Files/01-Events-Countdown/family_birthdays.json) | Canonical 13-member family birthday backup file for 1-click import |
| **1-Click Launcher** | Batch Script | [OPEN_APP.bat](file:///C:/Users/Shop%20PC%202/OneDrive/Desktop/Antigravity%20Files/01-Events-Countdown/OPEN_APP.bat) | Instant desktop launcher to open application in default browser |
| **1-Click Sync** | Batch Script | [push_to_github.bat](file:///C:/Users/Shop%20PC%202/OneDrive/Desktop/Antigravity%20Files/01-Events-Countdown/push_to_github.bat) | Git commit, build verify, and GitHub push deployment script |
| **Test Suite** | Node.js Suite | [test_events.js](file:///C:/Users/Shop%20PC%202/OneDrive/Desktop/Antigravity%20Files/01-Events-Countdown/tests/test_events.js) | 28-point automated verification and DOM simulation suite |

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
├── family_birthdays.json   # 🎂 Standalone 13-member family birthday backup file
│
├── docs/                   # 📝 Developer changelogs, architecture notes & learnings
│   ├── LEARNINGS.md        # Project-specific technical learnings
│   └── PROGRESS.md         # Detailed chronological development log
│
└── tests/                  # 🧪 Automated verification suite
    └── test_events.js      # 28 automated tests covering family roster, deduplicating migration, dual sorting, & counts
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

### 4. Deploy to GitHub
```powershell
.\push_to_github.bat
```

---

## 🛡️ Automated Quality & Verification Status

| Check | Target | Status | Guarantee |
| :--- | :--- | :--- | :--- |
| **Family Roster** | Authentic 13 Members | ✅ Verified | All 13 family members integrated with ISO birth dates and completed age breakdown |
| **Smart Migration** | Deduplicating Auto-Merge | ✅ Verified | Preserves user's manually entered Amina & Hamid; cleanly purges legacy dummy samples |
| **Dual Sorting** | Upcoming vs Eldest First | ✅ Verified | 1-tap toggle between upcoming countdown (Hamza in 7d) and age hierarchy (Siraj [60] down to Yusuf [3]) |
| **Family Pulse** | Real-Time Summary Bar | ✅ Verified | Subtle banner displaying member count and immediate upcoming birthday |
| **Card Sizing** | Medium Ergonomic Card (88px) | ✅ Verified | 88px 3-tier layout, 44px avatar, generous touch target |
| **Smart Horizon** | Dynamic Countdown Format | ✅ Verified | `7M 12D` for >1 mo, exact days for ≤30d, `🎉 TODAY!` on day of event |
| **Birthday Engine** | `computeBirthdayMetrics()` | ✅ Verified | Accurate age calculation (yrs, mos, days, days lived) + perpetual rollover |
| **Active-Only Counts** | `updateFilterCounts()` | ✅ Verified | Only active upcoming events (`daysLeft >= 0`) counted in badges |
| **Widget Exclusions** | `EventsWidgetProvider` | ✅ Verified | Past events (`diffDays < 0`) excluded from Home Screen widgets |
| **Automated Tests** | `node tests/test_events.js` | ✅ 28/28 Passed | Verified family roster, deduplicating migration, dual sorting, pulse bar, audio |
| **Script Compilation** | `node --check` | ✅ 0 Errors | Pure ES6 JavaScript cleanly parsed with zero runtime syntax errors |
| **Sync Parity** | `events.html` vs `index.html` | ✅ 100% Identical | Bit-for-bit parity guaranteed across root and Android assets |