import re
import os
import shutil

# Copy images from artifacts to images/
artifact_dir = "/Users/shai_shilo/.gemini/antigravity/brain/528eb40a-f3a0-4858-9182-f276877824bb"
image_map = {
    "aesthetic_skin": "aesthetic_skin_1777223690213.png",
    "aesthetic_face": "aesthetic_face_1777223704097.png",
    "aesthetic_lips": "aesthetic_lips_1777223728965.png",
    "aesthetic_jawline": "aesthetic_jawline_1777223740891.png",
    "aesthetic_botox": "aesthetic_botox_1777223785676.png",
    "aesthetic_nose": "aesthetic_nose_1777223802001.png",
}

for name, filename in image_map.items():
    src = os.path.join(artifact_dir, filename)
    dst = f"./images/{name}.png"
    if os.path.exists(src):
        shutil.copy(src, dst)
        print(f"Copied {name}")
    else:
        print(f"Not found: {src}")

