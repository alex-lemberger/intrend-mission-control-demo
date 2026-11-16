# Sicherheits- und Publikationscheckliste

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
