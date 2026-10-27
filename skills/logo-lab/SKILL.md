---
name: logo-lab
description: Pick a logo by testing it for real. Gets 8 concepts from an image model, redraws them as clean SVG, puts every one on a site, a street poster, an app icon, an avatar, a browser tab, a sticker and in one-colour print, adds photo mockups of the finalists, scores them and ends in a one-tap pick. Use when making or replacing a logo or app mark, or when someone rejects a logo without saying why. Run oohnah first if there is no taste.md yet.
---

# Logo Lab

A logo is judged in use, not on a white square. Logo Lab takes a mark from loose concepts to a shipped SVG by putting every candidate where it will actually live, scoring them side by side, and letting the person pick on one visual page.

It is the third step of the Bodring story: **YepNope** finds what the thing is, **OohNah** finds how it should look and writes `taste.md`, and **Logo Lab** finds its mark.

## Options the person can ask for

Read these from the request and use the default for anything not mentioned. Say back the settings you used in one line before you start.

| Option | Default | Example ask |
|---|---|---|
| Concepts | 8 | "just 4 ideas", "give me 12" |
| Where concepts come from | an image model, then redrawn as SVG | "draw them yourself", "start from our sketch" |
| In-context uses | site, street poster, app icon, avatar, browser tab, sticker, one colour | "add a T-shirt", "skip the poster" |
| Photo mockups | top 4 × 5 surfaces (poster, app icon, tote, label, shop window) | "only the top 2", "no photos" |
| Finalists shown first | top 2 | "show all 8 in photos" |
| Where to stop | the shipped SVG and favicon | "stop at the compare page" |

## The loop

1. **Brief, one paragraph.** The name and what it means, the core object or idea, the palette from `taste.md` as hex values, and where the mark must work (favicon, app icon, avatar, a letter in the wordmark, print). Never ask the person to describe the logo in words. Show options.

2. **Concepts from an image model.** Image models draw better first concepts than hand-written SVG. Use whatever image generation the person has, such as Codex CLI, ChatGPT or another image tool on their machine. Use one shared brief and ask for deliberately different directions, for example: minimal geometric, sticker with thick outline, the object seen at an angle, a playful twist (a bite, a wink), a mascot with a face, a stamp or badge, bold and chunky, hand-drawn. Square, flat background, no text. Save them as `logo-drafts/NN-name.png` on a drafts branch, never on main.

3. **Redraw every concept as clean SVG.** Look at each image and rebuild it in `viewBox="0 0 100 100"`. Use flat brand colours only. Do halftone with an SVG `<pattern>`, not raster texture, and make an off-register print plate with an offset copy of the outline if the brand uses one. Generate all of them from one script with shared helpers for repeated parts (rotated lobes, seeds, wobbly hand-drawn edges, tick marks, masks for bites), so a tweak is one line. Also emit a **one-colour** version of each by mapping dark colours to one ink and light colours to paper. Render a contact sheet and fix anything that doesn't read before going further.

4. **In-context mockups, all candidates side by side.** One section per use, each comparing every candidate in the same frame:
   - on the site: in the nav at 16px and as the letter it replaces in the wordmark
   - a wheat-pasted street poster on a wall
   - an app icon on a phone home screen, on paper and on the brand colour
   - a profile picture in the round crop
   - a browser tab favicon at real 16 and 32px
   - a die-cut laptop sticker
   - one-colour print (a stamp, a jar label, embroidery)

   Screenshot the page with a headless browser at desktop and 390px wide, and look at every section yourself before showing anyone.

5. **Score and recommend.** A table with one row per candidate and one column per use, 1 to 3 dots each, plus a total. Lead the page with your pick and one short paragraph on why, the runner-up, and which ones fall apart small. Be honest: a mark that looks great big but dies at 16px loses.

6. **Photo mockups of the finalists.** Render each finalist SVG to a 1024px PNG and give it to the image model as the reference image, with "keep the mark faithful, do not redesign it". Surfaces: a street poster with the brand line, a phone app icon, a tote bag, a product label, a shop window decal. Do the top 2 first and show them as soon as they exist. Check every image against its SVG (shape and colours) and regenerate any that drifted. Save them as `mockups/<logo>-<surface>.png`, about 768px wide. `kit/render.sh` makes the reference PNG and `kit/mockup.sh` makes one photo with Codex CLI; run the five surfaces in parallel:

   ```sh
   kit/render.sh svg/04-bite.svg ref/04-bite.png 1024
   export CODEX_MODEL=<a model your login accepts> BRAND_LINE="bir bodring" COLOURS="#00915a, #ff4aa2, #f4f5ec"
   printf '%s\n' poster app-icon tote jar-label window-decal \
     | xargs -P 5 -I{} kit/mockup.sh ref/04-bite.png {} mockups/04-bite-{}.png
   ```

7. **One compare page with a pick.** Publish one visual page: the verdict and score table first, then "Out in the world" photo rows (one row per surface, finalists side by side), then the in-context sections, then pick buttons with an optional mix-or-tweak note. If the page can store data, save the pick and the note so you can read them back. Otherwise ask the person to reply with the number. Update the same page as new mockups arrive instead of making a new one.

8. **Ship and compound.** Put the picked SVG on the site (an inline symbol for the wordmark and nav, plus `favicon.svg`), export avatar PNGs at 640 and 512px, centred and safe for a circle crop, and append the winner, the scores and why the others lost to `taste.md`. Keep the drafts branch and the compare page as history.

## Rules

- Show, don't ask. Every choice reaches the person as a visual page, never as a long chat message.
- Keep the palette exact across concepts, SVGs and photo mockups.
- Never commit drafts or mockups to main. Never put secrets, tokens or private URLs in prompts, files or commits.
- Image generation and deploys often need the person's own machine and logins. When a step is blocked there (a login, a permission prompt, a production-deploy guard), say exactly which one action unblocks it and keep working on everything else.
- Do the strongest two first at every stage so the person can decide early.

## Gotchas

- Render SVGs with headless Chrome (`kit/render.sh`), not `sips` or Quick Look: they rasterise masks at low resolution and a bite's edge comes out blurry.
- In `codex exec`, put the prompt before `-i`. `-i` takes several files and swallows a prompt that follows it.
- Codex's default model can be rejected for some logins; pass one that works in `CODEX_MODEL`. Use `--sandbox workspace-write`, not `--full-auto`, which some permission guards block.
- Image models drift on small details even when told to keep the mark. Put all photos of one logo on a contact sheet next to its SVG and check them together.

## Files

- `kit/marks.py`: eight SVG marks and their one-colour versions, built from shared helpers. Replace the `M` entries with your marks.
- `kit/page.py`, `kit/tpl.html`, `kit/verdict.html`: build the compare page (in-context sections, score table, pick buttons).
- `kit/photos.py`: adds the "Out in the world" photo rows from `photos/<logo>-<surface>.jpg`.
- `kit/render.sh`: SVG to a square PNG with headless Chrome: `kit/render.sh in.svg out.png 1024`.
- `kit/mockup.sh`: one photo mockup with Codex CLI image generation: `kit/mockup.sh logo.png poster out.png`.
- `kit/shot.js`: Playwright screenshot of any page: `node shot.js page.html out.png 1180 900`.
- `demo.html` with `example/`: the real run that picked the bodr.ing logo, with 8 SVGs and 20 photo mockups.
