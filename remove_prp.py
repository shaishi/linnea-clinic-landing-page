import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# remove modal-prp
prp_start = html.find('<div class="modal-overlay legal-modal-overlay" id="modal-prp"')
if prp_start != -1:
    # find next modal
    next_modal = html.find('<div class="modal-overlay legal-modal-overlay"', prp_start + 1)
    if next_modal != -1:
        html = html[:prp_start] + html[next_modal:]
    else:
        # if it's the last one, find Privacy modal
        privacy_modal = html.find('<!-- Privacy Policy Modal -->')
        html = html[:prp_start] + html[privacy_modal:]

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Removed PRP modal.")
