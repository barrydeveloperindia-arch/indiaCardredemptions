import os
import shutil
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# Base Directory Configurations
BASE_DIR = r"c:\Users\SAM\Documents\Antigravity\indiaCardredemptions\indiaCardRedemptions"
ASSETS_DIR = os.path.join(BASE_DIR, "assets")
IMAGES_DIR = os.path.join(ASSETS_DIR, "images")
REEL_DIR = os.path.join(ASSETS_DIR, "social_media", "2026-06-09_week1_post1_catalog_trap_reel")

# Design Tokens (V2 Aesthetics)
COLOR_BG = (9, 10, 15, 255)         # Obsidian Black
COLOR_GOLD = (212, 175, 55, 255)     # Metallic Gold
COLOR_TEXT = (245, 242, 235, 255)    # Champagne Light
COLOR_RED_BG = (220, 38, 38, 255)    # Deep Red Badge
COLOR_GOLD_BG = (191, 149, 63, 255)  # Darker Gold Badge
COLOR_CARD_BG = (18, 20, 28, 200)    # Frosted glassmorphic dark charcoal

# Font configuration
def get_fonts():
    font_paths = [
        "C:\\Windows\\Fonts\\segoeui.ttf",
        "C:\\Windows\\Fonts\\arial.ttf",
        "C:\\Windows\\Fonts\\calibri.ttf"
    ]
    font_file = None
    for path in font_paths:
        if os.path.exists(path):
            font_file = path
            break
            
    if font_file:
        return {
            "title": lambda size: ImageFont.truetype(font_file, size),
            "body": lambda size: ImageFont.truetype(font_file, size),
            "bold": lambda size: ImageFont.truetype(font_file, size)
        }
    else:
        default_fnt = ImageFont.load_default()
        return {
            "title": lambda size: default_fnt,
            "body": lambda size: default_fnt,
            "bold": lambda size: default_fnt
        }

FONTS = get_fonts()

def wrap_text(text, font, max_width):
    words = text.split(' ')
    lines = []
    current_line = []
    
    for word in words:
        current_line.append(word)
        test_line = ' '.join(current_line)
        try:
            line_width = font.getlength(test_line)
        except AttributeError:
            line_width = font.getbbox(test_line)[2]
            
        if line_width > max_width:
            current_line.pop()
            lines.append(' '.join(current_line))
            current_line = [word]
            
    if current_line:
        lines.append(' '.join(current_line))
    return lines

def create_reel_background():
    # Vertical background 1080x1920
    img = Image.new("RGBA", (1080, 1920), COLOR_BG)
    
    # Elegant central radial gold glow
    glow_size = 1200
    glow_img = Image.new("RGBA", (glow_size, glow_size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_img)
    glow_draw.ellipse([150, 150, glow_size - 150, glow_size - 150], fill=(212, 175, 55, 10))
    glow_img = glow_img.filter(ImageFilter.GaussianBlur(150))
    
    temp_glow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    temp_glow.paste(glow_img, ((1080 - glow_size) // 2, (1920 - glow_size) // 2))
    img = Image.alpha_composite(img, temp_glow)
    return img

def remove_black_background(image, threshold=15, fade_margin=120):
    rgba = image.convert("RGBA")
    pix = rgba.load()
    width, height = rgba.size
    for y in range(height):
        for x in range(width):
            r, g, b, a = pix[x, y]
            v = max(r, g, b)
            
            if v < threshold:
                alpha = 0
            elif v > 60:
                alpha = a if a != 0 else 255
            else:
                t = (v - threshold) / (60.0 - threshold)
                alpha = int(t * 255)
                
            dx = min(x, width - 1 - x)
            dy = min(y, height - 1 - y)
            d = min(dx, dy)
            if d < fade_margin:
                fade_factor = (d / float(fade_margin)) ** 2
                alpha = int(alpha * fade_factor)
                
            pix[x, y] = (r, g, b, alpha)
    return rgba

def create_reel_base(title_text):
    img = create_reel_background()
    
    # Logo top right
    logo_path = os.path.join(IMAGES_DIR, "updated_brand_logo.png")
    if os.path.exists(logo_path):
        logo = Image.open(logo_path)
        logo_transparent = remove_black_background(logo, threshold=15)
        logo_resized = logo_transparent.resize((120, 120), Image.Resampling.LANCZOS)
        
        temp_logo = Image.new("RGBA", img.size, (0, 0, 0, 0))
        temp_logo.paste(logo_resized, (920, 40))
        img = Image.alpha_composite(img, temp_logo)
        
    draw = ImageDraw.Draw(img)
    
    # Gold border line at the bottom
    draw.line([(0, 1915), (1080, 1915)], fill=COLOR_GOLD, width=10)
    
    # Draw title
    font_size = 56 if len(title_text) > 24 else 72
    title_font = FONTS["title"](font_size)
    try:
        w = title_font.getlength(title_text)
    except AttributeError:
        w = title_font.getbbox(title_text)[2]
    # Draw shadow first
    draw.text(((1080 - w) // 2 + 3, 160 + 3), title_text, fill=(0, 0, 0, 220), font=title_font)
    draw.text(((1080 - w) // 2, 160), title_text, fill=COLOR_GOLD, font=title_font)
        
    return img, draw

def add_motif(img, motif_name, y_offset=460):
    glow_size = 600
    glow_img = Image.new("RGBA", (glow_size, glow_size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_img)
    glow_draw.ellipse([80, 80, glow_size - 80, glow_size - 80], fill=(212, 175, 55, 20))
    glow_img = glow_img.filter(ImageFilter.GaussianBlur(50))
    
    temp_glow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    temp_glow.paste(glow_img, ((1080 - glow_size) // 2, y_offset + 50))
    img = Image.alpha_composite(img, temp_glow)
    
    shadow_w, shadow_h = 450, 60
    shadow_img = Image.new("RGBA", (shadow_w, shadow_h), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow_img)
    shadow_draw.ellipse([10, 5, shadow_w - 10, shadow_h - 5], fill=(0, 0, 0, 160))
    shadow_img = shadow_img.filter(ImageFilter.GaussianBlur(15))
    
    temp_shadow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    temp_shadow.paste(shadow_img, ((1080 - shadow_w) // 2, y_offset + 570))
    img = Image.alpha_composite(img, temp_shadow)

    motif_path = os.path.join(IMAGES_DIR, f"3d_{motif_name}.png")
    if os.path.exists(motif_path):
        motif = Image.open(motif_path)
        motif_transparent = remove_black_background(motif, threshold=15)
        motif_resized = motif_transparent.resize((600, 600), Image.Resampling.LANCZOS)
        
        temp_motif = Image.new("RGBA", img.size, (0, 0, 0, 0))
        temp_motif.paste(motif_resized, ((1080 - 600) // 2, y_offset))
        img = Image.alpha_composite(img, temp_motif)
    return img

def add_body_text(draw, text_lines, y_start=1200):
    body_font = FONTS["body"](42)
    y = y_start
    for line in text_lines:
        try:
            w = body_font.getlength(line)
        except AttributeError:
            w = body_font.getbbox(line)[2]
        draw.text(((1080 - w) // 2 + 2, y + 2), line, fill=(0, 0, 0, 220), font=body_font)
        draw.text(((1080 - w) // 2, y), line, fill=COLOR_TEXT, font=body_font)
        y += 75

def draw_vertical_card(draw, x_start, y_start, width, height, title, lines, badge_text, badge_color):
    draw.rounded_rectangle([x_start, y_start, x_start + width, y_start + height], radius=24, fill=COLOR_CARD_BG)
    draw.rounded_rectangle([x_start, y_start, x_start + width, y_start + height], radius=24, outline=(212, 175, 55, 76), width=2)
    
    title_font = FONTS["bold"](42)
    try:
        w = title_font.getlength(title)
    except AttributeError:
        w = title_font.getbbox(title)[2]
    draw.text((x_start + (width - w) // 2 + 2, y_start + 32), title, fill=(0, 0, 0, 220), font=title_font)
    draw.text((x_start + (width - w) // 2, y_start + 30), title, fill=COLOR_GOLD, font=title_font)
    
    draw.line([(x_start + 30, y_start + 90), (x_start + width - 30, y_start + 90)], fill=(212, 175, 55, 40), width=2)
    
    row_font = FONTS["body"](28)
    y = y_start + 120
    for line in lines:
        try:
            w = row_font.getlength(line)
        except AttributeError:
            w = row_font.getbbox(line)[2]
        draw.text((x_start + (width - w) // 2 + 1, y + 1), line, fill=(0, 0, 0, 180), font=row_font)
        draw.text((x_start + (width - w) // 2, y), line, fill=COLOR_TEXT, font=row_font)
        y += 50
        
    badge_w, badge_h = 320, 60
    badge_x = x_start + (width - badge_w) // 2
    badge_y = y_start + height - 85
    draw.rounded_rectangle([badge_x, badge_y, badge_x + badge_w, badge_y + badge_h], radius=12, fill=badge_color)
    
    badge_font = FONTS["bold"](28)
    try:
        w = badge_font.getlength(badge_text)
    except AttributeError:
        w = badge_font.getbbox(badge_text)[2]
    draw.text((badge_x + (badge_w - w) // 2, badge_y + 15), badge_text, fill=(255, 255, 255, 255), font=badge_font)

# Scene Generative Methods
def make_scene1():
    # Hook Slide
    img, draw = create_reel_base("THE CATALOG TRAP")
    img = add_motif(img, "chest", y_offset=460)
    
    body_text = [
        "DO NOT REDEEM POINTS FOR VOUCHERS ❌",
        "If you buy toaster ovens or electronics",
        "with reward points, you're losing lakhs."
    ]
    draw = ImageDraw.Draw(img)
    add_body_text(draw, body_text, y_start=1200)
    
    os.makedirs(REEL_DIR, exist_ok=True)
    img.convert("RGB").save(os.path.join(REEL_DIR, "scene1_hook.png"))
    print("Generated Reel Scene 1")

def make_scene2():
    # Problem Slide
    img, draw = create_reel_base("THE 25 PAISE TRAP")
    img = add_motif(img, "scale", y_offset=460)
    
    body_text = [
        "Banks want you to buy catalog vouchers.",
        "They value your points at under 25 paise",
        "to protect their profit margins."
    ]
    draw = ImageDraw.Draw(img)
    add_body_text(draw, body_text, y_start=1200)
    
    img.convert("RGB").save(os.path.join(REEL_DIR, "scene2_problem.png"))
    print("Generated Reel Scene 2")

def make_scene3():
    # Math Comparison Slide
    img, draw = create_reel_base("THE REEL MATH")
    
    # Vertically stacked cards for 9:16 layout
    draw_vertical_card(
        draw, 
        x_start=140, 
        y_start=380, 
        width=800, 
        height=380, 
        title="Redeeming Vouchers", 
        lines=["100,000 Points Catalog Value", "Amazon Vouchers & Goods", "Net Value: ₹25,000"], 
        badge_text="0.25 RpP (Low Yield)", 
        badge_color=COLOR_RED_BG
    )
    
    draw_vertical_card(
        draw, 
        x_start=140, 
        y_start=800, 
        width=800, 
        height=380, 
        title="Transfer to Airline/Hotel Partners", 
        lines=["100,000 Points Transferred", "Business Class Seat to London", "Net Value: ₹2.2 Lakhs+"], 
        badge_text="2.20 RpP (10X Yield)", 
        badge_color=COLOR_GOLD_BG
    )
    
    # Call to action overlay
    save_font = FONTS["bold"](42)
    save_text = "💡 Stop swiping blind"
    try:
        w = save_font.getlength(save_text)
    except AttributeError:
        w = save_font.getbbox(save_text)[2]
    draw.text(((1080 - w) // 2 + 2, 1342), save_text, fill=(0, 0, 0, 220), font=save_font)
    draw.text(((1080 - w) // 2, 1340), save_text, fill=COLOR_GOLD, font=save_font)
    
    img.convert("RGB").save(os.path.join(REEL_DIR, "scene3_math.png"))
    print("Generated Reel Scene 3")

def make_scene4():
    # App Promo Slide
    img, draw = create_reel_base("MAXIMIZE YIELD")
    img = add_motif(img, "phone", y_offset=460)
    
    body_text = [
        "Calculate the highest reward yield route",
        "instantly for all premium Indian cards.",
        "TPA automatically audits your wallet."
    ]
    draw = ImageDraw.Draw(img)
    add_body_text(draw, body_text, y_start=1200)
    
    img.convert("RGB").save(os.path.join(REEL_DIR, "scene4_app.png"))
    print("Generated Reel Scene 4")

def make_scene5():
    # Official Monogram Branding / CTA Slide
    img = create_reel_background()
    
    logo_path = os.path.join(IMAGES_DIR, "updated_brand_logo.png")
    if os.path.exists(logo_path):
        logo = Image.open(logo_path)
        logo_transparent = remove_black_background(logo, threshold=15)
        # Large center logo for outro branding
        logo_resized = logo_transparent.resize((450, 450), Image.Resampling.LANCZOS)
        
        temp_logo = Image.new("RGBA", img.size, (0, 0, 0, 0))
        temp_logo.paste(logo_resized, ((1080 - 450) // 2, 450))
        img = Image.alpha_composite(img, temp_logo)
        
    draw = ImageDraw.Draw(img)
    draw.line([(0, 1915), (1080, 1915)], fill=COLOR_GOLD, width=10)
    
    title_font = FONTS["bold"](68)
    title_text = "THE POINTS ARRAY"
    try:
        w = title_font.getlength(title_text)
    except AttributeError:
        w = title_font.getbbox(title_text)[2]
    draw.text(((1080 - w) // 2 + 3, 980 + 3), title_text, fill=(0, 0, 0, 220), font=title_font)
    draw.text(((1080 - w) // 2, 980), title_text, fill=COLOR_GOLD, font=title_font)
    
    body_text = [
        "Stop Swiping Blind.",
        "Start Traveling in Business.",
        "📲 Download the app now. Link in bio!"
    ]
    
    body_font = FONTS["body"](42)
    y = 1140
    for line in body_text:
        try:
            w = body_font.getlength(line)
        except AttributeError:
            w = body_font.getbbox(line)[2]
        draw.text(((1080 - w) // 2 + 2, y + 2), line, fill=(0, 0, 0, 220), font=body_font)
        draw.text(((1080 - w) // 2, y), line, fill=COLOR_TEXT, font=body_font)
        y += 80
        
    img.convert("RGB").save(os.path.join(REEL_DIR, "scene5_branding.png"))
    print("Generated Reel Scene 5")

def generate_reel_assets():
    print("Generating Reel Vertical Assets (1080x1920 px)...")
    make_scene1()
    make_scene2()
    make_scene3()
    make_scene4()
    make_scene5()
    print("Reel Assets Generation Complete!")

if __name__ == "__main__":
    generate_reel_assets()
