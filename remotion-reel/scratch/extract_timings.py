import asyncio
import json
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

async def main():
    communicate = edge_tts.Communicate(voiceover_text, "en-IN-PrabhatNeural", rate="+50%")
    
    words_data = []
    
    # Open the file for writing binary audio chunks
    with open("public/voiceover.mp3", "wb") as audio_file:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_file.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                offset_seconds = chunk["offset"] / 10000000.0
                duration_seconds = chunk["duration"] / 10000000.0
                word = chunk["text"]
                words_data.append({
                    "word": word,
                    "start": offset_seconds,
                    "end": offset_seconds + duration_seconds
                })
            
    print("Saved public/voiceover.mp3")
    
    # Save words data to JSON
    with open("scratch/words_timing.json", "w") as f:
        json.dump(words_data, f, indent=2)
    print("Saved scratch/words_timing.json")

if __name__ == "__main__":
    asyncio.run(main())
