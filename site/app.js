/* Local, synthetic UI state only. No network calls or persistence. */
const projects = [
  { id: 'hafen', name: 'Hafenbogen · Bauteil B', place: 'Hamburg · HafenCity' },
  { id: 'allee', name: 'Allee 17 · Innenausbau', place: 'Hamburg · Altona' },
  { id: 'quartier', name: 'Quartier West · Haus 3', place: 'Norderstedt' }
];
const today = '2026-11-07';
const seed = [
  { id: 'r1', project: 'allee', date: today, floor: '1. OG · Westflügel', responsible: 'Deniz Yilmaz · Vertretung', work: 'Trockenbauwände gestellt, Türöffnungen vorbereitet', crew: [{name:'Deniz Yilmaz',hours:8},{name:'Jonas Krüger',hours:8},{name:'Mika Özdemir',hours:7.5}], lv:'', events:[{id:'e1',type:'Hindernis',title:'Material blockiert Arbeitsbereich',description:'Fremdmaterial steht im Flur vor Achse 4. Arbeiten an der Trockenbauwand dort unterbrochen.',hours:2,floor:'1. OG · Westflügel',photos:['Flur_Achse4.jpg'],obstacle:'Zugang zur Arbeitsfläche blockiert',lv:''}] },
  { id: 'r2', project: 'quartier', date: '2026-11-06', floor: 'EG · Eingangsbereich', responsible: 'Laura Beck · Vertretung', work: 'Unterkonstruktion für Deckenbekleidung montiert', crew:[{name:'Laura Beck',hours:8},{name:'Emre Kaya',hours:8}], lv:'', events:[{id:'e2',type:'Zusatzarbeit',title:'Zusätzliche Abkofferung dokumentiert',description:'Zusätzliche Abkofferung an der Installationszone aufgenommen; Umfang vor Ausführung zu klären.',hours:1.5,floor:'EG · Eingangsbereich',photos:[],obstacle:'',lv:''}] }
];
const state = { reports: structuredClone(seed), selectedEvent:'e1', draftType:'Stundenzettel', draftRequested:false, draftEvent:null, view:'field' };
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

function switchView(view) {
  if(state.view==='field' && view!=='field' && formDirty && !window.confirm('Ungespeicherte Änderungen verwerfen?')) return;
  if(view!=='dashboard') $('#save-confirmation').hidden=true;
  state.view = view;
  document.querySelectorAll('.view').forEach(el => el.hidden = el.id !== `${view}-view`);
  document.querySelectorAll('[data-view]').forEach(el => el.classList.toggle('active',el.dataset.view===view));
  $('#top-eyebrow').textContent = ['field', 'ac01'].includes(view) ? 'BAUSTELLE · LOKALE DEMO' : 'MISSION CONTROL · LOKALE DEMO';
  $('#top-title').textContent = ({field:'Tagesbericht',ac01:'Baustellentag erfassen',dashboard:'Mission Control',detail:'Ereignis',draft:'Dokumententwurf'})[view];
  if(view==='dashboard') renderDashboard();
  if(view==='detail') renderDetail();
  if(view==='draft') renderDraft();
  const route = view === 'ac01' ? '#ac01' : window.location.href.split('#')[0];
  if (view === 'ac01' ? window.location.hash !== '#ac01' : Boolean(window.location.hash)) {
    window.history.replaceState(null, '', route);
  }
  window.scrollTo({top:0,behavior:'instant'});
  $('#main').focus({preventScroll:true});
}
document.addEventListener('click', e => { const btn=e.target.closest('[data-view]'); if(btn) switchView(btn.dataset.view); });

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
    <label>Ereignistyp<select class="event-type"><option>Hindernis</option><option>Zusatzarbeit</option><option>Abweichung</option><option>Sonstiges</option></select></label>
    <label>Was ist passiert?<textarea class="event-description" rows="2" placeholder="Kurz beschreiben, was anders war"></textarea></label>
    <div class="two-col"><div><label>Zusatzaufwand (h)<input class="event-hours" type="number" min="0" max="24" step="0.5" value="0"></label></div><div><label>Ort / Etage<input class="event-floor" placeholder="Wie oben" value="${esc(data.floor||'')}"></label></div></div><p class="field-hint">Nur Ereignishinweis; möglicherweise bereits in Personalstunden enthalten. Keine automatische Addition.</p>
    <label>Hindernis (falls vorhanden)<input class="event-obstacle" placeholder="z. B. Fläche nicht zugänglich" value="${esc(data.obstacle||'')}"></label>
    <label>Fotos (lokale Demoauswahl)<input class="event-photos" type="file" accept="image/*" multiple></label><div class="photo-names" aria-live="polite"></div>`;
  $('.event-type',card).value=data.type||'Hindernis'; $('.event-description',card).value=data.description||''; $('.event-hours',card).value=data.hours??0;
  card.dataset.photos=JSON.stringify(data.photos||[]);
  $('.photo-names',card).textContent=(data.photos||[]).join(', ');
  $('#event-list').append(card); updateEventSummary(); if(!data.id) $('.event-description',card).focus();
}
function updateEventSummary(){ const n=document.querySelectorAll('.event-editor').length; $('#event-summary').textContent=n ? `${n} Ereignis${n===1?'':'se'} erfasst` : 'Keine Ereignisse. Ganz normaler Tag.'; }
$('#add-event').addEventListener('click',()=>{addEvent();formDirty=true;});
$('#event-list').addEventListener('click',e=>{if(e.target.closest('.remove-event')){e.target.closest('.event-editor').remove();updateEventSummary();formDirty=true;}});
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

function renderDashboard(){
  const reports=[...state.reports].sort((a,b)=>b.date.localeCompare(a.date)); const events=allEvents();
  $('#metrics').innerHTML=`<div class="metric"><small>Tagesberichte</small><strong>${reports.length}</strong><span>im Überblick</span></div><div class="metric"><small>Im Team erfasst</small><strong>${reports.reduce((n,r)=>n+r.crew.length,0)}</strong><span>Personeneinträge</span></div><div class="metric"><small>Besonderheiten</small><strong>${events.length}</strong><span>zu prüfen</span></div>`;
  $('#report-count').textContent=`${reports.length} Berichte`;$('#event-count').textContent=`${events.length} Ereignisse`;
  $('#reports-list').innerHTML=reports.map(r=>`<div class="list-item"><div class="item-top"><strong>${esc(project(r.project).name)}</strong><span class="badge">Erfasst</span></div><div class="item-sub">${esc(dateText(r.date))} · ${esc(r.floor)} · ${esc(r.responsible.split(' · ')[0])}</div><div class="item-meta"><span class="badge">${r.crew.length} Personen</span><span class="badge">${hourText(r.crew.reduce((n,c)=>n+c.hours,0))} Personalzeit</span>${r.events.length?`<span class="badge orange">${r.events.length} Ereignis${r.events.length===1?'':'se'}</span>`:''}</div></div>`).join('')||'<div class="empty">Noch keine Berichte.</div>';
  $('#events-list').innerHTML=events.map(e=>`<button class="list-item event-open" type="button" data-id="${esc(e.id)}"><div class="item-top"><strong>${esc(e.title)}</strong><span class="item-arrow" aria-hidden="true">↗</span></div><div class="item-sub">${esc(project(e.report.project).name)} · ${esc(dateText(e.report.date))}</div><div class="item-meta"><span class="badge ${e.type==='Hindernis'?'red':'orange'}">${esc(e.type)}</span><span class="badge">Erfasst · ungeprüft</span>${e.photos.length?`<span class="badge">${e.photos.length} Foto${e.photos.length===1?'':'s'}</span>`:''}</div></button>`).join('')||'<div class="empty">Keine besonderen Ereignisse. Alles im Regelbetrieb.</div>';
}
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
renderDashboard();
if (window.location.hash === '#ac01' || window.location.hash.startsWith('#ac01-')) switchView('ac01');
