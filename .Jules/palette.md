## 2024-11-20 - Missing ARIA Labels on Core Editor Controls
**Learning:** Found that numerous icon-only buttons across the workflow editor (like Zoom controls, node actions, and auto-layout) lacked `aria-label`s. This pattern is common when using purely icon-based designs for visual minimalism, but it severely degrades accessibility for screen readers.
**Action:** Always verify that every `Button` with only an icon has an `aria-label` (and optionally `title` for mouse users) so the intent is clear both audibly and visually.

## 2026-06-14 - Accessible tooltips and ARIA positioning
**Learning:** Found a pattern where `aria-label` attributes were placed on inner `<span>` wrappers (like the `+` sign for "Add node") instead of the interactive `<Button>` element itself. Also, icon-only buttons like the Theme toggle were missing `title` attributes, denying sighted users helpful tooltips.
**Action:** When working with icon-only buttons, ensure the `<Button>` itself has the `aria-label` and `title` attributes. Inner text or icon spans should use `aria-hidden="true"` to prevent screen readers from redundantly announcing visual symbols (like "plus").
## 2026-06-16 - aria-hidden for decorative text in aria-labeled buttons
**Learning:** Found that some icon-only or symbol-only buttons with `aria-label` (e.g. `+` for insert) contained inner text elements without `aria-hidden=\true\`. This causes screen readers to read both the descriptive label and the redundant symbol.
**Action:** Always ensure that decorative inner text or icons within an `aria-label`ed button are marked with `aria-hidden=\true\` to avoid redundant screen reader announcements.
