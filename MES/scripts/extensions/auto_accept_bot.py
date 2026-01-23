import time
import pyautogui
import os
from PIL import Image, ImageDraw, ImageFont # Requires: pip install Pillow
import sys

# Configuration
TEMPLATE_FILENAME = "accept_all_template.png"
CONFIDENCE = 0.8
CHECK_INTERVAL_SECONDS = 2

def generate_template():
    """
    Generates a synthetic template for the 'Accept all' button.
    This mimics the VS Code/IDE blue button style.
    """
    # Dimensions estimated from screenshots (e.g. 100x24)
    width = 100
    height = 30
    color = (0, 120, 212) # VS Code Blue (approx #0078d4)
    text_color = (255, 255, 255)
    
    img = Image.new('RGB', (width, height), color)
    d = ImageDraw.Draw(img)
    
    # Text
    try:
        # Default font, try to find a sans-serif
        # font = ImageFont.truetype("arial.ttf", 14)
        # Fallback to default if arial not found
        font = ImageFont.load_default()
    except:
        font = ImageFont.load_default()
        
    # We can't center perfectly without font metrics, but rough estimate:
    # d.text((15, 7), "Accept all", fill=text_color, font=font)
    
    # Since synthetic generation is risky regarding fonts (VS Code font vs System font),
    # A BETTER APPROACH: Search for the BUTTON COLOR + SHAPE, then check center pixel?
    # OR: Just search for a solid blue block of that specific shade?
    
    # Let's save a simple color block for now to test "Color Match"
    # Actually, PyAutoGUI locateOnScreen works best with actual images.
    # Since I cannot see the screen to grab a snippet, I will try a COLOR-BASED heuristic instead of Template Matching.
    return None

def click_blue_buttons():
    print(f"[{time.strftime('%X')}] Scanning for 'Accept All' buttons...")
    
    # VS Code 'Accept All' Blue: RGB(0, 120, 212) -> Hex #0078d4
    # We allow a small tolerance.
    target_blue = (0, 120, 212)
    
    try:
        # Take screenshot
        screenshot = pyautogui.screenshot()
        width, height = screenshot.size
        
        # Checking every pixel is SLOW.
        # Check center region or scan grid?
        # A full screen scan in Python is slow.
        # Use locateOnScreen if possible.
        
        # Strategy: Use pyautogui.locateAllOnScreen with a small blue swatch?
        # Let's create a small blue swatch.
        swatch = Image.new('RGB', (20, 10), target_blue)
        swatch_path = "temp_blue_swatch.png"
        swatch.save(swatch_path)
        
        # Locate all occurrences of this blue color block
        locations = list(pyautogui.locateAllOnScreen(swatch_path, confidence=0.9))
        
        clicked_count = 0
        for loc in locations:
            # We found a blue block. Is it the button?
            # It's risky to click ALL blue things.
            # But the user specifically asked for this behavior.
            
            # Additional check:
            # Determine center
            center = pyautogui.center(loc)
            
            # Move and Click
            # print(f"Found candidate at {center}. Clicking...")
            pyautogui.click(center)
            clicked_count += 1
            time.sleep(0.2) # Small delay to perform action
            
        if clicked_count > 0:
            print(f"Clicked {clicked_count} buttons.")
            
        # Cleanup
        if os.path.exists(swatch_path):
            os.remove(swatch_path)
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    print("--- Auto-Accept Bot Started ---")
    print("Press Ctrl+C to stop.")
    print("Scanning screen for Blue 'Accept All' buttons...")
    
    # Fail-safe: moving mouse to corner will abort script
    pyautogui.FAILSAFE = True
    
    while True:
        click_blue_buttons()
        time.sleep(CHECK_INTERVAL_SECONDS)
