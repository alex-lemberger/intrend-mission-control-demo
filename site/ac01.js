/*
 * AC-01 dashboard-first daily recording (synthetic demo).
 * Manual entry is the primary path; the deterministic text recognizer is an optional experiment
 * that only proposes rows. No AI, network access, persistence, or real employee/project data.
 * The draft structure below is UI-local; it is not a domain model or an approved business rule.
 */
(function (root) {
  'use strict';

  const peopleOptions = Array.from({ length: 12 }, (_, index) => `Demo-Person ${String(index + 1).padStart(2, '0')}`);
  const categoryOptions = ['Wände', 'Decken', 'Spachteln', 'Deckenunterkonstruktion'];
  const locationOptions = ['Erdgeschoss', 'Zweites Obergeschoss', 'Drittes Obergeschoss', 'Treppenhaus', 'Flur'];
  const eventTypes = ['Baubehinderung', 'Stundenzettel', 'Bedenken', 'Nachtrag / Nachtragsposition', 'Sonstiges'];
  const numberWords = { eins: 1, eine: 1, einer: 1, zwei: 2, drei: 3, vier: 4, fünf: 5, sechs: 6 };
  let sequence = 1;
  const nextId = prefix => `${prefix}${sequence++}`;

  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);

  const newAssignment = (data = {}) => ({
    id: nextId('a'), start: '', end: '', breakMin: '', work: '', lv: '', locations: [], locationDraft: '', photos: [], ...data
  });
  const newEmployee = (data = {}) => ({ id: nextId('e'), name: '', assignments: [newAssignment()], ...data });
  const newEvent = type => ({ id: nextId('v'), type, description: '', people: [], from: '', to: '' });

  // Recognizer experiment: supports only the supplied two-sentence pattern; returns suggestions, never state.
  function parseDemonstrationText(input) {
    const sentences = String(input).trim().replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/).filter(Boolean);
    const countPattern = '(?<count>drei|3)';
    const first = new RegExp(`^(?:Heute )?haben ${countPattern} Mitarbeiter an den Wänden im zweiten Obergeschoss gearbeitet[.!?]?$`, 'i');
    const second = new RegExp(`^${countPattern} weitere Mitarbeiter haben die Decken im dritten Obergeschoss bearbeitet[.!?]?$`, 'i');
    if (sentences.length !== 2) return null;
    const firstMatch = sentences[0].match(first);
    const secondMatch = sentences[1].match(second);
    if (!firstMatch || !secondMatch) return null;
    const count = word => numberWords[word.toLowerCase()] || Number(word);
    return [
      { count: count(firstMatch.groups.count), work: 'Wände', location: 'Zweites Obergeschoss' },
      { count: count(secondMatch.groups.count), work: 'Decken', location: 'Drittes Obergeschoss' }
    ];
  }

  const toMinutes = value => {
    const match = /^(\d{2}):(\d{2})$/.exec(value || '');
    if (!match) return null;
    const hours = Number(match[1]), minutes = Number(match[2]);
    return hours < 24 && minutes < 60 ? hours * 60 + minutes : null;
  };
  const fromMinutes = total => `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  const normalizeName = name => String(name || '').trim().replace(/\s+/g, ' ').toLowerCase();
  const employeeLabel = (employee, index) => employee.name.trim() || `Mitarbeiter ${index + 1} (ohne Namen)`;

  /*
   * Derives only what the entered data defines. No break is deducted, no hours are summed, and event
   * times are never added to normal working time: those rules are open.
   */
  function summarize({ employees, events }) {
    const nameCounts = new Map();
    const issues = {};
    const missing = [];
    const starts = [], ends = [];
    let unnamed = 0, assignmentCount = 0;

    employees.forEach((employee, employeeIndex) => {
      const label = employeeLabel(employee, employeeIndex);
      const key = normalizeName(employee.name);
      if (key) nameCounts.set(key, (nameCounts.get(key) || 0) + 1);
      else { unnamed += 1; missing.push(`${label}: Name fehlt`); }
      if (!employee.assignments.length) missing.push(`${label}: keine Arbeit erfasst`);
      const spans = [];
      employee.assignments.forEach((assignment, assignmentIndex) => {
        assignmentCount += 1;
        const where = `${label}, Arbeit ${assignmentIndex + 1}`;
        const notes = [];
        issues[assignment.id] = notes;
        const start = toMinutes(assignment.start), end = toMinutes(assignment.end);
        if (start === null) missing.push(`${where}: Beginn fehlt`); else starts.push(start);
        if (end === null) missing.push(`${where}: Ende fehlt`); else ends.push(end);
        if (start !== null && end !== null) {
          if (end <= start) { notes.push('Das Ende liegt nicht nach dem Beginn.'); missing.push(`${where}: Ende liegt nicht nach dem Beginn`); }
          else spans.push({ id: assignment.id, start, end });
        }
        if (assignment.breakMin !== '') {
          const pause = Number(assignment.breakMin);
          if (!Number.isFinite(pause) || pause < 0 || pause > 480) { notes.push('Die Pause muss zwischen 0 und 480 Minuten liegen.'); missing.push(`${where}: Pause ungültig`); }
          else if (start !== null && end !== null && end > start && pause > end - start) { notes.push('Die Pause ist länger als die Zeitspanne.'); missing.push(`${where}: Pause länger als Zeitspanne`); }
        }
        if (!assignment.work.trim() && !assignment.lv.trim()) missing.push(`${where}: Tätigkeit fehlt`);
        if (!assignment.locations.length && !assignment.locationDraft.trim()) missing.push(`${where}: Ort fehlt`);
        if (assignment.locationDraft.trim()) {
          notes.push(`Der Ort „${assignment.locationDraft.trim()}“ ist noch nicht hinzugefügt.`);
          missing.push(`${where}: Ort noch nicht hinzugefügt`);
        }
      });
      spans.sort((a, b) => a.start - b.start);
      spans.forEach((span, index) => {
        const next = spans[index + 1];
        if (next && next.start < span.end) {
          const warning = 'Überschneidung mit einer anderen Arbeit derselben Person: Die Zeit könnte doppelt erfasst sein (Regel offen).';
          [span.id, next.id].forEach(id => { if (!issues[id].includes(warning)) issues[id].push(warning); });
          missing.push(`${label}: sich überschneidende Arbeitszeiten`);
        }
      });
    });
    const duplicates = [...nameCounts].filter(([, count]) => count > 1).map(([name]) => name);
    duplicates.forEach(name => missing.push(`${name} ist mehrfach erfasst und zählt einmal; bitte zusammenführen`));
    events.forEach((event, index) => {
      if (!event.description.trim()) missing.push(`Ereignis ${index + 1} (${event.type}): Beschreibung fehlt`);
    });
    return {
      named: nameCounts.size,
      unnamed,
      duplicates,
      assignmentCount,
      earliest: starts.length ? Math.min(...starts) : null,
      latest: ends.length ? Math.max(...ends) : null,
      issues,
      missing: [...new Set(missing)],
      complete: assignmentCount > 0 && missing.length === 0
    };
  }

  root.AC01Demo = { parse: parseDemonstrationText, summarize, toMinutes, newEmployee, newAssignment, newEvent };
  if (!root.document) return;

  const $ = selector => document.querySelector(selector);
  const projectList = typeof projects !== 'undefined' ? projects : [{ id: 'demo', name: 'Demo-Bauprojekt Alpha' }];
  let employees = [newEmployee()];
  let events = [];
  const extras = { equipment: '', material: '', contacts: '' };
  let suggestions = [];

  const employeesEl = $('#ac01-employees');
  const eventsEl = $('#ac01-events');
  const reportEl = $('#ac01-draft');
  const messageEl = $('#ac01-message');
  const current = () => ({ employees, events });
  const findEmployee = element => employees.find(item => item.id === element.closest('[data-employee]')?.dataset.employee);
  const findAssignment = (employee, element) => employee?.assignments.find(item => item.id === element.closest('[data-assignment]')?.dataset.assignment);

  function setMessage(text, error = false) {
    messageEl.hidden = !text;
    messageEl.textContent = text;
    messageEl.classList.toggle('error', error);
  }

  const chipsMarkup = assignment => assignment.locations.map((location, index) =>
    `<span class="ac01-chip">${escapeHtml(location)}<button type="button" data-action="remove-location" data-index="${index}" aria-label="Ort ${escapeHtml(location)} entfernen">×</button></span>`).join('');
  const photosText = assignment => assignment.photos.length ? `${assignment.photos.join(', ')} · nur lokale Auswahl, kein Upload` : 'Keine Fotos ausgewählt';

  function renderAssignment(employee, assignment, index) {
    const id = assignment.id;
    return `<div class="ac01-assignment" data-assignment="${id}">
      <div class="ac01-assignment-head"><strong>Arbeit ${index + 1}</strong>${employee.assignments.length > 1 ? `<button class="ac01-remove" type="button" data-action="remove-assignment" aria-label="Arbeit ${index + 1} entfernen">Entfernen</button>` : ''}</div>
      <div class="ac01-times">
        <div><label for="${id}-start">Beginn</label><input id="${id}-start" data-field="start" type="time" value="${escapeHtml(assignment.start)}"></div>
        <div><label for="${id}-end">Ende</label><input id="${id}-end" data-field="end" type="time" value="${escapeHtml(assignment.end)}"></div>
        <div><label for="${id}-break">Pause (Min.)</label><input id="${id}-break" data-field="breakMin" type="number" min="0" max="480" step="5" inputmode="numeric" value="${escapeHtml(assignment.breakMin)}" placeholder="optional"></div>
        <div class="ac01-work"><label for="${id}-work">Leistungsgruppe</label><input id="${id}-work" data-field="work" list="ac01-categories" value="${escapeHtml(assignment.work)}" placeholder="z. B. Wände"></div>
      </div>
      <div class="ac01-where">
        <label for="${id}-location">Ort / Bauteil (mehrere möglich)</label>
        <div class="ac01-chips" data-chips>${chipsMarkup(assignment)}</div>
        <div class="ac01-chip-add"><input id="${id}-location" data-field="locationDraft" list="ac01-locations" value="${escapeHtml(assignment.locationDraft)}" placeholder="Ort wählen oder eingeben"><button class="ac01-add" type="button" data-action="add-location">Ort hinzufügen</button></div>
      </div>
      <div class="ac01-extra-fields">
        <div><label for="${id}-lv">LV-Position oder eigene Tätigkeit (optional)</label><input id="${id}-lv" data-field="lv" value="${escapeHtml(assignment.lv)}" placeholder="z. B. Pos. 2.4.10 oder freier Text"></div>
        <div><label for="${id}-photos">Fotos zur Tätigkeit (lokale Demoauswahl)</label><input id="${id}-photos" data-field="photos" type="file" accept="image/*" multiple><span class="ac01-photo-names" data-photo-names>${escapeHtml(photosText(assignment))}</span></div>
      </div>
      <p class="ac01-row-note" role="status" hidden></p>
    </div>`;
  }

  function renderEmployees() {
    employeesEl.innerHTML = employees.map((employee, index) => `<article class="ac01-employee" data-employee="${employee.id}">
      <header class="ac01-employee-head"><div class="ac01-name"><label for="${employee.id}-name">Mitarbeiter ${index + 1}</label><input id="${employee.id}-name" data-employee-field="name" list="ac01-people" value="${escapeHtml(employee.name)}" placeholder="Name"></div><button class="ac01-remove" type="button" data-action="remove-employee" aria-label="Mitarbeiter ${index + 1} entfernen">Entfernen</button></header>
      ${employee.assignments.map((assignment, assignmentIndex) => renderAssignment(employee, assignment, assignmentIndex)).join('')}
      <button class="ac01-add" type="button" data-action="add-assignment">＋ Weitere Arbeit für diese Person</button>
    </article>`).join('') || '<p class="ac01-empty">Noch keine Mitarbeitenden erfasst.</p>';
    refresh();
  }

  function renderEvents() {
    eventsEl.innerHTML = events.length ? events.map((event, index) => `<article class="ac01-event" data-event="${event.id}">
      <div class="ac01-assignment-head"><strong>Ereignis ${index + 1}</strong><button class="ac01-remove" type="button" data-action="remove-event" aria-label="Ereignis ${index + 1} entfernen">Entfernen</button></div>
      <div class="ac01-fields">
        <div><label for="${event.id}-type">Ereignisart</label><select id="${event.id}-type" data-event-field="type">${eventTypes.map(type => `<option ${type === event.type ? 'selected' : ''}>${escapeHtml(type)}</option>`).join('')}</select></div>
        <div class="ac01-times ac01-event-times"><div><label for="${event.id}-from">Zeit von (optional)</label><input id="${event.id}-from" data-event-field="from" type="time" value="${escapeHtml(event.from)}"></div><div><label for="${event.id}-to">bis</label><input id="${event.id}-to" data-event-field="to" type="time" value="${escapeHtml(event.to)}"></div></div>
      </div>
      <label for="${event.id}-description">Beschreibung</label><textarea id="${event.id}-description" data-event-field="description" rows="2" placeholder="Was ist passiert, wo, welche Arbeiten waren betroffen?">${escapeHtml(event.description)}</textarea>
      <fieldset class="ac01-affected"><legend>Betroffene Mitarbeiter</legend>${employees.map((employee, employeeIndex) => `<label class="ac01-check"><input type="checkbox" data-event-person="${employee.id}" ${event.people.includes(employee.id) ? 'checked' : ''}> ${escapeHtml(employeeLabel(employee, employeeIndex))}</label>`).join('') || '<span class="ac01-hint">Zuerst Mitarbeitende erfassen.</span>'}</fieldset>
      <p class="ac01-hint">Ereigniszeit ist keine Zusatzzeit zur normalen Arbeitszeit; die Zuordnung ist offen.</p>
    </article>`).join('') : '<p class="ac01-empty">Noch keine Ereignisse erfasst.</p>';
    renderReport();
  }

  function refresh() {
    updateNotes();
    renderReport();
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
  }

  const listItems = items => items.map(item => `<li>${escapeHtml(item)}</li>`).join('');
  const dateLabel = value => value ? new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(`${value}T12:00:00`)) : 'Datum fehlt';

  function renderReport() {
    const summary = summarize(current());
    const projectName = projectList.find(item => item.id === $('#ac01-project').value)?.name || 'Projekt fehlt';
    const names = new Map(employees.map((employee, index) => [employee.id, employeeLabel(employee, index)]));
    const people = summary.named || summary.unnamed
      ? `${summary.named} benannt${summary.unnamed ? ` · ${summary.unnamed} ohne Namen` : ''}${summary.duplicates.length ? ' · Doppelnamen zählen einmal' : ''}`
      : 'Noch keine';
    const crewMarkup = employees.map((employee, index) => `<section class="ac01-draft-employee"><h4>${escapeHtml(employeeLabel(employee, index))}</h4><ul>${employee.assignments.map(assignment => `<li>
        <strong>${escapeHtml(assignment.start || '?')}–${escapeHtml(assignment.end || '?')}</strong> <span>${assignment.breakMin !== '' ? `Pause ${escapeHtml(assignment.breakMin)} Min.` : 'Pause nicht angegeben'}</span>
        <span>${escapeHtml([assignment.work, assignment.lv].filter(value => value.trim()).join(' · ') || 'Tätigkeit fehlt')}</span>
        <span>Ort: ${escapeHtml(assignment.locations.join(', ') || 'fehlt')}</span>
        ${assignment.photos.length ? `<span>Fotos: ${escapeHtml(photosText(assignment))}</span>` : ''}
      </li>`).join('') || '<li><span>Keine Arbeit erfasst</span></li>'}</ul></section>`).join('');
    const eventMarkup = events.length ? events.map(event => {
      const affected = event.people.map(id => names.get(id)).filter(Boolean);
      const time = event.from || event.to ? `${event.from || '?'}–${event.to || '?'}` : '';
      return `<li><strong>${escapeHtml(event.type)}</strong> <span>${escapeHtml(event.description.trim() || 'Beschreibung fehlt')}</span>${affected.length ? `<span>Betroffen: ${escapeHtml(affected.join(', '))}</span>` : ''}${time ? `<span>Zeit: ${escapeHtml(time)} · nicht zur Normalzeit addiert</span>` : ''}</li>`;
    }).join('') : '<li><span>Keine außergewöhnlichen Ereignisse erfasst.</span></li>';
    const note = value => value.trim() ? escapeHtml(value.trim()) : 'nicht angegeben';
    const incomplete = !summary.complete;

    reportEl.innerHTML = `<div class="ac01-report-status"><span class="ac01-status ${incomplete ? 'is-incomplete' : ''}">${incomplete ? 'Entwurf · unvollständig' : 'Entwurf · ungeprüft'}</span><span>Keine Freigabe · kein Versand</span></div>
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
      ${incomplete && summary.missing.length ? `<div class="ac01-missing"><strong>${summary.missing.length} ${summary.missing.length === 1 ? 'Hinweis' : 'Hinweise'}</strong><details><summary>Fehlende oder zu prüfende Angaben ansehen</summary><ul>${listItems(summary.missing)}</ul></details></div>` : incomplete ? '' : '<p class="ac01-complete">Keine fehlenden Angaben erkannt. Der Entwurf bleibt ungeprüft; Pausen-, Zeit- und Berichtsregeln sind offen.</p>'}`;
  }

  // Context and additional information
  $('#ac01-project').innerHTML = projectList.map(item => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.name)}</option>`).join('');
  $('#ac01-date').value = '2026-11-09';
  ['#ac01-project', '#ac01-date'].forEach(selector => $(selector).addEventListener('input', renderReport));
  [['#ac01-equipment', 'equipment'], ['#ac01-material', 'material'], ['#ac01-contacts', 'contacts']].forEach(([selector, key]) => {
    $(selector).addEventListener('input', event => { extras[key] = event.target.value; renderReport(); });
  });

  // Employees and assignments
  employeesEl.addEventListener('input', event => {
    const employee = findEmployee(event.target);
    if (!employee) return;
    if (event.target.dataset.employeeField === 'name') employee.name = event.target.value;
    const assignment = findAssignment(employee, event.target);
    const field = event.target.dataset.field;
    if (assignment && field && field !== 'photos') assignment[field] = event.target.value;
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
    const assignment = findAssignment(employee, event.target);
    if (event.target.dataset.employeeField === 'name') renderEvents();
    if (assignment && event.target.dataset.field === 'locationDraft') commitLocation(employee, assignment, event.target.closest('[data-assignment]'));
    if (assignment && event.target.dataset.field === 'photos') {
      assignment.photos = [...event.target.files].map(file => file.name);
      event.target.closest('[data-assignment]').querySelector('[data-photo-names]').textContent = photosText(assignment);
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
    employees.push(created);
    renderEmployees();
    renderEvents();
    employeesEl.querySelector(`[data-employee="${created.id}"] [data-employee-field="name"]`)?.focus();
  });

  // Exceptional events
  $('#ac01-event-add').addEventListener('click', event => {
    const button = event.target.closest('[data-type]');
    if (!button) return;
    const created = newEvent(button.dataset.type);
    events.push(created);
    renderEvents();
    eventsEl.querySelector(`[data-event="${created.id}"] textarea`)?.focus();
  });

  const findEvent = element => events.find(item => item.id === element.closest('[data-event]')?.dataset.event);
  eventsEl.addEventListener('input', event => {
    const item = findEvent(event.target);
    const field = event.target.dataset.eventField;
    if (item && field) { item[field] = event.target.value; renderReport(); }
  });
  eventsEl.addEventListener('change', event => {
    const item = findEvent(event.target);
    if (!item) return;
    const personId = event.target.dataset.eventPerson;
    if (personId) item.people = event.target.checked ? [...new Set([...item.people, personId])] : item.people.filter(id => id !== personId);
    else if (event.target.dataset.eventField === 'type') item.type = event.target.value;
    renderReport();
  });
  eventsEl.addEventListener('click', event => {
    const button = event.target.closest('[data-action="remove-event"]');
    if (!button) return;
    events = events.filter(item => item !== findEvent(button));
    renderEvents();
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
    const pristine = employee => !employee.name.trim() && employee.assignments.length === 1
      && ['start', 'end', 'breakMin', 'work', 'lv', 'locationDraft'].every(key => !employee.assignments[0][key]) && !employee.assignments[0].locations.length && !employee.assignments[0].photos.length;
    employees = employees.filter(employee => !pristine(employee));
    const first = newEmployee();
    suggestions.forEach((item, groupIndex) => Array.from({ length: item.count }, (_, index) => {
      const created = groupIndex === 0 && index === 0 ? first : newEmployee();
      created.assignments = [newAssignment({ work: item.work, locations: [item.location] })];
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

  // Options are examples only; this is not a project master-data catalogue.
  [['ac01-categories', categoryOptions], ['ac01-locations', locationOptions], ['ac01-people', peopleOptions]].forEach(([id, options]) => {
    const datalist = document.createElement('datalist');
    datalist.id = id;
    datalist.innerHTML = options.map(option => `<option value="${escapeHtml(option)}">`).join('');
    document.body.append(datalist);
  });

  renderEmployees();
  renderEvents();
})(globalThis);
