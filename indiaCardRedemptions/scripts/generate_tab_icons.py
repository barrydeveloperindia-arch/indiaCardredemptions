import os
from PIL import Image, ImageDraw

def create_icon(name, draw_fn):
    sizes = [
        ("", 24),
        ("@2x", 48),
        ("@3x", 72)
    ]
    
    # We draw at a super-resolution of 288x288, then downscale using Lanczos for clean anti-aliasing
    super_size = 288
    
    for suffix, size in sizes:
        img = Image.new("RGBA", (super_size, super_size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # Call the drawing function
        draw_fn(draw, super_size)
        
        # Downscale to target size
        img_resized = img.resize((size, size), Image.Resampling.LANCZOS)
        
        # Save to assets/images/tabIcons/
        os.makedirs("assets/images/tabIcons", exist_ok=True)
        filename = f"assets/images/tabIcons/{name}{suffix}.png"
        img_resized.save(filename)
        print(f"Generated {filename} ({size}x{size})")

# Tab 1: Home (Minimalist House)
def draw_home(draw, size):
    # Stroke properties
    w = 16
    color = (255, 255, 255, 255)
    
    # Roof (triangle)
    draw.line([(40, 130), (144, 40), (248, 130)], fill=color, width=w, joint="round")
    # Walls (box)
    draw.line([(70, 130), (70, 240), (218, 240), (218, 130)], fill=color, width=w, joint="round")
    # Door
    draw.line([(120, 240), (120, 180), (168, 180), (168, 240)], fill=color, width=w, joint="round")

# Tab 2: Explore (Compass/Globe)
def draw_explore(draw, size):
    w = 16
    color = (255, 255, 255, 255)
    
    # Outer Circle
    draw.ellipse([40, 40, 248, 248], outline=color, width=w)
    
    # Compass Needle (pointed diamond)
    draw.polygon([(144, 70), (174, 144), (144, 218), (114, 144)], outline=color, width=w)
    # Pivot point
    draw.ellipse([136, 136, 152, 152], fill=color)

# Tab 3: Concierge (Bell)
def draw_concierge(draw, size):
    w = 16
    color = (255, 255, 255, 255)
    
    # Base stand
    draw.line([(40, 240), (248, 240)], fill=color, width=w, joint="round")
    # Base ring/under-bell
    draw.line([(60, 220), (228, 220)], fill=color, width=w, joint="round")
    # Dome
    draw.arc([60, 90, 228, 240], 180, 360, fill=color, width=w)
    # Plunger button on top
    draw.line([(144, 90), (144, 60)], fill=color, width=w)
    draw.line([(120, 60), (168, 60)], fill=color, width=w, joint="round")

# Tab 4: Hacks (Lightning Bolt)
def draw_hacks(draw, size):
    w = 16
    color = (255, 255, 255, 255)
    
    # Lightning path (pointed)
    draw.polygon([
        (160, 30),
        (80, 150),
        (140, 150),
        (120, 258),
        (208, 138),
        (148, 138)
    ], outline=color, width=w)

# Tab 5: Intel (Trending/Graph Arrow)
def draw_intel(draw, size):
    w = 16
    color = (255, 255, 255, 255)
    
    # Graph line pointing up-right
    draw.line([(50, 230), (110, 170), (170, 190), (230, 80)], fill=color, width=w, joint="round")
    # Arrow head
    draw.line([(170, 80), (230, 80), (230, 140)], fill=color, width=w, joint="round")
    
    # Optional base axes (L shape)
    draw.line([(40, 50), (40, 240), (230, 240)], fill=color, width=w, joint="round")

# Tab 6: Deals (Price Tag)
def draw_deals(draw, size):
    w = 16
    color = (255, 255, 255, 255)
    
    # A tilted price tag shape
    # Start top-left-ish, cut corner, body, end
    draw.polygon([
        (130, 50),
        (210, 50),
        (240, 80),
        (240, 210),
        (100, 210),
        (100, 80)
    ], outline=color, width=w)
    
    # Tag hole
    draw.ellipse([156, 90, 184, 118], outline=color, width=w)
    
    # Percent symbol % inside the tag
    # Circle 1
    draw.ellipse([125, 140, 145, 160], fill=color)
    # Circle 2
    draw.ellipse([195, 170, 215, 190], fill=color)
    # Slash
    draw.line([(140, 185), (200, 145)], fill=color, width=w)

if __name__ == "__main__":
    create_icon("home", draw_home)
    create_icon("explore", draw_explore)
    create_icon("concierge", draw_concierge)
    create_icon("hacks", draw_hacks)
    create_icon("intel", draw_intel)
    create_icon("deals", draw_deals)
