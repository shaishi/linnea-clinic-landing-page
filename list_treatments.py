from bs4 import BeautifulSoup
import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')

categories = soup.find_all('div', attrs={'data-target-sub': True})
print("CATEGORIES:")
for c in categories:
    title = c.find('h3').text
    target = c['data-target-sub']
    print(f"- {title} -> {target}")

print("\nDRILL-DOWNS:")
drill_downs = soup.find_all('div', class_='drill-view')
for d in drill_downs:
    print(f"\nSub-category ID: {d.get('id')}")
    treatments = d.find_all('div', class_='legal-link')
    for t in treatments:
        title = t.find('h3').text
        print(f"  - {title}")
