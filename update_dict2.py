import re

with open('main.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Add to EN
en_add = """
      ,"btn-back": "&larr; Back",
      "view-treatments": "View Treatments"
"""
js = js.replace('"botxadv-mat-val": "Botulinum Toxin"', '"botxadv-mat-val": "Botulinum Toxin"' + en_add)

# Add to HE
he_add = """
      ,"btn-back": "<span>&larr;</span> חזור",
      "view-treatments": "לכל הטיפולים"
"""
js = js.replace('"botxadv-mat-val": "בוטולינום טוקסין"', '"botxadv-mat-val": "בוטולינום טוקסין"' + he_add)

with open('main.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("Updated main.js dictionary")
