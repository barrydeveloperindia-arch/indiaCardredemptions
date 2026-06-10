import asyncio
import edge_tts

async def main():
    communicate = edge_tts.Communicate("Hello world", "en-IN-PrabhatNeural")
    async for chunk in communicate.stream():
        print("Chunk keys:", chunk.keys())
        if chunk["type"] == "audio":
            print("Audio chunk size:", len(chunk["data"]))
        else:
            print("Chunk content:", {k: v for k, v in chunk.items() if k != "data"})

if __name__ == "__main__":
    asyncio.run(main())
