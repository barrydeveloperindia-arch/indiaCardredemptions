import os
from PIL import Image

image_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'assets', 'images', 'dark_luxury_bg.png'))
print(f"Opening image: {image_path}")

try:
    with Image.open(image_path) as img:
        print(f"Format: {img.format}, Size: {img.size}, Mode: {img.mode}")
        # Convert to RGB to discard any palette/transparency profile issues
        clean_img = img.convert('RGB')
        # Save back as clean standard PNG
        clean_img.save(image_path, 'PNG')
        print("Successfully re-saved as clean standard PNG.")
except Exception as e:
    print(f"Error fixing image: {e}")
