# Sicherheits- und Publikationscheckliste

**Status:** lokal vorbereitet; **keine Freigabe zur öffentlichen Bereitstellung erteilt**.

## Inhalt des separaten Repositories

- [x] `site/index.html`, `site/styles.css`, `site/app.js` sind die einzigen Dateien im Pages-Artefakt.
- [x] `.github/workflows/deploy.yml` lädt ausschließlich `site/` hoch und blockiert zusätzliche Dateien oder Symlinks in diesem Ordner.
- [x] README und Checkliste liegen außerhalb von `site/`; sie werden im Repository sichtbar, aber nicht als Pages-Artefakt hochgeladen.
- [x] Keine Excel-Datei, PDF, DOCX, Transkript, E-Mail, Aufnahme, Fotodatei, Zugangsdaten oder Architekturunterlage in diesem Repository.
- [x] Keine private Git-Historie, kein Remote und keine Verbindung zum Quellrepository übernommen.

## Inhaltliche und technische Prüfung

- [x] Beispielprojekte `Hafenbogen · Bauteil B`, `Allee 17 · Innenausbau`, `Quartier West · Haus 3`, Beispielpersonen und Ereignisse sind synthetische Demoangaben aus dem PoC.
- [x] `inTrend` ist die gewünschte Produktbezeichnung; sie ist die einzige reale Unternehmensreferenz im öffentlichen UI.
- [x] Die Demo weist sichtbar auf synthetische Daten und flüchtige Browser-Eingaben hin.
- [x] HTML lädt nur relative `styles.css` und `app.js`. JavaScript enthält keine Fetch-/XHR-/WebSocket-/Beacon-Aufrufe; CSS enthält keine Remote-Imports oder URL-Assets.
- [x] Fotodateien werden nicht gebündelt. Nutzergewählte Fotos bleiben eine lokale Browser-Vorschau per `blob:`-URL; sie werden nicht übertragen.
- [x] Keine automatischen Deploy-Trigger. Der erste Workflow-Lauf ist manuell.
- [x] `node --check site/app.js` bestanden; HTML-Referenzen `styles.css` und `app.js` liegen relativ im gleichen Ordner und existieren.
- [ ] Browser-Smoke-Test **hier nicht möglich**: Chromium-Headless-Shell stoppt in der macOS-Sandbox mit `MachPortRendezvousServer ... Permission denied (1100)`. Vor Veröffentlichung auf einem normalen Desktop/Mobilbrowser prüfen, insbesondere Projekt-/Datumswechsel, Formular, Ereignisdetail und Entwurf unter dem Repository-Unterpfad.
- [ ] **Menschliche Freigabe:** alle öffentlichen Repository-Dateien und das Pages-Artefakt final prüfen.
- [ ] **Menschliche Freigabe:** separates GitHub-Repository erstellen, pushen, Pages aktivieren und Workflow starten.

## Prüfbefehle vor jeder Veröffentlichung

Im lokalen Demo-Repository:

```sh
find site -type f -print | sort
find site -type l -print
node --check site/app.js
git status --short
git remote -v
```

Erwartet: genau drei statische Dateien unter `site/`, keine Symlinks, gültiges JavaScript und vor der Erstfreigabe **kein Remote**. Auch ein privates GitHub-Repository macht die Pages-Site nicht privat. Nutzer sollen keine echten Betriebsdaten in die öffentliche Demo eingeben.
