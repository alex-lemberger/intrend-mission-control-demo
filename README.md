# inTrend Mission Control — öffentliche Demo

**Nur synthetische Daten.** Diese eigenständige Git-Historie enthält die öffentlichen statischen Dateien unter `site/` (AC-01-Demo mit fünf Dateien und die Stundenzettel-Vorschau), den Pages-Workflow und diese Dokumentation. Die private Architekturablage und deren Git-Historie gehören **nicht** in dieses Repository. GitHub Pages ist öffentlich erreichbar, auch wenn das Repository privat sein sollte.

**Ziel:** `https://github.com/alex-lemberger/intrend-mission-control-demo`  
**Erwartete Pages-Adresse:** `https://alex-lemberger.github.io/intrend-mission-control-demo/`

## Lokale Vorschau

`site/index.html` im Browser öffnen. HTML, CSS und JavaScript verwenden relative Dateipfade. Die Anwendung hat keinen Backenddienst, keine Anmeldung und keinen Remote-Speicher. Eingaben und gewählte lokale Fotovorschauen bleiben nur im Browser bis zum Neuladen; keine Eingabe wird zentral gespeichert oder übertragen. Keine echten Personen-, Projekt- oder Vertragsdaten eingeben.

## Erstveröffentlichung — erst nach ausdrücklicher Freigabe

1. [Publikations-Checkliste](PUBLICATION-CHECKLIST.md) durchsehen und die drei `site/`-Dateien als öffentlich freigeben.
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

## AC-01-Aktualisierung

Die fünf freigegebenen Dateien unter `site/` sind `index.html`, `styles.css`, `app.js`, `ac01.css` und `ac01.js`. Die AC-01-Ansicht ist direkt über `#ac01` erreichbar. Änderungen an `site/` auf `main` lösen den Pages-Workflow aus; ein manueller Workflow-Start bleibt möglich. Die Allowlist blockiert zusätzliche Dateien unter `site/`. Der feste Demo-Parser ist keine KI-Verbindung, der Tagesbericht ein interner Entwurf ohne Versand.

## Stundenzettel-Vorschau (Stakeholder-Prototyp)

Zusätzliche Seite: `https://alex-lemberger.github.io/intrend-mission-control-demo/stundenzettel.html` (Datei `site/stundenzettel.html` plus `site/stundenzettel/`). Sie ist **nicht** mit dem AC-01-Zustand verbunden und verändert `index.html`, `ac01.*`, `app.js` und `styles.css` nicht. Einträge, Angaben und Anhänge sind synthetisch, bleiben nur im Browser und werden nicht übertragen. Der Stundenzettel ist ein **nicht freigegebener Entwurf**: Vorlage, Stundenberechnung (auch die Annahme bei leerer Pause) und Abrechnungsregeln sind nicht freigegeben; es gibt keinen Versand, keine Ablage und keine LV-/Rechnungsfunktion. Die Dateien unter `site/stundenzettel/` sind aus dem privaten Quellprojekt erzeugte, typbereinigte Browsermodule ohne Kommentare; sie werden nicht von Hand bearbeitet.

## Öffentliche Demo beenden

Unter **Settings → Pages** die Veröffentlichung deaktivieren bzw. Quelle entfernen. Bei endgültiger Aufgabe das separate Demo-Repository unter **Settings → General → Danger Zone** löschen. Bereits kopierte Inhalte oder Suchmaschinen-Caches lassen sich dadurch nicht garantiert zurückholen; deshalb nur geprüfte synthetische Daten veröffentlichen.

## Technische Grenzen

Die Demo erzeugt nur HTML-Vorschauen und keine versandfähigen Geschäftsdokumente. Projekt-/Datumsdaten, Tagesberichte und Ereignisse sind synthetisch und werden nach Neuladen zurückgesetzt. Es gibt keine Analyse-, Tracking-, API-, SharePoint-, Graph-, WhatsApp- oder Copilot-Verbindung. Die bestehende private Anwendung und der Copilot Studio PoC bleiben unverändert.
