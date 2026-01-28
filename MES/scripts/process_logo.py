from PIL import Image
import numpy as np

def extract_logo():
    input_path = "/app/src/assets/logo.png"
    output_path = "/app/src/assets/logo_clean.png" # Non-destructive output
    
    try:
        img = Image.open(input_path).convert("RGBA")
        datas = img.getdata()
        
        # 2. Smart Auto-Crop
        # Instead of fixed heuristics, we find the content bounding box.
        bg_color = img.getpixel((0, 0))
        
        # Create a binary mask of "content" vs "background"
        # We can use a simple difference threshold
        diff = Image.new("L", img.size, 0)
        
        # Iterate (slow in pure python, but fine for 1 image)
        # Faster: Use difference from bg
        from PIL import ImageChops
        bg_img = Image.new("RGBA", img.size, bg_color)
        diff_img = ImageChops.difference(img, bg_img)
        bbox = diff_img.getbbox()
        
        if bbox:
            logo_region = img.crop(bbox)
            print(f"Auto-cropped to: {bbox}")
        else:
            logo_region = img
            print("No content found to crop, using full image")
             
        # 3. Smart Coloring & BG Removal
        new_data = []
        region_datas = logo_region.getdata()
        
        # Sample BG color from top-left of the region
        bg_sample = region_datas[0]
        
        for item in region_datas:
            # Distance from BG
            dist = sum(abs(item[i] - bg_sample[i]) for i in range(3))
            
            if dist < 40:
                # Background -> Transparent
                new_data.append((255, 255, 255, 0))
            elif item[0] > 200 and item[1] > 200 and item[2] > 200:
                # White Text ("Eng") -> Dark Grey (50, 50, 50) for contrast on White Paper
                new_data.append((50, 50, 50, 255))
            else:
                # Green Text/Swirl ("labs") -> Brand Green (76, 200, 100)
                new_data.append((76, 200, 100, 255))
                
        logo_region.putdata(new_data)
        
        # 4. Auto-Crop (Trim transparent borders)
        bbox = logo_region.getbbox()
        if bbox:
            final_logo = logo_region.crop(bbox)
        else:
            final_logo = logo_region
            
        final_logo.save(output_path, "PNG")
        print(f"Extracted logo saved to {output_path}")
        print(f"Original Size: {w}x{h}. New Size: {final_logo.size}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    extract_logo()
