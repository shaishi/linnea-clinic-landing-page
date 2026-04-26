import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Fix the broken markup:
# <div class="treatment-card" style="display: flex; flex-direction: column; height: 100%;" legal-link"
# -> <div class="treatment-card legal-link" style="display: flex; flex-direction: column; height: 100%;"
html = re.sub(
    r'<div class="treatment-card" style="display: flex; flex-direction: column; height: 100%;" ([^>]+)"',
    r'<div class="treatment-card \1" style="display: flex; flex-direction: column; height: 100%;"',
    html
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("HTML syntax fixed")
