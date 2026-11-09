/*
 * AC-01 deterministic demonstration parser and review UI.
 * No AI, network access, persistence, or real employee/project data.
 */
(function (root) {
  'use strict';

  const peopleOptions = Array.from({ length: 12 }, (_, index) => `Demo-Person ${String(index + 1).padStart(2, '0')}`);
  const categoryOptions = ['Wände', 'Decken', 'Spachteln', 'Deckenunterkonstruktion'];
  const numberWords = { eins: 1, eine: 1, einer: 1, zwei: 2, drei: 3, vier: 4, fünf: 5, sechs: 6 };
  let assignments = [];
  let nextAssignmentId = 1;

  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);

  function parseDemonstrationText(input) {
    const sentences = String(input).trim().replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/).filter(Boolean);
    const countPattern = '(?<count>drei|3)';
    const first = new RegExp(`^(?:Heute )?haben ${countPattern} Mitarbeiter an den Wänden im zweiten Obergeschoss gearbeitet[.!?]?$`, 'i');
    const second = new RegExp(`^${countPattern} weitere Mitarbeiter haben die Decken im dritten Obergeschoss bearbeitet[.!?]?$`, 'i');
    if (sentences.length !== 2) return null;
    const firstMatch = sentences[0].match(first);
    const secondMatch = sentences[1].match(second);
    if (!firstMatch || !secondMatch) return null;

    const makeAssignment = (count, work, location) => ({
      id: `ac01-${nextAssignmentId++}`,
      work,
      location,
      sourceWork: work,
      sourceLocation: location,
      sourceCount: numberWords[count.toLowerCase()] || Number(count),
      people: Array.from({ length: numberWords[count.toLowerCase()] || Number(count) }, () => ({ person: '', hours: '' })),
      origin: 'extracted', open: false
    });
    return [
      makeAssignment(firstMatch.groups.count, 'Wände', 'Zweites Obergeschoss'),
      makeAssignment(secondMatch.groups.count, 'Decken', 'Drittes Obergeschoss')
    ];
  }

  function reviewAssignments(items) {
    const counts = new Map();
    items.forEach(item => item.people.forEach(person => {
      if (person.person) counts.set(person.person, (counts.get(person.person) || 0) + 1);
    }));
    const missing = [];
    const personChecks = new Map();
    const knownUniqueHours = [];
    items.forEach((item, groupIndex) => {
      if (!item.work.trim()) missing.push(`Arbeitszuweisung ${groupIndex + 1}: Leistungsgruppe fehlt`);
      if (!item.location.trim()) missing.push(`Arbeitszuweisung ${groupIndex + 1}: Arbeitsort fehlt`);
      if (!item.people.length) missing.push(`${item.work || `Arbeitszuweisung ${groupIndex + 1}`}: keine Person zugeordnet`);
      item.people.forEach((person, personIndex) => {
        const duplicate = Boolean(person.person && counts.get(person.person) > 1);
        const validHours = person.hours !== '' && Number.isFinite(Number(person.hours)) && Number(person.hours) > 0 && Number(person.hours) <= 24;
        personChecks.set(`${groupIndex}:${personIndex}`, { duplicate, validHours });
        if (!person.person) missing.push(`${item.work || `Arbeitszuweisung ${groupIndex + 1}`}: Person ${personIndex + 1} ist nicht benannt`);
        if (!validHours) missing.push(`${item.work || `Arbeitszuweisung ${groupIndex + 1}`}: Arbeitszeit für Person ${personIndex + 1} fehlt`);
        if (duplicate) missing.push(`${person.person} ist mehrfach zugeordnet; Zuordnungen bitte prüfen`);
        else if (person.person && validHours) knownUniqueHours.push(Number(person.hours));
      });
    });
    return { missing: [...new Set(missing)], personChecks, knownUniqueHours, complete: missing.length === 0 };
  }

  root.AC01Demo = { parse: parseDemonstrationText, review: reviewAssignments };
  if (!root.document) return;

  const $ = selector => document.querySelector(selector);
  const groupsEl = $('#ac01-groups');
  const messageEl = $('#ac01-message');
  const draftEl = $('#ac01-draft');
  const addGroupButton = $('#ac01-add-group');

  function setMessage(text, error = false) {
    messageEl.hidden = !text;
    messageEl.textContent = text;
    messageEl.classList.toggle('error', error);
  }

  function renderGroups() {
    groupsEl.querySelectorAll('.ac01-people-details').forEach(detail => {
      const item = assignments.find(assignment => assignment.id === detail.closest('[data-assignment]')?.dataset.assignment);
      if (item) item.open = detail.open;
    });
    $('#ac01-review-count').textContent = assignments.length ? `${assignments.length} ${assignments.length === 1 ? 'Arbeit' : 'Arbeiten'}` : '';
    if (!assignments.length) {
      groupsEl.innerHTML = '<p class="ac01-empty">Noch keine Arbeiten erkannt. Werten Sie den Text aus oder fügen Sie eine Arbeit hinzu.</p>';
      renderDraft();
      return;
    }

    const review = reviewAssignments(assignments);
    groupsEl.innerHTML = assignments.map((assignment, assignmentIndex) => {
      const missingPeople = assignment.people.filter(person => !person.person).length;
      const missingHours = assignment.people.filter(person => person.hours === '' || !(Number(person.hours) > 0 && Number(person.hours) <= 24)).length;
      const gaps = assignment.people.length ? [missingPeople && `${missingPeople} ${missingPeople === 1 ? 'Name' : 'Namen'}`, missingHours && `${missingHours} ${missingHours === 1 ? 'Zeit' : 'Zeiten'}`].filter(Boolean).join(', ') : 'Keine Person zugeordnet';
      return `
      <article class="ac01-assignment" data-assignment="${escapeHtml(assignment.id)}">
        <header class="ac01-assignment-head"><span><strong>${assignmentIndex + 1}. Arbeit</strong> <small>${assignment.sourceCount ? assignment.origin === 'extracted' ? 'Aus Text erkannt' : 'Korrigiert' : 'Manuell ergänzt'}</small></span><button class="ac01-remove" type="button" data-action="remove-assignment" aria-label="Arbeit ${assignmentIndex + 1} entfernen">Entfernen</button></header>
        <div class="ac01-fields">
          <div><label for="${assignment.id}-work">Leistungsgruppe</label><input id="${assignment.id}-work" data-field="work" list="ac01-categories" value="${escapeHtml(assignment.work)}" placeholder="z. B. Wände"></div>
          <div><label for="${assignment.id}-location">Arbeitsort</label><input id="${assignment.id}-location" data-field="location" value="${escapeHtml(assignment.location)}" placeholder="z. B. 2. OG"></div>
        </div>
        <details class="ac01-people-details" ${assignment.open ? 'open' : ''}><summary><strong>${assignment.people.length} ${assignment.people.length === 1 ? 'Person' : 'Personen'} zuordnen</strong><span>${gaps || 'Namen und Stunden eingetragen'}</span></summary>
          <div class="ac01-person-list">${assignment.people.map((person, personIndex) => renderPerson(assignment, person, personIndex, review.personChecks.get(`${assignmentIndex}:${personIndex}`))).join('')}</div>
          <button class="ac01-add-person" type="button" data-action="add-person">＋ Person hinzufügen</button>
        </details>
      </article>`;
    }).join('');
    renderDraft();
  }

  function renderPerson(assignment, person, personIndex, check) {
    const personId = `${assignment.id}-person-${personIndex}`;
    const options = peopleOptions.map(name => `<option value="${escapeHtml(name)}" ${person.person === name ? 'selected' : ''}>${escapeHtml(name)} · synthetisch</option>`).join('');
    return `<div class="ac01-person-row ${check?.duplicate ? 'has-conflict' : ''}" data-person="${personIndex}">
      <div><label class="sr-only" for="${personId}-name">Person ${personIndex + 1}</label><select id="${personId}-name" data-person-field="person"><option value="">Person wählen</option>${options}</select>${check?.duplicate ? '<span class="ac01-row-warning">Person bereits zugeordnet</span>' : ''}</div>
      <div><label class="sr-only" for="${personId}-hours">Stunden für Person ${personIndex + 1}</label><div class="ac01-hours"><input id="${personId}-hours" data-person-field="hours" type="number" min="0" max="24" step="0.25" value="${escapeHtml(person.hours)}" placeholder="Stunden"><span>Std.</span></div></div>
      <button class="ac01-remove-person" type="button" data-action="remove-person" aria-label="Personenzeile entfernen">×</button>
    </div>`;
  }

  function renderDraft() {
    if (!assignments.length) {
      draftEl.innerHTML = '<p class="ac01-empty">Der Entwurf erscheint, sobald Sie den Beispieltext auswerten oder Arbeit hinzufügen.</p>';
      return;
    }
    const review = reviewAssignments(assignments);

    const assignmentMarkup = assignments.map((assignment, assignmentIndex) => {
      const peopleMarkup = assignment.people.map((person, personIndex) => {
        const who = person.person ? escapeHtml(person.person) : `Person ${personIndex + 1} · Identität nicht angegeben`;
        const { duplicate, validHours } = review.personChecks.get(`${assignmentIndex}:${personIndex}`);
        const hoursText = validHours ? `${escapeHtml(person.hours)} Stunden` : 'Arbeitszeit nicht angegeben';
        return `<li><span>${who}</span><span>${hoursText}${duplicate ? ' · doppelte Zuordnung' : ''}</span></li>`;
      }).join('');
      return `<section class="ac01-draft-assignment"><h4>${escapeHtml(assignment.work || 'Leistungsgruppe fehlt')} <span>· ${escapeHtml(assignment.location || 'Arbeitsort fehlt')}</span></h4><ul>${peopleMarkup || '<li>Keine Personen zugeordnet</li>'}</ul></section>`;
    }).join('');

    const incomplete = !review.complete;
    const missingMarkup = incomplete
      ? `<div class="ac01-missing"><strong>${review.missing.length} ${review.missing.length === 1 ? 'Angabe fehlt' : 'Angaben fehlen'}</strong><details><summary>Fehlende Angaben ansehen</summary><ul>${review.missing.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul></details></div>`
      : '<p class="ac01-complete">Alle Personen und Stunden sind eingetragen. Der Entwurf bleibt ungeprüft.</p>';
    const subtotal = review.knownUniqueHours.length ? `<p class="ac01-subtotal">Zwischensumme eindeutiger, zugeordneter Personenzeilen: <strong>${review.knownUniqueHours.reduce((sum, hours) => sum + hours, 0).toLocaleString('de-DE')} Std.</strong> · keine bestätigte Tagesgesamtsumme</p>` : '';

    draftEl.innerHTML = `<div class="ac01-report-status"><span class="ac01-status ${incomplete ? 'is-incomplete' : ''}">${incomplete ? 'Entwurf · unvollständig' : 'Entwurf · ungeprüft'}</span><span>Keine Freigabe · kein Versand</span></div><div class="ac01-draft-meta"><div><small>BAUPROJEKT</small><strong>Demo-Bauprojekt Alpha</strong></div><div><small>DATUM</small><strong>09.11.2026</strong></div></div><p class="ac01-demo-line">Projekt und Datum sind synthetische Beispiele.</p>
      <div class="ac01-draft-assignments">${assignmentMarkup}</div>${subtotal}${missingMarkup}`;
  }

  $('#ac01-interpret').addEventListener('click', () => {
    const parsed = parseDemonstrationText($('#ac01-input').value);
    assignments = parsed || [];
    if (parsed) {
      setMessage('', false);
    } else {
      setMessage('Dieser Wortlaut wird in der Demo nicht erkannt. Prüfen Sie mögliche Diktierfehler im Text. Stimmt der Text, fügen Sie die Arbeit manuell hinzu; fehlende Personen und Stunden ergänzen Sie anschließend.', true);
    }
    renderGroups();
    if (parsed) $('#ac01-review-title').focus();
  });

  $('#ac01-input').addEventListener('input', () => {
    if (assignments.length) {
      setMessage('Text geändert. „Arbeiten erkennen“ aktualisiert die Vorschläge; Ihre bisherigen Korrekturen bleiben bis dahin sichtbar.', false);
    }
  });

  groupsEl.addEventListener('input', event => {
    const assignmentEl = event.target.closest('[data-assignment]');
    const field = event.target.dataset.field;
    if (!assignmentEl || !field) return;
    const assignment = assignments.find(item => item.id === assignmentEl.dataset.assignment);
    if (!assignment) return;
    assignment[field] = event.target.value;
    assignment.origin = 'entered';
    renderDraft();
  });

  groupsEl.addEventListener('change', event => {
    const assignmentEl = event.target.closest('[data-assignment]');
    const personEl = event.target.closest('[data-person]');
    if (assignmentEl && event.target.dataset.personField) {
      const assignment = assignments.find(item => item.id === assignmentEl.dataset.assignment);
      const person = assignment?.people[Number(personEl.dataset.person)];
      if (person) person[event.target.dataset.personField] = event.target.value;
      const selector = `[data-assignment="${assignment.id}"] [data-person="${personEl.dataset.person}"] [data-person-field="${event.target.dataset.personField}"]`;
      renderGroups();
      groupsEl.querySelector(selector)?.focus();
    }
  });
  groupsEl.addEventListener('input', event => {
    const assignmentEl = event.target.closest('[data-assignment]');
    const personEl = event.target.closest('[data-person]');
    if (!assignmentEl || !event.target.dataset.personField) return;
    const assignment = assignments.find(item => item.id === assignmentEl.dataset.assignment);
    const person = assignment?.people[Number(personEl.dataset.person)];
    if (person) person[event.target.dataset.personField] = event.target.value;
    renderDraft();
  });

  groupsEl.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const assignmentEl = button.closest('[data-assignment]');
    const assignment = assignments.find(item => item.id === assignmentEl?.dataset.assignment);
    if (button.dataset.action === 'remove-assignment') assignments = assignments.filter(item => item !== assignment);
    if (button.dataset.action === 'add-person' && assignment) { assignment.people.push({ person: '', hours: '' }); assignment.open = true; }
    if (button.dataset.action === 'remove-person' && assignment) assignment.people.splice(Number(button.closest('[data-person]').dataset.person), 1);
    renderGroups();
    if (button.dataset.action === 'add-person' && assignment) groupsEl.querySelector(`[data-assignment="${assignment.id}"] .ac01-person-row:last-child select`)?.focus();
  });

  addGroupButton.addEventListener('click', () => {
    const id = `ac01-${nextAssignmentId++}`;
    assignments.push({ id, work: '', location: '', sourceWork: '', sourceLocation: '', sourceCount: 0, people: [{ person: '', hours: '' }], origin: 'entered', open: true });
    renderGroups();
    groupsEl.querySelector(`[data-assignment="${id}"] [data-field="work"]`)?.focus();
  });

  // Options are examples only; this is not a project master-data catalogue.
  const datalist = document.createElement('datalist');
  datalist.id = 'ac01-categories';
  datalist.innerHTML = categoryOptions.map(option => `<option value="${escapeHtml(option)}">`).join('');
  document.body.append(datalist);
})(globalThis);
