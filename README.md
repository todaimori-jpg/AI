# STATION — All-Source Intelligence Trainer

STATION is a local-first command center for open-source intelligence training. A simulated supervisor issues realistic taskings built around current public reporting, official records, datasets and imagery. You do the research yourself, build a structured assessment with cited sources, and get a review against public analytic standards.

It is a training tool. Roles, deadlines and injects are simulated. Only the public sources you gather are real, and nothing here produces a real intelligence product.

## What it does

- **Mission feed** — tasking archetypes across aviation, geopolitics, logistics, humanitarian response, imagery & geography, information verification and forecasting. New taskings are drawn from a live public-source scan when online; offline the board uses standing collection points and cached leads. Unfinished missions are preserved.
- **Working file** — situation, intelligence questions, collection vectors, deliverable and deadlines; a report editor with BLUF, key judgments and calibrated confidence, PIR answers, competing hypotheses, gaps, indicators, methods and a graded source register (Admiralty scheme).
- **Review board** — a deterministic audit against ODNI analytic standards and ICD 203 language, with specific unsupported claims, severity-graded findings and revision tasks. Optionally add a written read from an AI provider you configure.
- **Offline library** — save article text, upload files or fetch pages through a capture proxy. Read offline, highlight passages in four colours, keep reading notes, export Markdown, and push the saved source into a mission register.
- **Reference desk** — a built-in dictionary, thesaurus and encyclopedia of analyst tradecraft and the working vocabulary of the areas. Fully offline. Optional live enrichment from dictionaryapi.dev, Datamuse and Wikipedia, cached locally for fourteen days, plus personal notes per term.
- **Situation map** — interactive world map of tasking anchors and cached live leads with zoom, pan, country hover, layer toggles and fullscreen.
- **KILN briefing deck** — export a filed mission as a `.kiln` file for presentation in [KILN](https://github.com/todaimori-jpg/kiln).
- **Progress** — rank, XP, streaks, skill profile by analytic dimension, filed history, area performance.
- **PWA** — installable, with a service worker caching the app shell for offline use. All workspace data stays in this browser (IndexedDB with a localStorage fallback).

## Commands

```bash
npm install
npm run dev          # Vite dev server on http://localhost:5173
npm run build        # typecheck + production build
npm run preview      # preview the production build on http://localhost:4173
npm run icons        # regenerate PWA icons into public/icons
```

## Configuration

Open **Settings**:

- Set a callsign.
- Choose adaptive or fixed tasking difficulty.
- Toggle live public-source scanning and page capture.
- Set an OpenAI-compatible base URL, model and API key to enable AI supervisor chat and written review reads. The key is stored locally and excluded from exports. Everything else works without a provider.
- Export/import the whole workspace as JSON, or reset the station.

Reference lookups use unauthenticated public endpoints and need a connection. The curated desk entries do not.

## Privacy

No account, no backend, no analytics. Missions, articles, highlights, notes, drafts and settings live in your browser unless you export them. When you configure an AI provider, chat and review text is sent directly to the base URL you choose. Fetching an article sends its URL to the publisher or your own capture proxy.
