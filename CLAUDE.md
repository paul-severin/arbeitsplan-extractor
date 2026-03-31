# Arbeitsplan Extractor

Single-file web app (`index.html`) — no build tools, no dependencies except PDF.js loaded from CDN.

## What it does
Extracts work schedule data from Arbeitsplan PDFs and displays it as a table. Saves results to localStorage so the last upload persists across page loads.

## PDF parsing
- Uses PDF.js to extract text, grouped by y-coordinate into lines
- Looks for lines containing `Anwesenheitszeit`
- Fields: `[0]=day, [1]=weekday, [2]="Anwesenheitszeit", [3]="(final)", [4]=von, [5]=bis`, followed by numeric fields, then Kommentar
- Month/year extracted from the `von: DD.MM.YYYY bis: ...` header line

## PWA
- Deployed to GitHub Pages; manifest and service worker (`sw.js`) make it installable as a PWA on iOS/Android
- Designed for iPhone home screen use — theme color black, safe-area insets applied
- Alarm button opens an Apple Shortcuts URL (`shortcuts://run-shortcut?name=PWA%20Alarm&input=text&text=HH:MM,...`) with a comma-separated list of alarm times (one per configured offset)
- Alarm offsets (minutes before shift start) are persisted in localStorage under `alarmOffsets`

## Deployment
- Hosted on GitHub Pages (auto-deploys on push to `main`)
- To wait for the latest pipeline run to finish:
  ```sh
  gh run watch $(gh run list --limit 1 --json databaseId -q '.[0].databaseId')
  ```

## Manual shift entries
- Each entry has `source: "pdf" | "manual"`
- PDF upload only replaces `source: "pdf"` entries; manual ones are preserved and re-merged
- Edited entries always get `source: "manual"` regardless of original source — intentional trade-off: re-importing a PDF after editing a PDF-sourced shift will produce both the edited entry and the fresh PDF entry for that day. This is acceptable; the alternative (overwriting manual edits on re-import) is worse.
- `_currentData` is the module-level variable holding the live results object
- `loadRawResults()` reads from localStorage without calling `displayResults()`

## Pause calculation
- Pure function `calculateShiftDetails(startStr, endStr)` → `{ pause, arbeitszeit }` (decimal strings, e.g. `"0,50"`)
- Rules: brutto ≥ 6h → 0,50 pause; ≥ 9h → 0,75 pause; Dauer = brutto − pause
- Unit tests: `node test-shift-calc.js`

## Add-shift modal
- `<dialog id="addShiftDialog">` with `position: fixed; top: 4.5rem; left: 50%; transform: translateX(-50%)`
- Date entered as separate day/month inputs (`shiftDay`, `shiftMonth`); year inferred via `inferYear(mm)` — next year if mm < current month
- Backdrop click closes the dialog (click target === dialog element)

## Key behaviors
- Past days (before today) are collapsed by default behind an accordion row
- Accordion uses CSS animation via `max-height`/`opacity` on `td` elements (not `tr`, which can't animate height)
- `border-collapse: separate` required for `border-radius` on table cells
- Settings/actions accordion is labelled "Optionen" (not "Einstellungen")
