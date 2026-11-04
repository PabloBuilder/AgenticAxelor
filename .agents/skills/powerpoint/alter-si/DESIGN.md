# Alter-si presentation design system

## Scope and source

Default for **new** PowerPoint presentations unless the user explicitly requests another design or template. Preserve the design of an existing presentation unless a redesign is requested. This is a practical reconstruction of the supplied example, not a verified corporate brand manual or a guarantee of pixel-perfect output.

- Canonical working template: [assets/alter-si-template.pptx](assets/alter-si-template.pptx), a copy of `Work_data/Thème.pptx` supplied by the user. It includes seven example slides, masters, layouts and embedded visual assets. Preserve it unchanged; write output elsewhere.
- The extracted PNGs in [assets/](assets/) and [icon assets/](assets/icon%20assets/) are copies of the template's embedded media. Use the actual template first, retaining its embedded assets on every reused slide. Use logo and organic-shape assets when appropriate to the source composition. The icons in `assets/icon assets/` are secondary: use them sparingly, only when relevant to the content or source layout, not as a default decoration. For additions that require a logo, organic shape or illustration, use the corresponding supplied PNGs rather than redrawing them, using generic icons or generating substitutes. Preserve transparency, aspect ratio and the template's scale and placement. Do not force unrelated decorations onto every slide. If a required original asset cannot be used, report the blocker rather than silently substitute it.
- The source may evolve independently: this bundled copy is a snapshot. If asked to refresh it, compare against the source before replacing it and revalidate the asset inventory and design facts.

## Required workflow

1. **Start from the real slides, not an approximation.** Open a copy of `assets/alter-si-template.pptx`; inspect its seven slides and select the closest example for each intended slide. Duplicate the actual example slide with all its shapes, groups, relationships, inherited layouts, fonts and assets intact, then replace the text in existing objects. If a verified template layout reproduces the example faithfully, it can be used instead. A blank slide plus logo/colors, `apply_professional_design`, or a generic preset does not reproduce this design. Never assume `add_slide` with a standard layout index selects a template layout.
2. **Check tooling before committing.** Inspect available operations and verify duplication, editing and removal on a disposable copy. The CLI's documented operations do not establish that deleting or duplicating an existing slide is supported. Use another verified PowerPoint-capable editor if necessary; don't fabricate a tool operation. If the tools cannot preserve the original slide structure, stop and report the blocker rather than produce a visually unrelated deck or leave unused example slides.
3. Preserve the 16:9 canvas (10 × 5.625 inches), the source's visual identity, backgrounds, master artwork, line weights and grouping. Keep original example geometry when reusing a composition; when adapting it for a different message, deliberately rearrange editable content while preserving the brand's scale, hierarchy and clear space. Retain the source's embedded visual assets and use the supplied extracted assets whenever adding corresponding visuals; do not replace them with generic or generated substitutes. Preserve text run formatting where applicable; avoid moving grouped shapes based on their local XML coordinates. Adapt content length to the available boxes. Don't overwrite the source template.
4. Before finalizing, check that Changa One, Poppins and Poppins SemiBold actually resolve in the rendering environment; the example slides explicitly request them, while embedded theme defaults alone do not describe their appearance. If missing, obtain installation or substitution authorization; do not silently substitute and claim an exact match. Font presence in the PPTX or in a different application is not proof the renderer can use it.
5. Remove all irrelevant examples and replace sample labels, dates, section numbers and palette codes where inappropriate. Save to the requested output path; reopen and inspect slide count, text and masters. Render the result and the corresponding source slides in the same environment and visually compare every slide at the same aspect ratio. Check title hierarchy, shapes, margins, number alignment, line and image positioning, text wrapping and contrast. Fix and re-render until faithful. If a font, renderer, cloning operation or comparison is unavailable, explicitly report what could not be verified; never claim an exact reproduction.

## Design tokens and typography

The example slide showing the palette explicitly labels these five colors:

| Role candidate | Hex |
|---|---|
| Warm off-white | `FEF9F3` |
| Pale gold | `FFDB9C` |
| Coral | `FFAB9A` |
| Burgundy | `773344` |
| Deep teal | `115B6C` |

Additional colors in the embedded theme include gold `F5CA7E`, mint `9EC5C0`, dark gray `595959`, black and white. Prefer the five displayed colors for additions; derive actual combinations and contrast from the chosen template slide. Do not assume every background, title or accent uses a single fixed token.

The embedded theme defines Arial for major/minor Latin fonts, but explicit formatting on example slides uses **Changa One** for prominent display/section titles and **Poppins** / **Poppins SemiBold** for supporting text and labels. These explicit slide fonts take precedence where applicable; preserve inherited formatting from the template. Check availability and visual rendering: do not silently claim fidelity if fonts are substituted. Do not distribute fonts or assume a fallback matches their metrics.

## Visual vocabulary and assets

The template combines warm light surfaces, high-contrast dark teal/burgundy text or accents, large organic color blobs, bold rounded display lettering, prominent numbered sections, and soft white dimensional illustrations. Use generous negative space and keep decorative graphics subordinate to the content. The actual examples and masters govern placement and sizing; these are observations, not universal rules.

| Extracted asset | Content and use |
|---|---|
| `assets/image1.png` | Overlapping teal and pale gold organic shapes. |
| `assets/image2.png`, `assets/image6.png` | Burgundy organic shapes. |
| `assets/image3.png` | Deep teal organic shape. |
| `assets/image4.png` | Black ALTER SI wordmark; preserve proportions, clear space and contrast. |
| `assets/icon assets/image5.png` | White dimensional speech bubble; secondary, use sparingly. |
| `assets/image7.png` | Pale gold organic shape. |
| `assets/icon assets/image8.png` | White paper plane illustration; secondary, use sparingly. |
| `assets/image9.png`, `assets/image11.png` | Coral organic shapes. |
| `assets/image10.png` | Mint organic shape. |
| `assets/icon assets/image12.png`–`assets/icon assets/image21.png` | Secondary white dimensional illustrations: clipboard, plant, growth chart, light bulb, books, mug, handshake, robot, rocket and illuminated bulb, respectively; use sparingly. |

## Reference slide compositions

The following describes the user's supplied source and screenshot, not a generic corporate presentation. Reuse exact source objects; dimensions are approximate and not a replacement for the template.

- **Slide 1 — cover:** white/light background, thin black horizontal rule near the top stopping before the black ALTER SI wordmark at upper right; title at left around `(1.07, 1.46)` inches, highlighted subtitle below around `(1.13, 2.74)` and a smaller date beneath. Overlapping pale-gold and dark-teal organic shapes occupy the lower-right corner and are cropped by the slide edge. Preserve the existing shapes and highlight; don't replace them with a full-color background or a centered title.
- **Slide 2 — agenda:** thin black horizontal rule spans nearly the full width near the top; large bold black `Planning` heading at upper left. Four rows near the middle each pair a bold two-digit black number over a small pale-gold highlight with a text label to its right. The number/label rows are grouped: reuse or duplicate the group, not isolated XML offsets, and adjust content to fit.
- **Slide 3 — title/body:** numbered section header and subtitle form the common content-slide frame. Inspect this actual slide when a title/body slide is needed.
- **Slide 4 — three-column blocks:** large two-digit black section number at top left, a subtitle beneath with a short teal vertical rule at its left, and three evenly spaced pale off-white rounded cards. Each card has a small pale dimensional illustration overlapping its upper edge and a centered bold label. Keep cards, whitespace, icons and their alignments; don't substitute filled teal cards or arbitrary geometric icons.
- **Slide 5 — palette example:** same numbered header and subtitle frame, followed by five evenly spaced rounded swatches. This is a palette example, not a mandatory business slide; do not accidentally deliver color codes as presentation content.
- **Slide 6 — timeline:** same numbered header and subtitle frame; a fine dark horizontal line with six evenly spaced burgundy dots. Adapt the number of milestones only while preserving the line-and-dot style and spacing.
- **Slide 7 — illustrations:** same numbered header and subtitle frame and a grid of light monochrome dimensional illustrations. This is an icon library example, not a mandatory content slide.

The supplied screenshot is a visual reference for composition, not proof of font fidelity in every environment. In particular, visible text rendering can differ when fonts are substituted. Reproduce the actual source geometry and inspect rendering on the target system.

## Creative content slides

The user approved `Work_data/Quintessence-risques-IA-MCP-nouveau.pptx` as a stylistic direction: a concise, varied and editable presentation grounded in the Alter-SI template. It is a workspace reference, not a replacement for the canonical template or a visually verified brand specification. If available, inspect it alongside the actual template; do not copy its client-specific text or assume its rendering was verified.

- Start from the real template slides and assets, then compose each slide around its message rather than repeating one text block and one decorative layout. Alternate suitable arrangements: short causal sequences, two contrasting blocks, a highlighted example, a three-step data journey, or a compact grid of takeaways.
- Make the hierarchy immediately visible: a clear headline, a short supporting line, and a small number of distinct, readable content units. Use scale, weight, whitespace and the template palette to distinguish the main idea, explanatory detail and consequence. Avoid long uniformly styled paragraphs and crowded all-bold banners.
- Place organic assets deliberately as part of the background composition. Vary position, size and cropping where appropriate while respecting aspect ratio, template identity and clear text areas. Do not place the same small blob in the same corner on every slide or cover content for decoration.
- Use soft pale-gold, coral or off-white editable blocks only where they help group information. Preserve contrast and generous margins. Use illustrations sparingly and only when relevant; do not force assets onto every slide.
- Keep page numbering and the Alter-SI wordmark consistent and legible. Tailor text to fit each slide without sacrificing key qualifications; use concrete examples and conditional wording rather than implying an unverified risk has occurred.
- Compare the source and every output slide visually when a renderer is available. Check text wrapping, inherited indents and bullets, slide edges, logo clearance, contrast and substituted fonts. When visual verification is unavailable, disclose this limitation.

## Composition guide

- **Cover:** start from the template title slide; replace title, subtitle and date and preserve its inherited brand graphics.
- **Agenda:** inspect the 3-, 4- or 5-point agenda layouts; keep the numbered structure and concise headings. The example agenda uses Poppins and Changa One with pale-gold accents.
- **Sections:** the examples use large display headings, supporting subtitle and two-digit section numbering. Reuse the actual section layout/objects and adapt text rather than reconstructing by guesswork.
- **Content and blocks:** use a suitable title/body or block layout; structure information into a few readable units. For a visual accent, reuse an organic shape or, sparingly when relevant, a white illustration from `assets/icon assets/`, respecting its aspect and transparent background.
- **Charts/tables:** use editable objects when supported; style them with the palette and legible labels. Check contrast and avoid encoding meaning with color alone. Avoid inventing values or assuming an example palette slide is data.

## Boundaries

Do not overwrite the bundled or original template. If the template or assets are unavailable, or required edits cannot be made safely, explain the limitation and ask before using an alternative design. The template and extracted assets are provided for this workspace task; no broader licensing or redistribution rights are asserted.
