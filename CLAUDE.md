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

## Key behaviors
- Past days (before today) are collapsed by default behind an accordion row
- Accordion uses CSS animation via `max-height`/`opacity` on `td` elements (not `tr`, which can't animate height)
- `border-collapse: separate` required for `border-radius` on table cells
- Upload button appears in the results header once a PDF has been loaded
