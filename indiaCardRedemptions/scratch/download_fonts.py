import os
import shutil
import urllib.request
import urllib.error

FONTS_DIR = r"c:\Users\SAM\Documents\Antigravity\indiaCardredemptions\indiaCardRedemptions\assets\fonts"
os.makedirs(FONTS_DIR, exist_ok=True)

# Mappings of filenames to list of potential fallback download URLs
FONT_URLS = {
    "Outfit-Regular.ttf": [
        "https://github.com/google/fonts/blob/main/ofl/outfit/Outfit%5Bwght%5D.ttf?raw=true",
        "https://github.com/google/fonts/blob/master/ofl/outfit/Outfit%5Bwght%5D.ttf?raw=true"
    ],
    "Cinzel-Regular.ttf": [
        "https://github.com/google/fonts/blob/main/ofl/cinzel/Cinzel%5Bwght%5D.ttf?raw=true",
        "https://github.com/google/fonts/blob/master/ofl/cinzel/Cinzel%5Bwght%5D.ttf?raw=true"
    ]
}

def download_all():
    print("Downloading luxury fonts using exact main/master branch URLs...")
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    
    for filename, urls in FONT_URLS.items():
        filepath = os.path.join(FONTS_DIR, filename)
        
        # Skip download if file already exists (like Outfit which we already successfully got)
        if os.path.exists(filepath):
            print(f"{filename} already exists, skipping.")
            continue
            
        success = False
        for url in urls:
            print(f"Trying to download {filename} from {url}...")
            try:
                req = urllib.request.Request(url, headers=headers)
                with urllib.request.urlopen(req) as response:
                    with open(filepath, "wb") as f:
                        f.write(response.read())
                print(f"Successfully saved {filename} to {filepath}")
                success = True
                break
            except urllib.error.HTTPError as e:
                print(f"HTTP Error {e.code} for URL: {url}")
            except Exception as e:
                print(f"Error for URL {url}: {e}")
                
        if not success:
            print(f"[FAIL] Failed to download {filename} from all fallback URLs.")
            
    # Copy variable fonts to bold weights to resolve references
    outfit_reg = os.path.join(FONTS_DIR, "Outfit-Regular.ttf")
    outfit_bold = os.path.join(FONTS_DIR, "Outfit-Bold.ttf")
    if os.path.exists(outfit_reg) and not os.path.exists(outfit_bold):
        shutil.copyfile(outfit_reg, outfit_bold)
        print("Copied Outfit-Regular (variable font) to Outfit-Bold.ttf")

    cinzel_reg = os.path.join(FONTS_DIR, "Cinzel-Regular.ttf")
    cinzel_bold = os.path.join(FONTS_DIR, "Cinzel-Bold.ttf")
    if os.path.exists(cinzel_reg) and not os.path.exists(cinzel_bold):
        shutil.copyfile(cinzel_reg, cinzel_bold)
        print("Copied Cinzel-Regular (variable font) to Cinzel-Bold.ttf")

if __name__ == "__main__":
    download_all()
