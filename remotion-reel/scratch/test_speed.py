import asyncio
import edge_tts
import os
import subprocess

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

async def test_speed(rate):
    communicate = edge_tts.Communicate(voiceover_text, "en-IN-PrabhatNeural", rate=rate)
    temp_path = f"public/voiceover_{rate.replace('+', '').replace('%', '')}.mp3"
    await communicate.save(temp_path)
    # Get duration using ffprobe
    cmd = f'ffprobe -i {temp_path} -show_entries format=duration -v quiet -of csv="p=0"'
    res = subprocess.check_output(cmd, shell=True).decode().strip()
    print(f"Rate {rate}: {res} seconds")
    # Clean up
    if os.path.exists(temp_path):
        os.remove(temp_path)

async def main():
    for rate in ["+20%", "+30%", "+40%", "+50%", "+60%"]:
        await test_speed(rate)

if __name__ == "__main__":
    asyncio.run(main())
