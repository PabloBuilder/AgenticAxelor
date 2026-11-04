# Alter-si presentation design system

## Scope and source

Default for **new** PowerPoint presentations unless the user explicitly requests another design or template. Preserve the design of an existing presentation unless a redesign is requested. This is a practical reconstruction of the supplied example, not a verified corporate brand manual or a guarantee of pixel-perfect output.

- Canonical working template: [assets/alter-si-template.pptx](assets/alter-si-template.pptx), a copy of `Work_data/Thème.pptx` supplied by the user. It includes seven example slides, masters, layouts and embedded visual assets. Preserve it unchanged; write output elsewhere.
- The extracted PNGs in [assets/](assets/) are copies of the template's embedded media. Use the actual template first; standalone PNGs are for building additions consistent with it. Keep transparency and aspect ratio.
- The source may evolve independently: this bundled copy is a snapshot. If asked to refresh it, compare against the source before replacing it and revalidate the asset inventory and design facts.

## Required workflow

1. Load the bundled template with `create_presentation_from_template` or open a copy. Inspect actual slides, masters, layouts, placeholders and supported edit operations before constructing content. Existing slides are examples, not automatically suitable deliverables; replace or remove all irrelevant sample material. Verify the tool can do this rather than assuming a deletion operation exists. If it cannot, use a supported alternative preserving masters, or report the limitation; never deliver unrelated examples as finished content.
2. Preserve the 16:9 canvas (10 × 5.625 inches) and reuse the template's own backgrounds, masters, logos, shapes and layouts. Select layouts by inspecting their names and actual indices: title, title/body, organic shapes, agenda variants for 3–5 points, and several block variants exist. Do not apply the generic `modern_blue` or another global theme over the template.
3. Use the visual hierarchy and asset guidance below. Prefer editable text and shapes while retaining template assets. Build slide compositions around the requested message, not around a fixed decorative pattern. Do not stretch logos, raster assets or text; do not introduce unrelated branding.
4. Save under the requested output path. Reopen it and inspect the slide count, dimensions, text and layouts, checking no example text, obsolete dates, palette labels or unwanted slides remain. Render and visually inspect **every slide** for clipping, contrast, spacing, layout, font substitution and logo fidelity when a renderer is available. Correct defects and recheck. If rendering, fonts, template manipulation or visual comparison are unavailable, disclose this rather than asserting perfect fidelity.

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
| `assets/image5.png` | White dimensional speech bubble. |
| `assets/image7.png` | Pale gold organic shape. |
| `assets/image8.png` | White paper plane illustration. |
| `assets/image9.png`, `assets/image11.png` | Coral organic shapes. |
| `assets/image10.png` | Mint organic shape. |
| `assets/image12.png`–`assets/image21.png` | White dimensional illustrations: clipboard, plant, growth chart, light bulb, books, mug, handshake, robot, rocket and illuminated bulb, respectively. |

## Composition guide

- **Cover:** start from the template title slide; replace title, subtitle and date and preserve its inherited brand graphics.
- **Agenda:** inspect the 3-, 4- or 5-point agenda layouts; keep the numbered structure and concise headings. The example agenda uses Poppins and Changa One with pale-gold accents.
- **Sections:** the examples use large display headings, supporting subtitle and two-digit section numbering. Reuse the actual section layout/objects and adapt text rather than reconstructing by guesswork.
- **Content and blocks:** use a suitable title/body or block layout; structure information into a few readable units. For a visual accent, reuse an organic shape or a relevant white illustration, respecting its aspect and transparent background.
- **Charts/tables:** use editable objects when supported; style them with the palette and legible labels. Check contrast and avoid encoding meaning with color alone. Avoid inventing values or assuming an example palette slide is data.

## Boundaries

Do not overwrite the bundled or original template. If the template or assets are unavailable, or required edits cannot be made safely, explain the limitation and ask before using an alternative design. The template and extracted assets are provided for this workspace task; no broader licensing or redistribution rights are asserted.
