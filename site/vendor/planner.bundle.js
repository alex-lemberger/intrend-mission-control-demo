/* GENERATED FILE - do not edit. Source: mission-control-spfx, content sha256:cd411f9566f552ea, preview/planner-app.js, src/planner/plan.js, src/planner/demo-plan.js, src/core/ids.js.
 * Rebuild: node mission-control-spfx/scripts/build-classic-bundle.mjs --entry planner <this file>
 * Synthetic prototype. Templates, hours and checks are drafts, not approved rules. */
(function () {
  'use strict';
  const defs = {
"preview/planner-app.js": function (require, exports, module) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mountPlanner = mountPlanner;
const plan_ts_1 = require("../src/planner/plan.js");
const demo_plan_ts_1 = require("../src/planner/demo-plan.js");
function mountPlanner(root, options = {}) {
    root.classList.add('pl-app');
    root.classList.toggle('standalone', Boolean(options.heading));
    root.dataset.scheme = options.scheme ?? 'light';
    let state = (0, demo_plan_ts_1.buildDemoPlan)();
    let formFor = null;
    let error = '';
    let depError = '';
    let depOpen = false;
    let observer = null;
    const AXIS_FROM = (0, plan_ts_1.mondayOf)('2026-11-16');
    const AXIS_TO = (0, plan_ts_1.addDays)(AXIS_FROM, 5 * 7 - 1);
    const SVG = 'http://www.w3.org/2000/svg';
    const TYPE_LABEL = { EA: 'Ende → Anfang', AA: 'Anfang → Anfang', EE: 'Ende → Ende', AE: 'Anfang → Ende' };
    const el = (tag, cls = '', text = '') => {
        const e = document.createElement(tag);
        if (cls)
            e.className = cls;
        if (text)
            e.textContent = text;
        return e;
    };
    const svg = (tag, attrs = {}) => {
        const e = document.createElementNS(SVG, tag);
        for (const [k, v] of Object.entries(attrs))
            e.setAttribute(k, v);
        return e;
    };
    const fmt = (d) => `${d.slice(8)}.${d.slice(5, 7)}.${d.slice(0, 4)}`;
    const short = (d) => `${d.slice(8)}.${d.slice(5, 7)}.`;
    const key = (id) => state.tasks.find(t => t.id === id)?.planKey ?? '?';
    const depText = (d) => `${key(d.predecessorId)} → ${key(d.successorId)}`;
    const plural = (n) => `${n} ${n === 1 ? 'Tag' : 'Tage'}`;
    const place = (bar, b, row) => {
        bar.style.gridColumn = `${b.col + 2} / span ${b.span}`;
        bar.style.gridRow = String(row);
        if (b.clippedStart)
            bar.classList.add('clip-s');
        if (b.clippedEnd)
            bar.classList.add('clip-e');
    };
    function drawGrid(axis) {
        const grid = el('div', 'pl-grid');
        grid.style.setProperty('--n', String(axis.length));
        let row = 3;
        const cellRow = (r, fill, kind = '', taskId = '') => {
            const lab = el('div', `pl-lab${kind ? ' ' + kind : ''}`);
            lab.style.gridRow = String(r);
            lab.style.gridColumn = '1';
            if (taskId)
                lab.dataset.row = taskId;
            fill(lab);
            grid.append(lab);
            for (const [i, d] of axis.entries()) {
                const c = el('div', `pl-cell${d.weekend ? ' we' : ''}${d.today ? ' today' : ''}${kind === 'sec' ? ' secbg' : ''}`);
                c.style.gridRow = String(r);
                c.style.gridColumn = String(i + 2);
                grid.append(c);
            }
        };
        const corner = el('div', 'pl-corner', 'Leistung / Ressource');
        corner.style.gridRow = '1 / span 2';
        grid.append(corner);
        let i = 0;
        while (i < axis.length) {
            let j = i;
            while (j + 1 < axis.length && axis[j + 1].kw === axis[i].kw)
                j++;
            const k = el('div', 'pl-kw', `KW ${axis[i].kw}`);
            if (j - i >= 6)
                k.append(el('span', 'rng', `${short(axis[i].date)}–${short(axis[j].date)}`));
            k.style.gridRow = '1';
            k.style.gridColumn = `${i + 2} / span ${j - i + 1}`;
            grid.append(k);
            i = j + 1;
        }
        for (const [n, d] of axis.entries()) {
            const dd = el('div', `pl-dd${d.weekend ? ' we' : ''}${d.today ? ' today' : ''}`, `${['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'][d.weekday]}\n${+d.date.slice(8)}`);
            dd.style.gridRow = '2';
            dd.style.gridColumn = String(n + 2);
            if (d.today)
                dd.title = 'Heute';
            grid.append(dd);
        }
        cellRow(row++, l => { l.textContent = 'Leistungen'; }, 'sec');
        for (const t of state.tasks) {
            const r = row++;
            cellRow(r, l => {
                const b = el('button', 'taskbtn', `${t.planKey} · ${t.title}`);
                b.type = 'button';
                b.title = 'Ereignis aus diesem Planvorgang erzeugen';
                b.onclick = () => { formFor = t.id; error = ''; render(); };
                const nm = el('span', 'nm');
                nm.append(b);
                l.append(nm, el('small', '', `${t.level} · ${t.area} · ${t.lvRef}`), el('small', '', `Soll ${short(t.sollStart)}–${short(t.sollEnd)}${t.istStart ? ` · Fortschritt ${t.progress} %` : ''}`));
            }, 'task', t.id);
            const soll = (0, plan_ts_1.barOnAxis)(axis, t.sollStart, t.sollEnd);
            if (soll) {
                const b = el('div', 'bar soll');
                b.dataset.soll = t.id;
                b.dataset.clipS = String(soll.clippedStart);
                b.dataset.clipE = String(soll.clippedEnd);
                b.title = `Soll ${fmt(t.sollStart)} – ${fmt(t.sollEnd)}`;
                place(b, soll, r);
                grid.append(b);
            }
            if (t.istStart) {
                const ist = (0, plan_ts_1.barOnAxis)(axis, t.istStart, t.istEnd || demo_plan_ts_1.DEMO_TODAY);
                if (ist) {
                    const b = el('div', 'bar ist');
                    b.title = `Ist ab ${fmt(t.istStart)}${t.istEnd ? ` bis ${fmt(t.istEnd)}` : ' (läuft)'}`;
                    place(b, ist, r);
                    grid.append(b);
                }
            }
        }
        cellRow(row++, l => { l.textContent = 'Kolonnen und Geräte'; }, 'sec');
        const conflicts = (0, plan_ts_1.findConflicts)(state);
        for (const r of state.resources) {
            const rr = row++;
            cellRow(rr, l => { l.append(el('span', 'nm', r.label), el('small', '', r.type === 'geraet' ? 'Gerät' : `Kolonne · ${r.headcount} Pers.`)); });
            for (const a of state.assignments.filter(x => x.resourceId === r.id)) {
                const bar = (0, plan_ts_1.barOnAxis)(axis, a.from, a.to);
                if (!bar)
                    continue;
                const t = state.tasks.find(x => x.id === a.taskId);
                const b = el('div', `bar res${r.type === 'geraet' ? ' geraet' : ''}`, t.planKey);
                b.title = `${t.planKey} ${t.title}: ${fmt(a.from)} – ${fmt(a.to)}`;
                place(b, bar, rr);
                grid.append(b);
            }
            for (const c of conflicts.filter(x => x.resourceId === r.id)) {
                const bar = (0, plan_ts_1.barOnAxis)(axis, c.from, c.to);
                if (!bar)
                    continue;
                const b = el('div', 'bar res doppelt', bar.span >= 3 ? 'doppelt' : '');
                b.title = `Doppelt belegt: ${fmt(c.from)} – ${fmt(c.to)}`;
                b.setAttribute('role', 'img');
                b.setAttribute('aria-label', `Doppelt belegt ${fmt(c.from)} bis ${fmt(c.to)}`);
                place(b, bar, rr);
                grid.append(b);
            }
        }
        cellRow(row++, l => { l.textContent = 'Ereignisse / Störungen'; }, 'sec');
        for (const e of state.events) {
            const rr = row++;
            cellRow(rr, l => { l.append(el('span', 'nm', e.title), el('small', '', `zu ${e.snapshot.planKey} · ab ${short(e.from)}${e.to ? ` bis ${short(e.to)}` : ' · dauert an'}`)); });
            const bar = (0, plan_ts_1.barOnAxis)(axis, e.from, e.to || axis[axis.length - 1].date);
            if (bar) {
                const b = el('div', `bar event${e.to ? '' : ' open'}`, bar.span >= 3 ? (e.to ? 'Störung' : 'Störung dauert an') : '');
                b.title = `${e.title}: ${e.istZustand || '–'} / Ursache: ${e.ursache || '–'}`;
                b.setAttribute('role', 'img');
                b.setAttribute('aria-label', e.to ? 'Störung' : 'Störung dauert an');
                place(b, bar, rr);
                grid.append(b);
            }
        }
        return grid;
    }
    const roundedPath = (pts, r) => {
        let d = `M ${pts[0][0]} ${pts[0][1]}`;
        for (let i = 1; i < pts.length - 1; i++) {
            const [px, py] = pts[i - 1], [cx, cy] = pts[i], [nx, ny] = pts[i + 1];
            const l1 = Math.hypot(cx - px, cy - py), l2 = Math.hypot(nx - cx, ny - cy);
            const k = Math.min(r, l1 / 2, l2 / 2);
            const ax = cx - ((cx - px) / (l1 || 1)) * k, ay = cy - ((cy - py) / (l1 || 1)) * k;
            const bx = cx + ((nx - cx) / (l2 || 1)) * k, by = cy + ((ny - cy) / (l2 || 1)) * k;
            d += ` L ${ax} ${ay} Q ${cx} ${cy} ${bx} ${by}`;
        }
        const last = pts[pts.length - 1];
        return `${d} L ${last[0]} ${last[1]}`;
    };
    function drawArrows(grid) {
        grid.querySelector('.dep-layer')?.remove();
        const layer = svg('svg', { class: 'dep-layer', 'aria-hidden': 'true' });
        const g = grid.getBoundingClientRect();
        const rect = (e) => {
            const x = e.getBoundingClientRect();
            return { l: x.left - g.left, r: x.right - g.left, t: x.top - g.top, b: x.bottom - g.top, cy: (x.top + x.bottom) / 2 - g.top };
        };
        const GAP = 10;
        for (const d of state.dependencies) {
            const pe = grid.querySelector(`[data-soll="${d.predecessorId}"]`);
            const se = grid.querySelector(`[data-soll="${d.successorId}"]`);
            if (!pe || !se)
                continue;
            const fromEnd = d.type === 'EA' || d.type === 'EE';
            const toStart = d.type === 'EA' || d.type === 'AA';
            if ((fromEnd ? pe.dataset.clipE : pe.dataset.clipS) === 'true' || (toStart ? se.dataset.clipS : se.dataset.clipE) === 'true')
                continue;
            const p = rect(pe), s = rect(se);
            const x1 = fromEnd ? p.r : p.l, y1 = p.cy, x2 = toStart ? s.l : s.r, y2 = s.cy;
            const out = fromEnd ? 1 : -1, into = toStart ? 1 : -1;
            const ox = x1 + out * GAP, ix = x2 - into * GAP;
            const row = grid.querySelector(`.pl-lab[data-row="${d.predecessorId}"]`);
            const pr = row ? rect(row) : { t: p.t - 12, b: p.b + 12 };
            const ym = y2 >= y1 ? pr.b - 6 : pr.t + 6;
            const pts = (ix - ox) * into >= 0
                ? [[x1, y1], [ox, y1], [ox, y2], [x2, y2]]
                : [[x1, y1], [ox, y1], [ox, ym], [ix, ym], [ix, y2], [x2, y2]];
            const chk = (0, plan_ts_1.checkDependency)(state, d.id);
            const cls = chk.ok ? '' : ' broken';
            const path = svg('path', { class: `dep-arrow${cls}`, d: roundedPath(pts, 6) });
            const tip = svg('title');
            tip.textContent = `${depText(d)} · ${TYPE_LABEL[d.type]}${d.lagDays ? `, Versatz ${d.lagDays} Tage` : ''} · ${chk.ok ? 'eingehalten' : 'Termin verletzt'}`;
            path.append(tip);
            const head = svg('polygon', { class: `dep-head${cls}`, points: `${x2},${y2} ${x2 - into * 7},${y2 - 4} ${x2 - into * 7},${y2 + 4}` });
            layer.append(path, head);
        }
        grid.append(layer);
    }
    function drawLegend() {
        const lg = el('div', 'pl-legend');
        const item = (swatch, text) => { const s = el('span', 'it'); s.append(swatch, text); lg.append(s); };
        const sw = (bg, extra = '') => { const e = el('span', 'sw'); e.style.background = bg; if (extra)
            e.style.cssText += extra; return e; };
        item(sw('var(--soll)'), 'Geplant (Soll)');
        item(sw('var(--ist)'), 'Ausgeführt (Ist)');
        item(sw('var(--stoer)'), 'Störung');
        item(sw('repeating-linear-gradient(135deg, var(--stoer-soft) 0 3px, transparent 3px 6px)', 'border:1.5px solid var(--stoer);height:10px'), 'Doppelt belegt');
        const arrow = (broken) => {
            const a = svg('svg', { width: '24', height: '10', viewBox: '0 0 24 10', 'aria-hidden': 'true' });
            a.append(svg('path', { d: 'M1 5 H16', class: `dep-arrow${broken ? ' broken' : ''}` }), svg('polygon', { points: '23,5 16,1 16,9', class: `dep-head${broken ? ' broken' : ''}` }));
            return a;
        };
        const a1 = el('span', 'it');
        a1.append(arrow(false), 'Abhängigkeit');
        lg.append(a1);
        const a2 = el('span', 'it');
        a2.append(arrow(true), 'Abhängigkeit verletzt');
        lg.append(a2);
        lg.append(el('span', 'it hint', 'Wochenende hinterlegt · Linie = heute · Planvorgang anklicken, um ein Ereignis zu erzeugen'));
        return lg;
    }
    function drawFindings() {
        const items = [];
        for (const c of (0, plan_ts_1.findConflicts)(state)) {
            const r = state.resources.find(x => x.id === c.resourceId);
            const tasks = [...new Set(state.assignments.filter(a => c.assignmentIds.includes(a.id)).map(a => key(a.taskId)))];
            const li = el('li', 'finding conflict');
            li.append(el('span', 'tag stoer', 'Doppelbelegung'), `${r.label}: ${fmt(c.from)} bis ${fmt(c.to)} (${tasks.join(', ')})`);
            items.push(li);
        }
        for (const d of state.dependencies) {
            const c = (0, plan_ts_1.checkDependency)(state, d.id);
            if (c.ok)
                continue;
            const li = el('li', 'finding broken');
            li.append(el('span', 'tag warn', 'Abhängigkeit verletzt'), `${depText(d)} (${TYPE_LABEL[d.type]}): ${plural(-c.slackDays)} vor dem frühesten Termin ${fmt(c.earliest)}`);
            items.push(li);
        }
        if (!items.length)
            return el('p', 'empty', 'Keine Auffälligkeiten im Plan.');
        const ul = el('ul', 'list');
        ul.append(...items);
        return ul;
    }
    function drawDependencies() {
        const wrap = el('div');
        if (!state.dependencies.length)
            wrap.append(el('p', 'empty', 'Noch keine Abhängigkeiten.'));
        else {
            const t = el('table');
            t.id = 'deps';
            const head = el('tr');
            for (const h of ['Vorgänger', 'Nachfolger', 'Typ', 'Versatz', 'Stand', ''])
                head.append(el('th', '', h));
            t.append(head);
            for (const d of state.dependencies) {
                const c = (0, plan_ts_1.checkDependency)(state, d.id);
                const tr = el('tr');
                tr.append(el('td', '', key(d.predecessorId)), el('td', '', key(d.successorId)), el('td', '', TYPE_LABEL[d.type]), el('td', '', d.lagDays ? `${d.lagDays > 0 ? '+' : ''}${d.lagDays} Tage` : '–'));
                const st = el('td');
                st.append(c.ok ? el('span', 'tag', `eingehalten · ${plural(c.slackDays)} Puffer`) : el('span', 'tag warn', `verletzt · ${plural(-c.slackDays)} zu früh`));
                tr.append(st);
                const act = el('td');
                const rm = el('button', 'quiet', 'Entfernen');
                rm.type = 'button';
                rm.setAttribute('aria-label', `Abhängigkeit ${depText(d)} entfernen`);
                rm.onclick = () => { state = (0, plan_ts_1.removeDependency)(state, d.id); render(); };
                act.append(rm);
                tr.append(act);
                t.append(tr);
            }
            const tw = el('div', 'tw');
            tw.append(t);
            wrap.append(tw);
        }
        const det = el('details', 'add');
        det.open = depOpen;
        det.addEventListener('toggle', () => { depOpen = det.open; });
        det.append(el('summary', '', 'Abhängigkeit hinzufügen'));
        const f = el('form', 'frm');
        f.id = 'dep-form';
        const sel = (name, label, opts) => {
            const l = el('label', '', label);
            const s = el('select');
            s.name = name;
            for (const [v, t] of opts) {
                const o = el('option', '', t);
                o.value = v;
                s.append(o);
            }
            l.append(s);
            f.append(l);
        };
        const tasks = state.tasks.map(t => [t.id, `${t.planKey} · ${t.title}`]);
        sel('pred', 'Vorgänger', tasks);
        sel('succ', 'Nachfolger', tasks.length > 1 ? [...tasks.slice(1), tasks[0]] : tasks);
        sel('type', 'Typ', Object.keys(TYPE_LABEL).map(k => [k, `${TYPE_LABEL[k]} (${k})`]));
        const lag = el('input');
        lag.name = 'lag';
        lag.type = 'number';
        lag.step = '1';
        lag.value = '0';
        lag.setAttribute('aria-label', 'Versatz in Kalendertagen');
        const ll = el('label', '', 'Versatz (Kalendertage)');
        ll.append(lag);
        f.append(ll);
        const ok = el('button', 'primary', 'Hinzufügen');
        ok.type = 'submit';
        f.append(ok);
        if (depError) {
            const e = el('p', 'err', depError);
            e.style.gridColumn = '1 / -1';
            f.append(e);
        }
        f.onsubmit = ev => {
            ev.preventDefault();
            const v = (n) => f.elements.namedItem(n).value;
            try {
                state = (0, plan_ts_1.addDependency)(state, v('pred'), v('succ'), v('type'), Number(v('lag')));
                depError = '';
            }
            catch (e) {
                depError = e instanceof Error ? e.message : String(e);
            }
            depOpen = true;
            render();
        };
        det.append(f);
        wrap.append(det);
        return wrap;
    }
    function drawLoad() {
        const weeks = [];
        for (let m = AXIS_FROM; (0, plan_ts_1.diffDays)(m, AXIS_TO) >= 0; m = (0, plan_ts_1.addDays)(m, 7))
            weeks.push(m);
        const t = el('table');
        const head = el('tr');
        head.append(el('th', '', 'Kolonne / Gerät'));
        for (const w of weeks)
            head.append(el('th', '', `KW ${(0, plan_ts_1.isoWeek)(w)}`));
        t.append(head);
        for (const r of state.resources) {
            const tr = el('tr');
            tr.append(el('td', '', r.label));
            for (const w of weeks) {
                const days = Array.from({ length: 5 }, (_, i) => (0, plan_ts_1.occupancyOn)(state, r.id, (0, plan_ts_1.addDays)(w, i)));
                const status = days.includes('doppelt') ? 'doppelt' : days.every(x => x === 'frei') ? 'frei' : 'verplant';
                const label = status === 'doppelt' ? 'doppelt belegt' : status === 'frei' ? 'frei' : days.includes('frei') ? 'teilweise frei' : 'verplant';
                tr.append(el('td', `cell ${status}`, label));
            }
            t.append(tr);
        }
        const tw = el('div', 'tw');
        tw.append(t);
        return tw;
    }
    function drawForm() {
        if (!formFor)
            return null;
        const t = state.tasks.find(x => x.id === formFor);
        const f = el('form', 'evt');
        f.append(el('h2', '', `Ereignis aus ${t.planKey} · ${t.title}`));
        f.append(el('p', 'snap', `Die Soll-Daten werden als Momentaufnahme übernommen: ${t.level}, ${t.area}, ${t.lvRef}, ${fmt(t.sollStart)} – ${fmt(t.sollEnd)} und die zugeordneten Ressourcen.`));
        const field = (label, input) => { const l = el('label', '', label); l.append(input); f.append(l); };
        const title = el('input');
        title.name = 'title';
        title.required = true;
        title.placeholder = 'z. B. Vorleistung fehlt (fiktiv)';
        const from = el('input');
        from.type = 'date';
        from.name = 'from';
        from.value = demo_plan_ts_1.DEMO_TODAY;
        from.required = true;
        const ist = el('textarea');
        ist.name = 'ist';
        ist.rows = 2;
        const ursache = el('textarea');
        ursache.name = 'ursache';
        ursache.rows = 2;
        field('Titel', title);
        field('Beginn', from);
        field('Ist-Zustand', ist);
        field('Ursache', ursache);
        if (error)
            f.append(el('p', 'err', error));
        const ok = el('button', 'primary', 'Ereignis anlegen');
        ok.type = 'submit';
        const cancel = el('button', '', 'Abbrechen');
        cancel.type = 'button';
        cancel.onclick = () => { formFor = null; render(); };
        const row = el('div', 'row');
        row.append(ok, cancel);
        f.append(row);
        f.onsubmit = ev => {
            ev.preventDefault();
            try {
                state = (0, plan_ts_1.createEventFromTask)(state, t.id, { title: title.value, from: from.value, istZustand: ist.value, ursache: ursache.value }, demo_plan_ts_1.DEMO_TODAY).state;
                formFor = null;
                error = '';
            }
            catch (e) {
                error = e instanceof Error ? e.message : String(e);
            }
            render();
        };
        return f;
    }
    function drawEvents() {
        if (!state.events.length)
            return el('p', 'empty', 'Noch keine Ereignisse.');
        const ul = el('ul', 'list');
        for (const e of state.events) {
            const li = el('li');
            li.append(el('strong', '', e.title), el('span', 'muted', `${e.snapshot.planKey} · ab ${fmt(e.from)}${e.to ? ` bis ${fmt(e.to)}` : ' · dauert an'}`));
            const after = (0, plan_ts_1.downstreamTasks)(state, e.taskId);
            if (after.length)
                li.append(el('span', 'muted', `Nachfolger im Plan (zu prüfen): ${after.map(t => t.planKey).join(', ')}`));
            if (!e.to) {
                const b = el('button', 'quiet', 'Wiederaufnahme heute');
                b.type = 'button';
                b.onclick = () => { state = (0, plan_ts_1.endEvent)(state, e.id, demo_plan_ts_1.DEMO_TODAY); render(); };
                li.append(b);
            }
            ul.append(li);
        }
        return ul;
    }
    function render() {
        observer?.disconnect();
        const axis = (0, plan_ts_1.buildAxis)(AXIS_FROM, AXIS_TO, demo_plan_ts_1.DEMO_TODAY);
        root.replaceChildren();
        if (options.heading) {
            root.append(el('h1', '', 'Termin- und Ressourcenplaner'), el('p', 'pl-note', 'Prototyp mit erfundenen Daten. Nichts wird gespeichert. Ein Ereignis begründet keinen Anspruch auf Nachtrag oder Rechnung.'));
        }
        const scroll = el('div', 'pl-scroll');
        const grid = drawGrid(axis);
        scroll.append(grid, drawLegend());
        const form = drawForm();
        const h = (t) => el('h2', '', t);
        root.append(scroll, h('Auffälligkeiten'), drawFindings(), h('Abhängigkeiten'), drawDependencies(), ...(form ? [form] : []), h('Ereignisse'), drawEvents(), h('Personaldisposition (Wochenübersicht)'), drawLoad());
        drawArrows(grid);
        observer = new ResizeObserver(() => drawArrows(grid));
        observer.observe(grid);
    }
    render();
    return { destroy: () => { observer?.disconnect(); root.replaceChildren(); } };
}

},
"src/planner/plan.js": function (require, exports, module) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.downstreamTasks = exports.checkDependency = exports.removeDependency = exports.addDependency = exports.wouldCreateCycle = exports.endEvent = exports.createEventFromTask = exports.occupancyOn = exports.findConflicts = exports.assign = exports.addResource = exports.addTask = exports.taskProblems = exports.emptyPlan = exports.barOnAxis = exports.buildAxis = exports.mondayOf = exports.isoWeek = exports.weekdayOf = exports.diffDays = exports.addDays = exports.isIsoDay = void 0;
const ids_ts_1 = require("../core/ids.js");
const DAY = 86_400_000;
const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;
const isIsoDay = (s) => {
    const m = ISO.exec(s);
    if (!m)
        return false;
    const t = Date.UTC(+m[1], +m[2] - 1, +m[3]);
    const d = new Date(t);
    return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3];
};
exports.isIsoDay = isIsoDay;
const toUtc = (s) => {
    if (!(0, exports.isIsoDay)(s))
        throw new RangeError(`not an ISO day: ${s}`);
    const m = ISO.exec(s);
    return Date.UTC(+m[1], +m[2] - 1, +m[3]);
};
const fromUtc = (t) => new Date(t).toISOString().slice(0, 10);
const addDays = (s, n) => fromUtc(toUtc(s) + n * DAY);
exports.addDays = addDays;
const diffDays = (a, b) => Math.round((toUtc(b) - toUtc(a)) / DAY);
exports.diffDays = diffDays;
const weekdayOf = (s) => (new Date(toUtc(s)).getUTCDay() + 6) % 7;
exports.weekdayOf = weekdayOf;
const isoWeek = (s) => {
    const t = toUtc(s);
    const thursday = t + (3 - (0, exports.weekdayOf)(s)) * DAY;
    const jan1 = Date.UTC(new Date(thursday).getUTCFullYear(), 0, 1);
    return Math.floor((thursday - jan1) / DAY / 7) + 1;
};
exports.isoWeek = isoWeek;
const mondayOf = (s) => (0, exports.addDays)(s, -(0, exports.weekdayOf)(s));
exports.mondayOf = mondayOf;
const buildAxis = (from, to, today = '') => {
    if ((0, exports.diffDays)(from, to) < 0)
        throw new RangeError('axis end before start');
    const out = [];
    for (let d = from; (0, exports.diffDays)(d, to) >= 0; d = (0, exports.addDays)(d, 1)) {
        const wd = (0, exports.weekdayOf)(d);
        out.push({ date: d, weekday: wd, kw: (0, exports.isoWeek)(d), weekend: wd >= 5, today: d === today });
    }
    return out;
};
exports.buildAxis = buildAxis;
const barOnAxis = (axis, start, end) => {
    if (!axis.length || !(0, exports.isIsoDay)(start) || !(0, exports.isIsoDay)(end) || (0, exports.diffDays)(start, end) < 0)
        return null;
    const first = axis[0].date, last = axis[axis.length - 1].date;
    if ((0, exports.diffDays)(end, first) > 0 || (0, exports.diffDays)(last, start) > 0)
        return null;
    const s = (0, exports.diffDays)(start, first) > 0 ? first : start;
    const e = (0, exports.diffDays)(end, last) < 0 ? last : end;
    return { col: (0, exports.diffDays)(first, s), span: (0, exports.diffDays)(s, e) + 1, clippedStart: s !== start, clippedEnd: e !== end };
};
exports.barOnAxis = barOnAxis;
const emptyPlan = () => ({ tasks: [], resources: [], assignments: [], events: [], dependencies: [] });
exports.emptyPlan = emptyPlan;
const taskProblems = (t) => {
    const p = [];
    if (!t.title.trim())
        p.push('Titel fehlt');
    if (!(0, exports.isIsoDay)(t.sollStart) || !(0, exports.isIsoDay)(t.sollEnd))
        p.push('Soll-Termine fehlen oder sind ungültig');
    else if ((0, exports.diffDays)(t.sollStart, t.sollEnd) < 0)
        p.push('Soll-Ende liegt vor Soll-Beginn');
    if (t.istStart && !(0, exports.isIsoDay)(t.istStart))
        p.push('Ist-Beginn ungültig');
    if (t.istEnd && !(0, exports.isIsoDay)(t.istEnd))
        p.push('Ist-Ende ungültig');
    if (t.istEnd && !t.istStart)
        p.push('Ist-Ende ohne Ist-Beginn');
    if (t.istStart && t.istEnd && (0, exports.isIsoDay)(t.istStart) && (0, exports.isIsoDay)(t.istEnd) && (0, exports.diffDays)(t.istStart, t.istEnd) < 0)
        p.push('Ist-Ende liegt vor Ist-Beginn');
    if (!(t.progress >= 0 && t.progress <= 100))
        p.push('Fortschritt außerhalb 0–100');
    return p;
};
exports.taskProblems = taskProblems;
const addTask = (s, input) => {
    const task = {
        id: (0, ids_ts_1.nextId)('pt'), planKey: input.planKey, title: input.title, area: input.area ?? '', level: input.level ?? '', lvRef: input.lvRef ?? '',
        sollStart: input.sollStart, sollEnd: input.sollEnd, istStart: input.istStart ?? '', istEnd: input.istEnd ?? '',
        progress: input.progress ?? 0, status: input.status ?? 'geplant', rowOrder: s.tasks.length + 1
    };
    const problems = (0, exports.taskProblems)(task);
    if (problems.length)
        throw new RangeError(problems.join('; '));
    if (s.tasks.some(t => t.planKey === task.planKey))
        throw new RangeError(`planKey exists: ${task.planKey}`);
    return { ...s, tasks: [...s.tasks, task] };
};
exports.addTask = addTask;
const addResource = (s, type, label, headcount = 1) => {
    if (!label.trim())
        throw new RangeError('Ressource ohne Bezeichnung');
    return { ...s, resources: [...s.resources, { id: (0, ids_ts_1.nextId)('r'), type, label, headcount }] };
};
exports.addResource = addResource;
const assign = (s, taskId, resourceId, from, to, plannedHours = 0) => {
    if (!s.tasks.some(t => t.id === taskId))
        throw new RangeError('unknown task');
    if (!s.resources.some(r => r.id === resourceId))
        throw new RangeError('unknown resource');
    if (!(0, exports.isIsoDay)(from) || !(0, exports.isIsoDay)(to) || (0, exports.diffDays)(from, to) < 0)
        throw new RangeError('Einsatzzeitraum ungültig');
    return { ...s, assignments: [...s.assignments, { id: (0, ids_ts_1.nextId)('z'), taskId, resourceId, from, to, plannedHours, actualHours: 0 }] };
};
exports.assign = assign;
const findConflicts = (s) => {
    const out = [];
    for (const r of s.resources) {
        const list = s.assignments.filter(a => a.resourceId === r.id);
        const perDay = new Map();
        for (const a of list)
            for (let d = a.from; (0, exports.diffDays)(d, a.to) >= 0; d = (0, exports.addDays)(d, 1))
                perDay.set(d, [...(perDay.get(d) ?? []), a]);
        const days = [...perDay.entries()].filter(([, as]) => new Set(as.map(x => x.taskId)).size > 1).map(([d]) => d).sort();
        let cur = null;
        for (const d of days) {
            const ids = [...new Set(perDay.get(d).map(x => x.id))];
            if (cur && (0, exports.diffDays)(cur.to, d) === 1) {
                cur.to = d;
                ids.forEach(i => { if (!cur.assignmentIds.includes(i))
                    cur.assignmentIds.push(i); });
            }
            else {
                if (cur)
                    out.push(cur);
                cur = { resourceId: r.id, from: d, to: d, assignmentIds: ids };
            }
        }
        if (cur)
            out.push(cur);
    }
    return out;
};
exports.findConflicts = findConflicts;
const occupancyOn = (s, resourceId, day) => {
    const tasks = new Set(s.assignments.filter(a => a.resourceId === resourceId && (0, exports.diffDays)(a.from, day) >= 0 && (0, exports.diffDays)(day, a.to) >= 0).map(a => a.taskId));
    return tasks.size === 0 ? 'frei' : tasks.size === 1 ? 'verplant' : 'doppelt';
};
exports.occupancyOn = occupancyOn;
const createEventFromTask = (s, taskId, input, takenOn) => {
    const t = s.tasks.find(x => x.id === taskId);
    if (!t)
        throw new RangeError('unknown task');
    if (!input.title.trim())
        throw new RangeError('Ereignis ohne Titel');
    if (!(0, exports.isIsoDay)(input.from))
        throw new RangeError('Ereignisbeginn ungültig');
    if (input.to && (!(0, exports.isIsoDay)(input.to) || (0, exports.diffDays)(input.from, input.to) < 0))
        throw new RangeError('Ereignisende ungültig');
    const resources = s.assignments.filter(a => a.taskId === taskId).map(a => {
        const r = s.resources.find(x => x.id === a.resourceId);
        return { type: r.type, label: r.label, from: a.from, to: a.to };
    });
    const snapshot = {
        taskId, planKey: t.planKey, title: t.title, area: t.area, level: t.level, lvRef: t.lvRef,
        sollStart: t.sollStart, sollEnd: t.sollEnd, resources, takenOn
    };
    const event = { id: (0, ids_ts_1.nextId)('pe'), taskId, snapshot, title: input.title, from: input.from, to: input.to ?? '', istZustand: input.istZustand ?? '', ursache: input.ursache ?? '' };
    return { state: { ...s, events: [...s.events, event] }, event };
};
exports.createEventFromTask = createEventFromTask;
const endEvent = (s, eventId, to) => {
    const e = s.events.find(x => x.id === eventId);
    if (!e)
        throw new RangeError('unknown event');
    if (!(0, exports.isIsoDay)(to) || (0, exports.diffDays)(e.from, to) < 0)
        throw new RangeError('Ereignisende ungültig');
    return { ...s, events: s.events.map(x => (x.id === eventId ? { ...x, to } : x)) };
};
exports.endEvent = endEvent;
const DEP_TYPES = ['EA', 'AA', 'EE', 'AE'];
const wouldCreateCycle = (s, predecessorId, successorId) => {
    if (predecessorId === successorId)
        return true;
    const seen = new Set();
    const stack = [successorId];
    while (stack.length) {
        const cur = stack.pop();
        if (cur === predecessorId)
            return true;
        if (seen.has(cur))
            continue;
        seen.add(cur);
        for (const d of s.dependencies)
            if (d.predecessorId === cur)
                stack.push(d.successorId);
    }
    return false;
};
exports.wouldCreateCycle = wouldCreateCycle;
const addDependency = (s, predecessorId, successorId, type = 'EA', lagDays = 0) => {
    if (!s.tasks.some(t => t.id === predecessorId) || !s.tasks.some(t => t.id === successorId))
        throw new RangeError('unknown task');
    if (!DEP_TYPES.includes(type))
        throw new RangeError('Abhängigkeitstyp ungültig');
    if (!Number.isInteger(lagDays))
        throw new RangeError('Zeitversatz muss eine ganze Zahl sein');
    if (predecessorId === successorId)
        throw new RangeError('Ein Planvorgang kann nicht von sich selbst abhängen');
    if (s.dependencies.some(d => d.predecessorId === predecessorId && d.successorId === successorId))
        throw new RangeError('Abhängigkeit besteht bereits');
    if ((0, exports.wouldCreateCycle)(s, predecessorId, successorId))
        throw new RangeError('Abhängigkeit würde einen Kreis bilden');
    return { ...s, dependencies: [...s.dependencies, { id: (0, ids_ts_1.nextId)('d'), predecessorId, successorId, type, lagDays }] };
};
exports.addDependency = addDependency;
const removeDependency = (s, dependencyId) => {
    if (!s.dependencies.some(d => d.id === dependencyId))
        throw new RangeError('unknown dependency');
    return { ...s, dependencies: s.dependencies.filter(d => d.id !== dependencyId) };
};
exports.removeDependency = removeDependency;
const checkDependency = (s, dependencyId) => {
    const d = s.dependencies.find(x => x.id === dependencyId);
    if (!d)
        throw new RangeError('unknown dependency');
    const p = s.tasks.find(t => t.id === d.predecessorId);
    const q = s.tasks.find(t => t.id === d.successorId);
    const [bound, actual] = d.type === 'EA' ? [(0, exports.addDays)(p.sollEnd, 1 + d.lagDays), q.sollStart]
        : d.type === 'AA' ? [(0, exports.addDays)(p.sollStart, d.lagDays), q.sollStart]
            : d.type === 'EE' ? [(0, exports.addDays)(p.sollEnd, d.lagDays), q.sollEnd]
                : [(0, exports.addDays)(p.sollStart, d.lagDays), q.sollEnd];
    const slackDays = (0, exports.diffDays)(bound, actual);
    return { dependencyId, earliest: bound, slackDays, ok: slackDays >= 0 };
};
exports.checkDependency = checkDependency;
const downstreamTasks = (s, taskId) => {
    const out = [];
    const seen = new Set([taskId]);
    let frontier = [taskId];
    while (frontier.length) {
        const next = [];
        for (const id of frontier)
            for (const d of s.dependencies) {
                if (d.predecessorId === id && !seen.has(d.successorId)) {
                    seen.add(d.successorId);
                    next.push(d.successorId);
                }
            }
        for (const id of next)
            out.push(s.tasks.find(t => t.id === id));
        frontier = next;
    }
    return out;
};
exports.downstreamTasks = downstreamTasks;

},
"src/planner/demo-plan.js": function (require, exports, module) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildDemoPlan = exports.DEMO_TODAY = void 0;
const plan_ts_1 = require("./plan.js");
exports.DEMO_TODAY = '2026-11-19';
const buildDemoPlan = () => {
    let s = (0, plan_ts_1.emptyPlan)();
    s = (0, plan_ts_1.addTask)(s, { planKey: 'PV-001', title: 'Trockenbauwände 1. OG', area: 'Baufeld 2', level: '1. OG', lvRef: 'OZ 03.02.010', sollStart: '2026-11-17', sollEnd: '2026-11-28', istStart: '2026-11-17', istEnd: '', progress: 45, status: 'in Arbeit' });
    s = (0, plan_ts_1.addTask)(s, { planKey: 'PV-002', title: 'Decke Foyer', area: 'Foyer', level: 'EG', lvRef: 'OZ 03.02.020', sollStart: '2026-11-24', sollEnd: '2026-12-12' });
    s = (0, plan_ts_1.addTask)(s, { planKey: 'PV-003', title: 'Spachtelung', area: 'Baufeld 2', level: '1. OG', lvRef: 'OZ 03.03.010', sollStart: '2026-12-08', sollEnd: '2026-12-19' });
    s = (0, plan_ts_1.addResource)(s, 'kolonne', 'Kolonne A (Muster)', 4);
    s = (0, plan_ts_1.addResource)(s, 'kolonne', 'Kolonne B (Muster)', 3);
    s = (0, plan_ts_1.addResource)(s, 'geraet', 'Hubsteiger (Muster)', 1);
    const [t1, t2, t3] = s.tasks.map(t => t.id);
    const [ka, kb, hub] = s.resources.map(r => r.id);
    s = (0, plan_ts_1.assign)(s, t1, ka, '2026-11-17', '2026-11-28', 240);
    s = (0, plan_ts_1.assign)(s, t1, hub, '2026-11-17', '2026-11-21', 0);
    s = (0, plan_ts_1.assign)(s, t2, kb, '2026-11-24', '2026-12-12', 200);
    s = (0, plan_ts_1.assign)(s, t3, kb, '2026-12-08', '2026-12-19', 120);
    s = (0, plan_ts_1.addDependency)(s, t1, t2, 'AA', 5);
    s = (0, plan_ts_1.addDependency)(s, t1, t3, 'EA', 0);
    s = (0, plan_ts_1.addDependency)(s, t2, t3, 'EA', 0);
    s = (0, plan_ts_1.createEventFromTask)(s, t1, { title: 'Vorleistung fehlt (fiktiv)', from: '2026-11-19', istZustand: 'Wand kann nicht geschlossen werden', ursache: 'Vorleistung nicht abgeschlossen' }, exports.DEMO_TODAY).state;
    return s;
};
exports.buildDemoPlan = buildDemoPlan;

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
  globalThis.PlannerApp = Object.freeze(Object.assign({}, load("preview/planner-app.js"), { css: ":root, :host, .pl-app {\n  color-scheme: light;\n  --ink: #14252c; --muted: #40594e; --line: #c8d7cc; --line-soft: #e3ebe5; --line-strong: #9eafa3;\n  --paper: #f5f7f4; --panel: #fff; --band: #eef3ef;\n  --teal: #0a665e; --teal-d: #084f47; --lime: #d5f28a; --focus: #73b99b;\n  --soll: #5b8db0; --soll-soft: #dbe8f0; --soll-line: #9bbbd0; --ist: #0a665e;\n  --stoer: #a8321f; --stoer-soft: #f6d9d2; --gear: #e8e6df; --gear-line: #bdb8a8;\n  --weekend: #f4efe6; --note-bg: #fff6e8; --note-ink: #63380d; --note-line: #c88736; --ok-bg: #e5f3e9; --ok-ink: #1c573a;\n  --s1: 4px; --s2: 8px; --s3: 12px; --s4: 16px; --s5: 24px; --s6: 32px;\n  --day: 30px; --label: 268px; --row: 64px;\n  font-family: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif;\n}\n@media (prefers-color-scheme: dark) {\n  .pl-app[data-scheme=\"auto\"] {\n    color-scheme: dark;\n    --ink: #e6efe9; --muted: #a9bdb1; --line: #34453d; --line-soft: #2a3832; --line-strong: #566b60;\n    --paper: #11191a; --panel: #172123; --band: #1d2a2c;\n    --teal: #4fb8a8; --teal-d: #3a9a8b; --lime: #b5d96a; --focus: #73b99b;\n    --soll: #6c9fc2; --soll-soft: #223846; --soll-line: #3d6580; --ist: #4fb8a8;\n    --stoer: #e0705c; --stoer-soft: #4a2520; --gear: #2d2f2a; --gear-line: #5a5a4e;\n    --weekend: #1f2321; --note-bg: #2b2418; --note-ink: #f1d8b0; --note-line: #a8742f; --ok-bg: #1f3a2c; --ok-ink: #bfe8cf;\n  }\n}\n* { box-sizing: border-box; }\n.pl-app { background: var(--paper); color: var(--ink); font-size: 14px; line-height: 1.45; font-variant-numeric: tabular-nums; padding-bottom: var(--s6); }\n.pl-app.standalone { min-height: 100vh; padding: var(--s5) max(var(--s5), calc((100% - 1320px) / 2)) var(--s6); }\n::selection { background: var(--lime); color: #14252c; }\n* { scrollbar-color: var(--line-strong) transparent; }\ninput, select, button, textarea { accent-color: var(--teal); }\n:is(input, select, textarea, button, summary):focus-visible { outline: 3px solid var(--focus); outline-offset: 2px; }\nh1 { font-size: 22px; letter-spacing: -.01em; margin: 0 0 var(--s1); text-wrap: balance; }\nh2 { font-size: 15px; margin: var(--s6) 0 var(--s2); }\n.pl-note { margin: 0; color: var(--muted); max-width: 72ch; }\n.pl-scroll { overflow-x: auto; background: var(--panel); border: 1px solid var(--line); border-radius: 10px; }\n.pl-grid { display: grid; grid-template-columns: var(--label) repeat(var(--n), var(--day)); min-width: calc(var(--label) + var(--n) * var(--day)); position: relative; }\n.pl-lab { position: sticky; left: 0; z-index: 4; background: var(--panel); padding: var(--s2) var(--s3); border-right: 1px solid var(--line); border-bottom: 1px solid var(--line-soft); display: flex; flex-direction: column; justify-content: center; gap: 1px; min-height: 36px; }\n.pl-lab.task { min-height: var(--row); }\n.pl-lab.sec { background: var(--band); min-height: 30px; color: var(--muted); font-size: 12px; font-weight: 600; letter-spacing: .01em; }\n.pl-lab small { color: var(--muted); font-size: 12px; line-height: 1.3; }\n.pl-lab .nm { font-weight: 600; }\n.pl-corner { position: sticky; left: 0; z-index: 4; background: var(--panel); border-right: 1px solid var(--line); border-bottom: 1px solid var(--line); padding: var(--s3); color: var(--muted); font-size: 12px; display: flex; align-items: flex-end; }\n.pl-kw, .pl-dd { text-align: center; border-left: 1px solid var(--line-soft); background: var(--panel); }\n.pl-kw { font-size: 12px; font-weight: 600; padding: var(--s2) 0 var(--s1); }\n.pl-kw .rng { font-weight: 400; color: var(--muted); margin-left: var(--s1); }\n.pl-dd { font-size: 11px; line-height: 1.25; padding: 0 0 var(--s2); border-bottom: 1px solid var(--line); color: var(--muted); white-space: pre; }\n.pl-dd.we { background: var(--weekend); }\n.pl-dd.today { background: var(--lime); color: #14252c; font-weight: 700; }\n.pl-cell { border-left: 1px solid var(--line-soft); border-bottom: 1px solid var(--line-soft); }\n.pl-cell.we { background: var(--weekend); }\n.pl-cell.today { box-shadow: inset 2px 0 0 var(--teal); }\n.pl-cell.secbg { background: var(--band); }\n.bar { z-index: 2; margin-inline: 1px; border-radius: 4px; min-width: 0; }\n.bar.soll { align-self: center; transform: translateY(-8px); height: 12px; background: var(--soll); }\n.bar.ist { align-self: center; transform: translateY(8px); height: 12px; background: var(--ist); }\n.bar.res { align-self: center; height: 22px; background: var(--soll-soft); border: 1px solid var(--soll-line); color: var(--ink); font-size: 11px; line-height: 20px; padding-inline: 6px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }\n.bar.res.geraet { background: var(--gear); border-color: var(--gear-line); }\n.bar.res.doppelt { z-index: 3; background: repeating-linear-gradient(135deg, transparent 0 6px, color-mix(in srgb, var(--stoer) 16%, transparent) 6px 7px), var(--stoer-soft); border: 1.5px solid var(--stoer); color: var(--stoer); font-weight: 600; }\n.bar.event { align-self: center; height: 22px; background: var(--stoer); color: #fff; font-size: 11px; line-height: 22px; padding-inline: 8px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }\n.bar.event.open { border-radius: 4px 0 0 4px; }\n.bar.clip-s { border-top-left-radius: 0; border-bottom-left-radius: 0; margin-left: 0; }\n.bar.clip-e { border-top-right-radius: 0; border-bottom-right-radius: 0; margin-right: 0; }\n.dep-layer { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 3; overflow: visible; }\n.dep-arrow { fill: none; stroke: var(--muted); stroke-width: 1.5; stroke-linejoin: round; stroke-linecap: round; }\n.dep-arrow.broken { stroke: var(--stoer); stroke-dasharray: 4 3; }\n.dep-head { fill: var(--muted); } .dep-head.broken { fill: var(--stoer); }\n.taskbtn { all: unset; cursor: pointer; font-weight: 600; border-radius: 3px; }\n.taskbtn:hover { text-decoration: underline; text-underline-offset: 3px; text-decoration-color: var(--teal); }\n.taskbtn:focus-visible { outline: 3px solid var(--focus); outline-offset: 2px; }\n.pl-legend { display: flex; flex-wrap: wrap; gap: var(--s2) var(--s4); padding: var(--s3) var(--s4); border-top: 1px solid var(--line-soft); color: var(--muted); font-size: 12px; align-items: center; }\n.pl-legend .it { display: inline-flex; align-items: center; gap: 6px; }\n.pl-legend .hint { flex-basis: 100%; }\n.pl-legend svg { display: block; }\n.sw { width: 18px; height: 8px; border-radius: 2px; display: inline-block; }\n.list { list-style: none; margin: 0; padding: 0; }\n.list li { display: flex; flex-wrap: wrap; align-items: baseline; gap: var(--s1) var(--s3); padding: var(--s2) 0; border-bottom: 1px solid var(--line-soft); max-width: 900px; }\n.list li:last-child { border-bottom: 0; }\n.tag { display: inline-block; padding: 1px 8px; border-radius: 10px; font-size: 12px; font-weight: 600; background: var(--ok-bg); color: var(--ok-ink); }\n.tag.warn { background: var(--note-bg); color: var(--note-ink); box-shadow: inset 0 0 0 1px var(--note-line); }\n.tag.stoer { background: var(--stoer-soft); color: var(--stoer); }\n.muted { color: var(--muted); }\n.empty { color: var(--muted); margin: 0; }\ndetails.add { margin-top: var(--s3); }\ndetails.add > summary { cursor: pointer; color: var(--teal); font-weight: 600; width: fit-content; border-radius: 3px; }\nform.frm { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: var(--s3); align-items: end; margin-top: var(--s3); max-width: 900px; }\nform.evt { display: grid; gap: var(--s3); margin: var(--s4) 0; max-width: 640px; padding: var(--s4) 0 0; border-top: 1px solid var(--line); }\nform label { display: grid; gap: var(--s1); font-size: 12px; color: var(--muted); }\nform .row { display: flex; gap: var(--s2); flex-wrap: wrap; }\nform.frm :is(select, input) { width: 100%; min-width: 0; }\ninput, select, textarea { font: inherit; color: var(--ink); background: var(--panel); padding: 7px 10px; border: 1px solid var(--line-strong); border-radius: 6px; min-height: 36px; }\nbutton { font: inherit; cursor: pointer; padding: 7px 14px; border-radius: 6px; border: 1px solid var(--teal); background: transparent; color: var(--teal); min-height: 36px; font-weight: 600; }\nbutton:hover { background: var(--ok-bg); }\nbutton.primary { background: var(--teal); color: #fff; } button.primary:hover { background: var(--teal-d); }\nbutton.quiet { border-color: transparent; padding-inline: var(--s2); min-height: 28px; font-weight: 500; }\n.snap { color: var(--muted); font-size: 12px; margin: 0; max-width: 70ch; }\n.err { color: var(--stoer); margin: 0; font-weight: 600; }\ntable { border-collapse: collapse; width: 100%; max-width: 900px; min-width: 560px; }\n.tw { overflow-x: auto; max-width: 900px; }\n.tw table { max-width: none; }\ntd, th { white-space: nowrap; }\nth { text-align: left; font-size: 12px; font-weight: 600; color: var(--muted); padding: var(--s2) var(--s3) var(--s2) 0; border-bottom: 1px solid var(--line); }\ntd { padding: var(--s2) var(--s3) var(--s2) 0; border-bottom: 1px solid var(--line-soft); }\ntd.cell { padding: var(--s2) var(--s3); }\ntd.frei { color: var(--muted); } td.verplant { background: var(--ok-bg); color: var(--ok-ink); } td.doppelt { background: var(--stoer-soft); color: var(--stoer); font-weight: 600; }\n@media (max-width: 640px) {\n  :root { --label: 150px; --day: 26px; }\n  .pl-app.standalone { padding-inline: var(--s3); }\n}" }, { build: "sha256:cd411f9566f552ea" }));
})();
