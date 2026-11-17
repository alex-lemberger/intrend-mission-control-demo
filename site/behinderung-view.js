/*
 * Behinderungsanzeige draft (synthetic demo, memory only). Opens from a saved Baubehinderung event in Mission Control.
 * Source of truth is the one WorkdayStore; this view only reads it and never saves, so a draft can never change the Baustellentag.
 * Letter structure and wording: core module behinderungsanzeige. Example text only: not legally checked, not sent.
 * Uses the shell helpers from app.js ($, esc, project, dateText) and the generated vendor/ac01-core.bundle.js (AC01Core).
 */
(function (root) {
  'use strict';
  const core = root.AC01Core;
  let draft = null;           // current BehinderungsanzeigeDraft
  let dialog = null;
  const localToday = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const dateDe = iso => /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso.split('-').reverse().join('.') : iso;
  const cell = (value, fallback = '________') => String(value ?? '').trim() ? esc(value) : `<span class="bh-missing">${fallback}</span>`;

  function ensureDialog() {
    if (dialog) return dialog;
    dialog = document.createElement('dialog');
    dialog.id = 'bh-dialog';
    dialog.setAttribute('aria-labelledby', 'bh-title');
    dialog.innerHTML = `<div class="bh-head"><h2 id="bh-title">Behinderungsanzeige · Entwurf</h2><div class="bh-actions"><button type="button" class="primary" data-bh-print><i class="ic-wrap" data-icon="printer"></i>Drucken / als PDF sichern</button><button type="button" class="outline" data-bh-close>Schließen</button></div></div>
      <div class="bh-body"><form class="bh-form" id="bh-form" aria-label="Angaben zur Behinderungsanzeige" onsubmit="return false"></form><div class="bh-preview"><div id="bh-hints"></div><article class="bh-sheet" id="bh-sheet" aria-label="Vorschau der Behinderungsanzeige"></article></div></div>`;
    document.body.append(dialog);
    dialog.addEventListener('input', onInput);
    dialog.addEventListener('change', onInput);
    dialog.addEventListener('click', event => {
      if (event.target.closest('[data-bh-close]')) dialog.close();
      else if (event.target.closest('[data-bh-print]')) window.print();
    });
    return dialog;
  }

  const FIELDS = [
    ['date', 'Datum', 'date'], ['project', 'Bauvorhaben', 'text'], ['recipient', 'Empfänger / Adresse (Auftraggeber)', 'textarea'],
  ];
  const PERIODS = [['durationDays', 'Voraussichtliche Dauer (Arbeitstage)'], ['restartDays', 'Wiederaufnahme der Arbeiten (Arbeitstage)'], ['relocationDays', 'Verlagerung in ungünstigere Jahreszeit (Arbeitstage)'], ['newCompletion', 'Voraussichtlicher neuer Fertigstellungstermin']];

  function renderForm() {
    const input = ([key, label, type]) => type === 'textarea'
      ? `<div class="bh-span2"><label for="bh-${key}">${label}</label><textarea id="bh-${key}" data-bh-field="${key}" rows="3">${esc(draft[key])}</textarea></div>`
      : `<div><label for="bh-${key}">${label}</label><input id="bh-${key}" data-bh-field="${key}" type="${type}" value="${esc(draft[key])}"></div>`;
    document.getElementById('bh-form').innerHTML = `
      <p class="bh-note">Vorschlag aus dem gespeicherten Ereignis. Alles ist änderbar. Nicht rechtlich geprüft, nicht versendet; Fristen werden nicht berechnet.</p>
      <div class="bh-grid">${FIELDS.map(input).join('')}</div>
      <div class="bh-grid"><div class="bh-span2"><label for="bh-reasons">Gründe der Behinderung (eine Zeile pro Grund)</label><textarea id="bh-reasons" data-bh-field="reasons" rows="3">${esc(draft.reasons)}</textarea><p class="bh-note">Vorgeschlagen aus den in Mission Control gewählten Gründen; änderbar.</p></div></div>
      <div class="bh-grid"><div class="bh-span2"><label for="bh-details">Im Einzelnen (Begründung)</label><textarea id="bh-details" data-bh-field="details" rows="6">${esc(draft.details)}</textarea></div>
        ${PERIODS.map(([key, label]) => `<div><label for="bh-${key}">${label}</label><input id="bh-${key}" data-bh-field="${key}" ${key === 'newCompletion' ? 'type="date"' : 'inputmode="numeric"'} value="${esc(draft[key])}"></div>`).join('')}
        <div><label for="bh-confirmBy">Bestätigung bis</label><input id="bh-confirmBy" data-bh-field="confirmBy" type="date" value="${esc(draft.confirmBy)}"></div></div>`;
  }

  function renderPreview() {
    const l = core.buildBehinderungsanzeige(draft);
    document.getElementById('bh-hints').innerHTML = (l.hints.length ? `<div class="bh-hints"><strong>Es fehlen noch Angaben (${l.hints.length})</strong><ul>${l.hints.map(h => `<li>${esc(h)}</li>`).join('')}</ul></div>` : '<div class="bh-hints bh-ok"><strong>Keine fehlenden Angaben erkannt</strong> (nach den hier angenommenen Feldern; keine geprüfte Regel)</div>');
    document.getElementById('bh-sheet').innerHTML = `<span class="bh-stamp">ENTWURF · NICHT GEPRÜFT · NICHT VERSENDET · SYNTHETISCH</span>
      <div class="bh-address">${l.recipient.trim() ? esc(l.recipient).replace(/\n/g, '<br>') : '<span class="bh-missing">(Adresse)</span>'}</div>
      <p class="bh-date">Datum: ${cell(dateDe(l.date))}</p>
      <h1>${esc(l.title)}</h1>
      <p>${esc(core.FIXED_TEXT.salutation)}</p>
      <p>${esc(l.intro)}</p>
      ${l.reasons.length ? `<ul class="bh-reasonlist">${l.reasons.map(text => `<li>${esc(text)}</li>`).join('')}</ul>` : '<p class="bh-details"><span class="bh-missing">________________</span></p>'}
      <p>${esc(core.FIXED_TEXT.detailsHead)}</p>
      <p class="bh-details">${l.details.trim() ? esc(l.details).replace(/\n/g, '<br>') : '<span class="bh-missing">________________</span>'}</p>
      <p>${esc(core.FIXED_TEXT.periodsIntro)}</p>
      <table class="bh-periods"><tbody>${l.periods.map(([label, value, unit]) => `<tr><td>${esc(label)}</td><td>${cell(unit ? value : dateDe(value), '_____')} ${esc(unit)}</td></tr>`).join('')}</tbody></table>
      <p>${esc(core.FIXED_TEXT.claims)}</p>
      <p>${esc(core.FIXED_TEXT.confirmBy('\u0001')).replace('\u0001', cell(dateDe(l.confirmBy)))}</p>
      <p>${esc(core.FIXED_TEXT.closing)}</p>
      <div class="bh-sign"><div>${esc(core.FIXED_TEXT.signature)}</div><div>${esc(core.FIXED_TEXT.confirmation)}</div></div>`;
  }

  function onInput(event) {
    if (!draft) return;
    const field = event.target.dataset.bhField, circ = event.target.dataset.bhCirc;
    if (field) draft[field] = event.target.value;
    else if (circ !== undefined) { draft.checked[Number(circ)] = event.target.checked; renderForm(); }
    else return;
    renderPreview();
  }

  async function open(key) {
    const report = await WorkdayStore.store.load({ projectId: key.projectId, date: key.date });
    if (!report) return;
    const info = project(report.projectId);
    draft = core.createBehinderungsanzeigeDraft(report, key.eventId, { name: info.name, projectNo: info.no, client: info.client }, core.createDemoData().disruptionCatalog, localToday());
    if (!draft) return;
    ensureDialog();
    renderForm(); renderPreview();
    if (!dialog.open) dialog.showModal();
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-bh-open]');
    if (button) open({ projectId: button.dataset.project, date: button.dataset.date, eventId: button.dataset.event });
  });
  root.BehinderungView = { open, current: () => (draft ? JSON.parse(JSON.stringify(draft)) : null) };
})(globalThis);
