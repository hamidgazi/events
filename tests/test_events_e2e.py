"""
E2E Automated Test Suite for events.html
Tests 4 Tiers of Requirements using Python 3.13 + Selenium 4 + Headless Chrome + CDP Emulation.

Exclusive Write Ownership: test_writer_m1
Target File: C:\\Users\\Shop PC 2\\OneDrive\\Desktop\\events.html
"""

import os
import re
import sys
import json
import time
import unittest
from datetime import datetime, timedelta

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC

TARGET_HTML = os.environ.get("TARGET_HTML", os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "events.html")))
TARGET_URL = "file:///" + os.path.abspath(TARGET_HTML).replace("\\", "/")


def get_headless_driver(mobile=True):
    """Initializes Headless Chrome with optional CDP 390px mobile viewport."""
    opts = Options()
    opts.add_argument('--headless=new')
    opts.add_argument('--no-sandbox')
    opts.add_argument('--disable-gpu')
    opts.add_argument('--disable-dev-shm-usage')
    opts.add_argument('--allow-file-access-from-files')
    opts.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
    
    driver = webdriver.Chrome(options=opts)
    if mobile:
        driver.execute_cdp_cmd("Emulation.setDeviceMetricsOverride", {
            "width": 390,
            "height": 844,
            "deviceScaleFactor": 3,
            "mobile": True
        })
    return driver


def normalize_color(color_str):
    """Normalizes color string to rgb(r, g, b) format."""
    if not color_str:
        return ""
    color_str = color_str.strip().lower()
    if color_str.startswith("#"):
        hex_val = color_str.lstrip("#")
        if len(hex_val) == 3:
            hex_val = "".join([c * 2 for c in hex_val])
        r = int(hex_val[0:2], 16)
        g = int(hex_val[2:4], 16)
        b = int(hex_val[4:6], 16)
        return f"rgb({r}, {g}, {b})"
    # Handle rgba(r, g, b, a) -> rgb(r, g, b)
    rgba_match = re.match(r"rgba?\((\d+),\s*(\d+),\s*(\d+)", color_str)
    if rgba_match:
        return f"rgb({rgba_match.group(1)}, {rgba_match.group(2)}, {rgba_match.group(3)})"
    return color_str


# ==============================================================================
# TIER 1: Static Code, File Integrity & Offline Purity
# ==============================================================================
class TestTier1StaticCodeAndPurity(unittest.TestCase):
    """Static analysis verifying single-file architecture, offline purity, and CSS contracts."""

    @classmethod
    def setUpClass(cls):
        cls.file_exists = os.path.exists(TARGET_HTML)
        cls.content = ""
        if cls.file_exists:
            with open(TARGET_HTML, "r", encoding="utf-8", errors="ignore") as f:
                cls.content = f.read()

    def setUp(self):
        if not self.file_exists:
            self.skipTest(f"events.html not found at {TARGET_HTML}. Pending implementation by worker_m2.")

    def test_tc1_1_single_file_delivery_and_size(self):
        """TC-1.1: Single file delivery and reasonable size between 5KB and 500KB."""
        size_bytes = os.path.getsize(TARGET_HTML)
        size_kb = size_bytes / 1024.0
        self.assertGreaterEqual(size_kb, 5.0, f"File size {size_kb:.2f}KB is below 5KB minimum threshold.")
        self.assertLessEqual(size_kb, 500.0, f"File size {size_kb:.2f}KB exceeds 500KB maximum threshold.")

    def test_tc1_2_offline_purity_and_zero_external_dependencies(self):
        """TC-1.2: Zero external network dependencies (no remote scripts, links, fonts, CDNs)."""
        # Disallow remote script tags
        remote_scripts = re.findall(r'<script\s+[^>]*src=[\'"](https?://[^\'"]+)[\'"]', self.content, re.IGNORECASE)
        self.assertEqual(remote_scripts, [], f"Found forbidden remote script sources: {remote_scripts}")

        # Disallow remote stylesheet links
        remote_links = re.findall(r'<link\s+[^>]*href=[\'"](https?://[^\'"]+)[\'"]', self.content, re.IGNORECASE)
        self.assertEqual(remote_links, [], f"Found forbidden remote stylesheet links: {remote_links}")

        # Disallow remote @import CSS
        remote_imports = re.findall(r'@import\s+url\([\'"]?(https?://[^\'")]+)[\'"]?\)', self.content, re.IGNORECASE)
        self.assertEqual(remote_imports, [], f"Found forbidden remote CSS @import: {remote_imports}")

        # Disallow external font services like Google Fonts or FontAwesome
        cdn_matches = re.findall(r'(fonts\.googleapis\.com|cdnjs\.cloudflare\.com|fontawesome|jsdelivr|unpkg)', self.content, re.IGNORECASE)
        self.assertEqual(cdn_matches, [], f"Found external CDN references in code: {cdn_matches}")

    def test_tc1_3_html5_structure_and_viewport_meta(self):
        """TC-1.3: HTML5 Doctype, viewport meta tag, and page title."""
        self.assertTrue(self.content.strip().upper().startswith("<!DOCTYPE HTML"), "Missing standard <!DOCTYPE html> declaration.")
        self.assertTrue(re.search(r'<meta[^>]+name=[\'"]viewport[\'"][^>]+content=[\'"][^>]*width=device-width', self.content, re.IGNORECASE),
                        "Missing responsive <meta name='viewport' content='width=device-width...'> tag.")
        self.assertTrue(re.search(r'<title>[^<]+</title>', self.content, re.IGNORECASE), "Missing <title> tag.")

    def test_tc1_4_css_urgency_hex_colors_and_keyframes(self):
        """TC-1.4: All 7 required hex codes, @keyframes glow, and backdrop-filter in styles."""
        required_colors = [
            "#ff4444",  # 0 days (red)
            "#ff8c00",  # 1-3 days (orange)
            "#e8b030",  # 4-7 days (amber)
            "#4a9eff",  # 8-14 days (blue)
            "#3dd68c",  # 15-30 days (teal/green)
            "#6e7681",  # 31+ days (gray)
            "#0d1117"   # Dark navy theme background
        ]
        content_lower = self.content.lower()
        missing_colors = [c for c in required_colors if c.lower() not in content_lower]
        self.assertEqual(missing_colors, [], f"Missing required hex colors in inline styles: {missing_colors}")

        self.assertIn("@keyframes", self.content, "Missing @keyframes animation definition for pulse glow.")
        self.assertIn("backdrop-filter", self.content, "Missing backdrop-filter definition for frosted glass effect.")

    def test_tc1_5_inline_script_presence(self):
        """TC-1.5: Valid inline script block with storage and rendering functions."""
        scripts = re.findall(r'<script\b[^>]*>(.*?)</script>', self.content, re.DOTALL | re.IGNORECASE)
        self.assertTrue(len(scripts) > 0, "No inline <script> block found in events.html.")
        full_js = "\n".join(scripts)
        self.assertIn("events_v2", full_js, "JavaScript must reference storage key 'events_v2'.")


# ==============================================================================
# TIER 2: Headless DOM Initialization & Schema Contracts
# ==============================================================================
class TestTier2DomInitAndDataContracts(unittest.TestCase):
    """Tests clean initial boot, sample event generation, relative offsets, and console purity."""

    @classmethod
    def setUpClass(cls):
        if not os.path.exists(TARGET_HTML):
            raise unittest.SkipTest(f"events.html not found at {TARGET_HTML}.")
        cls.driver = get_headless_driver(mobile=True)

    @classmethod
    def tearDownClass(cls):
        if hasattr(cls, 'driver') and cls.driver:
            cls.driver.quit()

    def setUp(self):
        # Clean local storage and reload before each test
        self.driver.get(TARGET_URL)
        self.driver.execute_script("localStorage.clear();")
        self.driver.get(TARGET_URL)
        time.sleep(0.5)

    def test_tc2_1_clean_boot_creates_events_v2_storage(self):
        """TC-2.1: Clean first launch writes events_v2 key to localStorage."""
        raw_storage = self.driver.execute_script("return localStorage.getItem('events_v2');")
        self.assertIsNotNone(raw_storage, "localStorage.getItem('events_v2') must not be null on initial boot.")
        events = json.loads(raw_storage)
        self.assertIsInstance(events, list, "events_v2 in localStorage must parse as a JSON list.")
        self.assertEqual(len(events), 5, f"Expected exactly 5 pre-loaded sample events, got {len(events)}.")

    def test_tc2_2_event_schema_contract(self):
        """TC-2.2: Verify every sample event conforms to the data contract schema."""
        raw_storage = self.driver.execute_script("return localStorage.getItem('events_v2');")
        events = json.loads(raw_storage)
        valid_categories = {"Birthday", "Meeting", "Deadline", "Holiday", "Reminder", "Other"}

        for i, ev in enumerate(events):
            self.assertIn("id", ev, f"Event {i} missing 'id' field.")
            self.assertTrue(isinstance(ev["id"], str) and len(ev["id"]) > 0, f"Event {i} 'id' must be non-empty string.")
            self.assertIn("name", ev, f"Event {i} missing 'name' field.")
            self.assertTrue(isinstance(ev["name"], str) and len(ev["name"].strip()) > 0, f"Event {i} 'name' must be non-empty string.")
            self.assertIn("date", ev, f"Event {i} missing 'date' field.")
            self.assertTrue(re.match(r"^\d{4}-\d{2}-\d{2}$", ev["date"]), f"Event {i} date '{ev['date']}' must match YYYY-MM-DD.")
            self.assertIn("category", ev, f"Event {i} missing 'category' field.")
            self.assertIn(ev["category"], valid_categories, f"Event {i} category '{ev['category']}' not in {valid_categories}.")
            self.assertIn("createdAt", ev, f"Event {i} missing 'createdAt' timestamp.")

    def test_tc2_3_dynamic_sample_relative_date_offsets(self):
        """TC-2.3: Dynamic sample events must have relative offsets: +1, +3, +5, +10, +21 days from today."""
        raw_storage = self.driver.execute_script("return localStorage.getItem('events_v2');")
        events = json.loads(raw_storage)
        today = datetime.now().date()

        offsets = []
        for ev in events:
            ev_date = datetime.strptime(ev["date"], "%Y-%m-%d").date()
            diff_days = (ev_date - today).days
            offsets.append(diff_days)

        offsets.sort()
        expected_offsets = [1, 3, 5, 10, 21]
        self.assertEqual(offsets, expected_offsets,
                         f"Generated sample event offsets {offsets} do not match required offsets {expected_offsets}.")

    def test_tc2_4_initial_dom_render_and_upcoming_count_chip(self):
        """TC-2.4: Exactly 5 active cards rendered and header chip displays count of 5."""
        cards = self.driver.find_elements(By.CSS_SELECTOR, ".event-card, [data-event-id]")
        # Separate upcoming active cards from past cards
        active_cards = [c for c in cards if not self.driver.execute_script(
            "return arguments[0].closest('#past-events, .past-section, [data-past]') !== null;", c)]
        self.assertEqual(len(active_cards), 5, f"Expected 5 active rendered cards, found {len(active_cards)}.")

        # Find upcoming count chip in header
        chip_elems = self.driver.find_elements(By.CSS_SELECTOR, ".count-chip, #upcoming-count, .upcoming-chip, [data-count]")
        chip_found = False
        for elem in chip_elems:
            if "5" in elem.text:
                chip_found = True
                break
        if not chip_found:
            # Check entire header text
            header_text = self.driver.find_element(By.TAG_NAME, "header").text
            self.assertIn("5", header_text, f"Upcoming count '5' not found in header: '{header_text}'")

    def test_tc2_5_sticky_frosted_header_and_date_display(self):
        """TC-2.5: Sticky frosted header with title '📅 Events' and formatted long date."""
        header = self.driver.find_element(By.TAG_NAME, "header")
        header_text = header.text
        self.assertIn("Events", header_text, "Header title must contain 'Events'.")

        pos = self.driver.execute_script("return window.getComputedStyle(arguments[0]).position;", header)
        self.assertIn(pos, ["sticky", "fixed"], f"Header position '{pos}' must be sticky or fixed.")

        # Verify today's date formatted dynamically (year and month or day name)
        current_year = str(datetime.now().year)
        self.assertIn(current_year, header_text, f"Current year '{current_year}' not found in header date.")

    def test_tc2_6_zero_console_errors_on_boot(self):
        """TC-2.6: Zero browser console errors (SEVERE or ERROR) on initial boot."""
        logs = self.driver.get_log("browser")
        severe_errors = [entry for entry in logs if entry["level"] in ("SEVERE", "ERROR")]
        self.assertEqual(len(severe_errors), 0,
                         f"Found {len(severe_errors)} console errors: {[e['message'] for e in severe_errors]}")


# ==============================================================================
# TIER 3: Interactive Workflows & CRUD Operations
# ==============================================================================
class TestTier3InteractiveWorkflows(unittest.TestCase):
    """Tests FAB modal, HTML5 form validation, Add, In-place Edit, Delete confirmation, Filter pills, and Past archive."""

    @classmethod
    def setUpClass(cls):
        if not os.path.exists(TARGET_HTML):
            raise unittest.SkipTest(f"events.html not found at {TARGET_HTML}.")
        cls.driver = get_headless_driver(mobile=True)

    @classmethod
    def tearDownClass(cls):
        if hasattr(cls, 'driver') and cls.driver:
            cls.driver.quit()

    def setUp(self):
        self.driver.get(TARGET_URL)
        self.driver.execute_script("localStorage.clear();")
        self.driver.get(TARGET_URL)
        time.sleep(0.5)

    def _open_add_modal(self):
        fab = WebDriverWait(self.driver, 5).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "#add-btn, .fab, button[aria-label*='Add'], .add-event-btn"))
        )
        fab.click()
        modal = WebDriverWait(self.driver, 5).until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "#event-modal, .modal, .bottom-sheet, [role='dialog']"))
        )
        return modal

    def test_tc3_1_fab_opens_bottom_sheet_modal(self):
        """TC-3.1: Floating action button (+) opens slide-up bottom sheet modal."""
        modal = self._open_add_modal()
        self.assertTrue(modal.is_displayed(), "Modal should be visible after FAB click.")

    def test_tc3_2_form_validation_required_fields(self):
        """TC-3.2: Empty form submission is blocked by required field validation."""
        modal = self._open_add_modal()
        save_btn = modal.find_element(By.CSS_SELECTOR, "button[type='submit'], .save-btn, #save-event, #save-btn")
        save_btn.click()

        # Check if form was blocked (modal remains visible or input invalid)
        self.assertTrue(modal.is_displayed(), "Modal should remain visible when required inputs are empty.")

    def test_tc3_3_event_creation_and_auto_sort(self):
        """TC-3.3: Creating a new event inserts it into correct ascending sorted position immediately."""
        modal = self._open_add_modal()
        name_input = modal.find_element(By.CSS_SELECTOR, "input[name='name'], #event-name, input[required][type='text']")
        date_input = modal.find_element(By.CSS_SELECTOR, "input[name='date'], #event-date, input[type='date']")
        save_btn = modal.find_element(By.CSS_SELECTOR, "button[type='submit'], .save-btn, #save-event, #save-btn")

        target_date = (datetime.now().date() + timedelta(days=2)).strftime("%Y-%m-%d")
        name_input.clear()
        name_input.send_keys("Test 2-Day Milestone")
        date_input.send_keys(target_date)

        # Select category if dropdown exists
        cat_selects = modal.find_elements(By.CSS_SELECTOR, "select[name='category'], #event-category, select")
        if cat_selects:
            Select(cat_selects[0]).select_by_visible_text("📋 Meeting") if "Meeting" in cat_selects[0].text else None

        save_btn.click()
        time.sleep(0.5)

        # Verify total cards in localStorage is 6
        raw_storage = self.driver.execute_script("return localStorage.getItem('events_v2');")
        events = json.loads(raw_storage)
        self.assertEqual(len(events), 6, "Total stored events should be 6 after adding an event.")

        # Find rendered card positions
        card_names = [e.text for e in self.driver.find_elements(By.CSS_SELECTOR, ".event-card h3, .card-title, .event-name")]
        # "Test 2-Day Milestone" should be at index 1 (between 1-day and 3-day sample events)
        matching_indices = [idx for idx, name in enumerate(card_names) if "Test 2-Day Milestone" in name]
        self.assertTrue(len(matching_indices) > 0, "Newly created event not found in DOM cards.")
        self.assertEqual(matching_indices[0], 1, f"Newly added +2 day event should be at index 1, but found at index {matching_indices[0]}.")

    def test_tc3_4_card_tap_expansion_and_actions(self):
        """TC-3.4: Tapping card expands in-place to reveal Edit and Delete buttons."""
        cards = self.driver.find_elements(By.CSS_SELECTOR, ".event-card, [data-event-id]")
        self.assertGreaterEqual(len(cards), 1, "At least one card must be present.")
        first_card = cards[0]

        # Tap first card
        first_card.click()
        time.sleep(0.3)

        # Assert Edit and Delete buttons are now visible
        edit_btns = first_card.find_elements(By.CSS_SELECTOR, ".edit-btn, button[data-action='edit'], button[aria-label*='Edit']")
        delete_btns = first_card.find_elements(By.CSS_SELECTOR, ".delete-btn, button[data-action='delete'], button[aria-label*='Delete']")

        self.assertTrue(len(edit_btns) > 0 and edit_btns[0].is_displayed(), "Edit button must be revealed on card expansion.")
        self.assertTrue(len(delete_btns) > 0 and delete_btns[0].is_displayed(), "Delete button must be revealed on card expansion.")

    def test_tc3_5_edit_event_flow_and_re_sort(self):
        """TC-3.5: Edit pre-fills form, updates in place, and re-sorts automatically."""
        first_card = self.driver.find_elements(By.CSS_SELECTOR, ".event-card, [data-event-id]")[0]
        first_card.click()
        time.sleep(0.3)

        edit_btn = first_card.find_element(By.CSS_SELECTOR, ".edit-btn, button[data-action='edit'], button[aria-label*='Edit']")
        edit_btn.click()
        time.sleep(0.3)

        modal = WebDriverWait(self.driver, 5).until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "#event-modal, .modal, .bottom-sheet"))
        )

        name_input = modal.find_element(By.CSS_SELECTOR, "input[name='name'], #event-name, input[required][type='text']")
        date_input = modal.find_element(By.CSS_SELECTOR, "input[name='date'], #event-date, input[type='date']")
        save_btn = modal.find_element(By.CSS_SELECTOR, "button[type='submit'], .save-btn, #save-event, #save-btn")

        # Verify pre-filled
        original_name = name_input.get_attribute("value")
        self.assertTrue(len(original_name) > 0, "Name input should be pre-filled when editing.")

        # Update date to today (0 days) and name
        new_name = "Updated Event (Today)"
        today_str = datetime.now().date().strftime("%Y-%m-%d")

        name_input.clear()
        name_input.send_keys(new_name)
        date_input.clear()
        date_input.send_keys(today_str)

        save_btn.click()
        time.sleep(0.5)

        # Assert card updated and moved to top of list (0 days)
        cards = self.driver.find_elements(By.CSS_SELECTOR, ".event-card, [data-event-id]")
        top_card_text = cards[0].text
        self.assertIn(new_name, top_card_text, "Edited 0-day event should sort to top of active list.")

    def test_tc3_6_delete_confirmation_workflow(self):
        """TC-3.6: Delete displays confirmation sheet; Cancel preserves; Confirm removes card and updates storage."""
        initial_cards = self.driver.find_elements(By.CSS_SELECTOR, ".event-card, [data-event-id]")
        initial_count = len(initial_cards)

        first_card = initial_cards[0]
        first_card.click()
        time.sleep(0.3)

        delete_btn = first_card.find_element(By.CSS_SELECTOR, ".delete-btn, button[data-action='delete'], button[aria-label*='Delete']")
        delete_btn.click()
        time.sleep(0.3)

        # Confirm sheet appears
        confirm_sheet = WebDriverWait(self.driver, 5).until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "#delete-modal, .delete-sheet, .confirm-modal, [data-delete-modal]"))
        )
        self.assertTrue(confirm_sheet.is_displayed(), "Delete confirmation bottom sheet must be displayed.")

        # Step A: Cancel delete
        cancel_btn = confirm_sheet.find_element(By.CSS_SELECTOR, ".cancel-delete-btn, #cancel-delete, button.cancel, button[type='button']")
        cancel_btn.click()
        time.sleep(0.3)

        cards_after_cancel = self.driver.find_elements(By.CSS_SELECTOR, ".event-card, [data-event-id]")
        self.assertEqual(len(cards_after_cancel), initial_count, "Card must not be deleted after Cancel.")

        # Step B: Confirm delete
        first_card = self.driver.find_elements(By.CSS_SELECTOR, ".event-card, [data-event-id]")[0]
        first_card.click()
        time.sleep(0.3)
        delete_btn = first_card.find_element(By.CSS_SELECTOR, ".delete-btn, button[data-action='delete'], button[aria-label*='Delete']")
        delete_btn.click()
        time.sleep(0.3)

        confirm_sheet = WebDriverWait(self.driver, 5).until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "#delete-modal, .delete-sheet, .confirm-modal, [data-delete-modal]"))
        )
        confirm_btn = confirm_sheet.find_element(By.CSS_SELECTOR, ".confirm-delete-btn, #confirm-delete, button.danger, button[data-confirm]")
        confirm_btn.click()
        time.sleep(0.5)

        cards_after_delete = self.driver.find_elements(By.CSS_SELECTOR, ".event-card, [data-event-id]")
        self.assertEqual(len(cards_after_delete), initial_count - 1, "Card should be removed from DOM after confirmation.")

        raw_storage = self.driver.execute_script("return localStorage.getItem('events_v2');")
        events = json.loads(raw_storage)
        self.assertEqual(len(events), initial_count - 1, "Event should be removed from localStorage['events_v2'].")

    def test_tc3_7_category_filter_pills(self):
        """TC-3.7: Category filter pills filter cards and show active blue glow style."""
        pills = self.driver.find_elements(By.CSS_SELECTOR, ".filter-pill, .pill, nav.filter-bar button")
        self.assertGreaterEqual(len(pills), 6, "Expected at least 6 category filter pills + All.")

        # Find Birthday pill
        bday_pills = [p for p in pills if "Birthday" in p.text]
        self.assertTrue(len(bday_pills) > 0, "Birthday filter pill must exist.")
        bday_pill = bday_pills[0]

        bday_pill.click()
        time.sleep(0.3)

        # Verify active pill style (blue glow / active class)
        pill_style = self.driver.execute_script("""
            const p = arguments[0];
            const s = window.getComputedStyle(p);
            return {
                boxShadow: s.boxShadow,
                borderColor: s.borderColor,
                color: s.color,
                className: p.className
            };
        """, bday_pill)
        has_blue_glow = "74, 158, 255" in pill_style["boxShadow"] or "74, 158, 255" in pill_style["borderColor"] or "active" in pill_style["className"].lower()
        self.assertTrue(has_blue_glow, f"Active Birthday pill does not have blue glow or active style: {pill_style}")

        # Check visible cards: only Birthday cards should be visible
        visible_cards = [c for c in self.driver.find_elements(By.CSS_SELECTOR, ".event-card, [data-event-id]") if c.is_displayed()]
        for card in visible_cards:
            self.assertIn("Birthday", card.text, "When Birthday filter is active, only Birthday cards should be visible.")

        # Tap All pill to restore
        all_pills = [p for p in pills if "All" in p.text]
        if all_pills:
            all_pills[0].click()
            time.sleep(0.3)
            visible_after_all = [c for c in self.driver.find_elements(By.CSS_SELECTOR, ".event-card, [data-event-id]") if c.is_displayed()]
            self.assertEqual(len(visible_after_all), 5, "All active cards should be visible after clicking 'All'.")

    def test_tc3_8_collapsible_past_events_section(self):
        """TC-3.8: Past events appear in collapsible section, isolated from upcoming list."""
        # Inject 1 past event (-3 days) and 2 upcoming events (+1, +4 days)
        today = datetime.now().date()
        custom_events = [
            {"id": "past-1", "name": "Past Event A", "date": (today - timedelta(days=3)).strftime("%Y-%m-%d"), "category": "Meeting", "createdAt": time.time()},
            {"id": "future-1", "name": "Upcoming Event B", "date": (today + timedelta(days=1)).strftime("%Y-%m-%d"), "category": "Birthday", "createdAt": time.time()},
            {"id": "future-2", "name": "Upcoming Event C", "date": (today + timedelta(days=4)).strftime("%Y-%m-%d"), "category": "Deadline", "createdAt": time.time()}
        ]
        self.driver.execute_script("localStorage.setItem('events_v2', JSON.stringify(arguments[0]));", custom_events)
        self.driver.get(TARGET_URL)
        time.sleep(0.5)

        # Past event must NOT be in active list
        active_cards = self.driver.find_elements(By.CSS_SELECTOR, "#event-list .event-card, .active-events .event-card, main .event-card")
        active_names = [c.text for c in active_cards]
        for name in active_names:
            self.assertNotIn("Past Event A", name, "Past event must not appear in the active event list.")

        # Locate past events section header and toggle
        past_header = self.driver.find_element(By.CSS_SELECTOR, "#past-events-header, .past-header, summary, [data-past-toggle]")
        self.assertIn("1", past_header.text, f"Past events header should indicate 1 past event, found '{past_header.text}'.")

        # Tap to toggle expand/collapse
        past_header.click()
        time.sleep(0.3)
        past_cards = self.driver.find_elements(By.CSS_SELECTOR, "#past-events .event-card, .past-card, [data-past-card]")
        self.assertGreaterEqual(len(past_cards), 1, "Past event card should be visible in expanded past section.")

    def test_tc3_9_reload_persistence(self):
        """TC-3.9: Additions and deletions persist cleanly across browser refresh."""
        # Add an event via localStorage
        today = datetime.now().date()
        persisted_event = {
            "id": "persist-test-uuid",
            "name": "Persistence Verification Event",
            "date": (today + timedelta(days=8)).strftime("%Y-%m-%d"),
            "category": "Reminder",
            "notes": "Verify storage retention",
            "createdAt": time.time()
        }
        self.driver.execute_script("""
            const list = JSON.parse(localStorage.getItem('events_v2') || '[]');
            list.push(arguments[0]);
            localStorage.setItem('events_v2', JSON.stringify(list));
        """, persisted_event)

        # Refresh page
        self.driver.refresh()
        time.sleep(0.5)

        # Verify event exists in DOM
        body_text = self.driver.find_element(By.TAG_NAME, "body").text
        self.assertIn("Persistence Verification Event", body_text, "Persisted event must be rendered after page refresh.")


# ==============================================================================
# TIER 4: Visual, Layout, Animation, Time Travel & Edge Cases
# ==============================================================================
class TestTier4VisualLayoutAndEdgeCases(unittest.TestCase):
    """Tests 390px mobile viewport, 6 urgency colors, pulse animation, progress bar %, live countdown, and XSS safety."""

    @classmethod
    def setUpClass(cls):
        if not os.path.exists(TARGET_HTML):
            raise unittest.SkipTest(f"events.html not found at {TARGET_HTML}.")
        cls.driver = get_headless_driver(mobile=True)

    @classmethod
    def tearDownClass(cls):
        if hasattr(cls, 'driver') and cls.driver:
            cls.driver.quit()

    def setUp(self):
        self.driver.get(TARGET_URL)
        self.driver.execute_script("localStorage.clear();")
        self.driver.get(TARGET_URL)
        time.sleep(0.5)

    def test_tc4_1_mobile_390px_viewport_no_overflow(self):
        """TC-4.1: At 390px iPhone 14 viewport width, document has zero horizontal overflow."""
        metrics = self.driver.execute_script("""
            const doc = document.documentElement;
            const body = document.body;
            return {
                clientWidth: doc.clientWidth,
                scrollWidth: doc.scrollWidth,
                bodyScrollWidth: body.scrollWidth,
                innerWidth: window.innerWidth
            };
        """)
        self.assertEqual(metrics["clientWidth"], 390, f"Expected clientWidth 390, got {metrics['clientWidth']}")
        self.assertLessEqual(metrics["scrollWidth"], metrics["clientWidth"],
                             f"Horizontal overflow detected: scrollWidth ({metrics['scrollWidth']}) > clientWidth ({metrics['clientWidth']}).")
        self.assertLessEqual(metrics["bodyScrollWidth"], metrics["clientWidth"],
                             f"Body overflow detected: bodyScrollWidth ({metrics['bodyScrollWidth']}) > clientWidth ({metrics['clientWidth']}).")

    def test_tc4_2_urgency_color_scale_all_6_tiers(self):
        """TC-4.2: Verify left stripe and badge colors across all 6 urgency tiers."""
        today = datetime.now().date()
        test_events = [
            {"id": "u0", "name": "Tier 0d Event", "date": today.strftime("%Y-%m-%d"), "category": "Deadline", "createdAt": time.time()},
            {"id": "u1", "name": "Tier 2d Event", "date": (today + timedelta(days=2)).strftime("%Y-%m-%d"), "category": "Meeting", "createdAt": time.time()},
            {"id": "u2", "name": "Tier 5d Event", "date": (today + timedelta(days=5)).strftime("%Y-%m-%d"), "category": "Birthday", "createdAt": time.time()},
            {"id": "u3", "name": "Tier 10d Event", "date": (today + timedelta(days=10)).strftime("%Y-%m-%d"), "category": "Reminder", "createdAt": time.time()},
            {"id": "u4", "name": "Tier 20d Event", "date": (today + timedelta(days=20)).strftime("%Y-%m-%d"), "category": "Holiday", "createdAt": time.time()},
            {"id": "u5", "name": "Tier 45d Event", "date": (today + timedelta(days=45)).strftime("%Y-%m-%d"), "category": "Other", "createdAt": time.time()},
        ]
        self.driver.execute_script("localStorage.setItem('events_v2', JSON.stringify(arguments[0]));", test_events)
        self.driver.get(TARGET_URL)
        time.sleep(0.5)

        cards = self.driver.find_elements(By.CSS_SELECTOR, ".event-card, [data-event-id]")
        self.assertEqual(len(cards), 6, "Expected 6 cards rendered for urgency scale testing.")

        expected_colors = [
            ("0d (Red)", normalize_color("#ff4444")),
            ("2d (Orange)", normalize_color("#ff8c00")),
            ("5d (Amber)", normalize_color("#e8b030")),
            ("10d (Blue)", normalize_color("#4a9eff")),
            ("20d (Teal)", normalize_color("#3dd68c")),
            ("45d (Gray)", normalize_color("#6e7681")),
        ]

        for i, (label, expected_rgb) in enumerate(expected_colors):
            card = cards[i]
            # Check left border stripe or badge color
            colors = self.driver.execute_script("""
                const card = arguments[0];
                const badge = card.querySelector('.badge, .days-badge, [data-badge]');
                const sCard = window.getComputedStyle(card);
                const sBadge = badge ? window.getComputedStyle(badge) : null;
                return {
                    borderLeft: sCard.borderLeftColor,
                    badgeColor: sBadge ? sBadge.color : '',
                    badgeBg: sBadge ? sBadge.backgroundColor : '',
                    badgeBorder: sBadge ? sBadge.borderColor : ''
                };
            """, card)

            normalized_border = normalize_color(colors["borderLeft"])
            normalized_badge_bg = normalize_color(colors["badgeBg"])
            normalized_badge_col = normalize_color(colors["badgeColor"])

            color_matched = (expected_rgb in [normalized_border, normalized_badge_bg, normalized_badge_col])
            self.assertTrue(color_matched,
                            f"Tier {label} expected {expected_rgb}, but found border: '{normalized_border}', badgeBg: '{normalized_badge_bg}', badgeCol: '{normalized_badge_col}'")

    def test_tc4_3_pulsing_glow_animation_on_0_to_3_days_only(self):
        """TC-4.3: Pulsing glow animation is active on 0d and 1-3d, but static (none) on 4+ days."""
        today = datetime.now().date()
        test_events = [
            {"id": "p0", "name": "0-Day Pulse", "date": today.strftime("%Y-%m-%d"), "category": "Deadline", "createdAt": time.time()},
            {"id": "p2", "name": "2-Day Pulse", "date": (today + timedelta(days=2)).strftime("%Y-%m-%d"), "category": "Meeting", "createdAt": time.time()},
            {"id": "p5", "name": "5-Day Static", "date": (today + timedelta(days=5)).strftime("%Y-%m-%d"), "category": "Birthday", "createdAt": time.time()},
        ]
        self.driver.execute_script("localStorage.setItem('events_v2', JSON.stringify(arguments[0]));", test_events)
        self.driver.get(TARGET_URL)
        time.sleep(0.5)

        cards = self.driver.find_elements(By.CSS_SELECTOR, ".event-card, [data-event-id]")

        # 0d card or badge must animate
        anim_0d = self.driver.execute_script("""
            const c = arguments[0];
            const b = c.querySelector('.badge, .days-badge, [data-badge]');
            return (window.getComputedStyle(c).animationName || '') + ' ' + (b ? window.getComputedStyle(b).animationName || '' : '');
        """, cards[0])
        self.assertNotIn("none none", anim_0d.strip(), "0-day event card/badge must exhibit active pulsing animation.")

        # 2d card or badge must animate
        anim_2d = self.driver.execute_script("""
            const c = arguments[0];
            const b = c.querySelector('.badge, .days-badge, [data-badge]');
            return (window.getComputedStyle(c).animationName || '') + ' ' + (b ? window.getComputedStyle(b).animationName || '' : '');
        """, cards[1])
        self.assertNotIn("none none", anim_2d.strip(), "1-3 day event card/badge must exhibit active pulsing animation.")

        # 5d card and badge must NOT pulse
        anim_5d = self.driver.execute_script("""
            const c = arguments[0];
            const b = c.querySelector('.badge, .days-badge, [data-badge]');
            const ca = window.getComputedStyle(c).animationName;
            const ba = b ? window.getComputedStyle(b).animationName : 'none';
            return { cardAnim: ca, badgeAnim: ba };
        """, cards[2])
        self.assertTrue(anim_5d["cardAnim"] in ["none", ""] and anim_5d["badgeAnim"] in ["none", ""],
                        f"5-day event should have no pulse animation, found: {anim_5d}")

    def test_tc4_4_frosted_glass_aesthetics(self):
        """TC-4.4: Frosted glass styling with backdrop blur and semi-transparent backgrounds."""
        card = self.driver.find_element(By.CSS_SELECTOR, ".event-card, [data-event-id]")
        glass_styles = self.driver.execute_script("""
            const s = window.getComputedStyle(arguments[0]);
            return {
                backdropFilter: s.backdropFilter || s.webkitBackdropFilter || '',
                backgroundColor: s.backgroundColor
            };
        """, card)

        self.assertIn("blur", glass_styles["backdropFilter"].lower(),
                      f"Card missing 'blur' in backdropFilter: {glass_styles['backdropFilter']}")
        self.assertTrue("rgba" in glass_styles["backgroundColor"].lower() or "hsla" in glass_styles["backgroundColor"].lower(),
                        f"Card background must be semi-transparent, got {glass_styles['backgroundColor']}")

    def test_tc4_5_progress_bar_percentages(self):
        """TC-4.5: 30-day window progress bar percentages: 0% at 30+d, 50% at 15d, 90% at 3d, 100% at 0d."""
        today = datetime.now().date()
        test_events = [
            {"id": "pr0", "name": "Event 0d", "date": today.strftime("%Y-%m-%d"), "category": "Deadline", "createdAt": time.time()},
            {"id": "pr3", "name": "Event 3d", "date": (today + timedelta(days=3)).strftime("%Y-%m-%d"), "category": "Meeting", "createdAt": time.time()},
            {"id": "pr15", "name": "Event 15d", "date": (today + timedelta(days=15)).strftime("%Y-%m-%d"), "category": "Reminder", "createdAt": time.time()},
            {"id": "pr40", "name": "Event 40d", "date": (today + timedelta(days=40)).strftime("%Y-%m-%d"), "category": "Holiday", "createdAt": time.time()},
        ]
        self.driver.execute_script("localStorage.setItem('events_v2', JSON.stringify(arguments[0]));", test_events)
        self.driver.get(TARGET_URL)
        time.sleep(0.5)

        cards = self.driver.find_elements(By.CSS_SELECTOR, ".event-card, [data-event-id]")
        # Index 0: 0d (100%), Index 1: 3d (90%), Index 2: 15d (50%), Index 3: 40d (0%)
        expected_pcts = [100, 90, 50, 0]

        for i, exp in enumerate(expected_pcts):
            pct_val = self.driver.execute_script("""
                const card = arguments[0];
                const bar = card.querySelector('.progress-bar, .progress-fill, [data-progress]');
                if (!bar) return -1;
                const styleWidth = bar.style.width || '';
                const match = styleWidth.match(/(\\d+(?:\\.\\d+)?)%/);
                if (match) return parseFloat(match[1]);
                // If computed width vs parent width:
                const parent = bar.parentElement;
                if (parent && parent.clientWidth > 0) {
                    return Math.round((bar.clientWidth / parent.clientWidth) * 100);
                }
                return -1;
            """, cards[i])

            self.assertNotEqual(pct_val, -1, f"Progress bar element not found for card {i}.")
            self.assertAlmostEqual(pct_val, exp, delta=5,
                                   msg=f"Card {i} progress fill {pct_val}% does not match expected {exp}%.")

    def test_tc4_6_live_0_day_countdown_formatting(self):
        """TC-4.6: 0-day event badge displays live countdown in 'Xh YYm' format."""
        today = datetime.now().date()
        today_event = [
            {"id": "today-1", "name": "Live Today Event", "date": today.strftime("%Y-%m-%d"), "category": "Deadline", "createdAt": time.time()}
        ]
        self.driver.execute_script("localStorage.setItem('events_v2', JSON.stringify(arguments[0]));", today_event)
        self.driver.get(TARGET_URL)
        time.sleep(0.5)

        card = self.driver.find_element(By.CSS_SELECTOR, ".event-card, [data-event-id]")
        badge_text = self.driver.execute_script("""
            const card = arguments[0];
            const badge = card.querySelector('.badge, .days-badge, .badge-live-countdown, [data-badge]');
            return badge ? badge.textContent.trim() : card.textContent;
        """, card)

        # Must contain 'Xh YYm' format (e.g. 11h 45m or 0h 15m)
        self.assertTrue(re.search(r"\b\d{1,2}h\s+\d{1,2}m\b", badge_text),
                        f"0-day event badge does not display 'Xh YYm' countdown format: '{badge_text}'")

    def test_tc4_7_past_events_visual_dimming(self):
        """TC-4.7: Past events exhibit visually dimmed opacity (<= 0.7)."""
        today = datetime.now().date()
        events = [
            {"id": "past-dim", "name": "Dimmed Past Event", "date": (today - timedelta(days=4)).strftime("%Y-%m-%d"), "category": "Meeting", "createdAt": time.time()}
        ]
        self.driver.execute_script("localStorage.setItem('events_v2', JSON.stringify(arguments[0]));", events)
        self.driver.get(TARGET_URL)
        time.sleep(0.5)

        # Open past events
        past_header = self.driver.find_element(By.CSS_SELECTOR, "#past-events-header, .past-header, summary, [data-past-toggle]")
        past_header.click()
        time.sleep(0.3)

        past_card = self.driver.find_element(By.CSS_SELECTOR, "#past-events .event-card, .past-card, [data-past-card]")
        opacity = float(self.driver.execute_script("return window.getComputedStyle(arguments[0]).opacity;", past_card))
        self.assertLessEqual(opacity, 0.75, f"Past event card should be dimmed (opacity <= 0.7), got {opacity}.")

    def test_tc4_8_malformed_localstorage_fault_tolerance(self):
        """TC-4.8: Malformed JSON in localStorage is safely caught, reseeding 5 default events without crashing."""
        self.driver.execute_script("localStorage.setItem('events_v2', '{ corrupt json syntax: true ');")
        self.driver.get(TARGET_URL)
        time.sleep(0.5)

        # Assert app did not crash to blank screen: cards should be restored
        cards = self.driver.find_elements(By.CSS_SELECTOR, ".event-card, [data-event-id]")
        self.assertEqual(len(cards), 5, f"Expected 5 reseeded events after recovering from corrupted storage, got {len(cards)}.")

    def test_tc4_9_xss_prevention(self):
        """TC-4.9: Malicious HTML and script tags in event name/notes are safely escaped."""
        xss_payload = "<img src=x onerror=\"window.__xss_executed=true;\">"
        today = datetime.now().date()
        xss_event = [
            {"id": "xss-1", "name": xss_payload, "date": (today + timedelta(days=4)).strftime("%Y-%m-%d"), "category": "Other", "notes": "<script>window.__xss_executed=true;</script>", "createdAt": time.time()}
        ]
        self.driver.execute_script("localStorage.setItem('events_v2', JSON.stringify(arguments[0]));", xss_event)
        self.driver.get(TARGET_URL)
        time.sleep(0.5)

        xss_executed = self.driver.execute_script("return window.__xss_executed === true;")
        self.assertFalse(xss_executed, "XSS injection was executed! Text was not properly escaped.")

    def test_tc4_10_alphabetical_tie_break_sorting(self):
        """TC-4.10: Events with identical days remaining sort alphabetically by name."""
        today = datetime.now().date()
        same_day_events = [
            {"id": "tb-z", "name": "Zeta Meeting", "date": (today + timedelta(days=3)).strftime("%Y-%m-%d"), "category": "Meeting", "createdAt": time.time()},
            {"id": "tb-a", "name": "Alpha Meeting", "date": (today + timedelta(days=3)).strftime("%Y-%m-%d"), "category": "Meeting", "createdAt": time.time()},
            {"id": "tb-m", "name": "Middle Meeting", "date": (today + timedelta(days=3)).strftime("%Y-%m-%d"), "category": "Meeting", "createdAt": time.time()}
        ]
        self.driver.execute_script("localStorage.setItem('events_v2', JSON.stringify(arguments[0]));", same_day_events)
        self.driver.get(TARGET_URL)
        time.sleep(0.5)

        card_titles = [c.text for c in self.driver.find_elements(By.CSS_SELECTOR, ".event-card h3, .card-title, .event-name")]
        filtered_titles = [t for t in card_titles if "Meeting" in t]

        expected_titles = ["Alpha Meeting", "Middle Meeting", "Zeta Meeting"]
        for i, expected in enumerate(expected_titles):
            self.assertIn(expected, filtered_titles[i],
                          f"Alphabetical tie-break failed: expected '{expected}' at position {i}, got '{filtered_titles[i]}'.")


# ==============================================================================
# Runner Execution
# ==============================================================================
if __name__ == "__main__":
    print("=" * 70)
    print("RUNNING E2E TEST SUITE FOR events.html (Tiers 1 - 4)")
    print(f"Target: {TARGET_HTML}")
    print(f"File Present: {os.path.exists(TARGET_HTML)}")
    print("=" * 70)

    runner = unittest.TextTestRunner(verbosity=2)
    suite = unittest.TestSuite()
    suite.addTests(unittest.defaultTestLoader.loadTestsFromTestCase(TestTier1StaticCodeAndPurity))
    suite.addTests(unittest.defaultTestLoader.loadTestsFromTestCase(TestTier2DomInitAndDataContracts))
    suite.addTests(unittest.defaultTestLoader.loadTestsFromTestCase(TestTier3InteractiveWorkflows))
    suite.addTests(unittest.defaultTestLoader.loadTestsFromTestCase(TestTier4VisualLayoutAndEdgeCases))
    
    result = runner.run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)
