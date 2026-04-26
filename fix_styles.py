import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Merge multiple style attributes into one
# E.g. style="cursor: pointer;" style="display: flex;"
# Note: we need to do it robustly or just specifically for the treatment cards

# Specific replacement for treatment cards
html = re.sub(
    r'style="([^"]+)"\s*style="([^"]+)"',
    r'style="\1 \2"',
    html
)

# And specifically for the category triggers:
# <div class="treatment-card category-trigger" data-target-sub="sub-signature" style="cursor: pointer; display: flex; flex-direction: column; height: 100%;">
# Looks good!

# Update cache to v=6
html = html.replace('v=5', 'v=6')
html = html.replace('v=4', 'v=6')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Double styles merged")
