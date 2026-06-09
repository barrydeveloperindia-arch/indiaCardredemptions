import subprocess
import sys
import os

def install_and_import(package):
    try:
        import gtts
    except ImportError:
        print(f"Installing {package}...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        import gtts

install_and_import("gtts")
from gtts import gTTS

voiceover_text = (
    "If you are redeeming your credit card points for Amazon vouchers or toaster ovens, you are falling into a massive trap. "
    "Banks actively design their catalogs to value your points at under 25 paise each. They want you to buy a ten-thousand rupee speaker for 40,000 points because it saves their profit margins. "
    "But when you transfer those same points to airline and hotel partners, the math flips. Those 100,000 points that bought you a 25,000 rupee speaker can now book a two-lakh-rupee Business Class flight to London. That is a 10X yield increase. "
    "Stop letting your points die in bank catalogs. We built the ultimate points tracking engine for premium Indian cards to check your yield instantly. "
    "Stop swiping blind. Start traveling in Business. Search 'The Points Array' on the App Store or tap the link in our bio to download."
)

print("Generating voiceover.mp3...")
tts = gTTS(text=voiceover_text, lang='en', tld='co.in') # Using Indian English accent for natural flow
output_path = os.path.join("public", "voiceover.mp3")
tts.save(output_path)
print(f"Voiceover successfully saved to {output_path}!")
