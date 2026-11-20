/* Local, synthetic UI state only. No network calls or persistence. */
const projects = [
  { id: 'hafen', name: 'Hafenbogen · Bauteil B', place: 'Hamburg · HafenCity', no: 'DEMO-001', client: 'Muster-Auftraggeber A' },
  { id: 'allee', name: 'Allee 17 · Innenausbau', place: 'Hamburg · Altona', no: 'DEMO-002', client: 'Muster-Auftraggeber B' },
  { id: 'quartier', name: 'Quartier West · Haus 3', place: 'Norderstedt', no: 'DEMO-003', client: 'Muster-Auftraggeber C' }
];
const today = '2026-11-07';
const seed = [
  { id: 'r1', seed: true, project: 'allee', date: today, floor: '1. OG · Westflügel', responsible: 'Deniz Yilmaz · Vertretung', work: 'Trockenbauwände gestellt, Türöffnungen vorbereitet', crew: [{name:'Deniz Yilmaz',hours:8},{name:'Jonas Krüger',hours:8},{name:'Mika Özdemir',hours:7.5}], lv:'', events:[{id:'e1',type:'Hindernis',title:'Material blockiert Arbeitsbereich',description:'Fremdmaterial steht im Flur vor Achse 4. Arbeiten an der Trockenbauwand dort unterbrochen.',hours:2,floor:'1. OG · Westflügel',photos:['Flur_Achse4.jpg'],obstacle:'Zugang zur Arbeitsfläche blockiert',lv:''}] },
  { id: 'r2', seed: true, project: 'quartier', date: '2026-11-06', floor: 'EG · Eingangsbereich', responsible: 'Laura Beck · Vertretung', work: 'Unterkonstruktion für Deckenbekleidung montiert', crew:[{name:'Laura Beck',hours:8},{name:'Emre Kaya',hours:8}], lv:'', events:[{id:'e2',type:'Zusatzarbeit',title:'Zusätzliche Abkofferung dokumentiert',description:'Zusätzliche Abkofferung an der Installationszone aufgenommen; Umfang vor Ausführung zu klären.',hours:1.5,floor:'EG · Eingangsbereich',photos:[],obstacle:'',lv:''}] }
];
/* `seed` reports exist only so the legacy form can demonstrate "existing report"; Mission Control never lists them. */
const state = { reports: structuredClone(seed), selectedEvent:'e1', draftType:'Stundenzettel', draftRequested:false, draftEvent:null, view:'dashboard' };
const photoPreviews = new Map();
const defaultCrew = [{name:'Martin Seidel',hours:8},{name:'Jonas Krüger',hours:8},{name:'Mika Özdemir',hours:8}];
let activeReportKey = `hafen|${today}`;
let formDirty = false;
const $ = (s, root=document) => root.querySelector(s);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const project = id => projects.find(p=>p.id===id) || projects[0];
const dateText = value => new Intl.DateTimeFormat('de-DE',{day:'2-digit',month:'long',year:'numeric'}).format(new Date(`${value}T12:00:00`));
const hourText = n => Number(n).toLocaleString('de-DE',{maximumFractionDigits:1}) + ' h';
const allEvents = () => state.reports.flatMap(r => r.events.map(e => ({...e, report:r})));
const uid = () => 'demo-' + Math.random().toString(36).slice(2,9);

/*
 * Unsaved-changes protection for "Baustellentag erfassen" (AC-01). Source of truth for "dirty" is AC01Workday.isDirty():
 * the serialized business data compared with the last load/save. Nothing here saves or discards anything.
 * - Leaving the editor inside the app asks once (in-page dialog, no native confirm); the draft stays in the editor.
 * - Closing/reloading the tab uses the browser's own beforeunload prompt (its text cannot be customised).
 * - Mission Control and Stundenzettel show a notice while a draft exists; both only ever read saved days.
 */
const editorDirty = () => typeof AC01Workday !== 'undefined' && AC01Workday.isDirty();
const draftLabel = () => { const k = AC01Workday.draftKey(); return k.projectId && k.date ? `${project(k.projectId).name} · ${dateText(k.date)}` : 'noch ohne Projekt/Datum'; };
const leaveDialog = $('#leave-dialog');
let leaveTarget = null;
function askToLeaveEditor(view) {
  if (leaveDialog.open) return;                              // one dialog at a time: repeated clicks do not stack
  leaveTarget = view;
  const saved = AC01Workday.currentKey();
  $('#leave-text').textContent = `${saved ? `Der gespeicherte Tag ${project(saved.projectId).name} · ${dateText(saved.date)} wird bearbeitet.` : `Der Tag ${draftLabel()} ist noch nicht gespeichert.`} Mission Control und Stundenzettel zeigen nur den zuletzt gespeicherten Stand, Ihre Änderungen sind dort nicht enthalten. Wenn Sie jetzt wechseln, bleibt Ihr Entwurf im Baustellentag erhalten, ist aber weiterhin nicht gespeichert.`;
  leaveDialog.showModal();
  $('#leave-stay').focus();
}
$('#leave-stay').addEventListener('click', () => { leaveTarget = null; leaveDialog.close(); });
$('#leave-go').addEventListener('click', () => { const view = leaveTarget; leaveTarget = null; leaveDialog.close(); if (view) switchView(view, { confirmed: true }); });
leaveDialog.addEventListener('cancel', () => { leaveTarget = null; });   // Esc = stay
window.addEventListener('beforeunload', e => { if (editorDirty() || formDirty) { e.preventDefault(); e.returnValue = ''; } });

// Shown while the editor holds changes that are not in the saved day. relevant = the draft is the saved day this view works from.
function renderDraftNotices() {
  const dirty = editorDirty();
  document.body.toggleAttribute('data-draft-dirty', dirty);
  const back = '<button class="outline" type="button" data-view="ac01">Zum Entwurf im Baustellentag →</button>';
  const box = text => `<span class="draft-notice-text">${text}</span>${back}`;
  const dash = $('#draft-notice'), ts = $('#ts-draft-notice');
  dash.hidden = !dirty || state.view !== 'dashboard';
  if (!dash.hidden) dash.innerHTML = box(`<strong>Ungespeicherter Entwurf im Baustellentag (${esc(draftLabel())}).</strong> Mission Control und Stundenzettel zeigen nur gespeicherte Tage; der Entwurf ist darin nicht enthalten.`);
  ts.hidden = !dirty || state.view !== 'timesheet';
  if (!ts.hidden) {
    const src = TimesheetView.currentKey(), saved = AC01Workday.currentKey();
    const same = Boolean(src && saved && src.projectId === saved.projectId && src.date === saved.date);
    ts.innerHTML = box(same
      ? `<strong>Ungespeicherte Änderungen im Baustellentag.</strong> Dieser Stundenzettel verwendet den zuletzt gespeicherten Stand von ${esc(project(src.projectId).name)} · ${esc(dateText(src.date))}. Ihre aktuellen Änderungen sind darin nicht enthalten.`
      : saved
        ? `<strong>Ungespeicherte Änderungen im Baustellentag (${esc(draftLabel())}).</strong> Ein Stundenzettel verwendet den zuletzt gespeicherten Stand eines Tages; die Änderungen sind darin nicht enthalten.`
        : `<strong>Ungespeicherter Entwurf im Baustellentag (${esc(draftLabel())}).</strong> Ein Stundenzettel entsteht nur aus gespeicherten Tagen; der Entwurf ist darin nicht enthalten.`);
  }
}
document.addEventListener('ac01-dirtychange', renderDraftNotices);
document.addEventListener('ac01-dirtychange', renderEditorTitle);

// Breadcrumbs = WHERE am I: the canonical containment path of what is open (Mission Control > Projekt > Tag; Stundenzettel hangs under its Projekt).
// Derived from the open view and keys, never stored. The causal chain of one event (Planvorgang ... Fortdauer) is NOT a path: it lives on the
// event card in the planner ("Fallkette"). A Projekt is not a page of its own: its crumb leads to its group on Mission Control.
function crumbTrail() {
  const mc = { label: 'Mission Control', go: 'dashboard' };
  const proj = id => ({ label: project(id).name, go: `project:${id}` });
  const key = which => (typeof which !== 'undefined' && which.currentKey ? which.currentKey() : null);
  switch (state.view) {
    case 'field': return [mc, { label: 'Tagesbericht · bisheriges Formular' }];
    case 'ac01': { const k = key(window.AC01Workday); return k ? [mc, proj(k.projectId), { label: dateText(k.date) }] : [mc, { label: 'Baustellentag erfassen' }]; }
    case 'timesheet': { const k = key(window.TimesheetView); return k ? [mc, proj(k.projectId), { label: 'Stundenzettel' }] : [mc, { label: 'Stundenzettel' }]; }
    case 'planner': return [mc, { label: 'Planer' }];
    case 'detail': return [mc, { label: 'Ereignis (bisheriges Formular)' }];
    case 'draft': return [mc, { label: 'Dokumentvorschau' }];
    default: return [{ label: 'Mission Control' }];
  }
}
function renderCrumbs() {
  const trail = crumbTrail();
  $('#crumbs ol').innerHTML = trail.map((c, i) => i === trail.length - 1
    ? `<li aria-current="page"><strong id="top-title">${esc(c.label)}</strong></li>`
    : `<li><button class="crumb-link" type="button" data-crumb="${esc(c.go)}" title="${esc(c.label)}">${esc(c.label)}</button></li>`).join('');
}
document.addEventListener('click', async e => {
  const crumb = e.target.closest('[data-crumb]'); if (!crumb) return;
  const go = crumb.dataset.crumb;
  switchView('dashboard');                                   // asks first when the editor holds unsaved changes (then the view stays)
  if (state.view !== 'dashboard' || !go.startsWith('project:')) return;
  await renderDashboard();
  document.querySelector(`#wd-list .wd-project[data-project="${CSS.escape(go.slice(8))}"]`)?.scrollIntoView({ block: 'start' });
});
// A Stundenzettel can switch to another day without leaving its view: keep the path in step.
new MutationObserver(() => { if (state.view === 'timesheet') renderCrumbs(); }).observe(document.querySelector('#timesheet-view'), { childList: true, subtree: true });

function switchView(view, { confirmed = false } = {}) {
  if(state.view==='ac01' && view!=='ac01' && !confirmed && editorDirty()){ askToLeaveEditor(view); return; }
  if(state.view==='field' && view!=='field' && formDirty && !window.confirm('Ungespeicherte Änderungen verwerfen?')) return;
  if(view!=='dashboard'){ $('#save-confirmation').hidden=true; $('#open-notice').hidden=true; }
  state.view = view;
  document.querySelectorAll('.view').forEach(el => el.hidden = el.id !== `${view}-view`);
  document.querySelectorAll('[data-view]').forEach(el => { const on = el.dataset.view===view; el.classList.toggle('active',on); if(el.matches('.nav-item,.mobile-nav button')){ if(on) el.setAttribute('aria-current','page'); else el.removeAttribute('aria-current'); } });
  renderCrumbs();
  if(view==='dashboard') renderDashboard();
  if(view==='detail') renderDetail();
  if(view==='draft') renderDraft();
  if(view==='timesheet') TimesheetView.render();
  if(view==='planner') renderPlanner();
  renderDraftNotices();
  renderEditorTitle();
  const route =view === 'ac01' ? '#ac01' : window.location.href.split('#')[0];
  if (view === 'ac01' ? window.location.hash !== '#ac01' : Boolean(window.location.hash)) {
    window.history.replaceState(null, '', route);
  }
  window.scrollTo({top:0,behavior:'instant'});
  $('#main').focus({preventScroll:true});
}
// Planner (Pilot 02): generated bundle vendor/planner.bundle.js, mounted once in a shadow root so its styles and the shell's stay apart.
// It keeps its own plan while the page lives (memory only, fictional demo plan) and is not connected to the saved Baustellentage.
let plannerApi = null;
let plannerMount = null;
let plannerCaseKey = 'demo';
let clearArmed = 0;
// The planner offers examples (the original demo plan and the invented disruption case in three stages). Each example keeps its
// own state in this browser's local storage on this device (nothing is sent anywhere); "Beispiel zurücksetzen" and "Alle
// gespeicherten Pläne löschen" forget it. Without usable browser storage the plan lives in memory only and the note says so.
function mountPlannerCase(key, lead) {
  const PA = window.PlannerApp;
  if (plannerApi) plannerApi.destroy();
  const chosen = PA.planCase(key);
  plannerCaseKey = chosen.key;
  const opts = PA.plannerCaseOptions(chosen.key, { persist: true });
  plannerApi = PA.mountPlanner(plannerMount, Object.assign({ scheme: 'light' }, opts));
  for (const b of document.querySelectorAll('#planner-case button')) b.setAttribute('aria-pressed', String(b.dataset.case === chosen.key));
  const keeps = opts.persistent
    ? ' Dieses Beispiel merkt sich seinen Stand in diesem Browser; „Beispiel zurücksetzen“ stellt den Ausgangsstand wieder her. Bitte nur erfundene Daten eingeben.'
    : ' Der Browser-Speicher ist nicht verfügbar: nach dem Neuladen der Seite ist alles weg.';
  $('#planner-case-note').textContent = (lead ? lead + ' ' : '') + chosen.note + keeps;
}
function disarmClear() {
  clearArmed = 0;
  const b = $('#planner-clear'); b.textContent = 'Alle gespeicherten Pläne löschen'; b.classList.remove('armed');
}
function renderPlanner() {
  const host = $('#planner-host');
  if (!window.PlannerApp) { host.innerHTML = '<div class="panel"><div class="empty">Der Planer-Baustein fehlt (vendor/planner.bundle.js).</div></div>'; return; }
  if (plannerApi) return;
  const sr = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style'); style.textContent = window.PlannerApp.css;
  plannerMount = document.createElement('div');
  sr.append(style, plannerMount);
  const chooser = $('#planner-case');
  for (const c of window.PlannerApp.PLAN_CASES) {
    const b = document.createElement('button'); b.type = 'button'; b.dataset.case = c.key; b.textContent = c.label;
    b.onclick = () => { disarmClear(); if (b.getAttribute('aria-pressed') !== 'true') mountPlannerCase(c.key); };
    chooser.append(b);
  }
  $('#planner-reset').onclick = () => { disarmClear(); window.PlannerApp.resetPlanCase(plannerCaseKey); mountPlannerCase(plannerCaseKey, 'Beispiel zurückgesetzt.'); };
  // Two steps: the first click asks, the second one deletes; the question lapses after a few seconds or on any other choice.
  $('#planner-clear').onclick = () => {
    const b = $('#planner-clear');
    if (!clearArmed) {
      clearArmed = window.setTimeout(disarmClear, 6000);
      b.textContent = 'Wirklich alle löschen? Nochmal klicken'; b.classList.add('armed');
      return;
    }
    window.clearTimeout(clearArmed); disarmClear();
    const n = window.PlannerApp.clearSavedPlans();
    mountPlannerCase(plannerCaseKey, n === 1 ? '1 gespeicherter Plan gelöscht.' : `${n} gespeicherte Pläne gelöscht.`);
  };
  mountPlannerCase('demo');
}
// Title and lead of the editor follow the saved day it holds: "erfassen" for a new day, "bearbeiten" for a saved day.
function renderEditorTitle() {
  const key = typeof AC01Workday !== 'undefined' ? AC01Workday.currentKey() : null;
  const leadDefault = 'Mitarbeitende, Zeiten, Arbeiten und Ereignisse eines Tages eintragen und speichern.';
  $('#ac01-title').innerHTML = key ? 'Baustellentag <em>bearbeiten.</em>' : 'Baustellentag <em>erfassen.</em>';
  $('#ac01-lead').textContent = key ? `Gespeicherter Tag: ${project(key.projectId).name} · ${dateText(key.date)}. Änderungen gelten erst nach dem Speichern.` : leadDefault;
  $('#ac01-view').dataset.mode = key ? 'edit' : 'new';
  if (state.view === 'ac01') renderCrumbs();
}
document.addEventListener('click', e => {
  const btn = e.target.closest('[data-view]');
  if (!btn) return;
  // Only the "＋ Baustellentag erfassen" buttons outside the navigation start a new day; nav entries only switch.
  if (btn.hasAttribute('data-new-day') && typeof AC01Workday !== 'undefined') AC01Workday.startNew();
  switchView(btn.dataset.view);
});

const personnel = ['Martin Seidel','Jonas Krüger','Mika Özdemir','Deniz Yilmaz','Laura Beck','Emre Kaya'];
function crewRow(name='',hours=8, floor='',work='') {
  const row=document.createElement('div'); row.className='crew-row';
  row.innerHTML=`<select aria-label="Person"><option value="">Person wählen</option>${personnel.map(n=>`<option ${n===name?'selected':''}>${esc(n)}</option>`).join('')}</select><input class="hours" aria-label="Arbeitsstunden" type="number" min="0.5" max="24" step="0.5" value="${hours}"><button type="button" class="icon-btn remove-person" aria-label="Person entfernen">×</button><details class="crew-override"><summary>Anderer Ort oder andere Tätigkeit für diese Person</summary><div class="two-col"><label>Ort / Etage<input class="crew-floor" value="${esc(floor)}" placeholder="Wie oben"></label><label>Tätigkeit<input class="crew-work" value="${esc(work)}" placeholder="Wie oben"></label></div></details>`;
  if(floor||work) $('.crew-override',row).open=true;
  $('#crew-list').append(row);
}
$('#add-person').addEventListener('click',()=>{crewRow('',8);formDirty=true;});
$('#crew-list').addEventListener('click',e=>{if(e.target.closest('.remove-person')){e.target.closest('.crew-row').remove();formDirty=true;}});

let eventNo=0;
function addEvent(data={}) {
  eventNo++;
  const card=document.createElement('div'); card.className='event-editor'; card.dataset.eventId=data.id||uid();
  card.innerHTML=`<div class="event-editor-head"><strong>Besonderheit ${eventNo}</strong><button type="button" class="remove-event">Entfernen</button></div>
    <label class="event-type-field">Ereignistyp<select class="event-type"><option>Hindernis</option><option>Zusatzarbeit</option><option>Abweichung</option><option>Sonstiges</option></select></label>
    <label class="event-description-field">Was ist passiert?<textarea class="event-description" rows="2" placeholder="Kurz beschreiben, was anders war"></textarea></label>
    <div class="two-col"><div><label>Zusatzaufwand (h)<input class="event-hours" type="number" min="0" max="24" step="0.5" value="0"></label></div><div><label>Ort / Etage<input class="event-floor" placeholder="Wie oben" value="${esc(data.floor||'')}"></label></div></div><p class="field-hint">Nur Ereignishinweis; möglicherweise bereits in Personalstunden enthalten. Keine automatische Addition.</p>
    <label class="event-obstacle-field">Hindernis (falls vorhanden)<input class="event-obstacle" placeholder="z. B. Fläche nicht zugänglich" value="${esc(data.obstacle||'')}"></label>
    <label class="event-photos-field">Fotos (lokale Demoauswahl)<input class="event-photos" type="file" accept="image/*" multiple></label><div class="photo-names" aria-live="polite"></div>`;
  $('.event-type',card).value=data.type||'Hindernis'; $('.event-description',card).value=data.description||''; $('.event-hours',card).value=data.hours??0;
  card.dataset.photos=JSON.stringify(data.photos||[]);
  $('.photo-names',card).textContent=(data.photos||[]).join(', ');
  syncEventFields(card);
  $('#event-list').append(card); updateEventSummary(); if(!data.id) $('.event-description',card).focus();
}
function syncEventFields(card) {
  // The obstacle detail only helps describe a Hindernis. Keep a populated legacy value visible
  // so switching a type never makes entered data disappear from the editor.
  const obstacle=$('.event-obstacle',card);
  $('.event-obstacle-field',card).hidden=$('.event-type',card).value!=='Hindernis' && !obstacle.value.trim();
}
function updateEventSummary(){ const n=document.querySelectorAll('.event-editor').length; $('#event-summary').textContent=n ? `${n} Ereignis${n===1?'':'se'} erfasst` : 'Keine Ereignisse. Ganz normaler Tag.'; }
$('#add-event').addEventListener('click',()=>{addEvent();formDirty=true;});
$('#event-list').addEventListener('click',e=>{if(e.target.closest('.remove-event')){e.target.closest('.event-editor').remove();updateEventSummary();formDirty=true;}});
$('#event-list').addEventListener('change',e=>{if(e.target.matches('.event-type')) syncEventFields(e.target.closest('.event-editor'));});
$('#event-list').addEventListener('change',e=>{if(e.target.matches('.event-photos')){const card=e.target.closest('.event-editor');const files=[...e.target.files];card.dataset.photos=JSON.stringify(files.map(f=>f.name));$('.photo-names',card).textContent=files.map(f=>f.name).join(', ')||'';photoPreviews.set(card.dataset.eventId,files.map(f=>URL.createObjectURL(f)));}});
$('#project').innerHTML=projects.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join('');
$('#date').value=today; $('#date-display').textContent=dateText(today);
function reportKey(){return `${$('#project').value}|${$('#date').value}`;}
function resetForm(r){
  $('#floor').value=r?.floor||'2. OG · Ostflügel';
  $('#responsible').value=r?.responsible||'Martin Seidel · Vorarbeiter';
  $('#work').value=r?.work||'Trockenbauwände gestellt und Anschlüsse vorbereitet';
  $('#lv').value=r?.lv||'';
  $('#crew-list').replaceChildren();(r?.crew||defaultCrew).forEach(c=>crewRow(c.name,c.hours,c.floor||'',c.work||''));
  $('#event-list').replaceChildren();eventNo=0;(r?.events||[]).forEach(addEvent);updateEventSummary();
  $('#form-message').hidden=true;
  $('.optional').open=Boolean(r?.lv);
  formDirty=false;
}
function loadReportForSelection(){
  const next=reportKey();
  if(next===activeReportKey)return;
  if(formDirty && !window.confirm('Ungespeicherte Änderungen verwerfen und anderen Bericht öffnen?')){
    const [oldProject,oldDate]=activeReportKey.split('|');$('#project').value=oldProject;$('#date').value=oldDate;return;
  }
  activeReportKey=next;
  const r=state.reports.find(x=>`${x.project}|${x.date}`===next);
  const lastSameProject=state.reports.filter(x=>x.project===$('#project').value).sort((a,b)=>b.date.localeCompare(a.date))[0];
  resetForm(r || (lastSameProject?{...lastSameProject,events:[],lv:''}:null));
  $('#date-display').textContent=$('#date').value?dateText($('#date').value):'Datum wählen';
  if(r)message('Vorhandener Bericht geladen. Änderungen werden erst beim Speichern übernommen.');
  else message(lastSameProject?'Neuer Bericht: Mannschaft und Tätigkeit aus dem letzten Bericht dieses Projekts vorgeschlagen. Bitte prüfen. Ereignisse sind leer.':'Neuer Bericht mit Demo-Vorschlägen für einen normalen Tag. Bitte prüfen. Ereignisse sind leer.');
}
$('#project').addEventListener('change',loadReportForSelection);
$('#date').addEventListener('change',loadReportForSelection);
$('#report-form').addEventListener('input',e=>{if(!e.target.matches('#project,#date'))formDirty=true;});
$('#report-form').addEventListener('change',e=>{if(!e.target.matches('#project,#date'))formDirty=true;});
resetForm(null);

function message(text,error=false){const el=$('#form-message');el.hidden=false;el.textContent=text;el.classList.toggle('error',error);if(error)el.scrollIntoView({block:'center'});}
$('#report-form').addEventListener('submit',e=>{
  e.preventDefault();
  const crew=[...document.querySelectorAll('.crew-row')].map(row=>({name:$('select',row).value,hours:Number($('.hours',row).value),floor:$('.crew-floor',row).value.trim(),work:$('.crew-work',row).value.trim()}));
  const date=$('#date').value, work=$('#work').value.trim(), floor=$('#floor').value;
  if(!date || !work || !floor || !crew.length || crew.some(c=>!c.name || !(c.hours>0 && c.hours<=24))){message('Bitte Datum, Ort, Arbeit und für jede Person gültige Stunden angeben.',true);return;}
  if(new Set(crew.map(c=>c.name)).size!==crew.length){message('Jede Person bitte nur einmal eintragen.',true);return;}
  const cards=[...document.querySelectorAll('.event-editor')];
  if(cards.some(c=>!$('.event-description',c).value.trim() || Number($('.event-hours',c).value)<0 || Number($('.event-hours',c).value)>24)){message('Jedes Ereignis braucht eine Beschreibung und gültige Zusatzstunden.',true);return;}
  const events=cards.map(c=>({id:c.dataset.eventId,type:$('.event-type',c).value,description:$('.event-description',c).value.trim(),hours:Number($('.event-hours',c).value),floor:$('.event-floor',c).value.trim()||floor,obstacle:$('.event-obstacle',c).value.trim(),photos:JSON.parse(c.dataset.photos||'[]'),lv:$('#lv').value,title:$('.event-description',c).value.trim().slice(0,62)}));
  const key=$('#project').value; const prior=state.reports.find(r=>r.project===key&&r.date===date);
  const record={id:prior?.id||uid(),project:key,date,floor,responsible:$('#responsible').value,work,crew,lv:$('#lv').value,events};
  if(prior) state.reports.splice(state.reports.indexOf(prior),1,record); else state.reports.unshift(record);
  formDirty=false;
  $('#save-confirmation').hidden=false;
  $('#save-confirmation').textContent=`✓ Tagesbericht für ${project(key).name} am ${dateText(date)} gespeichert · ${crew.length} Personen · ${events.length} Ereignisse. Nur in diesem Browser bis zum Neuladen; nicht zentral gespeichert oder übertragen.`;
  switchView('dashboard');
});

/*
 * Mission Control shows the working days saved from "Baustellentag erfassen" (WorkdayStore, the single shared store).
 * Reports saved with the older Tagesbericht form still live in `state.reports` and are listed separately and labelled,
 * because they are a different record shape; nothing is copied or synchronized between the two.
 */
const hm = m => `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;
const reasonShort = {'Baubehinderung':'Behinderung','Nachtrag / Nachtragsposition':'Nachtrag'};
const empLabel = (e,i) => e.name.trim() || `Mitarbeiter ${i+1} (ohne Namen)`;
// Where saved days live right now, said in the footers; the clear button only exists while there is something stored in the browser.
// Two steps: the first click only asks (and names how many days); the question lapses by itself on Escape, on leaving the button
// and after 8 seconds, so a second click much later can never delete by accident. The result is announced and the focus moves on.
let wdClearArmed = false, wdClearTimer = 0, wdStoredCount = 0;
function wdDisarmClear(){
  wdClearArmed = false; clearTimeout(wdClearTimer);
  const button = $('#wd-clear'); if (!button) return;
  button.classList.remove('armed'); button.textContent = 'Gespeicherte Tage löschen';
  $('#wd-clear-hint').textContent = '';
}
function wdArmClear(){
  wdClearArmed = true;
  const button = $('#wd-clear');
  button.classList.add('armed');
  button.textContent = `Ja, ${wdStoredCount} ${wdStoredCount===1?'Tag':'Tage'} löschen`;
  $('#wd-clear-hint').textContent = 'Löscht alle gespeicherten Tage aus diesem Browser. Escape oder ein Klick woanders bricht ab.';
  clearTimeout(wdClearTimer); wdClearTimer = setTimeout(wdDisarmClear, 8000);
}
function renderStorageNotes(count){
  const persistent = WorkdayStore.store.isPersistent();
  const note = persistent ? 'Gespeichert nur in diesem Browser auf diesem Gerät, nichts wird gesendet' : 'Nur im Arbeitsspeicher: nach dem Neuladen der Seite ist alles weg';
  document.querySelectorAll('.storage-note').forEach(el => { el.textContent = note; });
  document.querySelectorAll('.storage-detail').forEach(el => { el.textContent = persistent ? '. Gespeicherte Tage bleiben nur in diesem Browser auf diesem Gerät erhalten; ungespeicherte Eingaben gehen beim Neuladen verloren.' : ' im Arbeitsspeicher; beim Neuladen gehen Eingaben verloren.'; });
  wdStoredCount = count;
  const button = $('#wd-clear'); if (!button) return;
  button.hidden = !(persistent && count > 0);
  wdDisarmClear();
}
document.addEventListener('click', async e => {
  const button = e.target.closest('#wd-clear');
  if (!button) { if (wdClearArmed) wdDisarmClear(); return; }   // a click anywhere else cancels the question
  if (!wdClearArmed) { wdArmClear(); return; }
  wdDisarmClear();
  await WorkdayStore.store.clear();
  $('#save-confirmation').hidden = true;
  await renderDashboard();
  const notice = $('#open-notice'); notice.hidden = false;
  notice.textContent = 'Alle gespeicherten Tage wurden aus diesem Browser gelöscht.';
  $('#dashboard-primary').focus();                         // the button that was pressed is gone: keep the keyboard focus on the page
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && wdClearArmed) wdDisarmClear(); });
document.addEventListener('focusout', e => { if (wdClearArmed && e.target.id === 'wd-clear') wdDisarmClear(); });
let dashboardToken = 0;
const openDetails = new Set();   // saved days whose details are expanded (view setting only, never stored)
let detailSeq = 0;
async function renderDashboard(){
  const token = ++dashboardToken;
  const days = await WorkdayStore.store.list();
  if(token !== dashboardToken) return;                       // a newer render superseded this one
  const rows = days.map(report => ({report, summary: AC01Demo.summarize({employees:report.employees, events:report.events})}));
  const sum = pick => rows.reduce((n,row)=>n+pick(row.summary),0);
  const unnamed = sum(x=>x.unnamed);
  $('#metrics').className = `metrics wd-metrics${rows.length ? '' : ' is-empty'}`;   // no row of zeros before the first saved day
  $('#metrics').innerHTML = [
    ['Erfasste Tage', rows.length, 'aus Baustellentag erfassen'],
    ['Mitarbeitende', `${sum(x=>x.named)}${unnamed?` <em>+${unnamed} ohne Namen</em>`:''}`, 'benannt, je Tag einmal'],
    ['Arbeitszeilen', sum(x=>x.assignmentCount), 'keine Stundensumme (Regel offen)'],
    ['Ereignisse', sum(x=>x.eventCount), 'ohne Zeitangabe'],
    ['Noch zu klären', sum(x=>x.missing.length), 'fehlende oder zu prüfende Angaben']
  ].map(([label,value,sub])=>`<div class="metric"><small>${label}</small><strong>${value}</strong><span>${sub}</span></div>`).join('');
  $('#wd-count').textContent = `${rows.length} ${rows.length===1?'Tag':'Tage'}`;
  renderStorageNotes(rows.length);
  // Compact card per saved day: figures, status and a short preview. Everything else is one click away: the day opens in AC-01.
  const top = (items,max) => items.length>max ? `${items.slice(0,max).join(', ')} <em>und ${items.length-max} weitere</em>` : items.join(', ');
  const count = values => { const m=new Map(); values.forEach(v=>m.set(v,(m.get(v)||0)+1)); return [...m].sort((a,b)=>b[1]-a[1]); };   // stable: ties keep first-seen order
  const card = ({report:r,summary:x}) => {
    const rowKey = `${r.projectId}|${r.date}`, detailId = `wd-detail-${++detailSeq}`, isOpen = openDetails.has(rowKey);
    const dayName = `${project(r.projectId).name}, ${dateText(r.date)}`;
    // Behinderung events of this day: one document-draft action each (position n = place of the event in the day)
    const bhEvents = r.events.map((v, i) => ({ v, i })).filter(({ v }) => v.reasons.includes('Baubehinderung'));
    const time = x.earliest===null && x.latest===null ? '–' : `${x.earliest===null?'?':hm(x.earliest)}–${x.latest===null?'?':hm(x.latest)}`;
    const reasons = Object.entries(x.reasonCounts).map(([k,n])=>`<span class="badge orange">${esc(reasonShort[k]||k)} ${n}</span>`).join('');
    const rowsAll = r.employees.flatMap(e=>e.assignments);
    const people = r.employees.map((e,i)=>esc(empLabel(e,i)));
    const work = count(rowsAll.map(a=>a.work.trim()||a.lv.trim()||'Tätigkeit fehlt')).map(([k,n])=>k==='Tätigkeit fehlt' ? `ohne Tätigkeit: ${n} ${n===1?'Zeile':'Zeilen'}` : `${esc(k)}: ${n} ${n===1?'Zeile':'Zeilen'}`);
    const places = [...new Set(rowsAll.flatMap(a=>a.locations))].map(esc);
    const filled = [['Geräte',r.extras.equipment],['Material',r.extras.material],['Kontakte / Anordnungen',r.extras.contacts]].filter(([,v])=>v.trim()).map(([k])=>k);
    const dd = (cls,label,value) => `<div><dt>${label}</dt><dd class="${cls}">${value}</dd></div>`;
    // Next action from known validation results only (no new state, no gate): open items -> editing is the primary action,
    // otherwise the Stundenzettel. A Stundenzettel stays available either way; its own hints show what is missing there.
    const open = x.missing.length, conflicts = x.conflicts.length;
    const clarify = open ? `<span class="badge orange">Noch zu klären: ${open} ${open===1?'Angabe':'Angaben'}</span>${conflicts?`<span class="badge red">${conflicts} ${conflicts===1?'Widerspruch':'Widersprüche'} prüfen</span>`:''}` : '<span class="badge">Keine fehlenden Angaben erkannt</span>';
    // "Angaben ergänzen" (the primary action of an incomplete day) keeps its words; the plain edit action is the pencil alone (name in aria-label / title).
    const edit = (primary) => open&&primary
      ? `<button class="primary wd-open" type="button" data-wd-open aria-label="Angaben ergänzen, ${esc(dayName)}"><i class="ic-wrap" data-icon="pencil"></i>Angaben ergänzen</button>`
      : `<button class="outline wd-open wd-icon-btn" type="button" data-wd-open aria-label="Baustellentag bearbeiten, ${esc(dayName)}" title="Baustellentag bearbeiten"><i class="ic-wrap" data-icon="pencil"></i></button>`;
    const sheet = (primary) => `<button class="${primary?'primary':'outline'} wd-timesheet" type="button" data-ts-open aria-label="Stundenzettel erstellen, ${esc(dayName)}"><i class="ic-wrap" data-icon="file-text"></i>Stundenzettel</button>`;
    const unnamedNote = x.unnamed ? ` <em>+${x.unnamed} ohne Namen</em>` : '';
    const copyBtn = `<button class="outline wd-copy" type="button" data-wd-copy aria-label="Baustellentag kopieren, ${esc(dayName)}" title="Als neuen Tag kopieren"><i class="ic-wrap" data-icon="copy"></i></button>`;
    const docBtns = bhEvents.map(({ v, i }) => { const label = bhEvents.length > 1 ? `Behinderungsanzeige-Entwurf öffnen, Ereignis ${i + 1}` : 'Behinderungsanzeige-Entwurf öffnen'; return `<button class="outline wd-doc wd-doc-icon" type="button" data-bh-open data-project="${esc(r.projectId)}" data-date="${esc(r.date)}" data-event="${esc(v.id)}" aria-label="${label}" title="${label}"><i class="ic-wrap" data-icon="triangle-alert"></i></button>`; }).join('');
    return `<tbody class="wd-day" role="rowgroup" data-project="${esc(r.projectId)}" data-date="${esc(r.date)}"><tr class="wd-main" role="row"><td class="wd-c-toggle" role="cell"><button class="wd-toggle" type="button" data-wd-toggle aria-expanded="${isOpen}" aria-controls="${detailId}" aria-label="Details zu ${esc(dayName)}"><i class="ic-wrap" data-icon="chevron-down"></i></button></td><th scope="row" role="rowheader" class="wd-c-date"><span class="wd-day-date">${esc(dateText(r.date))}</span><span class="wd-c-time"><span class="sr-only">Zeit: </span>${time}</span></th><td role="cell" class="wd-c-people wd-num" data-label="Mitarbeitende">${x.named}${unnamedNote}</td><td role="cell" class="wd-c-lines wd-num" data-label="Arbeitszeilen">${x.assignmentCount}</td><td role="cell" class="wd-c-events wd-num" data-label="Ereignisse">${x.eventCount}</td><td role="cell" class="wd-status" data-label="Status"><span class="badge" title="Gespeichert heißt nur: so erfasst. Nicht geprüft oder freigegeben.">Gespeichert · ungeprüft</span>${clarify}</td><td role="cell" class="wd-c-actions"><div class="wd-open-row">${open ? edit(true)+sheet(false) : sheet(true)+edit(false)}${copyBtn}${docBtns}</div></td></tr><tr class="wd-detail" role="row" id="${detailId}"${isOpen?'':' hidden'}><td role="cell" colspan="7"><div class="wd-detail-body">${reasons?`<div class="item-meta">${reasons}</div>`:''}<dl class="wd-preview">${dd('wd-preview-people','Mitarbeitende',people.length?top(people,5):'noch keine')}${dd('wd-preview-work','Tätigkeiten',work.length?top(work,4):'noch keine')}${dd('wd-preview-places','Orte / Bauteile',places.length?top(places,4):'keine')}${dd('wd-preview-extras','Weitere Tagesangaben',filled.length?filled.join(', ')+' erfasst':'keine')}</dl></div></td></tr></tbody>`;
  };
  // Stable partition: WorkdayStore order stays visible both between projects and inside each project.
  const projects = [];
  const projectRows = new Map();
  rows.forEach(row => {
    if (!projectRows.has(row.report.projectId)) { projectRows.set(row.report.projectId, []); projects.push(row.report.projectId); }
    projectRows.get(row.report.projectId).push(row);
  });
  $('#wd-list').innerHTML = projects.map(projectId => {
    const days = projectRows.get(projectId), first = days[0].report;
    const eventCount = days.reduce((n, row) => n + row.summary.eventCount, 0);
    return `<div class="wd-project" data-project="${esc(projectId)}" data-date="${esc(first.date)}"><div><h3>${esc(project(projectId).name)}</h3><span class="wd-project-sub">${days.length} ${days.length===1?'Tag':'Tage'} · ${eventCount} ${eventCount===1?'Ereignis':'Ereignisse'}</span></div></div><div class="wd-table-wrap"><table class="wd-table" role="table"><caption class="sr-only">Erfasste Tage: ${esc(project(projectId).name)}</caption><thead role="rowgroup"><tr role="row"><th scope="col" role="columnheader"><span class="sr-only">Details</span></th><th scope="col" role="columnheader">Tag und Zeit</th><th scope="col" role="columnheader" class="wd-num">Mitarbeitende</th><th scope="col" role="columnheader" class="wd-num">Arbeitszeilen</th><th scope="col" role="columnheader" class="wd-num">Ereignisse</th><th scope="col" role="columnheader">Status</th><th scope="col" role="columnheader">Aktionen</th></tr></thead>${days.map(card).join('')}</table></div>`;
  }).join('') || '<div class="empty">Noch kein Tag gespeichert. In „Baustellentag erfassen“ einen Tag eintragen und „Speichern → Mission Control“ wählen.<div class="empty-action"><button class="primary" type="button" data-view="ac01" data-new-day><i class="ic-wrap" data-icon="plus"></i>Baustellentag erfassen</button></div></div>';
  const evAll = rows.flatMap(({report:r}) => r.events.map(v=>({v,r})));
  $('#wd-event-count').textContent = `${evAll.length} ${evAll.length===1?'Ereignis':'Ereignisse'}`;
  $('#wd-events').innerHTML = evAll.map(({v,r})=>`<div class="wd-event-row"><button class="list-item wd-event" type="button" data-wd-open data-project="${esc(r.projectId)}" data-date="${esc(r.date)}"><div class="item-top"><strong>${esc(v.description.trim().slice(0,62)||'Beschreibung fehlt')}</strong><span class="item-arrow" aria-hidden="true">↗</span></div><div class="item-sub">${esc(project(r.projectId).name)} · ${esc(dateText(r.date))} · Ort: ${esc(v.location.trim()||'fehlt')}</div><div class="item-meta">${v.reasons.map(k=>`<span class="badge ${k==='Baubehinderung'?'red':'orange'}">${esc(reasonShort[k]||(globalThis.DisruptionCatalog?globalThis.DisruptionCatalog.label(k):k))}</span>`).join('')||'<span class="badge">Grund fehlt</span>'}<span class="badge">Gespeichert · ungeprüft</span></div></button>${v.reasons.includes('Baubehinderung')?`<div class="wd-doc-row"><button class="outline wd-doc" type="button" title="Behinderungsanzeige als Entwurf" aria-label="Behinderungsanzeige als Entwurf" data-bh-open data-project="${esc(r.projectId)}" data-date="${esc(r.date)}" data-event="${esc(v.id)}"><i class="ic-wrap" data-icon="triangle-alert"></i>Behinderungsanzeige-Entwurf</button></div>`:''}</div>`).join('') || '<div class="empty">Keine besonderen Ereignisse erfasst.</div>';
  // Legacy form reports (never the seed examples)
  const legacy=state.reports.filter(r=>!r.seed).sort((a,b)=>b.date.localeCompare(a.date)); const events=allEvents().filter(e=>!e.report.seed);
  $('#legacy-panel').hidden = !legacy.length;
  $('#report-count').textContent=`${legacy.length} Berichte`;$('#event-count').textContent=`${events.length} Ereignisse`;
  $('#reports-list').innerHTML=legacy.map(r=>`<div class="list-item"><div class="item-top"><strong>${esc(project(r.project).name)}</strong><span class="badge">Erfasst</span></div><div class="item-sub">${esc(dateText(r.date))} · ${esc(r.floor)} · ${esc(r.responsible.split(' · ')[0])}</div><div class="item-meta"><span class="badge">${r.crew.length} Personen</span><span class="badge">${hourText(r.crew.reduce((n,c)=>n+c.hours,0))} Personalzeit</span>${r.events.length?`<span class="badge orange">${r.events.length} Ereignis${r.events.length===1?'':'se'}</span>`:''}</div></div>`).join('');
  $('#events-list').innerHTML=events.map(e=>`<button class="list-item event-open" type="button" data-id="${esc(e.id)}"><div class="item-top"><strong>${esc(e.title)}</strong><span class="item-arrow" aria-hidden="true">↗</span></div><div class="item-sub">${esc(project(e.report.project).name)} · ${esc(dateText(e.report.date))}</div><div class="item-meta"><span class="badge ${e.type==='Hindernis'?'red':'orange'}">${esc(e.type)}</span><span class="badge">Erfasst · ungeprüft</span>${e.photos.length?`<span class="badge">${e.photos.length} Foto${e.photos.length===1?'':'s'}</span>`:''}</div></button>`).join('')||'<div class="empty">Keine Ereignisse.</div>';
}

// Called by AC-01 after a successful save: confirmation first, then Mission Control shows the stored record.
function showSavedWorkday(report, summary, replaced){
  $('#open-notice').hidden=true;
  $('#save-confirmation').hidden=false;
  const MEMNOTE=WorkdayStore.store.isPersistent() ? ' Nur in diesem Browser gespeichert; nichts wird gesendet.' : ' Nur im Arbeitsspeicher; nach dem Neuladen der Seite weg.';
  const text=`✓ Baustellentag für ${project(report.projectId).name} am ${dateText(report.date)} ${replaced?'aktualisiert':'gespeichert'} · ${summary.named} Mitarbeitende · ${summary.assignmentCount} Arbeitszeilen · ${summary.eventCount} ${summary.eventCount===1?'Ereignis':'Ereignisse'}. ${summary.missing.length?`Noch zu klären: ${summary.missing.length}.`:`Mögliche nächste Schritte stehen an der Tageskarte: Stundenzettel${report.events.some(v => v.reasons.includes('Baubehinderung')) ? ' · Behinderungsanzeige-Entwurf' : ''}.`}${MEMNOTE}`;
  const bh = report.events.map((v,i)=>({v,i})).filter(x=>x.v.reasons.includes('Baubehinderung'));
  const at = `data-project="${esc(report.projectId)}" data-date="${esc(report.date)}"`;
  $('#save-confirmation').innerHTML = `<span class="sc-text">${esc(text.replace(MEMNOTE,''))}<span class="sc-mem">${esc(MEMNOTE)}</span></span><span class="sc-actions" ${at}><button class="outline" type="button" data-wd-open><i class="ic-wrap" data-icon="pencil"></i>Weiter bearbeiten</button><button class="outline" type="button" data-ts-open><i class="ic-wrap" data-icon="file-text"></i><span class="sc-long">Stundenzettel für dieses Projekt</span><span class="sc-short">Stundenzettel</span></button>${bh.map(x=>`<button class="outline" type="button" data-bh-open ${at} data-event="${esc(x.v.id)}"><i class="ic-wrap" data-icon="triangle-alert"></i><span class="sc-long">Behinderungsanzeige-Entwurf</span><span class="sc-short">Behinderung</span>${bh.length>1?` (Ereignis ${x.i+1})`:''}</button>`).join('')}</span>`;
  switchView('dashboard');
}
// Reopening replaces the day in AC-01; unsaved changes there need a second, explicit click.
// A copy starts on today's date, or the next day that is still free for this project (the key is project + date).
async function copyTargetDate(projectId){
  const taken = new Set((await WorkdayStore.store.list()).filter(day => day.projectId === projectId).map(day => day.date));
  const iso = x => `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`;
  const d = new Date(); d.setHours(12,0,0,0);
  while (taken.has(iso(d))) d.setDate(d.getDate()+1);
  return iso(d);
}
async function openWorkday(key, force=false, copy=false){
  const report = await WorkdayStore.store.load(key); if(!report) return;
  const notice=$('#open-notice');
  const label = `${project(key.projectId).name} · ${dateText(key.date)}`;
  if(!force && AC01Workday.isDirty()){
    notice.hidden=false;
    notice.innerHTML=`In „Baustellentag erfassen“ gibt es ungespeicherte Änderungen. Beim ${copy?'Kopieren':'Bearbeiten'} von ${esc(project(key.projectId).name)} (${esc(dateText(key.date))}) gehen sie verloren. <button class="outline" type="button" data-wd-force ${copy?'data-copy="1" ':''}data-project="${esc(key.projectId)}" data-date="${esc(key.date)}">Verwerfen und ${copy?'kopieren':'bearbeiten'}</button>`;
    notice.scrollIntoView({block:'nearest'});
    return;
  }
  notice.hidden=true;
  if(copy) AC01Workday.openCopy(report, await copyTargetDate(key.projectId), label);
  else AC01Workday.open(report);
  switchView('ac01');
}
document.addEventListener('click', e => {
  const toggle = e.target.closest('[data-wd-toggle]');
  if (toggle) {
    const body = toggle.closest('tbody.wd-day'), row = body.querySelector('.wd-detail'), key = `${body.dataset.project}|${body.dataset.date}`;
    const expand = row.hidden;
    row.hidden = !expand; toggle.setAttribute('aria-expanded', String(expand));
    expand ? openDetails.add(key) : openDetails.delete(key);
    return;
  }
  const open=e.target.closest('[data-wd-open],[data-wd-copy]'), force=e.target.closest('[data-wd-force]');
  const src=open||force; if(!src) return;
  const holder=src.closest('[data-project]')||src;
  openWorkday({projectId:holder.dataset.project,date:holder.dataset.date}, Boolean(force), src.hasAttribute('data-wd-copy')||src.dataset.copy==='1');
});
$('#events-list').addEventListener('click',e=>{const button=e.target.closest('.event-open');if(button){state.selectedEvent=button.dataset.id;state.draftRequested=false;switchView('detail');}});
function selected(){return allEvents().find(e=>e.id===state.selectedEvent)||allEvents()[0];}
function renderDetail(){
  const e=selected(); if(!e){switchView('dashboard');return;} const r=e.report;
  const previews=photoPreviews.get(e.id)||[];
  $('#detail-content').innerHTML=`<article class="detail-card"><span class="eyebrow">EREIGNIS · ${esc(dateText(r.date))}</span><h1 id="detail-title">${esc(e.title)}</h1><span class="badge ${e.type==='Hindernis'?'red':'orange'}">${esc(e.type)}</span> <span class="badge">Erfasst · ungeprüft</span><p class="lead" style="margin-top:22px">${esc(e.description)}</p><div class="detail-meta"><div><small>BAUPROJEKT</small><strong>${esc(project(r.project).name)}</strong></div><div><small>ORT</small><strong>${esc(e.floor)}</strong></div><div><small>VERANTWORTLICH</small><strong>${esc(r.responsible)}</strong></div><div><small>ZUSATZAUFWAND</small><strong>${hourText(e.hours)} · nicht zugeordnet</strong></div></div><p class="notice">Personalstunden und Ereignisaufwand können sich überschneiden. Keine Addition oder Abrechnung ohne Zuordnung und Prüfung.</p><h3>Beobachtung &amp; Belege</h3><div class="evidence-list"><div class="evidence-item">Hindernis: ${esc(e.obstacle||'Keines gesondert beschrieben')}</div><div class="evidence-item">Fotos: ${esc(e.photos.join(', ')||'Keine Fotos ausgewählt')}</div><div class="evidence-item">Mögliche LV-Referenz: ${esc(e.lv||r.lv||'Keine')} · unverifiziert</div></div>${previews.length?`<div class="photo-gallery">${previews.map((src,i)=>`<img src="${esc(src)}" alt="Lokale Fotovorschau ${i+1}">`).join('')}</div>`:''}</article>`;
  $('#detail-aside').innerHTML=`<div class="side-card"><span class="eyebrow">NÄCHSTER SCHRITT</span><h3>Entwurf anfordern</h3><p>Die Bauleitung entscheidet, welches Dokument aus diesem Ereignis vorbereitet werden soll.</p><label for="draft-type">Dokumentart</label><select id="draft-type"><option>Stundenzettel</option><option>Behinderungsanzeige</option><option>Anderer Dokumententwurf</option></select><button id="request-draft" type="button" class="primary">Vorschau erstellen →</button><div class="notice">Nur Entwurf zur Prüfung. Kein automatischer Versand und keine Aussage über Ansprüche.</div></div>`;
  $('#draft-type').value=state.draftType;
  $('#request-draft').addEventListener('click',()=>{state.draftType=$('#draft-type').value;state.draftEvent=e.id;state.draftRequested=true;switchView('draft');});
}
function renderDraft(){
  const e=allEvents().find(x=>x.id===state.draftEvent)||selected(); if(!e){switchView('dashboard');return;} const r=e.report;
  const isHours=state.draftType==='Stundenzettel';
  const gaps=isHours ? ['Betroffene Person(en) und tatsächliche Zeitspanne dem Ereignis zuordnen','Prüfen, ob der Zusatzaufwand bereits in den normalen Personalstunden enthalten ist','Beginn, Ende, Pause, Vorlage und Freigabe klären'] : state.draftType==='Behinderungsanzeige' ? ['Vertragsgrundlage und Fristen prüfen','Adressat und Zugangskanal klären','Sachverhalt und Beleglage fachlich prüfen'] : ['Dokumentart und Pflichtangaben festlegen','Adressat und Freigabe klären'];
  const hoursContent=isHours?`<div class="notice"><strong>Kein fertiger Stundenzettel:</strong> ${hourText(e.hours)} Ereignisaufwand sind keiner Person oder Zeitspanne zugeordnet und können in den Personalstunden enthalten sein. Eine Zeitposition wird deshalb nicht erzeugt.</div><div class="content-block"><strong>Normal erfasste Personenstunden · nur Kontext</strong>${r.crew.map(c=>`<p class="draft-crew">${esc(c.name)} · ${hourText(c.hours)} · ${esc(c.floor||r.floor)} · ${esc(c.work||r.work)}</p>`).join('')}</div>`:'';
  $('#draft-content').innerHTML=`<div class="draft-layout"><article class="draft-paper"><span class="stamp">${isHours?'PRÜFNOTIZ · KEIN STUNDENZETTEL':'ENTWURF · NICHT FREIGEGEBEN'}</span><span class="eyebrow" style="margin-top:28px">MISSION CONTROL / DOKUMENTVORSCHAU</span><h1 id="draft-title">${isHours?'Stundenzettel · Prüfnotiz':esc(state.draftType)}</h1><p class="lead">Vorbereitung auf Anforderung der Bauleitung. Erfasst, ungeprüft und nur mit synthetischen Daten.</p><div class="rule"></div><dl><dt>Bauprojekt</dt><dd>${esc(project(r.project).name)}</dd><dt>Datum</dt><dd>${esc(dateText(r.date))}</dd><dt>Ort</dt><dd>${esc(e.floor)}</dd><dt>Verantwortlich</dt><dd>${esc(r.responsible)}</dd><dt>Quellereignis</dt><dd>${esc(e.title)}</dd><dt>Ereignisaufwand</dt><dd>${hourText(e.hours)} · nicht zugeordnet, nicht addiert</dd><dt>LV-Hinweis</dt><dd>${esc(e.lv||r.lv||'Kein Bezug')} · unverifiziert</dd></dl><div class="content-block"><strong>Erfasster Sachverhalt</strong><p style="margin:9px 0 0">${esc(e.description)}</p>${e.obstacle?`<p style="margin:9px 0 0"><strong>Hindernis:</strong> ${esc(e.obstacle)}</p>`:''}</div>${hoursContent}<p class="field-hint">Belege in dieser Demo: ${esc(e.photos.join(', ')||'keine Foto-Dateinamen')}. Keine Datei wurde verarbeitet oder versandt.</p></article><aside class="side-card draft-side"><span class="eyebrow">VOR WEITERER NUTZUNG</span><h3>Prüfung erforderlich</h3><ol>${gaps.map(x=>`<li>${esc(x)}</li>`).join('')}</ol><div class="notice">Diese Vorschau ist kein freigegebenes Geschäftsdokument. Sie wird beim Neuladen verworfen.</div><button class="outline" type="button" data-view="detail" style="margin-top:18px;width:100%">Ereignis ansehen</button></aside></div>`;
}
document.addEventListener('DOMContentLoaded', () => { renderCrumbs(); renderDashboard(); });
if (window.location.hash === '#ac01' || window.location.hash.startsWith('#ac01-')) switchView('ac01');
