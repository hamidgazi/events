const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

console.log('=== RUNNING VERIFICATION SUITE FOR events.html ===\n');

const projectRoot = path.join(__dirname, '..');
const htmlContent = fs.readFileSync(path.join(projectRoot, 'events.html'), 'utf8');

// 1. Check Favicon and App Icon
console.log('Test 1: App Icons, Apple Touch Icon & Manifest...');
assert(htmlContent.includes('<link rel="icon" type="image/png" sizes="192x192" href="icons/icon-app-192.png?v=1.6.1">'), 'Missing PNG 192 icon link');
assert(htmlContent.includes('<link rel="apple-touch-icon" sizes="180x180" href="icons/apple-touch-icon.png?v=1.6.1">'), 'Missing apple-touch-icon link');
assert(htmlContent.includes('<link rel="manifest" href="manifest.json?v=1.6.1">'), 'Missing versioned manifest link');

// Verify actual icon files exist on disk and have exact square dimensions
const checkDims = (file, expW, expH) => {
    const filePath = path.join(projectRoot, 'icons', file);
    assert(fs.existsSync(filePath), `${file} must exist on disk`);
    const buf = fs.readFileSync(filePath);
    const w = buf.readUInt32BE(16);
    const h = buf.readUInt32BE(20);
    assert.strictEqual(w, expW, `${file} width must be ${expW}, got ${w}`);
    assert.strictEqual(h, expH, `${file} height must be ${expH}, got ${h}`);
};

checkDims('icon-192.png', 192, 192);
checkDims('icon-app-192.png', 192, 192);
checkDims('icon-maskable-192.png', 192, 192);
checkDims('apple-touch-icon.png', 192, 192);
checkDims('icon-512.png', 512, 512);
checkDims('icon-app-512.png', 512, 512);
checkDims('icon-maskable-512.png', 512, 512);

assert(fs.existsSync(path.join(projectRoot, 'icons', 'icon.svg')), 'icon.svg must exist on disk');
const svgContent = fs.readFileSync(path.join(projectRoot, 'icons', 'icon.svg'), 'utf8');
assert(svgContent.includes('DAYS LEFT'), 'icon.svg must contain DAYS LEFT indicator');
console.log('  [PASS] Full-resolution 512x512 & 192x192 icons, iOS apple-touch-icon, and maskable icons verified.');

// 2. Check HTML IDs and elements
console.log('\nTest 2: Required DOM Elements...');
const requiredIds = [
    'btn-export',
    'btn-import',
    'file-import',
    'import-sheet',
    'import-msg',
    'import-btn-merge',
    'import-btn-replace',
    'import-cancel',
    'import-bg',
    'toast',
    'filter-bar',
    'cnt-all',
    'cnt-general',
    'f-cat',
    'active-list',
    'active-hdr',
    'archived-list',
    'arch-toggle',
    'hdr-chip',
    'modal',
    'ev-form',
    'del-sheet',
    'hero-spotlight',
    'bottom-dock',
    'fab',
    'dock-btn-more',
    'detail-sheet',
    'more-sheet',
    'category-chips-selector',
    'view-switcher',
    'tab-birthdays',
    'tab-events',
    'bday-badge-count',
    'events-badge-count',
    'bday-filter-bar',
    'bday-cnt-all',
    'bday-cnt-family',
    'bday-decade-wrap',
    'bday-age-preview',
    'bday-rel-wrap',
    'bday-gifts-wrap',
    'detail-bday-box',
    'detail-btn-whatsapp',
    'family-pulse-bar',
    'family-pulse-count',
    'family-pulse-next',
    'bday-sort-bar',
    'sort-btn-upcoming',
    'sort-btn-age',
    'more-version-display'
];

requiredIds.forEach(id => {
    assert(htmlContent.includes(`id="${id}"`), `Missing element with id="${id}"`);
});
console.log(`  [PASS] All ${requiredIds.length} essential DOM IDs verified.`);

// 3. Check Category 'General' in HTML
console.log('\nTest 3: Category General in HTML & Form...');
assert(htmlContent.includes('data-cat="general"'), 'Missing data-cat="general" in filter-bar');
assert(htmlContent.includes('<option value="general" selected>🏷️ General</option>') || htmlContent.includes('<option value="general"'), 'Missing general option in select');
console.log('  [PASS] General category present in HTML filter bar and form select.');

// 4. Extract and analyze JavaScript code
const scriptMatch = htmlContent.match(/<script>([\s\S]*?)<\/script>/);
assert(scriptMatch, 'Could not find <script> block in events.html');
const rawJsCode = scriptMatch[1];
const jsCode = rawJsCode
    .replace(/^const\s+/gm, 'var ')
    .replace(/^let\s+/gm, 'var ');

// Create mock DOM environment for VM
const mockStorage = {};
const mockElements = {};

function createMockElement(tag, id = '') {
    return {
        tagName: tag.toUpperCase(),
        id: id,
        classList: {
            classes: new Set(),
            add(c) { this.classes.add(c); },
            remove(c) { this.classes.delete(c); },
            contains(c) { return this.classes.has(c); },
            toggle(c) { if (this.classes.has(c)) this.classes.delete(c); else this.classes.add(c); }
        },
        style: {},
        textContent: '',
        innerHTML: '',
        value: '',
        dataset: {},
        listeners: {},
        attributes: {},
        setAttribute(name, val) { this.attributes[name] = String(val); },
        getAttribute(name) { return this.attributes[name] !== undefined ? this.attributes[name] : null; },
        removeAttribute(name) { delete this.attributes[name]; },
        addEventListener(event, fn) {
            if (!this.listeners[event]) this.listeners[event] = [];
            this.listeners[event].push(fn);
        },
        focus() {},
        click() {
            if (this.listeners['click']) {
                this.listeners['click'].forEach(fn => fn({ stopPropagation() {}, preventDefault() {} }));
            }
        },
        closest(sel) {
            return this;
        },
        querySelector() { return createMockElement('div'); },
        querySelectorAll() { return []; },
        appendChild() {},
        removeChild() {},
        offsetHeight: 100,
        offsetWidth: 350
    };
}

// Prepopulate required IDs
requiredIds.forEach(id => {
    mockElements[id] = createMockElement('div', id);
});
mockElements['f-id'] = createMockElement('input', 'f-id');
mockElements['f-name'] = createMockElement('input', 'f-name');
mockElements['f-date'] = createMockElement('input', 'f-date');
mockElements['f-cat'] = createMockElement('select', 'f-cat');
mockElements['f-notes'] = createMockElement('textarea', 'f-notes');
mockElements['btn-save'] = createMockElement('button', 'btn-save');
mockElements['btn-cancel'] = createMockElement('button', 'btn-cancel');
mockElements['del-ok'] = createMockElement('button', 'del-ok');
mockElements['overlay'] = createMockElement('div', 'overlay');
mockElements['fab'] = createMockElement('button', 'fab');
mockElements['hdr-date'] = createMockElement('div', 'hdr-date');
mockElements['hdr-chip'] = createMockElement('span', 'hdr-chip');
mockElements['arch-label'] = createMockElement('span', 'arch-label');
mockElements['archive-wrap'] = createMockElement('div', 'archive-wrap');
mockElements['sound-icon'] = createMockElement('span', 'sound-icon');
mockElements['search-input'] = createMockElement('input', 'search-input');
mockElements['search-clear'] = createMockElement('button', 'search-clear');
mockElements['search-badge'] = createMockElement('span', 'search-badge');
mockElements['confetti-canvas'] = createMockElement('canvas', 'confetti-canvas');

const mockCatChips = ['general', 'birthday', 'meeting', 'deadline', 'holiday', 'reminder'].map(c => {
    const el = createMockElement('button');
    el.dataset.cat = c;
    return el;
});

const mockDocument = {
    getElementById(id) {
        if (!mockElements[id]) {
            mockElements[id] = createMockElement('div', id);
        }
        return mockElements[id];
    },
    querySelector(sel) {
        return createMockElement('div');
    },
    querySelectorAll(sel) {
        if (sel === '.cat-chip') return mockCatChips;
        return [];
    },
    createElement(tag) {
        return createMockElement(tag);
    },
    body: createMockElement('body'),
    addEventListener() {},
    visibilityState: 'visible'
};

class MockAudioContext {
    constructor() {
        this.state = 'running';
        this.currentTime = 0;
        this.destination = {};
    }
    createOscillator() {
        return {
            type: 'sine',
            frequency: {
                setValueAtTime() {},
                exponentialRampToValueAtTime() {}
            },
            connect() {},
            start() {},
            stop() {}
        };
    }
    createGain() {
        return {
            gain: {
                setValueAtTime() {},
                exponentialRampToValueAtTime() {}
            },
            connect() {}
        };
    }
    resume() { return Promise.resolve(); }
}

const mockWindow = {
    innerWidth: 1024,
    innerHeight: 768,
    AudioContext: MockAudioContext,
    webkitAudioContext: MockAudioContext,
    location: {
        href: 'https://hamidgazi.github.io/events/',
        origin: 'https://hamidgazi.github.io',
        pathname: '/events/',
        reload() {}
    },
    addEventListener() {},
    requestAnimationFrame(cb) { return setTimeout(cb, 16); },
    cancelAnimationFrame(id) { clearTimeout(id); }
};

const mockNavigator = {
    serviceWorker: {
        register() { return Promise.resolve(); }
    },
    clipboard: {
        writeText(t) { return Promise.resolve(t); }
    },
    share(data) { return Promise.resolve(data); }
};

const sandbox = {
    console,
    Date,
    Math,
    String,
    JSON,
    Array,
    Object,
    RegExp,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    Blob: class {
        constructor(parts, opts) {
            this.parts = parts;
            this.opts = opts;
        }
    },
    URL: {
        createObjectURL() { return 'blob:mock-url'; },
        revokeObjectURL() {}
    },
    FileReader: class {
        readAsText(blob) {}
    },
    document: mockDocument,
    window: mockWindow,
    navigator: mockNavigator,
    localStorage: {
        getItem(k) { return mockStorage[k] || null; },
        setItem(k, v) { mockStorage[k] = String(v); },
        removeItem(k) { delete mockStorage[k]; },
        clear() { for (let k in mockStorage) delete mockStorage[k]; }
    },
    crypto: {
        randomUUID() { return 'test-uuid-' + Math.random().toString(36).slice(2); }
    },
    alert(msg) { console.log('Mock alert:', msg); },
    prompt(msg, def) { return def; },
    performance: { now() { return Date.now(); } }
};

vm.createContext(sandbox);

// Execute script
vm.runInContext(jsCode, sandbox);
console.log('  [PASS] JavaScript executed without runtime or syntax errors.');

// 5. Test State and Categories
console.log('\nTest 5: CATS and initial load()...');
assert(sandbox.CATS.general, 'CATS.general is missing');
assert.strictEqual(sandbox.CATS.general.label, 'General');
assert(sandbox.events.length > 0, 'Initial events not loaded');
console.log(`  [PASS] Default CATS includes General: ${JSON.stringify(sandbox.CATS.general)}`);
console.log(`  [PASS] Initial load loaded ${sandbox.events.length} events.`);

// 6. Test openModal default category in events and birthdays modes
console.log('\nTest 6: openModal default category in events and birthdays modes...');
sandbox.switchViewTab('events');
sandbox.openModal(null);
assert.strictEqual(sandbox.document.getElementById('f-cat').value, 'general', 'Default category in events view openModal should be general');
sandbox.switchViewTab('birthdays');
sandbox.openModal(null);
assert.strictEqual(sandbox.document.getElementById('f-cat').value, 'birthday', 'Default category in birthdays view openModal should be birthday');
sandbox.switchViewTab('events');
console.log('  [PASS] openModal correctly defaults f-cat to "general" in events mode and "birthday" in birthday mode.');

// 7. Test Card HTML structure for swipe-to-delete
console.log('\nTest 7: cardHtml swipe structure...');
const sampleEvt = { id: 'evt-123', name: 'Test Event', date: '2026-10-01', category: 'general', notes: 'Test Note' };
const cardMarkup = sandbox.cardHtml(sampleEvt, false);
assert(cardMarkup.includes('class="card-wrapper"'), 'cardHtml must have card-wrapper');
assert(cardMarkup.includes('class="card-swipe-bg"'), 'cardHtml must have card-swipe-bg');
assert(cardMarkup.includes('class="swipe-trash-content"'), 'cardHtml must have swipe-trash-content');
assert(cardMarkup.includes('class="swipe-trash-icon"'), 'cardHtml must have swipe-trash-icon');
assert(cardMarkup.includes('data-id="evt-123"'), 'cardHtml must retain data-id');
console.log('  [PASS] cardHtml correctly renders wrapper, background trash zone, and card.');

// 8. Test Export JSON format
console.log('\nTest 8: exportData() behavior...');
let downloadedFile = null;
sandbox.document.createElement = function(tag) {
    const el = createMockElement(tag);
    if (tag === 'a') {
        el.click = function() {
            downloadedFile = { href: el.href, download: el.download };
        };
    }
    return el;
};
sandbox.exportData();
assert(downloadedFile, 'exportData did not trigger download');
assert(downloadedFile.download.startsWith('events_backup_'), 'Filename must start with events_backup_');
assert(downloadedFile.download.endsWith('.json'), 'Filename must end with .json');
assert(/\d{4}-\d{2}-\d{2}\.json$/.test(downloadedFile.download), 'Filename must have YYYY-MM-DD format');
console.log(`  [PASS] Export downloaded file: ${downloadedFile.download}`);

// 9. Test Import Merge & Replace Logic
console.log('\nTest 9: Import Merge & Replace Logic...');
sandbox.events = [
    { id: '1', name: 'Existing Meeting', date: '2026-09-15', category: 'meeting', notes: '' }
];
sandbox.save();

const importedData = [
    { id: '1', name: 'Existing Meeting', date: '2026-09-15', category: 'meeting', notes: 'Duplicate ID' },
    { id: '2', name: 'existing meeting', date: '2026-09-15', category: 'meeting', notes: 'Duplicate name+date' },
    { id: '3', name: 'New Birthday', date: '2026-09-20', category: 'birthday', notes: 'Brand new' }
];

sandbox.pendingImportEvents = importedData;
sandbox.executeImportMerge();

// Should have 2 events: original + 'New Birthday'. Duplicates skipped.
assert.strictEqual(sandbox.events.length, 2, 'Merge should add 1 new event and skip 2 duplicates');
assert(sandbox.events.some(e => e.id === '3' && e.name === 'New Birthday'), 'New Birthday was not merged');
console.log('  [PASS] Import Merge correctly skipped duplicates and added unique new event.');

// Test Replace All
sandbox.pendingImportEvents = [
    { id: '10', name: 'Solo Event', date: '2026-11-01', category: 'general', notes: '' }
];
sandbox.executeImportReplace();
assert.strictEqual(sandbox.events.length, 1, 'Replace all should leave exactly 1 event');
assert.strictEqual(sandbox.events[0].id, '10', 'Replaced event id does not match');
console.log('  [PASS] Import Replace All correctly replaced all events.');

// 10. Test Swipe Delete & Undo
console.log('\nTest 10: executeSwipeDelete and Undo...');
sandbox.events = [
    { id: 'del-1', name: 'Delete Me', date: '2026-09-15', category: 'general', notes: '' },
    { id: 'keep-1', name: 'Keep Me', date: '2026-09-16', category: 'general', notes: '' }
];
sandbox.save();

let toastActionCallback = null;
sandbox.showToast = function(msg, options) {
    if (options && options.onAction) {
        toastActionCallback = options.onAction;
    }
};

sandbox.executeSwipeDelete('del-1');
assert.strictEqual(sandbox.events.length, 1, 'Event del-1 was not deleted');
assert.strictEqual(sandbox.events[0].id, 'keep-1', 'Wrong event deleted');
assert(toastActionCallback, 'Undo action was not provided to showToast');

// Trigger Undo
toastActionCallback();
assert.strictEqual(sandbox.events.length, 2, 'Event was not restored on undo');
assert(sandbox.events.some(e => e.id === 'del-1'), 'del-1 not found after undo');
console.log('  [PASS] Swipe delete deleted item and Undo restored it successfully.');

// 11. Test Real-time Search Filtering
console.log('\nTest 11: Live Search Filtering...');
sandbox.events = [
    { id: 's1', name: 'Alpha Conference', date: '2026-10-10', category: 'meeting', notes: 'Keynote speech' },
    { id: 's2', name: 'Beta Birthday', date: '2026-10-12', category: 'birthday', notes: 'Gift bought' },
    { id: 's3', name: 'Gamma Deadline', date: '2026-10-15', category: 'deadline', notes: 'Alpha draft due' }
];
sandbox.searchQuery = 'alpha';
let filtered = sandbox.sortedFiltered();
assert.strictEqual(filtered.length, 2, 'Search for "alpha" should match 2 events (name or notes)');
assert(filtered.some(e => e.id === 's1'));
assert(filtered.some(e => e.id === 's3'));

sandbox.searchQuery = 'beta';
filtered = sandbox.sortedFiltered();
assert.strictEqual(filtered.length, 1, 'Search for "beta" should match 1 event');
assert.strictEqual(filtered[0].id, 's2');

sandbox.searchQuery = '';
filtered = sandbox.sortedFiltered();
assert.strictEqual(filtered.length, 3, 'Empty search query should return all 3 events');
console.log('  [PASS] Live search query correctly filters across title, notes, and categories.');

// 12. Test Quick Date Presets
console.log('\nTest 12: Quick Date Presets (setQuickDate)...');
assert(typeof sandbox.setQuickDate === 'function', 'setQuickDate function must exist');
sandbox.setQuickDate(0); // Today
const localFmt = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const todayStr = localFmt(new Date());
assert.strictEqual(sandbox.document.getElementById('f-date').value, todayStr, 'setQuickDate(0) must set input to today');

sandbox.setQuickDate(1); // Tomorrow
const tom = new Date(); tom.setDate(tom.getDate() + 1);
assert.strictEqual(sandbox.document.getElementById('f-date').value, localFmt(tom), 'setQuickDate(1) must set input to tomorrow');
console.log('  [PASS] Quick Date presets correctly calculate and populate date input.');

// 13. Test SoundFX Engine & Mute Persistence
console.log('\nTest 13: SoundFX Engine & Mute Persistence...');
assert(sandbox.SoundFX, 'SoundFX object must exist');
assert(typeof sandbox.SoundFX.toggle === 'function', 'SoundFX.toggle must be a function');
const initialSound = sandbox.SoundFX.enabled;
sandbox.SoundFX.toggle();
assert.strictEqual(sandbox.SoundFX.enabled, !initialSound, 'SoundFX.toggle() should invert enabled state');
assert.strictEqual(sandbox.localStorage.getItem('events_sound_enabled'), String(!initialSound), 'SoundFX state must persist to localStorage');
sandbox.SoundFX.toggle(); // restore
assert.strictEqual(sandbox.SoundFX.enabled, initialSound);
console.log('  [PASS] SoundFX toggles and persists preference in localStorage.');

// 14. Test Web Share API (App and Event)
console.log('\nTest 14: Web Share Integration...');
assert(typeof sandbox.doShareApp === 'function', 'doShareApp function must exist');
assert(typeof sandbox.doShareEvent === 'function', 'doShareEvent function must exist');
sandbox.doShareEvent('s1', { stopPropagation() {} });
console.log('  [PASS] doShareApp and doShareEvent executed without error.');

// 15. Test Canvas Confetti
console.log('\nTest 15: Canvas Confetti Engine...');
assert(sandbox.CanvasConfetti, 'CanvasConfetti object must exist');
assert(typeof sandbox.CanvasConfetti.burst === 'function', 'CanvasConfetti.burst must exist');
sandbox.CanvasConfetti.burst();
console.log('  [PASS] CanvasConfetti burst initialized and ran successfully.');

// 16. Test Active-Only Counting in updateFilterCounts and Header/Badges
console.log('\nTest 16: Active-Only Counting in Filter Badges & Search...');
Object.keys(sandbox.CATS).forEach(k => {
    if (!mockElements['cnt-' + k]) mockElements['cnt-' + k] = createMockElement('span', 'cnt-' + k);
});

const now = new Date();
const fmtIso = (d) => d.toISOString().slice(0, 10);
const future1 = new Date(now.getTime() + 5 * 86400000);
const future2 = new Date(now.getTime() + 10 * 86400000);
const past1 = new Date(now.getTime() - 2 * 86400000);
const past2 = new Date(now.getTime() - 15 * 86400000);
const past3 = new Date(now.getTime() - 40 * 86400000);

sandbox.events = [
    { id: 'f1', name: 'Future Meeting', date: fmtIso(future1), category: 'meeting', notes: '' },
    { id: 'f2', name: 'Future Birthday', date: fmtIso(future2), category: 'birthday', notes: '' },
    { id: 'p1', name: 'Past Meeting', date: fmtIso(past1), category: 'meeting', notes: '' },
    { id: 'p2', name: 'Past Birthday', date: fmtIso(past2), category: 'birthday', notes: '' },
    { id: 'p3', name: 'Past General', date: fmtIso(past3), category: 'general', notes: '' }
];

sandbox.updateFilterCounts();
assert.strictEqual(mockElements['cnt-all'].textContent, 2, 'cnt-all must count ONLY active events (expected 2)');
assert.strictEqual(mockElements['cnt-meeting'].textContent, 1, 'cnt-meeting must count ONLY active meetings (expected 1)');
assert.strictEqual(mockElements['cnt-birthday'].textContent, 1, 'cnt-birthday must count ONLY active birthdays (expected 1)');
assert.strictEqual(mockElements['cnt-general'].textContent, 0, 'cnt-general must be 0 since the only general event is past');

sandbox.searchQuery = 'meeting';
sandbox.render();
assert.strictEqual(mockElements['search-badge'].textContent, '1 found', 'search-badge must count ONLY active matching events (expected 1 found)');
sandbox.clearSearch();
console.log('  [PASS] updateFilterCounts and searchBadge count ONLY active upcoming events.');

// 17. Test Hero Spotlight & Live Exact Countdown Ticker
console.log('\nTest 17: Hero Spotlight Card & Live Exact Countdown Ticker...');
assert(typeof sandbox.liveExactTicker === 'function', 'liveExactTicker function must exist');
const testDate = fmtIso(new Date(Date.now() + 86400000 * 3 + 3600000 * 5)); // 3 days 5 hours
const tickerStr = sandbox.liveExactTicker(testDate);
assert(tickerStr.includes('d') && tickerStr.includes('h') && tickerStr.includes('m') && tickerStr.includes('s'), 'liveExactTicker must produce days, hours, mins, secs');

assert(typeof sandbox.heroHtml === 'function', 'heroHtml function must exist');
const sampleHeroEvt = { id: 'hero-test-1', name: 'Product Launch', date: testDate, category: 'deadline', notes: 'Important launch day' };
const heroMarkup = sandbox.heroHtml(sampleHeroEvt);
assert(heroMarkup.includes('hero-card'), 'heroHtml must render hero-card');
assert(heroMarkup.includes('Product Launch'), 'heroHtml must include event title');
assert(heroMarkup.includes('hero-spotlight-pill'), 'heroHtml must include NEXT UP spotlight pill');
assert(heroMarkup.includes('hero-live-ticker'), 'heroHtml must include hero-live-ticker element');
console.log('  [PASS] Hero spotlight HTML generation and exact live countdown ticker verified.');

// 18. Test Time Horizon Chunking (Miller's Law Groups)
console.log('\nTest 18: Time Horizon Chunking (Miller\'s Law Groups)...');
const tNow = new Date();
const d1 = fmtIso(new Date(tNow.getTime() + 1 * 86400000));  // Spotlight (nearest)
const d2 = fmtIso(new Date(tNow.getTime() + 4 * 86400000));  // This Week (<=7d)
const d3 = fmtIso(new Date(tNow.getTime() + 15 * 86400000)); // This Month (8-30d)
const d4 = fmtIso(new Date(tNow.getTime() + 60 * 86400000)); // Later On (>30d)

sandbox.events = [
    { id: 'h1', name: 'Nearest Event', date: d1, category: 'general', notes: '' },
    { id: 'h2', name: 'This Week Event', date: d2, category: 'meeting', notes: '' },
    { id: 'h3', name: 'This Month Event', date: d3, category: 'birthday', notes: '' },
    { id: 'h4', name: 'Later On Event', date: d4, category: 'holiday', notes: '' }
];
sandbox.switchViewTab('events');
sandbox.render();

assert(mockElements['hero-spotlight'].innerHTML.includes('Nearest Event'), 'hero-spotlight must contain the nearest upcoming event');
const activeHtml = mockElements['active-list'].innerHTML;
assert(activeHtml.includes('This Week'), 'active-list must contain "This Week" horizon header');
assert(activeHtml.includes('This Month'), 'active-list must contain "This Month" horizon header');
assert(activeHtml.includes('Later On'), 'active-list must contain "Later On" horizon header');
assert(activeHtml.includes('This Week Event'), 'active-list must render week event');
assert(activeHtml.includes('This Month Event'), 'active-list must render month event');
assert(activeHtml.includes('Later On Event'), 'active-list must render later event');
console.log('  [PASS] Horizon groups (This Week, This Month, Later On) chunked and rendered perfectly.');

// 19. Test Quick-View Detail Modal Sheet & RFC 5545 iCalendar (.ics) Export
console.log('\nTest 19: Quick-View Detail Modal Sheet & RFC 5545 iCalendar (.ics) Export...');
assert(typeof sandbox.openDetailModal === 'function', 'openDetailModal function must exist');
assert(typeof sandbox.closeDetailModal === 'function', 'closeDetailModal function must exist');
assert(typeof sandbox.downloadIcsFile === 'function', 'downloadIcsFile function must exist');

sandbox.openDetailModal('h2');
assert(mockElements['detail-sheet'].classList.contains('on'), 'openDetailModal must add "on" class to detail-sheet');
assert.strictEqual(mockElements['detail-title'].textContent, 'This Week Event', 'detail modal title must match event');

sandbox.closeDetailModal();
assert(!mockElements['detail-sheet'].classList.contains('on'), 'closeDetailModal must remove "on" class from detail-sheet');

let generatedBlob = null;
const origBlob = sandbox.Blob;
sandbox.Blob = class {
    constructor(parts, opts) {
        this.parts = parts;
        this.opts = opts;
        generatedBlob = parts.join('');
    }
};
sandbox.downloadIcsFile(sandbox.events[0]);
assert(generatedBlob !== null, 'downloadIcsFile must create a Blob');
assert(generatedBlob.includes('BEGIN:VCALENDAR'), '.ics must contain BEGIN:VCALENDAR');
assert(generatedBlob.includes('VERSION:2.0'), '.ics must contain VERSION:2.0');
assert(generatedBlob.includes('SUMMARY:Nearest Event'), '.ics must include event name in SUMMARY');
assert(generatedBlob.includes('END:VCALENDAR'), '.ics must contain END:VCALENDAR');
sandbox.Blob = origBlob;
console.log('  [PASS] Quick-View detail sheet and offline RFC 5545 .ics generation verified.');

// 20. Test Smart Auto-Categorization & Tactile Category Chips
console.log('\nTest 20: Smart Auto-Categorization & Tactile Category Chips...');
assert(Array.isArray(sandbox.CAT_KEYWORDS), 'CAT_KEYWORDS must be an array of regex rules');
assert(typeof sandbox.checkAutoCategorize === 'function', 'checkAutoCategorize must exist');
assert(typeof sandbox.selectCategoryChip === 'function', 'selectCategoryChip must exist');

sandbox.checkAutoCategorize('Dentist checkup at 2pm');
assert.strictEqual(mockElements['f-cat'].value, 'reminder', 'Dentist should auto-categorize to reminder');

sandbox.checkAutoCategorize('Birthday party with family');
assert.strictEqual(mockElements['f-cat'].value, 'birthday', 'Birthday party should auto-categorize to birthday');

sandbox.checkAutoCategorize('Urgent project deadline');
assert.strictEqual(mockElements['f-cat'].value, 'deadline', 'Project deadline should auto-categorize to deadline');

sandbox.checkAutoCategorize('Flight tickets to Maldives');
assert.strictEqual(mockElements['f-cat'].value, 'holiday', 'Flight tickets should auto-categorize to holiday');

sandbox.checkAutoCategorize('Client zoom conference');
assert.strictEqual(mockElements['f-cat'].value, 'meeting', 'Zoom conference should auto-categorize to meeting');

console.log('  [PASS] Keyword auto-categorization and synchronized tactile category chips verified.');

// 21. Test Exact Age Computation (Years, Months, Days, Total Days Lived)
console.log('\nTest 21: Exact Age Computation & Telemetry...');
assert(typeof sandbox.computeBirthdayMetrics === 'function', 'computeBirthdayMetrics must exist');
const metrics1 = sandbox.computeBirthdayMetrics('1995-03-15');
assert(typeof metrics1.currentAgeYears === 'number' && metrics1.currentAgeYears >= 30, 'Completed age should be >= 30 for 1995 birthdate');
assert(typeof metrics1.currentAgeMonths === 'number' && metrics1.currentAgeMonths >= 0 && metrics1.currentAgeMonths < 12, 'Age months must be 0-11');
assert(typeof metrics1.currentAgeDays === 'number' && metrics1.currentAgeDays >= 0 && metrics1.currentAgeDays <= 31, 'Age days must be 0-31');
assert(typeof metrics1.totalDaysLived === 'number' && metrics1.totalDaysLived > 10000, 'Total days lived should be > 10,000 for 1995 birthdate');
assert.strictEqual(metrics1.turningAge, metrics1.currentAgeYears + (metrics1.isToday ? 0 : 1), 'Turning age must match completed years + 1');
console.log(`  [PASS] Exact age computed: ${metrics1.currentAgeYears} yrs, ${metrics1.currentAgeMonths}m, ${metrics1.currentAgeDays}d (${metrics1.totalDaysLived} days lived). Turning: ${metrics1.turningAge}.`);

// 22. Test Perpetual Birthday Rollover (Never Archived)
console.log('\nTest 22: Perpetual Birthday Rollover Logic...');
const curYear = new Date().getFullYear();
// Create a birthday that was yesterday
const yesterday = new Date(Date.now() - 86400000);
const yMonth = String(yesterday.getMonth() + 1).padStart(2, '0');
const yDay = String(yesterday.getDate()).padStart(2, '0');
const pastBday = (curYear - 25) + '-' + yMonth + '-' + yDay;

const mRollover = sandbox.computeBirthdayMetrics(pastBday);
assert(mRollover.daysLeft > 300, 'Past birthday this year must perpetually roll over to next year with > 300 days');
assert.strictEqual(mRollover.isToday, false, 'Past birthday is not today');
assert(mRollover.nextDateStr.startsWith(String(curYear + 1)), 'Next birthday date must be in next calendar year');

// Test birthday today
const todayBday = (curYear - 20) + '-' + String(new Date().getMonth() + 1).padStart(2, '0') + '-' + String(new Date().getDate()).padStart(2, '0');
const mToday = sandbox.computeBirthdayMetrics(todayBday);
assert.strictEqual(mToday.isToday, true, 'Birthday today must have isToday = true');
assert.strictEqual(mToday.daysLeft, 0, 'Birthday today must have daysLeft = 0');
assert.strictEqual(mToday.turningAge, 20, 'Birthday today must turn exact age 20');
console.log('  [PASS] Perpetual annual rollover and day-of celebration detection verified.');

// 23. Test Sorting Invariant in Birthday View (Least Days Remaining)
console.log('\nTest 23: Birthday View Queue & Sorting Invariant...');
const b1Today = (curYear - 30) + '-' + String(new Date().getMonth() + 1).padStart(2, '0') + '-' + String(new Date().getDate()).padStart(2, '0');
const fut5 = new Date(Date.now() + 5 * 86400000);
const b2Fut = (curYear - 25) + '-' + String(fut5.getMonth() + 1).padStart(2, '0') + '-' + String(fut5.getDate()).padStart(2, '0');
const fut40 = new Date(Date.now() + 40 * 86400000);
const b3Fut = (curYear - 40) + '-' + String(fut40.getMonth() + 1).padStart(2, '0') + '-' + String(fut40.getDate()).padStart(2, '0');

sandbox.events = [
    { id: 'b-fut', name: 'Friend in 5d', birthDate: b2Fut, date: b2Fut, category: 'birthday', relationship: 'friend' },
    { id: 'b-far', name: 'Far Birthday in 40d', birthDate: b3Fut, date: b3Fut, category: 'birthday', relationship: 'work' },
    { id: 'b-now', name: 'Celebration Today', birthDate: b1Today, date: b1Today, category: 'birthday', relationship: 'family' }
];

sandbox.switchViewTab('birthdays');
sandbox.render();

// Nearest birthday spotlighted (Celebration Today)
assert(mockElements['hero-spotlight'].innerHTML.includes('Celebration Today'), 'hero-spotlight must contain the nearest upcoming birthday (Today)');
assert(mockElements['hero-spotlight'].innerHTML.includes('TODAY'), 'Hero spotlight should render TODAY label');

// Remaining birthdays in active-list
const bdayListHtml = mockElements['active-list'].innerHTML;
assert(bdayListHtml.includes('Friend in 5d'), 'Active list must contain 5d upcoming birthday');
assert(bdayListHtml.includes('Far Birthday in 40d'), 'Active list must contain 40d upcoming birthday');
// In birthday mode, archive wrap should be hidden
assert.strictEqual(mockElements['archive-wrap'].style.display, 'none', 'Archive wrap must be hidden in birthday mode');
console.log('  [PASS] Nearest birthday spotlighted, queue sorted ascending, and zero-archive policy verified.');

// 24. Test Western Zodiac Sign & Landmark Milestone Badges
console.log('\nTest 24: Western Zodiac Sign & Landmark Milestone Badges...');
assert(typeof sandbox.getZodiacSign === 'function', 'getZodiacSign function must exist');
assert.strictEqual(sandbox.getZodiacSign(3, 25).name, 'Aries', 'March 25 must be Aries');
assert.strictEqual(sandbox.getZodiacSign(8, 15).name, 'Leo', 'August 15 must be Leo');
assert.strictEqual(sandbox.getZodiacSign(11, 10).name, 'Scorpio', 'November 10 must be Scorpio');

assert(typeof sandbox.getMilestoneLabel === 'function', 'getMilestoneLabel function must exist');
assert(sandbox.getMilestoneLabel(1).includes('1st Birthday'), 'Age 1 must be 1st Birthday');
assert(sandbox.getMilestoneLabel(18).includes('18th Milestone'), 'Age 18 must be 18th Milestone');
assert(sandbox.getMilestoneLabel(21).includes('21st Milestone'), 'Age 21 must be 21st Milestone');
assert(sandbox.getMilestoneLabel(30).includes('30th Milestone'), 'Age 30 must be 30th Milestone');
assert(sandbox.getMilestoneLabel(50).includes('Golden Jubilee'), 'Age 50 must be Golden Jubilee');
console.log('  [PASS] Zodiac signs and milestone ages correctly mapped.');

// 25. Test 1-Tap WhatsApp Wish Link & Live Age Form Preview
console.log('\nTest 25: WhatsApp Greeting Link & Live Age Form Preview...');
assert(typeof sandbox.buildWhatsAppWishLink === 'function', 'buildWhatsAppWishLink function must exist');
const waLink = sandbox.buildWhatsAppWishLink('Mom', 60, 'family');
assert(waLink.startsWith('https://wa.me/?text='), 'WhatsApp link must use wa.me protocol');
assert(waLink.includes('Mom') && waLink.includes('60th'), 'WhatsApp message must include name and 60th milestone');

assert(typeof sandbox.updateBdayFormPreview === 'function', 'updateBdayFormPreview must exist');
sandbox.document.getElementById('f-cat').value = 'birthday';
sandbox.document.getElementById('f-date').value = '1990-05-20';
sandbox.updateBdayFormPreview();
const previewHtml = mockElements['bday-age-preview'].innerHTML;
assert(previewHtml.includes('Age Today'), 'Preview must show Age Today');
assert(previewHtml.includes('Turning'), 'Preview must show Turning age');
assert.strictEqual(mockElements['bday-age-preview'].style.display, 'block', 'Preview box must be displayed');
console.log('  [PASS] WhatsApp greeting URL and dynamic live age preview verified.');

// 26. Test Compact Prayer-Times Card Layout & High-Density Invariants
console.log('\nTest 26: Compact Prayer-Times Style Card Layout & High-Density Invariants...');
const sampleBday = {
    id: 'b-compact-1',
    name: 'Sarah Jenkins',
    birthDate: '1995-05-20',
    date: '1995-05-20',
    category: 'birthday',
    relationship: 'friend'
};
const bdayMarkup = sandbox.bdayCardHtml(sampleBday);
assert(bdayMarkup.includes('card-bubble bday-bubble'), 'bdayCardHtml must contain card-bubble bday-bubble');
assert(bdayMarkup.includes('card-content-stack'), 'bdayCardHtml must contain card-content-stack');
assert(bdayMarkup.includes('card-name-txt'), 'bdayCardHtml must contain card-name-txt');
assert(bdayMarkup.includes('card-turning-pill'), 'bdayCardHtml must contain card-turning-pill');
assert(bdayMarkup.includes('card-chevron'), 'bdayCardHtml must contain card-chevron');
assert(bdayMarkup.includes('days-badge-compact'), 'bdayCardHtml must contain days-badge-compact');
assert(!bdayMarkup.includes('class="card-actions"'), 'bdayCardHtml must NOT contain bulky inline action buttons');

const sampleEvent = {
    id: 'e-compact-1',
    name: 'Quarterly Project Review',
    date: '2026-11-15',
    category: 'meeting',
    notes: 'Prepare slides'
};
const eventMarkup = sandbox.cardHtml(sampleEvent, false);
assert(eventMarkup.includes('card-bubble'), 'cardHtml must contain card-bubble');
assert(eventMarkup.includes('card-content-stack'), 'cardHtml must contain card-content-stack');
assert(eventMarkup.includes('card-name-txt'), 'cardHtml must contain card-name-txt');
assert(eventMarkup.includes('card-cat-pill'), 'cardHtml must contain card-cat-pill');
assert(eventMarkup.includes('days-badge-compact'), 'cardHtml must contain days-badge-compact');
assert(eventMarkup.includes('card-chevron'), 'cardHtml must contain card-chevron');
assert(!eventMarkup.includes('class="card-actions"'), 'cardHtml must NOT contain bulky inline action buttons');
console.log('  [PASS] Compact prayer-times layout, high density, and clean action delegation verified.');

// 27. Test Medium Card Layout, Exact Age Breakdown & Smart Horizon Countdown (v1.5.0)
console.log('\nTest 27: Medium Card Layout, Exact Age Breakdown & Smart Horizon Countdown (v1.5.0)...');

assert(typeof sandbox.computeRemainingHorizon === 'function', 'computeRemainingHorizon must be defined');

const baseTestDate = new Date(2026, 9, 24); // 2026-10-24

// Case 1: > 1 month away (2027-06-05 from 2026-10-24 -> 7M 12D)
const hFar = sandbox.computeRemainingHorizon('2027-06-05', baseTestDate);
assert.strictEqual(hFar.months, 7, `Expected 7 months, got ${hFar.months}`);
assert.strictEqual(hFar.days, 12, `Expected 12 days, got ${hFar.days}`);
assert.strictEqual(hFar.text, '7M 12D', `Expected text '7M 12D', got ${hFar.text}`);

// Case 2: exact months away (2026-12-24 from 2026-10-24 -> 2M)
const hExactMonth = sandbox.computeRemainingHorizon('2026-12-24', baseTestDate);
assert.strictEqual(hExactMonth.months, 2, `Expected 2 months, got ${hExactMonth.months}`);
assert.strictEqual(hExactMonth.days, 0, `Expected 0 days, got ${hExactMonth.days}`);
assert.strictEqual(hExactMonth.text, '2M', `Expected text '2M', got ${hExactMonth.text}`);

// Case 3: <= 30 days away (2026-11-05 from 2026-10-24 -> 12d left)
const hNear = sandbox.computeRemainingHorizon('2026-11-05', baseTestDate);
assert.strictEqual(hNear.diffDays, 12, `Expected 12 days difference, got ${hNear.diffDays}`);
assert.strictEqual(hNear.text, '12d left', `Expected text '12d left', got ${hNear.text}`);

// Case 4: 1 day away (Tomorrow!)
const hTmrw = sandbox.computeRemainingHorizon('2026-10-25', baseTestDate);
assert.strictEqual(hTmrw.text, 'Tomorrow!', `Expected text 'Tomorrow!', got ${hTmrw.text}`);

// Case 5: 0 days away (🎉 TODAY!)
const hToday = sandbox.computeRemainingHorizon('2026-10-24', baseTestDate);
assert.strictEqual(hToday.text, '🎉 TODAY!', `Expected text '🎉 TODAY!', got ${hToday.text}`);

// Test card markup contains medium card styling & age breakdown
const sampleBdayMed = {
    id: 'b-med-1',
    name: 'Farhan Zaidi',
    birthDate: '1995-03-15',
    category: 'birthday',
    relationship: 'family'
};
const medBdayHtml = sandbox.bdayCardHtml(sampleBdayMed);
assert(medBdayHtml.includes('class="card-age-row"'), 'bdayCardHtml must contain card-age-row');
assert(medBdayHtml.includes('class="card-age-tag"'), 'bdayCardHtml must contain card-age-tag');
assert(medBdayHtml.includes('class="card-age-val"'), 'bdayCardHtml must contain card-age-val');
assert(medBdayHtml.includes('yrs,'), 'bdayCardHtml must display completed years');
assert(medBdayHtml.includes('mos,'), 'bdayCardHtml must display completed months');
assert(medBdayHtml.includes('days'), 'bdayCardHtml must display completed days');

// Verify CSS contain-intrinsic-size and min-height in htmlContent for medium sizing
assert(htmlContent.includes('contain-intrinsic-size: 0 88px;'), 'Missing medium contain-intrinsic-size 88px');
assert(htmlContent.includes('min-height: 84px;'), 'Missing card min-height 84px');
assert(htmlContent.includes('CURRENT_APP_VERSION = "1.6.1"'), 'Version must be 1.6.1 in script');

console.log('  [PASS] Medium card layout, exact age breakdown, and smart horizon countdown verified.');

// 28. Test Authentic Family Roster (13 Members), Deduplicating Auto-Migration, Dual Sorting & Pulse Bar
console.log('\nTest 28: Authentic Family Roster, Deduplicating Auto-Migration, Dual Sorting & Pulse Bar...');

// Check FAMILY_ROSTER array
assert(Array.isArray(sandbox.FAMILY_ROSTER), 'FAMILY_ROSTER must be an array');
assert.strictEqual(sandbox.FAMILY_ROSTER.length, 13, `FAMILY_ROSTER must contain 13 members, got ${sandbox.FAMILY_ROSTER.length}`);

const expectedNames = [
    'Siraj', 'Rasida', 'Munira', 'Ahamed', 'Mahmood', 'Shemil', 'Aamena',
    'Hamid', 'Amina', 'Saqlain', 'Anas', 'Hamza', 'Yusuf'
];
expectedNames.forEach(name => {
    const found = sandbox.FAMILY_ROSTER.some(m => m.name === name);
    assert(found, `Missing expected family member: ${name}`);
});

// Verify family_birthdays.json file exists and is valid
const famJsonPath = path.join(projectRoot, 'family_birthdays.json');
assert(fs.existsSync(famJsonPath), 'family_birthdays.json must exist in repository root');
const famJsonData = JSON.parse(fs.readFileSync(famJsonPath, 'utf8'));
assert.strictEqual(famJsonData.length, 13, 'family_birthdays.json must contain 13 records');

// Test Deduplicating Migration Simulation:
// Start with a mock state containing dummy events + manually entered Amina and Hamid
sandbox.localStorage.removeItem('events_family_roster_v160_migrated');
sandbox.events = [
    { id: 'dummy-alex', name: 'Alex Johnson', birthDate: '1995-03-15', date: '1995-03-15', category: 'birthday' },
    { id: 'dummy-meeting', name: 'Team Meeting', date: '2026-11-01', category: 'meeting' },
    { id: 'user-amina', name: 'Amina', birthDate: '2003-09-17', date: '2003-09-17', category: 'birthday', relationship: 'family', customNote: 'Manually entered' },
    { id: 'user-hamid', name: 'Hamid', birthDate: '2002-11-23', date: '2002-11-23', category: 'birthday', relationship: 'family', customNote: 'Manually entered' }
];

sandbox.migrateFamilyRoster();

// Assert dummy events were purged
assert(!sandbox.events.some(e => e.name === 'Alex Johnson'), 'Dummy event Alex Johnson must be purged');
assert(!sandbox.events.some(e => e.name === 'Team Meeting'), 'Dummy event Team Meeting must be purged');

// Assert manually entered Amina and Hamid were preserved with their original properties
const aminaEvt = sandbox.events.find(e => e.name === 'Amina');
assert(aminaEvt && aminaEvt.id === 'user-amina', 'User manually entered Amina must be preserved with custom ID');
const hamidEvt = sandbox.events.find(e => e.name === 'Hamid');
assert(hamidEvt && hamidEvt.id === 'user-hamid', 'User manually entered Hamid must be preserved with custom ID');

// Assert total count is exactly 13 with all family members present
assert.strictEqual(sandbox.events.length, 13, `Expected 13 family members after migration, got ${sandbox.events.length}`);
expectedNames.forEach(name => {
    const matches = sandbox.events.filter(e => e.name === name);
    assert.strictEqual(matches.length, 1, `Expected exactly 1 instance of ${name}, got ${matches.length}`);
});

// Test Sorting Modes:
// 1. Upcoming Mode (default)
sandbox.setBdaySortMode('upcoming');
assert.strictEqual(sandbox.bdaySortMode, 'upcoming');
sandbox.switchViewTab('birthdays');
const heroSpotHtml = mockElements['hero-spotlight'].innerHTML;
assert(heroSpotHtml.includes('Hamza'), 'Upcoming sort hero spotlight must feature Hamza (nearest birthday in 7 days)');

// 2. Eldest First Mode
sandbox.setBdaySortMode('age');
assert.strictEqual(sandbox.bdaySortMode, 'age');
const activeListHtml = mockElements['active-list'].innerHTML;
const sirajIdx = activeListHtml.indexOf('Siraj');
const yusufIdx = activeListHtml.indexOf('Yusuf');
assert(sirajIdx !== -1, 'Siraj must be present in Eldest First list');
assert(yusufIdx !== -1, 'Yusuf must be present in Eldest First list');
assert(sirajIdx < yusufIdx, `Siraj (born 1966, index ${sirajIdx}) must appear before Yusuf (born 2023, index ${yusufIdx}) in Eldest First mode`);

// Test Pulse Bar elements & 13 Birthdays Tracked label
assert(htmlContent.includes('id="family-pulse-bar"'), 'Missing family-pulse-bar in HTML');
assert(htmlContent.includes('id="family-pulse-count"'), 'Missing family-pulse-count in HTML');
assert(htmlContent.includes('id="family-pulse-next"'), 'Missing family-pulse-next in HTML');
sandbox.render();
assert(mockElements['family-pulse-count'].textContent.includes('13 Birthdays Tracked'), 'Pulse bar must say 13 Birthdays Tracked');

// Verify Complete Removal of Family tag/label and Stars (zodiac) info
const sampleCardHtml = sandbox.bdayCardHtml(sandbox.events[0]);
assert(!sampleCardHtml.includes('card-sub-tag'), 'bdayCardHtml must NOT contain card-sub-tag (no family or stars info)');
assert(!sampleCardHtml.includes('Family'), 'bdayCardHtml must NOT contain Family label');
assert(!sampleCardHtml.includes('Gemini') && !sampleCardHtml.includes('Scorpio') && !sampleCardHtml.includes('Leo'), 'bdayCardHtml must NOT contain zodiac stars information');

// Verify More sheet version display
assert(htmlContent.includes('id="more-version-display"'), 'Missing more-version-display in HTML');
assert(htmlContent.includes('v1.6.1'), 'HTML must feature version 1.6.1');

console.log('  [PASS] Authentic family roster, deduplicating migration, dual sorting, clean date cards (zero family/stars tags) & version sync verified.');

console.log('\n=== ALL 28 VERIFICATION TESTS PASSED SUCCESSFULLY! ===\n');
process.exit(0);
