import urllib.request
import os

VIDEOS = {
    "video1_flight.mp4": "https://videos.pexels.com/video-files/9189414/9189414-hd_1920_1080_30fps.mp4",
    "video2_shopping.mp4": "https://videos.pexels.com/video-files/8465178/8465178-uhd_2560_1440_25fps.mp4",
    "video3_takeoff.mp4": "https://videos.pexels.com/video-files/4396425/4396425-hd_1920_1080_30fps.mp4",
    "video4_resort.mp4": "https://videos.pexels.com/video-files/20057396/20057396-uhd_2560_1440_24fps.mp4",
    "video5_sunset.mp4": "https://videos.pexels.com/video-files/4512518/4512518-hd_1920_1080_30fps.mp4"
}

public_dir = "public"
if not os.path.exists(public_dir):
    os.makedirs(public_dir)

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

for name, url in VIDEOS.items():
    dest = os.path.join(public_dir, name)
    print(f"Downloading {name} from Pexels CDN...")
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response:
            with open(dest, 'wb') as out_file:
                out_file.write(response.read())
        print(f"Successfully saved {name} to {dest}!")
    except Exception as e:
        print(f"Failed to download {name}: {e}")

print("All downloads complete!")

