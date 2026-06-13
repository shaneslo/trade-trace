## 2024-11-20 - Missing ARIA Labels on Core Editor Controls
**Learning:** Found that numerous icon-only buttons across the workflow editor (like Zoom controls, node actions, and auto-layout) lacked `aria-label`s. This pattern is common when using purely icon-based designs for visual minimalism, but it severely degrades accessibility for screen readers.
**Action:** Always verify that every `Button` with only an icon has an `aria-label` (and optionally `title` for mouse users) so the intent is clear both audibly and visually.
