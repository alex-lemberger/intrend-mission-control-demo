# inTrend Mission Control — öffentliche Demo

**Nur synthetische Daten.** Diese eigenständige Git-Historie enthält die öffentlichen statischen Dateien unter `site/` (zehn Dateien, siehe unten), den Pages-Workflow und diese Dokumentation. Die private Architekturablage und deren Git-Historie gehören **nicht** in dieses Repository. GitHub Pages ist öffentlich erreichbar, auch wenn das Repository privat sein sollte.

**Ziel:** `https://github.com/alex-lemberger/intrend-mission-control-demo`  
**Erwartete Pages-Adresse:** `https://alex-lemberger.github.io/intrend-mission-control-demo/`

## Lokale Vorschau

`site/index.html` im Browser öffnen (direkt von der Festplatte oder über einen beliebigen statischen Webserver). HTML, CSS und JavaScript verwenden relative Dateipfade. Die Anwendung hat keinen Backenddienst, keine Anmeldung und keinen Remote-Speicher. **Alle Eingaben, gespeicherten Baustellentage und Stundenzettel-Entwürfe liegen nur im Arbeitsspeicher des Browsers und sind nach dem Neuladen der Seite weg**; nichts wird zentral gespeichert oder übertragen, auch nicht im Browserspeicher (kein `localStorage`). Keine echten Personen-, Projekt- oder Vertragsdaten eingeben.

## Erstveröffentlichung — erst nach ausdrücklicher Freigabe

1. [Publikations-Checkliste](PUBLICATION-CHECKLIST.md) durchsehen und die `site/`-Dateien als öffentlich freigeben.
2. Im GitHub-Konto `alex-lemberger` ein **neues, leeres** Repository `intrend-mission-control-demo` anlegen. **Kein Import, Fork oder Mirror** von `intrend-architecture`; bei der Erstellung keine README/Lizenz hinzufügen. Die lokale Repo-Historie ist bereits separat initialisiert.
3. Aus diesem lokalen Verzeichnis (dem Ordner mit dieser README) nach Freigabe verbinden und pushen:

   ```sh
   git remote add origin https://github.com/alex-lemberger/intrend-mission-control-demo.git
   git push -u origin main
   ```

4. In GitHub **Settings → Pages → Build and deployment → Source: GitHub Actions** wählen. Falls Pages auf dem gewählten Repository-/Plan-Typ nicht verfügbar ist, die GitHub-Einstellung bzw. Berechtigung klären, bevor ein anderer Veröffentlichungsweg genutzt wird.
5. **Actions → Deploy public demo to GitHub Pages → Run workflow → main** manuell starten. Der Workflow prüft die exakte `site/`-Allowlist, lädt nur `site/` hoch und deployt mit der Umgebung `github-pages`.
6. Nach erfolgreichem Lauf die tatsächliche URL im Deploy-Job oder unter **Settings → Pages** ablesen. Die oben genannte URL ist das erwartete Format, keine bereits geprüfte Live-Adresse.

Der Workflow folgt dem [offiziellen GitHub-Pages-Ablauf für eigene GitHub-Actions-Workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Inhalt und Ablauf (Stand 2026-11-14)

**Ablauf in einer Anwendung:** „Baustellentag erfassen“ (AC-01, direkt über `#ac01`) → „Tag speichern → Mission Control“ → in Mission Control beim gespeicherten Tag „Stundenzettel erstellen“ → Einträge auswählen, Angaben ergänzen, prüfen, drucken bzw. als PDF sichern. Namen, Zeiten und Tätigkeiten werden einmal erfasst; der Stundenzettel liest den gespeicherten Tag nur und verändert ihn nicht. Der bisherige Bereich „Tagesbericht“ bleibt als eigenes, getrenntes Formular erhalten.

**Dateien unter `site/` (exakte Allowlist des Workflows):**

| Datei | Zweck |
|---|---|
| `index.html`, `styles.css`, `ac01.css` | Seite und Gestaltung |
| `app.js` | Navigation, Mission Control, bisheriges Tagesbericht-Formular |
| `ac01.js` | Oberfläche „Baustellentag erfassen“ |
| `workday-store.js` | gemeinsamer Speicher der Baustellentage — **nur im Arbeitsspeicher** |
| `timesheet-view.js` | Stundenzettel aus einem gespeicherten Baustellentag |
| `vendor/ac01-core.bundle.js`, `vendor/stundenzettel.bundle.js` | **erzeugte** Dateien (Fachlogik, Stundenzettel-Oberfläche) aus dem privaten Quellprojekt; nicht von Hand bearbeiten |
| `stundenzettel.html` | Kompatibilitätsseite für die frühere Adresse; erklärt den neuen Ablauf und leitet relativ zu `index.html#ac01` weiter |

Änderungen an `site/` auf `main` lösen den Pages-Workflow aus; ein manueller Start bleibt möglich. Der Workflow prüft die exakte Dateiliste, verbietet Netzwerkaufrufe, Browserspeicher und dynamischen Code, erlaubt keine absoluten URLs außer dem SVG-Namensraum der synthetischen Platzhalterbilder und verlangt die sichtbare Demo-Kennzeichnung und den Hinweis zum Neuladen.

**Stundenzettel:** nicht freigegebener Entwurf. Vorlage, Stundenberechnung (auch die sichtbare Annahme „leere Pause = 0 Min.“), Nummerierung, Unterschrift und Abrechnungsregeln sind nicht freigegeben; es gibt keinen Versand, keine Ablage und keine LV-, Nachtrags- oder Rechnungsfunktion. Fotos und Planausschnitte sind erzeugte synthetische Platzhalter.

## Öffentliche Demo beenden

Unter **Settings → Pages** die Veröffentlichung deaktivieren bzw. Quelle entfernen. Bei endgültiger Aufgabe das separate Demo-Repository unter **Settings → General → Danger Zone** löschen. Bereits kopierte Inhalte oder Suchmaschinen-Caches lassen sich dadurch nicht garantiert zurückholen; deshalb nur geprüfte synthetische Daten veröffentlichen.

## Technische Grenzen

Die Demo erzeugt nur HTML-Vorschauen und druckbare Entwürfe, keine versandfähigen Geschäftsdokumente. Projekte, Personen, Baustellentage, Ereignisse und Stundenzettel sind synthetisch und liegen nur im Arbeitsspeicher; nach dem Neuladen ist alles zurückgesetzt. Es gibt keine Analyse-, Tracking-, API-, SharePoint-, Graph-, WhatsApp- oder Copilot-Verbindung. Die bestehende private Anwendung und der Copilot Studio PoC bleiben unverändert.
