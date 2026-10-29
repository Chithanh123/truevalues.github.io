# Interface design notes

The visual language uses a pale ambient mesh, dark green text, warm accent colors and restrained Liquid Glass surfaces. The home page, assessment and research workspaces share the tokens and controls in `design-system.css`; assessment and workspace refinements live in the corresponding `design-*.css` files.

- Keep text and choice controls legible against every part of the backdrop. Use native controls, visible selected and keyboard-focus states, and comfortable touch targets.
- Use colorless translucent tints and inset rim highlights for major surfaces; repeated chips use the lightweight CSS blur tier. Avoid placing another glass panel inside a glass panel.
- `glass-refraction.js` progressively enhances a small number of home-page surfaces in Chromium, with CSS blur as the fallback. Respect reduced-transparency and reduced-motion preferences; do not rely on the effect to communicate meaning.
- Keep visual styles screen-only where necessary so print reports and their disclosure rules remain authoritative. The interface uses local assets and system fonts and must not transmit responses or make third-party requests.
- Preserve the assessment's save formats, fictional-setting reveal timing, question wording and research limitations when changing the presentation.

The glass treatment is adapted from [LiquidGlassSkill](https://github.com/stormaref/LiquidGlassSkill) and liquid-glass-js. See `THIRD-PARTY-NOTICES.txt` and `glass-refraction.js` for license notices.
