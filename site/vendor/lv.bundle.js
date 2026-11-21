/* GENERATED FILE - do not edit. Source: mission-control-spfx, content sha256:72e85aa157a6d491, preview/lv-app.js, src/core/ids.js, src/lv/leistungsstand.js, src/lv/use-cases.js, src/lv/demo-lv.js, src/lv/stored-lv-repository.js, src/lv/gaeb-export-import.js, src/lv/reimport-abgleich.js, src/lv/lv-repository.js, src/lv/in-memory-lv-repository.js.
 * Rebuild: node mission-control-spfx/scripts/build-classic-bundle.mjs --entry lv <this file>
 * Synthetic prototype. Templates, hours and checks are drafts, not approved rules. */
(function () {
  'use strict';
  const defs = {
"preview/lv-app.js": function (require, exports, module) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEMO_HEUTE = exports.DEMO_PROJEKT = exports.DEMO_KOMMISSION = exports.createStoredDemoLvRepository = exports.createDemoLvRepository = void 0;
exports.mountLv = mountLv;
const ids_ts_1 = require("../src/core/ids.js");
const leistungsstand_ts_1 = require("../src/lv/leistungsstand.js");
const use_cases_ts_1 = require("../src/lv/use-cases.js");
const demo_lv_ts_1 = require("../src/lv/demo-lv.js");
Object.defineProperty(exports, "createDemoLvRepository", { enumerable: true, get: function () { return demo_lv_ts_1.createDemoLvRepository; } });
Object.defineProperty(exports, "createStoredDemoLvRepository", { enumerable: true, get: function () { return demo_lv_ts_1.createStoredDemoLvRepository; } });
Object.defineProperty(exports, "DEMO_HEUTE", { enumerable: true, get: function () { return demo_lv_ts_1.DEMO_HEUTE; } });
Object.defineProperty(exports, "DEMO_KOMMISSION", { enumerable: true, get: function () { return demo_lv_ts_1.DEMO_KOMMISSION; } });
Object.defineProperty(exports, "DEMO_PROJEKT", { enumerable: true, get: function () { return demo_lv_ts_1.DEMO_PROJEKT; } });
const stored_lv_repository_ts_1 = require("../src/lv/stored-lv-repository.js");
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const num = (n) => n.toLocaleString('de-DE', { maximumFractionDigits: 3 });
const pct = (n) => `${(Math.round(n * 10) / 10).toLocaleString('de-DE')} %`;
const day = (iso) => (/^\d{4}-\d{2}-\d{2}/.test(iso) ? `${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}` : iso);
const parseMenge = (s) => (/^\s*\d+([.,]\d+)?\s*$/.test(s) ? Number(s.replace(',', '.')) : NaN);
const ICON_PATHS = {
    pencil: '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    'chevron-right': '<path d="m9 6 6 6-6 6"/>',
};
const icon = (name) => `<svg class="lv-ico" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICON_PATHS[name]}</svg>`;
function mountLv(root, options = {}) {
    root.classList.add('lv-app');
    root.classList.toggle('standalone', Boolean(options.heading));
    root.dataset.scheme = options.scheme ?? 'light';
    const kommission = options.kommission ?? demo_lv_ts_1.DEMO_KOMMISSION;
    const projekt = options.projekt ?? demo_lv_ts_1.DEMO_PROJEKT;
    const heute = options.heute ?? demo_lv_ts_1.DEMO_HEUTE;
    let repo = options.repository ?? null;
    let bestand = null;
    let loadError = '';
    let filter = 'alle';
    const collapsed = new Set();
    let panel = null;
    const defaultAuthor = options.erfasstDurch ?? 'Demo-Vorarbeiter';
    let draft = { stichtag: heute, menge: '', quelle: '', erfasstDurch: defaultAuthor, bemerkung: '' };
    const author = () => draft.erfasstDurch.trim() || defaultAuthor;
    let initial = { ...draft };
    let confirmDiscard = false;
    let panelEnter = false;
    let formError = '';
    let saved = '';
    let focusSel = '';
    let returnFocus = '';
    let destroyed = false;
    let persistent = null;
    let resetArmed = 0;
    const live = document.createElement('div');
    live.className = 'lv-live';
    live.setAttribute('role', 'status');
    live.setAttribute('aria-live', 'polite');
    let flip = false;
    const announce = (t) => { flip = !flip; live.textContent = t + (flip ? ' ' : ''); };
    const children = (parentId) => (bestand?.knoten ?? []).filter(k => k.parentId === parentId).sort((a, b) => a.reihenfolge - b.reihenfolge);
    const positions = () => (bestand?.knoten ?? []).filter(k => k.typ === 'position');
    const find = (id) => bestand?.knoten.find(k => k.id === id);
    const info = (p) => (0, leistungsstand_ts_1.leistungsstandAnzeige)(p, bestand.eintraege);
    const matches = (p) => {
        const a = info(p);
        return filter === 'alle' || (filter === 'mit' && a.menge !== null) || (filter === 'ohne' && a.menge === null) || (filter === 'mehr' && a.mehrmenge) || (filter === 'ev' && p.position?.positionsart === 'Eventual');
    };
    async function load() {
        try {
            if (!repo) {
                if (options.persist) {
                    const stored = await (0, demo_lv_ts_1.createStoredDemoLvRepository)();
                    persistent = stored.persistent;
                    repo = stored;
                }
                else
                    repo = await (0, demo_lv_ts_1.createDemoLvRepository)();
            }
            bestand = await repo.ladeBestand(kommission);
            loadError = bestand ? '' : `Für ${kommission} wurde noch kein Leistungsverzeichnis importiert.`;
        }
        catch (e) {
            loadError = `Das Leistungsverzeichnis konnte nicht geladen werden: ${e.message}`;
        }
    }
    function rowsFor(parentId, depth) {
        return children(parentId).map(k => {
            if (k.typ === 'vorbemerkung' || k.typ === 'hinweistext') {
                const text = k.langtext ? `${k.kurztext}: ${k.langtext}` : k.kurztext;
                return `<tr class="lv-note"><td></td><td colspan="5"><span class="sr-only">${k.typ === 'vorbemerkung' ? 'Vorbemerkung' : 'Hinweis'}: </span>${esc(text)}</td></tr>`;
            }
            if (k.typ === 'bereich' || k.typ === 'abschnitt') {
                const open = !collapsed.has(k.id);
                const below = descendants(k).filter(p => p.typ === 'position');
                const shown = below.filter(matches);
                if (filter !== 'alle' && shown.length === 0)
                    return '';
                const done = below.filter(p => info(p).menge !== null).length;
                return `<tr class="lv-group l${k.typ === 'bereich' ? 1 : 2}"><th scope="row" colspan="4"><button type="button" class="lv-toggle" data-toggle="${esc(k.id)}" aria-expanded="${open}"><span class="lv-chev">${icon(open ? 'chevron-down' : 'chevron-right')}</span><span class="lv-oz">${esc(k.oz)}</span> ${esc(k.kurztext)}</button></th><td colspan="2" class="lv-groupinfo">${pluralize(below.length, 'Position', 'Positionen')} · ${done} mit Leistungsstand</td></tr>${open ? rowsFor(k.id, depth + 1) : ''}`;
            }
            if (k.typ === 'position') {
                if (!matches(k))
                    return '';
                const a = info(k), p = k.position;
                const bar = a.prozent === null ? '' : `<span class="lv-bar" aria-hidden="true"><span class="${a.mehrmenge ? 'over' : ''}" style="width:${Math.min(100, a.prozent)}%"></span></span>`;
                const stand = a.menge === null
                    ? '<span class="lv-none">nicht erfasst</span>'
                    : `<strong>${num(a.menge)}</strong> ${esc(a.einheit)}<small>Stand ${day(a.stichtag)}</small>`;
                const chips = `${p.positionsart === 'Eventual' ? '<span class="lv-chip">Eventual</span>' : ''}${a.mehrmenge ? '<span class="lv-chip warn">Mehrmenge</span>' : ''}`;
                const label = `Leistungsstand ${a.menge === null ? 'erfassen' : 'bearbeiten'}, Position ${k.oz} ${k.kurztext}`;
                return `<tr class="lv-pos${panel?.positionId === k.id ? ' open' : ''}" data-pos="${esc(k.id)}"><th scope="row" class="lv-oz">${esc(k.oz)}</th>
          <td class="lv-text"><span class="lv-name">${esc(k.kurztext)}</span>${chips}<span class="lv-sub">Vertrag: ${num(p.vertragsmenge)} ${esc(p.einheit)}${a.prozent === null ? '' : ` · ${pct(a.prozent)}`}</span></td>
          <td class="lv-menge">${num(p.vertragsmenge)} ${esc(p.einheit)}</td>
          <td class="lv-stand">${stand}</td>
          <td class="lv-anz">${a.prozent === null ? '' : `${bar}<span class="lv-pct">${pct(a.prozent)}</span>`}</td>
          <td class="lv-act"><button type="button" class="lv-edit" data-open="${esc(k.id)}" title="${a.menge === null ? 'Leistungsstand erfassen' : 'Leistungsstand bearbeiten'}" aria-label="${esc(label)}">${icon(a.menge === null ? 'plus' : 'pencil')}</button></td></tr>`;
            }
            return '';
        }).join('');
    }
    function persistNote() {
        if (persistent === null)
            return '';
        return persistent
            ? '<p class="lv-foot">Der Stand dieses Beispiels wird nur in diesem Browser auf diesem Gerät gemerkt, es wird nichts gesendet. Bitte nur erfundene Daten eingeben.</p>'
            : '<p class="lv-foot">Der Browser-Speicher ist nicht verfügbar: nach dem Neuladen der Seite ist alles weg. Bitte nur erfundene Daten eingeben.</p>';
    }
    function disarmReset() { if (resetArmed)
        window.clearTimeout(resetArmed); resetArmed = 0; }
    function descendants(k) { return children(k.id).flatMap(c => [c, ...descendants(c)]); }
    const pluralize = (n, one, many) => `${n} ${n === 1 ? one : many}`;
    function panelHtml() {
        if (!panel)
            return '';
        const pos = find(panel.positionId);
        if (!pos?.position)
            return '';
        const a = info(pos);
        const history = [...(bestand.eintraege.filter(e => e.positionId === pos.id))].sort((x, y) => (x.stichtag === y.stichtag ? y.erfasstAm.localeCompare(x.erfasstAm) : y.stichtag.localeCompare(x.stichtag)));
        const effective = new Set((0, leistungsstand_ts_1.wirksameEintraege)(bestand.eintraege, pos.id).map(e => e.id));
        const current = (0, leistungsstand_ts_1.aktuellerLeistungsstand)(bestand.eintraege, pos.id);
        const byId = new Map(bestand.eintraege.map(e => [e.id, e]));
        const checks = currentChecks(pos);
        const hist = history.length === 0 ? '<p class="lv-note-p">Noch kein Eintrag. Der erste Eintrag legt den Verlauf an.</p>' : `<ol class="lv-hist">${history.map(e => {
            const superseded = !effective.has(e.id);
            const by = history.find(x => x.korrigiertEintragId === e.id);
            return `<li class="${superseded ? 'old' : ''}"><div><strong>${num(e.menge)} ${esc(pos.position.einheit)}</strong> <span>Stichtag ${day(e.stichtag)}</span>
        ${current?.id === e.id ? '<span class="lv-chip ok">aktuell</span>' : ''}${superseded ? `<span class="lv-chip">korrigiert${by ? ` durch den Eintrag vom ${day(by.erfasstAm)}` : ''}</span>` : ''}${e.korrigiertEintragId ? `<span class="lv-chip">Korrektur${byId.get(e.korrigiertEintragId) ? ` zu ${num(byId.get(e.korrigiertEintragId).menge)}` : ''}</span>` : ''}</div>
        <small>${esc(e.erfasstDurch)}, ${day(e.erfasstAm)} · ${esc(e.quelle || 'ohne Quelle')}${e.bemerkung ? ` · ${esc(e.bemerkung)}` : ''}</small>
        ${superseded ? '' : `<button type="button" class="lv-link" data-correct="${esc(e.id)}">Korrigieren</button>`}</li>`;
        }).join('')}</ol>`;
        return `<div class="lv-panel-wrap"><div class="lv-scrim" data-close="1"></div><aside class="lv-panel${panelEnter ? ' enter' : ''}" role="dialog" aria-modal="true" aria-labelledby="lv-ptitle" id="lv-panel">
      <div class="lv-phead"><h2 id="lv-ptitle">${panel.korrigiert ? 'Eintrag korrigieren' : a.menge === null ? 'Leistungsstand erfassen' : 'Leistungsstand bearbeiten'}</h2><button type="button" class="lv-btn lv-closebtn" data-close="1">${icon('x')}Schließen</button></div>
      ${confirmDiscard ? '<div class="lv-confirm" role="alert"><span>Die Eingaben gehen verloren. Verwerfen?</span><button type="button" class="lv-primary" data-discard="yes">Verwerfen</button><button type="button" class="lv-btn" data-discard="no">Weiter bearbeiten</button></div>' : ''}
      <p class="lv-pos-title"><span class="lv-oz">${esc(pos.oz)}</span> ${esc(pos.kurztext)}</p>
      <dl class="lv-facts"><div><dt>Vertragsmenge</dt><dd>${num(pos.position.vertragsmenge)} ${esc(pos.position.einheit)}</dd></div>
        <div><dt>Aktuell</dt><dd>${a.menge === null ? 'nicht erfasst' : `${num(a.menge)} ${esc(pos.position.einheit)} (${day(a.stichtag)})`}</dd></div></dl>
      ${panel.korrigiert ? `<p class="lv-note-p">Der Eintrag vom ${day(panel.korrigiert.stichtag)} (${num(panel.korrigiert.menge)} ${esc(pos.position.einheit)}) bleibt im Verlauf sichtbar. Die Korrektur ersetzt ihn nur als aktuellen Wert.</p>` : ''}
      <form id="lv-form" novalidate>
        <label>Stichtag<input type="date" id="lv-stichtag" value="${esc(draft.stichtag)}" required></label>
        <label>Menge ausgeführt, kumuliert (${esc(pos.position.einheit)})<input type="text" inputmode="decimal" id="lv-menge" value="${esc(draft.menge)}" autocomplete="off" required aria-describedby="lv-checks">
          <small>Bis zum Stichtag insgesamt ausgeführt, in ${esc(pos.position.einheit)}. Keine Prozentzahl.</small></label>
        <label>Quelle<input type="text" id="lv-quelle" list="lv-quellen" value="${esc(draft.quelle)}" autocomplete="off"><datalist id="lv-quellen"><option value="Baustellenrundgang"><option value="Aufmaß"><option value="Vorarbeiter"></datalist></label>
        <label>Erfasst durch<input type="text" id="lv-durch" value="${esc(draft.erfasstDurch)}" autocomplete="off" required></label>
        <label>Bemerkung<textarea id="lv-bem" rows="2">${esc(draft.bemerkung)}</textarea></label>
        <div id="lv-checks" class="lv-checks" aria-live="polite">${checks}</div>
        ${formError ? `<p class="lv-error" role="alert">${esc(formError)}</p>` : ''}
        <div class="lv-pbtn"><button type="submit" class="lv-primary">${panel.korrigiert ? 'Korrektur speichern' : 'Eintrag speichern'}</button><button type="button" class="lv-btn" data-close="1">Abbrechen</button></div>
      </form>
      <h3>Verlauf</h3>${hist}
      <p class="lv-note-p">Einträge werden nur ergänzt, nie überschrieben. Ein Leistungsstand löst nichts aus: keine Rechnung, keinen Nachtrag.</p>
    </aside></div>`;
    }
    function currentChecks(pos) {
        if (!panel || !bestand)
            return '';
        const menge = parseMenge(draft.menge);
        if (draft.menge.trim() === '')
            return '';
        if (Number.isNaN(menge))
            return '<p class="lv-error">Menge: bitte eine Zahl eingeben, z. B. 12,5.</p>';
        const { fehler, warnungen } = (0, leistungsstand_ts_1.pruefeEintrag)(pos, entwurf(pos.id, menge), bestand.eintraege, heute);
        return [...fehler.map(f => `<p class="lv-error">${esc(f)}.</p>`), ...warnungen.map(w => `<p class="lv-warn">Hinweis: ${esc(w.message)}. Das Speichern ist trotzdem möglich.</p>`)].join('');
    }
    const entwurf = (positionId, menge) => ({
        positionId, stichtag: draft.stichtag, menge, erfasstDurch: draft.erfasstDurch, erfasstAm: new Date().toISOString(), quelle: draft.quelle.trim(), bemerkung: draft.bemerkung.trim(),
        korrigiertEintragId: panel?.korrigiert?.id ?? null,
    });
    function render() {
        if (destroyed)
            return;
        const total = positions().length;
        const mit = bestand ? positions().filter(p => info(p).menge !== null).length : 0;
        const mehr = bestand ? positions().filter(p => info(p).mehrmenge).length : 0;
        const ev = positions().filter(p => p.position?.positionsart === 'Eventual').length;
        const imp = bestand?.imports.find(i => i.id === bestand.aktuellerImportId);
        const chip = (f, label, n) => `<button type="button" class="lv-seg" data-filter="${f}" aria-pressed="${filter === f}">${label} <span class="lv-count">${n}</span></button>`;
        root.innerHTML = `${options.heading ? `<h1>Leistungsverzeichnis</h1>` : ''}
      <p class="lv-lead">${esc(projekt)}. ${options.heading ? 'Das Original-LV bleibt unverändert; neben jeder Position steht, wie viel davon ausgeführt ist. ' : ''}Beispiel mit erfundenen Daten.</p>
      ${loadError ? `<p class="lv-error" role="alert">${esc(loadError)}</p>` : ''}
      ${bestand ? `<div class="lv-bar-tools"><div class="lv-segs" role="group" aria-label="Positionen filtern">${chip('alle', 'Alle', total)}${chip('mit', 'Mit Leistungsstand', mit)}${chip('ohne', 'Ohne', total - mit)}${chip('mehr', 'Mehrmenge', mehr)}${chip('ev', 'Eventual', ev)}</div>
        <div class="lv-all"><button type="button" class="lv-link" data-all="open">Alles aufklappen</button><button type="button" class="lv-link" data-all="close">Alles zuklappen</button>${persistent !== null && persistent ? `<button type="button" class="lv-link${resetArmed ? ' armed' : ''}" data-reset="1">${resetArmed ? 'Wirklich zurücksetzen? Nochmal klicken' : 'Beispiel zurücksetzen'}</button>` : ''}</div></div>
      ${saved ? `<p class="lv-saved" role="status">${esc(saved)}</p>` : ''}
      <div class="lv-layout"><div class="lv-scroll"><table class="lv-table"><caption class="sr-only">Leistungsverzeichnis mit Vertragsmenge und ausgeführter Menge je Position</caption>
        <thead><tr><th scope="col">OZ</th><th scope="col">Leistung</th><th scope="col">Vertragsmenge</th><th scope="col"><span class="lv-long">Leistungsstand</span><span class="lv-short" aria-hidden="true">Stand</span><span class="sr-only lv-sr-narrow">Leistungsstand</span></th><th scope="col">Anteil</th><th scope="col"><span class="sr-only">Aktion</span></th></tr></thead>
        <tbody>${rowsFor(children(null)[0]?.id ?? null, 0) || '<tr><td colspan="6" class="lv-empty">Keine Position entspricht dem Filter.</td></tr>'}</tbody></table></div></div>
      <p class="lv-foot">Quelle: ${esc(imp?.quelleDatei ?? '')}, ${imp ? `${imp.anzahlKnoten} Gliederungselemente, ${imp.anzahlPositionen} Positionen` : ''}. Erster Schnitt: Original-LV mit Hierarchie und Leistungsstand als Menge. Kein Aufmaß, keine Abrechnung, keine Preise.</p>${persistNote()}${panelHtml()}` : ''}`;
        root.append(live);
        for (const c of Array.from(root.children))
            c.inert = Boolean(panel) && !c.classList.contains('lv-panel-wrap') && c !== live;
        panelEnter = false;
        if (focusSel) {
            root.querySelector(focusSel)?.focus();
            focusSel = '';
        }
    }
    const onClick = async (e) => {
        const t = e.target;
        const toggle = t.closest('[data-toggle]');
        if (toggle) {
            const id = toggle.dataset.toggle;
            collapsed.has(id) ? collapsed.delete(id) : collapsed.add(id);
            focusSel = `[data-toggle="${id}"]`;
            render();
            return;
        }
        const all = t.closest('[data-all]');
        if (all) {
            collapsed.clear();
            if (all.dataset.all === 'close')
                for (const k of bestand?.knoten ?? [])
                    if (k.typ === 'bereich' || k.typ === 'abschnitt')
                        collapsed.add(k.id);
            render();
            return;
        }
        if (t.closest('[data-reset]')) {
            if (!resetArmed) {
                resetArmed = window.setTimeout(() => { resetArmed = 0; render(); }, 6000);
                focusSel = '[data-reset]';
                render();
                return;
            }
            disarmReset();
            (0, stored_lv_repository_ts_1.resetStoredLv)(kommission, (0, stored_lv_repository_ts_1.browserLvStore)());
            const fresh = await (0, demo_lv_ts_1.createStoredDemoLvRepository)();
            repo = fresh;
            persistent = fresh.persistent;
            bestand = await fresh.ladeBestand(kommission);
            panel = null;
            confirmDiscard = false;
            filter = 'alle';
            collapsed.clear();
            saved = 'Beispiel zurückgesetzt.';
            announce(saved);
            focusSel = '[data-reset]';
            render();
            return;
        }
        const f = t.closest('[data-filter]');
        if (f) {
            filter = f.dataset.filter;
            focusSel = `[data-filter="${filter}"]`;
            render();
            return;
        }
        const open = t.closest('[data-open]');
        if (open) {
            const pos = find(open.dataset.open);
            const cur = (0, leistungsstand_ts_1.aktuellerLeistungsstand)(bestand.eintraege, pos.id);
            panel = { positionId: pos.id, korrigiert: null };
            draft = { stichtag: heute, menge: cur ? String(cur.menge).replace('.', ',') : '', quelle: '', erfasstDurch: author(), bemerkung: '' };
            initial = { ...draft };
            confirmDiscard = false;
            panelEnter = true;
            formError = '';
            saved = '';
            returnFocus = `[data-open="${pos.id}"]`;
            focusSel = '#lv-menge';
            render();
            announce(`Fenster geöffnet: Position ${pos.oz}`);
            return;
        }
        const corr = t.closest('[data-correct]');
        if (corr && panel) {
            const old = bestand.eintraege.find(x => x.id === corr.dataset.correct);
            panel = { positionId: panel.positionId, korrigiert: old };
            draft = { stichtag: old.stichtag, menge: String(old.menge).replace('.', ','), quelle: old.quelle, erfasstDurch: author(), bemerkung: '' };
            initial = { ...draft };
            confirmDiscard = false;
            formError = '';
            focusSel = '#lv-menge';
            render();
            return;
        }
        const discard = t.closest('[data-discard]');
        if (discard) {
            if (discard.dataset.discard === 'yes')
                closePanel();
            else {
                confirmDiscard = false;
                focusSel = '#lv-menge';
                render();
            }
            return;
        }
        if (t.closest('[data-close]')) {
            requestClose();
            return;
        }
    };
    const isDirty = () => Object.keys(draft).some(k => draft[k] !== initial[k]);
    function requestClose() {
        if (isDirty() && !confirmDiscard) {
            confirmDiscard = true;
            focusSel = '[data-discard="no"]';
            render();
            return;
        }
        closePanel();
    }
    function closePanel() { panel = null; confirmDiscard = false; formError = ''; focusSel = returnFocus; render(); }
    const onInput = (e) => {
        if (!panel)
            return;
        const t = e.target;
        const map = { 'lv-stichtag': 'stichtag', 'lv-menge': 'menge', 'lv-quelle': 'quelle', 'lv-durch': 'erfasstDurch', 'lv-bem': 'bemerkung' };
        const key = map[t.id];
        if (!key)
            return;
        draft[key] = t.value;
        formError = '';
        confirmDiscard = false;
        const pos = find(panel.positionId);
        if (pos) {
            const box = root.querySelector('#lv-checks');
            if (box)
                box.innerHTML = currentChecks(pos);
        }
    };
    const onSubmit = async (e) => {
        if (e.target.id !== 'lv-form' || !panel || !repo || !bestand)
            return;
        e.preventDefault();
        const pos = find(panel.positionId);
        const menge = parseMenge(draft.menge);
        if (Number.isNaN(menge)) {
            formError = 'Bitte eine Menge als Zahl eingeben, z. B. 12,5.';
            focusSel = '#lv-menge';
            render();
            return;
        }
        try {
            const r = await (0, use_cases_ts_1.erfasseLeistungsstand)(repo, kommission, { id: (0, ids_ts_1.nextId)('ls'), ...entwurf(pos.id, menge) }, heute);
            bestand = await repo.ladeBestand(kommission);
            saved = `Gespeichert: ${num(menge)} ${pos.position.einheit} für ${pos.oz}${r.warnungen.length ? ` (${r.warnungen.map(w => w.code === 'ueber-vertragsmenge' ? 'Mehrmenge' : w.code === 'ruecklaeufig' ? 'Stand sinkt' : 'Stichtag in der Zukunft').join(', ')})` : ''}.`;
            announce(saved);
            panel = null;
            confirmDiscard = false;
            formError = '';
            focusSel = returnFocus;
            render();
        }
        catch (err) {
            formError = err instanceof leistungsstand_ts_1.LeistungsstandError ? err.fehler.join('; ') : `Speichern nicht möglich: ${err.message}`;
            focusSel = '#lv-menge';
            render();
        }
    };
    const onKey = (e) => { if (e.key === 'Escape' && panel) {
        e.preventDefault();
        requestClose();
    } };
    root.addEventListener('click', onClick);
    root.addEventListener('input', onInput);
    root.addEventListener('submit', onSubmit);
    root.addEventListener('keydown', onKey);
    root.innerHTML = '<p class="lv-lead">Leistungsverzeichnis wird geladen…</p>';
    void load().then(render);
    return {
        repository: () => repo,
        destroy() { destroyed = true; disarmReset(); root.removeEventListener('click', onClick); root.removeEventListener('input', onInput); root.removeEventListener('submit', onSubmit); root.removeEventListener('keydown', onKey); root.innerHTML = ''; },
    };
}

},
"src/core/ids.js": function (require, exports, module) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nextId = void 0;
const uuid = () => {
    const c = globalThis.crypto;
    if (typeof c?.randomUUID === 'function')
        return c.randomUUID();
    const b = c.getRandomValues(new Uint8Array(16));
    b[6] = (b[6] & 0x0f) | 0x40;
    b[8] = (b[8] & 0x3f) | 0x80;
    const h = [...b].map(x => x.toString(16).padStart(2, '0')).join('');
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
};
const nextId = (prefix) => `${prefix}-${uuid()}`;
exports.nextId = nextId;

},
"src/lv/leistungsstand.js": function (require, exports, module) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeistungsstandError = void 0;
exports.istIsoTag = istIsoTag;
exports.wirksameEintraege = wirksameEintraege;
exports.aktuellerLeistungsstand = aktuellerLeistungsstand;
exports.pruefeEintrag = pruefeEintrag;
exports.haengeEintragAn = haengeEintragAn;
exports.leistungsstandAnzeige = leistungsstandAnzeige;
const zahl = (n) => n.toLocaleString('de-DE', { maximumFractionDigits: 3 });
class LeistungsstandError extends Error {
    fehler;
    constructor(fehler) { super(`Leistungsstand abgelehnt: ${fehler.join('; ')}`); this.name = 'LeistungsstandError'; this.fehler = fehler; }
}
exports.LeistungsstandError = LeistungsstandError;
function istIsoTag(s) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (!m)
        return false;
    const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
    const date = new Date(Date.UTC(y, mo - 1, d));
    return date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d;
}
function wirksameEintraege(eintraege, positionId) {
    const own = eintraege.filter(e => e.positionId === positionId);
    const korrigiert = new Set(own.flatMap(e => (e.korrigiertEintragId ? [e.korrigiertEintragId] : [])));
    return own.filter(e => !korrigiert.has(e.id));
}
const compare = (a, b) => (a.stichtag < b.stichtag ? -1 : a.stichtag > b.stichtag ? 1 : a.erfasstAm < b.erfasstAm ? -1 : a.erfasstAm > b.erfasstAm ? 1 : 0);
function aktuellerLeistungsstand(eintraege, positionId) {
    let best = null;
    for (const e of wirksameEintraege(eintraege, positionId))
        if (best === null || compare(e, best) >= 0)
            best = e;
    return best;
}
function pruefeEintrag(position, neu, vorhanden, heute) {
    const fehler = [], warnungen = [];
    if (position.typ !== 'position' || !position.position) {
        fehler.push('Ein Leistungsstand gehört nur zu einer Position');
        return { fehler, warnungen };
    }
    if (neu.positionId !== position.id)
        fehler.push('Der Eintrag verweist auf eine andere Position');
    if (!istIsoTag(neu.stichtag))
        fehler.push('Stichtag ist kein gültiges Datum (JJJJ-MM-TT)');
    if (typeof neu.menge !== 'number' || !Number.isFinite(neu.menge) || neu.menge < 0)
        fehler.push('Menge muss eine Zahl von 0 an sein');
    if (neu.erfasstDurch.trim() === '')
        fehler.push('Es fehlt, wer den Stand erfasst hat');
    if (Number.isNaN(Date.parse(neu.erfasstAm)))
        fehler.push('Zeitpunkt der Erfassung ist ungültig');
    if (neu.korrigiertEintragId !== null && !vorhanden.some(e => e.id === neu.korrigiertEintragId && e.positionId === position.id)) {
        fehler.push('Der korrigierte Eintrag gehört nicht zu dieser Position oder ist unbekannt');
    }
    if (fehler.length)
        return { fehler, warnungen };
    const einheit = position.position.einheit;
    if (neu.menge > position.position.vertragsmenge) {
        warnungen.push({ code: 'ueber-vertragsmenge', message: `Mehrmenge: ${zahl(neu.menge)} ${einheit} bei einer Vertragsmenge von ${zahl(position.position.vertragsmenge)} ${einheit}` });
    }
    if (istIsoTag(heute) && neu.stichtag > heute)
        warnungen.push({ code: 'stichtag-in-zukunft', message: `Stichtag ${neu.stichtag} liegt nach heute (${heute})` });
    const davor = wirksameEintraege(vorhanden, position.id)
        .filter(e => e.id !== neu.korrigiertEintragId && e.stichtag <= neu.stichtag)
        .sort(compare).at(-1);
    if (davor && neu.menge < davor.menge) {
        warnungen.push({ code: 'ruecklaeufig', message: `Der kumulierte Stand sinkt von ${zahl(davor.menge)} (${davor.stichtag}) auf ${zahl(neu.menge)} ${einheit}` });
    }
    return { fehler, warnungen };
}
function haengeEintragAn(position, vorhanden, eintrag, heute) {
    if (vorhanden.some(e => e.id === eintrag.id))
        throw new LeistungsstandError(['Die Eintrag-ID gibt es schon']);
    const { id: _id, ...entwurf } = eintrag;
    const { fehler, warnungen } = pruefeEintrag(position, entwurf, vorhanden, heute);
    if (fehler.length)
        throw new LeistungsstandError(fehler);
    return { eintraege: [...vorhanden, { ...eintrag }], warnungen };
}
function leistungsstandAnzeige(position, eintraege) {
    if (position.typ !== 'position' || !position.position)
        throw new RangeError('Nur eine Position hat einen Leistungsstand');
    const aktuell = aktuellerLeistungsstand(eintraege, position.id);
    const vm = position.position.vertragsmenge;
    return {
        menge: aktuell?.menge ?? null, stichtag: aktuell?.stichtag ?? null, einheit: position.position.einheit, vertragsmenge: vm,
        prozent: aktuell && vm > 0 ? (aktuell.menge / vm) * 100 : null, mehrmenge: aktuell !== null && aktuell.menge > vm,
    };
}

},
"src/lv/use-cases.js": function (require, exports, module) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importiereLv = importiereLv;
exports.erfasseLeistungsstand = erfasseLeistungsstand;
const ids_ts_1 = require("../core/ids.js");
const gaeb_export_import_ts_1 = require("./gaeb-export-import.js");
const reimport_abgleich_ts_1 = require("./reimport-abgleich.js");
const leistungsstand_ts_1 = require("./leistungsstand.js");
const lv_repository_ts_1 = require("./lv-repository.js");
const key = (k) => `${k.typ}:${k.oz}`;
async function importiereLv(repo, a) {
    const nein = (grund, issues = [], meldungen = []) => ({ gespeichert: false, grund, issues, meldungen });
    if (!(0, lv_repository_ts_1.istKommission)(a.kommission))
        throw new lv_repository_ts_1.LvRepositoryError('kommission-ungueltig', `"${a.kommission}" ist keine vierstellige KOM-Nr.`);
    const newId = a.newId ?? (() => (0, ids_ts_1.nextId)('lk'));
    const imp = (0, gaeb_export_import_ts_1.importGaebExport)(a.rows, { newId });
    if (imp.issues.some(i => i.severity === 'error'))
        return nein('fehler', imp.issues);
    const bestand = await repo.ladeBestand(a.kommission);
    let knoten = imp.knoten;
    let meldungen = [];
    if (bestand) {
        const aktuell = new Set(bestand.knoten.map(key));
        const alt = [...bestand.knoten, ...bestand.entfallene.filter(k => !aktuell.has(key(k)))];
        const schonEntfallen = new Set(bestand.entfallene.filter(k => !aktuell.has(key(k))).map(key));
        const r = (0, reimport_abgleich_ts_1.gleicheReimportAb)(alt, imp.knoten, { newId, bestaetigteUmnummerierungen: a.bestaetigteUmnummerierungen });
        knoten = r.knoten;
        meldungen = r.meldungen.filter(m => !((m.code === 'position-entfallen' && schonEntfallen.has(`position:${m.oz}`)) ||
            (m.code === 'knoten-entfallen' && (schonEntfallen.has(`bereich:${m.oz}`) || schonEntfallen.has(`abschnitt:${m.oz}`)))));
    }
    if (meldungen.some(m => m.severity === 'error'))
        return nein('fehler', imp.issues, meldungen);
    if ((imp.issues.length > 0 || meldungen.length > 0) && !a.warnungenAkzeptiert)
        return nein('warnungen', imp.issues, meldungen);
    const meta = {
        id: (a.newImportId ?? (() => (0, ids_ts_1.nextId)('li')))(), kommission: a.kommission, quelleDatei: a.quelleDatei, sha256: a.sha256, importiertAm: a.jetzt,
        art: imp.stats.positionenMitEp > 0 ? 'mit-preis' : 'ohne-preis', anzahlKnoten: knoten.length, anzahlPositionen: imp.stats.byTyp.position,
    };
    try {
        await repo.speichereImport(meta, knoten, bestand?.aktuellerImportId ?? null);
    }
    catch (e) {
        if (e instanceof lv_repository_ts_1.LvRepositoryError && (e.code === 'import-doppelt' || e.code === 'vorgaenger-geaendert'))
            return nein(e.code, imp.issues, meldungen);
        throw e;
    }
    return { gespeichert: true, importId: meta.id, issues: imp.issues, meldungen };
}
async function erfasseLeistungsstand(repo, kommission, eintrag, heute) {
    const bestand = await repo.ladeBestand(kommission);
    if (!bestand)
        throw new lv_repository_ts_1.LvRepositoryError('kommission-unbekannt', `Für ${kommission} gibt es noch keinen Import`);
    const position = bestand.knoten.find(k => k.id === eintrag.positionId);
    if (!position) {
        const gone = bestand.entfallene.some(k => k.id === eintrag.positionId);
        throw new leistungsstand_ts_1.LeistungsstandError([gone ? 'Die Position kommt im aktuellen Import nicht mehr vor' : 'Die Position ist unbekannt']);
    }
    const { id: _id, ...entwurf } = eintrag;
    const { fehler, warnungen } = (0, leistungsstand_ts_1.pruefeEintrag)(position, entwurf, bestand.eintraege, heute);
    if (fehler.length)
        throw new leistungsstand_ts_1.LeistungsstandError(fehler);
    await repo.haengeLeistungsstandAn(kommission, eintrag);
    return { warnungen };
}

},
"src/lv/demo-lv.js": function (require, exports, module) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEMO_HEUTE = exports.DEMO_PROJEKT = exports.DEMO_KOMMISSION = void 0;
exports.demoLvRows = demoLvRows;
exports.seedDemoLv = seedDemoLv;
exports.createDemoLvRepository = createDemoLvRepository;
exports.createStoredDemoLvRepository = createStoredDemoLvRepository;
const use_cases_ts_1 = require("./use-cases.js");
const use_cases_ts_2 = require("./use-cases.js");
const in_memory_lv_repository_ts_1 = require("./in-memory-lv-repository.js");
const stored_lv_repository_ts_1 = require("./stored-lv-repository.js");
exports.DEMO_KOMMISSION = '7001';
exports.DEMO_PROJEKT = '7001 Muster A (fiktiv)';
exports.DEMO_HEUTE = '2026-11-19';
const HEADER = ['Gliederung', 'Positionsart', 'StLb- Nr.', 'Nr.', 'Bez.', 'Langtext', 'Kommentar', 'Menge', 'Einheit', 'EP', 'Gesamtpreis', 'Nachlass', 'Nachlassart', 'GP nach Nachlass'];
const row = ([g, art, nr, bez, lang, menge, einheit]) => [g, art || null, null, nr || null, bez || null, lang || null, null, menge, einheit || null, null, null, null, null, null];
function demoLvRows() {
    const rows = [
        ['LV', '', 'MUSTER_LV_01', 'Muster-Leistungsverzeichnis Innenausbau (erfunden)', '', null, ''],
        ['Vorbemerkung', '', '', 'Vorbemerkung zu allen Leistungen (erfunden)', 'Nur ein Beispieltext. Alle Mengen und Texte sind erfunden.', null, ''],
        ['Bereich', '', '1.', 'Trockenbau', '', null, ''],
        ['Abschnitt', '', '1.1.', 'Wände', '', null, ''],
        ['Position', '', '1.1.10.', 'Metallständerwand einfach beplankt', 'Beispieltext: Ständerwand mit einlagiger Beplankung je Seite.', 120, 'm2'],
        ['Position', '', '1.1.20.', 'Metallständerwand doppelt beplankt', 'Beispieltext: Ständerwand mit zweilagiger Beplankung je Seite.', 80, 'm²'],
        ['Hinweistext', '', '', 'Hinweis: Anschlüsse an angrenzende Bauteile sind in den Einheitspreisen enthalten (erfunden).', '', null, ''],
        ['Position', 'Eventualposition', '1.1.30.', 'Zusätzliche Aussteifung nach Bedarf', 'Beispieltext: Nur auf Anweisung auszuführen.', 6, 'Stk.'],
        ['S. Abschnitt', '', '1.1.', 'Summe Wände', '', null, ''],
        ['Abschnitt', '', '1.2.', 'Decken', '', null, ''],
        ['Position', '', '1.2.10.', 'Abgehängte Decke, glatt', 'Beispieltext: Abgehängte Decke mit Gipskartonplatten.', 215.5, 'm²'],
        ['Position', '', '1.2.20.', 'Deckenrandprofil liefern und montieren', 'Beispieltext.', 96, 'lm'],
        ['S. Abschnitt', '', '1.2.', 'Summe Decken', '', null, ''],
        ['S. Bereich', '', '1.', 'Summe Trockenbau', '', null, ''],
        ['Bereich', '', '2.', 'Pauschalen und Stundenlohn', '', null, ''],
        ['Abschnitt', '', '2.1.', 'Baustelle', '', null, ''],
        ['Position', '', '2.1.10.', 'Baustelleneinrichtung pauschal', 'Beispieltext: Einrichten, Vorhalten und Räumen.', 1, 'psch'],
        ['Position', '', '2.1.20.', 'Stundenlohn Facharbeiter', 'Beispieltext: Nach Anweisung, mit Stundennachweis.', 40, 'Std'],
        ['S. Abschnitt', '', '2.1.', 'Summe Baustelle', '', null, ''],
        ['S. Bereich', '', '2.', 'Summe Pauschalen und Stundenlohn', '', null, ''],
        ['S. LV', '', 'MUSTER_LV_01', 'Summe Muster-LV', '', null, ''],
    ];
    return [HEADER, ...rows.map(row)];
}
async function seedDemoLv(repo) {
    let n = 0;
    const imp = await (0, use_cases_ts_1.importiereLv)(repo, {
        kommission: exports.DEMO_KOMMISSION, rows: demoLvRows(), quelleDatei: 'muster-lv-export.xlsx (erfunden)', sha256: 'demo'.padEnd(64, '0'), jetzt: '2026-11-02T08:00:00Z',
        newId: () => `lk-demo-${++n}`, newImportId: () => 'li-demo-1',
    });
    if (!imp.gespeichert)
        throw new Error('Das Demo-LV konnte nicht importiert werden');
    const b = (await repo.ladeBestand(exports.DEMO_KOMMISSION));
    const id = (oz) => b.knoten.find(k => k.oz === oz).id;
    const e = (nr, oz, stichtag, menge, quelle, extra = {}) => ({
        id: `ls-demo-${nr}`, positionId: id(oz), stichtag, menge, erfasstDurch: 'Demo-Vorarbeiter', erfasstAm: `${stichtag}T16:00:00Z`, quelle, bemerkung: '', korrigiertEintragId: null, ...extra,
    });
    const entries = [
        e(1, '1.1.10.', '2026-11-05', 40, 'Baustellenrundgang'),
        e(2, '1.1.10.', '2026-11-12', 95, 'Baustellenrundgang'),
        e(3, '1.1.20.', '2026-11-12', 30, 'Baustellenrundgang'),
        e(4, '1.1.20.', '2026-11-19', 86, 'Aufmaß', { bemerkung: 'Mehr als im Vertrag: Wandlänge im Flur größer als geplant.' }),
        e(5, '1.2.10.', '2026-11-12', 60, 'Baustellenrundgang'),
        e(6, '1.2.10.', '2026-11-19', 150, 'Baustellenrundgang'),
        e(7, '1.2.10.', '2026-11-19', 120.5, 'Aufmaß', { bemerkung: 'Wert nach dem Aufmaß korrigiert.', erfasstAm: '2026-11-19T17:30:00Z', korrigiertEintragId: 'ls-demo-6' }),
        e(8, '2.1.10.', '2026-11-12', 0.5, 'Baustellenrundgang'),
    ];
    for (const entry of entries)
        await (0, use_cases_ts_2.erfasseLeistungsstand)(repo, exports.DEMO_KOMMISSION, entry, exports.DEMO_HEUTE);
}
async function createDemoLvRepository() {
    const repo = new in_memory_lv_repository_ts_1.InMemoryLvRepository();
    await seedDemoLv(repo);
    return repo;
}
async function createStoredDemoLvRepository(store = (0, stored_lv_repository_ts_1.browserLvStore)()) {
    return stored_lv_repository_ts_1.StoredLvRepository.open(exports.DEMO_KOMMISSION, store, seedDemoLv);
}

},
"src/lv/stored-lv-repository.js": function (require, exports, module) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoredLvRepository = exports.LV_STORAGE_PREFIX = exports.LV_APP_PREFIX = void 0;
exports.browserLvStore = browserLvStore;
exports.resetStoredLv = resetStoredLv;
exports.clearStoredLvs = clearStoredLvs;
const in_memory_lv_repository_ts_1 = require("./in-memory-lv-repository.js");
exports.LV_APP_PREFIX = 'intrend-mc-demo:';
exports.LV_STORAGE_PREFIX = 'intrend-mc-demo:lv:v1:';
const FORMAT = 1;
function browserLvStore() {
    try {
        const s = globalThis.localStorage;
        if (!s)
            return null;
        const probe = `${exports.LV_APP_PREFIX}probe`;
        s.setItem(probe, '1');
        s.removeItem(probe);
        return s;
    }
    catch {
        return null;
    }
}
const isObject = (v) => typeof v === 'object' && v !== null && !Array.isArray(v);
class StoredLvRepository {
    #inner = new in_memory_lv_repository_ts_1.InMemoryLvRepository();
    #log = [];
    #store;
    #kommission;
    constructor(kommission, store) { this.#kommission = kommission; this.#store = store; }
    static async open(kommission, store, seed) {
        const repo = new StoredLvRepository(kommission, store);
        const restored = store ? await repo.#restore() : false;
        if (!restored)
            await seed(repo);
        return repo;
    }
    get persistent() { return this.#store !== null; }
    get #key() { return exports.LV_STORAGE_PREFIX + this.#kommission; }
    async #restore() {
        const raw = this.#store.getItem(this.#key);
        if (raw === null)
            return false;
        try {
            const o = JSON.parse(raw);
            if (!isObject(o) || o.v !== FORMAT || !Array.isArray(o.log) || o.log.length === 0)
                throw new Error('shape');
            const log = [];
            for (const entry of o.log) {
                if (!isObject(entry))
                    throw new Error('shape');
                if (entry.op === 'import' && isObject(entry.meta) && Array.isArray(entry.knoten) && (typeof entry.erwartet === 'string' || entry.erwartet === null)) {
                    const op = entry;
                    if (op.meta.kommission !== this.#kommission)
                        throw new Error('foreign');
                    await this.#inner.speichereImport(op.meta, op.knoten, op.erwartet);
                    log.push(op);
                }
                else if (entry.op === 'eintrag' && isObject(entry.eintrag)) {
                    const op = entry;
                    await this.#inner.haengeLeistungsstandAn(this.#kommission, op.eintrag);
                    log.push(op);
                }
                else
                    throw new Error('shape');
            }
            this.#log = log;
            return true;
        }
        catch {
            this.#inner = new in_memory_lv_repository_ts_1.InMemoryLvRepository();
            this.#log = [];
            try {
                this.#store.removeItem(this.#key);
            }
            catch { }
            return false;
        }
    }
    ladeBestand(kommission) { return this.#inner.ladeBestand(kommission); }
    async speichereImport(meta, knoten, erwartetAktuell) {
        await this.#inner.speichereImport(meta, knoten, erwartetAktuell);
        await this.#persist({ op: 'import', meta: structuredClone(meta), knoten: structuredClone([...knoten]), erwartet: erwartetAktuell });
    }
    async haengeLeistungsstandAn(kommission, eintrag) {
        await this.#inner.haengeLeistungsstandAn(kommission, eintrag);
        await this.#persist({ op: 'eintrag', eintrag: structuredClone(eintrag) });
    }
    async #persist(op) {
        const next = [...this.#log, op];
        if (this.#store) {
            try {
                this.#store.setItem(this.#key, JSON.stringify({ v: FORMAT, log: next }));
            }
            catch {
                const rebuilt = new in_memory_lv_repository_ts_1.InMemoryLvRepository();
                for (const o of this.#log) {
                    if (o.op === 'import')
                        await rebuilt.speichereImport(o.meta, o.knoten, o.erwartet);
                    else
                        await rebuilt.haengeLeistungsstandAn(this.#kommission, o.eintrag);
                }
                this.#inner = rebuilt;
                throw new Error('Speichern im Browser nicht möglich (Speicher voll oder gesperrt)');
            }
        }
        this.#log = next;
    }
}
exports.StoredLvRepository = StoredLvRepository;
function resetStoredLv(kommission, store) {
    try {
        store?.removeItem(exports.LV_STORAGE_PREFIX + kommission);
    }
    catch { }
}
function clearStoredLvs(store) {
    if (!store)
        return 0;
    try {
        const keys = [];
        for (let i = 0; i < store.length; i++) {
            const k = store.key(i);
            if (k !== null && k.startsWith(exports.LV_STORAGE_PREFIX))
                keys.push(k);
        }
        for (const k of keys)
            store.removeItem(k);
        return keys.length;
    }
    catch {
        return 0;
    }
}

},
"src/lv/gaeb-export-import.js": function (require, exports, module) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeEinheit = normalizeEinheit;
exports.importGaebExport = importGaebExport;
const ids_ts_1 = require("../core/ids.js");
const TYPEN = { LV: 'lv', Bereich: 'bereich', Abschnitt: 'abschnitt', Position: 'position', Hinweistext: 'hinweistext', Vorbemerkung: 'vorbemerkung' };
const SUMMEN = { 'S. LV': 'lv', 'S. Bereich': 'bereich', 'S. Abschnitt': 'abschnitt' };
const LEVEL = { lv: 0, bereich: 1, abschnitt: 2 };
const isSteuerzeile = (g) => /mwst/i.test(g) || /^brutto$/i.test(g) || /^netto$/i.test(g);
const REQUIRED = ['Gliederung', 'Nr.', 'Bez.', 'Menge', 'Einheit'];
const text = (v) => (v === null || v === undefined ? '' : String(v)).trim();
const isEmpty = (v) => text(v) === '';
function normalizeEinheit(raw) {
    const e = raw.trim();
    if (/^m2$/i.test(e))
        return 'm²';
    if (/^lm$/i.test(e))
        return 'm';
    if (/^stk\.?$/i.test(e))
        return 'Stk';
    return e;
}
function number(v) {
    if (typeof v === 'number')
        return Number.isFinite(v) ? v : null;
    const t = text(v);
    if (t === '')
        return null;
    const n = /^-?\d+(,\d+)?$/.test(t) ? Number(t.replace(',', '.')) : /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : NaN;
    return Number.isFinite(n) ? n : null;
}
function importGaebExport(rows, options = {}) {
    const newId = options.newId ?? (() => (0, ids_ts_1.nextId)('lk'));
    const issues = [];
    const knoten = [];
    const stats = { knoten: 0, byTyp: { lv: 0, bereich: 0, abschnitt: 0, position: 0, hinweistext: 0, vorbemerkung: 0 }, eventualpositionen: 0, positionenMitEp: 0, ignoriert: { summenzeilen: 0, steuerzeilen: 0, leerzeilen: 0 } };
    const done = () => ({ knoten, issues, stats });
    const issue = (code, severity, zeile, message) => issues.push({ code, severity, zeile, message });
    const header = (rows[0] ?? []).map(text);
    const col = (name) => header.indexOf(name);
    const missing = REQUIRED.filter(n => col(n) < 0);
    if (missing.length) {
        issue('spalte-fehlt', 'error', 0, `Spalte(n) fehlen in der Kopfzeile: ${missing.join(', ')}`);
        return done();
    }
    const c = { g: col('Gliederung'), art: col('Positionsart'), nr: col('Nr.'), bez: col('Bez.'), lang: col('Langtext'), menge: col('Menge'), einheit: col('Einheit'), ep: col('EP') };
    const at = (row, i) => (i < 0 ? undefined : row[i]);
    const open = [];
    const children = new Map();
    const oz = new Map();
    const add = (k) => {
        const n = (children.get(k.parentId) ?? 0) + 1;
        children.set(k.parentId, n);
        const full = { ...k, reihenfolge: n };
        knoten.push(full);
        stats.knoten++;
        stats.byTyp[k.typ]++;
        return full;
    };
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i] ?? [], zeile = i + 1;
        if (row.every(isEmpty)) {
            stats.ignoriert.leerzeilen++;
            continue;
        }
        const g = text(at(row, c.g));
        if (g === '') {
            stats.ignoriert.leerzeilen++;
            continue;
        }
        if (isSteuerzeile(g)) {
            stats.ignoriert.steuerzeilen++;
            continue;
        }
        const summe = SUMMEN[g];
        if (summe) {
            stats.ignoriert.summenzeilen++;
            const level = LEVEL[summe];
            const target = open.find(o => LEVEL[o.typ] === level);
            if (!target) {
                issue('summenzeile-passt-nicht', 'warning', zeile, `${g}: keine passende offene Ebene`);
                continue;
            }
            const nr = text(at(row, c.nr));
            if (nr !== '' && nr !== target.oz)
                issue('summenzeile-passt-nicht', 'warning', zeile, `${g} "${nr}" gehört nicht zur offenen Ebene "${target.oz}"`);
            open.length = open.indexOf(target);
            continue;
        }
        const typ = TYPEN[g];
        if (!typ) {
            issue('gliederung-unbekannt', 'error', zeile, `Unbekannter Wert in Gliederung: "${g}" (Zeile übersprungen)`);
            continue;
        }
        const base = { oz: text(at(row, c.nr)), kurztext: text(at(row, c.bez)), langtext: text(at(row, c.lang)), herkunft: 'Hauptauftrag', quelleZeile: zeile, position: null };
        if (typ === 'lv') {
            if (knoten.some(k => k.typ === 'lv')) {
                issue('zweite-wurzel', 'error', zeile, 'Eine zweite Zeile vom Typ LV (Zeile übersprungen)');
                continue;
            }
            open.length = 0;
            open.push(add({ id: newId(), parentId: null, typ, ...base }));
            continue;
        }
        if (open.length === 0) {
            issue('wurzel-fehlt', 'error', zeile, 'Vor dieser Zeile gibt es keine LV-Zeile; die Zeile hat keinen Elternknoten (Zeile übersprungen)');
            continue;
        }
        if (typ === 'bereich' || typ === 'abschnitt') {
            const level = LEVEL[typ];
            open.length = Math.min(open.length, level);
            if (typ === 'abschnitt' && open.length < 2)
                issue('abschnitt-ohne-bereich', 'warning', zeile, `Abschnitt "${base.oz}" steht ohne Bereich; er hängt am nächsten offenen Knoten`);
            const parent = open[open.length - 1];
            checkOz(parent, base.oz, typ, zeile);
            open.push(add({ id: newId(), parentId: parent.id, typ, ...base }));
            continue;
        }
        const parent = open[open.length - 1];
        if (typ === 'position') {
            if (parent.typ !== 'abschnitt')
                issue('position-ohne-abschnitt', 'warning', zeile, `Position "${base.oz}" steht nicht in einem Abschnitt; sie hängt am nächsten offenen Knoten (${parent.typ})`);
            checkOz(parent, base.oz, typ, zeile);
            const artQuelle = text(at(row, c.art));
            let art = 'Normal';
            if (/^eventual(position)?$/i.test(artQuelle))
                art = 'Eventual';
            else if (artQuelle !== '')
                issue('positionsart-unbekannt', 'error', zeile, `Positionsart "${artQuelle}" ist unbekannt; Position "${base.oz}" wird als Normal geführt, der Quelltext bleibt erhalten`);
            const menge = number(at(row, c.menge));
            if (menge === null || menge < 0)
                issue('menge-ungueltig', 'error', zeile, `Position "${base.oz}": Menge fehlt, ist keine Zahl oder negativ`);
            const einheitQuelle = text(at(row, c.einheit));
            if (einheitQuelle === '')
                issue('einheit-fehlt', 'error', zeile, `Position "${base.oz}": Einheit fehlt`);
            const epRaw = at(row, c.ep);
            const ep = isEmpty(epRaw) ? null : number(epRaw);
            if (!isEmpty(epRaw) && (ep === null || ep < 0))
                issue('ep-ungueltig', 'error', zeile, `Position "${base.oz}": EP ist keine Zahl oder negativ`);
            const key = `position:${base.oz}`;
            if (oz.has(key))
                issue('oz-doppelt', 'error', zeile, `OZ "${base.oz}" gibt es schon in Zeile ${oz.get(key)}`);
            else
                oz.set(key, zeile);
            if (art === 'Eventual')
                stats.eventualpositionen++;
            if (ep !== null)
                stats.positionenMitEp++;
            add({ id: newId(), parentId: parent.id, typ, ...base, position: { positionsart: art, positionsartQuelle: artQuelle, vertragsmenge: menge ?? 0, einheit: normalizeEinheit(einheitQuelle), einheitQuelle, ep } });
            continue;
        }
        add({ id: newId(), parentId: parent.id, typ, ...base });
    }
    if (!knoten.some(k => k.typ === 'lv') && rows.length > 1)
        issue('wurzel-fehlt', 'error', 0, 'Es gibt keine Zeile vom Typ LV');
    return done();
    function checkOz(parent, ozValue, typ, zeile) {
        if (typ !== 'position') {
            const key = `${typ}:${ozValue}`;
            if (oz.has(key))
                issue('oz-doppelt', 'error', zeile, `OZ "${ozValue}" (${typ}) gibt es schon in Zeile ${oz.get(key)}`);
            else
                oz.set(key, zeile);
        }
        if (parent.typ !== 'lv' && ozValue !== '' && parent.oz !== '' && !ozValue.startsWith(parent.oz)) {
            issue('oz-passt-nicht-zum-elternknoten', 'warning', zeile, `OZ "${ozValue}" beginnt nicht mit der OZ des Elternknotens "${parent.oz}"`);
        }
    }
}

},
"src/lv/reimport-abgleich.js": function (require, exports, module) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gleicheReimportAb = gleicheReimportAb;
const ids_ts_1 = require("../core/ids.js");
const STRUKTUR = new Set(['bereich', 'abschnitt']);
const key = (k) => `${k.typ}:${k.oz}`;
function countBy(list) {
    const m = new Map();
    for (const k of list)
        m.set(key(k), (m.get(key(k)) ?? 0) + 1);
    return m;
}
function gleicheReimportAb(alt, neu, options = {}) {
    const newId = options.newId ?? (() => (0, ids_ts_1.nextId)('lk'));
    const meldungen = [];
    const melde = (code, severity, oz, message) => meldungen.push({ code, severity, oz, message });
    const altCount = countBy(alt.filter(k => k.typ === 'position' || STRUKTUR.has(k.typ)));
    const neuCount = countBy(neu.filter(k => k.typ === 'position' || STRUKTUR.has(k.typ)));
    const altByKey = new Map(alt.filter(k => (k.typ === 'position' || STRUKTUR.has(k.typ)) && altCount.get(key(k)) === 1).map(k => [key(k), k]));
    const umnummer = options.bestaetigteUmnummerierungen ?? {};
    const altByOz = new Map(alt.filter(k => k.typ === 'position').map(k => [k.oz, k]));
    const neuOzSet = new Set(neu.filter(k => k.typ === 'position').map(k => k.oz));
    const partner = new Map();
    const used = new Set();
    const ambiguous = new Set();
    for (const n of neu) {
        if (n.typ === 'lv') {
            const o = alt.find(k => k.typ === 'lv');
            if (o) {
                partner.set(n, o);
                used.add(o);
            }
            continue;
        }
        if (n.typ !== 'position' && !STRUKTUR.has(n.typ))
            continue;
        if ((neuCount.get(key(n)) ?? 0) > 1 || (altCount.get(key(n)) ?? 0) > 1) {
            if (!ambiguous.has(key(n))) {
                ambiguous.add(key(n));
                melde('oz-mehrdeutig', 'error', n.oz, `OZ "${n.oz}" (${n.typ}) kommt mehrfach vor (alt ${altCount.get(key(n)) ?? 0}, neu ${neuCount.get(key(n)) ?? 0}); es wird nicht zugeordnet`);
            }
            continue;
        }
        const o = altByKey.get(key(n));
        if (o) {
            partner.set(n, o);
            used.add(o);
        }
    }
    for (const [altOz, neuOz] of Object.entries(umnummer)) {
        const o = altByOz.get(altOz), n = neu.find(k => k.typ === 'position' && k.oz === neuOz);
        if (!o || !n || used.has(o) || partner.has(n)) {
            melde('umnummerierung-unbekannt', 'error', altOz, `Umnummerierung "${altOz}" → "${neuOz}" passt nicht: eine der beiden Positionen fehlt oder ist schon zugeordnet`);
            continue;
        }
        partner.set(n, o);
        used.add(o);
        melde('umnummerierung-angewendet', 'warning', neuOz, `Position "${altOz}" heißt jetzt "${neuOz}" (bestätigt); die PositionId bleibt`);
    }
    const idOf = new Map();
    const unmatchedNew = [...neu.filter(n => n.typ === 'position' && !partner.has(n))];
    const unmatchedOld = alt.filter(k => k.typ === 'position' && !used.has(k));
    const result = [];
    const hinweisKey = (n, parentId) => `${parentId}|${n.typ}|${n.reihenfolge}|${n.kurztext}|${n.langtext}`;
    const altHinweise = new Map(alt.filter(k => k.typ === 'hinweistext' || k.typ === 'vorbemerkung').map(k => [hinweisKey(k, k.parentId ?? ''), k]));
    const parentOf = new Map(neu.map(n => [n.id, n]));
    let zugeordnet = 0, geaendert = 0;
    for (const n of neu) {
        let id;
        const o = partner.get(n);
        if (o) {
            id = o.id;
            zugeordnet++;
        }
        else if (n.typ === 'hinweistext' || n.typ === 'vorbemerkung') {
            const parentNew = n.parentId ? parentOf.get(n.parentId) : undefined;
            const parentId = parentNew ? (idOf.get(parentNew) ?? '') : '';
            const same = altHinweise.get(hinweisKey(n, parentId));
            if (same && !used.has(same)) {
                used.add(same);
                id = same.id;
                zugeordnet++;
            }
            else
                id = newId();
        }
        else
            id = newId();
        idOf.set(n, id);
        const parentNew = n.parentId ? parentOf.get(n.parentId) : undefined;
        result.push({ ...n, id, parentId: parentNew ? idOf.get(parentNew) : null });
        if (!o) {
            if (n.typ === 'position') { }
            else if (STRUKTUR.has(n.typ))
                melde('knoten-neu', 'warning', n.oz, `${n.typ} "${n.oz}" ist neu`);
            continue;
        }
        if (n.typ === 'position' && o.position && n.position) {
            const diffs = [];
            if (o.kurztext !== n.kurztext)
                diffs.push('Kurztext');
            if (o.langtext !== n.langtext)
                diffs.push('Langtext');
            if (o.position.vertragsmenge !== n.position.vertragsmenge)
                diffs.push(`Vertragsmenge (${o.position.vertragsmenge} → ${n.position.vertragsmenge})`);
            if (o.position.positionsart !== n.position.positionsart)
                diffs.push('Positionsart');
            if (o.position.ep !== n.position.ep && o.position.ep !== null)
                diffs.push('EP');
            if (o.position.einheit !== n.position.einheit) {
                melde('einheit-geaendert', 'error', n.oz, `Position "${n.oz}": Einheit ${o.position.einheit} → ${n.position.einheit}; bereits erfasste Leistungsstände sind in der alten Einheit`);
            }
            if (diffs.length) {
                geaendert++;
                melde('position-geaendert', 'warning', n.oz, `Position "${n.oz}" hat sich geändert: ${diffs.join(', ')} (der Original-Import bleibt unverändert, dies ist ein neuer Import)`);
            }
            const parentWas = alt.find(k => k.id === o.parentId), parentNow = parentNew;
            if (parentWas && parentNow && parentWas.oz !== parentNow.oz)
                melde('elternknoten-geaendert', 'warning', n.oz, `Position "${n.oz}" steht jetzt unter "${parentNow.oz}" statt unter "${parentWas.oz}"`);
        }
    }
    const suggested = new Set();
    for (const n of unmatchedNew) {
        const cands = unmatchedOld.filter(o => !suggested.has(o) && o.kurztext === n.kurztext && o.position.einheit === n.position.einheit && o.position.vertragsmenge === n.position.vertragsmenge && !neuOzSet.has(o.oz));
        if (cands.length === 1) {
            suggested.add(cands[0]);
            melde('umnummerierung-moeglich', 'warning', n.oz, `Position "${n.oz}" ist neu; "${cands[0].oz}" ist entfallen und hat denselben Kurztext, dieselbe Einheit und Menge: Umnummerierung? Nicht zugeordnet, bis ein Mensch es bestätigt`);
        }
        melde('position-neu', 'warning', n.oz, `Position "${n.oz}" ist neu (neue PositionId)`);
    }
    const entfallene = alt.filter(k => !used.has(k) && (k.typ === 'position' || STRUKTUR.has(k.typ) || k.typ === 'lv'));
    for (const o of entfallene) {
        if (o.typ === 'position')
            melde('position-entfallen', 'warning', o.oz, `Position "${o.oz}" kommt im neuen Export nicht mehr vor; sie wird nicht gelöscht, ihr Leistungsstand bleibt`);
        else
            melde('knoten-entfallen', 'warning', o.oz, `${o.typ} "${o.oz}" kommt im neuen Export nicht mehr vor`);
    }
    return { knoten: result, entfallene, meldungen, stats: { zugeordnet, neu: unmatchedNew.length, entfallen: entfallene.filter(k => k.typ === 'position').length, geaendert } };
}

},
"src/lv/lv-repository.js": function (require, exports, module) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.istKommission = exports.LvRepositoryError = void 0;
exports.pruefeBaum = pruefeBaum;
exports.entfalleneKnoten = entfalleneKnoten;
exports.pruefeBestand = pruefeBestand;
class LvRepositoryError extends Error {
    code;
    constructor(code, detail) { super(`${code}: ${detail}`); this.name = 'LvRepositoryError'; this.code = code; }
}
exports.LvRepositoryError = LvRepositoryError;
const istKommission = (s) => /^\d{4}$/.test(s);
exports.istKommission = istKommission;
function pruefeBaum(knoten) {
    const ids = new Set();
    let wurzeln = 0;
    for (const k of knoten) {
        if (ids.has(k.id))
            return `Id ${k.id} kommt mehrfach vor`;
        ids.add(k.id);
        if (k.parentId === null)
            wurzeln++;
        if ((k.typ === 'position') !== (k.position !== null))
            return `Knoten ${k.id}: Positionsdaten passen nicht zum Typ ${k.typ}`;
    }
    if (wurzeln !== 1)
        return `Es gibt ${wurzeln} Wurzeln, erwartet genau eine`;
    for (const k of knoten)
        if (k.parentId !== null && !ids.has(k.parentId))
            return `Knoten ${k.id}: Elternknoten ${k.parentId} fehlt`;
    return null;
}
function entfalleneKnoten(snapshots, aktuell) {
    const now = new Set(aktuell.map(k => k.id));
    const gone = new Map();
    for (const snap of snapshots)
        for (const k of snap)
            if (!now.has(k.id) && (k.typ === 'position' || k.typ === 'bereich' || k.typ === 'abschnitt'))
                gone.set(k.id, k);
    return [...gone.values()];
}
function pruefeBestand(b) {
    const out = [];
    const aktuell = new Set(b.knoten.filter(k => k.typ === 'position').map(k => k.id));
    const entfallen = new Set(b.entfallene.filter(k => k.typ === 'position').map(k => k.id));
    const ids = new Set();
    for (const e of b.eintraege) {
        if (ids.has(e.id))
            out.push({ code: 'eintrag-doppelt', severity: 'error', id: e.id, message: `Eintrag ${e.id} mehrfach vorhanden` });
        else
            ids.add(e.id);
        if (!aktuell.has(e.positionId) && !entfallen.has(e.positionId))
            out.push({ code: 'eintrag-ohne-position', severity: 'error', id: e.id, message: `Eintrag ${e.id} zeigt auf eine unbekannte Position` });
        else if (!aktuell.has(e.positionId))
            out.push({ code: 'eintrag-auf-entfallene-position', severity: 'warning', id: e.id, message: `Eintrag ${e.id} gehört zu einer Position, die im aktuellen Import fehlt` });
    }
    return out;
}

},
"src/lv/in-memory-lv-repository.js": function (require, exports, module) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryLvRepository = void 0;
const lv_repository_ts_1 = require("./lv-repository.js");
class InMemoryLvRepository {
    #lv = new Map();
    async ladeBestand(kommission) {
        const s = this.#lv.get(kommission);
        if (!s)
            return null;
        const current = s.imports.find(i => i.meta.id === s.aktuell);
        return structuredClone({
            kommission, imports: s.imports.map(i => i.meta), aktuellerImportId: s.aktuell, knoten: current.knoten,
            entfallene: (0, lv_repository_ts_1.entfalleneKnoten)(s.imports.filter(i => i.meta.id !== s.aktuell).map(i => i.knoten), current.knoten), eintraege: s.eintraege,
        });
    }
    async speichereImport(meta, knoten, erwartetAktuell) {
        if (!(0, lv_repository_ts_1.istKommission)(meta.kommission))
            throw new lv_repository_ts_1.LvRepositoryError('kommission-ungueltig', `"${meta.kommission}" ist keine vierstellige KOM-Nr.`);
        const problem = (0, lv_repository_ts_1.pruefeBaum)(knoten);
        if (problem)
            throw new lv_repository_ts_1.LvRepositoryError('knoten-ungueltig', problem);
        const s = this.#lv.get(meta.kommission);
        const aktuell = s?.aktuell ?? null;
        if (aktuell !== erwartetAktuell)
            throw new lv_repository_ts_1.LvRepositoryError('vorgaenger-geaendert', `erwartet ${erwartetAktuell ?? 'kein Import'}, aktuell ${aktuell ?? 'kein Import'}`);
        if (s?.imports.some(i => i.meta.sha256 === meta.sha256))
            throw new lv_repository_ts_1.LvRepositoryError('import-doppelt', `Die Datei (SHA-256 ${meta.sha256.slice(0, 12)}) wurde für ${meta.kommission} schon importiert`);
        if (s?.imports.some(i => i.meta.id === meta.id))
            throw new lv_repository_ts_1.LvRepositoryError('import-doppelt', `Import-ID ${meta.id} gibt es schon`);
        const entry = { meta: structuredClone(meta), knoten: structuredClone([...knoten]) };
        if (s) {
            s.imports.push(entry);
            s.aktuell = meta.id;
        }
        else
            this.#lv.set(meta.kommission, { imports: [entry], aktuell: meta.id, eintraege: [] });
    }
    async haengeLeistungsstandAn(kommission, eintrag) {
        const s = this.#lv.get(kommission);
        if (!s)
            throw new lv_repository_ts_1.LvRepositoryError('kommission-unbekannt', `Für ${kommission} gibt es noch keinen Import`);
        if (s.eintraege.some(e => e.id === eintrag.id))
            throw new lv_repository_ts_1.LvRepositoryError('eintrag-doppelt', `Eintrag ${eintrag.id} gibt es schon`);
        const known = s.imports.some(i => i.knoten.some(k => k.id === eintrag.positionId && k.typ === 'position'));
        if (!known)
            throw new lv_repository_ts_1.LvRepositoryError('position-unbekannt', `Position ${eintrag.positionId} gibt es in keinem Import von ${kommission}`);
        s.eintraege.push(structuredClone(eintrag));
    }
}
exports.InMemoryLvRepository = InMemoryLvRepository;

}
};
  const cache = {};
  const resolve = (from, spec) => { const parts = from.split('/').slice(0, -1); for (const p of spec.split('/')) { if (p === '..') parts.pop(); else if (p !== '.') parts.push(p); } return parts.join('/'); };
  function load(id) {
    if (cache[id]) return cache[id].exports;
    if (!defs[id]) throw new Error('StundenzettelApp: missing module ' + id);
    const module = cache[id] = { exports: {} };
    defs[id]((spec) => load(resolve(id, spec)), module.exports, module);
    return module.exports;
  }
  globalThis.LvApp = Object.freeze(Object.assign({}, load("preview/lv-app.js"), { css: ":root, :host, .lv-app {\n  color-scheme: light;\n  \n  --ink: #0b191f; --muted: #2a4036; --line: #8aa093; --line-soft: #a3b7ab; --line-strong: #4d6358;\n  --paper: #f5f7f4; --panel: #fff; --band: #eef3ef;\n  --teal: #08574f; --teal-d: #063f39; --lime: #d5f28a; --focus: #063f39; --on-teal: #fff;\n  --stoer: #8e2616; --stoer-soft: #f6d9d2; --note-bg: #fff6e8; --note-ink: #4f2c08; --note-line: #86500f; --ok-bg: #e5f3e9; --ok-ink: #14452d;\n  --s1: 4px; --s2: 8px; --s3: 12px; --s4: 16px; --s5: 24px; --s6: 32px;\n  font-family: \"Segoe UI Variable Text\", \"Segoe UI\", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;\n}\n@media (prefers-color-scheme: dark) {\n  .lv-app[data-scheme=\"auto\"] {\n    color-scheme: dark;\n    --ink: #f4faf6; --muted: #c4d4ca; --line: #6f867a; --line-soft: #53695d; --line-strong: #9bb1a5;\n    --paper: #11191a; --panel: #172123; --band: #1d2a2c;\n    --teal: #6cd0bf; --teal-d: #8fe0d1; --lime: #b5d96a; --focus: #9fe3d5; --on-teal: #0b1d1a;\n    --stoer: #f6a090; --stoer-soft: #4a2520; --note-bg: #2b2418; --note-ink: #f8e6c8; --note-line: #d29a4c; --ok-bg: #1f3a2c; --ok-ink: #d3f2e0;\n  }\n}\n* { box-sizing: border-box; }\n.lv-app { background: var(--paper); color: var(--ink); font-size: 14px; line-height: 1.45; font-variant-numeric: tabular-nums; padding-bottom: var(--s6); }\n.lv-app.standalone { min-height: 100vh; padding: var(--s5) var(--s6) var(--s6); }\n.lv-app ::selection { background: var(--lime); color: #14252c; }\n.lv-app :is(input, textarea, button, select):focus-visible { outline: 3px solid var(--focus); outline-offset: 2px; }\n.lv-app input, .lv-app textarea, .lv-app button { accent-color: var(--teal); font: inherit; }\n.lv-app h1 { font-size: 22px; letter-spacing: -.01em; margin: 0 0 var(--s1); }\n.lv-app h2 { font-size: 16px; margin: 0; }\n.lv-app h3 { font-size: 14px; margin: var(--s5) 0 var(--s2); }\n.sr-only, .lv-live { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }\n.lv-lead { margin: 0 0 var(--s3); color: var(--muted); max-width: 72ch; }\n.lv-bar-tools { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--s2) var(--s4); margin: 0 0 var(--s3); }\n.lv-segs { display: inline-flex; flex-wrap: wrap; border: 2px solid var(--line-strong); border-radius: 8px; overflow: hidden; background: var(--panel); }\n.lv-seg { border: 0; background: transparent; color: var(--ink); padding: var(--s2) var(--s4); min-height: 36px; cursor: pointer; font-weight: 600; }\n.lv-count { font-weight: 700; margin-inline-start: var(--s1); }\n.lv-seg + .lv-seg { border-left: 1px solid var(--line-strong); }\n.lv-seg[aria-pressed=\"true\"] { background: var(--teal); color: var(--on-teal); font-weight: 600; }\n.lv-all { display: flex; gap: var(--s4); }\n.lv-link.armed { color: var(--note-ink); background: var(--note-bg); outline: 2px solid var(--note-line); outline-offset: 0; border-radius: 4px; padding-inline: var(--s2); text-decoration: none; font-weight: 700; }\n.lv-link { border: 0; background: none; color: var(--teal-d); text-decoration: underline; text-underline-offset: 3px; cursor: pointer; padding: var(--s1) 0; min-height: 28px; }\n.lv-saved { background: var(--ok-bg); color: var(--ok-ink); padding: var(--s2) var(--s3); border-radius: 6px; margin: 0 0 var(--s3); }\n.lv-layout { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--s4); align-items: start; }\n.lv-scroll { overflow-x: auto; background: var(--panel); border: 1px solid var(--line-strong); border-radius: 10px; scrollbar-color: var(--line-strong) transparent; }\n.lv-table { width: 100%; border-collapse: collapse; min-width: 680px; }\n.lv-table thead th { text-align: left; font-size: 12px; color: var(--ink); font-weight: 700; padding: var(--s3) var(--s3); border-bottom: 2px solid var(--line-strong); background: var(--panel); position: sticky; top: 0; }\n.lv-table td, .lv-table tbody th { padding: var(--s2) var(--s3); border-bottom: 1px solid var(--line); vertical-align: top; text-align: left; font-weight: 400; }\n.lv-oz { font-weight: 600; color: var(--muted); white-space: nowrap; }\n.lv-group th { background: var(--band); font-weight: 600; }\n.lv-group.l2 th { padding-left: var(--s5); background: var(--panel); }\n.lv-group.l2 { border-top: 1px solid var(--line); }\n.lv-group.l1 { border-top: 1px solid var(--line-strong); }\n.lv-groupinfo { color: var(--muted); font-size: 12px; text-align: right; background: var(--band); }\n.lv-group.l2 .lv-groupinfo { background: var(--panel); }\n.lv-toggle { display: inline-flex; align-items: baseline; gap: var(--s2); border: 0; background: none; color: inherit; font-weight: 600; cursor: pointer; padding: var(--s1) 0; min-height: 28px; text-align: left; }\n.lv-note td { color: var(--muted); font-style: italic; font-size: 13px; padding-top: var(--s1); padding-bottom: var(--s1); }\n.lv-pos.open td, .lv-pos.open th { background: var(--note-bg); }\n.lv-text { min-width: 20ch; }\n.lv-name { margin-right: var(--s2); }\n.lv-menge, .lv-stand { white-space: nowrap; }\n.lv-stand small { display: block; color: var(--muted); font-size: 12px; }\n.lv-none { color: var(--muted); }\n.lv-anz { min-width: 11ch; white-space: nowrap; }\n.lv-bar { display: inline-block; width: 56px; height: 8px; border-radius: 4px; background: var(--line-soft); vertical-align: middle; margin-right: var(--s2); overflow: hidden; }\n.lv-bar > span { display: block; height: 100%; background: var(--teal); }\n.lv-bar > span.over { background: var(--note-line); }\n.lv-pct { color: var(--muted); font-size: 13px; }\n.lv-act { text-align: right; }\n.lv-btn { border: 2px solid var(--teal-d); background: var(--panel); color: var(--teal-d); border-radius: 6px; padding: var(--s1) var(--s3); min-height: 34px; cursor: pointer; font-weight: 700; }\n.lv-btn:hover { background: var(--teal-d); color: var(--on-teal); }\n.lv-primary { border: 2px solid var(--teal-d); background: var(--teal); color: var(--on-teal); border-radius: 6px; padding: var(--s2) var(--s4); min-height: 38px; cursor: pointer; font-weight: 700; }\n.lv-primary:hover { background: var(--teal-d); }\n.lv-chip { display: inline-block; font-size: 12px; font-weight: 600; padding: 1px var(--s2); border-radius: 999px; background: var(--band); color: var(--ink); border: 1px solid var(--line-strong); margin-right: var(--s1); white-space: nowrap; }\n.lv-chip.warn { background: var(--note-bg); color: var(--note-ink); border-color: var(--note-line); }\n.lv-chip.ok { background: var(--ok-bg); color: var(--ok-ink); border-color: var(--ok-ink); }\n.lv-empty { color: var(--muted); padding: var(--s5); text-align: center; }\n.lv-foot { color: var(--muted); font-size: 13px; max-width: 90ch; margin: var(--s4) 0 0; }\n.lv-panel-wrap { position: fixed; inset: 0; z-index: 1000; }\n.lv-scrim { position: absolute; inset: 0; background: rgba(20, 37, 44, 0.45); }\n.lv-panel { position: absolute; top: 0; right: 0; bottom: 0; width: min(460px, 100vw); display: block; overflow: auto; overscroll-behavior: contain; scrollbar-color: var(--line-strong) transparent; background: var(--panel); color: var(--ink); border-left: 2px solid var(--line-strong); box-shadow: -12px 0 28px rgba(0, 0, 0, 0.22); padding: var(--s4); }\n.lv-panel.enter { animation: lv-slide-in 0.2s ease-out; }\n@keyframes lv-slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }\n@media (prefers-reduced-motion: reduce) { .lv-panel.enter { animation: none; } }\n.lv-closebtn { display: inline-flex; align-items: center; gap: var(--s2); }\n.lv-confirm { display: flex; align-items: center; gap: var(--s3); flex-wrap: wrap; margin: var(--s3) calc(-1 * var(--s4)) var(--s3); padding: var(--s3) var(--s4); background: var(--note-bg); color: var(--note-ink); border-block: 2px solid var(--note-line); font-weight: 600; }\n.lv-confirm span { flex: 1 1 100%; }\n.lv-edit { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; padding: 0; border: 2px solid var(--teal-d); border-radius: 6px; background: var(--teal); color: var(--on-teal); cursor: pointer; }\n.lv-edit:hover { background: var(--teal-d); }\n.lv-ico { flex: none; }\n.lv-chev { display: inline-flex; width: 1.4em; color: var(--teal-d); align-self: center; }\n.lv-phead { display: flex; justify-content: space-between; align-items: center; gap: var(--s3); }\n.lv-pos-title { margin: var(--s2) 0 var(--s3); font-weight: 600; }\n.lv-facts { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s3); margin: 0 0 var(--s3); }\n.lv-facts dt { font-size: 12px; color: var(--muted); }\n.lv-facts dd { margin: 0; font-weight: 600; }\n.lv-note-p { color: var(--muted); font-size: 13px; margin: var(--s2) 0; }\n#lv-form { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--s3); }\n#lv-form label { display: grid; gap: var(--s1); font-weight: 600; font-size: 13px; min-width: 0; }\n#lv-form label small { font-weight: 400; color: var(--muted); }\n#lv-form input, #lv-form textarea { width: 100%; min-width: 0; border: 2px solid var(--line-strong); caret-color: var(--teal-d); border-radius: 6px; padding: var(--s2) var(--s3); background: var(--panel); color: var(--ink); min-height: 38px; font-weight: 400; font-size: 14px; }\n.lv-pbtn { display: flex; gap: var(--s3); flex-wrap: wrap; }\n.lv-checks p, .lv-error, .lv-warn { margin: var(--s1) 0; font-size: 13px; padding: var(--s2) var(--s3); border-radius: 6px; }\n.lv-error { color: var(--stoer); background: var(--stoer-soft); font-weight: 600; }\n.lv-warn { color: var(--note-ink); background: var(--note-bg); }\n.lv-hist { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--s3); }\n.lv-hist li { border-bottom: 1px solid var(--line); padding-bottom: var(--s3); display: grid; gap: var(--s1); }\n.lv-hist li.old strong { text-decoration: line-through; color: var(--muted); }\n.lv-hist small { color: var(--muted); }\n.lv-hist .lv-link { justify-self: start; }\n@media (prefers-reduced-motion: no-preference) { .lv-bar > span { transition: width .2s ease; } }\n.lv-sub, .lv-short { display: none; }\n.lv-pos { scroll-margin-top: var(--s2); }\n@media (max-width: 640px) {\n  .lv-app.standalone { padding: var(--s4); }\n  .lv-seg { padding-inline: var(--s3); }\n  .lv-table { min-width: 0; }\n  \n  \n  .lv-table :is(thead th:nth-child(3), thead th:nth-child(5), td.lv-menge, td.lv-anz) { width: 0; max-width: 0; padding: 0; border: 0; overflow: hidden; font-size: 0; line-height: 0; }\n  .lv-table :is(td.lv-menge, td.lv-anz) * { font-size: 0; }\n  .lv-sub { display: block; color: var(--muted); font-size: 12px; }\n  .lv-long { display: none; }\n  .lv-short { display: inline; }\n  .lv-table { font-size: 13px; }\n  .lv-stand, .lv-stand small { white-space: normal; }\n  .lv-btn { padding: var(--s1) var(--s2); min-height: 36px; }\n  .lv-oz { font-size: 12px; }\n  .lv-text { min-width: 0; }\n  .lv-name { overflow-wrap: anywhere; hyphens: auto; }\n  .lv-table td, .lv-table tbody th { padding-inline: 6px; }\n  .lv-groupinfo { font-size: 0; padding: 0; }                 \n  .lv-table td, .lv-table tbody th { padding-inline: var(--s2); }\n}\n@media (max-width: 640px), (pointer: coarse) {\n  .lv-edit { width: 44px; height: 44px; }\n  .lv-btn, .lv-primary, .lv-seg, .lv-toggle { min-height: 44px; }\n  .lv-link { display: inline-flex; align-items: center; min-height: 44px; padding-block: var(--s2); }\n  #lv-form input { min-height: 44px; }\n}" }, { build: "sha256:72e85aa157a6d491" }));
})();
