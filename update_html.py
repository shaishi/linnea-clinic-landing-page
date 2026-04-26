import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Extract the FFR card
ffr_match = re.search(r'(<div class="treatment-card legal-link" data-target="modal-ffr".*?</div>\s*</div>)', html, re.DOTALL)
if ffr_match:
    ffr_card = ffr_match.group(1)
    
    # 2. Add the FFR card to sub-contouring's carousel track
    # Find the track inside sub-contouring
    sub_cont_idx = html.find('id="sub-contouring"')
    if sub_cont_idx != -1:
        track_idx = html.find('class="treatments-grid carousel-track"', sub_cont_idx)
        if track_idx != -1:
            end_track_start_idx = html.find('>', track_idx) + 1
            # insert ffr_card here
            html = html[:end_track_start_idx] + "\n" + ffr_card + html[end_track_start_idx:]

# 3. Remove sub-signature category trigger
# Looks like: <div class="treatment-card category-trigger" data-target-sub="sub-signature" ... </div></div>
html = re.sub(r'<div class="treatment-card category-trigger" data-target-sub="sub-signature".*?</div>\s*</div>', '', html, flags=re.DOTALL)

# 4. Remove sub-signature drill view entirely
html = re.sub(r'<div class="drill-view" id="sub-signature">.*?<div class="carousel-dots-row"></div>\s*</div>\s*</div>', '', html, flags=re.DOTALL)

# Now, image replacements
img_replacements = [
    # Top level categories
    (r't_sculptra_1777194549075\.png', 'aesthetic_skin.png'), # Skin Rejuvenation category
    (r'contouring\.png', 'aesthetic_face.png'), # Face contouring category
    (r'botox\.png', 'aesthetic_botox.png'), # Botox category
    
    # Inner treatments (sub-skin)
    (r't_pn_1777194520499\.png', 'aesthetic_face.png'),
    (r'scientific_article\.png', 'aesthetic_skin.png'), # Radiesse
    (r'skin\.png', 'aesthetic_skin.png'), # Skin Booster
    (r'before-after-skin\.png', 'aesthetic_skin.png'), # Acne
    
    # Inner treatments (sub-contouring)
    (r't_ffr_1777194492983\.png', 'aesthetic_face.png'), # Full Face Restoration
    (r't_lips_1777194610121\.png', 'aesthetic_lips.png'), # Lips
    (r't_teartrough_1777194646793\.png', 'aesthetic_face.png'), # Tear trough
    (r'jaw-after\.png', 'aesthetic_nose.png'), # Nose (I mapped jaw-after to nose earlier by mistake in src? Let's check alt)
    
    # Wait, jawline was contouring.png. Let's do a generic replace.
]

for old, new in img_replacements:
    html = re.sub(old, new, html)

# Let's replace specifically based on alt tags for safety
html = re.sub(r'<img src="\./images/[^"]+" alt="Jawline & Chin Sculpting"', r'<img src="./images/aesthetic_jawline.png" alt="Jawline & Chin Sculpting"', html)
html = re.sub(r'<img src="\./images/[^"]+" alt="Non-Surgical Rhinoplasty"', r'<img src="./images/aesthetic_nose.png" alt="Non-Surgical Rhinoplasty"', html)
html = re.sub(r'<img src="\./images/[^"]+" alt="Classic Botox"', r'<img src="./images/aesthetic_botox.png" alt="Classic Botox"', html)
html = re.sub(r'<img src="\./images/[^"]+" alt="Advanced Botox"', r'<img src="./images/aesthetic_botox.png" alt="Advanced Botox"', html)


with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("HTML structure and images updated!")
