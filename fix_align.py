import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Make the treatment card explicitly flex-grow
html = re.sub(
    r'<div class="treatment-card',
    r'<div class="treatment-card" style="display: flex; flex-direction: column; height: 100%;"',
    html
)
# Make the content explicitly stretch
html = html.replace('style="display: flex; flex-direction: column; flex: 1;"', 'style="display: flex; flex-direction: column; flex-grow: 1; justify-content: space-between;"')

# Increase cache version
html = html.replace('v=4', 'v=5')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Alignment fixed via python")
