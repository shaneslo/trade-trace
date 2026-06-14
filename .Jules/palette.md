## 2024-11-20 - Missing ARIA Labels on Core Editor Controls
**Learning:** Found that numerous icon-only buttons across the workflow editor (like Zoom controls, node actions, and auto-layout) lacked `aria-label`s. This pattern is common when using purely icon-based designs for visual minimalism, but it severely degrades accessibility for screen readers.
**Action:** Always verify that every `Button` with only an icon has an `aria-label` (and optionally `title` for mouse users) so the intent is clear both audibly and visually.

## 2024-03-24 - Accessible tooltips and ARIA positioning
**Learning:** Found a pattern where `aria-label` attributes were placed on inner `<span>` wrappers (like the `+` sign for "Add node") instead of the interactive `<Button>` element itself. Also, icon-only buttons like the Theme toggle were missing `title` attributes, denying sighted users helpful tooltips.
**Action:** When working with icon-only buttons, ensure the `<Button>` itself has the `aria-label` and `title` attributes. Inner text or icon spans should use `aria-hidden="true"` to prevent screen readers from redundantly announcing visual symbols (like "plus").
