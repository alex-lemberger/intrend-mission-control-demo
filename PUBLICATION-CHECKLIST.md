# Sicherheits- und Publikationscheckliste

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
