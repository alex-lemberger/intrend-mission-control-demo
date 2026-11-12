import { InMemoryRepository } from "../src/repository/in-memory-repository.js";
import { lineMinutes } from "../src/timesheet/timesheet.js";
import { createDemoDayReport, DEMO_DATE, DEMO_META, DEMO_PROJECT_ID, demoPhoto, demoPlan } from "../src/demo/demo-timesheet.js";
import { addAttachment, buildPreview, createTimesheetDraft, removeAttachment, reselectDraft } from "../src/timesheet/timesheet.js";
const $ = (id) => document.getElementById(id);
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const key = (s) => `${s.employeeId}|${s.assignmentId}`;
const pl = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const repository = new InMemoryRepository();
await repository.save(createDemoDayReport());
const report = (await repository.load({ projectId: DEMO_PROJECT_ID, date: DEMO_DATE }));
let selection = [];
let draft = createTimesheetDraft(report, selection).draft;
let photoCount = 0, planCount = 0;
const openLines = new Set();
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
    <p class="hint">Nur ausdrücklich gewählte Einträge kommen in den Stundenzettel. Der Tagesbericht bleibt unverändert.</p>
    <div class="pickers" id="pickers"></div>
    <div class="actions"><button type="button" class="btn-link" id="clear-sel">Auswahl leeren</button></div></div>
  <div class="block" id="block-b"><h2><span class="letter">B</span>Angaben ergänzen</h2>
    <div class="grid2">${meta}
      <div><label for="m-materialAmount">Materialkosten (Pauschale, €)</label><input id="m-materialAmount" data-meta="materialAmount" inputmode="decimal" placeholder="z. B. 250,00" value="${esc(draft.meta.materialAmount)}"></div>
      <div class="span2"><label for="m-description">Beschreibung der Arbeiten</label><textarea id="m-description" data-meta="description" rows="3">${esc(draft.meta.description)}</textarea></div></div>
    <div class="actions"><button type="button" class="btn-outline" id="demo-meta">Demo-Angaben einfügen</button></div>
    <h3 class="subhead" id="lines-head"></h3><div id="lines"></div></div>
  <div class="block" id="block-c"><div class="heading-row"><h2><span class="letter">C</span>Anhänge</h2><span>optional</span></div>
    <p class="hint">Fotos und Planausschnitte sind nicht verpflichtend. Hier nur synthetische Platzhalter.</p>
    <div id="atts"></div>
    <div class="actions"><button type="button" class="btn-outline" id="add-photo">+ Demo-Foto</button><button type="button" class="btn-outline" id="add-plan">+ Demo-Planausschnitt</button></div></div>`;
}
function renderPickers() {
    $('pickers').innerHTML = report.employees.flatMap(employee => employee.assignments.map(a => {
        const sel = { employeeId: employee.id, assignmentId: a.id };
        const on = selection.some(s => key(s) === key(sel));
        const problem = lineMinutes({ start: a.start, end: a.end, breakMin: a.breakMin }).issues[0];
        return `<label class="pick${on ? ' is-on' : ''}"><input type="checkbox" data-pick="${esc(key(sel))}" ${on ? 'checked' : ''}>
      <span class="pick-main"><b>${esc(employee.name)}</b><small>${esc(a.work || a.lv || 'ohne Tätigkeit')} · ${esc(a.locations.join(', ') || 'ohne Ort')}</small></span>
      <span class="pick-time">${esc(a.start || '?')}–${esc(a.end || '?')} · P ${esc(a.breakMin || '–')}${problem ? `<em>${esc(problem)}</em>` : ''}</span></label>`;
    })).join('');
    $('pick-count').textContent = `${selection.length} von ${report.employees.reduce((n, e) => n + e.assignments.length, 0)} gewählt`;
}
function renderLines() {
    const p = buildPreview(draft);
    $('lines-head').textContent = draft.lines.length ? `Zeilen im Dokument (${draft.lines.length})` : 'Zeilen im Dokument';
    $('lines').innerHTML = draft.lines.map((line, i) => {
        const row = p.rows[i], id = line.source.assignmentId;
        return `<details class="line" data-line-id="${esc(id)}" ${openLines.has(id) ? 'open' : ''}><summary><span>${esc(line.name || `Zeile ${i + 1}`)}<small>${esc(line.start || '?')}–${esc(line.end || '?')}</small></span>${row.issues.length ? `<span class="warn">${esc(row.issues[0])}</span>` : ''}</summary>
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
    const p = buildPreview(draft);
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
        ? `<p class="hint">Tag ${esc(draft.sourceKey.projectId)} / ${esc(draft.sourceKey.date)}; der Tagesbericht bleibt unverändert.</p><table><tr><th>Zeile</th><th>Mitarbeiter-ID</th><th>Eintrags-ID</th><th>Personenreferenz</th></tr>${p.sources.map((s, i) => `<tr><td>${i + 1}</td><td>${esc(s.employeeId)}</td><td>${esc(s.assignmentId)}</td><td>${esc(s.personRef)}</td></tr>`).join('')}</table>`
        : '<p class="hint">Keine Zeilen.</p>'}</details>
  <details class="panel"><summary>Nächste Schritte (nicht umgesetzt)</summary><ul>
    <li>E-Mail-Vorbereitung: Versand an den Auftraggeber zur Unterschrift (laut bisherigem Stand per E-Mail mit Anlage). Keine Outlook-Anbindung, kein Versand.</li>
    <li>Ablage: Speichern nach dem Versand (laut bisherigem Stand). Ort und Verfahren offen; keine Ablage, kein Status.</li>
    <li>LV-Zuordnung, Ist-Mengen, Nachtrag und Rechnung: außerhalb dieses Prototyps.</li></ul></details>`;
    const steps = [
        { id: '1', label: '1 · AUSWÄHLEN', strong: n ? pl(n, 'Eintrag', 'Einträge') : 'Noch keiner', sub: 'aus dem Tagesbericht', state: n ? 'done' : '', go: 'block-a' },
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
}
const isCompact = () => window.matchMedia('(max-width:760px)').matches;
function setView(view) {
    $('layout').dataset.view = view;
    document.body.dataset.view = view;
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
    draft = reselectDraft(report, draft, selection).draft;
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
        document.querySelector(`[data-pick="${CSS.escape(t.dataset.pick)}"]`)?.focus();
    }
});
$('editor').addEventListener('input', event => {
    const t = event.target;
    if (t.dataset.meta)
        draft.meta[t.dataset.meta] = t.value;
    else if (t.dataset.line)
        draft.lines[Number(t.dataset.line)][t.dataset.field] = t.value;
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
    else if (t.id === 'demo-meta') {
        draft.meta = { ...DEMO_META, materialAmount: draft.meta.materialAmount };
        refreshAll();
    }
    else if (t.id === 'add-photo') {
        addAttachment(draft, demoPhoto(++photoCount));
        renderAttachments();
        renderPreview();
    }
    else if (t.id === 'add-plan') {
        addAttachment(draft, demoPlan(++planCount));
        renderAttachments();
        renderPreview();
    }
    else if (t.dataset.del) {
        removeAttachment(draft, t.dataset.del);
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
new ResizeObserver(fitDocument).observe($('docwrap'));
window.addEventListener('resize', fitDocument);
setView('edit');
refreshAll();
document.documentElement.dataset.ready = '1';
