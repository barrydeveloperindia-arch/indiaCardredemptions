import json

with open("scratch/words_timing.json") as f:
    words = json.load(f)

# Define the boundaries of each scene by their last words
scene_boundaries = [
    ("Scene 1 (Hook)", "stopped."),
    ("Scene 2 (Deception)", "margins."),
    ("Scene 3 (Math Flip)", "instead."),
    ("Scene 4 (App Solution)", "cards."),
    ("Scene 5 (CTA)", "download.")
]

last_idx = 0
for scene_name, boundary_word in scene_boundaries:
    found = False
    for i in range(last_idx, len(words)):
        w = words[i]["word"].lower()
        if boundary_word.lower() in w:
            end_time = words[i]["end"]
            end_frame = int(end_time * 30)
            duration_frames = end_frame if last_idx == 0 else end_frame - int(words[last_idx-1]["end"] * 30)
            print(f"{scene_name} ends at '{words[i]['word']}' -> Time: {end_time:.2f}s, Global Frame: {end_frame}, Duration: {duration_frames} frames")
            last_idx = i + 1
            found = True
            break
    if not found:
        print(f"Could not find boundary word '{boundary_word}' for {scene_name}")
