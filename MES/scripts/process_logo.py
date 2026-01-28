from PIL import Image, ImageOps
import os

def extract_logo():
    input_path = "/app/src/assets/logo.png"
    output_path = "/app/src/assets/logo_clean.png"
    
    try:
        img = Image.open(input_path).convert("RGBA")
        
        # 1. Smart Crop (Threshold Inverted)
        # Convert to RGB, Invert. White(255)->0. Content->High.
        inverted = ImageOps.invert(img.convert("RGB"))
        # Threshold to remove noise (any inverted val < 30 becomes 0)
        # 30 threshold means original pixel > 225 is treated as White.
        mask = inverted.point(lambda p: 255 if p > 30 else 0)
        bbox = mask.getbbox()
        
        if bbox:
            print(f"Cropped to {bbox}")
            logo_region = img.crop(bbox)
        else:
            print("No content found to crop")
            logo_region = img
            
        # 2. Styling & BG Removal
        new_data = []
        # White BG Reference
        bg_ref = (255, 255, 255)
        
        for item in logo_region.getdata():
            # Dist from White
            dist = sum(abs(item[i] - bg_ref[i]) for i in range(3))
            
            if dist < 40:
                # Background -> Transparent
                new_data.append((255, 255, 255, 0))
            else:
                 # Content -> Keep Original Color, Force Full Opacity
                 new_data.append((item[0], item[1], item[2], 255))
                 
        logo_region.putdata(new_data)
        logo_region.save(output_path, "PNG")
        print("Success")
        
    except Exception as e:
        print(f"Error: {e}")
        
if __name__ == "__main__":
    extract_logo()
