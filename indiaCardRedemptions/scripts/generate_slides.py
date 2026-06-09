import os
import shutil
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# Base Directory
BASE_DIR = r"c:\Users\SAM\Documents\Antigravity\indiaCardredemptions\indiaCardRedemptions"
ASSETS_DIR = os.path.join(BASE_DIR, "assets")
IMAGES_DIR = os.path.join(ASSETS_DIR, "images")
SOCIAL_DIR = os.path.join(ASSETS_DIR, "social_media")

# Design Tokens (V2 Aesthetics)
COLOR_BG = (9, 10, 15, 255)         # Obsidian Black
COLOR_GOLD = (212, 175, 55, 255)     # Metallic Gold
COLOR_TEXT = (245, 242, 235, 255)    # Champagne Light
COLOR_RED_BG = (220, 38, 38, 255)    # Deep Red Badge
COLOR_GOLD_BG = (191, 149, 63, 255)  # Darker Gold Badge
COLOR_CARD_BG = (255, 255, 255, 255) # Pure White Card

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
            "bold": lambda size: ImageFont.truetype(font_file, size) # Segoe UI Bold would be nice but default works
        }
    else:
        # Fallback to default PIL font
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

def create_plain_luxury_background():
    # Base solid dark obsidian background
    base_color = (9, 10, 15, 255)  # `#090A0F`
    img = Image.new("RGBA", (1080, 1350), base_color)
    
    # Add a soft, elegant central radial gold glow (no distracting lines)
    glow_size = 900
    glow_img = Image.new("RGBA", (glow_size, glow_size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_img)
    # Very soft, translucent gold ellipse
    glow_draw.ellipse([100, 100, glow_size - 100, glow_size - 100], fill=(212, 175, 55, 12))
    # Blur it heavily to create a seamless radial vignette
    glow_img = glow_img.filter(ImageFilter.GaussianBlur(120))
    
    # Paste in the center of the canvas using alpha composite to preserve opacity
    temp_glow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    temp_glow.paste(glow_img, ((1080 - glow_size) // 2, (1350 - glow_size) // 2))
    img = Image.alpha_composite(img, temp_glow)
    return img

def create_slide_base(title_text):
    img = create_plain_luxury_background()
    
    # Overlay TPA logo top right (using our actual brand logo updated_brand_logo.png)
    logo_path = os.path.join(IMAGES_DIR, "updated_brand_logo.png")
    if os.path.exists(logo_path):
        logo = Image.open(logo_path)
        logo_transparent = remove_black_background(logo, threshold=15)
        logo_resized = logo_transparent.resize((120, 120), Image.Resampling.LANCZOS)
        
        # Paste via alpha composite to keep slide fully opaque
        temp_logo = Image.new("RGBA", img.size, (0, 0, 0, 0))
        temp_logo.paste(logo_resized, (920, 30))
        img = Image.alpha_composite(img, temp_logo)
        
    draw = ImageDraw.Draw(img)
    
    # Draw gold border line at the bottom
    draw.line([(0, 1345), (1080, 1345)], fill=COLOR_GOLD, width=10)
    
    # Draw title (adjust font size for long titles to prevent logo overlaps)
    font_size = 46 if len(title_text) > 24 else 64
    title_font = FONTS["title"](font_size)
    try:
        w = title_font.getlength(title_text)
    except AttributeError:
        w = title_font.getbbox(title_text)[2]
    # Draw shadow first
    draw.text(((1080 - w) // 2 + 3, 100 + 3), title_text, fill=(0, 0, 0, 220), font=title_font)
    draw.text(((1080 - w) // 2, 100), title_text, fill=COLOR_GOLD, font=title_font)
        
    return img, draw

def remove_black_background(image, threshold=15, fade_margin=120):
    rgba = image.convert("RGBA")
    pix = rgba.load()
    width, height = rgba.size
    for y in range(height):
        for x in range(width):
            r, g, b, a = pix[x, y]
            v = max(r, g, b)
            
            # Base alpha calculation
            if v < threshold:
                alpha = 0
            elif v > 60:
                alpha = a if a != 0 else 255
            else:
                # Smooth transition window from threshold to 60
                t = (v - threshold) / (60.0 - threshold)
                alpha = int(t * 255)
                
            # Apply smooth boundary fade to prevent hard cropped edges
            dx = min(x, width - 1 - x)
            dy = min(y, height - 1 - y)
            d = min(dx, dy)
            if d < fade_margin:
                # Quadratic fade for smoother transition near the edges
                fade_factor = (d / float(fade_margin)) ** 2
                alpha = int(alpha * fade_factor)
                
            pix[x, y] = (r, g, b, alpha)
    return rgba

def add_motif(img, motif_name, y_offset=260):
    # 1. Golden Back-Glow behind the motif to integrate it with the gold theme
    glow_size = 500
    glow_img = Image.new("RGBA", (glow_size, glow_size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_img)
    glow_draw.ellipse([50, 50, glow_size - 50, glow_size - 50], fill=(212, 175, 55, 25))
    glow_img = glow_img.filter(ImageFilter.GaussianBlur(40))
    
    temp_glow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    temp_glow.paste(glow_img, ((1080 - glow_size) // 2, y_offset + 50))
    img = Image.alpha_composite(img, temp_glow)
    
    # 2. Contact Shadow under the motif
    shadow_w, shadow_h = 420, 50
    shadow_img = Image.new("RGBA", (shadow_w, shadow_h), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow_img)
    shadow_draw.ellipse([10, 5, shadow_w - 10, shadow_h - 5], fill=(0, 0, 0, 160))
    shadow_img = shadow_img.filter(ImageFilter.GaussianBlur(15))
    
    temp_shadow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    temp_shadow.paste(shadow_img, ((1080 - shadow_w) // 2, y_offset + 530))
    img = Image.alpha_composite(img, temp_shadow)

    # 3. Paste the actual 3D Motif on top
    motif_path = os.path.join(IMAGES_DIR, f"3d_{motif_name}.png")
    if os.path.exists(motif_path):
        motif = Image.open(motif_path)
        # Dynamic chroma keying: remove black background box for seamless blending
        motif_transparent = remove_black_background(motif, threshold=15)
        motif_resized = motif_transparent.resize((600, 600), Image.Resampling.LANCZOS)
        
        temp_motif = Image.new("RGBA", img.size, (0, 0, 0, 0))
        temp_motif.paste(motif_resized, ((1080 - 600) // 2, y_offset))
        img = Image.alpha_composite(img, temp_motif)
    else:
        print(f"Warning: Motif {motif_name} not found at {motif_path}")
        
    return img

def add_body_text(draw, text_lines, y_start=920):
    body_font = FONTS["body"](38)
    y = y_start
    for line in text_lines:
        try:
            w = body_font.getlength(line)
        except AttributeError:
            w = body_font.getbbox(line)[2]
        # Draw shadow first
        draw.text(((1080 - w) // 2 + 2, y + 2), line, fill=(0, 0, 0, 220), font=body_font)
        draw.text(((1080 - w) // 2, y), line, fill=COLOR_TEXT, font=body_font)
        y += 60

def draw_card(draw, x_start, y_start, width, height, title, lines, badge_text, badge_color):
    # Rounded card background (Frosted glassmorphic dark charcoal)
    draw.rounded_rectangle([x_start, y_start, x_start + width, y_start + height], radius=24, fill=(18, 20, 28, 200))
    
    # Card outer border outline (Thin gold-translucent)
    draw.rounded_rectangle([x_start, y_start, x_start + width, y_start + height], radius=24, outline=(212, 175, 55, 76), width=2)
    
    # Card Title
    title_font = FONTS["bold"](42)
    try:
        w = title_font.getlength(title)
    except AttributeError:
        w = title_font.getbbox(title)[2]
    # Shadow
    draw.text((x_start + (width - w) // 2 + 2, y_start + 42), title, fill=(0, 0, 0, 220), font=title_font)
    draw.text((x_start + (width - w) // 2, y_start + 40), title, fill=COLOR_GOLD, font=title_font)
    
    # Divider line (Thin translucent separator)
    draw.line([(x_start + 30, y_start + 110), (x_start + width - 30, y_start + 110)], fill=(212, 175, 55, 40), width=2)
    
    # Body rows (with wrapping support to prevent overflow)
    row_font = FONTS["body"](26)
    wrapped_lines = []
    for line in lines:
        wrapped_lines.extend(wrap_text(line, row_font, width - 60))
        
    y = y_start + 140
    line_spacing = 60 if len(wrapped_lines) <= 6 else 45
    for line in wrapped_lines[:7]:
        try:
            w = row_font.getlength(line)
        except AttributeError:
            w = row_font.getbbox(line)[2]
        # Shadow
        draw.text((x_start + (width - w) // 2 + 1, y + 1), line, fill=(0, 0, 0, 180), font=row_font)
        draw.text((x_start + (width - w) // 2, y), line, fill=COLOR_TEXT, font=row_font)
        y += line_spacing
        
    # Badge (Net profit)
    badge_w, badge_h = 370, 70
    badge_x = x_start + (width - badge_w) // 2
    badge_y = y_start + height - 110
    draw.rounded_rectangle([badge_x, badge_y, badge_x + badge_w, badge_y + badge_h], radius=12, fill=badge_color)
    
    badge_font = FONTS["bold"](30)
    try:
        w = badge_font.getlength(badge_text)
    except AttributeError:
        w = badge_font.getbbox(badge_text)[2]
    draw.text((badge_x + (badge_w - w) // 2, badge_y + 18), badge_text, fill=(255, 255, 255, 255), font=badge_font)

def generate_math_slide(title_text, card1_spec, card2_spec):
    img, draw = create_slide_base(title_text)
    
    # Draw two cards side by side
    draw_card(draw, 80, 260, 430, 680, card1_spec["title"], card1_spec["lines"], card1_spec["badge"], COLOR_RED_BG)
    draw_card(draw, 570, 260, 430, 680, card2_spec["title"], card2_spec["lines"], card2_spec["badge"], COLOR_GOLD_BG)
    
    # Save trigger at bottom
    save_font = FONTS["bold"](40)
    save_text = "💾 Save this comparison table"
    try:
        w = save_font.getlength(save_text)
    except AttributeError:
        w = save_font.getbbox(save_text)[2]
    # Draw shadow first
    draw.text(((1080 - w) // 2 + 2, 1052), save_text, fill=(0, 0, 0, 220), font=save_font)
    draw.text(((1080 - w) // 2, 1050), save_text, fill=COLOR_GOLD, font=save_font)
    
    return img

def make_slide(folder_name, slide_num, title, motif, body_text):
    img, draw = create_slide_base(title)
    img = add_motif(img, motif)
    draw = ImageDraw.Draw(img)
    wrapped = []
    body_font = FONTS["body"](38)
    for line in body_text:
        wrapped.extend(wrap_text(line, body_font, 900))
    add_body_text(draw, wrapped)
    
    dest_dir = os.path.join(SOCIAL_DIR, folder_name)
    os.makedirs(dest_dir, exist_ok=True)
    # Save as RGB to discard the alpha channel and ensure 100% opacity in final PNGs
    img.convert("RGB").save(os.path.join(dest_dir, f"slide{slide_num}.png"))
    print(f"Generated Slide {slide_num} for {folder_name}")

def make_math(folder_name, title, card1, card2):
    img = generate_math_slide(title, card1, card2)
    dest_dir = os.path.join(SOCIAL_DIR, folder_name)
    os.makedirs(dest_dir, exist_ok=True)
    # Save as RGB to discard the alpha channel and ensure 100% opacity in final PNGs
    img.convert("RGB").save(os.path.join(dest_dir, "slide4_math.png"))
    print(f"Generated Slide 4 (Math) for {folder_name}")

def copy_cta(folder_name):
    src_cta = os.path.join(IMAGES_DIR, "carousel_slide_cta.png")
    dest_cta = os.path.join(SOCIAL_DIR, folder_name, "slide5_cta.png")
    if os.path.exists(src_cta):
        shutil.copyfile(src_cta, dest_cta)
        print(f"Copied CTA slide to {folder_name}")
    else:
        print(f"Error: CTA template not found at {src_cta}")

# Post Configurations
POSTS = {
    # ==========================
    # Week 1 - Launch Post
    # ==========================
    "2026-06-09_week1_post1_catalog_trap": {
        "motif": "scale",
        "s2": {
            "title": "The Catalog Point Trap",
            "body": ["Banks push you to redeem points on electronics, home appliances, or catalog vouchers.", "Why? They value your points at under ₹0.25 per point to save their margins."]
        },
        "s3": {
            "title": "Unlock Flight Arbitrage",
            "body": ["Transfer points to international airline partners (like British Airways, Aeroplan, or Accor hotels).", "A Delhi to London Business Class seat values your points at ₹3.14 per point."]
        },
        "s4_math": {
            "title": "Where to Redeem?",
            "c1": {
                "title": "Vouchers & Catalogs",
                "lines": ["Amazon / Shopping vouchers", "Electronics catalog items", "Value: ₹0.20 - ₹0.25 per pt"],
                "badge": "Low Yield Trap"
            },
            "c2": {
                "title": "Airline & Hotel Partners",
                "lines": ["Marriott Bonvoy stays", "Star Alliance business seats", "Value: ₹1.00 - ₹3.50+ per pt"],
                "badge": "Elite Yield Arbitrage"
            }
        }
    },
    # ==========================
    # Week 4
    # ==========================
    "2026-06-22_week4_post7_app_launch": {
        "motif": "phone",
        "s2": {
            "title": "Welcome to TPA App",
            "body": ["We built the ultimate points tracking engine for Indian credit cards.", "Check your card milestones, compute arbitrage levels, and manage all your points in one sleek dashboard."]
        },
        "s3": {
            "title": "Real-time Matrix Updates",
            "body": ["Our engines monitor devaluations instantly.", "Link your BA and Qatar accounts or calculate Star Alliance shortcuts directly in our visual route screens."]
        },
        "s4_math": {
            "title": "Calculate Your Return",
            "c1": {
                "title": "Manual Checking",
                "lines": ["Hour of web searching", "Risk of bad transfer ratio", "Catalog vouchers"],
                "badge": "Low Return / Waste"
            },
            "c2": {
                "title": "TPA Tracker",
                "lines": ["Instant optimal pathways", "Automated due alerts", "Elite flight bookings"],
                "badge": "Maximize INR Yield"
            }
        }
    },
    "2026-06-26_week4_post8_yield_comparison": {
        "motif": "scale",
        "s2": {
            "title": "The Catalog Point Trap",
            "body": ["Banks push you to redeem points on electronics, home appliances, or catalog vouchers.", "Why? They value your points at under ₹0.25 per point to save their margins."]
        },
        "s3": {
            "title": "Unlock Flight Arbitrage",
            "body": ["Transfer points to international airline partners (like British Airways, Aeroplan, or Accor hotels).", "A Delhi to London Business Class seat values your points at ₹3.14 per point."]
        },
        "s4_math": {
            "title": "Where to Redeem?",
            "c1": {
                "title": "Vouchers & Catalogs",
                "lines": ["Amazon / Shopping vouchers", "Electronics catalog items", "Value: ₹0.20 - ₹0.25 per pt"],
                "badge": "Low Yield Trap"
            },
            "c2": {
                "title": "Airline & Hotel Partners",
                "lines": ["Marriott Bonvoy stays", "Star Alliance business seats", "Value: ₹1.00 - ₹3.50+ per pt"],
                "badge": "Elite Yield Arbitrage"
            }
        }
    },
    # ==========================
    # Week 5
    # ==========================
    "2026-06-29_week5_post9_pos_loop": {
        "motif": "bridge",
        "s2": {
            "title": "B2B Gateways Blocked",
            "body": ["Banks devalued credit cards on B2B gateways (Pice, BharatNXT).", "Making vendor transfers direct card-to-account now yields 0 points across major wallets."]
        },
        "s3": {
            "title": "The B2C Merchant Workaround",
            "body": ["Instead, route spends through physical B2C merchant POS terminals (Travel MCC).", "A physical terminal retains your card travel multipliers (like Axis Atlas 5X)."]
        },
        "s4_math": {
            "title": "Swipe Option Comparison",
            "c1": {
                "title": "B2B Gateway",
                "lines": ["1.9% Gateway Fee", "0X Multiplier (Blocked)", "₹0 Miles Earned"],
                "badge": "-1.9% Net Loss"
            },
            "c2": {
                "title": "B2C POS Terminal",
                "lines": ["2.36% Swiping Fee", "5X Travel Multiplier", "10% Reward Yield (Miles)"],
                "badge": "+7.64% Net Profit"
            }
        }
    },
    "2026-07-03_week5_post10_merchant_mcc": {
        "motif": "shield",
        "s2": {
            "title": "What is an MCC?",
            "body": ["Every merchant terminal has an MCC (Merchant Category Code).", "Banks read this code to apply multipliers. If a hotel is mis-coded, you get 0 points."]
        },
        "s3": {
            "title": "Know Your Spends",
            "body": ["MCC 3501-3999 triggers Lodging / Hotels (5X Atlas).", "MCC 4511 triggers Airlines (5X Atlas).", "Make sure your invoices are settled on correctly coded terminals."]
        },
        "s4_math": {
            "title": "Merchant Code Matrix",
            "c1": {
                "title": "Government & Utilities",
                "lines": ["MCC 9311 (Taxes)", "MCC 4900 (Utilities)", "0% Multiplier (Blocked)"],
                "badge": "No Rewards Yield"
            },
            "c2": {
                "title": "Airline & Lodging",
                "lines": ["MCC 4511 (Airlines)", "MCC 3501 (Direct Hotels)", "5X Multiplier (10-16.6% return)"],
                "badge": "Elite Multiplier"
            }
        }
    },
    # ==========================
    # Week 6
    # ==========================
    "2026-07-06_week6_post11_infinite_float": {
        "motif": "hourglass",
        "s2": {
            "title": "The 0% ATM Cash Lift",
            "body": ["Withdraw ₹1 Lakh using your IDFC FIRST Wealth card at an ATM.", "Cost: Flat ₹295 convenience fee. Interest: 0% up to 48 days. Settle loan EMIs."]
        },
        "s3": {
            "title": "Roll Over with Amex",
            "body": ["On day 45, swipe ₹1,02,040 on your Amex Plat Charge via your POS.", "POS settles cash to bank, pay the IDFC bill. Float rotated at a profit!"]
        },
        "s4_math": {
            "title": "Float Loop Math",
            "c1": {
                "title": "15% Personal Loan",
                "lines": ["Standard monthly interest fee", "Saps capital liquidity", "Total cost: ₹15,000+ / year"],
                "badge": "Monthly Capital Drain"
            },
            "c2": {
                "title": "0% Card Float",
                "lines": ["Rotate cash via ATM + Amex", "Earn 2,551 Amex points", "POS fee: ₹2,040 | Points value: ₹2,551"],
                "badge": "+₹511 Net Loop Profit"
            }
        }
    },
    "2026-07-10_week6_post12_whale_bounce": {
        "motif": "bridge",
        "s2": {
            "title": "Overdraft is Too Costly",
            "body": ["Maintaining a corporate ₹10 Lakh overdraft line costs you ₹12,000+ monthly in bank interest.", "Stop paying banks for capital float—use card loops instead."]
        },
        "s3": {
            "title": "The Whale Swap Cycle",
            "body": ["Swipe ₹10L on Amex Plat (Cost: ₹20k fee, earns 25k Marriott points).", "Settle due next month by swiping ₹5L Magnus and ₹5L HSBC Premier to pay off Amex."]
        },
        "s4_math": {
            "title": "Capital Float Yields",
            "c1": {
                "title": "Bank Overdraft",
                "lines": ["₹10L overdraft credit line", "High interest rate", "Yearly Cost: -₹1,40,000"],
                "badge": "Bank Interest Loss"
            },
            "c2": {
                "title": "The Whale Bounce",
                "lines": ["Swipe cycles via POS/gateways", "Total fees paid: ₹39,000", "Rewards: 96,200 miles (Value: ₹96k+)"],
                "badge": "+₹57,200 Net Reward Value"
            }
        }
    },
    # ==========================
    # Week 7
    # ==========================
    "2026-07-13_week7_post13_gst_challan": {
        "motif": "chest",
        "s2": {
            "title": "Taxes Yield 0 Points",
            "body": ["Paying income tax, GST, or traffic speed challans directly on portals earns 0 points.", "Banks specifically blacklist government MCC codes to block rewards."]
        },
        "s3": {
            "title": "The Amazon Wallet Loop",
            "body": ["Buy Amazon Pay Gift Cards on GyFTR using your Magnus/Amex (earns 12-14% rewards).", "Load them to Amazon Wallet and settle tax bills with 0% extra fees on portal."]
        },
        "s4_math": {
            "title": "Tax Loop Yields",
            "c1": {
                "title": "Direct Portal Payment",
                "lines": ["Net banking / card swipe", "MCC 9311 (Government)", "Yield: 0% Return"],
                "badge": "Zero Point Return"
            },
            "c2": {
                "title": "Amazon Wallet Loop",
                "lines": ["Buy GyFTR gift cards", "Load wallet, pay utility/challan", "Yield: 12.5% return"],
                "badge": "+₹625 Back on ₹5k bill"
            }
        }
    },
    "2026-07-17_week7_post14_tax_compliance": {
        "motif": "shield",
        "s2": {
            "title": "GST Audit Warning",
            "body": ["Routing personal spends as business expenses to claim input tax credits is illegal.", "Unmatched credit card bills vs company sales trigger automated GST warnings."]
        },
        "s3": {
            "title": "Substitute Compliance",
            "body": ["Only swipe cards for business transactions backed by valid GST invoices.", "If substituting retail cash: deposit cash, issue invoice to customer, swipe card."]
        },
        "s4_math": {
            "title": "Compliance Audit Trail",
            "c1": {
                "title": "Unmatched Swipes",
                "lines": ["No invoice matching", "Personal card on company books", "Risk: Audit flags & penalties"],
                "badge": "High Risk Loop"
            },
            "c2": {
                "title": "Substitution Protocol",
                "lines": ["GST invoice matching", "Legal cash substitution", "Clean bookkeeping audit trail"],
                "badge": "100% Tax Compliant"
            }
        }
    },
    # ==========================
    # Week 8
    # ==========================
    "2026-07-20_week8_post15_team_delegation": {
        "motif": "staircase",
        "s2": {
            "title": "Fragmented Team Spending",
            "body": ["Having employees pay vendor bills using different personal cards splits your reward points.", "Result: Multiple cards with low balances that miss major spend milestones."]
        },
        "s3": {
            "title": "Consolidate Spending",
            "body": ["Issue free secondary/add-on cards to key employees (e.g. marketing, procurement).", "Set limits on each add-on card. All points accumulate into primary corporate account."]
        },
        "s4_math": {
            "title": "Point Consolidation",
            "c1": {
                "title": "Fragmented Spends",
                "lines": ["5 employees, 5 separate cards", "Base points only", "No milestone bonuses hit"],
                "badge": "Standard Low Yield"
            },
            "c2": {
                "title": "Consolidated Spends",
                "lines": ["Add-on cards to 5 team members", "Hit ₹15L Axis Atlas milestone", "Unlocks 10k bonus EDGE miles"],
                "badge": "300% Reward Yield Multiplier"
            }
        }
    },
    "2026-07-24_week8_post16_taj_milestones": {
        "motif": "staircase",
        "s2": {
            "title": "Timing Your Big Invoices",
            "body": ["Swiping card balances randomly results in missing critical milestone deadlines.", "Axis Atlas and Magnus Burgundy reward you heavily at specific spend tiers."]
        },
        "s3": {
            "title": "The Milestone Stairs",
            "body": ["**Axis Magnus**: Unlocks 25k bonus EDGE points at ₹1.5L monthly spends.", "**Axis Atlas**: Unlocks 10k EDGE miles (worth ₹10,000 Taj Voucher) at ₹3L, ₹7.5L, and ₹15L annual spends."]
        },
        "s4_math": {
            "title": "Spend Tier Yield",
            "c1": {
                "title": "Unplanned Swiping",
                "lines": ["₹2.9L spent on Axis Atlas", "Fails to trigger ₹3L milestone", "Yield: 5.8k base miles only"],
                "badge": "Missed Milestone Loss"
            },
            "c2": {
                "title": "Strategic Spend Timing",
                "lines": ["₹3.0L spent on Axis Atlas", "Triggers T1 milestone bonus", "Yield: 6k base + 10k bonus miles"],
                "badge": "Unlocks ₹10k Taj Voucher"
            }
        }
    },
    # ==========================
    # Week 9
    # ==========================
    "2026-07-27_week9_post17_marriott_maldives": {
        "motif": "chest",
        "s2": {
            "title": "The Overwater Villa Cost",
            "body": ["A standard overwater villa in the Maldives costs ₹1.5 Lakhs+ ($1,800) per night.", "A 5-night stay exceeds ₹9 Lakhs when paying cash. Use points instead!"]
        },
        "s3": {
            "title": "Stay 5, Pay for 4 Sweet Spot",
            "body": ["Marriott Bonvoy offers a flat 'Stay 5, Pay for 4' promotion on points bookings.", "If a room is 60k points, a 5-night stay is just 240k points. Transfer from Amex/Axis."]
        },
        "s4_math": {
            "title": "Maldives Stays Value",
            "c1": {
                "title": "Cash Booking",
                "lines": ["5 nights overwater villa", "Premium local resort taxes", "Total out-of-pocket: ₹7,50,000"],
                "badge": "High Cash Expense"
            },
            "c2": {
                "title": "Marriott Points Booking",
                "lines": ["240,000 Bonvoy points", "Taxes & surcharges: ₹18,000", "Effective value: ₹3.05 per pt"],
                "badge": "97.6% Cash Discount (ELITE)"
            }
        }
    },
    "2026-07-31_week9_post18_accor_switzerland": {
        "motif": "shield",
        "s2": {
            "title": "The Swiss Room Rate Shock",
            "body": ["Switzerland has the highest hotel cash rates in Europe.", "A basic double room in Zurich or Geneva starts at €300 (₹27,000) per night. Accor points shield you."]
        },
        "s3": {
            "title": "The Fixed-Value Accor Shield",
            "body": ["Accor points have a fixed cash value: 2,000 points = €40 discount.", "This values each point at €0.02 (₹1.80), immune to peak-season inflation. Transfer from HSBC."]
        },
        "s4_math": {
            "title": "Swiss Hotel Savings",
            "c1": {
                "title": "Cash Reservation",
                "lines": ["Peak season Zurich stay", "Cash room billing rate", "Total cost: €300 / night"],
                "badge": "Expensive Cash Rate"
            },
            "c2": {
                "title": "Accor Points Shield",
                "lines": ["Redeem 72,000 Accor points", "Values as €1,440 (₹1.3L) cash", "Taxes & fees: €0 (Direct pay)"],
                "badge": "Free Luxury Swiss Stay"
            }
        }
    },
    # ==========================
    # Week 10
    # ==========================
    "2026-08-03_week10_post19_t4_closein": {
        "motif": "hourglass",
        "s2": {
            "title": "The Sold Out Award Myth",
            "body": ["Searching for award seats months in advance often shows zero business class spaces.", "But airlines release premium seats right before takeoff (T-4 days close-in)."]
        },
        "s3": {
            "title": "The 72-Hour Sweep",
            "body": ["Airlines release unsold seats to partner programs to avoid empty cabins.", "Search Aeroplan at T-4 for AI seats, and Virgin at T-3 for Amex transfers."]
        },
        "s4_math": {
            "title": "Award Search Timing",
            "c1": {
                "title": "Direct Airline Booking",
                "lines": ["Book direct Air India space", "Costs 90,000 points one-way", "High points cost requirement"],
                "badge": "High Mileage Cost"
            },
            "c2": {
                "title": "Aeroplan Partner Route",
                "lines": ["Book AI Business class at T-4", "Costs 70,000 Aeroplan points", "Taxes & Fees: only ~₹4,500"],
                "badge": "Save 20,000 Points"
            }
        }
    },
    "2026-08-07_week10_post20_economy_upgrades": {
        "motif": "staircase",
        "s2": {
            "title": "Desktop Upgrade Trap",
            "body": ["Asking for cash upgrades at the check-in desk costs ₹80,000+.", "Instead, buy upgradable Economy cash fares and apply your points/Avios."]
        },
        "s3": {
            "title": "Check Your Fare Class",
            "body": ["Upgrades are allowed on specific fare codes (Y, B, H, M). Avoid discount codes (O, G, Q).", "Upgrading an eligible ticket costs as little as 20,000 Avios points."]
        },
        "s4_math": {
            "title": "Upgrade Yields",
            "c1": {
                "title": "Cash Desk Upgrade",
                "lines": ["Upgrade at check-in counter", "Standard desk pricing", "Total cost: ₹80,000+ cash fee"],
                "badge": "High Out-of-pocket Fee"
            },
            "c2": {
                "title": "Points Upgrade Path",
                "lines": ["Upgradable fare (code H)", "Redeem 20,000 Avios points", "Effective saving: ₹1,15,000"],
                "badge": "Elite Upgrade Profit"
            }
        }
    },
    # ==========================
    # Week 11
    # ==========================
    "2026-08-10_week11_post21_forex_adspend": {
        "motif": "scale",
        "s2": {
            "title": "The 3.5% Forex Mark-up Bleed",
            "body": ["Paying for AWS or Google Ads in foreign currencies triggers a 3.5% Forex fee.", "On ₹5 Lakhs monthly ad spend, you lose ₹17,500 in bank fees. Optimize your cards!"]
        },
        "s3": {
            "title": "Net-Positive Spends",
            "body": ["Use HDFC Infinia (1% Forex fee vs 3.3% return = +2.3% profit).", "Use Axis Atlas (3.5% fee vs 3X EDGE miles (6% yield) = +2.5% net profit)."]
        },
        "s4_math": {
            "title": "Forex Markup Yields",
            "c1": {
                "title": "Standard Corporate Card",
                "lines": ["3.5% Forex markup fee", "1% base reward points return", "Net Margin: -2.5% Loss"],
                "badge": "Company Profit Loss"
            },
            "c2": {
                "title": "Axis Atlas Card Swipe",
                "lines": ["3.5% Forex markup fee", "3X EDGE miles (6.0% yield)", "Net Margin: +2.5% Profit"],
                "badge": "Turn Fees to Travel Profit"
            }
        }
    },
    "2026-08-14_week11_post22_infinia_vs_atlas": {
        "motif": "scale",
        "s2": {
            "title": "Direct Travel Bookings",
            "body": ["Axis Atlas: Earns 5X EDGE miles (10% reward yield) directly on airlines/hotels.", "HDFC Infinia: Earns 5X points (16.6% yield) when booked through SmartBuy portal."]
        },
        "s3": {
            "title": "SmartBuy Portal Cap",
            "body": ["Infinia caps portal bonus points at 15,000 points monthly.", "Atlas has no monthly points capping on direct airline spends. Ideal for high spenders."]
        },
        "s4_math": {
            "title": "Atlas vs Infinia",
            "c1": {
                "title": "HDFC Infinia",
                "lines": ["16.6% travel portal yield", "Capped at 15,000 pts / month", "3.3% reward rate on general"],
                "badge": "Best for Portal Bookings"
            },
            "c2": {
                "title": "Axis Atlas",
                "lines": ["10% direct travel yield", "Uncapped bonus points limit", "4% reward rate on general"],
                "badge": "Best for High Direct Spend"
            }
        }
    },
    # ==========================
    # Week 12
    # ==========================
    "2026-08-17_week12_post23_app_features": {
        "motif": "phone",
        "s2": {
            "title": "1. Arbitrage Yield Engine",
            "body": ["Input cash ticket price vs points required.", "The TPA calculator instantly determines the exact Rupee-per-Point (RpP) value to guarantee returns."]
        },
        "s3": {
            "title": "2. Milestone Tracker",
            "body": ["Enter your annual spends on Atlas or Infinia.", "See dynamic progress bars displaying spend milestones left to unlock Taj hotel vouchers."]
        },
        "s4_math": {
            "title": "Manual vs TPA Tracker",
            "c1": {
                "title": "Manual Calculations",
                "lines": ["Time wasted on search portals", "Risk of bad transfer paths", "Missed milestones due dates"],
                "badge": "Time & Points Waste"
            },
            "c2": {
                "title": "The Indian Points Array",
                "lines": ["Instant optimal pathways", "Automated due alerts", "MCC merchant code checkers"],
                "badge": "Elite Card Returns"
            }
        }
    },
    "2026-08-21_week12_post24_concierge_architects": {
        "motif": "shield",
        "s2": {
            "title": "Complexity of Booking",
            "body": ["Finding business class award space across global alliances takes hours of tracking.", "Transferring points to the wrong airline locks them permanently. We do the work."]
        },
        "s3": {
            "title": "Your Points Architect",
            "body": ["We assign a dedicated Points Architect to manage your portfolio.", "We monitor your milestones, check partner seats, and book your flatbeds. You fly free."]
        },
        "s4_math": {
            "title": "Concierge Valuation",
            "c1": {
                "title": "Self Searching",
                "lines": ["Hours refreshing seat sites", "High risk of bad transfer links", "Stress of close-in bookings"],
                "badge": "Frustration & Lost Time"
            },
            "c2": {
                "title": "TPA Concierge Desk",
                "lines": ["Dedicated Routing Architect", "Direct account linking", "Stress-free luxury travel"],
                "badge": "Elite Concierge Access"
            }
        }
    }
}

def generate_all():
    print("Initializing Visual Identity V2 Generation Engine...")
    for folder, config in POSTS.items():
        print(f"\nProcessing: {folder}")
        motif = config["motif"]
        
        # 1. Generate Slide 2
        make_slide(
            folder_name=folder,
            slide_num=2,
            title=config["s2"]["title"],
            motif=motif,
            body_text=config["s2"]["body"]
        )
        
        # 2. Generate Slide 3
        make_slide(
            folder_name=folder,
            slide_num=3,
            title=config["s3"]["title"],
            motif=motif,
            body_text=config["s3"]["body"]
        )
        
        # 3. Generate Slide 4 (Math Comparison)
        make_math(
            folder_name=folder,
            title=config["s4_math"]["title"],
            card1=config["s4_math"]["c1"],
            card2=config["s4_math"]["c2"]
        )
        
        # 4. Copy Slide 5 (CTA Template)
        copy_cta(folder)
        
    print("\nVisual Identity V2 Generation Complete! All 18 slide decks written successfully. Done!")

if __name__ == "__main__":
    generate_all()
