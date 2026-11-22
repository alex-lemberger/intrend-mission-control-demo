# Sicherheits- und Publikationscheckliste

## Bestätigte Veröffentlichung s60 (Leistungsverzeichnis mit erfundenem LV, im Browser gemerkt; Planer-Schaltflächen primär) — 2026-11-21, Release-Token `2026-11-21-s60`

- [x] Public static release committed as `72fd33f` and pushed normally to `origin/main` on the owner's instruction ("да давай это тоже запомним в браузере. и делаем публичное демо"). **Together with a deliberate, narrow change of the workflow rule** (the owner's decision of the same day): `site/vendor/lv.bundle.js` joins the allowlist (15 files), and `localStorage` is now allowed in THREE files (planner bundle, workday store, LV bundle). The new file may use only the key prefix `intrend-mc-demo:lv:v1:` (its stored key is `intrend-mc-demo:lv:v1:7001`) and must contain the warning "Bitte nur erfundene Daten eingeben". The workflow commit is `284638e`.
- [x] Changes: new view "Leistungsverzeichnis" (`site/index.html`, `site/app.js`, `site/icons.js`, `site/styles.css`, new `site/vendor/lv.bundle.js`) and a regenerated `site/vendor/planner.bundle.js` (every action button primary; the toggles, the task name, the stage strip and the toast keep their own look).
- [x] Contents (all synthetic): an INVENTED Leistungsverzeichnis (Kommission 7001 Muster A, fiktiv, 7 Positionen, 4 mit erfasstem Stand): tree with fold, Vertragsmenge and Leistungsstand (a quantity, the percentage only as display), Mehrmenge and Eventual as text, filters with counts, one slide-out dialog for entering, correcting and the history (entries are only appended, a correction is a new entry), a discard question when typed values would be lost, icon-only row buttons, high-contrast colours, 44 px touch targets. The state is kept in the viewer's own browser (nothing is sent) with a two-step "Beispiel zurücksetzen"; without usable browser storage it lives in memory and says so. A Leistungsstand triggers no invoice and no Nachtrag. No prices, no Aufmaß.
- [x] Workflow rule: the real package passes (replayed locally before the push, exit 0); allowlist, forbidden APIs (no network, no dynamic code, no other storage), localStorage only in the three files and only under the demo's own keys, URLs, name scan, demo labels.
- [x] Version gate: all thirteen referenced assets use `?v=2026-11-21-s60`.
- [x] Functional gate: `PAGES_SITE_DIR=../intrend-mission-control-demo/site node integration-tests.mjs` 56/56 against this exact package; private source: integration 55/55, ui-tests 62/62, store 21/21; SPFx 361/361, planner 33/33, ui-check 15/15, LV browser check 10/10, typecheck clean.
- [x] Live proof: Pages run `44927486868` (commit `72fd33f`) succeeded; SHA-256 of all 15 live files matches the local package; the release script's browser smoke on the public URL passed (token, saved day survives a reload, copy, two-step clear, breadcrumbs, Fallkette, no console errors).
- [ ] Still unverified, not blockers: the Leistungsverzeichnis view was NOT clicked through on the live URL itself (its bytes are identical to the package that passed 56/56 on a local server under the Pages path); Safari / real iPhone storage behaviour, two tabs of the same site, a real full or blocked storage, screen readers, a real touch gesture.
- Risk accepted by the owner (unchanged in kind): a viewer could type real data into the demo; it then stays in that viewer's own browser until reset (not sent anywhere). Mitigations: the warning in the view and in the footer, the two-step reset, own key prefix.

## Bestätigte Veröffentlichung s59 (gespeicherte Baustellentage im Browser, enge Workflow-Regel für eine weitere Datei) — 2026-11-21, Release-Token `2026-11-21-s59`

- [x] Public static release committed as `239dbdf` and pushed normally to `origin/main`, **together with a deliberate, narrow change of the workflow rule** (owner's decision of 2026-11-21, after the owner was told in writing that this widens the rule set on 2026-11-20): `localStorage` is now allowed ONLY in `site/vendor/planner.bundle.js` and `site/workday-store.js`, only under this demo's own keys (the workday store may use only `intrend-mc-demo:workdays:v1`), and only while `site/index.html` still contains "Keine echten Daten eingeben" and `site/app.js` contains "Bitte nur erfundene Daten eingeben". `sessionStorage`, IndexedDB, cookies and network calls stay forbidden. This supersedes the memory-only statement of s58 for saved days.
- [x] Changes: `site/workday-store.js` (same file as the private build: keeps saved days in this browser's local storage, shape-checked, falls back to memory when the browser blocks or fills the storage), `site/app.js` and `site/ac01.js` (notes and status line name the storage and ask for invented data only), `site/index.html` (token, demo note follows the storage mode), `.github/workflows/deploy.yml` (the rule above). Planner bundle, `ac01-core.bundle.js` and the Stundenzettel bundle unchanged (checked up to date).
- [x] Contents: saved Baustellentage stay on the viewer's own device (nothing is sent), with a two-step "Gespeicherte Tage löschen" (names the count, lapses by itself, announces the result) and the warning "Bitte nur erfundene Daten eingeben" in the footer, the editor status line and the demo note.
- [x] Workflow rule tested both ways before the push: the real package passes (exit 0); three deliberately broken copies fail (localStorage in another file, a different storage key in the workday store, the warning removed). Allowlist unchanged (14 files); the name/identifier/legal-wording scan, URL scan and demo labels pass.
- [x] Version gate: all twelve referenced assets use `?v=2026-11-21-s59`.
- [x] Functional gate: `PAGES_SITE_DIR=../intrend-mission-control-demo/site node integration-tests.mjs` 54/54 against this exact package; private source: integration 53/53, ui-tests 62/62, store 21/21; SPFx 245/245, planner browser check 33/33, Stundenzettel ui-check 15/15 (unchanged since s58).
- [x] Live proof: Pages run `44785269804` (commit `239dbdf`) succeeded (the real workflow accepted the new rule); SHA-256 of all 14 live files matches the local package.
- [x] Live browser smoke (headless Chrome, fresh profile, cache bypassed): token `s59`, `isPersistent()` true, a saved day wrote only the key `intrend-mc-demo:workdays:v1`, the footer says "Gespeichert nur in diesem Browser auf diesem Gerät, nichts wird gesendet. Bitte nur erfundene Daten eingeben", the day survived a real reload and reopened with its data and the path `Mission Control > Allee 17 > 13. November 2026`, the clear button asked "Ja, 1 Tag löschen", then removed the day and the key, announced it and moved the focus to "Baustellentag erfassen"; after another reload the list stayed empty; no page overflow, no console errors.
- [ ] Still unverified, not blockers: Safari / real iPhone storage behaviour, two tabs of the same site (last write wins per day), a real full or blocked storage in a browser, screen readers, a real touch gesture.
- Risk accepted by the owner: a viewer could type real data (for example employee names) into the demo; it then stays in that viewer's own browser until cleared (not sent anywhere). Mitigations: warnings in three places, a two-step clear button, synthetic-looking examples.

## Bestätigte Veröffentlichung s58 (Erfasste Tage als Tabelle, Kopie eines Tages, Brotkrümel, Fallkette im Planer) — 2026-11-21, Release-Token `2026-11-21-s58`

- [x] Public static release committed as `f83d549` and pushed normally to `origin/main` on the owner's instruction ("все пушим и обновляем демо"). **The workflow rules are unchanged.** In particular `localStorage` stays allowed ONLY inside `site/vendor/planner.bundle.js`: the private build keeps saved days in the browser's local storage, but the public `site/workday-store.js` is generated by `mission-control-integration/scripts/make-public-workday-store.mjs` WITHOUT any browser storage (in-memory only; checked up to date). Saved days in this public demo are therefore lost on reload, as before s58.
- [x] Changes: `site/ac01.js` (copy of a saved day as a new unsaved day), `site/app.js` (table rows, detail toggle, copy action, breadcrumbs, storage-mode notes), `site/icons.js`, `site/index.html` (token, breadcrumbs in the top bar, notes), `site/spacing.css`, `site/styles.css`, `site/workday-store.js` (generated, memory only), `site/vendor/planner.bundle.js` (generated with `--neutral-wording`; contains the Fallkette). `ac01-core.bundle.js` checked up to date (neutral, not changed); the Stundenzettel bundle is byte-identical to the private one.
- [x] Contents (all synthetic): "Erfasste Tage" as a table per project (collapsible detail row, row actions, time under the date, plain edit as the pencil alone); "Kopieren" opens a copy of a saved day as a NEW unsaved day (people, activities and day extras; events and photo names are not copied; date = today or the next free day); breadcrumbs in the top bar; in the planner each event card shows the Fallkette, nine stages as a read-only strip (it states no legal result and never says "sent").
- [x] Allowlist unchanged (14 files in `site/`); the workflow's check step replayed locally before the push (exit 0: allowlist, no network/dynamic code/other storage, the only `localStorage` file is the planner bundle, only the SVG namespace URL, name/identifier/legal-wording scan clean, demo labels present). The added lines were also read for internal references: none.
- [x] Version gate: all twelve referenced assets use `?v=2026-11-21-s58`.
- [x] Functional gate: `PAGES_SITE_DIR=../intrend-mission-control-demo/site node integration-tests.mjs` 53/53 against this exact package (2 storage scenarios skipped by design: they need browser storage, which this build does not use; one memory-only scenario runs instead); private source: integration 53/53 (1 skipped), ui-tests 62/62, store 21/21; SPFx 245/245, planner browser check 33/33, Stundenzettel ui-check 15/15, tsc clean.
- [x] Live proof: Pages run `44784081940` (commit `f83d549`) succeeded (prepare and deploy); SHA-256 of all 14 live files matches the local package.
- [x] Live browser smoke (headless Chrome, fresh profile, cache bypassed): token `s58`, `isPersistent()` false and the footer says "Nur im Arbeitsspeicher", no saved-day key in browser storage, table with 7 column headers and role `table`, detail row opens, edit is icon-only, copy opens an unsaved day with the message and without events, breadcrumbs `Mission Control > Baustellentag erfassen` and `Mission Control > Planer`, nine chain stages in the right order without the word "offen", no page overflow, no console errors.
- [ ] Still unverified, not blockers: VoiceOver / NVDA (table roles, chain, breadcrumbs), Safari / real iPhone, a real touch gesture, dark system scheme for the dashboard.
- Risk unchanged: a viewer could type real data into the demo. Saved days stay in memory only (gone on reload); the planner keeps its examples in the viewer's own browser (owner's decision of 2026-11-20).

## Bestätigte Veröffentlichung s57 (Planer: Beispielauswahl, Plan im Browser gemerkt mit Zurücksetzen, Ereignis-ID) — 2026-11-20, Release-Token `2026-11-20-s57`

- [x] Public static release committed as `5770420` and pushed normally to `origin/main`, **together with a deliberate, narrow change of the workflow rule** (owner's decision of 2026-11-20 so that a viewer can keep a worked-through example on their own device): `localStorage` is now allowed ONLY inside `site/vendor/planner.bundle.js`, only under the key prefix `intrend-mc-demo:`, and only while `site/index.html` still contains the warning "Keine echten Daten eingeben". `sessionStorage`, `indexedDB`, cookies, network calls and dynamic code stay forbidden in every published file. The replayed workflow step refused `localStorage` in `app.js`, `sessionStorage` and a missing warning (negative checks done locally).
- [x] Changes: `site/index.html` (token, example chooser, reset and clear buttons, planner footer wording), `site/app.js` (chooser, reset, two-step clear, storage-blocked fallback; no storage API used there), `site/styles.css`, `site/vendor/planner.bundle.js` (generated with `--neutral-wording`). The planner keeps one entry per example in the browser's local storage on the viewer's device; nothing is sent anywhere. The "Baustellentag erfassen", Stundenzettel and Mission Control views still keep everything in memory only and say so.
- [x] Contents: example chooser (Demo-Plan and the invented disruption case in three stages), automatic Ereignis-ID `EV-[Kostenstelle]-[YYYYMMDD]-[running]`, status line "in diesem Browser", "Beispiel zurücksetzen" and a two-step "Alle gespeicherten Pläne löschen", fallback to memory with a visible note when the browser blocks storage, a write refused by the browser is shown as an error. Warning "Bitte nur erfundene Daten eingeben" next to the buttons and "Keine echten Daten eingeben" in the footer.
- [x] Allowlist unchanged (14 files in `site/`); `ac01-core.bundle.js` rebuilt neutral to a scratch file and byte-identical, not copied; name/identifier/legal-wording scan clean; no real identifier in the examples (tested).
- [x] Version gate: all twelve referenced assets use `?v=2026-11-20-s57`.
- [x] Functional gate: `PAGES_SITE_DIR=../intrend-mission-control-demo/site node integration-tests.mjs` 48/48 against this exact package; private source: integration 47/47, ui-tests 62/62; SPFx 237/237, planner browser check 32/32, Stundenzettel ui-check 15/15, tsc clean.
- [x] Live proof: Pages run `44758609206` (commit `5770420`) succeeded (the real workflow accepted the new rule); SHA-256 of all 14 downloaded Pages files matches the local package.
- [x] Live browser smoke (headless Chrome, fresh profile, cache bypassed): token `s57`, four examples, reset and clear buttons and the footer warning present, status line "in diesem Browser", Fortdauer event `EV-7003-20270802-001`, "Wiederaufnahme heute" persisted across a reload, reset restored the example and removed its entry (`intrend-mc-demo:plan:v1:fortdauer`), no page overflow, no console errors.
- [ ] Still unverified, not blockers: Safari / real iPhone storage behaviour, two tabs of the same site (last write wins, no merge), a real full or blocked storage, screen readers, a real touch gesture.
- Risk accepted by the owner: a viewer could type real data into the demo; it then stays in that viewer's own browser until reset or cleared (not sent anywhere). Mitigations: explicit warnings, reset and clear buttons, synthetic-looking examples.

## Bestätigte Veröffentlichung s56 (Planer: Verschieben und Maßstab der Zeitachse, volle Breite, Entwurf mit Soll und Fortdauer) — 2026-11-20, Release-Token `2026-11-20-s56`

- [x] Public static release committed as `471d112` and pushed normally to `origin/main`. It changes `site/index.html` (token only), `site/styles.css`, `site/ac01.css`, `site/spacing.css` (all views use the full width, 32 px side padding) and `site/vendor/planner.bundle.js`: pan (swipe, Shift + wheel, drag on empty chart area), time scaling (Ctrl/Cmd + wheel, buttons, levels 2 / 5 / 8 / 13 / 26 weeks), keyboard region, header detail by column width; the letter draft of an event shows the Soll dates and "Fortdauer" until a resumption is recorded.
- [x] Allowlist unchanged (14 files in `site/`); `planner.bundle.js` generated with `--neutral-wording`; `ac01-core.bundle.js` rebuilt neutral to a scratch file and byte-identical to the published one, not copied; the invented disruption case (a local preview page and test fixture) is not in the bundle (checked: no hit).
- [x] Workflow rules replayed locally before the push (exact allowlist, no network/storage/dynamic code, only the SVG namespace URL, name/identifier/legal-wording scan: no hits, demo labels present).
- [x] Version gate: all twelve referenced assets use `?v=2026-11-20-s56`.
- [x] Functional gate: `PAGES_SITE_DIR=../intrend-mission-control-demo/site node integration-tests.mjs` 47/47 against this exact package; private source: integration 46/46, ui-tests 62/62; SPFx 208/208, planner browser check 31/31, Stundenzettel ui-check 15/15.
- [x] Live proof: Pages run `44749577965` (commit `471d112`) succeeded; SHA-256 of all 14 downloaded Pages files matches the local package.
- [x] Live browser smoke (headless Chrome on the public URL, shadow root of the planner): token `s56` present, chart region and zoom buttons present, five zoom presets, Ctrl + wheel gave 56 day columns, a horizontal wheel moved the window, no page overflow, no console errors.
- [ ] Still unverified, not blockers: a real touch gesture (touch drag-pan and a two-finger pinch are not implemented), a real trackpad (only synthesized wheel events), screen readers, real iPhone/Safari.

## Bestätigte Veröffentlichung s55 (Planer: Karten mit Fußleisten, Toast mit nächsten Schritten, Ereignis-Karten) — 2026-11-20, Release-Token `2026-11-20-s55`

- [x] Public static release committed as `42c4b8b` and pushed normally to `origin/main`. It changes `site/index.html` (token only) and `site/vendor/planner.bundle.js`: the planner page is grouped into five cards (Plan, Prüfung, Ereignisse, Zuordnungen, Wochenübersicht) in one column; buttons follow one rule (create in the footer of the card, row actions at the end of the row, event actions at the bottom of the event card); Ereignisse are one card per event and "Ereignis anlegen" chooses the Planvorgang in the panel; after creating or removing something a toast offers the next step or "Rückgängig" (a toast with undo has no timer; Ctrl/Cmd+Z and Escape work from anywhere; never undoes more than it announced); audit fixes (contrast, solid "doppelt" chip with a fill-free hatch, 44 px buttons on phones).
- [x] Allowlist unchanged (14 files in `site/`); `planner.bundle.js` generated with `--neutral-wording`; all other files untouched.
- [x] Workflow rules replayed locally before the push (exact allowlist, no network/storage/dynamic code, only the SVG namespace URL, name/identifier/legal-wording scan: no hits, `node --check` of all scripts); GitHub Pages workflow `44710667313` (head `42c4b8b`) succeeded.
- [x] Version gate: all twelve referenced assets use `?v=2026-11-20-s55`.
- [x] Functional gate: `PAGES_SITE_DIR=../intrend-mission-control-demo/site node integration-tests.mjs` 47/47 against this exact package; private source: integration 46/46, ui-tests 62/62, store 9/9, SPFx 192/192, planner browser check 29/29, Stundenzettel check 15/15.
- [x] Live proof: SHA-256 of all 14 downloaded Pages files matches the local package.
- [x] Live browser smoke (headless Chrome on the public URL, cache bypassed): five cards in the expected order, footer buttons present, one event card, creating a Planvorgang shows the toast with two next steps, removing a dependency shows "Rückgängig", Ctrl+Z restores it and closes the toast, no page overflow at 1280 px, no console errors. Not a full test run.
- [ ] Still unverified, not blockers: screen readers (the announced shortcut hint, the toast), a real touch gesture, real iPhone/Safari, the phone view of the cards judged by eye (automated checks only). The prototype is synthetic and memory-only; no SharePoint or operational approval.

## Bestätigte Veröffentlichung s54 (Planer: Soll-Balken direkt bedienbar) — 2026-11-19, Release-Token `2026-11-19-s54`

- [x] Public static release committed as `668719a` and pushed normally to `origin/main`. It changes `site/index.html` (token only) and `site/vendor/planner.bundle.js`: the Soll bar of a plan item is a button (click or Enter opens the edit panel); dragging moves it, dragging an edge changes the start or the end, in whole days, with a tip showing the new dates and the dependency arrows following; Escape cancels; a bar never leaves the visible window. Keyboard: arrows move one day, Shift one week, Alt changes the end, Alt+Shift the start, Ctrl/Cmd+Z undoes, Up/Down switches between bars (one Tab stop for all bars). A line above the chart offers "Rückgängig" and "OK" (the move is already kept in memory; OK only closes the line). A persistent polite live region announces moves, undo, cancel and refusals. On touch and narrow screens the bars get an invisible larger hit area and always visible edge marks. Successors, assignments, events and the Ist bars never move automatically. Fictional data, memory only.
- [x] Allowlist unchanged (14 files in `site/`); `planner.bundle.js` generated with `--neutral-wording`; all other files untouched.
- [x] Workflow rules replayed locally before the push (exact allowlist, no network/storage/dynamic code, only the SVG namespace URL, name/identifier/legal-wording scan: no hits, `node --check` of all scripts); GitHub Pages workflow `44604551184` (head `668719a`) succeeded.
- [x] Version gate: all twelve referenced assets use `?v=2026-11-19-s54`.
- [x] Functional gate: `PAGES_SITE_DIR=../intrend-mission-control-demo/site node integration-tests.mjs` 47/47 against this exact package; private source: integration 46/46, ui-tests 62/62, store 9/9, SPFx 192/192, planner browser check 26/26 (drag, edge stretch, Escape, keys, undo, live region, hit area), Stundenzettel check 15/15.
- [x] Live proof: SHA-256 of all 14 downloaded Pages files matches the local package.
- [x] Live browser smoke (headless Chrome on the public URL, cache bypassed, real mouse and key events): a click on a Soll bar opens the edit panel and Escape closes it; dragging by two days moves the bar and shows "Rückgängig" and "OK" and the live region text; Ctrl+Z restores the bar; ArrowRight moves one day; OK closes the line; exactly one bar is a Tab stop; the earlier planner smoke (letter draft in the panel, weekly overview, period selection) still passes; no console errors. Not a full test run on the live site.
- [ ] Still unverified, not blockers: a real touch gesture (horizontal scrolling of the chart when a swipe starts on a bar), screen readers (VoiceOver, NVDA: the live region and the key help), real iPhone/Safari. The prototype is synthetic and memory-only; no SharePoint or operational approval.

## Bestätigte Veröffentlichung s53 (Oberfläche: Fokusring, Schrift, Kontrast kleiner Beschriftungen, Aufklappzeilen) — 2026-11-19, Release-Token `2026-11-19-s53`

- [x] Public static release committed as `290e32c` and pushed normally to `origin/main`. It changes `site/index.html` (token only), `site/styles.css`, `site/ac01.css`, `site/spacing.css` and `site/vendor/stundenzettel.bundle.js`: the keyboard focus ring of the day-capture form reaches at least 3:1 contrast; the font stack no longer lists a font that is not shipped (same stack as the planner); small labels in the older form, the figures and metric labels use the muted text colour with sufficient contrast; disclosure rows of the older form reach 44 px on phones; the reduced-motion rule switches off transitions and smooth scrolling without a global animation kill; shared warning colours are defined once as tokens. Fictional data, memory only.
- [x] Allowlist unchanged (14 files in `site/`); `planner.bundle.js` and `ac01-core.bundle.js` unchanged (neutral wording, up to date); `stundenzettel.bundle.js` rebuilt from the same sources as the private build.
- [x] Workflow rules replayed locally before the push (exact allowlist, no network/storage/dynamic code, only the SVG namespace URL, name/identifier/legal-wording scan: no hits, `node --check` of all scripts); GitHub Pages workflow `44600999963` (head `290e32c`) succeeded.
- [x] Version gate: all twelve referenced assets use `?v=2026-11-19-s53`.
- [x] Functional gate: `PAGES_SITE_DIR=../intrend-mission-control-demo/site node integration-tests.mjs` 47/47 against this exact package; private source: integration 46/46, ui-tests 62/62, store 9/9, SPFx 190/190, Stundenzettel check 15/15.
- [x] Live proof: SHA-256 of all 14 downloaded Pages files matches the local package.
- [x] Live browser smoke (headless Chrome on the public URL, cache bypassed): "Planer" opens, the letter draft opens in the side panel and Escape closes it, the weekly overview does not scroll sideways, "2 Wochen" works, no console errors. Not a full test run on the live site; the new focus colour, the font and the disclosure rows were checked locally (rendered contrast and size measurement at 1280 and 390 px), not on the live site.
- [ ] Still unverified, not blockers: real iPhone/Safari, screen reader. The prototype is synthetic and memory-only; no SharePoint or operational approval.

## Bestätigte Veröffentlichung s52 (Planer: Briefentwurf in der Seitenleiste, Zugänglichkeit, Wochenübersicht in voller Breite) — 2026-11-19, Release-Token `2026-11-19-s52`

- [x] Public static release committed as `f8436fe` and pushed normally to `origin/main`. It changes `site/index.html` (token only), `site/vendor/planner.bundle.js` and `site/vendor/stundenzettel.bundle.js`: the letter draft of an event opens in the one side panel (view only: no form, nothing to discard, focus on the close button, Escape closes and returns the focus); keyboard focus ring with at least 3:1 contrast; the planner font stack no longer lists a font that is not shipped; readable text on filled buttons and event bars in the dark scheme; accessible names for the Soll, Ist and resource bars; larger touch targets on phones; the "today" line is drawn as its own line; the weekly overview (Personal / Objekte) uses the full width and wraps long entries instead of scrolling sideways; in the Stundenzettel the selection buttons keep a gap above the entry list. Fictional data, memory only.
- [x] Allowlist unchanged (14 files in `site/`); `ac01-core.bundle.js` untouched; `planner.bundle.js` generated with `--neutral-wording`; `stundenzettel.bundle.js` rebuilt from the same sources as the private build (it contains no neutral-wording variant).
- [x] Workflow rules replayed locally before the push (exact allowlist, no network/storage/dynamic code, only the SVG namespace URL, name/identifier/legal-wording scan: no hits, `node --check` of all scripts); GitHub Pages workflow `44598867839` (head `f8436fe`) succeeded.
- [x] Version gate: all twelve referenced assets use `?v=2026-11-19-s52`.
- [x] Functional gate: `PAGES_SITE_DIR=../intrend-mission-control-demo/site node integration-tests.mjs` 47/47 against this exact package; private source: integration 46/46, ui-tests 62/62, store 9/9, SPFx 190/190, planner browser check 25/25, Stundenzettel check 15/15.
- [x] Live proof: SHA-256 of all 14 downloaded Pages files matches the local package.
- [x] Live browser smoke (headless Chrome on the public URL, cache bypassed): "Planer" opens; the letter draft opens inside the side panel without a form, the focus is on the close button, Escape closes it; the weekly overview is wider than 700 px and does not scroll sideways in both views; "2 Wochen" still works; no console errors. Not a full test run on the live site. The Stundenzettel spacing was **not** checked on the live site (automated check and local screenshots only).
- [ ] Still unverified, not blockers: real iPhone/Safari (the larger touch targets were checked only with an emulated phone width), screen reader. The prototype is synthetic and memory-only; no SharePoint or operational approval.

## Bestätigte Veröffentlichung s51 (Planer: Zeitraumauswahl) — 2026-11-19, Release-Token `2026-11-19-s51`

- [x] Public static release committed as `7887cb5` and pushed normally to `origin/main`. It changes `site/index.html` (token only) and `site/vendor/planner.bundle.js`: a period selection above the chart (window of 2, 5 or 8 weeks, default 5; back, forward, today); the weekly overview follows the window; rows outside the window say so; the period is a view setting and changes no plan data. Fictional data, memory only.
- [x] Allowlist unchanged (14 files in `site/`); `planner.bundle.js` generated with `--neutral-wording`; all other files untouched.
- [x] Workflow rules replayed locally before the push (exact allowlist, no network/storage/dynamic code, only the SVG namespace URL, name/identifier/legal-wording scan: no hits, `node --check` of all scripts); GitHub Pages workflow `44561569941` (head `7887cb5`) succeeded.
- [x] Version gate: all twelve referenced assets use `?v=2026-11-19-s51`.
- [x] Functional gate: `PAGES_SITE_DIR=../intrend-mission-control-demo/site node integration-tests.mjs` 47/47 against this exact package; private source: integration 46/46, ui-tests 62/62, SPFx 190/190, planner browser check 24/24.
- [x] Live proof: SHA-256 of all 14 downloaded Pages files matches the local package.
- [x] Live browser smoke (headless Chrome on the public URL, cache bypassed): default window 16.11.–20.12.2026 (35 day columns); "2 Wochen" gives 14 columns and PV-003 is marked as outside the window; "Weiter" and "Heute" change the label as expected; back to "5 Wochen" gives 35 columns; the side panel still opens; no console errors. Not a full test run on the live site.
- [ ] Still unverified, not blockers: real iPhone/Safari, screen reader. The prototype is synthetic and memory-only; no SharePoint or operational approval.

## Bestätigte Veröffentlichung s50 (Planer: eine Seitenleiste für alle Bearbeitungen) — 2026-11-19, Release-Token `2026-11-19-s50`

- [x] Public static release committed as `dffb09b` and pushed normally to `origin/main`. It changes `site/index.html` (token only) and `site/vendor/planner.bundle.js`: all creating and editing (Planvorgang, Ressource, Zuordnung, Abhängigkeit, Ereignis, Einschätzung) uses the one side panel; closing a panel with typed values asks first; from a Planvorgang a Zuordnung or Abhängigkeit can be added and the panel returns; edits are saved through an in-memory repository with a status line; small layout polish and hand-drawn button icons. Fictional data, memory only.
- [x] Allowlist unchanged (14 files in `site/`); `ac01-core.bundle.js` and `stundenzettel.bundle.js` untouched; `planner.bundle.js` generated with `--neutral-wording`.
- [x] Workflow rules replayed locally before the push (exact allowlist, no network/storage/dynamic code, only the SVG namespace URL, name/identifier/legal-wording scan: no hits, `node --check` of all scripts); GitHub Pages workflow `44558263505` (head `dffb09b`) succeeded.
- [x] Version gate: all twelve referenced assets use `?v=2026-11-19-s50`.
- [x] Functional gate: `PAGES_SITE_DIR=../intrend-mission-control-demo/site node integration-tests.mjs` 47/47 against this exact package (the planner scenario was updated from the old inline forms to the panel); private source: integration 46/46, ui-tests 62/62, SPFx 186/186, planner browser check 23/23.
- [x] Live proof: SHA-256 of all 14 downloaded Pages files matches the local package.
- [x] Live browser smoke (headless Chrome on the public URL, cache bypassed): "Planer" opens with the three plan items; the create buttons carry icons; "Ressource anlegen" opens the panel (dialog, background inactive); closing with a typed value asks "Ungespeicherte Eingaben verwerfen?", "Verwerfen" closes it; no console errors. Not a full test run on the live site.
- [ ] Still unverified, not blockers: real iPhone/Safari, screen reader. Dark mode and phone width of the panels were checked locally (headless Chrome), not on the live site. The prototype is synthetic and memory-only; no SharePoint or operational approval.

## Bestätigte Veröffentlichung s49 (Planer: Bearbeiten im Slide-out-Panel) — 2026-11-18, Release-Token `2026-11-18-s49`

- [x] Public static release committed as `9442a1e` and pushed normally to `origin/main`. It changes `site/index.html` (token only) and `site/vendor/planner.bundle.js`: editing a plan item opens in a slide-out panel on the right (dialog, background inactive while open, focus moves in and back, Escape / click outside / cancel discard, a refused entry keeps the panel and the typed values). Fictional data, memory only.
- [x] Allowlist unchanged (14 files in `site/`); `ac01-core.bundle.js` and `stundenzettel.bundle.js` byte-identical to the published ones; `planner.bundle.js` generated with `--neutral-wording`.
- [x] Workflow rules replayed locally before the push (exact allowlist, no network/storage/dynamic code, only the SVG namespace URL, name/identifier/legal-wording scan: no hits); GitHub Pages workflow `44362335832` (head `9442a1e`) succeeded.
- [x] Version gate: all twelve referenced assets use `?v=2026-11-18-s49`.
- [x] Functional gate: `PAGES_SITE_DIR=../intrend-mission-control-demo/site node integration-tests.mjs` 47/47 against this exact package (private source: integration 46/46, ui-tests 62/62, SPFx 179/179, planner browser check 20/20).
- [x] Live proof: SHA-256 of all 14 downloaded Pages files matches the local package.
- [x] Live browser smoke (Chrome on the public URL, cache bypassed): "Planer" opens; "Bearbeiten" opens the panel on the right with the first field focused and Save/Cancel visible; Escape closes it and the focus returns to the button. Not a full test run on the live site.
- [ ] Still unverified, not blockers: real iPhone/Safari, screen reader, dark mode and phone width of the panel. The prototype is synthetic and memory-only; no SharePoint or operational approval.

## Bestätigte Veröffentlichung s48 (Planer: Plan bearbeiten, Unterbesetzung) — 2026-11-18, Release-Token `2026-11-18-s48`

- [x] Public static release committed as `4c4918c` and pushed normally to `origin/main`. It changes `site/index.html` (token only) and `site/vendor/planner.bundle.js`: create and edit a plan item (the plan key stays, nothing else is moved automatically), create resources, create and remove assignments, a staffing hint (wanted number of people versus planned people), form values kept after a refused entry, small layout fixes. Fictional data, memory only.
- [x] Allowlist unchanged (14 files in `site/`); `ac01-core.bundle.js` and `stundenzettel.bundle.js` rebuilt and byte-identical to the published ones; `planner.bundle.js` generated with `--neutral-wording`.
- [x] Workflow rules replayed locally before the push (exact allowlist, no network/storage/dynamic code, only the SVG namespace URL, name/identifier/legal-wording scan: no hits); GitHub Pages workflow `44360272088` (head `4c4918c`) succeeded.
- [x] Version gate: all twelve referenced assets use `?v=2026-11-18-s48`.
- [x] Functional gate: `PAGES_SITE_DIR=../intrend-mission-control-demo/site node integration-tests.mjs` 47/47 against this exact package (private source: integration 46/46, ui-tests 62/62, SPFx 179/179; the findings expectation of the planner test was updated from 2 to 3 for the new hint).
- [x] Live proof: SHA-256 of all 14 downloaded Pages files matches the local package.
- [x] Live browser smoke (Chrome on the public URL, cache bypassed): "Planer" opens with the new "Plan bearbeiten" section and three findings (double booking, staffing, dependency). Not a full test run on the live site.
- [ ] Still unverified, not blockers: real iPhone/Safari, screen reader. The prototype is synthetic and memory-only; this publication grants no SharePoint or operational approval and does not confirm the planner scope with the stakeholder. The staffing rule is a working draft.

## Bestätigte Veröffentlichung s47 (Planer: Objekte, Wochenende, Ereignis-Einschätzung, Entwurf) — 2026-11-18, Release-Token `2026-11-18-s47`

- [x] Public static release committed as `ec96884` and pushed normally to `origin/main`. It changes `site/index.html` (token only) and `site/vendor/planner.bundle.js`: object names with a four-digit cost-center number (fictional 7001/7002), weekend display, event assessment fields, a view-only draft letter from an event (neutral wording) and stronger contrast. Fictional data, memory only.
- [x] Allowlist unchanged (14 files in `site/`). `ac01-core.bundle.js` (built with `--neutral-wording`) and `stundenzettel.bundle.js` were rebuilt and are byte-identical to the published ones; `planner.bundle.js` is generated with `--neutral-wording`, not copied by hand.
- [x] Workflow rules replayed locally before the push (exact allowlist, no network/storage/dynamic code, only the SVG namespace URL, name/identifier/legal-wording scan: no hits); GitHub Pages workflow `44346285308` (head `ec96884`) succeeded.
- [x] Version gate: all twelve referenced assets use `?v=2026-11-18-s47`.
- [x] Functional gate: `PAGES_SITE_DIR=../intrend-mission-control-demo/site node integration-tests.mjs` 47/47 against this exact package (private source: integration 46/46, ui-tests 62/62, SPFx 161/161).
- [x] Live proof: SHA-256 of all 14 downloaded Pages files matches the local package.
- [x] Live browser smoke (Chrome on the public URL, cache bypassed): "Planer" opens, objects "7001/7002 … (fiktiv)", weekly view with the Personal/Objekte switch, the "Behinderungsanzeige-Entwurf" button opens a view-only draft with neutral example wording and open fields. Not a full test run on the live site.
- [ ] Still unverified, not blockers: real iPhone/Safari, screen reader. The prototype is synthetic and memory-only; this publication grants no SharePoint or operational approval and does not confirm the planner scope or the object concept with the stakeholder.

## Bestätigte Veröffentlichung s45 (Planer) — 2026-11-17, Release-Token `2026-11-17-s45`

- [x] Public static release committed as `a385deb` and pushed normally to `origin/main`. It adds the planner view (timeline, resources, dependencies, events from a plan task) as the navigation entry "Planer" with a phone-only button in the Mission Control footer. Fictional data, memory only.
- [x] Changed files: `site/index.html`, `site/app.js`, `site/icons.js`, `site/spacing.css`, new `site/vendor/planner.bundle.js`; the workflow allowlist gained that one file (14 files in `site/`).
- [x] GitHub Pages workflow `44150796496` (head `a385deb`) succeeded; `prepare` enforced the exact allowlist and the content scans (also replayed locally before the push).
- [x] `vendor/planner.bundle.js` is generated from the private sources by the bundler with its own safety scan (no network, no names, no external URLs); not copied by hand.
- [x] Version gate: all twelve referenced assets use `?v=2026-11-17-s45`.
- [x] Functional gate: `PAGES_SITE_DIR=../intrend-mission-control-demo/site node integration-tests.mjs` 47/47 against this exact package (private source: integration 46/46, ui-tests 62/62, SPFx 137/137).
- [x] Live proof: SHA-256 of all 14 downloaded Pages files matches the local package.
- [x] Live browser smoke (headless Chrome on the public URL, cache disabled): "Planer" opens, 3 plan tasks, 3 dependency arrows (1 broken, by design of the demo), 2 findings, an event created from a task appears on the axis, no console errors. Not a full test run on the live site.
- [ ] Still unverified, not blockers: real iPhone/Safari, screen reader. The prototype is synthetic and memory-only; this publication grants no SharePoint or operational approval and does not confirm the planner scope with the stakeholder.

## Bestätigte Veröffentlichung UX-01…UX-05 + Ereignis-Editor — 2026-11-16, Release-Token `2026-11-16-s35`

- [x] Public static release committed as `9ce1050` and pushed normally to `origin/main`; no history rewrite. It follows the UX-01…UX-05 release `fadbb20` and changes only the legacy event editor presentation.
- [x] GitHub Pages workflow [`43935655888`](https://github.com/alex-lemberger/intrend-mission-control-demo/actions/runs/43935655888) completed successfully: `prepare` enforced the exact allowlist and `deploy` completed.
- [x] Pages artifact is exactly 13 files: `site/index.html`, `site/styles.css`, `site/ac01.css`, `site/spacing.css`, `site/app.js`, `site/ac01.js`, `site/behinderung-view.js`, `site/icons.js`, `site/workday-store.js`, `site/timesheet-view.js`, `site/stundenzettel.html`, `site/vendor/ac01-core.bundle.js`, `site/vendor/stundenzettel.bundle.js`; no symlinks.
- [x] `vendor/ac01-core.bundle.js` is reproducibly generated with `--neutral-wording` (core build `sha256:a282e44452d2ba15`), never copied from the private bundle. The public wording scan found no VOB/template wording or private/tenant/project identifiers; generated bundle and static-code security scans passed.
- [x] Version and reference gate: all eleven referenced app assets use `?v=2026-11-16-s35`; JavaScript parses; all live referenced assets returned HTTP 200 after a no-cache Chrome reload.
- [x] Functional gate: `PAGES_SITE_DIR=../intrend-mission-control-demo/site node integration-tests.mjs` exited successfully, including UX-01…UX-05, Stundenzettel, Behinderungsanzeige, print isolation, and the unchanged legacy Tagesbericht flow.
- [x] Live proof: SHA-256 of every downloaded Pages file matches the approved local release package. DevTools smoke opened the public legacy editor, added an event, and confirmed that `Zusatzarbeit` hides the empty Hindernis detail while retaining description, effort, location, and photo controls.
- [ ] Not a release blocker, still unverified: real iPhone/Safari, dark mode, and screen-reader review. The prototype remains synthetic and memory-only; this publication grants no SharePoint or operational approval.

**Status:** Aktualisierung vom 2026-11-14 (integrierter Ablauf Baustellentag → Mission Control → Stundenzettel) vorbereitet und lokal geprüft; **Freigabe vor dem Push steht aus.** Pages-Inhalt sind genau die zehn unten genannten `site/`-Dateien.

## Inhalt (Stand 2026-11-14)

- [x] Pages-Artefakt = genau diese Dateien: `site/index.html`, `site/styles.css`, `site/ac01.css`, `site/app.js`, `site/ac01.js`, `site/workday-store.js`, `site/timesheet-view.js`, `site/vendor/ac01-core.bundle.js`, `site/vendor/stundenzettel.bundle.js`, `site/stundenzettel.html`.
- [x] Entfernt: die eigenständige Stundenzettel-Vorschau (`site/stundenzettel/` mit zehn Moduldateien und CSS) mit festen Beispieleinträgen. `site/stundenzettel.html` ist jetzt eine Kompatibilitätsseite: erklärt den neuen Ablauf, sichtbarer Link und Weiterleitung nach 5 s, beides relativ zu `index.html#ac01`.
- [x] Die `vendor/`-Dateien sind aus dem privaten Quellprojekt erzeugt (ohne Kommentare im Code, nur ein Kopfvermerk mit Inhalts-Hash); sie enthalten keine Quellunterlagen.
- [x] `.github/workflows/deploy.yml` lädt ausschließlich `site/` hoch und prüft: exakte Dateiliste, keine Symlinks, keine Netzwerkaufrufe (`fetch`, XHR, WebSocket, Beacon), kein Browserspeicher (`localStorage`, `sessionStorage`, IndexedDB, Cookies), kein `eval`/`new Function`, keine absoluten URLs außer dem SVG-Namensraum, sichtbare Kennzeichnung „DEMO / SYNTHETISCHE DATEN“ und der Hinweis „nach dem Neuladen der Seite ist alles weg“, Weiterleitung und Link der Kompatibilitätsseite.
- [x] README und Checkliste liegen außerhalb von `site/`; sie sind im Repository sichtbar, werden aber nicht als Pages-Artefakt hochgeladen.
- [x] Keine Excel-Datei, PDF, DOCX, Transkript, E-Mail, Aufnahme, Fotodatei, Zugangsdaten oder Architekturunterlage im Repository; keine private Git-Historie.

## Prüfung dieser Aktualisierung (2026-11-14, lokal)

- [x] Nur synthetische Daten: Beispielprojekte (`Hafenbogen · Bauteil B`, `Allee 17 · Innenausbau`, `Quartier West · Haus 3`), `Demo-Person NN`, Firmenpseudonyme („Alpha Monteur-n“) und die Beispielnamen des bisherigen Formulars; die Namen kommen in keiner Projektquelle vor. `inTrend` bleibt die einzige reale Unternehmensreferenz.
- [x] Speicherung nur im Arbeitsspeicher, sichtbar gekennzeichnet in Mission Control, im Stundenzettel und auf der Kompatibilitätsseite.
- [x] Durchsuchung des Pakets: keine Stakeholder-Namen, E-Mail-Adressen, Domains, Tenant-/SharePoint-Bezüge, internen Kennungen oder Zugangsdaten. Hinweis: Der interne Ordnername des Quellprojekts erscheint in Code-Kommentaren und im Kopfvermerk der erzeugten Dateien (nur der Name, kein Inhalt).
- [x] Browserprüfung mit lokalem Headless-Chrome gegen genau dieses Paket, ausgeliefert unter dem Pages-Pfad `/intrend-mission-control-demo/`: 23 von 23 Prüfungen bestanden: 20 Browserszenarien (u. a. Baustellentag → Speichern → Mission Control → Stundenzettel erstellen → PDF, 1440/1024/390 px, Kompatibilitätsseite mit Weiterleitung), 2 Prüfungen, dass die erzeugten Dateien zum Quellstand passen, und 1 Prüfung auf Laufzeit-/Konsolenfehler (keine).
- [x] Workflow-Prüfschritt lokal ausgeführt: besteht mit dem Paket; blockiert getestete Verstöße (zusätzliche Datei, `fetch`, externe URL, fehlende Kennzeichnung).
- [ ] Nicht geprüft: echtes iPhone/Safari und die tatsächliche Pages-Auslieferung nach dem Push.
- [ ] **Menschliche Freigabe dieser Aktualisierung vor dem Push.**

## Release-Kandidat UX Sprint 2 (2026-11-15, lokal vorbereitet, nicht veröffentlicht)

- [x] Geänderte Dateien (aus dem lokalen Integrationsstand `a4e7867`, byteidentisch): `site/index.html`, `site/styles.css`, `site/ac01.css`, `site/app.js`, `site/ac01.js`, `site/timesheet-view.js`, `site/vendor/stundenzettel.bundle.js`, `site/vendor/ac01-core.bundle.js`. Unverändert: `site/workday-store.js`, `site/stundenzettel.html`. Die Dateiliste des Workflows bleibt gleich (zehn Dateien); der Workflow wurde nicht geändert.
- [x] Inhalt: ruhige Validierung („Noch zu klären“, Widersprüche bleiben sichtbar), einheitliche Aktionsbezeichnungen, nächste Aktion am gespeicherten Tag, „Alle auswählen“ / „Auswahl aufheben“ im Stundenzettel. Keine neuen Geschäftsregeln, weiterhin nur synthetische Daten im Arbeitsspeicher.
- [x] Zwischenspeicher: `index.html` hängt allen acht lokalen Dateien dasselbe `?v=`-Token an; bei jeder Änderung einer Datei muss das Token in allen acht Verweisen erneuert werden (ein Integrationstest prüft die Einheitlichkeit). Zusätzlich zeigt `ac01.js` einen Neuladen-Hinweis, falls ein älteres Kernpaket mit neueren Dateien gemischt wird.
- [x] Lokal geprüft: Workflow-Prüfungen (gleichwertig, lokal ausgeführt), `node --check` aller JS-Dateien, 32/32 Integrationsprüfungen gegen genau dieses Paket unter `/intrend-mission-control-demo/`, Bundle-Aktualitätsprüfungen, Browser-Rauchtest unter dem Pages-Pfad, Übergang von zwischengespeicherten Sprint-1-Dateien (Server mit `max-age=600`).
- [ ] Nicht geprüft: tatsächliche Pages-Auslieferung nach dem Push, echtes iPhone/Safari. **Freigabe zum Push steht aus.**

## Aktualisierung 2026-11-16: mehrtägiger Stundenzettel, Behinderungsgründe, Behinderungsanzeige-Entwurf (neutrale Fassung)

- [x] Neue/geänderte Dateien aus dem lokalen Integrationsstand (Token `2026-11-16-s6`): `site/index.html`, `site/styles.css`, `site/ac01.css`, `site/app.js`, `site/ac01.js`, `site/timesheet-view.js`, `site/workday-store.js`, **neu `site/behinderung-view.js`**, `site/vendor/stundenzettel.bundle.js` (byteidentisch), `site/vendor/ac01-core.bundle.js` (**eigens mit neutralem Wortlaut gebaut**, nicht byteidentisch zum privaten Bündel). Das Artefakt umfasst jetzt **elf** Dateien; der Workflow wurde angepasst.
- [x] **Neutraler Briefwortlaut:** Der Behinderungsanzeige-Entwurf der öffentlichen Demo verwendet eigene, unabhängig formulierte Sätze (`Beispieltext`), nicht den Wortlaut einer Vorlage. Die Bedeutungen der sieben Umstände bleiben gleich. Kein Bündel enthält die privaten Vorlagenformulierungen (Stichproben: kein „Baufreiheit“, keine VOB-Paragrafen).
- [x] Kommentare in den veröffentlichten Quelldateien bereinigt: keine Personennamen, keine internen Kennungen (SC-/CB-/DEP-), keine Stakeholder-, Tenant- oder SharePoint-Bezüge. Der Workflow prüft das jetzt zusätzlich per Suchmuster und bricht bei Treffern ab.
- [x] Nur synthetische Daten: erfundene Beispielgründe (18 Einträge, `ST-nnn`), Beispielprojekte, `Demo-Person NN`. Der Katalog ist **nicht** die Liste des Unternehmens. Keine Rechtsprüfung, keine Rechtsberatung; der Brief ist ein Beispiel und wird nicht versendet.
- [x] Lokal geprüft: Workflow-Schritt „Enforce public site allowlist“ (inkl. neuer Suchmuster) besteht; `node --check` aller JS-Dateien; 33/33 Integrationsprüfungen gegen genau dieses Paket unter dem Pages-Pfad (inkl. Behinderungsanzeige-Dialog, Vorschläge, Druck).
- [x] Veröffentlicht am 2026-11-16 mit Commit `9a896ea`; Workflow-Lauf `43855300490` erfolgreich. Live geprüft: Inhalts-Hashes von `index.html`, `behinderung-view.js`, `vendor/ac01-core.bundle.js` und `app.js` stimmen mit dem lokalen Paket überein; im echten Browser öffnete sich der Behinderungsanzeige-Entwurf mit neutralem Wortlaut, ohne angekreuzte Umstände, mit sichtbarem Vorschlag und Entwurfsstempel; der Seitentext enthält keine Vorlagenformulierungen. Die Konsole wurde erst nach dem Laden beobachtet (kein belastbarer Fehlerbefund).
- [ ] Nicht geprüft: echtes iPhone/Safari.

## Aktualisierung 2026-11-16 (später): UI-Audit, Abstände, Kontraste, Fokus, korrigiertes Aufklappfeld

- [x] Geänderte Dateien (aus dem lokalen Integrationsstand, Token `2026-11-16-s15`): `site/index.html`, `site/styles.css`, `site/ac01.css`, `site/ac01.js`, `site/app.js`, `site/behinderung-view.js`, `site/vendor/stundenzettel.bundle.js` (byteidentisch); **neu `site/spacing.css`**; `site/vendor/ac01-core.bundle.js` weiterhin mit neutralem Wortlaut gebaut. Das Artefakt umfasst jetzt **zwölf** Dateien; der Workflow wurde angepasst.
- [x] Inhalt: Abstandsraster 4/8, Schrift mindestens 11/12 px, Kontrast sekundärer Texte mindestens 4,5:1 (gemessen: 0 Verstöße), sichtbarer Tastaturfokus an allen Bedienelementen, Rücksicht auf reduzierte Bewegung, korrigierte Liste der Behinderungsgründe (vorher in eine schmale Spalte gequetscht), Behinderungsanzeige-Dialog mit normalen Kontrollkästchen.
- [x] Lokal geprüft: Workflow-Schritt (Allowlist, Namens- und Kennungssuche) besteht; `node --check` aller JS-Dateien; 33/33 Integrationsprüfungen gegen genau dieses Paket unter dem Pages-Pfad; keine Vorlagenformulierungen in den Bündeln.
- [ ] Nicht geprüft: echtes iPhone/Safari, Dunkelmodus (die Demo ist nur hell).

## Aktualisierung 2026-11-16 (Nachtrag): kleine Korrekturen

- [x] Geänderte Dateien (Token `2026-11-16-s17`): `site/index.html`, `site/ac01.js` (kürzerer Platzhalter im Beschreibungsfeld der Ereignisse), `site/spacing.css` (Zeilenumbruch der Gründe-Pillen). Elf weitere Dateien unverändert; Workflow-Allowlist unverändert (zwölf Dateien).
- [x] Lokal geprüft: Workflow-Schritt besteht, `node --check` aller JS-Dateien, Integrationsprüfungen gegen das Paket unter dem Pages-Pfad (33/33; der bekannte, seltene 1024-px-Messfehler ist in `UI-AUDIT-2026-11-16.md` der privaten Ablage vermerkt).

## Aktualisierung 2026-11-16 (Abschluss der Auswahl)

- [x] Geänderte Dateien (Token `2026-11-16-s18`): `site/index.html`, `site/ac01.js`, `site/spacing.css`. Inhalt: Das Aufklappfeld „Grund/Foto“ hat jetzt eine feste Fußzeile mit Statuszeile („n Gründe gewählt“) und der Schaltfläche „Fertig“; „Alle abwählen“; Escape schließt das Feld. Workflow-Allowlist unverändert (zwölf Dateien).
- [x] Lokal geprüft: Workflow-Schritt besteht, `node --check`, Integrationsprüfungen gegen das Paket unter dem Pages-Pfad.

## Aktualisierung 2026-11-16 (Arbeitstabelle)

- [x] Geänderte Dateien (Token `2026-11-16-s19`): `site/index.html`, `site/spacing.css`. Inhalt: In der Arbeitstabelle richten sich alle Zellen oben aus; bei zwei oder mehr Orten wird die Ort-Zelle zu einem Stapel (Eingabe zuerst, Marken darunter), ein Ort bleibt in der Eingabezeile. Workflow-Allowlist unverändert (zwölf Dateien).
- [x] Lokal geprüft: Workflow-Schritt besteht, `node --check`, Integrationsprüfungen gegen das Paket unter dem Pages-Pfad.

## Prüfbefehle vor jeder Veröffentlichung

Im lokalen Demo-Repository:

```sh
find site -type f -print | LC_ALL=C sort
find site -type l -print
for f in site/*.js site/vendor/*.js; do node --check "$f"; done
git status --short
git remote -v
```

Erwartet: genau die zehn Dateien oben, keine Symlinks und gültiges JavaScript. Auch ein privates GitHub-Repository macht die Pages-Site nicht privat. Nutzer sollen keine echten Betriebsdaten in die öffentliche Demo eingeben.

## Historie (unverändert übernommen; durch den Stand oben ersetzt)

### Inhalt des separaten Repositories (2026-11-09)

- [x] `site/index.html`, `site/styles.css`, `site/app.js`, `site/ac01.css`, `site/ac01.js` sind die einzigen Dateien im Pages-Artefakt.
- [x] `.github/workflows/deploy.yml` lädt ausschließlich `site/` hoch und blockiert zusätzliche Dateien oder Symlinks in diesem Ordner.
- [x] README und Checkliste liegen außerhalb von `site/`; sie werden im Repository sichtbar, aber nicht als Pages-Artefakt hochgeladen.
- [x] Keine Excel-Datei, PDF, DOCX, Transkript, E-Mail, Aufnahme, Fotodatei, Zugangsdaten oder Architekturunterlage in diesem Repository.
- [x] Keine private Git-Historie, kein Remote und keine Verbindung zum Quellrepository übernommen.

### Inhaltliche und technische Prüfung (2026-11-09)

- [x] Beispielprojekte `Hafenbogen · Bauteil B`, `Allee 17 · Innenausbau`, `Quartier West · Haus 3`, Beispielpersonen und Ereignisse sind synthetische Demoangaben aus dem PoC.
- [x] `inTrend` ist die gewünschte Produktbezeichnung; sie ist die einzige reale Unternehmensreferenz im öffentlichen UI.
- [x] Die Demo weist sichtbar auf synthetische Daten und flüchtige Browser-Eingaben hin.
- [x] HTML lädt nur relative `styles.css` und `app.js`. JavaScript enthält keine Fetch-/XHR-/WebSocket-/Beacon-Aufrufe; CSS enthält keine Remote-Imports oder URL-Assets.
- [x] Fotodateien werden nicht gebündelt. Nutzergewählte Fotos bleiben eine lokale Browser-Vorschau per `blob:`-URL; sie werden nicht übertragen.
- [x] Änderungen an `site/` auf `main` lösen den Pages-Workflow aus; `workflow_dispatch` bleibt verfügbar.
- [x] `node --check` für `site/app.js` und `site/ac01.js` bestanden; alle HTML-Referenzen liegen relativ im gleichen Ordner und existieren.
- [ ] Browser-Smoke-Test **hier nicht möglich**: Chromium-Headless-Shell stoppt in der macOS-Sandbox mit `MachPortRendezvousServer ... Permission denied (1100)`. Vor Veröffentlichung auf einem normalen Desktop/Mobilbrowser prüfen, insbesondere Projekt-/Datumswechsel, Formular, Ereignisdetail und Entwurf unter dem Repository-Unterpfad.
- [x] **Menschliche Freigabe:** AC-01-UX für die öffentliche Stakeholder-Demo erteilt; nur synthetische statische Inhalte freigegeben.
- [x] Das separate GitHub-Repository und die bestehende Pages-URL werden für diese Aktualisierung wiederverwendet.

### Prüfbefehle (2026-11-09)

Im lokalen Demo-Repository:

```sh
find site -type f -print | sort
find site -type l -print
node --check site/app.js
node --check site/ac01.js
git status --short
git remote -v
```

Erwartet: genau fünf statische Dateien unter `site/`, keine Symlinks und gültiges JavaScript. Auch ein privates GitHub-Repository macht die Pages-Site nicht privat. Nutzer sollen keine echten Betriebsdaten in die öffentliche Demo eingeben.

### Ergänzung: Stundenzettel-Vorschau (2026-11-12; Dateien 2026-11-14 entfernt)

- [x] Zusätzliche Dateien: `site/stundenzettel.html`, `site/stundenzettel/stundenzettel.css` und neun JavaScript-Module unter `site/stundenzettel/`; der Workflow prüft die exakte Dateiliste, blockiert Symlinks und verbietet `fetch`/`XMLHttpRequest`/`WebSocket`/`sendBeacon` in diesen Dateien.
- [x] Die fünf AC-01-Dateien sind unverändert (gleiche SHA-256-Werte wie zuvor).
- [x] Nur synthetische Daten (`Demo-Person NN`, `Demo-Bauvorhaben Alpha`, erzeugte SVG-Platzhalter für Foto und Plan); keine Transkripte, Audio, Dokumente oder Zugangsdaten.
- [x] Sichtbar gekennzeichnet als synthetische Demodaten und als nicht freigegebener Entwurf; fehlende Angaben und die Annahme „leere Pause = 0 Min.“ bleiben sichtbar und werden im Ausdruck mit Fußnote gekennzeichnet.
- [x] Keine externen Aufrufe, kein Tracking; HTML, CSS und Module laden nur relative Dateien.
- [x] Browserprüfung (lokal gegen die statische Ausgabe) und Prüfung der öffentlichen Seite: siehe Commit-Beschreibung und Übergabebericht.

### Aktualisierung s41 (2026-11-17)

- [x] Geänderte Dateien: `site/ac01.js`, `site/ac01.css`, `site/behinderung-view.js`, `site/styles.css`, `site/spacing.css`, `site/index.html` (nur Release-Token), `site/vendor/ac01-core.bundle.js` (neutraler Wortlaut, neu gebaut). Dateiliste unverändert (13 Dateien).
- [x] Inhalt: Subunternehmer in der Personenauswahl standardmäßig eingeklappt; der Briefentwurf listet die gewählten Gründe zeilenweise statt der sieben Beispielpunkte mit Häkchen.
- [x] Lokal: Allowlist- und Namens-/Wortlaut-Prüfung des Workflows nachgestellt (sauber), `node --check` aller JS-Dateien, Integrationstest gegen das öffentliche Paket 41/41.
- [x] GitHub-Pages-Lauf `44059501897` erfolgreich; SHA-256 der veröffentlichten Dateien `index.html`, `ac01.js`, `ac01.css`, `styles.css`, `spacing.css`, `behinderung-view.js`, `vendor/ac01-core.bundle.js` stimmt mit `site/` überein; Release-Token `2026-11-17-s41` in allen 11 Verweisen.
- [ ] Browserprüfung der Live-Seite in dieser Sitzung **nicht** durchgeführt (nur Hash-Vergleich). Weiterhin synthetisch, nur im Speicher, keine echten Daten.

### Aktualisierung s42 (2026-11-17)

- [x] Geänderte Dateien: `site/spacing.css`, `site/styles.css`, `site/ac01.css`, `site/index.html` (nur Release-Token). Dateiliste unverändert (13 Dateien); JavaScript und neutraler Wortlaut unverändert.
- [x] Inhalt: höherer Kontrast beim sekundären Menüeintrag (Tagesbericht), kleiner Text von 11 auf 12 px, wo die Spaltenbreiten es zulassen; Spaltenköpfe, Kennzahlenleiste und mobile Kennzahlen bleiben bewusst bei 11 px.
- [x] Lokal: Allowlist-, URL-, Namens-/Wortlaut-Prüfung des Workflows nachgestellt (sauber), Integrationstest gegen das öffentliche Paket 41/41.
- [x] GitHub-Pages-Lauf `44061158046` (Commit `98a3ce4`) erfolgreich; SHA-256 von `index.html`, `spacing.css`, `styles.css`, `ac01.css`, `ac01.js`, `behinderung-view.js`, `vendor/ac01-core.bundle.js` stimmt mit `site/` überein; Release-Token `2026-11-17-s42` in allen 11 Verweisen.
- [ ] Browserprüfung der Live-Seite **nicht** durchgeführt (nur Hash-Vergleich). Weiterhin synthetisch, nur im Speicher, keine echten Daten.

### Aktualisierung s43 (2026-11-17)

- [x] Geänderte Dateien: `site/behinderung-view.js`, `site/styles.css`, `site/vendor/ac01-core.bundle.js` (neutraler Wortlaut, neu gebaut), `site/index.html` (nur Release-Token). Dateiliste unverändert (13 Dateien).
- [x] Inhalt: Der Briefentwurf der Behinderungsanzeige kann in zwei Fassungen angezeigt werden (formell / persönlich). Der Text der persönlichen Fassung ist ein eigener Platzhalter und im Dialog so gekennzeichnet; Gründe, Beschreibung, Fristen und Hinweise ändern sich dadurch nicht.
- [x] Lokal: Allowlist-, Aufruf-, URL-, Namens-/Wortlaut-Prüfung des Workflows nachgestellt (sauber; neutraler Bundle ohne Paragraphenverweise), `node --check` aller JS-Dateien, Integrationstest gegen das öffentliche Paket 42/42.
- [x] GitHub-Pages-Lauf `44108565520` (Commit `5397732`) erfolgreich; SHA-256 von `index.html`, `behinderung-view.js`, `styles.css`, `vendor/ac01-core.bundle.js`, `ac01.js`, `ac01.css`, `spacing.css` stimmt mit `site/` überein; Release-Token `2026-11-17-s43` in allen 11 Verweisen.
- [ ] Browserprüfung der Live-Seite **nicht** durchgeführt (nur Hash-Vergleich). Weiterhin synthetisch, nur im Speicher, keine echten Daten.

### Aktualisierung s44 (2026-11-17)

- [x] Geänderte Dateien: `site/ac01.js` und `site/index.html` (nur Release-Token). Dateiliste unverändert (13 Dateien); der neutrale Wortlaut-Bundle ist unverändert.
- [x] Inhalt: Im Ereignisfeld „Beschreibung“ steht jetzt ein kurzer Hinweis („Soll · Ist · Ursache · Folgen (kurz)“) mit erklärendem Tooltip. Das Feld bleibt optionaler Freitext, kein neues Pflichtfeld, keine Änderung am Layout.
- [x] Lokal: Allowlist-, Aufruf-, URL-, Namens-/Wortlaut-Prüfung des Workflows nachgestellt (sauber), `node --check` aller JS-Dateien, Integrationstest gegen das öffentliche Paket 43/43.
- [x] GitHub-Pages-Lauf `44124816250` (Commit `d55e496`) erfolgreich; SHA-256 von `index.html`, `ac01.js`, `ac01.css`, `styles.css`, `spacing.css`, `behinderung-view.js`, `vendor/ac01-core.bundle.js` stimmt mit `site/` überein; Release-Token `2026-11-17-s44` in allen 11 Verweisen.
- [ ] Browserprüfung der Live-Seite **nicht** durchgeführt (nur Hash-Vergleich). Weiterhin synthetisch, nur im Speicher, keine echten Daten.

### Aktualisierung s61 (2026-11-22)

- [x] Geänderte Dateien: `site/styles.css`, `site/ac01.css`, `site/spacing.css`, `site/index.html`, `site/app.js`, `site/ac01.js`, `site/timesheet-view.js`, `site/workday-store.js`, `site/vendor/ac01-core.bundle.js`, `site/vendor/lv.bundle.js`, `site/vendor/planner.bundle.js`, `site/vendor/stundenzettel.bundle.js` (alle mit neutralem Wortlaut gebaut). Dateiliste unverändert (15 Dateien).
- [x] Inhalt: einheitliche visuelle Sprache über alle Ansichten. Gemeinsame Gestaltungswerte; drei Schaltflächenstufen (primär, sekundär, Text) und die Symbolschaltfläche; ein Chip; ein Hinweisblock ohne Seitenstreifen; eine Karte und eine eingelassene Fläche; ein Eingabefeld mit deutlicherem Rahmen; ein Umschalter; ein gemeinsamer Seitenkopf ohne Großbuchstaben-Zeilen und ohne „Zurück“-Schaltflächen (die Brotkrumen übernehmen das). Keine neue Funktion. Regeln für das Kopieren eines Tages, den Brotkrumenpfad und die Prüfung gespeicherter Tage liegen im getesteten Kern statt in der Oberfläche; die Datumsprüfung weist jetzt auch erfundene Daten wie den 30. Februar zurück.
- [x] Lokal: Allowlist-, Aufruf-, localStorage-, URL-, Namens-/Wortlaut-Prüfung des Workflows nachgestellt (sauber), `node --check` aller JS-Dateien, SPFx-Unit-Tests 393/393, Planer 33/33, Stundenzettel 15/15, Store 21/21, UI-Tests 62/62, Integrationstest privat 56/56 und gegen das öffentliche Paket 57/57.
- [x] GitHub-Pages-Lauf `44965937948` (Commit `0c8c7a5`) erfolgreich; SHA-256 aller 15 Dateien stimmt mit `site/` überein; Release-Token `2026-11-22-s61` in allen 13 Verweisen.
- [x] Browserprüfung der Live-Seite (frisches Headless-Chrome-Profil): Token, gespeicherter Tag übersteht das Neuladen, Kopieren, zweistufiges Löschen, Brotkrumen, Fallkette, keine Konsolenfehler. Die Ansichten Planer und Leistungsverzeichnis wurden live nicht einzeln durchgeklickt (identische Bytes wie das lokal geprüfte Paket). Weiterhin synthetisch, Browser-Speicher nur unter den eigenen Schlüsseln der Demo, keine echten Daten.
