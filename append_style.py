css = """
/* --- Drill-Down Nested Carousels --- */
.relative-container {
  overflow: hidden;
}

.drill-view {
  position: absolute;
  top: 60px; /* Below the title */
  left: 0;
  width: 100%;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.5s ease, visibility 0.5s ease;
  pointer-events: none;
}

.drill-view.active {
  position: relative;
  top: 0;
  opacity: 1;
  visibility: visible;
  pointer-events: all;
  animation: drillFadeIn 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

@keyframes drillFadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}

.drill-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 0 1rem;
}

.drill-header h3 {
  font-family: 'DM Serif Display', serif;
  color: var(--clinique-teal);
  font-size: 2.2rem;
  margin: 0;
  text-align: center;
  flex: 1;
}

.btn-back-categories {
  background: none;
  border: none;
  color: var(--text-dark);
  font-size: 1.1rem;
  font-family: 'Outfit', sans-serif;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  transition: color 0.3s ease;
  width: 100px;
}

.btn-back-categories:hover {
  color: var(--clinique-teal);
}

.btn-back-categories span {
  font-size: 1.4rem;
  line-height: 1;
}
"""

with open('style.css', 'a', encoding='utf-8') as f:
    f.write(css)
print("CSS appended to style.css")
