import subprocess
import sys
import os
import asyncio

def install_and_import(package):
    try:
        import edge_tts
    except ImportError:
        print(f"Installing {package}...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])

install_and_import("edge-tts")
import edge_tts

voiceover_text = (
    "Meet Amit. He just earned 1,00,000 credit card points and was about to redeem them for a ₹25,000 Amazon voucher. "
    "Luckily, he stopped. "
    "Banks actively design their catalogs to value your points at under 25 paise each, hoping you will take the voucher to save their profit margins. "
    "But when Amit used The Points Array, the math flipped. "
    "By transferring those same 1,00,000 points to airline partners like Singapore Airlines or Qatar Airways, Amit booked a ₹2,00,000 Business Class flight to London instead. "
    "That is an 8X yield increase. "
    "Stop letting banks profit off your hard-earned points. Amit didn't guess the yield; he checked it instantly using our points tracking engine built for premium Indian cards. "
    "Stop swiping blind. Start traveling in Business class. Search 'The Points Array' on the App Store or tap the link in our bio to download."
)

async def generate():
    print("Generating neural male voiceover.mp3 using edge-tts...")
    communicate = edge_tts.Communicate(voiceover_text, "en-IN-PrabhatNeural")
    output_path = os.path.join("public", "voiceover.mp3")
    await communicate.save(output_path)
    print(f"Voiceover successfully saved to {output_path}!")

if __name__ == "__main__":
    asyncio.run(generate())
