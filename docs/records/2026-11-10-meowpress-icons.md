# Meowpress Journal icons

The built-in Journal blog now uses the existing Lucide-backed `Icon` from `meowtail/icons`
for external links, post pagination, returning to the skills index, and reference directions.
The explicitly labeled GitHub source link also uses Meowtail's separate `GithubIcon` brand
artwork. These replace six hardcoded functional arrow characters, not user-authored content.
No dependency, public API, route, or link destination changes.

The SVGs render at build time. They are decorative beside their existing text, do not receive
keyboard focus, and inherit the theme's color. Post pagination follows the shared icon guide's
chevron convention. Custom page authors can already access the full Lucide set through
`meowtail/icons/lucide`; Meowpress does not add a second icon layer.

## Verification

- The full repository build and check passed with 860 unit tests, including SVG namespaces,
  decorative attributes, preserved labels and destinations, and an absent unconfigured source link.
- The Meowpress browser suite passed 20 cases at desktop and phone widths in light and dark modes,
  including icon visibility, keyboard navigation, no-JavaScript rendering, repeated filtering,
  skill file and graph switching, and existing content routes.
- The original browser screenshots were inspected. An independent review found a stale reference
  arrow color selector; it was corrected and the build, check, and browser suite passed again.
- The language sweep retained only the two previously approved Unicode test files.

This fix targets `meowpress@0.3.0-alpha.5`. Local acceptance, npm publication, and deployment
of the personal site remain separate checks; this source record does not itself claim publication.
