/*
 * Stundenzettel from a saved Baustellentag (synthetic demo, memory only).
 *
 * Source of truth: the one WorkdayStore. This view only calls load() and list(); it never saves, so a Stundenzettel can
 * never change the Baustellentag. The editor/preview is the shared Stundenzettel UI from mission-control-spfx, loaded as
 * the generated vendor/stundenzettel.bundle.js and mounted in a shadow root so its styles and the shell's styles stay apart.
 * Drafts are kept per day while the page lives; a draft is only restored if the saved day is still exactly the same.
 * Uses the shell helpers from app.js ($, esc, project, dateText, switchView, openWorkday).
 */
(function (root) {
  'use strict';
  const drafts = new Map();          // day key -> { reportJson, state }
  let current = null;                // { projectId, date } of the day the Stundenzettel is made from
  let mounted = null;                // { key, reportJson, api }
  let token = 0;
  const keyOf = k => JSON.stringify([k.projectId, k.date]);
  // Running number within a project, for this page session only: the first Stundenzettel started for a project is 1, the next 2 ...
  // A day keeps its number when reopened. It is a proposal (no numbering rule is approved) and is lost on reload like everything else.
  const sequences = new Map();   // projectId -> Map(day key -> sequence)
  function sequenceFor(k) {
    const perProject = sequences.get(k.projectId) ?? sequences.set(k.projectId, new Map()).get(k.projectId);
    if (!perProject.has(keyOf(k))) perProject.set(keyOf(k), perProject.size + 1);
    return perProject.get(keyOf(k));
  }
  const localToday = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const lines = r => r.employees.reduce((n, e) => n + e.assignments.length, 0);

  function shadow() {
    const host = document.getElementById('ts-host');
    if (!host.shadowRoot) {
      const sr = host.attachShadow({ mode: 'open' });
      const style = document.createElement('style'); style.textContent = root.StundenzettelApp.css;
      const mount = document.createElement('div'); mount.className = 'ts-mount';
      sr.append(style, mount);
    }
    return host.shadowRoot;
  }
  function unmount() {
    if (!mounted) return;
    drafts.set(keyOf(mounted.key), { reportJson: mounted.reportJson, state: mounted.api.getState() });
    mounted.api.destroy(); mounted = null;
  }

  async function render() {
    const mine = ++token;
    unmount();
    const host = document.getElementById('ts-host');
    if (!root.StundenzettelApp) { host.hidden = true; $('#ts-source').innerHTML = '<div class="panel"><div class="empty">Der Stundenzettel-Baustein fehlt (vendor/stundenzettel.bundle.js).</div></div>'; return; }
    const report = current ? await WorkdayStore.store.load(current) : null;
    const days = await WorkdayStore.store.list();
    if (mine !== token) return;
    if (!report) { current = null; host.hidden = true; renderChooser(days); renderDraftNotices(); return; }

    // Other saved days of the same project may go into the same Stundenzettel (several worked days in one document). A change to any of them restarts the draft.
    const moreReports = days.filter(d => d.projectId === report.projectId && d.date !== report.date);
    const reportJson = JSON.stringify([report, ...moreReports]);
    const cached = drafts.get(keyOf(current));
    const restore = cached && cached.reportJson === reportJson ? cached.state : undefined;
    if (cached && !restore) drafts.delete(keyOf(current));
    const available = lines(report) + moreReports.reduce((n, d) => n + lines(d), 0);
    $('#ts-source').innerHTML = `<section class="ts-source" data-project="${esc(report.projectId)}" data-date="${esc(report.date)}" aria-label="Quelle des Stundenzettels">
      <div class="ts-source-main"><span class="eyebrow">QUELLE · GESPEICHERTER BAUSTELLENTAG</span><strong id="ts-src-project">${esc(project(report.projectId).name)}</strong><span id="ts-src-date">${esc(dateText(report.date))}</span></div>
      <dl class="ts-figures"><div><dt>Einträge verfügbar</dt><dd id="ts-available">${available}</dd></div><div><dt>Ausgewählt</dt><dd id="ts-selected">0</dd></div></dl>
      <div class="ts-source-actions"><button class="outline" type="button" data-ts-reopen><i class="ic-wrap" data-icon="pencil"></i>Baustellentag bearbeiten</button>${days.length > 1 ? '<button class="text-action" type="button" data-ts-choose>Anderen Tag wählen</button>' : ''}</div>
      <p class="ts-note">${cached && !restore ? '<strong>Der Baustellentag wurde seit dem letzten Entwurf geändert; der Stundenzettel beginnt neu.</strong> ' : ''}Der Baustellentag wird hier nur gelesen; Änderungen im Stundenzettel bleiben im Stundenzettel.</p></section>`;
    host.hidden = false;
    renderDraftNotices();
    const info = project(report.projectId);
    const suggestion = root.StundenzettelApp.suggestTimesheetMeta(report, { name: info.name, projectNo: info.no, client: info.client }, sequenceFor(current), localToday());
    mounted = {
      key: { ...current }, reportJson,
      api: root.StundenzettelApp.mountStundenzettel(shadow().querySelector('.ts-mount'), {
        report, moreReports, sourceName: 'Baustellentag', initialMeta: suggestion.meta, prefilled: suggestion.prefilled, restore,
        onChange: info => { const el = document.getElementById('ts-selected'); if (el) el.textContent = String(info.selected); },
      }),
    };
  }

  function renderChooser(days) {
    $('#ts-source').innerHTML = days.length
      ? `<section class="panel ts-choose"><div class="panel-head"><div><span class="eyebrow">QUELLE WÄHLEN</span><h2>Aus welchem Baustellentag?</h2></div><span class="count-pill">${days.length} ${days.length === 1 ? 'Tag' : 'Tage'}</span></div>${days.map(r =>
          `<article class="list-item ts-day" data-project="${esc(r.projectId)}" data-date="${esc(r.date)}"><div class="item-top"><strong>${esc(project(r.projectId).name)}</strong><button class="outline" type="button" data-ts-open>Stundenzettel erstellen <span aria-hidden="true">→</span></button></div><div class="item-sub">${esc(dateText(r.date))} · ${r.employees.length} Mitarbeitende · ${lines(r)} Arbeitszeilen</div></article>`).join('')}</section>`
      : `<section class="panel ts-empty"><div class="empty"><strong>Noch kein Baustellentag gespeichert.</strong><br>Ein Stundenzettel entsteht aus den Einträgen eines gespeicherten Baustellentags. Dort einmal erfassen und „Speichern → Mission Control“ wählen; Namen und Zeiten müssen dann nicht neu eingegeben werden.</div><div class="ts-empty-actions"><button class="primary" type="button" data-view="ac01">＋ Baustellentag erfassen</button></div></section>`;
  }

  function open(key) { current = { projectId: key.projectId, date: key.date }; switchView('timesheet'); }

  document.addEventListener('click', e => {
    const holder = el => el.closest('[data-project]');
    const start = e.target.closest('[data-ts-open]');
    if (start) { const h = holder(start); open({ projectId: h.dataset.project, date: h.dataset.date }); return; }
    if (e.target.closest('[data-ts-choose]')) { current = null; render(); return; }
    const reopen = e.target.closest('[data-ts-reopen]');
    if (reopen) { const h = holder(reopen); switchView('dashboard'); openWorkday({ projectId: h.dataset.project, date: h.dataset.date }); }
  });

  root.TimesheetView = { render, open, currentKey: () => (current ? { ...current } : null) };
})(globalThis);
