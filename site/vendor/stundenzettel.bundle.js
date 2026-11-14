/* GENERATED FILE - do not edit. Source: mission-control-spfx, content sha256:6b84e0b5f47d69a2, preview/stundenzettel-app.js, src/timesheet/timesheet.js, src/demo/demo-timesheet.js, src/core/time.js, src/core/factories.js, src/state/day-report.js, src/core/ids.js, src/core/prefill.js.
 * Rebuild: node mission-control-spfx/scripts/build-classic-bundle.mjs --entry stundenzettel <this file>
 * Synthetic prototype. Templates, hours and checks are drafts, not approved rules. */
(function () {
  'use strict';
  const defs = {
"preview/stundenzettel-app.js": function (require, exports, module) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mountStundenzettel = mountStundenzettel;
const timesheet_ts_1 = require("../src/timesheet/timesheet.js");
const demo_timesheet_ts_1 = require("../src/demo/demo-timesheet.js");
const timesheet_ts_2 = require("../src/timesheet/timesheet.js");
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const key = (s) => `${s.employeeId}|${s.assignmentId}`;
const pl = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const LINE_FIELDS = ['name', 'workDate', 'location', 'work', 'start', 'end', 'breakMin'];
const SHELL = `<div class="sz-app" data-view="edit">
  <nav class="steps" id="steps" aria-label="Arbeitsschritte"></nav>
  <div class="tabs" id="tabs" role="tablist" aria-label="Ansicht">
    <button type="button" role="tab" id="tab-edit" data-view="edit" aria-selected="true">Bearbeiten</button>
    <button type="button" role="tab" id="tab-preview" data-view="preview" aria-selected="false">Vorschau <span id="tab-badge" class="badge" hidden></span></button>
  </div>
  <div class="layout" id="layout" data-view="edit">
    <section class="editor" id="editor" aria-label="Bearbeiten"></section>
    <section class="preview" id="preview-col" aria-label="Vorschau">
      <div class="preview-head">
        <h2><span class="letter">D</span>Vorschau</h2>
        <span class="status" id="status"></span>
        <button type="button" class="btn-primary" id="print">Drucken / als PDF sichern</button>
      </div>
      <div id="hints"></div>
      <div id="docwrap"><div id="document"></div></div>
      <div id="side"></div>
    </section>
  </div>
  <div class="nextbar" id="nextbar"><span id="nextbar-info"></span><button type="button" class="btn-primary" id="to-preview">Weiter zur Vorschau →</button></div>
</div>`;
function mountStundenzettel(container, options) {
    const { report } = options;
    const sourceName = options.sourceName ?? 'Tagesbericht';
    container.innerHTML = SHELL;
    const app = container.querySelector('.sz-app');
    const $ = (id) => container.querySelector(`#${id}`);
    const restored = options.restore ? structuredClone(options.restore) : null;
    let selection = restored?.selection ?? [];
    let draft = restored?.draft ?? (0, timesheet_ts_2.createTimesheetDraft)(report, selection, options.initialMeta).draft;
    let photoCount = restored?.photoCount ?? 0, planCount = restored?.planCount ?? 0;
    const openLines = new Set();
    const available = report.employees.reduce((n, e) => n + e.assignments.length, 0);
    const original = (line) => (0, timesheet_ts_2.createTimesheetDraft)(report, [{ employeeId: line.source.employeeId, assignmentId: line.source.assignmentId }]).draft.lines[0];
    const changedFields = (line) => { const o = original(line); return o ? LINE_FIELDS.filter(f => o[f] !== line[f]) : []; };
    const META_INPUTS = [
        ['project', 'Bauvorhaben / Projekt', 'span2', 'text'],
        ['projectNo', 'Projekt-Nr.', '', 'text'],
        ['number', 'Stundenzettel-Nr. (manuell)', '', 'text'],
        ['client', 'Auftraggeber', 'span2', 'text'],
        ['createdOn', 'Erstellungsdatum', '', 'date'],
    ];
    function renderEditorFrame() {
        const meta = META_INPUTS.map(([k, label, cls, type]) => `<div class="${cls}"><label for="m-${k}">${label}</label><input id="m-${k}" type="${type}" data-meta="${k}" value="${esc(draft.meta[k])}"></div>`).join('');
        $('editor').innerHTML = `
    <div class="block" id="block-a"><div class="heading-row"><h2><span class="letter">A</span>Einträge auswählen</h2><span id="pick-count"></span></div>
      <p class="hint">Nur ausdrücklich gewählte Einträge kommen in den Stundenzettel. Der ${esc(sourceName)} bleibt unverändert.</p>
      <div class="pickers" id="pickers"></div>
      <div class="actions"><button type="button" class="btn-link" id="clear-sel">Auswahl leeren</button></div></div>
    <div class="block" id="block-b"><h2><span class="letter">B</span>Angaben ergänzen</h2>
      <div class="grid2">${meta}
        <div><label for="m-materialAmount">Materialkosten (Pauschale, €)</label><input id="m-materialAmount" data-meta="materialAmount" inputmode="decimal" placeholder="z. B. 250,00" value="${esc(draft.meta.materialAmount)}"></div>
        <div class="span2"><label for="m-description">Beschreibung der Arbeiten</label><textarea id="m-description" data-meta="description" rows="3">${esc(draft.meta.description)}</textarea></div></div>
      ${options.demoMeta ? '<div class="actions"><button type="button" class="btn-outline" id="demo-meta">Demo-Angaben einfügen</button></div>' : ''}
      <h3 class="subhead" id="lines-head"></h3>
      <p class="hint" id="lines-hint">Änderungen an diesen Zeilen gelten nur für den Stundenzettel. Der ${esc(sourceName)} bleibt unverändert.</p><div id="lines"></div></div>
    <div class="block" id="block-c"><div class="heading-row"><h2><span class="letter">C</span>Anhänge</h2><span>optional</span></div>
      <p class="hint">Fotos und Planausschnitte sind nicht verpflichtend. Hier nur synthetische Platzhalter.</p>
      <div id="atts"></div>
      <div class="actions"><button type="button" class="btn-outline" id="add-photo">+ Demo-Foto</button><button type="button" class="btn-outline" id="add-plan">+ Demo-Planausschnitt</button></div></div>`;
    }
    function renderPickers() {
        $('pickers').innerHTML = report.employees.flatMap(employee => employee.assignments.map(a => {
            const sel = { employeeId: employee.id, assignmentId: a.id };
            const on = selection.some(s => key(s) === key(sel));
            const problem = (0, timesheet_ts_1.lineMinutes)({ start: a.start, end: a.end, breakMin: a.breakMin }).issues[0];
            return `<label class="pick${on ? ' is-on' : ''}"><input type="checkbox" data-pick="${esc(key(sel))}" ${on ? 'checked' : ''}>
        <span class="pick-main"><b>${esc(employee.name || 'ohne Namen')}</b><small>${esc(a.work || a.lv || 'ohne Tätigkeit')} · ${esc(a.locations.join(', ') || 'ohne Ort')}</small></span>
        <span class="pick-time">${esc(a.start || '?')}–${esc(a.end || '?')} · P ${esc(a.breakMin || '–')}${problem ? `<em>${esc(problem)}</em>` : ''}</span></label>`;
        })).join('') || `<p class="empty">Dieser ${esc(sourceName)} enthält keine Arbeitszeilen.</p>`;
        $('pick-count').textContent = `${selection.length} von ${available} gewählt`;
    }
    function renderLines() {
        const p = (0, timesheet_ts_2.buildPreview)(draft);
        $('lines-head').textContent = draft.lines.length ? `Zeilen im Dokument (${draft.lines.length})` : 'Zeilen im Dokument';
        $('lines').innerHTML = draft.lines.map((line, i) => {
            const row = p.rows[i], id = line.source.assignmentId, changed = changedFields(line).length > 0;
            return `<details class="line" data-line-id="${esc(id)}" ${openLines.has(id) ? 'open' : ''}><summary><span>${esc(line.name || `Zeile ${i + 1}`)}<small>${esc(line.start || '?')}–${esc(line.end || '?')}</small>${changed ? `<small class="changed" data-changed>im Stundenzettel geändert</small>` : ''}</span>${row.issues.length ? `<span class="warn">${esc(row.issues[0])}</span>` : ''}</summary>
        <div class="body"><div class="grid2"><div class="span2"><label for="l-${i}-name">Personal</label><input id="l-${i}-name" data-line="${i}" data-field="name" value="${esc(line.name)}"></div>
          <div><label for="l-${i}-workDate">Arbeitsdatum</label><input id="l-${i}-workDate" type="date" data-line="${i}" data-field="workDate" value="${esc(line.workDate)}"></div>
          <div><label for="l-${i}-location">Ort / Bauteil</label><input id="l-${i}-location" data-line="${i}" data-field="location" value="${esc(line.location)}"></div>
          <div class="span2"><label for="l-${i}-work">Tätigkeit</label><input id="l-${i}-work" data-line="${i}" data-field="work" value="${esc(line.work)}"></div></div>
          <div class="grid3"><div><label for="l-${i}-start">Beginn</label><input id="l-${i}-start" type="time" data-line="${i}" data-field="start" value="${esc(line.start)}"></div>
          <div><label for="l-${i}-end">Ende</label><input id="l-${i}-end" type="time" data-line="${i}" data-field="end" value="${esc(line.end)}"></div>
          <div><label for="l-${i}-breakMin">Pause (Min.)</label><input id="l-${i}-breakMin" inputmode="numeric" data-line="${i}" data-field="breakMin" value="${esc(line.breakMin)}"></div></div></div></details>`;
        }).join('') || '<p class="empty">Noch keine Einträge ausgewählt. Wähle oben mindestens einen Eintrag.</p>';
    }
    function renderAttachments() {
        $('atts').innerHTML = draft.attachments.map(a => `<div class="att"><img src="${a.ref}" alt=""><div><label for="cap-${esc(a.id)}" class="sr">${a.kind === 'photo' ? 'Foto' : 'Plan'}: Bildunterschrift</label>
      <input id="cap-${esc(a.id)}" data-cap="${esc(a.id)}" value="${esc(a.caption)}" aria-label="${a.kind === 'photo' ? 'Foto' : 'Plan'}: Bildunterschrift"></div>
      <button type="button" class="btn-link danger" data-del="${esc(a.id)}">Entfernen</button></div>`).join('') || '<p class="empty">Keine Anhänge.</p>';
    }
    const cell = (value, fallback = '—') => value.trim() ? esc(value) : `<span class="missing">${fallback}</span>`;
    const dateDe = (iso) => /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso.split('-').reverse().join('.') : iso;
    function renderPreview() {
        const p = (0, timesheet_ts_2.buildPreview)(draft);
        const h = p.header;
        const headerMissing = [h.project, h.projectNo, h.client, h.number, h.createdOn].filter(v => !v.trim()).length;
        const n = draft.lines.length;
        const attention = p.hints.length + p.assumptions.length;
        $('status').className = attention ? 'status is-incomplete' : 'status';
        $('status').textContent = attention ? `Entwurf · ${[p.hints.length && pl(p.hints.length, 'Hinweis', 'Hinweise'), p.assumptions.length && pl(p.assumptions.length, 'Annahme', 'Annahmen')].filter(Boolean).join(' · ')}` : 'Entwurf · ungeprüft';
        $('hints').innerHTML =
            (p.hints.length ? `<div class="note"><strong>Es fehlen noch Angaben (${p.hints.length})</strong><ul>${p.hints.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : '')
                + (p.assumptions.length ? `<div class="note" data-assumption><strong>Annahme in der Berechnung (${p.assumptions.length})</strong><ul>${p.assumptions.map(x => `<li>${esc(x)}</li>`).join('')}</ul>Bitte prüfen: Die Stunden sind vorläufig und nicht bestätigt. Es gibt keine freigegebene Pausenregel.</div>` : '')
                + (attention ? '' : '<div class="note ok"><strong>Keine fehlenden Angaben erkannt</strong>Nach den hier angenommenen Feldern; keine freigegebene Prüfregel.</div>');
        const rows = p.rows.map(r => `<tr><td data-label="Arbeitsdatum">${cell(dateDe(r.workDate))}</td><td data-label="Personal">${cell(r.name)}</td><td data-label="Ort">${cell(r.location)}</td><td data-label="Tätigkeit">${cell(r.work)}</td>
      <td data-label="Beginn">${cell(r.start)}</td><td data-label="Ende">${cell(r.end)}</td><td class="num" data-label="Pause (Min.)">${esc(r.breakMin || '–')}</td><td class="num" data-label="Stunden"><span>${esc(r.hoursText)}${r.assumed.length ? '*' : ''}${r.issues.length ? ' <span class="missing screen-only">!</span>' : ''}</span></td></tr>`).join('')
            || '<tr><td colspan="8" class="missing">Keine Einträge ausgewählt</td></tr>';
        const figures = (items) => items.map(a => `<figure><img src="${a.ref}" alt="${esc(a.caption || a.name)}"><figcaption>${esc(a.caption || a.name)}</figcaption></figure>`).join('');
        $('document').innerHTML = `
    <article class="sheet" aria-label="Stundenzettel Vorschau"><span class="stamp">ENTWURF · VORLAGE NICHT FREIGEGEBEN · SYNTHETISCH</span>
      <h1>STUNDENZETTEL</h1><p class="an">inTrend Planen und Bauen GmbH</p>
      <dl><dt>Bauvorhaben / Projekt</dt><dd>${cell(h.project)}</dd><dt>Projekt-Nr.</dt><dd>${cell(h.projectNo)}</dd><dt>Auftraggeber (AG)</dt><dd>${cell(h.client)}</dd>
        <dt>Stundenzettel-Nr.</dt><dd>${cell(h.number)}</dd><dt>Erstellungsdatum</dt><dd>${cell(dateDe(h.createdOn))}</dd></dl>
      <h3>PERSONAL</h3>
      <table><thead><tr><th>Arbeitsdatum</th><th>Personal</th><th>Ort</th><th>Tätigkeit</th><th>Beginn</th><th>Ende</th><th class="num">Pause (Min.)</th><th class="num">Stunden</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="sum"><span>GESAMTSTUNDEN${p.totalComplete || !p.rows.length ? '' : ' (unvollständig)'}${p.assumptions.length ? ' (vorläufig*)' : ''}</span><span>${esc(p.totalHoursText)}${p.assumptions.length ? '*' : ''}</span></div>
      ${p.assumptions.length ? '<p class="small">* In mindestens einer Zeile war die Pause nicht angegeben und wurde mit 0 Min. angenommen. Vorläufige Annahme, nicht bestätigt.</p>' : ''}
      <h3>BESCHREIBUNG</h3><p>${h.description.trim() ? esc(h.description).replace(/\n/g, '<br>') : '<span class="missing">—</span>'}</p>
      <h3>MATERIAL</h3>
      <div class="sum"><span>Materialkosten (Pauschalbetrag)</span><span class="${p.material.state === 'invalid' ? 'missing' : ''}">${esc(p.material.text)}</span></div>
      ${(p.attachments.photos.length || p.attachments.plans.length) ? `<p class="small">Anlagen: ${pl(p.attachments.photos.length, 'Foto', 'Fotos')}, ${pl(p.attachments.plans.length, 'Planausschnitt', 'Planausschnitte')} (Folgeseiten)</p>` : ''}
      <div class="sign"><div>Datum / Unterschrift inTrend</div><div>Datum / Unterschrift Auftraggeber (AG)</div></div>
    </article>
    ${p.attachments.photos.length ? `<article class="sheet att-page"><h1>Anlage · Fotos</h1><div class="photos">${figures(p.attachments.photos)}</div></article>` : ''}
    ${p.attachments.plans.length ? `<article class="sheet att-page"><h1>Anlage · Planausschnitt / Markierung</h1><div class="plans">${figures(p.attachments.plans)}</div></article>` : ''}`;
        $('side').innerHTML = `
    <details class="panel"><summary>Hinweise zu dieser Vorschau</summary><ul>${p.provisionalNotes.map(x => `<li>${esc(x)}</li>`).join('')}</ul></details>
    <details class="panel"><summary>Herkunft der Zeilen (intern)</summary>${p.sources.length
            ? `<p class="hint">Tag ${esc(draft.sourceKey.projectId)} / ${esc(draft.sourceKey.date)}; der ${esc(sourceName)} bleibt unverändert.</p><table><tr><th>Zeile</th><th>Mitarbeiter-ID</th><th>Eintrags-ID</th><th>Personenreferenz</th></tr>${p.sources.map((s, i) => `<tr><td>${i + 1}</td><td>${esc(s.employeeId)}</td><td>${esc(s.assignmentId)}</td><td>${esc(s.personRef)}</td></tr>`).join('')}</table>`
            : '<p class="hint">Keine Zeilen.</p>'}</details>
    <details class="panel"><summary>Nächste Schritte (nicht umgesetzt)</summary><ul>
      <li>E-Mail-Vorbereitung: Versand an den Auftraggeber zur Unterschrift (laut bisherigem Stand per E-Mail mit Anlage). Keine Outlook-Anbindung, kein Versand.</li>
      <li>Ablage: Speichern nach dem Versand (laut bisherigem Stand). Ort und Verfahren offen; keine Ablage, kein Status.</li>
      <li>LV-Zuordnung, Ist-Mengen, Nachtrag und Rechnung: außerhalb dieses Prototyps.</li></ul></details>`;
        const steps = [
            { id: '1', label: '1 · AUSWÄHLEN', strong: n ? pl(n, 'Eintrag', 'Einträge') : 'Noch keiner', sub: `aus dem ${sourceName}`, state: n ? 'done' : '', go: 'block-a' },
            { id: '2', label: '2 · ANGABEN', strong: headerMissing ? `${headerMissing} fehlen` : 'Vollständig', sub: 'Kopf, Material, Beschreibung', state: headerMissing ? (n ? 'warn' : '') : 'done', go: 'block-b' },
            { id: '3', label: '3 · PRÜFEN', strong: n ? p.totalHoursText : '–', sub: !n ? 'erst nach der Auswahl' : attention ? [p.hints.length && pl(p.hints.length, 'Hinweis', 'Hinweise'), p.assumptions.length && pl(p.assumptions.length, 'Annahme', 'Annahmen')].filter(Boolean).join(' · ') : 'keine Hinweise', state: !n ? '' : attention ? 'warn' : 'done', go: 'preview' },
            { id: '4', label: '4 · DRUCKEN', strong: 'Als PDF sichern', sub: 'Entwurf, nicht freigegeben', state: '', go: 'print' },
        ];
        const now = steps.findIndex(s => s.state !== 'done');
        $('steps').innerHTML = steps.map((s, i) => `<button type="button" class="step ${s.state ? `is-${s.state}` : ''} ${i === now ? 'is-now' : ''}" data-go="${s.go}"><small>${s.label}</small><strong>${esc(s.strong)}</strong><span>${esc(s.sub)}</span></button>`).join('');
        const badge = $('tab-badge');
        badge.hidden = !attention;
        badge.textContent = String(attention);
        $('nextbar-info').textContent = n ? `${pl(n, 'Eintrag', 'Einträge')} · ${p.totalHoursText}${attention ? ` · ${pl(attention, 'Hinweis', 'Hinweise')}` : ''}` : 'Noch kein Eintrag gewählt';
        fitDocument();
        options.onChange?.({ available, selected: selection.length });
    }
    const isCompact = () => window.matchMedia('(max-width:760px)').matches;
    function setView(view) {
        $('layout').dataset.view = view;
        app.dataset.view = view;
        $('tab-edit').setAttribute('aria-selected', String(view === 'edit'));
        $('tab-preview').setAttribute('aria-selected', String(view === 'preview'));
        if (window.matchMedia('(max-width:900px)').matches)
            window.scrollTo({ top: 0 });
    }
    function fitDocument() {
        const wrap = $('docwrap');
        wrap.style.setProperty('--doc-zoom', isCompact() ? '1' : String(Math.min(1, wrap.clientWidth / 794)));
    }
    function setSelection(next) {
        selection = next;
        draft = (0, timesheet_ts_2.reselectDraft)(report, draft, selection).draft;
        renderPickers();
        renderLines();
        renderPreview();
    }
    function refreshAll() { renderEditorFrame(); renderPickers(); renderLines(); renderAttachments(); renderPreview(); }
    $('editor').addEventListener('change', event => {
        const t = event.target;
        if (t.dataset.pick) {
            const [employeeId, assignmentId] = t.dataset.pick.split('|');
            setSelection(t.checked ? [...selection, { employeeId, assignmentId }] : selection.filter(s => key(s) !== t.dataset.pick));
            container.querySelector(`[data-pick="${CSS.escape(t.dataset.pick)}"]`)?.focus();
        }
    });
    $('editor').addEventListener('input', event => {
        const t = event.target;
        if (t.dataset.meta)
            draft.meta[t.dataset.meta] = t.value;
        else if (t.dataset.line) {
            const line = draft.lines[Number(t.dataset.line)];
            line[t.dataset.field] = t.value;
            const marker = t.closest('details')?.querySelector('summary > span:first-child');
            const has = changedFields(line).length > 0, shown = marker?.querySelector('[data-changed]');
            if (marker && has && !shown)
                marker.insertAdjacentHTML('beforeend', '<small class="changed" data-changed>im Stundenzettel geändert</small>');
            if (shown && !has)
                shown.remove();
        }
        else if (t.dataset.cap) {
            const a = draft.attachments.find(x => x.id === t.dataset.cap);
            if (a)
                a.caption = t.value;
        }
        else
            return;
        renderPreview();
    });
    $('editor').addEventListener('toggle', event => {
        const d = event.target;
        if (d.dataset.lineId)
            d.open ? openLines.add(d.dataset.lineId) : openLines.delete(d.dataset.lineId);
    }, true);
    $('editor').addEventListener('click', event => {
        const t = event.target;
        if (t.id === 'clear-sel')
            setSelection([]);
        else if (t.id === 'demo-meta' && options.demoMeta) {
            draft.meta = { ...options.demoMeta, materialAmount: draft.meta.materialAmount };
            refreshAll();
        }
        else if (t.id === 'add-photo') {
            (0, timesheet_ts_2.addAttachment)(draft, (0, demo_timesheet_ts_1.demoPhoto)(++photoCount));
            renderAttachments();
            renderPreview();
        }
        else if (t.id === 'add-plan') {
            (0, timesheet_ts_2.addAttachment)(draft, (0, demo_timesheet_ts_1.demoPlan)(++planCount));
            renderAttachments();
            renderPreview();
        }
        else if (t.dataset.del) {
            (0, timesheet_ts_2.removeAttachment)(draft, t.dataset.del);
            renderAttachments();
            renderPreview();
        }
    });
    $('steps').addEventListener('click', event => {
        const go = event.target.closest('[data-go]')?.dataset.go;
        if (!go)
            return;
        if (go === 'print') {
            setView('preview');
            window.print();
            return;
        }
        if (go === 'preview') {
            setView('preview');
            return;
        }
        setView('edit');
        $(go).scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    $('tabs').addEventListener('click', event => {
        const view = event.target.closest('[data-view]')?.dataset.view;
        if (view === 'edit' || view === 'preview')
            setView(view);
    });
    $('to-preview').addEventListener('click', () => setView('preview'));
    $('print').addEventListener('click', () => window.print());
    const observer = new ResizeObserver(fitDocument);
    observer.observe($('docwrap'));
    window.addEventListener('resize', fitDocument);
    setView('edit');
    refreshAll();
    return {
        getState: () => structuredClone({ selection, draft, photoCount, planCount }),
        destroy() { observer.disconnect(); window.removeEventListener('resize', fitDocument); container.innerHTML = ''; },
    };
}

},
"src/timesheet/timesheet.js": function (require, exports, module) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROVISIONAL_NOTES = exports.emptyMeta = void 0;
exports.createTimesheetDraft = createTimesheetDraft;
exports.reselectDraft = reselectDraft;
exports.lineMinutes = lineMinutes;
exports.parseEuroCents = parseEuroCents;
exports.addAttachment = addAttachment;
exports.removeAttachment = removeAttachment;
exports.buildPreview = buildPreview;
const time_ts_1 = require("../core/time.js");
const emptyMeta = () => ({ project: '', projectNo: '', client: '', number: '', createdOn: '', materialAmount: '', description: '' });
exports.emptyMeta = emptyMeta;
function createTimesheetDraft(report, selection, meta = {}) {
    const keyOf = (employeeId, assignmentId) => JSON.stringify([employeeId, assignmentId]);
    const wanted = new Map(selection.map(item => [keyOf(item.employeeId, item.assignmentId), item]));
    const lines = [];
    for (const employee of report.employees) {
        for (const assignment of employee.assignments) {
            if (!wanted.delete(keyOf(employee.id, assignment.id)))
                continue;
            lines.push({
                source: { projectId: report.projectId, date: report.date, employeeId: employee.id, assignmentId: assignment.id, personRef: employee.personRef },
                workDate: report.date,
                name: employee.name,
                start: assignment.start,
                end: assignment.end,
                breakMin: assignment.breakMin,
                location: assignment.locations.join(', '),
                work: assignment.work.trim() || assignment.lv.trim(),
            });
        }
    }
    const draft = {
        sourceKey: { projectId: report.projectId, date: report.date },
        meta: { ...(0, exports.emptyMeta)(), ...meta },
        lines,
        attachments: [],
    };
    const unresolved = [...wanted.values()].map(({ employeeId, assignmentId }) => ({ employeeId, assignmentId }));
    return { draft, unresolved };
}
function reselectDraft(report, draft, selection) {
    const { draft: fresh, unresolved } = createTimesheetDraft(report, selection, draft.meta);
    const edited = new Map(draft.lines.map(line => [JSON.stringify([line.source.employeeId, line.source.assignmentId]), line]));
    fresh.lines = fresh.lines.map(line => {
        const kept = edited.get(JSON.stringify([line.source.employeeId, line.source.assignmentId]));
        return kept ? { ...kept, source: { ...kept.source } } : line;
    });
    fresh.attachments = draft.attachments.map(attachment => ({ ...attachment }));
    return { draft: fresh, unresolved };
}
function lineMinutes(line) {
    const issues = [], assumed = [];
    const start = (0, time_ts_1.toMinutes)(line.start), end = (0, time_ts_1.toMinutes)(line.end);
    if (!line.start.trim())
        issues.push('Beginn fehlt');
    else if (start === null)
        issues.push('Beginn ungültig');
    if (!line.end.trim())
        issues.push('Ende fehlt');
    else if (end === null)
        issues.push('Ende ungültig');
    if (start !== null && end !== null && end <= start)
        issues.push('Ende liegt nicht nach dem Beginn');
    const rawBreak = line.breakMin.trim();
    let pause = 0;
    if (!rawBreak)
        assumed.push('Pause nicht angegeben, als 0 Min. angenommen');
    else if (!/^\d+$/.test(rawBreak))
        issues.push('Pause ungültig');
    else
        pause = Number(rawBreak);
    if (!issues.length && start !== null && end !== null && pause > end - start)
        issues.push('Pause ist länger als die Zeitspanne');
    if (issues.length || start === null || end === null)
        return { minutes: null, issues, assumed };
    return { minutes: end - start - pause, issues, assumed };
}
function parseEuroCents(text) {
    const value = text.trim();
    let match = /^(\d{1,3}(?:\.\d{3})+)(?:,(\d{1,2}))?$/.exec(value);
    let whole, fraction;
    if (match) {
        whole = match[1].replaceAll('.', '');
        fraction = match[2];
    }
    else if ((match = /^(\d+)(?:[.,](\d{1,2}))?$/.exec(value))) {
        whole = match[1];
        fraction = match[2];
    }
    else
        return null;
    return Number(whole) * 100 + Number((fraction ?? '').padEnd(2, '0') || '0');
}
const formatEuro = (cents) => {
    const whole = String(Math.floor(cents / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${whole},${String(cents % 100).padStart(2, '0')} €`;
};
const formatHours = (minutes) => `${(minutes / 60).toFixed(2).replace('.', ',')} h`;
const KINDS = ['photo', 'plan'];
function addAttachment(draft, attachment) {
    if (!KINDS.includes(attachment.kind))
        throw new Error(`Unknown attachment kind: ${String(attachment.kind)}`);
    if (!attachment.id || !attachment.ref)
        throw new Error('Attachment needs an id and a reference');
    if (draft.attachments.some(existing => existing.id === attachment.id))
        throw new Error(`Duplicate attachment id: ${attachment.id}`);
    draft.attachments.push({ ...attachment });
}
function removeAttachment(draft, id) {
    const index = draft.attachments.findIndex(attachment => attachment.id === id);
    if (index < 0)
        return false;
    draft.attachments.splice(index, 1);
    return true;
}
exports.PROVISIONAL_NOTES = [
    'Vorläufige Stunden: Ende − Beginn − Pause. Eine Rundungsregel ist nicht freigegeben; die Dezimalanzeige ist nur gerundet dargestellt.',
    'Pausenbehandlung, Validierung und Abrechnungsregeln sind nicht freigegeben. Keine Aussage über Vergütung oder Ansprüche.',
    'Struktur angelehnt an die Vorlage V11; V11 ist keine freigegebene Vorlage.',
];
function buildPreview(draft) {
    const hints = [];
    const { meta } = draft;
    const need = (value, text) => { if (!value.trim())
        hints.push(text); };
    need(meta.project, 'Bauvorhaben / Projekt fehlt');
    need(meta.projectNo, 'Projekt-Nr. fehlt');
    need(meta.client, 'Auftraggeber fehlt');
    need(meta.number, 'Stundenzettel-Nr. fehlt');
    need(meta.createdOn, 'Erstellungsdatum fehlt');
    if (!draft.lines.length)
        hints.push('Kein Eintrag ausgewählt');
    const rows = draft.lines.map((line, index) => {
        const label = (0, time_ts_1.employeeLabel)({ name: line.name }, index);
        const result = lineMinutes(line);
        if (!line.name.trim())
            hints.push(`${label}: Name fehlt`);
        if (!line.workDate.trim())
            hints.push(`${label}: Arbeitsdatum fehlt`);
        result.issues.forEach(issue => hints.push(`${label}: ${issue}`));
        if (!line.location.trim())
            hints.push(`${label}: Ort fehlt`);
        if (!line.work.trim())
            hints.push(`${label}: Tätigkeit fehlt`);
        return {
            index, label, source: { ...line.source }, workDate: line.workDate, name: line.name, start: line.start, end: line.end,
            breakMin: line.breakMin, location: line.location, work: line.work,
            minutes: result.minutes, hoursText: result.minutes === null ? '–' : formatHours(result.minutes),
            issues: result.issues, assumed: result.assumed,
        };
    });
    const totalMinutes = rows.reduce((sum, row) => sum + (row.minutes ?? 0), 0);
    const totalComplete = rows.length > 0 && rows.every(row => row.minutes !== null);
    const rawMaterial = meta.materialAmount.trim();
    const cents = rawMaterial ? parseEuroCents(rawMaterial) : null;
    const material = !rawMaterial
        ? { state: 'none', cents: null, text: 'nicht angegeben' }
        : cents === null
            ? { state: 'invalid', cents: null, text: rawMaterial }
            : { state: 'ok', cents, text: formatEuro(cents) };
    if (material.state === 'invalid')
        hints.push('Materialkosten: ungültiger Betrag');
    const assumptions = rows.flatMap(row => row.assumed.map(text => `${row.label}: ${text}`));
    return {
        header: { project: meta.project, projectNo: meta.projectNo, client: meta.client, number: meta.number, createdOn: meta.createdOn, description: meta.description },
        rows,
        totalMinutes,
        totalComplete,
        totalHoursText: formatHours(totalMinutes),
        material,
        attachments: {
            photos: draft.attachments.filter(a => a.kind === 'photo'),
            plans: draft.attachments.filter(a => a.kind === 'plan'),
        },
        hints,
        assumptions,
        provisionalNotes: [...exports.PROVISIONAL_NOTES],
        sources: rows.map(row => ({ ...row.source })),
    };
}

},
"src/demo/demo-timesheet.js": function (require, exports, module) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEMO_META = exports.DEMO_DATE = exports.DEMO_PROJECT_ID = void 0;
exports.createDemoDayReport = createDemoDayReport;
exports.demoPhoto = demoPhoto;
exports.demoPlan = demoPlan;
const factories_ts_1 = require("../core/factories.js");
const day_report_ts_1 = require("../state/day-report.js");
exports.DEMO_PROJECT_ID = 'demo-projekt-alpha';
exports.DEMO_DATE = '2026-11-12';
exports.DEMO_META = {
    project: 'Demo-Bauvorhaben Alpha',
    projectNo: 'DEMO-00',
    client: 'Demo-Auftraggeber GmbH',
    number: 'DEMO-STD-01',
    createdOn: exports.DEMO_DATE,
    materialAmount: '',
    description: 'Demonstrationstext: Zusätzliche Abdeck- und Anpassarbeiten (synthetisch, kein realer Vorgang).',
};
function createDemoDayReport() {
    const report = (0, day_report_ts_1.emptyDayReport)({ projectId: exports.DEMO_PROJECT_ID, date: exports.DEMO_DATE });
    const person = (name, personRef, pseudonym = false) => ({ ...(0, factories_ts_1.newEmployee)({ name, personRef, pseudonym }) });
    const rows = [
        { ...person('Demo-Person 01', 'own-01'), assignments: [
                (0, factories_ts_1.newAssignment)({ start: '07:00', end: '12:00', breakMin: '30', work: 'Wände', locations: ['Flur'] }),
                (0, factories_ts_1.newAssignment)({ start: '12:30', end: '16:00', breakMin: '', work: 'Spachteln', locations: ['Flur'] }),
            ] },
        { ...person('Demo-Person 02', 'own-02'), assignments: [
                (0, factories_ts_1.newAssignment)({ start: '07:00', end: '16:00', breakMin: '60', work: 'Wände', locations: ['Treppenhaus'] }),
            ] },
        { ...person('Demo-Person 03', 'own-03'), assignments: [
                (0, factories_ts_1.newAssignment)({ start: '07:30', end: '15:30', breakMin: '45', work: 'Deckenunterkonstruktion', locations: ['Erdgeschoss'] }),
            ] },
        { ...person('Demo-Person 04', 'own-04'), assignments: [
                (0, factories_ts_1.newAssignment)({ start: '08:00', end: '', breakMin: '15', work: 'Decken', locations: [] }),
            ] },
        { ...person('Alpha Monteur-1', 'sub-alpha-01', true), assignments: [
                (0, factories_ts_1.newAssignment)({ start: '07:00', end: '15:00', breakMin: '30', work: 'Wände', locations: ['Zweites Obergeschoss'] }),
            ] },
        { ...person('Demo-Person 05', 'own-05'), assignments: [
                (0, factories_ts_1.newAssignment)({ start: '09:00', end: '11:00', breakMin: '0', work: 'Schutzfolie anbringen', locations: ['Erdgeschoss'] }),
            ] },
    ];
    report.employees = rows.map(({ collapsed, selected, prefill, ...data }) => data);
    return report;
}
const svgUri = (svg) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
function demoPhoto(index) {
    const hue = 24 + (index * 17) % 40, shift = (index * 23) % 60;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
<rect width="400" height="300" fill="hsl(${hue},8%,38%)"/>
<polygon points="0,0 400,0 300,90 100,90" fill="hsl(${hue},8%,52%)"/>
<polygon points="0,0 100,90 100,230 0,300" fill="hsl(${hue},10%,30%)"/>
<polygon points="400,0 300,90 300,230 400,300" fill="hsl(${hue},10%,44%)"/>
<rect x="150" y="${110 + shift / 4}" width="100" height="120" fill="hsl(${hue},20%,70%)"/>
<rect x="100" y="230" width="200" height="70" fill="hsl(${hue},6%,26%)"/>
<text x="200" y="285" font-family="Helvetica,Arial,sans-serif" font-size="15" fill="#fff" text-anchor="middle">SYNTHETISCHES DEMOFOTO ${index}</text></svg>`;
    return { id: `demo-photo-${index}`, kind: 'photo', name: `demo-foto-${index}.svg`, ref: svgUri(svg), caption: `Demo-Foto ${index} (synthetisch)` };
}
function demoPlan(index) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260">
<rect width="400" height="260" fill="#fff"/><rect x="20" y="20" width="360" height="200" fill="none" stroke="#333" stroke-width="3"/>
<path d="M20 110H150M150 20V220M150 140H380M270 140V220" stroke="#333" stroke-width="2" fill="none"/>
<rect x="160" y="150" width="100" height="62" fill="rgba(220,40,40,.15)" stroke="#d22" stroke-width="4"/>
<text x="210" y="186" font-family="Helvetica,Arial,sans-serif" font-size="13" fill="#d22" text-anchor="middle">Markierung ${index}</text>
<text x="200" y="245" font-family="Helvetica,Arial,sans-serif" font-size="13" fill="#555" text-anchor="middle">SYNTHETISCHER DEMO-PLANAUSSCHNITT</text></svg>`;
    return { id: `demo-plan-${index}`, kind: 'plan', name: `demo-plan-${index}.svg`, ref: svgUri(svg), caption: `Demo-Planausschnitt ${index}, Markierung (synthetisch)` };
}

},
"src/core/time.js": function (require, exports, module) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeeLabel = exports.normalizeName = exports.fromMinutes = exports.toMinutes = void 0;
const toMinutes = (value) => {
    const match = /^(\d{2}):(\d{2})$/.exec(value || '');
    if (!match)
        return null;
    const hours = Number(match[1]), minutes = Number(match[2]);
    return hours < 24 && minutes < 60 ? hours * 60 + minutes : null;
};
exports.toMinutes = toMinutes;
const fromMinutes = (total) => `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
exports.fromMinutes = fromMinutes;
const normalizeName = (name) => String(name || '').trim().replace(/\s+/g, ' ').toLowerCase();
exports.normalizeName = normalizeName;
const employeeLabel = (employee, index) => employee.name.trim() || `Mitarbeiter ${index + 1} (ohne Namen)`;
exports.employeeLabel = employeeLabel;

},
"src/core/factories.js": function (require, exports, module) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newEvent = exports.newEmployee = exports.newAssignment = void 0;
const ids_ts_1 = require("./ids.js");
const newAssignment = (data = {}) => ({
    id: (0, ids_ts_1.nextId)('a'), start: '', end: '', breakMin: '', work: '', lv: '', locations: [], locationDraft: '', photos: [], ...data
});
exports.newAssignment = newAssignment;
const newEmployee = (data = {}) => ({
    id: (0, ids_ts_1.nextId)('e'), name: '', collapsed: false, selected: false, prefill: '', personRef: '', pseudonym: false,
    assignments: [(0, exports.newAssignment)()], ...data
});
exports.newEmployee = newEmployee;
const newEvent = (reasons = [], data = {}) => ({
    id: (0, ids_ts_1.nextId)('v'), reasons: [].concat(reasons).filter(Boolean), location: '', description: '', people: [], ...data
});
exports.newEvent = newEvent;

},
"src/state/day-report.js": function (require, exports, module) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emptyDayReport = exports.emptyExtras = exports.defaultEmployeeView = void 0;
exports.splitEmployees = splitEmployees;
exports.joinEmployees = joinEmployees;
exports.applyPrefill = applyPrefill;
const prefill_ts_1 = require("../core/prefill.js");
const defaultEmployeeView = () => ({ collapsed: false, selected: false, prefill: '' });
exports.defaultEmployeeView = defaultEmployeeView;
const emptyExtras = () => ({ equipment: '', material: '', contacts: '' });
exports.emptyExtras = emptyExtras;
const emptyDayReport = (key) => ({ ...key, employees: [], events: [], extras: (0, exports.emptyExtras)() });
exports.emptyDayReport = emptyDayReport;
function splitEmployees(employees) {
    const view = { employees: {} };
    const data = employees.map(({ collapsed, selected, prefill, ...rest }) => {
        view.employees[rest.id] = { collapsed, selected, prefill };
        return rest;
    });
    return { data, view };
}
function joinEmployees(data, view) {
    return data.map(employee => ({ ...employee, ...(0, exports.defaultEmployeeView)(), ...view.employees[employee.id] }));
}
function applyPrefill(report, view, entries, source) {
    const result = (0, prefill_ts_1.prefillEmployees)(joinEmployees(report.employees, view), entries, source);
    const { data, view: nextView } = splitEmployees(result.employees);
    return { report: { ...report, employees: data }, view: nextView, added: result.added, skipped: result.skipped };
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
"src/core/prefill.js": function (require, exports, module) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPristine = void 0;
exports.prefillEmployees = prefillEmployees;
const factories_ts_1 = require("./factories.js");
const time_ts_1 = require("./time.js");
const isPristine = (employee) => !employee.name.trim() && employee.assignments.length === 1
    && ['start', 'end', 'breakMin', 'work', 'lv', 'locationDraft'].every(key => !employee.assignments[0][key])
    && !employee.assignments[0].locations.length && !employee.assignments[0].photos.length;
exports.isPristine = isPristine;
function prefillEmployees(employees, entries, source) {
    const kept = employees.filter(employee => !(0, exports.isPristine)(employee));
    const knownNames = new Set(kept.map(employee => (0, time_ts_1.normalizeName)(employee.name)).filter(Boolean));
    const knownRefs = new Set(kept.map(employee => employee.personRef).filter(Boolean));
    let added = 0, skipped = 0;
    entries.forEach(entry => {
        if (typeof entry === 'string') {
            const key = (0, time_ts_1.normalizeName)(entry);
            if (knownNames.has(key)) {
                skipped += 1;
                return;
            }
            knownNames.add(key);
            kept.push((0, factories_ts_1.newEmployee)({ name: entry, collapsed: true, prefill: source }));
        }
        else {
            if (knownRefs.has(entry.id)) {
                skipped += 1;
                return;
            }
            knownRefs.add(entry.id);
            kept.push((0, factories_ts_1.newEmployee)({ name: entry.label, personRef: entry.id, pseudonym: entry.group === 'sub', collapsed: true, prefill: source }));
        }
        added += 1;
    });
    return { employees: kept, added, skipped };
}

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
  globalThis.StundenzettelApp = Object.freeze(Object.assign({}, load("preview/stundenzettel-app.js"), { css: ":root,:host{--ink:#14252c;--muted:#40594e;--line:#c8d7cc;--line-strong:#9eafa3;--paper:#f5f7f4;--teal:#0a665e;--teal-d:#084f47;--teal-b:#0b5d4d;--lime:#d5f28a;--rail:#11242c;\n  --chip:#e5f3e9;--chip-ink:#1c573a;--note-bg:#fff6e8;--note-ink:#63380d;--note-line:#c88736;--ok-bg:#edf7ee;--ok-ink:#1e5837;--red:#8a2418;--focus:#73b99b;\n  color-scheme:light;font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,\"Segoe UI\",sans-serif;color:var(--ink);background:var(--paper)}\n*{box-sizing:border-box}\nbody{margin:0;font-size:14px;line-height:1.45;background:var(--paper)}\n:host{display:block;font-size:14px;line-height:1.45;background:var(--paper)}\nbutton,input,select,textarea{font:inherit}\nbutton{cursor:pointer}\n:is(input,textarea,select,button,summary):focus-visible{outline:3px solid var(--focus);outline-offset:2px}\nh1,h2,h3,p{margin-top:0}\n[hidden]{display:none!important}\n.topbar{display:flex;align-items:center;justify-content:space-between;gap:12px;background:var(--rail);color:#eef4ee;padding:10px 24px}\n.brand{display:flex;align-items:center;gap:11px}\n.brand-mark{display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:11px;background:var(--lime);color:#15352e;font-size:22px;font-weight:900;letter-spacing:-3px}\n.brand-mark span{color:#e56d36}\n.brand strong{display:block;font-size:19px;letter-spacing:-1px;line-height:1.1}\n.brand small{display:block;white-space:nowrap;font-size:9px;letter-spacing:2.2px;color:#afc0bc;font-weight:800}\n.demo-chip{white-space:nowrap;border:1px solid #3b5560;border-radius:99px;padding:6px 11px;font-size:10px;font-weight:800;letter-spacing:.8px;color:#cfe0da}\n.page{max-width:1480px;margin:0 auto;padding:22px 24px 40px}\n.page-head{margin-bottom:16px}\n.eyebrow{color:#345c4d;font-size:11px;font-weight:800;letter-spacing:2px;margin:0 0 6px}\n.page-head h1{font-size:clamp(28px,3.2vw,42px);letter-spacing:-1.2px;line-height:1.1;margin:0 0 8px}\n.page-head h1 span{color:var(--teal)}\n.page-head p:last-child{color:var(--muted);font-size:14px;max-width:760px;margin:0}\n.steps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:0 0 16px}\n.step{display:grid;gap:2px;text-align:left;border:1px solid var(--line);border-radius:12px;background:#fff;padding:10px 12px;color:var(--ink);min-height:62px}\n.step small{font-size:10px;font-weight:800;letter-spacing:.8px;color:var(--muted)}\n.step strong{font-size:15px;line-height:1.25}\n.step span{font-size:12px;color:var(--muted)}\n.step.is-done{border-color:#7fae92;background:var(--ok-bg)}\n.step.is-warn{border-color:var(--note-line);background:var(--note-bg)}\n.step.is-warn span{color:var(--note-ink)}\n.step.is-now{box-shadow:inset 0 -3px 0 var(--teal)}\n.tabs,.nextbar{display:none}\n.layout{display:grid;grid-template-columns:minmax(340px,430px) minmax(0,1fr);gap:20px;align-items:start}\n.editor{display:grid;gap:12px;min-width:0}\n.preview{min-width:0;position:sticky;top:12px;max-height:calc(100vh - 24px);overflow:auto;padding-right:2px}\n.block{min-width:0;border:1px solid var(--line);border-radius:12px;background:#fff;padding:14px 16px}\nh2{display:flex;align-items:center;gap:9px;font-size:17px;letter-spacing:-.3px;margin:0 0 10px}\n.letter{display:inline-grid;place-items:center;width:24px;height:24px;border-radius:7px;background:#c9e4d3;color:#0c4a38;font-size:12px;font-weight:900;flex:none}\n.heading-row{display:flex;justify-content:space-between;align-items:baseline;gap:12px}\n.heading-row>span{color:var(--muted);font-size:12px;white-space:nowrap}\n.hint{margin:0 0 8px;color:var(--muted);font-size:12px;line-height:1.45}\nlabel{display:block;color:#263e34;font-size:13px;font-weight:700;margin:10px 0 4px}\ninput,textarea,select{width:100%;min-width:0;border:1px solid var(--line-strong);border-radius:10px;background:#fff;color:var(--ink);padding:8px 10px;min-height:42px}\ntextarea{min-height:72px;line-height:1.45;resize:vertical}\ninput::placeholder,textarea::placeholder{color:#53685c;opacity:1}\n.grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:end}\n.grid3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}\n.grid2>div,.grid3>div{min-width:0}\n.span2{grid-column:1/-1}\n.btn-primary{min-height:44px;border:0;border-radius:12px;background:var(--teal);color:#fff;font-weight:800;padding:0 18px;box-shadow:0 6px 15px #0b665c25}\n.btn-primary:hover{background:var(--teal-d)}\n.btn-outline{min-height:40px;border:1.5px solid var(--teal-b);border-radius:10px;background:#fff;color:#064a3e;font-weight:800;padding:0 12px;font-size:13px}\n.btn-outline:hover{background:#eff8f0}\n.btn-link{border:0;background:transparent;color:var(--teal-b);font-weight:800;font-size:13px;min-height:36px;padding:0 4px}\n.btn-link.danger{color:var(--red)}\n.actions{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:10px}\n.pickers{border-top:1px solid var(--line)}\n.pick{display:grid;grid-template-columns:26px minmax(0,1fr) auto;gap:4px 10px;align-items:center;margin:0;padding:7px 4px;border-bottom:1px solid #e2eae4;font-weight:400;cursor:pointer;min-height:48px}\n.pick:hover{background:#f4f9f5}\n.pick.is-on{background:#edf7ee}\n.pick input{width:20px;height:20px;min-height:0;margin:0;accent-color:var(--teal)}\n.pick-main{min-width:0;display:grid}\n.pick-main b{font-size:13px;color:var(--ink)}\n.pick-main small{color:var(--muted);font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.pick-time{font-size:12px;color:#263e34;font-variant-numeric:tabular-nums;text-align:right;white-space:nowrap}\n.pick-time em{display:block;font-style:normal;color:#7a3f00;font-weight:800;font-size:11px}\n.line{border:1px solid var(--line);border-radius:10px;background:#fafcfa;margin-top:8px}\n.line summary{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:44px;padding:4px 12px;cursor:pointer;font-weight:700;font-size:13px;list-style:none}\n.line summary::-webkit-details-marker{display:none}\n.line summary::after{content:'▾';color:var(--teal);font-size:14px}\n.line[open] summary::after{content:'▴'}\n.line summary small{color:var(--muted);font-weight:400;margin-left:6px}\n.line .body{padding:0 12px 12px}\n.warn{color:#7a3f00;font-weight:800;font-size:12px}\n.line summary small.changed{display:inline-block;margin-left:8px;padding:1px 7px;border-radius:99px;background:#fff0d8;color:#704113;font-weight:800;font-size:11px}\n.att{display:grid;grid-template-columns:56px minmax(0,1fr) auto;gap:8px;align-items:center;margin-top:8px}\n.att img{width:56px;height:40px;object-fit:cover;border:1px solid var(--line);border-radius:6px;background:#eef3ef}\n.empty{margin:0;padding:12px;color:var(--muted);background:#eef3ef;border-radius:10px;font-size:13px}\n.note{margin:0 0 10px;padding:10px 12px;border-left:3px solid var(--note-line);background:var(--note-bg);color:var(--note-ink);font-size:13px;border-radius:0 8px 8px 0}\n.note strong{display:block;margin-bottom:2px}\n.note ul{margin:4px 0 0;padding-left:18px}\n.note.ok{border-left-color:#4c9a6a;background:var(--ok-bg);color:var(--ok-ink)}\n.preview-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px}\n.preview-head h2{margin:0;margin-right:auto}\n.status{display:inline-block;padding:6px 10px;border-radius:20px;background:#e9f3ed;color:var(--chip-ink);font-size:12px;font-weight:850}\n.status.is-incomplete{background:#fff0d8;color:#704113}\n.badge{display:inline-grid;place-items:center;min-width:20px;height:20px;border-radius:10px;background:var(--note-line);color:#fff;font-size:11px;font-weight:800;padding:0 6px}\n.panel{margin-top:10px;border:1px dashed var(--line);border-radius:12px;padding:2px 14px;color:var(--muted);background:#fff;font-size:13px}\n.panel summary{cursor:pointer;min-height:40px;padding-top:10px;font-weight:800;color:var(--ink)}\n.panel ul{margin:0 0 10px;padding-left:18px}.panel li{margin:3px 0}\n.panel table{border-collapse:collapse;width:100%;font-size:12px;margin-bottom:10px}\n.panel td,.panel th{border:1px solid var(--line);padding:3px 6px;text-align:left}\n#docwrap{--doc-zoom:1;min-width:0}\n.sheet{background:#fff;color:#111;width:794px;zoom:var(--doc-zoom);margin:0 0 14px;padding:36px 40px;border:1px solid #b9c2bd;box-shadow:0 2px 8px #0002;position:relative;font-family:Helvetica,Arial,sans-serif;font-size:13px;line-height:1.4}\n.sheet h1{font-size:26px;letter-spacing:0;margin:0}.sheet .an{color:#444;margin:0 0 14px}\n.sheet .stamp{position:absolute;top:14px;right:16px;border:2px solid #b3261e;color:#b3261e;padding:2px 8px;font-weight:700;font-size:11px;transform:rotate(3deg)}\n.sheet dl{display:grid;grid-template-columns:150px 1fr;gap:3px 12px;margin:0 0 12px}.sheet dt{color:#555}.sheet dd{margin:0}\n.sheet h3{font-size:13px;letter-spacing:.06em;background:#e6e9ee;padding:3px 8px;margin:14px 0 6px;border:0}\n.sheet table{width:100%;border-collapse:collapse;font-size:12.5px}\n.sheet th,.sheet td{border:1px solid #999;padding:4px 6px;text-align:left;vertical-align:top}\n.sheet td.num,.sheet th.num{text-align:right;white-space:nowrap}\n.sheet .missing{color:#b3261e;font-style:italic}\n.sheet .sum{display:flex;justify-content:space-between;margin-top:6px;font-weight:700}\n.sheet .small{font-size:11px;color:#555;margin:2px 0}\n.sign{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:46px}\n.sign div{border-top:1px solid #111;padding-top:3px;font-size:12px;color:#444}\n.photos{display:grid;grid-template-columns:1fr 1fr;gap:10px}\n.photos figure,.plans figure{margin:0;break-inside:avoid}.photos img,.plans img{width:100%;border:1px solid #999;display:block}\n.sheet figcaption{font-size:11px;color:#555}\n.sheet.att-page{break-before:page}\n.screen-only{display:inline}\n@media screen and (max-width:1180px){.layout{grid-template-columns:minmax(320px,380px) minmax(0,1fr);gap:16px}.page{padding:18px 16px 32px}.topbar{padding:10px 16px}}\n@media screen and (max-width:900px){\n  .page{padding:14px 12px 96px}\n  .steps{grid-template-columns:repeat(2,minmax(0,1fr))}\n  .tabs{display:grid;grid-template-columns:1fr 1fr;gap:6px;position:sticky;top:0;z-index:5;background:var(--paper);padding:6px 0;margin-bottom:10px}\n  .tabs button{min-height:44px;border:1.5px solid var(--teal-b);border-radius:10px;background:#fff;color:#064a3e;font-weight:800}\n  .tabs button[aria-selected=true]{background:var(--teal);color:#fff;border-color:var(--teal)}\n  .layout{display:block}\n  .layout[data-view=edit] .preview,.layout[data-view=preview] .editor{display:none}\n  .preview{position:static;max-height:none;overflow:visible}\n  .nextbar{display:flex;position:fixed;left:0;right:0;bottom:var(--sz-bottom,0px);z-index:6;gap:10px;align-items:center;justify-content:space-between;background:#fff;border-top:1px solid var(--line);padding:10px 12px;box-shadow:0 -4px 14px #0001}\n  .sz-app[data-view=preview] .nextbar{display:none}\n  .nextbar span{font-size:12px;color:var(--muted);min-width:0}\n}\n@media screen and (max-width:760px){\n  .topbar .demo-chip{font-size:9px;padding:5px 8px;letter-spacing:.2px}\n  input,textarea,select{font-size:16px;min-height:44px}\n  .btn-outline,.btn-link{min-height:44px}\n  .preview-head .btn-primary{width:100%;order:3}\n  .grid2.keep{grid-template-columns:1fr 1fr}\n  \n  .sheet{width:auto;zoom:1;padding:20px 16px}\n  .sheet .stamp{position:static;display:inline-block;transform:none;margin-bottom:8px}\n  .sheet dl{grid-template-columns:1fr;gap:0}.sheet dt{margin-top:6px;font-size:11px}\n  .sheet table,.sheet tbody,.sheet tr,.sheet td{display:block;width:100%}\n  .sheet thead{display:none}\n  .sheet tr{border:1px solid #999;margin-bottom:8px;padding:2px 0}\n  .sheet td{border:0;padding:2px 8px;display:flex;justify-content:space-between;gap:12px;text-align:right}\n  .sheet td::before{content:attr(data-label);color:#555;text-align:left;flex:none}\n  .sheet td.num,.sheet td{white-space:normal}\n  .photos{grid-template-columns:1fr}.sign{gap:20px}\n}\n@media screen and (max-width:420px){.steps{gap:8px}.step strong{font-size:14px}.grid3{grid-template-columns:1fr 1fr}.grid3>div:nth-child(3){grid-column:1/-1}}\n@media print{\n  @page{size:A4;margin:12mm}\n  :root,:host,html,body{background:#fff!important}\n  .topbar,.page-head,.steps,.tabs,.nextbar,.editor,.preview-head,#hints,#side,.screen-only{display:none!important}\n  .page{max-width:none;padding:0}.layout{display:block}.preview{position:static;max-height:none;overflow:visible;padding:0;display:block!important}\n  .sheet{zoom:1!important;width:auto;margin:0 0 0;border:0;box-shadow:none;padding:0}\n  .sheet .missing{color:#111;font-style:normal}\n}\n.sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}\n.subhead{font-size:13px;margin:16px 0 0;padding-top:12px;border-top:1px solid var(--line)}" }, { build: "sha256:6b84e0b5f47d69a2" }));
})();
