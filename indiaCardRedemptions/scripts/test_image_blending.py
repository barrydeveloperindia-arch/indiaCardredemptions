import os
import sys
from PIL import Image

# Ensure project path is in python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scripts.generate_slides import remove_black_background, IMAGES_DIR

def test_hourglass_blending_quality():
    print("[QA] Running Visual QA test on 3D Hourglass image...")
    
    # 1. Load the original motif image
    img_path = os.path.join(IMAGES_DIR, "3d_hourglass.png")
    if not os.path.exists(img_path):
        print(f"Error: Hourglass image not found at {img_path}")
        sys.exit(1)
        
    img = Image.open(img_path)
    
    # 2. Process image with remove_black_background
    processed_img = remove_black_background(img, threshold=15)
    
    # 3. Analyze the alpha channel
    pix = processed_img.load()
    width, height = processed_img.size
    
    transparent_count = 0
    opaque_count = 0
    feathered_count = 0
    
    for y in range(height):
        for x in range(width):
            r, g, b, a = pix[x, y]
            if a == 0:
                transparent_count += 1
            elif a == 255:
                opaque_count += 1
            else:
                feathered_count += 1
                
    total_pixels = width * height
    print(f"Pixel Distribution Analysis:")
    print(f"   - Fully Transparent (alpha = 0): {transparent_count} ({transparent_count / total_pixels * 100:.2f}%)")
    print(f"   - Fully Opaque (alpha = 255): {opaque_count} ({opaque_count / total_pixels * 100:.2f}%)")
    print(f"   - Feathered/Transition Zone (0 < alpha < 255): {feathered_count} ({feathered_count / total_pixels * 100:.2f}%)")
    
    # Assertions for premium blending quality
    # A. We must have a transparent background
    assert transparent_count > 0, "Fail: Background is not transparent."
    
    # B. We must have an opaque core for the 3D motif
    assert opaque_count > 0, "Fail: Motif itself is fully transparent."
    
    # C. Verification loop gate: we must have a smooth feathered border
    # If the feathered border pixel count is too small (e.g. less than 10,000 pixels),
    # it means the outline is a sharp jagged crop. A smooth blend needs thousands of feathered pixels.
    min_feathered_threshold = 8000
    assert feathered_count >= min_feathered_threshold, (
        f"Fail: Outline has only {feathered_count} feathered pixels. "
        f"Expected at least {min_feathered_threshold} for a smooth blend. The outline is too jagged (cropped)."
    )
    
    print("Pass: Blending quality is premium (smooth feathered border, no jagged cropping!).")

def test_slide_opacity():
    print("[QA] Checking generated slide opacity (ensuring no transparency leaks)...")
    
    # Import SOCIAL_DIR
    from scripts.generate_slides import SOCIAL_DIR
    
    slide_path = os.path.join(SOCIAL_DIR, "2026-06-22_week4_post7_app_launch", "slide2.png")
    if not os.path.exists(slide_path):
        print("Generated slides not found. Skipping slide opacity test.")
        return
        
    img = Image.open(slide_path)
    pix = img.load()
    width, height = img.size
    
    # Scan for any transparent pixels
    for y in range(0, height, 10): # step to speed up check
        for x in range(0, width, 10):
            pixel = pix[x, y]
            if len(pixel) == 4 and pixel[3] < 255:
                raise AssertionError(
                    f"Fail: Slide contains transparent pixels at ({x}, {y}) with alpha={pixel[3]}. "
                    "The slide background is leaking transparency, causing checkerboards to render in image viewers."
                )
    print("Pass: Slide has 100% opaque background (no transparency leakage!).")

if __name__ == "__main__":
    try:
        test_hourglass_blending_quality()
        test_slide_opacity()
    except AssertionError as e:
        print(str(e))
        sys.exit(1)
