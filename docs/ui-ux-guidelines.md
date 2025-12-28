## UI & UX Guidelines — Premium Minimal Design

This document describes the UI/UX design intent for the Vite React SSG Pro, and explains how to use and maintain the `.agent`, `.github` directories and README links. It also includes a practical checklist and guidelines to achieve a premium, minimal, and accessible UI.

### Purpose
- Provide clear, actionable guidelines for creating a premium, minimal UI that follows modern design systems.
- Document what the `.agent` and `.github` folders are and why they matter.
- Offer practical, easy-to-follow patterns for components, layout, typography, accessibility, and animation.

### Folders of Interest
- **`.agent/`**: Contains AI agent instructions and automated rules used by internal tooling and agents. Keep this file up-to-date if automated agents require new instructions or rules. Do not include secrets.
- **`.github/`**: Holds GitHub-specific configuration, instructions, and automation; `copilot-instructions.md` contains Copilot-specific guidance to the AI coding assistant. Update if your CI or automation workflows change.

### Design Goals
Make the UI/UX feel premium, minimal, and polished as if designed by a team at Apple, Google, or Tesla.

1. Hierarchy — Use type, color, and spacing to lead the eye. Title > Subtitle > Body. Extra whitespace for clarity.
2. Progressive Disclosure — Show a minimal set of actions and reveal more controls on interaction or deeper pages.
3. Consistency — Reuse tokens (colors, spacing, border radius) and component patterns across pages.
4. Contrast — Maintain high contrast for primary CTAs and sufficient contrast for text accessibility.
5. Accessibility — Follow WCAG: semantic markup, keyboard focus, alt text, and color contrast checks.
6. Proximity — Group related controls and information logically (e.g., navbar cluster, content cluster).
7. Alignment — Use a 12 column grid, 8px base spacing and consistent vertical rhythm.

### Visual System (Suggested)
- **Color Palette**: Neutral base + single accent. Example: `#0f172a` (navy base), `#ffffff` (paper), `#0ea5a3` (accent teal), `#f3f4f6` (muted gray).
- **Typography**: Use a modern system font stack for speed and sharp rendering: `Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial`.
- **Token Examples**:
  - Spacing: `--space-1: 4px`, `--space-2: 8px`, `--space-3: 16px`, `--space-4: 24px`, `--space-5: 32px`.
  - Border-radius: `4px` for small UI, `8px` for cards, `40px` for pills.
  - Elevation: subtle shadows plus `backdrop-filter: blur(8px)` for modals.

### Component Guidelines
- **Navbar**: Minimal, left aligned logo, centered or right aligned actions. Maintain consistent spacing and avoid too many calls to action.
- **Hero**: Large headline, concise subheading, and single primary CTA. Use a secondary smaller CTA for lesser importance.
- **Buttons**: Primary high contrast; secondary muted; destructive red for dangerous actions only.
- **Forms**: Label above input, clear helper text, keyboard accessible focus state. Use error inline messaging for validation.
- **Cards**: Use consistent padding and elevation. Keep micro interactions subtle (scale 1.02, 60ms) — no heavy springing.

### Interactions & Motion
- Use Framer Motion for subtle entrance/hover interactions.
- Prefer fades and translations; avoid heavy physics or bounce.
- Ensure reduced-motion users still receive a usable experience (respect `prefers-reduced-motion`).

### Accessibility Checklist
- All images include `alt` text.
- All interactive elements are reachable by keyboard and have visible focus states.
- Buttons have accessible labels.
- Color contrast meets WCAG AA minimum of 4.5:1 for body text and 3:1 for large text.

### Implementation Tips
- Use Tailwind design tokens and classes where appropriate; scope custom variables in `index.css`.
- Store global colors and spacing in `tailwind.config.js` to maintain consistency.
- The template has a `Hero` and `Navbar` — follow these patterns for future components.

### Where to Add Changes
- Update `src/components/*.tsx` when creating or refactoring components.
- Use `src/Layout.tsx` to enforce consistent header/footer and grid alignment.
- Add new style tokens or spacing variables only in `tailwind.config.js` and `src/index.css`.

### QA Checklist before merge
1. Visual review on 3 screen sizes (mobile/tablet/desktop).
2. Run Lighthouse or PageSpeed: aim to keep high scores but prioritize UX if changes reduce speed slightly.
3. Run accessibility checks: Lighthouse Accessibility, `axe`, and keyboard-only navigation.
4. Screenshot new states for OG images if content changed (run OG script if necessary).

### README & Repo Documentation
- Link this doc in `template/README.md` and root `README.md` under documentation.
- Add short notes describing `.agent` and `.github` purpose in the project root and template README.

---

If you'd like, I can also create component templates (Button, Card, Form) that follow these patterns, or update the template's UI, starting with `Navbar`, `Hero`, and `Footer` with the polished look described above.

---
