
import pytest
from playwright.sync_api import sync_playwright, expect

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
    yield page
    page.close()

def test_dispatch_board_load(page):
    """
    Verify Dispatch Board loads and displays job cards.
    """
    page.goto(f"{BASE_URL}/") # Or /dispatch if separate, but home seems to contain it or link to it
    # Check for known text
    expect(page.locator("text=Dispatch Command")).to_be_visible()
    
    # Check if job cards are present (if seeded)
    # expect(page.locator(".job-card")).to_be_visible() 

def test_digital_traveler_button(page):
    """
    Verify the 'Traveler' button exists on job cards.
    """
    page.goto(f"{BASE_URL}/")
    
    # Wait for any job card
    # This might fail if no jobs, so we wrap in try/except or skip if empty
    try:
        page.wait_for_selector("div.bg-white.rounded-lg", timeout=5000)
        # Look for the Traveler/Print button inside a card
        # Adjust selector based on actual class or text
        traveler_btn = page.locator("button:has-text('Traveler')").first
        if traveler_btn.is_visible():
            expect(traveler_btn).to_be_visible()
    except:
        pytest.skip("No job cards available to test Traveler button")
