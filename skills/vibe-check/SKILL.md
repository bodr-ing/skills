---
name: vibe-check
description: Find a brand's visual taste by swiping, before any design work. Use when someone says "I'll know it when I see it", rejects a design without saying why, or starts a new brand, landing page, deck or product look.
---

# Vibe check

Turn "I'll know it when I see it" into a written taste profile, then design from it. The person swipes through visual direction cards (Tinder-style), and you read the swipes and write `taste.md`.

## When to run it

Run it **between brainstorm and plan**: after you know what the thing is and who it's for, but before you pick fonts, colours or layout. Run it again whenever the person rejects designs and can't say why.

## The loop

1. **Brief.** One paragraph: what it is, who it's for, and the one job the page or product must do.
2. **Build the deck.** Start from `demo.html`. Rewrite the `V` card list for this brand. Each card is a *recipe* (palette, font, layout motif, copy line) tagged on four axes: `mood`, `color`, `type`, `density`. Use the brand's real name and real product names on the cards. Cover the space widely: playful to premium, light to dark, serif to mono to chunky, minimal to bold, and at least one look rooted in the brand's own culture or place. 30 to 40 cards are enough.
3. **Swipe.** The deck runs in two rounds:
   - **Round 1, map:** 12 cards picked to be as different as possible.
   - **Round 2, remix and explore:** each next card is either a remix (the palette of one liked card with the type of another) or an unseen card that probes a blind spot. Tag scores are sampled from like/dislike counts (Thompson-style), so the deck leans toward the person's taste and keeps exploring.

   Publish it where the person can swipe on a phone. If results can come back to you automatically (for example through a page database), use that. Otherwise the page shows a "Copy profile" box to paste back.
4. **Write `taste.md`.** Include the top values per axis with percentages, the liked cards, and an explicit **never** list (everything at or under about 20%). Show it to the person and let them edit it.
5. **Plan three directions.** Each one leans on a different liked cluster. Name each with a short phrase (for example "Samarkand terminal", "Pickle press", "Company ledger"). Give each a palette, a font pairing and one motif.
6. **Build them as real pages,** not mockups. Present them on a single picker page: phone-sized previews, an "open live" link for each, a one-tap pick and an optional note.
7. **Ship the pick.** Then do the same for the logo: 3 to 4 marks, each shown big, as an avatar, as a favicon and on the brand colour.
8. **Compound.** Append the winner, the logo and why the others lost to `taste.md`, and commit it to the repo. The next venture starts from that file.

## Rules

- Never ask the person to describe their taste in words first. Show, don't ask.
- Cards test a *direction*, not a finished design. Keep each one fast to judge (one headline, one line, two chips).
- Avoid the generic AI looks unless the person likes them in the deck: cream with a terracotta serif, a purple-to-blue gradient, Inter everywhere.
- Present results and choices as visual pages, not long chat messages.

## Files

- `demo.html`: a working deck with 40 recipe cards and adaptive round 2. Copy it and replace the `V` list.
- `taste.example.md`: the profile this skill produced for The Bodring Company.
