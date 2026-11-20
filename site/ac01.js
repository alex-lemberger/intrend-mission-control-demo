/*
 * AC-01 dashboard-first daily recording (synthetic demo).
 * Manual entry is the primary path; the deterministic text recognizer is an optional experiment
 * that only proposes rows. No AI, network access, persistence, or real employee/project data.
 * The draft structure below is UI-local; it is not a domain model or an approved business rule.
 */
(function (root) {
  'use strict';

  /*
   * Pure logic and the synthetic demo data come from the tested TypeScript core (mission-control-spfx: src/core,
   * src/demo, src/compat), loaded as the GENERATED vendor/ac01-core.bundle.js. This file keeps only the UI.
   * Demo data: nothing is real; subcontractor workers carry pseudonyms ("Firma Monteur-n"), meaningful only per day.
   */
  const core = root.AC01Core;
  if (!core) throw new Error('AC01Core missing: load vendor/ac01-core.bundle.js before ac01.js');
  // Mixed-version guard: this file needs summary.conflicts from the matching core bundle. If a cached older bundle was combined
  // with newer files, say so visibly instead of misclassifying validation results.
  if (root.document && !Array.isArray(core.summarize({ employees: [], events: [] }).conflicts)) {
    const banner = root.document.createElement('p');
    banner.setAttribute('role', 'alert');
    banner.style.cssText = 'margin:0;padding:14px 18px;background:#fff0d8;color:#4d2900;font:600 15px sans-serif';
    banner.textContent = 'Die Seite wurde aktualisiert, ein älterer Zwischenspeicher passt nicht mehr dazu. Bitte die Seite neu laden (Strg/Cmd + Umschalt + R).';
    root.document.body.prepend(banner);
    throw new Error('Mixed asset versions: ac01-core.bundle.js is older than ac01.js');
  }
  const { splitReasons, toggleDisruptionId, isDisruptionId, disruptionLabel, newAssignment, newEmployee, newEvent, parseDemonstrationText, fromMinutes, normalizeName, employeeLabel, summarize, isPristine, prefillEmployees, applyBulk, addDirectoryEntry } = core;
  const demo = core.createDemoData();
  const { directory, yesterdayEntries, categoryOptions, locationOptions, eventReasons } = demo;
  const peopleOptions = demo.demoPeople;
  // Behinderungsgründe (Störungsgründe): master data; the chosen codes (ST-nnn) live in the same `reasons` list as the event types.
  const disruptionCatalog = demo.disruptionCatalog || [];
  const disruptionText = id => disruptionLabel(disruptionCatalog, id);
  globalThis.DisruptionCatalog = { label: disruptionText };
  // Short labels are display only.
  const reasonShort = { 'Baubehinderung': 'Behinderung', 'Nachtrag / Nachtragsposition': 'Nachtrag' };
  const reasonLabel = reason => isDisruptionId(reason) ? disruptionText(reason) : (reasonShort[reason] || reason);
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);

  root.AC01Demo = core.createAC01Demo(demo);
  if (!root.document) return;

  const $ = selector => document.querySelector(selector);
  const projectList = typeof projects !== 'undefined' ? projects : [{ id: 'demo', name: 'Demo-Bauprojekt Alpha' }];
  let employees = [newEmployee()];
  let events = [];
  const extras = { equipment: '', material: '', contacts: '' };
  let suggestions = [];
  // Shared working-day store (workday-store.js): the only place a saved day lives. AC-01 keeps just the day being edited.
  const { toDayReport, store: workdays } = root.WorkdayStore;
  let editingKey = null;          // key of the saved day currently open, or null for a new day
  let savedSnapshot = '';         // serialized business data at the last load/save; compared to detect unsaved changes
  let replacePending = false;     // first Save click on a key that already holds another saved day: needs a second, explicit click
  let newDayPending = false;      // first "Neuer leerer Tag" click with unsaved changes: needs a second click
  let statusToken = 0;
  let reviewRequested = false;    // UI only: the user asked to see what is still open (tile click); reset on save/open/new day

  // Calm validation: `summary.missing` mixes two things. "Noch zu klären" = information not entered yet;
  // "Widerspruch" = entered values that contradict each other or are invalid. The core reports the second kind
  // structurally as `summary.conflicts` (a subset of `missing`); nothing here parses message wording.
  const splitMissing = summary => ({ open: summary.missing.filter(text => !summary.conflicts.includes(text)), conflicts: summary.conflicts });

  const employeesEl = $('#ac01-employees');
  const eventsEl = $('#ac01-events');
  const reportEl = $('#ac01-draft');
  const messageEl = $('#ac01-message');
  const current = () => ({ employees, events });
  const isEmptyDay = () => employees.every(isPristine) && !events.length && !Object.values(extras).some(value => value.trim());
  const findEmployee = element => employees.find(item => item.id === element.closest('[data-employee]')?.dataset.employee);
  const findAssignment = (employee, element) => employee?.assignments.find(item => item.id === element.closest('[data-assignment]')?.dataset.assignment);

  const dayReport = () => toDayReport({ projectId: $('#ac01-project').value, date: $('#ac01-date').value, employees, events, extras });
  const snapshot = () => JSON.stringify(dayReport());
  const isDirty = () => snapshot() !== savedSnapshot;
  const sameKey = (a, b) => Boolean(a && b) && a.projectId === b.projectId && a.date === b.date;
  const projectNameOf = id => projectList.find(item => item.id === id)?.name || id;

  function setMessage(text, error = false) {
    messageEl.hidden = !text;
    messageEl.textContent = text;
    messageEl.classList.toggle('error', error);
  }

  const chipsMarkup = assignment => assignment.locations.map((location, index) =>
    `<span class="ac01-chip">${escapeHtml(location)}<button type="button" data-action="remove-location" data-index="${index}" aria-label="Ort ${escapeHtml(location)} entfernen">×</button></span>`).join('');
  const photosText = assignment => assignment.photos.length ? `${assignment.photos.join(', ')} · nur lokale Auswahl, kein Upload` : 'Keine Fotos ausgewählt';

  const shortLong = (long, short) => `<span class="ac01-long">${long}</span><span class="ac01-short" aria-hidden="true">${short}</span>`;

  // The name sits inside the first activity row so that table rows stay one line; one person stays one identity.
  function renderHead(employee, index) {
    return `<header class="ac01-employee-head"><div class="ac01-name"><label for="${employee.id}-name">Mitarbeiter ${index + 1}</label><input id="${employee.id}-name" data-employee-field="name" list="ac01-people" value="${escapeHtml(employee.name)}" placeholder="Name">${employee.prefill ? `<span class="ac01-prefill-tag" title="${escapeHtml(employee.prefill)}">übernommen, bitte prüfen</span>` : ''}${employee.pseudonym ? '<span class="ac01-pseudonym-tag" title="Subunternehmer-Kennung, kein Klarname; gilt nur für diesen Tag">Kennung, kein Klarname</span>' : ''}</div><button class="ac01-remove" type="button" data-action="remove-employee" aria-label="Mitarbeiter ${index + 1} entfernen">${shortLong('Entfernen', '×')}</button></header>`;
  }

  function renderAssignment(employee, assignment, index, employeeIndex) {
    const id = assignment.id;
    return `<div class="ac01-assignment" data-assignment="${id}">
      ${index === 0 ? renderHead(employee, employeeIndex) : ''}
      <div class="ac01-assignment-head"><strong>Arbeit ${index + 1}</strong>${employee.assignments.length > 1 ? `<button class="ac01-remove" type="button" data-action="remove-assignment" aria-label="Arbeit ${index + 1} entfernen">${shortLong('Entfernen', '×')}</button>` : ''}</div>
      <div class="ac01-times">
        <div class="ac01-timefield" data-empty="${assignment.start === ''}"><label for="${id}-start">Beginn</label><input id="${id}-start" data-field="start" type="time" value="${escapeHtml(assignment.start)}"></div>
        <div class="ac01-timefield" data-empty="${assignment.end === ''}"><label for="${id}-end">Ende</label><input id="${id}-end" data-field="end" type="time" value="${escapeHtml(assignment.end)}"></div>
        <div><label for="${id}-break">Pause (Min.)</label><input id="${id}-break" data-field="breakMin" type="number" min="0" max="480" step="5" inputmode="numeric" value="${escapeHtml(assignment.breakMin)}" placeholder="Min."></div>
        <div class="ac01-work"><label for="${id}-work">Leistungsgruppe</label><input id="${id}-work" data-field="work" list="ac01-categories" value="${escapeHtml(assignment.work)}" placeholder="z. B. Wände"></div>
      </div>
      <div class="ac01-where">
        <label for="${id}-location">Ort / Bauteil (mehrere möglich)</label>
        <div class="ac01-chips" data-chips>${chipsMarkup(assignment)}</div>
        <div class="ac01-chip-add"><input id="${id}-location" data-field="locationDraft" list="ac01-locations" value="${escapeHtml(assignment.locationDraft)}" placeholder="Ort"><button class="ac01-add" type="button" data-action="add-location" aria-label="Ort hinzufügen">${shortLong('Ort hinzufügen', '＋')}</button></div>
      </div>
      <div class="ac01-extra-fields">
        <div class="ac01-lv"><label for="${id}-lv">LV-Position oder eigene Tätigkeit (optional)</label><input id="${id}-lv" data-field="lv" value="${escapeHtml(assignment.lv)}" placeholder="LV"></div>
        <div class="ac01-photo"><input class="ac01-file" id="${id}-photos" data-field="photos" type="file" accept="image/*" multiple><label class="ac01-photo-btn" for="${id}-photos" title="Lokale Demoauswahl: nur Dateinamen, kein Upload">${shortLong('Fotos wählen', 'Fotos')}<span data-photo-count>${assignment.photos.length ? ` (${assignment.photos.length})` : ''}</span></label><span class="ac01-photo-names" data-photo-names>${assignment.photos.length ? escapeHtml(photosText(assignment)) : ''}</span></div>
      </div>
      <p class="ac01-row-note" role="status" hidden></p>
      ${index === 0 ? '<button class="ac01-add ac01-add-inline" type="button" data-action="add-assignment" aria-label="Weitere Arbeit für diese Person hinzufügen">＋</button>' : ''}
    </div>`;
  }

  function renderEmployees() {
    employeesEl.innerHTML = employees.map((employee, index) => `<article class="ac01-employee${employee.collapsed ? ' is-collapsed' : ''}${employee.selected ? ' is-selected' : ''}${employee.prefill ? ' has-prefill' : ''}${employee.pseudonym ? ' is-pseudonym' : ''}" data-employee="${employee.id}">
      <label class="ac01-select"><input type="checkbox" data-select aria-label="${escapeHtml(employeeLabel(employee, index))} auswählen"${employee.selected ? ' checked' : ''}></label>
      <button class="ac01-employee-summary" type="button" data-action="toggle-employee" aria-expanded="${!employee.collapsed}" aria-controls="${employee.id}-body"><span class="ac01-summary-main" data-summary></span><span class="ac01-chevron" aria-hidden="true"></span></button>
      <div class="ac01-employee-body" id="${employee.id}-body">
      ${employee.assignments.map((assignment, assignmentIndex) => renderAssignment(employee, assignment, assignmentIndex, index)).join('')}
      <button class="ac01-add ac01-add-bottom" type="button" data-action="add-assignment">＋ Weitere Arbeit für diese Person</button>
      </div>
    </article>`).join('') || '<p class="ac01-empty">Noch keine Mitarbeitenden erfasst.</p>';
    refresh();
  }

  const evidenceCount = event => event.photos.length + (event.planRef.trim() ? 1 : 0) + (event.planMark.trim() ? 1 : 0);

  // Compact event row: Ort, Beschreibung and a multi-select of reasons; no time input. Affected people are an optional fold-out.
  // Behinderungsgrund: only for a Baubehinderung, and inside the existing "Foto / Plan" fold-out so the compact event row keeps
  // its height. Quick picks (frequent reasons) first, then the full, grouped and searchable list; wording comes from the catalog.
  const hasDisruption = event => disruptionCatalog.length > 0 && event.reasons.includes('Baubehinderung');
  const evidenceLabel = event => hasDisruption(event) ? shortLong('Grund, Foto, Plan', 'Grund/Foto') : shortLong('Foto, Planbezug, Markierung', 'Foto / Plan');
  // Counter in the fold-out summary. For a Baubehinderung it counts the chosen reasons too and stays empty instead of "(optional)" to keep the compact row short.
  const evidenceStatus = event => {
    if (!hasDisruption(event)) return '';
    const n = splitReasons(event.reasons).disruptionIds.length;
    return n ? `${n} ${n === 1 ? 'Grund' : 'Gründe'} gewählt` : 'Noch kein Grund gewählt';
  };
  // One place that refreshes everything that reflects the chosen reasons: summary badge, footer status, "Alle abwählen", legend text.
  function syncEvidence(holder, item) {
    const n = splitReasons(item.reasons).disruptionIds.length;
    const badge = holder.querySelector('[data-evidence-count]'); if (badge) badge.textContent = evidenceBadge(item);
    const status = holder.querySelector('[data-evidence-status]'); if (status) status.textContent = evidenceStatus(item);
    const clear = holder.querySelector('[data-disruption-clear]'); if (clear) clear.hidden = n === 0;
    const legend = holder.querySelector('[data-disruption-count]'); if (legend) legend.textContent = n ? `(${n} gewählt)` : '(aus der Störungsgründe-Liste, mehrere möglich)';
  }
  const evidenceBadge = event => {
    const n = evidenceCount(event) + (hasDisruption(event) ? splitReasons(event.reasons).disruptionIds.length : 0);
    return n ? `(${n})` : (hasDisruption(event) ? '' : '(optional)');
  };
  function disruptionBlock(event) {
    if (!hasDisruption(event)) return '';
    const chosen = new Set(splitReasons(event.reasons).disruptionIds);
    const box = entry => `<label class="ac01-pill"><input type="checkbox" data-event-disruption="${entry.id}"${chosen.has(entry.id) ? ' checked' : ''}><span title="${escapeHtml(`${entry.group} · ${entry.id}`)}">${escapeHtml(entry.label)}</span></label>`;
    const rest = disruptionCatalog.filter(entry => !entry.frequent);
    const groups = [...new Set(rest.map(entry => entry.group))];
    return `<fieldset class="ac01-disruption" data-disruption><legend>Behinderungsgrund <small data-disruption-count>${chosen.size ? `(${chosen.size} gewählt)` : '(aus der Störungsgründe-Liste, mehrere möglich)'}</small></legend>
      <button type="button" class="text-action ac01-disruption-clear" data-disruption-clear${chosen.size ? '' : ' hidden'}>Alle abwählen</button>
      <div class="ac01-pills">${disruptionCatalog.filter(entry => entry.frequent).map(box).join('')}</div>
      ${rest.length ? `<details class="ac01-disruption-all"${rest.some(entry => chosen.has(entry.id)) ? ' open' : ''}><summary>Weitere Gründe (${rest.length})</summary>
        <input type="search" class="ac01-disruption-filter" data-disruption-filter placeholder="Grund suchen …" aria-label="Behinderungsgrund suchen">
        ${groups.map(group => `<div class="ac01-disruption-group" data-disruption-group><h4>${escapeHtml(group)}</h4><div class="ac01-pills">${rest.filter(entry => entry.group === group).map(box).join('')}</div></div>`).join('')}</details>` : ''}
    </fieldset>`;
  }

  function renderEvents() {
    eventsEl.innerHTML = events.length ? events.map((event, index) => {
      const affected = event.people.filter(id => employees.some(employee => employee.id === id)).length;
      return `<article class="ac01-event" data-event="${event.id}">
      <strong class="ac01-event-label">Ereignis ${index + 1}</strong>
      <div class="ac01-event-where"><label for="${event.id}-location">Ort / Bauteil</label><input id="${event.id}-location" data-event-field="location" list="ac01-locations" value="${escapeHtml(event.location)}" placeholder="Ort / Bauteil"></div>
      <div class="ac01-event-desc"><label for="${event.id}-description">Beschreibung</label><textarea id="${event.id}-description" data-event-field="description" rows="1" placeholder="Soll · Ist · Ursache · Folgen (kurz)" title="Kurz beschreiben: Was sollte sein (Soll)? Was ist nicht möglich (Ist)? Warum (Ursache)? Was folgt daraus (Folgen)? Betroffene Arbeiten nennen.">${escapeHtml(event.description)}</textarea></div>
      <button class="ac01-remove ac01-event-remove" type="button" data-action="remove-event" aria-label="Ereignis ${index + 1} entfernen">${shortLong('Entfernen', '×')}</button>
      <fieldset class="ac01-reasons"><legend>Art des Ereignisses <small>(mehrere möglich)</small></legend><div class="ac01-pills">${eventReasons.map(reason => `<label class="ac01-pill"><input type="checkbox" data-event-reason="${escapeHtml(reason)}"${event.reasons.includes(reason) ? ' checked' : ''}><span title="${escapeHtml(reason)}">${escapeHtml(reasonLabel(reason))}</span></label>`).join('')}</div></fieldset>
      <div class="ac01-event-more"><details class="ac01-evidence"${event.photos.length || event.planRef || event.planMark ? ' open' : ''}><summary>${evidenceLabel(event)} <span data-evidence-count>${evidenceBadge(event)}</span></summary><div class="ac01-evidence-body">${disruptionBlock(event)}
        <div class="ac01-photo"><input class="ac01-file" id="${event.id}-photos" data-event-photos type="file" accept="image/*" multiple><label class="ac01-photo-btn" for="${event.id}-photos" title="Lokale Demoauswahl: nur Dateinamen, kein Upload">${shortLong('Fotos wählen', 'Fotos')}</label><span class="ac01-photo-names" data-event-photo-names>${event.photos.length ? escapeHtml(`${event.photos.join(', ')} · nur lokale Auswahl, kein Upload`) : ''}</span></div>
        <div><label for="${event.id}-planref">Planbezug (Planname / Stand)</label><input id="${event.id}-planref" data-event-field="planRef" value="${escapeHtml(event.planRef)}" placeholder="z. B. Plan EG, Stand B"></div>
        <div><label for="${event.id}-planmark">Markierung im Plan</label><input id="${event.id}-planmark" data-event-field="planMark" value="${escapeHtml(event.planMark)}" placeholder="z. B. Achse 4 / Feld C"></div>
        <p class="ac01-hint">Frei eingetragene Hinweise: kein Planupload, keine Markierung auf einem Plan-Bild, keine Planversionsprüfung.</p>
        <div class="ac01-evidence-foot"><span class="ac01-evidence-status" data-evidence-status aria-live="polite">${evidenceStatus(event)}</span><button class="primary" type="button" data-evidence-done>Fertig</button></div></div></details>
      <details class="ac01-affected"><summary>${shortLong('Betroffene Mitarbeiter', 'Betroffene')} <span data-affected-count>${affected ? `(${affected})` : '(optional)'}</span></summary><div class="ac01-affected-list">${employees.map((employee, employeeIndex) => `<label class="ac01-check"><input type="checkbox" data-event-person="${employee.id}" ${event.people.includes(employee.id) ? 'checked' : ''}> ${escapeHtml(employeeLabel(employee, employeeIndex))}</label>`).join('') || '<span class="ac01-hint">Zuerst Mitarbeitende erfassen.</span>'}</div></details></div>
    </article>`;
    }).join('') : '<p class="ac01-empty">Noch keine Ereignisse erfasst.</p>';
    renderReport();
  }

  // Undo only covers the last bulk/prefill step; any later change makes it unavailable so nothing is silently reverted.
  let undoSnapshot = null;
  const cloneEmployees = () => JSON.parse(JSON.stringify(employees));
  function setUndo(snapshot) { undoSnapshot = snapshot; $('#ac01-bulk-undo').disabled = !snapshot; }

  let bulkHadSelection = false;
  function updateSelection() {
    const picked = employees.filter(employee => employee.selected);
    $('#ac01-selected-count').textContent = String(picked.length);
    const all = $('#ac01-select-all');
    all.checked = employees.length > 0 && picked.length === employees.length;
    all.indeterminate = picked.length > 0 && picked.length < employees.length;
    $('#ac01-bulk-apply').disabled = picked.length === 0;
    // The bulk tools only make sense with a selection: folded while nobody is selected, unfolded on the first selection.
    if ((picked.length > 0) !== bulkHadSelection) { bulkHadSelection = picked.length > 0; bulkEl.open = bulkHadSelection; }
    employeesEl.querySelectorAll('[data-employee]').forEach(element => {
      element.classList.toggle('is-selected', Boolean(employees.find(employee => employee.id === element.dataset.employee)?.selected));
    });
    $('#ac01-prefill-legend').hidden = !employees.some(employee => employee.prefill);
    $('#ac01-pseudonym-legend').hidden = !employees.some(employee => employee.pseudonym);
    renderPicker();
  }

  function refresh() {
    setUndo(null);
    updateNotes();
    renderReport();
    updateSelection();
    $('#ac01-crew-count').textContent = `${employees.length} ${employees.length === 1 ? 'Eintrag' : 'Einträge'}`;
  }

  function updateNotes() {
    const { issues } = summarize(current());
    employeesEl.querySelectorAll('[data-assignment]').forEach(element => {
      const notes = issues[element.dataset.assignment] || [];
      const note = element.querySelector('.ac01-row-note');
      note.textContent = notes.join(' ');
      note.hidden = !notes.length;
    });
    employeesEl.querySelectorAll('[data-summary]').forEach(element => {
      const index = employees.findIndex(item => item.id === element.closest('[data-employee]').dataset.employee);
      if (index >= 0) {
        element.innerHTML = summaryMarkup(employees[index], index, issues);
        element.closest('[data-employee]').querySelector('[data-select]')?.setAttribute('aria-label', `${employeeLabel(employees[index], index)} auswählen`);
      }
    });
  }

  // Compact line shown on small screens; every piece mirrors what is entered, missing parts are marked.
  function summaryMarkup(employee, index, issues) {
    const warn = text => `<em class="ac01-warn">${text}</em>`;
    if (isPristine(employee)) return `<strong>Mitarbeiter ${index + 1}</strong><span class="ac01-summary-detail">noch leer</span>`;
    const name = employee.name.trim();
    const first = employee.assignments[0];
    const flagged = employee.assignments.some(assignment => (issues[assignment.id] || []).length);
    if (!first) return `<strong>${name ? escapeHtml(name) : `Mitarbeiter ${index + 1}`}</strong><span class="ac01-summary-detail">${warn('Keine Arbeit erfasst')}</span>`;
    const time = first.start || first.end ? `${escapeHtml(first.start || '?')}–${escapeHtml(first.end || '?')}` : warn('Zeit fehlt');
    const work = escapeHtml([first.work, first.lv].find(value => value.trim()) || '') || warn('Tätigkeit fehlt');
    const place = first.locations.length ? escapeHtml(first.locations.join(', ')) : warn('Ort fehlt');
    const more = employee.assignments.length > 1 ? ` · +${employee.assignments.length - 1} weitere` : '';
    return `<strong>${name ? escapeHtml(name) : `Mitarbeiter ${index + 1}`}${name ? '' : ` ${warn('Name fehlt')}`}</strong><span class="ac01-summary-detail">${time} · ${work} · ${place}${more}${flagged ? ` · ${warn('Hinweis prüfen')}` : ''}${employee.prefill ? ` · ${warn('übernommen, bitte prüfen')}` : ''}</span>`;
  }

  const listItems = items => items.map(item => `<li>${escapeHtml(item)}</li>`).join('');
  const dateLabel = value => value ? new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(`${value}T12:00:00`)) : 'Datum fehlt';

  function renderReport() {
    replacePending = false; newDayPending = false;
    const summary = summarize(current());
    const projectName = projectList.find(item => item.id === $('#ac01-project').value)?.name || 'Projekt fehlt';
    const names = new Map(employees.map((employee, index) => [employee.id, employeeLabel(employee, index)]));
    const people = (summary.named || summary.unnamed) && !isEmptyDay()
      ? `${summary.named} benannt${summary.unnamed ? ` · ${summary.unnamed} ohne Namen` : ''}${summary.duplicates.length ? ' · Doppelnamen zählen einmal' : ''}`
      : 'Noch keine';
    // Many names without any entry yet (e.g. right after "Personen von gestern übernehmen") collapse into ONE line instead of a wall of "fehlt".
    const isBare = employee => employee.assignments.every(a => !a.start && !a.end && a.breakMin === '' && !a.work.trim() && !a.lv.trim() && !a.locations.length && !a.photos.length);
    const crewShown = employees.filter(employee => !isPristine(employee));
    const bareCrew = crewShown.filter(isBare).length >= 3 ? crewShown.filter(isBare) : [];
    const bareMarkup = bareCrew.length ? `<section class="ac01-draft-employee"><h4>${bareCrew.length} Personen ohne Angaben</h4><ul><li><span>Zeit, Pause, Tätigkeit und Ort stehen noch aus.</span></li><li><span>${escapeHtml(bareCrew.map(employee => employeeLabel(employee, employees.indexOf(employee))).join(', '))}</span></li></ul></section>` : '';
    const crewMarkup = employees.every(isPristine) ? '<p class="ac01-subtotal">Noch keine Mitarbeitenden erfasst.</p>' : bareMarkup + crewShown.filter(employee => !bareCrew.includes(employee)).map(employee => [employee, employees.indexOf(employee)]).map(([employee, index]) => `<section class="ac01-draft-employee"><h4>${escapeHtml(employeeLabel(employee, index))}</h4><ul>${employee.assignments.map(assignment => `<li>
        <strong>${escapeHtml(assignment.start || '?')}–${escapeHtml(assignment.end || '?')}</strong> <span>${assignment.breakMin !== '' ? `Pause ${escapeHtml(assignment.breakMin)} Min.` : 'Pause nicht angegeben'}</span>
        <span>${escapeHtml([assignment.work, assignment.lv].filter(value => value.trim()).join(' · ') || 'Tätigkeit fehlt')}</span>
        <span>Ort: ${escapeHtml(assignment.locations.join(', ') || 'fehlt')}</span>
        ${assignment.photos.length ? `<span>Fotos: ${escapeHtml(photosText(assignment))}</span>` : ''}
      </li>`).join('') || '<li><span>Keine Arbeit erfasst</span></li>'}</ul></section>`).join('');
    const eventMarkup = events.length ? events.map(event => {
      const affected = event.people.map(id => names.get(id)).filter(Boolean);
      return `<li><strong>${escapeHtml(event.reasons.length ? event.reasons.map(reason => isDisruptionId(reason) ? disruptionText(reason) : reason).join(' · ') : 'Grund fehlt')}</strong> <span>Ort: ${escapeHtml(event.location.trim() || 'fehlt')}</span><span>${escapeHtml(event.description.trim() || 'Beschreibung fehlt')}</span>${evidenceCount(event) ? `<span>Nachweis: ${escapeHtml([event.photos.length ? `${event.photos.length} ${event.photos.length === 1 ? 'Foto' : 'Fotos'} (${event.photos.join(', ')})` : '', event.planRef.trim() ? `Plan: ${event.planRef.trim()}` : '', event.planMark.trim() ? `Markierung: ${event.planMark.trim()}` : ''].filter(Boolean).join(' · '))} · nur Hinweise, keine Dateien</span>` : ''}${affected.length ? `<span>Betroffen: ${escapeHtml(affected.join(', '))} · Personenzeit steht nur in den Arbeitszeilen</span>` : ''}</li>`;
    }).join('') : '<li><span>Keine außergewöhnlichen Ereignisse erfasst.</span></li>';
    const note = value => value.trim() ? escapeHtml(value.trim()) : 'nicht angegeben';
    const incomplete = !summary.complete;
    const empty = isEmptyDay();
    const { open: openInfo, conflicts } = splitMissing(summary);
    // Orange only for real contradictions, or once the user asked what is open; missing information alone stays calm.
    const alarm = conflicts.length > 0 || (reviewRequested && openInfo.length > 0);
    const statusText = empty ? 'Entwurf · noch leer' : conflicts.length ? 'Entwurf · Widersprüche prüfen' : incomplete ? 'Entwurf · Angaben fehlen noch' : 'Entwurf · ungeprüft';
    const clarifyMarkup = !empty && summary.missing.length
      ? `<div class="ac01-missing${alarm ? '' : ' is-calm'}"><strong>Noch zu klären: ${summary.missing.length} ${summary.missing.length === 1 ? 'Angabe' : 'Angaben'}</strong>`
        + (openInfo.length ? `<details${reviewRequested ? ' open' : ''}><summary>Fehlende Angaben (${openInfo.length})</summary><ul>${listItems(openInfo)}</ul></details>` : '')
        + (conflicts.length ? `<details open><summary>Widersprüchliche oder ungültige Angaben prüfen (${conflicts.length})</summary><ul>${listItems(conflicts)}</ul></details>` : '')
        + '</div>'
      : '';

    reportEl.innerHTML = `<div class="ac01-report-status"><span class="ac01-status ${alarm ? 'is-incomplete' : ''}">${statusText}</span><span>Keine Freigabe · kein Versand</span></div>
      <div class="ac01-draft-meta"><div><small>BAUPROJEKT</small><strong>${escapeHtml(projectName)}</strong></div><div><small>DATUM</small><strong>${escapeHtml(dateLabel($('#ac01-date').value))}</strong></div></div>
      <p class="ac01-demo-line">Projekt und Datum sind synthetische Beispiele.</p>
      <h3>Normaler Arbeitstag</h3>
      <dl class="ac01-facts"><div><dt>Mitarbeitende</dt><dd>${escapeHtml(people)}</dd></div><div><dt>Frühester Beginn</dt><dd>${summary.earliest === null ? '–' : fromMinutes(summary.earliest)}</dd></div><div><dt>Spätestes Ende</dt><dd>${summary.latest === null ? '–' : fromMinutes(summary.latest)}</dd></div></dl>
      <p class="ac01-subtotal">Abgeleitet aus den eingetragenen Angaben, ohne Gewähr auf Vollständigkeit. Arbeitsstunden werden nicht berechnet; es wird keine Pause abgezogen (Regel offen).</p>
      <div class="ac01-draft-employees">${crewMarkup}</div>
      <h3>Außergewöhnliche Ereignisse</h3>
      <ul class="ac01-draft-events">${eventMarkup}</ul>
      ${events.length ? '<p class="ac01-subtotal">Ereignisse sind Entwürfe: keine Behinderungsanzeige, kein Nachtrag, keine Beauftragung und keine Mitteilung an den Auftraggeber.</p>' : ''}
      <h3>Weitere Beobachtungen</h3>
      <dl class="ac01-facts"><div><dt>Geräte / Maschinen</dt><dd>${note(extras.equipment)}</dd></div><div><dt>Materialanlieferung</dt><dd>${note(extras.material)}</dd></div><div><dt>Kontakte / Anordnungen</dt><dd>${note(extras.contacts)}</dd></div></dl>
      ${clarifyMarkup || (incomplete ? '' : '<p class="ac01-complete">Keine fehlenden Angaben erkannt. Der Entwurf bleibt ungeprüft; Pausen-, Zeit- und Berichtsregeln sind offen.</p>')}`;
    renderOverview();
    renderSaveStatus();
  }

  // Live overview derived only from the entered rows (the Mission Control view of this working panel). Counts and the time
  // window are shown; no hours are summed and events carry no time, so nothing can be counted twice.
  const overviewEl = $('#ac01-overview');
  function renderOverview() {
    $('#ac01-save-bottom').innerHTML = replacePending ? 'Ja, vorhandenen Tag ersetzen' : '<i class="ic-wrap" data-icon="save"></i>Tag speichern → Mission Control';
    $('#ac01-save-bottom').classList.toggle('is-replace', replacePending);
    const summary = summarize(current());
    const window_ = summary.earliest === null && summary.latest === null ? '–' : `${summary.earliest === null ? '?' : fromMinutes(summary.earliest)}–${summary.latest === null ? '?' : fromMinutes(summary.latest)}`;
    const reasons = Object.entries(summary.reasonCounts).map(([reason, count]) => `${reasonLabel(reason)} ${count}`).join(' · ');
    const open = summary.missing.length;
    const empty = isEmptyDay();
    const { conflicts } = splitMissing(summary);
    const alarm = conflicts.length > 0 || (reviewRequested && open > 0);
    const clarifySub = empty ? 'Noch nichts erfasst' : conflicts.length ? `${conflicts.length} ${conflicts.length === 1 ? 'Widerspruch' : 'Widersprüche'} prüfen` : open ? 'Angaben fehlen noch' : 'Entwurf · ungeprüft';
    const stat = (label, value, extra = '') => `<div class="ac01-stat"><small>${label}</small><strong>${value}</strong>${extra ? `<span>${escapeHtml(extra)}</span>` : ''}</div>`;
    overviewEl.innerHTML = stat('Mitarbeitende', `${summary.named}${summary.unnamed && !empty ? ` <em>+${summary.unnamed} ohne Namen</em>` : ''}`)
      + stat('Zeitfenster', window_, 'früh. Beginn–spät. Ende')
      + stat('Arbeitszeilen', String(summary.assignmentCount))
      + stat('Ereignisse', String(summary.eventCount), reasons || 'ohne Zeit')
      + `<button type="button" class="ac01-stat ac01-stat-open${alarm ? ' has-open' : ''}" data-review data-jump="#ac01-draft-title"><small>Noch zu klären</small><strong>${empty ? '–' : open}</strong><span>${clarifySub}</span></button>`
      + `<button type="button" class="ac01-stat ac01-save${replacePending ? ' is-replace' : ''}" data-action="save-day"><small>${replacePending ? 'Vorhandenen Tag ersetzen' : 'Tag speichern'}</small><strong>${replacePending ? 'Ja, ersetzen' : '<i class="ic-wrap" data-icon="save"></i>Speichern'}</strong><span>${replacePending ? 'zweiter Klick nötig' : '→ Mission Control'}</span></button>`;
    stepData = { summary, empty, alarm, open };
    renderSteps();
  }

  // ---- Guided navigation: in-page links to the four sections, derived from what is already entered or validated.
  // No workflow state of its own: "visited" never counts as done; an empty Ereignisse section is optional, not missing.
  let stepData = null;
  const stepsEl = $('#ac01-steps');
  const stepButtons = [...stepsEl.querySelectorAll('[data-step]')];
  const stepNote = key => stepsEl.querySelector(`[data-step-note="${key}"]`);
  function renderSteps() {
    if (!stepData) return;
    const { summary, empty, alarm, open } = stepData;
    const people = empty ? 0 : summary.named + summary.unnamed;
    const dirty = isDirty();
    const set = (key, text, state) => { stepNote(key).textContent = text; stepsEl.querySelector(`[data-step-item="${key}"]`).dataset.state = state; };
    const projectText = $('#ac01-project').selectedOptions[0]?.textContent || '';
    set('ctx', `${projectText} · ${dateLabel($('#ac01-date').value)}`, 'info');
    set('crew', people ? `${people} ${people === 1 ? 'Person' : 'Personen'}` : 'Personen eintragen', people ? 'data' : 'todo');
    set('events', summary.eventCount ? `${summary.eventCount} erfasst` : 'optional', summary.eventCount ? 'data' : 'optional');
    if (alarm) set('save', open ? `${open} ${open === 1 ? 'Angabe' : 'Angaben'} prüfen` : 'Widerspruch prüfen', 'attention');
    else if (empty && !editingKey) set('save', 'noch nichts zu speichern', 'todo');
    else if (dirty) set('save', 'ungespeichert', 'dirty');
    else set('save', 'gespeichert', 'saved');
    const stateEl = $('#ac01-step-state');
    stateEl.textContent = editingKey ? (dirty ? 'Gespeichert · Änderungen noch offen' : 'Gespeichert · wird bearbeitet') : (dirty ? 'Neuer Tag · nicht gespeichert' : 'Neuer Tag');
    stateEl.dataset.mode = editingKey ? (dirty ? 'dirty' : 'saved') : (dirty ? 'dirty' : 'new');
    document.getElementById('ac01-view').dataset.mode = editingKey ? 'edit' : 'new';
    updateActiveStep();
  }
  function updateActiveStep() {
    const view = $('#ac01-view');
    if (view.hidden) return;
    const targets = stepButtons.map(button => $(button.dataset.step));
    const stripOn = matchMedia('(min-width:1024px)').matches ? overviewEl.offsetHeight : 0;
    const line = stepsEl.offsetHeight + stripOn + 24;
    let index = 0;
    [0, 1, 2].forEach(i => { if (targets[i].getBoundingClientRect().top <= line) index = i; });
    const single = matchMedia('(max-width:950px)').matches;
    if (single ? targets[3].getBoundingClientRect().top <= line : $('.ac01-report-area').contains(document.activeElement)) index = 3;
    stepButtons.forEach((button, i) => { if (i === index) button.setAttribute('aria-current', 'step'); else button.removeAttribute('aria-current'); });
  }
  if (root.ResizeObserver) new ResizeObserver(() => { const h = stepsEl.offsetHeight; if (h) document.documentElement.style.setProperty('--ac-steps-h', `${h}px`); }).observe(stepsEl);
  let stepFrame = 0;
  const scheduleActive = () => { if (!stepFrame) stepFrame = requestAnimationFrame(() => { stepFrame = 0; updateActiveStep(); }); };
  window.addEventListener('scroll', scheduleActive, { passive: true });
  window.addEventListener('resize', scheduleActive);
  document.addEventListener('focusin', scheduleActive);
  stepsEl.addEventListener('click', event => {
    const button = event.target.closest('[data-step]');
    if (!button) return;
    const target = $(button.dataset.step);
    target.scrollIntoView({ block: 'start' });
    target.focus({ preventScroll: true });
    updateActiveStep();
  });
  // The sticky column header must sit below the sticky strip, whatever height the strip has at the current width.
  if (root.ResizeObserver) new ResizeObserver(() => { const h = overviewEl.offsetHeight; if (h) document.documentElement.style.setProperty('--ac-strip-h', `${h}px`); }).observe(overviewEl);
  // The strip is re-rendered often, so its jump buttons are handled by delegation.
  overviewEl.addEventListener('click', event => {
    const button = event.target.closest('[data-jump]');
    if (!button) return;
    if (button.hasAttribute('data-review') && !isEmptyDay()) { reviewRequested = true; renderReport(); }   // asking what is open shows the details
    const target = $(button.dataset.jump);
    target.scrollIntoView({ block: 'start' });
    target.focus({ preventScroll: true });
  });

  // Context and additional information
  $('#ac01-project').innerHTML = projectList.map(item => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.name)}</option>`).join('');
  { const now = new Date(); $('#ac01-date').value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`; }  // today, local time
  ['#ac01-project', '#ac01-date'].forEach(selector => $(selector).addEventListener('input', renderReport));
  [['#ac01-equipment', 'equipment'], ['#ac01-material', 'material'], ['#ac01-contacts', 'contacts']].forEach(([selector, key]) => {
    $(selector).addEventListener('input', event => { extras[key] = event.target.value; renderReport(); });
  });

  // Employees and assignments
  function clearPrefill(employee) {
    if (!employee.prefill) return;
    employee.prefill = '';
    const element = employeesEl.querySelector(`[data-employee="${employee.id}"]`);
    element?.classList.remove('has-prefill');
    element?.querySelector('.ac01-prefill-tag')?.remove();
  }

  employeesEl.addEventListener('input', event => {
    if (event.target.matches('[data-select]')) return;
    const employee = findEmployee(event.target);
    if (!employee) return;
    clearPrefill(employee);
    if (event.target.dataset.employeeField === 'name') employee.name = event.target.value;
    const assignment = findAssignment(employee, event.target);
    const field = event.target.dataset.field;
    if (assignment && field && field !== 'photos') assignment[field] = event.target.value;
    if (event.target.type === 'time') event.target.parentElement.dataset.empty = String(event.target.value === '');
    refresh();
  });

  function commitLocation(employee, assignment, row) {
    const value = assignment.locationDraft.trim();
    if (!value) return;
    if (!assignment.locations.some(location => normalizeName(location) === normalizeName(value))) assignment.locations.push(value);
    assignment.locationDraft = '';
    row.querySelector('[data-field="locationDraft"]').value = '';
    row.querySelector('[data-chips]').innerHTML = chipsMarkup(assignment);
    refresh();
  }

  employeesEl.addEventListener('change', event => {
    const employee = findEmployee(event.target);
    if (employee && event.target.matches('[data-select]')) { employee.selected = event.target.checked; updateSelection(); return; }
    const assignment = findAssignment(employee, event.target);
    if (event.target.dataset.employeeField === 'name') renderEvents();
    if (assignment && event.target.dataset.field === 'locationDraft') commitLocation(employee, assignment, event.target.closest('[data-assignment]'));
    if (assignment && event.target.dataset.field === 'photos') {
      assignment.photos = [...event.target.files].map(file => file.name);
      event.target.closest('[data-assignment]').querySelector('[data-photo-names]').textContent = assignment.photos.length ? photosText(assignment) : '';
      event.target.closest('[data-assignment]').querySelector('[data-photo-count]').textContent = assignment.photos.length ? ` (${assignment.photos.length})` : '';
      refresh();
    }
  });

  employeesEl.addEventListener('keydown', event => {
    if (event.key !== 'Enter' || event.target.dataset.field !== 'locationDraft') return;
    event.preventDefault();
    const employee = findEmployee(event.target);
    commitLocation(employee, findAssignment(employee, event.target), event.target.closest('[data-assignment]'));
  });

  employeesEl.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const employee = findEmployee(button);
    const assignment = findAssignment(employee, button);
    const action = button.dataset.action;
    if (action === 'toggle-employee' && employee) {
      employee.collapsed = !employee.collapsed;
      button.closest('[data-employee]').classList.toggle('is-collapsed', employee.collapsed);
      button.setAttribute('aria-expanded', String(!employee.collapsed));
      return;
    }
    if (action === 'add-location' && assignment) {
      const row = button.closest('[data-assignment]');
      assignment.locationDraft = row.querySelector('[data-field="locationDraft"]').value;
      commitLocation(employee, assignment, row);
      row.querySelector('[data-field="locationDraft"]').focus();
      return;
    }
    if (action === 'remove-location' && assignment) {
      assignment.locations.splice(Number(button.dataset.index), 1);
      button.closest('[data-chips]').innerHTML = chipsMarkup(assignment);
      refresh();
      return;
    }
    let focusSelector = null;
    if (action === 'remove-employee' && employee) {
      employees = employees.filter(item => item !== employee);
      events.forEach(item => { item.people = item.people.filter(id => id !== employee.id); });
      renderEvents();
    }
    if (action === 'add-assignment' && employee) {
      const created = newAssignment();
      employee.assignments.push(created);
      focusSelector = `[data-assignment="${created.id}"] [data-field="start"]`;
    }
    if (action === 'remove-assignment' && employee && assignment) employee.assignments = employee.assignments.filter(item => item !== assignment);
    renderEmployees();
    if (focusSelector) employeesEl.querySelector(focusSelector)?.focus();
  });

  $('#ac01-add-employee').addEventListener('click', () => {
    const created = newEmployee();
    employees.forEach(item => { item.collapsed = true; });
    employees.push(created);
    renderEmployees();
    renderEvents();
    employeesEl.querySelector(`[data-employee="${created.id}"] [data-employee-field="name"]`)?.focus();
  });

  // Exceptional events (compact rows)
  $('#ac01-event-add').addEventListener('click', () => {
    const created = newEvent();
    events.push(created);
    renderEvents();
    eventsEl.querySelector(`[data-event="${created.id}"] [data-event-field="location"]`)?.focus();
  });

  const findEvent = element => events.find(item => item.id === element.closest('[data-event]')?.dataset.event);
  eventsEl.addEventListener('input', event => {
    const item = findEvent(event.target);
    const field = event.target.dataset.eventField;
    if (item && field) {
      item[field] = event.target.value;
      const count = event.target.closest('[data-event]').querySelector('[data-evidence-count]');
      if (count && (field === 'planRef' || field === 'planMark')) count.textContent = evidenceBadge(item);
      renderReport();
    }
  });
  eventsEl.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const fold = event.target.closest('.ac01-evidence[open], .ac01-affected[open]');
    if (fold) { fold.open = false; fold.querySelector(':scope > summary').focus(); event.stopPropagation(); }
  });
  // Only one fold-out per event is open at a time; a click outside closes an open "Betroffene" list.
  eventsEl.addEventListener('toggle', event => {
    const opened = event.target;
    if (!opened.open || !opened.matches?.('.ac01-evidence, .ac01-affected')) return;
    opened.closest('.ac01-event')?.querySelectorAll('.ac01-evidence[open], .ac01-affected[open]').forEach(other => { if (other !== opened) other.open = false; });
  }, true);
  document.addEventListener('click', event => {
    eventsEl.querySelectorAll('.ac01-affected[open]').forEach(fold => { if (!fold.contains(event.target)) fold.open = false; });
  });
  eventsEl.addEventListener('input', event => {
    const filter = event.target.closest('[data-disruption-filter]');
    if (!filter) return;
    const query = filter.value.trim().toLowerCase();
    const holder = filter.closest('.ac01-disruption-all');
    holder.querySelectorAll('.ac01-pill').forEach(pill => { pill.hidden = Boolean(query) && !pill.textContent.toLowerCase().includes(query); });
    holder.querySelectorAll('[data-disruption-group]').forEach(group => { group.hidden = ![...group.querySelectorAll('.ac01-pill')].some(pill => !pill.hidden); });
  });
  eventsEl.addEventListener('change', event => {
    const item = findEvent(event.target);
    if (!item) return;
    if (event.target.matches('[data-event-photos]')) {
      item.photos = [...event.target.files].map(file => file.name);
      const holder = event.target.closest('[data-event]');
      holder.querySelector('[data-event-photo-names]').textContent = item.photos.length ? `${item.photos.join(', ')} · nur lokale Auswahl, kein Upload` : '';
      holder.querySelector('[data-evidence-count]').textContent = evidenceBadge(item);
      renderReport();
      return;
    }
    const personId = event.target.dataset.eventPerson;
    const reason = event.target.dataset.eventReason;
    if (personId) {
      item.people = event.target.checked ? [...new Set([...item.people, personId])] : item.people.filter(id => id !== personId);
      const count = event.target.closest('[data-event]').querySelector('[data-affected-count]');
      if (count) count.textContent = item.people.length ? `(${item.people.length})` : '(optional)';
    } else if (event.target.dataset.eventDisruption) {
      item.reasons = toggleDisruptionId(item.reasons, event.target.dataset.eventDisruption, event.target.checked);
      syncEvidence(event.target.closest('[data-event]'), item);
    } else if (reason) {
      // Event types keep their order; disruption codes are kept only while the event is a Baubehinderung.
      const kinds = event.target.checked ? eventReasons.filter(known => known === reason || item.reasons.includes(known)) : splitReasons(item.reasons).kinds.filter(known => known !== reason);
      item.reasons = [...kinds, ...(kinds.includes('Baubehinderung') ? splitReasons(item.reasons).disruptionIds : [])];
      const holder = event.target.closest('[data-event]');
      holder.querySelector('[data-disruption]')?.remove();
      const fold = holder.querySelector('.ac01-evidence');
      fold.querySelector('.ac01-evidence-body').insertAdjacentHTML('afterbegin', disruptionBlock(item));
      fold.querySelector(':scope > summary').innerHTML = `${evidenceLabel(item)} <span data-evidence-count>${evidenceBadge(item)}</span>`;
      syncEvidence(holder, item);
      if (hasDisruption(item) && event.target.checked) fold.open = true;
    }
    renderReport();
  });
  eventsEl.addEventListener('click', event => {
    const done = event.target.closest('[data-evidence-done]');
    if (done) { const fold = done.closest('.ac01-evidence'); fold.open = false; fold.querySelector(':scope > summary').focus(); return; }
    const clear = event.target.closest('[data-disruption-clear]');
    if (clear) {
      const holder = clear.closest('[data-event]'), item = findEvent(clear);
      item.reasons = splitReasons(item.reasons).kinds;
      holder.querySelector('[data-disruption]')?.remove();
      holder.querySelector('.ac01-evidence-body').insertAdjacentHTML('afterbegin', disruptionBlock(item));
      syncEvidence(holder, item); renderReport();
      return;
    }
    const button = event.target.closest('[data-action="remove-event"]');
    if (!button) return;
    events = events.filter(item => item !== findEvent(button));
    renderEvents();
  });

  // Prefill (synthetic demo data only; nothing is stored) and bulk assignment.
  const toolsMessage = $('#ac01-tools-message'), bulkMessage = $('#ac01-bulk-message'), bulkEl = $('#ac01-bulk');
  const toolsDefault = toolsMessage.textContent;
  const dropMissingEventPeople = () => events.forEach(item => { item.people = item.people.filter(id => employees.some(employee => employee.id === id)); });

  function runPrefill(names, label, what, note) {
    const before = cloneEmployees();
    const result = prefillEmployees(employees, names, label);
    employees = result.employees;
    dropMissingEventPeople();
    renderEmployees();
    renderEvents();
    setUndo(before);
    toolsMessage.textContent = result.added
      ? `${result.added} ${what} übernommen. Synthetische Beispieldaten, ${note}, nicht gespeichert. Zeiten bleiben leer; bitte prüfen und ergänzen.${result.skipped ? ` ${result.skipped} waren schon vorhanden.` : ''}`
      : 'Alle Namen sind schon vorhanden; nichts geändert.';
  }
  $('#ac01-prefill-yesterday').addEventListener('click', () => runPrefill(yesterdayEntries, 'Vortag (Demo)', 'Personen aus dem Demo-Vortag', 'kein echter Vortag'));

  $('#ac01-select-all').addEventListener('change', event => {
    employees.forEach(employee => { employee.selected = event.target.checked; });
    employeesEl.querySelectorAll('[data-select]').forEach(box => { box.checked = event.target.checked; });
    updateSelection();
  });

  ['#ac01-bulk-start', '#ac01-bulk-end'].forEach(selector => $(selector).addEventListener('input', event => { event.target.parentElement.dataset.empty = String(event.target.value === ''); }));
  $('#ac01-bulk-example').addEventListener('click', () => {
    [['start', '07:00'], ['end', '17:00'], ['break', '60']].forEach(([key, value]) => {
      const input = $(`#ac01-bulk-${key}`);
      input.value = value;
      if (input.type === 'time') input.parentElement.dataset.empty = 'false';
    });
    bulkMessage.textContent = 'Beispielwerte eingesetzt (07:00–17:00, 60 Min. Pause): keine Regel und nicht freigegeben. Es wurde noch nichts in die Zeilen eingetragen.';
  });
  $('#ac01-bulk-mode').addEventListener('change', event => {
    if (event.target.value === 'overwrite') bulkMessage.textContent = 'Überschreiben ersetzt vorhandene Werte der ausgewählten Zeilen. „Rückgängig“ stellt sie wieder her, bis etwas anderes geändert wird.';
  });
  $('#ac01-bulk-apply').addEventListener('click', () => {
    const ids = employees.filter(employee => employee.selected).map(employee => employee.id);
    const patch = { start: $('#ac01-bulk-start').value, end: $('#ac01-bulk-end').value, breakMin: $('#ac01-bulk-break').value, work: $('#ac01-bulk-work').value, location: $('#ac01-bulk-location').value };
    const mode = $('#ac01-bulk-mode').value;
    if (!ids.length) { bulkMessage.textContent = 'Zuerst Mitarbeitende auswählen.'; return; }
    if (!Object.values(patch).some(value => String(value).trim())) { bulkMessage.textContent = 'Bitte mindestens einen Wert eintragen.'; return; }
    const before = cloneEmployees();
    const result = applyBulk(employees, ids, patch, mode);
    renderEmployees();
    renderEvents();
    setUndo(before);
    const kept = result.skipped ? ` ${result.skipped} vorhandene Werte blieben unverändert.` : '';
    bulkMessage.textContent = mode === 'add'
      ? `${result.added} weitere Arbeiten angelegt (${result.people} Personen); vorhandene Eingaben blieben unverändert. Jede Zeile bleibt einzeln änderbar.`
      : mode === 'overwrite' ? `${result.set} Werte bei ${result.people} Personen gesetzt oder überschrieben. „Rückgängig“ stellt den Stand davor wieder her.`
      : `${result.set} Werte bei ${result.people} Personen eingetragen.${kept} Jede Zeile bleibt einzeln änderbar.`;
  });
  $('#ac01-bulk-undo').addEventListener('click', () => {
    if (!undoSnapshot) return;
    employees = undoSnapshot;
    dropMissingEventPeople();
    renderEmployees();
    renderEvents();
    bulkMessage.textContent = 'Letzte Sammelaktion bzw. Übernahme rückgängig gemacht.';
  });
  // The bulk tools start folded; selecting people unfolds them (see updateSelection).
  bulkEl.open = false;

  // Employee picker: own staff and subcontractors by firm. Entries are matched by stable demo id, never by display text.
  // Office staff are available but only listed on request and never preselected. Nothing here is persisted.
  const pickerSelection = new Set();
  let pickerOffice = false;
  let pickerSubsOpen = false;   // subcontractors stay folded until asked for; the choice survives re-rendering
  const groupsEl = $('#ac01-picker-groups');
  const pickerMessage = $('#ac01-picker-message');
  function pickerGroupList() {
    const firms = [...new Set(directory.filter(entry => entry.group === 'sub').map(entry => entry.firm))];
    return {
      own: { key: 'own', title: 'Eigene Mitarbeitende', entries: directory.filter(entry => entry.group === 'own') },
      subs: firms.map(firm => ({ key: `sub-${firm.toLowerCase()}`, title: firm, entries: directory.filter(entry => entry.group === 'sub' && entry.firm === firm) })),
      office: { key: 'office', title: 'Büropersonal (nicht auf der Baustelle)', entries: directory.filter(entry => entry.group === 'office') }
    };
  }
  function renderPicker() {
    const present = new Set(employees.map(employee => employee.personRef).filter(Boolean));
    [...pickerSelection].forEach(id => { if (present.has(id)) pickerSelection.delete(id); });
    const item = entry => `<label class="ac01-check ac01-pick-item"><input type="checkbox" data-pick="${entry.id}"${present.has(entry.id) ? ' checked disabled' : pickerSelection.has(entry.id) ? ' checked' : ''}> <span>${escapeHtml(entry.label)}</span> <small>${escapeHtml(entry.role)}${present.has(entry.id) ? ' · in Tabelle' : ''}</small></label>`;
    const group = ({ key, title, entries }) => `<fieldset class="ac01-picker-group" data-group="${key}"><legend><label class="ac01-check"><input type="checkbox" data-pick-group="${key}"> <strong>${escapeHtml(title)}</strong> <small>(${entries.length})</small></label></legend><div class="ac01-pick-items">${entries.map(item).join('')}</div></fieldset>`;
    const lists = pickerGroupList();
    groupsEl.innerHTML = group(lists.own)
      + `<details class="ac01-picker-sub" id="ac01-picker-subs"${pickerSubsOpen ? ' open' : ''}><summary>Subunternehmer <small>(${lists.subs.reduce((n, g) => n + g.entries.length, 0)}) · nach Firma, nur Kennungen</small></summary>${lists.subs.map(group).join('')}</details>`
      + (pickerOffice ? group(lists.office) : '');
    syncPicker();
  }
  function syncPicker() {
    groupsEl.querySelectorAll('[data-pick-group]').forEach(box => {
      const boxes = [...box.closest('fieldset').querySelectorAll('[data-pick]:not(:disabled)')];
      const picked = boxes.filter(item => item.checked).length;
      box.disabled = boxes.length === 0;
      box.checked = boxes.length > 0 && picked === boxes.length;
      box.indeterminate = picked > 0 && picked < boxes.length;
    });
    $('#ac01-picker-count').textContent = String(pickerSelection.size);
    $('#ac01-picker-add').disabled = pickerSelection.size === 0;
  }
  groupsEl.addEventListener('toggle', event => { if (event.target.id === 'ac01-picker-subs') pickerSubsOpen = event.target.open; }, true);
  groupsEl.addEventListener('change', event => {
    const single = event.target.dataset.pick;
    const whole = event.target.dataset.pickGroup;
    if (single) event.target.checked ? pickerSelection.add(single) : pickerSelection.delete(single);
    if (whole) event.target.closest('fieldset').querySelectorAll('[data-pick]:not(:disabled)').forEach(item => {
      item.checked = event.target.checked;
      event.target.checked ? pickerSelection.add(item.dataset.pick) : pickerSelection.delete(item.dataset.pick);
    });
    syncPicker();
  });
  // Maintain the synthetic list: add a person or a subcontractor entry. Memory only; no real names, nothing is stored.
  const dirMessage = $('#ac01-dir-message');
  const dirGroup = $('#ac01-dir-group'), dirFirm = $('#ac01-dir-firm'), dirLabel = $('#ac01-dir-label');
  const syncDirForm = () => { dirFirm.closest('div').hidden = dirGroup.value !== 'sub'; };
  dirGroup.addEventListener('change', syncDirForm);
  syncDirForm();
  $('#ac01-dir-add').addEventListener('click', () => {
    const result = addDirectoryEntry(directory, { group: dirGroup.value, label: dirLabel.value, firm: dirFirm.value });
    dirMessage.textContent = result.ok
      ? `„${result.entry.label}“ zur Demo-Liste hinzugefügt${result.entry.firm ? ` (Firma ${result.entry.firm})` : ''}. Nur im Arbeitsspeicher; bitte nur synthetische Namen oder Kennungen eintragen.`
      : { empty: 'Bitte einen Namen bzw. eine Kennung eintragen.', duplicate: 'Dieser Eintrag existiert in der Liste bereits.', 'firm-missing': 'Bitte die Firma des Subunternehmers angeben.' }[result.reason];
    if (!result.ok) return;
    dirLabel.value = '';
    if (result.entry.group === 'own') document.getElementById('ac01-people')?.insertAdjacentHTML('beforeend', `<option value="${escapeHtml(result.entry.label)}">`);
    renderPicker();
    dirLabel.focus();
  });
  $('#ac01-picker-office').addEventListener('change', event => {
    pickerOffice = event.target.checked;
    if (!pickerOffice) directory.filter(entry => entry.group === 'office').forEach(entry => pickerSelection.delete(entry.id));
    renderPicker();
  });
  $('#ac01-picker-add').addEventListener('click', () => {
    const entries = directory.filter(entry => pickerSelection.has(entry.id));
    if (!entries.length) return;
    const before = cloneEmployees();
    const result = prefillEmployees(employees, entries, '');
    employees = result.employees;
    pickerSelection.clear();
    renderEmployees();
    renderEvents();
    setUndo(before);
    const text = result.added
      ? `${result.added} ${result.added === 1 ? 'Person' : 'Personen'} in die Tagestabelle übernommen (nur Name bzw. Kennung, keine Zeiten).${result.skipped ? ` ${result.skipped} waren schon vorhanden.` : ''}`
      : 'Alle gewählten Personen sind schon in der Tagestabelle; nichts geändert.';
    pickerMessage.textContent = text;
    toolsMessage.textContent = text;       // visible although the picker folds away after adding
    if (result.added) $('#ac01-picker').open = false;
  });

  // Experimental text input: proposes rows; nothing changes until the user applies them.
  const suggestionsEl = $('#ac01-suggestions');
  function renderSuggestions() {
    suggestionsEl.hidden = !suggestions.length;
    suggestionsEl.innerHTML = suggestions.length
      ? `<p><strong>Vorschlag</strong> · wird erst nach Ihrer Bestätigung ergänzt:</p><ul>${suggestions.map(item => `<li>${item.count} Personen · ${escapeHtml(item.work)} · ${escapeHtml(item.location)}</li>`).join('')}</ul><button class="primary ac01-action" id="ac01-apply" type="button">Vorschlag ins Dashboard übernehmen</button>`
      : '';
  }

  $('#ac01-interpret').addEventListener('click', () => {
    const parsed = parseDemonstrationText($('#ac01-input').value);
    suggestions = parsed || [];
    setMessage(parsed ? '' : 'Dieser Wortlaut wird in der Demo nicht erkannt. Prüfen Sie mögliche Diktierfehler im Text oder tragen Sie die Arbeit direkt im Dashboard ein.', !parsed);
    renderSuggestions();
  });

  suggestionsEl.addEventListener('click', event => {
    if (!event.target.closest('#ac01-apply')) return;
    employees = employees.filter(employee => !isPristine(employee));
    employees.forEach(employee => { employee.collapsed = true; });
    const first = newEmployee();
    suggestions.forEach((item, groupIndex) => Array.from({ length: item.count }, (_, index) => {
      const created = groupIndex === 0 && index === 0 ? first : newEmployee();
      created.assignments = [newAssignment({ work: item.work, locations: [item.location] })];
      created.collapsed = !(groupIndex === 0 && index === 0);
      employees.push(created);
    }));
    const applied = suggestions.reduce((sum, item) => sum + item.count, 0);
    suggestions = [];
    renderSuggestions();
    renderEmployees();
    renderEvents();
    setMessage(`${applied} Zeilen ergänzt. Namen und Zeiten bitte im Dashboard eintragen; vorhandene Eingaben blieben unverändert.`, false);
    employeesEl.querySelector(`[data-employee="${first.id}"] [data-employee-field="name"]`)?.focus();
  });

  document.querySelectorAll('[data-jump]').forEach(button => button.addEventListener('click', () => {
    const target = $(button.dataset.jump);
    target.scrollIntoView({ block: 'start' });
    target.focus({ preventScroll: true });
  }));
  // iOS WebKit shows nothing in an empty time input; CSS draws a hint only there.
  if (typeof CSS !== 'undefined' && CSS.supports('-webkit-touch-callout', 'none')) document.documentElement.classList.add('ios-webkit');

  // Options are examples only; this is not a project master-data catalogue.
  [['ac01-categories', categoryOptions], ['ac01-locations', locationOptions], ['ac01-people', peopleOptions]].forEach(([id, options]) => {
    const datalist = document.createElement('datalist');
    datalist.id = id;
    datalist.innerHTML = options.map(option => `<option value="${escapeHtml(option)}">`).join('');
    document.body.append(datalist);
  });

  // ---- Save to Mission Control, reopen, new day ---------------------------------------------------------------
  const statusEl = $('#ac01-save-status');
  async function renderSaveStatus() {
    const token = ++statusToken;
    const key = { projectId: $('#ac01-project').value, date: $('#ac01-date').value };
    const label = `${projectNameOf(key.projectId)} · ${dateLabel(key.date)}`;
    const existing = key.projectId && key.date ? await workdays.load(key) : null;
    if (token !== statusToken) return;                    // a newer render superseded this one
    const dirty = isDirty();
    const open = editingKey ? `${projectNameOf(editingKey.projectId)} · ${dateLabel(editingKey.date)}` : '';
    let text;
    if (replacePending) text = `Für ${label} gibt es schon einen gespeicherten Tag. Erst ein zweiter Klick auf „Ja, ersetzen“ überschreibt ihn.`;
    else if (existing && !sameKey(editingKey, key)) text = `Achtung: Für ${label} ist bereits ein Tag gespeichert. Speichern ersetzt ihn erst nach Bestätigung; geöffnet wird er über Mission Control.`;
    else if (editingKey) text = dirty ? `Gespeicherter Tag ${open} wird bearbeitet · ungespeicherte Änderungen.` : `Gespeicherter Tag ${open} geöffnet · keine ungespeicherten Änderungen.`;
    else text = dirty ? 'Neuer Tag · noch nicht gespeichert.' : 'Neuer, leerer Tag.';
    statusEl.textContent = `${text} ${workdays.isPersistent() ? 'Gespeicherte Tage bleiben nur in diesem Browser auf diesem Gerät erhalten; nichts wird gesendet. Bitte nur erfundene Daten eingeben.' : 'Nur im Arbeitsspeicher dieser Demo: nach dem Neuladen der Seite ist alles weg.'}`;
    statusEl.classList.toggle('is-warning', replacePending || Boolean(existing && !sameKey(editingKey, key)));
    statusEl.dataset.dirty = String(dirty);               // drives the visible "Ungespeichert" marker
    renderSteps();
    document.dispatchEvent(new CustomEvent('ac01-dirtychange'));   // app.js: nav marker and notices on Mission Control / Stundenzettel
  }

  async function saveDay() {
    const key = { projectId: $('#ac01-project').value, date: $('#ac01-date').value };
    const warn = text => { statusEl.textContent = text; statusEl.classList.add('is-warning'); };
    if (!key.projectId || !key.date) { warn('Bitte Bauprojekt und Datum wählen, bevor der Tag gespeichert wird.'); return; }
    if (employees.every(isPristine) && !events.length && !Object.values(extras).some(value => value.trim())) { warn('Noch nichts erfasst: Es gibt nichts zu speichern.'); return; }
    const report = dayReport();
    const existing = await workdays.load(key);
    if (existing && !sameKey(editingKey, key) && !replacePending) {
      replacePending = true;                              // set after the render that precedes this click, reset by the next edit
      renderOverview();
      renderSaveStatus();
      return;
    }
    await workdays.save(report);
    reviewRequested = false;
    editingKey = key;
    savedSnapshot = snapshot();
    replacePending = false;
    const summary = summarize(current());
    if (typeof showSavedWorkday === 'function') showSavedWorkday(report, summary, Boolean(existing));
    renderSaveStatus();
  }

  // Opens a saved day for editing. Business data comes back exactly as saved; UI-only row state starts fresh.
  function openDay(report, { copyOf = '' } = {}) {
    const copy = structuredClone(report);
    employees = copy.employees.length ? copy.employees.map(employee => ({ ...employee, collapsed: copy.employees.length > 1, selected: false, prefill: '' })) : [newEmployee()];
    events = copy.events;
    Object.assign(extras, copy.extras);
    [['#ac01-equipment', 'equipment'], ['#ac01-material', 'material'], ['#ac01-contacts', 'contacts']].forEach(([selector, key]) => { $(selector).value = extras[key]; });
    $('#ac01-project').value = copy.projectId;
    $('#ac01-date').value = copy.date;
    pickerSelection.clear();
    suggestions = [];
    renderSuggestions();
    setMessage('');
    editingKey = copyOf ? null : { projectId: copy.projectId, date: copy.date };   // a copy is a NEW day: saving never "replaces" the original
    reviewRequested = false;
    toolsMessage.textContent = toolsDefault;
    renderEmployees();
    renderEvents();
    savedSnapshot = copyOf ? '' : snapshot();                                       // '' = never equal to a real snapshot: unsaved by definition
    if (copyOf) setMessage(`Kopie von ${copyOf}: Mitarbeitende, Arbeiten, Orte und Tagesangaben sind übernommen. Ereignisse und Fotos wurden nicht übernommen. Bitte das Datum prüfen und dann speichern.`);
    renderSaveStatus();
  }

  // Copy of a saved day as a new, unsaved day: people, activities (times, break, group, LV note, places) and the day's extras
  // are taken over; events and photo names are specific to the original day and are NOT. New row ids: the copy is its own day.
  function openCopy(report, date, label) {
    const copy = structuredClone(report);
    copy.date = date;
    copy.events = [];
    copy.employees = copy.employees.map(({ id, assignments, ...employee }) => newEmployee({
      ...employee,
      assignments: assignments.map(({ id: assignmentId, ...assignment }) => newAssignment({ ...assignment, photos: [], locationDraft: '' }))
    }));
    openDay(copy, { copyOf: label });
  }

  function newDay() {
    if (isDirty() && !newDayPending) {
      newDayPending = true;
      statusEl.textContent = 'Ungespeicherte Eingaben gehen verloren. Zum Verwerfen erneut auf „Neuer leerer Tag“ klicken.';
      statusEl.classList.add('is-warning');
      return;
    }
    employees = [newEmployee()];
    events = [];
    Object.keys(extras).forEach(key => { extras[key] = ''; });
    [['#ac01-equipment'], ['#ac01-material'], ['#ac01-contacts']].forEach(([selector]) => { $(selector).value = ''; });
    pickerSelection.clear();
    suggestions = [];
    renderSuggestions();
    setMessage('');
    editingKey = null;
    reviewRequested = false;
    toolsMessage.textContent = toolsDefault;
    renderEmployees();
    renderEvents();
    savedSnapshot = snapshot();
    renderSaveStatus();
  }
  $('#ac01-new-day').addEventListener('click', newDay);
  $('#ac01-view').addEventListener('click', event => { if (event.target.closest('[data-action="save-day"]')) saveDay(); });
  // "＋ Baustellentag erfassen" outside the navigation: a saved day with no unsaved changes becomes a new empty day.
  // Unsaved input, or a new day already open, is left alone (the caller only switches the view).
  root.AC01Workday = { open: openDay, openCopy, isDirty, startNew: () => { if (editingKey && !isDirty()) newDay(); }, draftKey: () => ({ projectId: $('#ac01-project').value, date: $('#ac01-date').value }), currentKey: () => (editingKey ? { ...editingKey } : null) };

  renderEmployees();
  renderEvents();
  savedSnapshot = snapshot();
  renderSaveStatus();
})(globalThis);
