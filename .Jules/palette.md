## 2024-11-20 - Missing ARIA Labels on Core Editor Controls
**Learning:** Found that numerous icon-only buttons across the workflow editor (like Zoom controls, node actions, and auto-layout) lacked `aria-label`s. This pattern is common when using purely icon-based designs for visual minimalism, but it severely degrades accessibility for screen readers.
**Action:** Always verify that every `Button` with only an icon has an `aria-label` (and optionally `title` for mouse users) so the intent is clear both audibly and visually.

## 2026-06-14 - Accessible tooltips and ARIA positioning
**Learning:** Found a pattern where `aria-label` attributes were placed on inner `<span>` wrappers (like the `+` sign for "Add node") instead of the interactive `<Button>` element itself. Also, icon-only buttons like the Theme toggle were missing `title` attributes, denying sighted users helpful tooltips.
**Action:** When working with icon-only buttons, ensure the `<Button>` itself has the `aria-label` and `title` attributes. Inner text or icon spans should use `aria-hidden="true"` to prevent screen readers from redundantly announcing visual symbols (like "plus").

## 2026-06-24 - Missing ARIA Labels on Theme and Sidebar Controls
**Learning:** Found that the Theme toggle and Sidebar triggers were relying on visually hidden (`.sr-only`) spans for accessible names. This is an outdated pattern that can sometimes cause structural or focus issues. Furthermore, inner SVGs (like `<Sun>`/`<Moon>` and `<PanelLeftIcon>`) were missing `aria-hidden="true"`, meaning screen readers could potentially announce arbitrary SVG data.
**Action:** Replaced `.sr-only` spans with proper `aria-label` attributes on the parent `<Button>` components. Always add `aria-hidden="true"` to inner graphical elements like SVGs or symbols in icon-only buttons to guarantee a clean screen reader experience.
