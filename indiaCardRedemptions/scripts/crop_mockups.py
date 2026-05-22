import os
from PIL import Image

def crop_mockups():
    img_path = r"c:\Users\pc\Documents\Antigravity\indiaCardRedemptions\ui_mockups\main_showcase_mockup.png"
    if not os.path.exists(img_path):
        print(f"Error: Showcase mockup not found at {img_path}")
        return
    
    img = Image.open(img_path)
    width, height = img.size
    print(f"Original image size: {width}x{height}")
    
    # Based on the 1024x1024 layout of the combined mockup, the phone screens are positioned horizontally:
    # - Wallet Screen (Left)
    # - Hotel Arbitrage Calculator Screen (Middle)
    # - AI Routing Chat Screen (Right)
    #
    # Let's crop each screen with its respective label at the bottom and a clean border.
    # Coordinates format: (left, upper, right, lower)
    
    crops = {
        "wallet_screen_mockup.png": (15, 220, 350, 920),
        "arbitrage_screen_mockup.png": (340, 200, 680, 920),
        "chat_screen_mockup.png": (670, 220, 1010, 920)
    }
    
    output_dir = r"c:\Users\pc\Documents\Antigravity\indiaCardRedemptions\ui_mockups"
    
    for filename, bbox in crops.items():
        cropped_img = img.crop(bbox)
        dest_path = os.path.join(output_dir, filename)
        cropped_img.save(dest_path)
        print(f"Successfully cropped and saved {filename} to {dest_path} with bounds {bbox}")

if __name__ == "__main__":
    crop_mockups()
