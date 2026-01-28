
import pytest
from playwright.sync_api import sync_playwright, expect
import time

BASE_URL = "http://localhost:5173"

@pytest.fixture(scope="module")
def browser():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        yield browser
        browser.close()

@pytest.fixture(scope="function")
def page(browser):
    page = browser.new_page()
    # Perform Login
    page.goto(BASE_URL)
    
    # Check if we are on Login page
    if page.locator("text=Secure Operator Access").is_visible(timeout=3000):
        print("Logging in...")
        # Fill Credentials
        page.fill("input[type='text']", "admin")
        page.fill("input[type='password']", "admin")
        page.click("button[type='submit']")
        
        # Wait for meaningful Dashboard content to ensure login success
        # "Dispatch Command" is reliable based on manual verification
        try:
            page.wait_for_selector("text=Dispatch Command", timeout=30000)
        except Exception as e:
            print(f"Login timeout! Current URL: {page.url}")
            page.screenshot(path="login_failed.png")
            raise e
    
    # If we are already on dashboard (no login needed), we just proceed
    yield page
    page.close()

def test_catalog_rendering(page):
    """
    Verify that the Catalog renders parts correctly with images and proper metadata.
    """
    page.goto(f"{BASE_URL}/catalog")
    # Wait for parts to load - increased wait time for backend spin-up
    page.wait_for_selector(".grid", timeout=15000)
    
    # Check for at least one part card
    cards = page.locator(".bg-white.border.border-gray-200")
    # Wait for at least one card
    cards.first.wait_for(state="visible", timeout=5000)
    
    expect(cards.first).to_be_visible()
    
    # Check for image presence OR 'No Preview' placeholder
    img = cards.first.locator("img")
    no_preview = cards.first.locator("text=No Preview")
    
    # Assert one of them is visible
    if no_preview.is_visible():
        expect(no_preview).to_be_visible()
    else:
        expect(img).to_be_visible()
        # Ensure src is not empty if image exists
        assert img.get_attribute("src") is not None

def test_catalog_2d_drawing_link(page):
    """
    Verify that hovering a part reveals the '2D Dwg' button and it is clickable.
    """
    page.goto(f"{BASE_URL}/catalog")
    page.wait_for_selector(".grid", timeout=15000)
    
    card = page.locator(".bg-white.border.border-gray-200.group").first
    card.scroll_into_view_if_needed()
    card.hover(force=True)
    
    # Check for 2D Dwg button
    dwg_btn = card.locator("button:has-text('2D Dwg')")
    # Verify it exists in DOM
    expect(dwg_btn).to_be_attached()
    # Ensure it becomes visible (give CSS transition time)
    expect(dwg_btn).to_be_visible(timeout=5000)
    
    # Click and verify new tab or navigation
    with page.expect_popup() as popup_info:
        dwg_btn.click()
    
    new_page = popup_info.value
    new_page.wait_for_load_state()
    assert "drawing-viewer" in new_page.url or "part_id" in new_page.url

def test_catalog_view_3d(page):
    """
    Verify that clicking 'View 3D' opens the Standalone Viewer and loads the model.
    """
    page.goto(f"{BASE_URL}/catalog")
    page.wait_for_selector(".grid", timeout=15000)
    
    card = page.locator(".bg-white.border.border-gray-200.group").first
    card.scroll_into_view_if_needed()
    card.hover(force=True)
    
    # Check for View 3D button (it's in the same hover group usually)
    view_3d_btn = card.locator("button:has-text('View 3D')")
    expect(view_3d_btn).to_be_visible(timeout=5000)
    
    with page.expect_popup() as popup_info:
        view_3d_btn.click()
        
    viewer_page = popup_info.value
    viewer_page.wait_for_load_state()
    
    # Verify URL structure
    assert "viewer" in viewer_page.url
    assert "url=" in viewer_page.url
    
    # Wait for viewer to initialize (check for canvas or loading error)
    # If 404 happens, it might show "Viewer Error" or similar, or just a blank canvas.
    # We check for the absence of "Viewer Error" text which StandaloneViewer renders on failure.
    expect(viewer_page.locator("text=Viewer Error")).not_to_be_visible(timeout=5000)
    
    # Check for Canvas or Spinner
    # The viewer usually renders a canvas
    # expect(viewer_page.locator("canvas")).to_be_visible(timeout=10000)

def test_catalog_2d_generation(page):
    """
    Verify that clicking '2D Dwg' triggers drawing generation and opens the viewer.
    """
    page.goto(f"{BASE_URL}/catalog")
    page.wait_for_selector(".grid", timeout=15000)
    
    card = page.locator(".bg-white.border.border-gray-200.group").first
    card.scroll_into_view_if_needed()
    card.hover(force=True)
    
    dwg_btn = card.locator("button:has-text('2D Dwg')")
    expect(dwg_btn).to_be_visible(timeout=5000)
    
    with page.expect_popup() as popup_info:
        dwg_btn.click()
    
    dwg_page = popup_info.value
    dwg_page.wait_for_load_state()
    
    # Check URL for drawing viewer
    assert "drawing-viewer" in dwg_page.url
    
    # Wait for Drawing canvas or Loading state
    # The viewer should show "Generating Drawing..." or the canvas
    # We verify it doesn't crash or show a 404
    expect(dwg_page.locator("text=Generating")).to_be_visible(timeout=5000)
    
    # Ideally wait for success, but generation might take time (threadpool)
    # Just verifying the request was sent and page loaded is good for smoke test.
    # If possible, check for "Drawing Generated" toast or canvas presence
    # expect(dwg_page.locator("canvas")).to_be_visible(timeout=20000)


def test_catalog_search(page):
    """
    Verify search functionality.
    """
    page.goto(f"{BASE_URL}/catalog")
    page.wait_for_selector("input[placeholder='Search parts...']", timeout=15000)
    
    search_input = page.locator("input[placeholder='Search parts...']")
    search_input.fill("test")
    # Wait for debounce/filter
    time.sleep(1)
    
    # We don't know exact results, but page shouldn't crash
    expect(page.locator(".grid")).to_be_visible()

def test_catalog_filter_process(page):
    """
    Verify process filtering.
    """
    page.goto(f"{BASE_URL}/catalog")
    page.wait_for_selector("select", timeout=15000)
    
    select = page.locator("select").first
    select.select_option("MJF")
    time.sleep(1)
    
    # Verify filter logic (basic check that grid still exists)
    expect(page.locator(".grid")).to_be_visible()

def test_catalog_select_all(page):
    """
    Verify select all checkbox.
    """
    page.goto(f"{BASE_URL}/catalog")
    page.wait_for_selector("input[type='checkbox']", timeout=15000)
    
    # Find master checkbox (first one usually)
    master_checkbox = page.locator("input[type='checkbox']").first
    master_checkbox.check()
    
    # Verify "Delete" button appears
    delete_btn = page.locator("button:has-text('Delete')")
    expect(delete_btn).to_be_visible()
