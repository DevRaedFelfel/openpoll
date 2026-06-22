# OpenPoll — live drag-into-grid polling

A static site (no build step) that runs a drag-and-drop categorisation question for a live
audience and shows results on a projector — entirely in the browser, no PowerPoint.

- **Audience** opens `play.html?q=<id>` on their phone, drags statements into grid cells, sends.
- **Presenter** opens `present.html?q=<id>` and steps through three views with `Next` / arrow keys:
  1. **Join** — QR code + live count of who has joined
  2. **Solving** — the same grid, each cell showing the statements the class is dropping there with a count (no right/wrong shown)
  3. **Solution** — the correct statement per cell, tinted green/amber/red by how many got it, plus the most common wrong drop

Data layer is **Cloud Firestore** (the project config has no `databaseURL`, so we use Firestore, not Realtime Database).

---

## 1. One-time Firebase setup (console)

1. **Build → Firestore Database → Create database.** Start in **test mode**, location **eur3 (europe-west)**.
2. Open the **Rules** tab and paste this, then **Publish**. This is wide open — anyone can read and write everything, which is what you asked for. Fine for a prototype; do **not** leave it on anything you'd be sad to lose, because "anyone can write" also means "anyone can wipe it."

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

That's all the config you need — `firebase.js` already holds your web app keys.

## 2. Create the GitHub repo + publish Pages

Run from this folder (where these files live):

```bash
git init -b main
git add .
git commit -m "OpenPoll: live drag-drop grid polling"

# creates the repo on your account, sets origin, and pushes
gh repo create DevRaedFelfel/openpoll --public --source=. --remote=origin --push

# enable GitHub Pages from main / root
gh api -X POST repos/DevRaedFelfel/openpoll/pages -f "source[branch]=main" -f "source[path]=/"
```

If the last command errors, enable Pages by hand: repo **Settings → Pages → Deploy from a branch → `main` / `/ (root)` → Save**.

Your site (Pages lowercases the username):

- Home:      `https://devraedfelfel.github.io/openpoll/`
- Present:   `https://devraedfelfel.github.io/openpoll/present.html?q=<id>`
- Audience:  `https://devraedfelfel.github.io/openpoll/play.html?q=<id>`

## 3. Seed a question + test the loop

Open the home page, click **Add sample question** (writes the "Stacks vs Queues" 2×2). Then:
open `present.html?q=<id>` on the projector, scan the QR with a couple of phones, drag, send,
and step Join → Solving → Solution. The join count and cell tallies update live.

---

## Data model (Firestore)

```
questions/{qid}
  title:      string
  rows:       [{ id, label }]        // may be []  (drop the row dimension)
  cols:       [{ id, label }]        // may be []  (drop the column dimension)
  statements: [{ id, text }]
  correct:    { [statementId]: cellId }
  createdAt:  timestamp

questions/{qid}/joins/{autoId}      { at }                    // one per page open
questions/{qid}/responses/{autoId}  { answers: {sid: cellId}, at }
```

**cellId convention** (also in `grid.js`):
rows **and** cols → `` `${rowId}__${colId}` `` · rows only → `rowId` · cols only → `colId`.

Everything on the Solving and Solution views is **derived** from `responses` in the browser —
nothing aggregated is stored. Consensus per cell, accuracy %, and the top wrong answer are all
computed in `present.html`'s snapshot listener.

Notes / known prototype edges: a refresh re-counts a join; re-submitting adds another response
doc (the audience page locks after the first send to avoid this).

---

## Files

- `firebase.js` — config + Firestore init (shared)
- `grid.js` — `buildGrid(rows, cols)` and `cellIdFor(...)`, handles all three layouts
- `styles.css` — projector-legible warm-paper / ink / burnt-orange theme
- `index.html` — presenter home: lists questions, seeds the sample
- `present.html` — presenter controller (QR → consensus → solution)
- `play.html` — audience drag-and-drop (SortableJS, touch-friendly)

---

## Spec (hand this to Claude Code for changes)

> Static GitHub Pages site, no bundler. Cloud Firestore via the gstatic modular SDK (v10.12),
> SortableJS and qrcode from jsDelivr. One question type: drag statements into a grid that may
> have rows, columns, or both. Schema as above; cellId = `rows&&cols ? row__col : (row||col)`.
> Audience page (`play.html?q`) loads the question, shuffles statements into a bank, makes the
> bank and every cell a shared SortableJS group (`group:'pool'`, multiple chips per cell allowed),
> writes a `joins` doc on load and a `responses` doc `{answers:{statementId:cellId}}` on send,
> then locks. Presenter page (`present.html?q`) holds three views switched by Next/Back and
> arrow keys: (1) QR to the audience URL + live `joins.size`; (2) consensus — rebuild the grid
> and render, per cell, each placed statement with its count, top one emphasised, no correctness;
> (3) solution — reverse the `correct` map to cellId→statements, tint each cell by
> placed-correctly/total (≥75 good, ≥45 mid, else bad), show the correct text, %, and the most
> common wrong statement. All aggregation is client-side from the `responses` snapshot. Keep the
> theme tokens in `styles.css`. Firestore rules are fully open for the prototype.
