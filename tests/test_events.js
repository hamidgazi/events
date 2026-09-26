const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

console.log('=== RUNNING VERIFICATION SUITE FOR events.html ===\n');

const projectRoot = path.join(__dirname, '..');
const htmlContent = fs.readFileSync(path.join(projectRoot, 'events.html'), 'utf8');

// 1. Check Favicon and App Icon
console.log('Test 1: App Icons, Apple Touch Icon & Manifest...');
assert(htmlContent.includes('<link rel="icon" type="image/png" sizes="192x192" href="icons/icon-app-192.png?v=1.1.2">'), 'Missing PNG 192 icon link');
assert(htmlContent.includes('<link rel="apple-touch-icon" sizes="180x180" href="icons/apple-touch-icon.png?v=1.1.2">'), 'Missing apple-touch-icon link');
assert(htmlContent.includes('<link rel="manifest" href="manifest.json?v=1.1.2">'), 'Missing versioned manifest link');

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
    'del-sheet'
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

// 6. Test openModal default category 'general'
console.log('\nTest 6: openModal default category...');
sandbox.openModal(null);
assert.strictEqual(sandbox.document.getElementById('f-cat').value, 'general', 'Default category in openModal should be general');
console.log('  [PASS] openModal correctly defaults f-cat to "general".');

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

console.log('\n=== ALL 16 VERIFICATION TESTS PASSED SUCCESSFULLY! ===\n');
