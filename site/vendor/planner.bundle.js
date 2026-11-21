/* GENERATED FILE - do not edit. Source: mission-control-spfx, content sha256:2ca4f80b1d8c3d76, preview/planner-app.js, src/planner/plan.js, src/planner/demo-plan.js, src/planner/in-memory-plan-repository.js, src/planner/plan-session.js, src/planner/period.js, src/planner/plan-cases.js, src/planner/stored-plan-repository.js, src/behinderung/from-plan-event.js, src/behinderung/behinderungsanzeige.js, src/planner/event-chain.js, src/core/ids.js, src/planner/plan-integrity.js, src/planner/plan-repository.js, src/planner/plan-sync.js, src/planner/stoerungsfall-demo.js, src/core/disruption.js, src/behinderung/wording.js.
 * Rebuild: node mission-control-spfx/scripts/build-classic-bundle.mjs --entry planner <this file>
 * Synthetic prototype. Templates, hours and checks are drafts, not approved rules. */
(function () {
  'use strict';
  const defs = {
"preview/planner-app.js": function (require, exports, module) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearSavedPlans = exports.resetPlanCase = exports.planCase = exports.PLAN_CASES = void 0;
exports.plannerCaseOptions = plannerCaseOptions;
exports.mountPlanner = mountPlanner;
const plan_ts_1 = require("../src/planner/plan.js");
const demo_plan_ts_1 = require("../src/planner/demo-plan.js");
const in_memory_plan_repository_ts_1 = require("../src/planner/in-memory-plan-repository.js");
const plan_session_ts_1 = require("../src/planner/plan-session.js");
const period_ts_1 = require("../src/planner/period.js");
const plan_cases_ts_1 = require("../src/planner/plan-cases.js");
Object.defineProperty(exports, "PLAN_CASES", { enumerable: true, get: function () { return plan_cases_ts_1.PLAN_CASES; } });
Object.defineProperty(exports, "planCase", { enumerable: true, get: function () { return plan_cases_ts_1.planCase; } });
const stored_plan_repository_ts_1 = require("../src/planner/stored-plan-repository.js");
const from_plan_event_ts_1 = require("../src/behinderung/from-plan-event.js");
const behinderungsanzeige_ts_1 = require("../src/behinderung/behinderungsanzeige.js");
const event_chain_ts_1 = require("../src/planner/event-chain.js");
function plannerCaseOptions(key, o = {}) {
    const c = (0, plan_cases_ts_1.planCase)(key);
    const when = { today: c.today, periodFrom: c.periodFrom, periodWeeks: c.periodWeeks };
    if (!o.persist)
        return { repository: new in_memory_plan_repository_ts_1.InMemoryPlanRepository(c.build()), persistent: false, ...when };
    const repository = new stored_plan_repository_ts_1.StoredPlanRepository(c.build, c.key, (0, stored_plan_repository_ts_1.browserStore)());
    return { repository, persistent: repository.persistent, storageLabel: repository.persistent ? 'in diesem Browser, Prototyp' : undefined, ...when };
}
const resetPlanCase = (key) => (0, stored_plan_repository_ts_1.resetStoredPlan)((0, plan_cases_ts_1.planCase)(key).key, (0, stored_plan_repository_ts_1.browserStore)());
exports.resetPlanCase = resetPlanCase;
const clearSavedPlans = () => (0, stored_plan_repository_ts_1.clearStoredPlans)((0, stored_plan_repository_ts_1.browserStore)());
exports.clearSavedPlans = clearSavedPlans;
function mountPlanner(root, options = {}) {
    root.classList.add('pl-app');
    root.classList.toggle('standalone', Boolean(options.heading));
    root.dataset.scheme = options.scheme ?? 'light';
    let state = (0, plan_ts_1.emptyPlan)();
    const session = new plan_session_ts_1.PlanSession(options.repository ?? new in_memory_plan_repository_ts_1.InMemoryPlanRepository((0, demo_plan_ts_1.buildDemoPlan)()), options.storageLabel);
    let opened = false;
    let destroyed = false;
    let panel = null;
    let panelEnter = false;
    let focusTarget = '';
    let returnFocus = '';
    let planError = '';
    let dispoView = 'personal';
    let confirmDiscard = false;
    let drag = null;
    const live = document.createElement('div');
    live.className = 'pl-live';
    live.id = 'pl-live';
    live.setAttribute('role', 'status');
    live.setAttribute('aria-live', 'polite');
    live.setAttribute('aria-atomic', 'true');
    let liveFlip = false;
    const announce = (text) => { liveFlip = !liveFlip; live.textContent = text + (liveFlip ? '\u00a0' : ''); };
    let pan = null;
    let wheelPan = 0, wheelZoom = 0, lastZoomAt = -Infinity;
    const TIME_HELP = 'Pfeiltasten links und rechts verschieben die Zeitachse um einen Tag, mit Umschalt um eine Woche. Plus und Minus ändern den Maßstab, Pos1 springt zu heute.';
    let rovingId = '';
    let arrowFrame = 0;
    const scheduleArrows = (g) => { if (arrowFrame)
        return; arrowFrame = requestAnimationFrame(() => { arrowFrame = 0; drawArrows(g); }); };
    let moveNote = null;
    let observer = null;
    const toastHost = document.createElement('div');
    toastHost.className = 'pl-toasts';
    toastHost.id = 'pl-toasts';
    let toast = null;
    let toastTimer = 0;
    const TODAY = options.today ?? demo_plan_ts_1.DEMO_TODAY;
    let period = (0, period_ts_1.makePeriod)(options.periodFrom ?? TODAY, options.periodWeeks ?? 5);
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
    const ICONS = {
        'chevron-left': [['path', { d: 'm15 18-6-6 6-6' }]],
        'chevron-right': [['path', { d: 'm9 18 6-6-6-6' }]],
        calendar: [['rect', { x: '3', y: '4', width: '18', height: '18', rx: '2' }], ['path', { d: 'M16 2v4M8 2v4M3 10h18' }]],
        plus: [['path', { d: 'M12 5v14M5 12h14' }]],
        minus: [['path', { d: 'M5 12h14' }]],
        pencil: [['path', { d: 'M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z' }], ['path', { d: 'm15 5 4 4' }]],
        trash: [['path', { d: 'M3 6h18' }], ['path', { d: 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6' }], ['path', { d: 'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' }], ['path', { d: 'M10 11v6M14 11v6' }]],
        x: [['path', { d: 'M18 6 6 18M6 6l12 12' }]],
        check: [['path', { d: 'M20 6 9 17l-5-5' }]],
        file: [['path', { d: 'M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5Z' }], ['path', { d: 'M14 2v6h6M16 13H8M16 17H8M10 9H8' }]],
        clipboard: [['rect', { x: '8', y: '2', width: '8', height: '4', rx: '1' }], ['path', { d: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2' }], ['path', { d: 'm9 14 2 2 4-4' }]],
        play: [['path', { d: 'M6 3 20 12 6 21Z' }]],
        undo: [['path', { d: 'M3 7v6h6' }], ['path', { d: 'M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13' }]],
        refresh: [['path', { d: 'M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8' }], ['path', { d: 'M21 3v5h-5' }], ['path', { d: 'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16' }], ['path', { d: 'M3 16h5v5' }]],
    };
    function icon(name) {
        const i = svg('svg', { class: 'ico', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true', focusable: 'false' });
        for (const [tag, attrs] of ICONS[name])
            i.append(svg(tag, attrs));
        return i;
    }
    function withIcon(b, name) { b.classList.add('ico-btn'); b.prepend(icon(name)); return b; }
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
    const ARROW_HELP = 'Enter öffnet die Bearbeitung; Pfeil links/rechts verschiebt um einen Tag, mit Umschalt um eine Woche; Alt+Pfeil ändert das Ende, Alt+Umschalt+Pfeil den Beginn; Strg+Z oder Cmd+Z macht die letzte Verschiebung rückgängig; Pfeil hoch/runter wechselt den Balken';
    const TOAST_MS = 12000;
    const hasUndo = (t) => Boolean(t?.actions.some(a => a.id === 'undo'));
    function armToast() { clearTimeout(toastTimer); if (hasUndo(toast))
        return; toastTimer = window.setTimeout(dismissToast, TOAST_MS); }
    const IS_MAC = /Mac|iPhone|iPad/.test(navigator.platform);
    function dismissToast() { clearTimeout(toastTimer); toast = null; toastHost.replaceChildren(); }
    function showToast(text, actions) {
        toast = { text, actions, after: state };
        announce(actions.some(a => a.id === 'undo') ? `${text} Rückgängig mit ${IS_MAC ? 'Cmd+Z' : 'Strg+Z'}.` : text);
        const box = el('div', 'pl-toast');
        box.id = 'pl-toast';
        box.setAttribute('role', 'group');
        box.setAttribute('aria-label', 'Meldung');
        box.append(el('span', 'pl-toast-text', text));
        for (const a of actions) {
            const b = withIcon(el('button', 'quiet', a.label), a.icon);
            b.type = 'button';
            b.dataset.toast = a.id;
            b.onclick = () => { dismissToast(); a.run(); };
            if (a.id === 'undo') {
                b.setAttribute('aria-keyshortcuts', 'Control+Z Meta+Z');
                b.title = `${a.label} (${IS_MAC ? 'Cmd+Z' : 'Strg+Z'})`;
                b.append(el('kbd', 'pl-kbd', IS_MAC ? '⌘Z' : 'Strg+Z'));
            }
            box.append(b);
        }
        const x = withIcon(el('button', 'quiet icon-only', ''), 'x');
        x.type = 'button';
        x.setAttribute('aria-label', 'Meldung schließen');
        x.dataset.toast = 'close';
        x.onclick = () => { dismissToast(); };
        box.append(x);
        box.addEventListener('mouseenter', () => clearTimeout(toastTimer));
        box.addEventListener('focusin', () => clearTimeout(toastTimer));
        box.addEventListener('mouseleave', () => { if (!box.contains(document.activeElement))
            armToast(); });
        box.addEventListener('focusout', () => { if (!box.matches(':hover'))
            armToast(); });
        box.addEventListener('keydown', e => { if (e.key === 'Escape') {
            e.stopPropagation();
            dismissToast();
        } });
        toastHost.replaceChildren(box);
        armToast();
    }
    const undoAction = (before, text, focus) => ({ id: 'undo', label: 'Rückgängig', icon: 'undo', run: () => { state = before; returnFocus = focus; announce(text); render(); } });
    const addedItem = (before, after) => after.find(x => !before.some(b => b.id === x.id));
    function toastAfterSave(kind, before) {
        const after = state;
        if (after === before)
            return;
        if (kind === 'task-create') {
            const t = addedItem(before.tasks, after.tasks);
            if (!t)
                return;
            showToast(`${t.planKey} angelegt.`, [
                { id: 'add-assign', label: 'Zuordnung hinzufügen', icon: 'plus', run: () => openPanel(assignmentCreateSpec(t.id)) },
                { id: 'add-dep', label: 'Abhängigkeit hinzufügen', icon: 'plus', run: () => openPanel(dependencyCreateSpec(t.id)) },
            ]);
        }
        else if (kind === 'resource-create') {
            const r = addedItem(before.resources, after.resources);
            if (r)
                showToast(`Ressource ${r.label} angelegt.`, []);
        }
        else if (kind === 'assignment-create') {
            const a = addedItem(before.assignments, after.assignments);
            if (a)
                showToast(`Zuordnung angelegt: ${after.resources.find(x => x.id === a.resourceId)?.label ?? '?'} → ${key(a.taskId)}.`, []);
        }
        else if (kind === 'dependency-create') {
            const d = addedItem(before.dependencies, after.dependencies);
            if (d)
                showToast(`Abhängigkeit angelegt: ${depText(d)}.`, []);
        }
        else if (kind === 'event-create') {
            const e = addedItem(before.events, after.events);
            if (!e)
                return;
            showToast(`Ereignis ${e.title} angelegt (${e.nummer}).`, [
                { id: 'assess', label: 'Einschätzung bearbeiten', icon: 'clipboard', run: () => openPanel(assessSpec(e.id)) },
                { id: 'letter', label: 'Behinderungsanzeige-Entwurf', icon: 'file', run: () => openPanel(letterSpec(e.id)) },
            ]);
        }
        else if (kind === 'event-assess')
            showToast('Einschätzung gespeichert.', []);
    }
    function commitSollMove(taskId, mode, days) {
        const cur = state.tasks.find(x => x.id === taskId);
        if (!cur || days === 0)
            return;
        try {
            const next = (0, plan_ts_1.moveSoll)(state, taskId, mode, days);
            const after = next.tasks.find(x => x.id === taskId);
            const before = moveNote?.taskId === taskId && moveNote.before ? moveNote.before : { sollStart: cur.sollStart, sollEnd: cur.sollEnd };
            moveNote = { text: `${cur.planKey}: Soll jetzt ${fmt(after.sollStart)} bis ${fmt(after.sollEnd)}.`, taskId, before, focusId: taskId };
            state = next;
        }
        catch (x) {
            moveNote = { text: x instanceof Error ? x.message : String(x), error: true, focusId: taskId };
        }
        if (moveNote)
            announce(moveNote.text);
        returnFocus = `[data-soll="${taskId}"]`;
        render();
    }
    function undoSollMove() {
        const n = moveNote;
        if (!n?.taskId || !n.before)
            return;
        const t = state.tasks.find(x => x.id === n.taskId);
        if (!t) {
            moveNote = null;
            render();
            return;
        }
        try {
            state = (0, plan_ts_1.updateTask)(state, n.taskId, n.before);
            moveNote = { text: `${t.planKey}: Soll wieder ${fmt(n.before.sollStart)} bis ${fmt(n.before.sollEnd)}.`, focusId: n.taskId };
        }
        catch (x) {
            moveNote = { text: x instanceof Error ? x.message : String(x), error: true };
        }
        if (moveNote)
            announce(moveNote.text);
        returnFocus = `[data-soll="${n.taskId}"]`;
        render();
    }
    function endDragVisual(d) {
        d.tip?.remove();
        d.bar.classList.remove('dragging');
        try {
            d.bar.releasePointerCapture(d.pointerId);
        }
        catch { }
    }
    function cancelDrag() {
        const d = drag;
        if (!d)
            return;
        drag = null;
        endDragVisual(d);
        announce('Verschieben abgebrochen.');
        render();
    }
    function makeSollInteractive(b, t, soll, axis, grid) {
        const range = `${fmt(t.sollStart)} bis ${fmt(t.sollEnd)}`;
        b.setAttribute('role', 'button');
        b.tabIndex = rovingId === t.id ? 0 : -1;
        b.onfocus = () => { rovingId = t.id; for (const o of Array.from(grid.querySelectorAll('.bar.soll')))
            o.tabIndex = o === b ? 0 : -1; };
        b.setAttribute('aria-label', `${t.planKey} Soll ${range}, bearbeiten`);
        b.setAttribute('aria-description', ARROW_HELP);
        b.title = `Soll ${fmt(t.sollStart)} – ${fmt(t.sollEnd)} · klicken: bearbeiten · ziehen: verschieben · Rand ziehen: Beginn/Ende`;
        if (!soll.clippedStart) {
            const g = el('span', 'grip');
            g.dataset.edge = 's';
            g.setAttribute('aria-hidden', 'true');
            b.append(g);
        }
        if (!soll.clippedEnd) {
            const g = el('span', 'grip');
            g.dataset.edge = 'e';
            g.setAttribute('aria-hidden', 'true');
            b.append(g);
        }
        const openEdit = () => openPanel({ ...taskEditSpec(t.id), opener: `[data-soll="${t.id}"]` });
        const preview = (d, days) => {
            const nd = (0, plan_ts_1.sollAfterDrag)(t, d.mode, days);
            const nb = (0, plan_ts_1.barOnAxis)(axis, nd.sollStart, nd.sollEnd);
            if (!nb)
                return false;
            d.bar.style.gridColumn = `${nb.col + 2} / span ${nb.span}`;
            d.bar.classList.toggle('clip-s', nb.clippedStart);
            d.bar.classList.toggle('clip-e', nb.clippedEnd);
            const len = (0, plan_ts_1.diffDays)(nd.sollStart, nd.sollEnd) + 1;
            if (d.tip)
                d.tip.textContent = `${t.planKey} Soll ${fmt(nd.sollStart)} – ${fmt(nd.sollEnd)} · ${plural(len)} (${days > 0 ? '+' : ''}${days} ${Math.abs(days) === 1 ? 'Tag' : 'Tage'})`;
            scheduleArrows(grid);
            return true;
        };
        b.onpointerdown = ev => {
            if (ev.button !== 0 || panel || drag)
                return;
            const edge = ev.target.dataset?.edge;
            const mode = edge === 's' ? 'start' : edge === 'e' ? 'end' : 'move';
            const dayW = grid.querySelector('.pl-dd')?.getBoundingClientRect().width || 30;
            drag = { taskId: t.id, mode, startX: ev.clientX, dayW, days: 0, moved: false, bar: b, pointerId: ev.pointerId, tip: null };
            b.setPointerCapture(ev.pointerId);
            b.focus();
            ev.preventDefault();
        };
        b.onpointermove = ev => {
            const d = drag;
            if (!d || d.bar !== b || ev.pointerId !== d.pointerId)
                return;
            const dx = ev.clientX - d.startX;
            if (!d.moved) {
                if (Math.abs(dx) < 4)
                    return;
                d.moved = true;
                b.classList.add('dragging');
                d.tip = el('div', 'pl-dragtip');
                d.tip.setAttribute('aria-hidden', 'true');
                root.append(d.tip);
            }
            const days = Math.round(dx / d.dayW);
            if (days !== d.days && preview(d, days))
                d.days = days;
            if (d.tip) {
                d.tip.style.left = `${ev.clientX + 14}px`;
                d.tip.style.top = `${ev.clientY - 34}px`;
                if (!d.tip.textContent)
                    preview(d, d.days);
            }
        };
        b.onpointerup = ev => {
            const d = drag;
            if (!d || d.bar !== b || ev.pointerId !== d.pointerId)
                return;
            drag = null;
            endDragVisual(d);
            if (!d.moved) {
                openEdit();
                return;
            }
            if (d.days === 0) {
                render();
                return;
            }
            commitSollMove(d.taskId, d.mode, d.days);
        };
        b.onpointercancel = () => { if (drag?.bar === b)
            cancelDrag(); };
        b.onlostpointercapture = () => { if (drag?.bar === b)
            cancelDrag(); };
        b.onkeydown = ev => {
            if (panel || drag)
                return;
            if (ev.key === 'Enter' || ev.key === ' ') {
                ev.preventDefault();
                openEdit();
                return;
            }
            if ((ev.ctrlKey || ev.metaKey) && !ev.altKey && ev.key.toLowerCase() === 'z') {
                if (moveNote?.before && !moveNote.error) {
                    ev.preventDefault();
                    undoSollMove();
                }
                return;
            }
            if (ev.key === 'ArrowUp' || ev.key === 'ArrowDown') {
                ev.preventDefault();
                const bars = Array.from(grid.querySelectorAll('.bar.soll'));
                bars[bars.indexOf(b) + (ev.key === 'ArrowDown' ? 1 : -1)]?.focus();
                return;
            }
            if (ev.key !== 'ArrowLeft' && ev.key !== 'ArrowRight')
                return;
            ev.preventDefault();
            const dir = ev.key === 'ArrowRight' ? 1 : -1;
            const mode = ev.altKey ? (ev.shiftKey ? 'start' : 'end') : 'move';
            const days = dir * (mode === 'move' && ev.shiftKey ? 7 : 1);
            const cur = state.tasks.find(x => x.id === t.id) ?? t, nd = (0, plan_ts_1.sollAfterDrag)(cur, mode, days);
            if (!(0, plan_ts_1.barOnAxis)(axis, nd.sollStart, nd.sollEnd)) {
                moveNote = { text: `${t.planKey}: Der Balken würde den sichtbaren Zeitraum verlassen. Zeitraum wechseln oder in der Bearbeitung ändern.`, error: true, focusId: t.id };
                announce(moveNote.text);
                returnFocus = `[data-soll="${t.id}"]`;
                render();
                return;
            }
            commitSollMove(t.id, mode, days);
        };
    }
    function dismissMoveNote() {
        const id = moveNote?.focusId ?? moveNote?.taskId;
        moveNote = null;
        if (id)
            returnFocus = `[data-soll="${id}"]`;
        render();
    }
    function drawMoveNote() {
        if (!moveNote)
            return null;
        const box = el('div', `pl-move${moveNote.error ? ' err' : ''}`);
        box.id = 'move-note';
        box.append(el('span', '', moveNote.text));
        if (moveNote.taskId && moveNote.before && !moveNote.error) {
            const u = withIcon(el('button', '', 'Rückgängig'), 'refresh');
            u.type = 'button';
            u.id = 'undo-move';
            u.onclick = undoSollMove;
            box.append(u);
        }
        const ok = withIcon(el('button', '', 'OK'), 'check');
        ok.type = 'button';
        ok.id = 'ok-move';
        ok.onclick = dismissMoveNote;
        box.append(ok);
        return box;
    }
    function drawGrid(axis) {
        const grid = el('div', 'pl-grid');
        grid.style.setProperty('--n', String(axis.length));
        grid.dataset.weeks = String(period.weeks);
        if (period.weeks > 5)
            grid.style.setProperty('--day', `${(0, period_ts_1.minDayWidth)(period.weeks)}px`);
        const visibleTasks = state.tasks.filter(x => (0, plan_ts_1.barOnAxis)(axis, x.sollStart, x.sollEnd));
        if (!visibleTasks.some(x => x.id === rovingId))
            rovingId = visibleTasks[0]?.id ?? '';
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
                const c = el('div', `pl-cell${d.weekend ? ' we' : ''}${d.today ? ' today' : ''}${d.weekday === 0 ? ' mon' : ''}${kind === 'sec' ? ' secbg' : ''}`);
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
            const k = el('div', 'pl-kw');
            k.title = `KW ${axis[i].kw}`;
            k.append(el('span', 'kwp', 'KW '), String(axis[i].kw));
            if (j - i >= 6)
                k.append(el('span', 'rng', `${short(axis[i].date)}–${short(axis[j].date)}`));
            k.style.gridRow = '1';
            k.style.gridColumn = `${i + 2} / span ${j - i + 1}`;
            grid.append(k);
            i = j + 1;
        }
        for (const [n, d] of axis.entries()) {
            const dd = el('div', `pl-dd${d.weekend ? ' we' : ''}${d.today ? ' today' : ''}${d.weekday === 0 ? ' mon' : ''}`);
            dd.dataset.date = d.date;
            dd.append(el('span', 'wd', ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'][d.weekday]), '\n', el('span', 'dn', String(+d.date.slice(8))));
            dd.style.gridRow = '2';
            dd.style.gridColumn = String(n + 2);
            if (d.today)
                dd.title = 'Heute';
            grid.append(dd);
        }
        cellRow(row++, l => { l.textContent = 'Leistungen'; }, 'sec');
        for (const t of state.tasks) {
            const r = row++;
            const soll = (0, plan_ts_1.barOnAxis)(axis, t.sollStart, t.sollEnd);
            const istBar = t.istStart ? (0, plan_ts_1.barOnAxis)(axis, t.istStart, t.istEnd || TODAY) : null;
            cellRow(r, l => {
                const b = el('button', 'taskbtn', `${t.planKey} · ${t.title}`);
                b.type = 'button';
                b.title = 'Ereignis aus diesem Planvorgang erzeugen';
                b.dataset.task = t.id;
                b.onclick = () => openPanel(eventCreateSpec(t.id));
                const eb = withIcon(el('button', 'quiet icon-only'), 'pencil');
                eb.type = 'button';
                eb.title = 'Planvorgang bearbeiten';
                eb.setAttribute('aria-label', `Planvorgang ${t.planKey} bearbeiten`);
                eb.onclick = () => openPanel(taskEditSpec(t.id));
                const nm = el('span', 'nm');
                nm.append(b, eb);
                l.append(nm, el('small', '', [state.objekte.find(o => o.id === t.objektId)?.name ?? 'ohne Objekt', t.level, t.area, t.lvRef].filter(Boolean).join(' · ')), el('small', '', `Soll ${short(t.sollStart)}–${short(t.sollEnd)}${t.requiredHeads ? ` · Besetzung ${t.requiredHeads} Pers.` : ''}${t.istStart ? ` · Fortschritt ${t.progress} %` : ''}${!soll && !istBar ? ' · außerhalb des Zeitraums' : ''}`));
            }, 'task', t.id);
            if (soll) {
                const b = el('div', 'bar soll');
                b.dataset.soll = t.id;
                b.dataset.clipS = String(soll.clippedStart);
                b.dataset.clipE = String(soll.clippedEnd);
                b.title = `Soll ${fmt(t.sollStart)} – ${fmt(t.sollEnd)}`;
                place(b, soll, r);
                makeSollInteractive(b, t, soll, axis, grid);
                grid.append(b);
            }
            if (t.istStart) {
                const ist = istBar;
                if (ist) {
                    const b = el('div', 'bar ist');
                    b.title = `Ist ab ${fmt(t.istStart)}${t.istEnd ? ` bis ${fmt(t.istEnd)}` : ' (läuft)'}`;
                    b.setAttribute('role', 'img');
                    b.setAttribute('aria-label', `${t.planKey} ${b.title}`);
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
                b.setAttribute('role', 'img');
                b.setAttribute('aria-label', `${r.label}: ${b.title}`);
                place(b, bar, rr);
                grid.append(b);
            }
            for (const c of conflicts.filter(x => x.resourceId === r.id)) {
                const bar = (0, plan_ts_1.barOnAxis)(axis, c.from, c.to);
                if (!bar)
                    continue;
                const b = el('div', 'bar res doppelt');
                if (bar.span >= 3) {
                    const chip = el('span', 'dbl-chip', 'doppelt');
                    chip.setAttribute('aria-hidden', 'true');
                    b.append(chip);
                }
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
            const bar = (0, plan_ts_1.barOnAxis)(axis, e.from, e.to || axis[axis.length - 1].date);
            cellRow(rr, l => { l.append(el('span', 'nm', e.title), el('small', '', `zu ${e.snapshot.planKey} · ab ${short(e.from)}${e.to ? ` bis ${short(e.to)}` : ' · dauert an'}${bar ? '' : ' · außerhalb des Zeitraums'}`)); });
            if (bar) {
                const b = el('div', `bar event${e.to ? '' : ' open'}`, bar.span >= 3 ? (e.to ? 'Störung' : 'Störung dauert an') : '');
                b.title = `${e.nummer} · ${e.title}`;
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
        lg.append(el('span', 'it hint', 'Wochenende hinterlegt · Linie = heute · Planvorgang anklicken, um ein Ereignis zu erzeugen · Soll-Balken: anklicken bearbeitet, ziehen verschiebt, an den Rändern ziehen ändert Beginn oder Ende (ganze Tage; Nachfolger bleiben stehen)'));
        return lg;
    }
    function card(title, id, parts = {}) {
        const sec = el('section', 'pl-card');
        sec.id = id;
        sec.setAttribute('aria-labelledby', `${id}-h`);
        const head = el('header', 'pl-card-head');
        const h = el('h2', '', title);
        h.id = `${id}-h`;
        head.append(h);
        if (parts.head)
            head.append(parts.head);
        const body = el('div', 'pl-card-body');
        sec.append(head, body);
        if (parts.foot) {
            parts.foot.classList.add('pl-card-foot');
            sec.append(parts.foot);
        }
        return { sec, body };
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
        for (const u of (0, plan_ts_1.findUnderstaffing)(state)) {
            const li = el('li', 'finding understaffed');
            li.append(el('span', 'tag warn', 'Unterbesetzung'), `${u.planKey}: ${fmt(u.from)} bis ${fmt(u.to)} (${plural(u.days)}), Soll-Besetzung ${u.required}, geplant ab ${u.minAssigned} Personen, bis zu ${u.required - u.minAssigned} fehlen`);
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
                const rm = withIcon(el('button', 'quiet', 'Entfernen'), 'trash');
                rm.type = 'button';
                rm.setAttribute('aria-label', `Abhängigkeit ${depText(d)} entfernen`);
                rm.onclick = () => { const before = state, text = `Abhängigkeit ${depText(d)} entfernt.`; state = (0, plan_ts_1.removeDependency)(state, d.id); returnFocus = '#open-dep'; render(); showToast(text, [undoAction(before, `${text} Rückgängig gemacht.`, '#open-dep')]); };
                act.append(rm);
                tr.append(act);
                t.append(tr);
            }
            const tw = el('div', 'tw');
            tw.append(t);
            wrap.append(tw);
        }
        return wrap;
    }
    function drawCheckActions() {
        const bar = el('div', 'pl-card-actions');
        const bd = withIcon(el('button', '', 'Abhängigkeit anlegen'), 'plus');
        bd.type = 'button';
        bd.id = 'open-dep';
        bd.onclick = () => openPanel(dependencyCreateSpec());
        bar.append(bd);
        return bar;
    }
    function drawLoad() {
        const wrap = el('div');
        const tabs = el('div', 'seg');
        tabs.setAttribute('role', 'group');
        tabs.setAttribute('aria-label', 'Ansicht der Wochenübersicht');
        for (const [v, text] of [['personal', 'Personal'], ['objekte', 'Objekte']]) {
            const b = el('button', 'segbtn', text);
            b.type = 'button';
            b.dataset.view = v;
            b.setAttribute('aria-pressed', String(dispoView === v));
            b.onclick = () => { dispoView = v; render(); };
            tabs.append(b);
        }
        const weeks = (0, period_ts_1.rangeOf)(period).weekStarts;
        const t = el('table');
        t.id = 'dispo';
        t.dataset.view = dispoView;
        t.style.setProperty('--n', String(weeks.length));
        const head = el('tr');
        head.append(el('th', '', dispoView === 'personal' ? 'Kolonne / Gerät' : 'Objekt'));
        for (const w of weeks)
            head.append(el('th', '', `KW ${(0, plan_ts_1.isoWeek)(w)}`));
        t.append(head);
        const resLabel = (id) => state.resources.find(x => x.id === id).label;
        if (dispoView === 'personal') {
            for (const row of (0, plan_ts_1.weeklyDisposition)(state, weeks)) {
                const tr = el('tr');
                tr.append(el('td', '', resLabel(row.resourceId)));
                for (const w of row.weeks) {
                    const label = w.status === 'doppelt' ? 'doppelt belegt' : w.status === 'frei' ? 'frei' : w.freeDays > 0 ? `teilweise frei (${w.freeDays} ${w.freeDays === 1 ? 'Arbeitstag' : 'Arbeitstage'})` : 'verplant';
                    const td = el('td', `cell ${w.status}`, label);
                    if (w.taskIds.length)
                        td.append(el('small', 'cell-tasks', w.taskIds.map(key).join(', ')));
                    tr.append(td);
                }
                t.append(tr);
            }
        }
        else {
            for (const row of (0, plan_ts_1.dispositionByObjekt)(state, weeks)) {
                const tr = el('tr');
                tr.append(el('td', '', row.name));
                for (const w of row.weeks) {
                    const status = w.entries.some(e => e.status === 'doppelt') ? 'doppelt' : w.entries.length ? 'verplant' : 'frei';
                    const td = el('td', `cell ${status}`);
                    if (!w.entries.length)
                        td.textContent = 'keine Einsätze';
                    for (const e of w.entries)
                        td.append(el('small', `cell-tasks${e.status === 'doppelt' ? ' dbl' : ''}`, `${resLabel(e.resourceId)} · ${e.taskIds.map(key).join(', ')}${e.status === 'doppelt' ? ' (doppelt belegt)' : ''}`));
                    tr.append(td);
                }
                t.append(tr);
            }
        }
        const tw = el('div', 'tw wide');
        tw.append(t);
        wrap.append(tw);
        return { tabs, table: wrap };
    }
    const STATUS_LIST = ['geplant', 'in Arbeit', 'in Prüfung', 'ausgeführt'];
    const RESOURCE_TYPES = [['kolonne', 'Kolonne'], ['mitarbeiter', 'Mitarbeiter'], ['geraet', 'Gerät']];
    function field(f, label, control) { const l = el('label', '', label); l.append(control); f.append(l); }
    function input(name, type = 'text', value = '') { const i = el('input'); i.name = name; i.type = type; i.value = value; return i; }
    function select(name, opts, value = '') {
        const s = el('select');
        s.name = name;
        for (const [v, t] of opts) {
            const o = el('option', '', t);
            o.value = v;
            s.append(o);
        }
        if (opts.some(([v]) => v === value))
            s.value = value;
        return s;
    }
    const objektOptions = () => [['', 'ohne Objekt'], ...state.objekte.map(o => [o.id, o.name])];
    const drafts = {};
    const saveDraft = (f, id) => {
        const d = {};
        for (const e of Array.from(f.elements))
            if (e.name)
                d[e.name] = e.value;
        drafts[id] = d;
    };
    const restoreDraft = (f, id) => {
        const d = drafts[id];
        if (!d)
            return;
        for (const e of Array.from(f.elements))
            if (e.name && e.name in d)
                e.value = d[e.name];
    };
    const val = (f, n) => f.elements.namedItem(n).value;
    function openPanel(spec) {
        moveNote = null;
        panel = spec;
        planError = '';
        confirmDiscard = false;
        panelEnter = true;
        focusTarget = 'panel';
        render();
    }
    function switchPanel(spec) {
        panel = spec;
        planError = '';
        confirmDiscard = false;
        panelEnter = false;
        focusTarget = 'panel';
        render();
    }
    function fieldControl(f) {
        if (f.kind === 'select')
            return select(f.name, f.options ?? [], f.value ?? '');
        if (f.kind === 'textarea') {
            const t = el('textarea');
            t.name = f.name;
            t.rows = 2;
            t.value = f.value ?? '';
            if (f.placeholder)
                t.placeholder = f.placeholder;
            return t;
        }
        const c = input(f.name, f.kind, f.value ?? '');
        if (f.min !== undefined)
            c.min = f.min;
        if (f.max !== undefined)
            c.max = f.max;
        if (f.step !== undefined)
            c.step = f.step;
        if (f.placeholder)
            c.placeholder = f.placeholder;
        if (f.required)
            c.required = true;
        return c;
    }
    const initialValue = (f) => {
        if (f.kind !== 'select')
            return f.value ?? '';
        const o = f.options ?? [];
        return o.some(([v]) => v === f.value) ? f.value : (o[0]?.[0] ?? '');
    };
    function isDirty() {
        const f = root.querySelector('#edit-form');
        if (!panel || !f)
            return false;
        return panel.fields.some(fd => { const c = f.elements.namedItem(fd.name); return c ? c.value !== initialValue(fd) : false; });
    }
    function buildPanelForm(spec) {
        const f = el('form', 'frm panel-form');
        f.id = 'edit-form';
        f.dataset.panel = spec.kind;
        if (spec.intro) {
            const note = el('p', 'snap', spec.intro);
            note.style.gridColumn = '1 / -1';
            f.append(note);
        }
        let box = null, boxGroup = '';
        for (const fd of spec.fields) {
            let target = f;
            if (fd.group) {
                if (!box || boxGroup !== fd.group) {
                    box = el('fieldset', 'assess');
                    box.style.gridColumn = '1 / -1';
                    box.append(el('legend', '', fd.group));
                    f.append(box);
                    boxGroup = fd.group;
                }
                target = box;
            }
            else
                box = null;
            field(target, fd.label, fieldControl(fd));
        }
        restoreDraft(f, spec.draftKey);
        if (planError) {
            const e = el('p', 'err', planError);
            e.setAttribute('role', 'alert');
            e.tabIndex = -1;
            e.style.gridColumn = '1 / -1';
            f.append(e);
        }
        if (spec.actions?.length) {
            const acts = el('div', 'row');
            acts.style.gridColumn = '1 / -1';
            for (const a of spec.actions) {
                const b = withIcon(el('button', 'quiet', a.label), 'plus');
                b.type = 'button';
                b.id = a.id;
                b.onclick = () => { saveDraft(f, spec.draftKey); switchPanel(a.open()); };
                acts.append(b);
            }
            f.append(acts);
        }
        const ok = withIcon(el('button', 'primary', spec.submitLabel), spec.kind.endsWith('-create') ? 'plus' : 'check');
        ok.type = 'submit';
        const cancel = el('button', '', 'Abbrechen');
        cancel.type = 'button';
        cancel.onclick = requestClose;
        const row = el('div', 'row');
        row.append(ok, cancel);
        row.style.gridColumn = '1 / -1';
        f.append(row);
        f.onsubmit = ev => {
            ev.preventDefault();
            saveDraft(f, spec.draftKey);
            const before = state;
            try {
                spec.submit(n => val(f, n));
            }
            catch (x) {
                planError = x instanceof Error ? x.message : String(x);
                focusTarget = 'error';
                render();
                return;
            }
            delete drafts[spec.draftKey];
            if (spec.back) {
                switchPanel(spec.back());
                return;
            }
            returnFocus = spec.opener;
            panel = null;
            planError = '';
            render();
            toastAfterSave(spec.kind, before);
        };
        return f;
    }
    function requestClose() {
        if (!panel)
            return;
        const f = root.querySelector('#edit-form');
        if (!confirmDiscard && f && isDirty()) {
            saveDraft(f, panel.draftKey);
            confirmDiscard = true;
            focusTarget = 'confirm';
            render();
            return;
        }
        closePanelNow();
    }
    function closePanelNow() {
        const spec = panel;
        if (!spec)
            return;
        delete drafts[spec.draftKey];
        confirmDiscard = false;
        planError = '';
        if (spec.back) {
            switchPanel(spec.back());
            return;
        }
        returnFocus = spec.opener;
        panel = null;
        render();
    }
    function drawPanel() {
        if (!panel)
            return null;
        const spec = panel;
        const wrap = el('div', 'pl-panel-wrap');
        const scrim = el('div', 'pl-scrim');
        scrim.onclick = requestClose;
        const aside = el('aside', `pl-panel${panelEnter ? ' enter' : ''}`);
        aside.id = 'edit-panel';
        aside.setAttribute('role', 'dialog');
        aside.setAttribute('aria-modal', 'true');
        aside.setAttribute('aria-labelledby', 'edit-title');
        const head = el('header', 'pl-panel-head');
        const h = el('h2', '', spec.title);
        h.id = 'edit-title';
        const x = withIcon(el('button', 'quiet', 'Schließen'), 'x');
        x.type = 'button';
        x.setAttribute('aria-label', spec.closeLabel ?? 'Bearbeiten schließen');
        x.onclick = requestClose;
        head.append(h, x);
        aside.append(head);
        if (session.info.status === 'conflict' || session.info.status === 'error') {
            const b = el('div');
            fillSync(b, session.info);
            aside.append(b);
        }
        if (confirmDiscard) {
            const c = el('div', 'pl-confirm');
            c.id = 'discard-confirm';
            c.setAttribute('role', 'alert');
            c.append(el('span', '', 'Ungespeicherte Eingaben verwerfen?'));
            const keep = el('button', 'primary', 'Weiter bearbeiten');
            keep.type = 'button';
            keep.id = 'discard-no';
            keep.onclick = () => { confirmDiscard = false; focusTarget = 'panel'; render(); };
            const drop = el('button', '', 'Verwerfen');
            drop.type = 'button';
            drop.id = 'discard-yes';
            drop.onclick = closePanelNow;
            c.append(keep, drop);
            aside.append(c);
        }
        aside.append(spec.view ? spec.view() : buildPanelForm(spec));
        wrap.append(scrim, aside);
        panelEnter = false;
        return wrap;
    }
    const planKeyOpener = (planKey) => `button[aria-label="Planvorgang ${planKey} bearbeiten"]`;
    function taskEditSpec(taskId) {
        const t = state.tasks.find(x => x.id === taskId);
        return {
            kind: 'task-edit', draftKey: `edit:${t.id}`, title: `Planvorgang bearbeiten: ${t.planKey}`, submitLabel: 'Speichern', opener: planKeyOpener(t.planKey),
            intro: 'Nachfolger, Zuordnungen und bestehende Ereignisse werden nicht verschoben; die Abhängigkeitsprüfung zeigt nur, was nicht mehr passt. Der Planschlüssel bleibt unverändert.',
            fields: [
                { name: 'title', label: 'Titel', kind: 'text', value: t.title },
                { name: 'objekt', label: 'Objekt', kind: 'select', options: objektOptions(), value: t.objektId },
                { name: 'area', label: 'Bereich', kind: 'text', value: t.area },
                { name: 'level', label: 'Ebene', kind: 'text', value: t.level },
                { name: 'lvRef', label: 'LV-Bezug', kind: 'text', value: t.lvRef },
                { name: 'sollStart', label: 'Soll-Beginn', kind: 'date', value: t.sollStart },
                { name: 'sollEnd', label: 'Soll-Ende', kind: 'date', value: t.sollEnd },
                { name: 'istStart', label: 'Ist-Beginn', kind: 'date', value: t.istStart },
                { name: 'istEnd', label: 'Ist-Ende', kind: 'date', value: t.istEnd },
                { name: 'progress', label: 'Fortschritt (%)', kind: 'number', value: String(t.progress), min: '0', max: '100', step: '1' },
                { name: 'required', label: 'Soll-Besetzung (Personen, 0 = offen)', kind: 'number', value: String(t.requiredHeads), min: '0', step: '1' },
                { name: 'status', label: 'Status', kind: 'select', options: STATUS_LIST.map(x => [x, x]), value: t.status },
            ],
            actions: [
                { id: 'task-add-assign', label: 'Zuordnung hinzufügen', open: () => ({ ...assignmentCreateSpec(t.id), back: () => taskEditSpec(t.id) }) },
                { id: 'task-add-dep', label: 'Abhängigkeit hinzufügen', open: () => ({ ...dependencyCreateSpec(t.id), back: () => taskEditSpec(t.id) }) },
            ],
            submit: v => {
                state = (0, plan_ts_1.updateTask)(state, t.id, {
                    title: v('title'), objektId: v('objekt'), area: v('area'), level: v('level'), lvRef: v('lvRef'),
                    sollStart: v('sollStart'), sollEnd: v('sollEnd'), istStart: v('istStart'), istEnd: v('istEnd'),
                    progress: Number(v('progress')), requiredHeads: Number(v('required')), status: v('status'),
                });
            },
        };
    }
    function taskCreateSpec() {
        return {
            kind: 'task-create', draftKey: 'create:task', title: 'Planvorgang anlegen', submitLabel: 'Anlegen', opener: '#open-task',
            intro: 'Ein neuer Planvorgang verschiebt nichts im bestehenden Plan. Der Planschlüssel wird vorgeschlagen und kann geändert werden.',
            fields: [
                { name: 'planKey', label: 'Planschlüssel', kind: 'text', value: (0, plan_ts_1.suggestPlanKey)(state) },
                { name: 'title', label: 'Titel', kind: 'text' },
                { name: 'objekt', label: 'Objekt', kind: 'select', options: objektOptions() },
                { name: 'area', label: 'Bereich', kind: 'text' },
                { name: 'level', label: 'Ebene', kind: 'text' },
                { name: 'lvRef', label: 'LV-Bezug', kind: 'text' },
                { name: 'sollStart', label: 'Soll-Beginn', kind: 'date' },
                { name: 'sollEnd', label: 'Soll-Ende', kind: 'date' },
                { name: 'required', label: 'Soll-Besetzung (Personen, 0 = offen)', kind: 'number', value: '0', min: '0', step: '1' },
            ],
            submit: v => {
                state = (0, plan_ts_1.addTask)(state, { planKey: v('planKey').trim(), title: v('title'), objektId: v('objekt'), area: v('area'), level: v('level'), lvRef: v('lvRef'), sollStart: v('sollStart'), sollEnd: v('sollEnd'), requiredHeads: Number(v('required')) });
            },
        };
    }
    function resourceCreateSpec() {
        return {
            kind: 'resource-create', draftKey: 'create:resource', title: 'Ressource anlegen', submitLabel: 'Anlegen', opener: '#open-res',
            intro: 'Eine Kolonne (mit Köpfen) oder ein Gerät, das Planvorgängen zugeordnet werden kann.',
            fields: [
                { name: 'type', label: 'Art', kind: 'select', options: RESOURCE_TYPES },
                { name: 'label', label: 'Bezeichnung', kind: 'text' },
                { name: 'heads', label: 'Köpfe', kind: 'number', value: '1', min: '1', step: '1' },
            ],
            submit: v => { state = (0, plan_ts_1.addResource)(state, v('type'), v('label'), Number(v('heads'))); },
        };
    }
    function assignmentCreateSpec(taskId) {
        return {
            kind: 'assignment-create', draftKey: 'create:assignment', title: 'Zuordnung anlegen', submitLabel: 'Zuordnen', opener: '#open-assign',
            intro: 'Ordnet eine Ressource einem Planvorgang für einen Zeitraum zu. Doppelbelegung wird nur angezeigt, nicht verhindert.',
            fields: [
                { name: 'task', label: 'Planvorgang', kind: 'select', options: state.tasks.map(t => [t.id, `${t.planKey} · ${t.title}`]), value: taskId },
                { name: 'res', label: 'Ressource', kind: 'select', options: state.resources.map(r => [r.id, r.label]) },
                { name: 'from', label: 'Von', kind: 'date' },
                { name: 'to', label: 'Bis', kind: 'date' },
                { name: 'hours', label: 'Planstunden', kind: 'number', value: '0', min: '0', step: '1' },
            ],
            submit: v => { state = (0, plan_ts_1.assign)(state, v('task'), v('res'), v('from'), v('to'), Number(v('hours'))); },
        };
    }
    function drawPlanActions() {
        const bar = el('div', 'pl-card-actions');
        const bTask = withIcon(el('button', '', 'Planvorgang anlegen'), 'plus');
        bTask.type = 'button';
        bTask.id = 'open-task';
        bTask.onclick = () => openPanel(taskCreateSpec());
        const bRes = withIcon(el('button', '', 'Ressource anlegen'), 'plus');
        bRes.type = 'button';
        bRes.id = 'open-res';
        bRes.onclick = () => openPanel(resourceCreateSpec());
        bar.append(bTask, bRes);
        return bar;
    }
    function drawAssignmentsCard() {
        const bAsg = withIcon(el('button', '', 'Zuordnung anlegen'), 'plus');
        bAsg.type = 'button';
        bAsg.id = 'open-assign';
        bAsg.onclick = () => openPanel(assignmentCreateSpec());
        const actions = el('div', 'pl-card-actions');
        actions.append(bAsg);
        const { sec, body } = card('Zuordnungen', 'card-assign', { foot: actions });
        if (!state.assignments.length) {
            body.append(el('p', 'empty', 'Noch keine Zuordnungen.'));
            return sec;
        }
        const t = el('table');
        t.id = 'assignments';
        const head = el('tr');
        for (const h of ['Ressource', 'Planvorgang', 'Zeitraum', ''])
            head.append(el('th', '', h));
        t.append(head);
        for (const a of state.assignments) {
            const tr = el('tr');
            const r = state.resources.find(x => x.id === a.resourceId);
            tr.append(el('td', '', r?.label ?? '?'), el('td', '', key(a.taskId)), el('td', '', `${fmt(a.from)} bis ${fmt(a.to)}`));
            const act = el('td');
            const rm = withIcon(el('button', 'quiet', 'Entfernen'), 'trash');
            rm.type = 'button';
            rm.setAttribute('aria-label', `Zuordnung ${r?.label ?? ''} zu ${key(a.taskId)} entfernen`);
            rm.onclick = () => { const before = state, text = `Zuordnung ${r?.label ?? ''} → ${key(a.taskId)} entfernt.`; state = (0, plan_ts_1.removeAssignment)(state, a.id); returnFocus = '#open-assign'; render(); showToast(text, [undoAction(before, `${text} Rückgängig gemacht.`, '#open-assign')]); };
            act.append(rm);
            tr.append(act);
            t.append(tr);
        }
        const tw = el('div', 'tw');
        tw.append(t);
        body.append(tw);
        return sec;
    }
    function dependencyCreateSpec(predId) {
        const tasks = state.tasks.map(t => [t.id, `${t.planKey} · ${t.title}`]);
        const pred = predId ?? tasks[0]?.[0];
        const succ = tasks.find(([id]) => id !== pred)?.[0] ?? pred;
        return {
            kind: 'dependency-create', draftKey: 'create:dependency', title: 'Abhängigkeit anlegen', submitLabel: 'Hinzufügen', opener: '#open-dep',
            intro: 'Die Abhängigkeit wird nur gegen die Soll-Termine geprüft. Es wird nichts verschoben.',
            fields: [
                { name: 'pred', label: 'Vorgänger', kind: 'select', options: tasks, value: pred },
                { name: 'succ', label: 'Nachfolger', kind: 'select', options: tasks, value: succ },
                { name: 'type', label: 'Typ', kind: 'select', options: Object.keys(TYPE_LABEL).map(k => [k, `${TYPE_LABEL[k]} (${k})`]) },
                { name: 'lag', label: 'Versatz (Kalendertage)', kind: 'number', value: '0', step: '1' },
            ],
            submit: v => { state = (0, plan_ts_1.addDependency)(state, v('pred'), v('succ'), v('type'), Number(v('lag'))); },
        };
    }
    const plain = (vals) => vals.map(v => [v, v]);
    const withBlank = (vals) => [['', '– nicht angegeben'], ...plain(vals)];
    const ASSESS_GROUP = 'Einschätzung (optional, nur Kategorien, keine Rechtsfolge)';
    function assessmentFields(init) {
        const nw = init?.nachweise[0];
        const fs = [
            { name: 'wirkung', label: 'Wirkung', kind: 'select', options: plain(plan_ts_1.WIRKUNGEN), value: init?.wirkung ?? 'noch nicht beurteilt' },
            { name: 'vorh', label: 'Ausweichmöglichkeit vorhanden', kind: 'select', options: plain(plan_ts_1.VORHANDEN_WERTE), value: init?.ausweichmoeglichkeit.vorhanden ?? 'Unklar' },
            { name: 'aBesch', label: 'Ausweichmöglichkeit: Beschreibung', kind: 'textarea', value: init?.ausweichmoeglichkeit.beschreibung ?? '' },
            { name: 'genutzt', label: 'Ausweichmöglichkeit genutzt', kind: 'select', options: withBlank(plan_ts_1.GENUTZT_WERTE), value: init?.ausweichmoeglichkeit.genutzt ?? '' },
            { name: 'moeglich', label: 'Gegenmaßnahme möglich', kind: 'select', options: withBlank(plan_ts_1.JA_NEIN_WERTE), value: init?.gegenmassnahme.moeglich ?? '' },
            { name: 'gBesch', label: 'Gegenmaßnahme: Beschreibung', kind: 'textarea', value: init?.gegenmassnahme.beschreibung ?? '' },
            { name: 'durch', label: 'Gegenmaßnahme durchgeführt', kind: 'select', options: withBlank(plan_ts_1.JA_NEIN_WERTE), value: init?.gegenmassnahme.durchgefuehrt ?? '' },
            { name: 'wirksam', label: 'Gegenmaßnahme wirksam', kind: 'select', options: withBlank(plan_ts_1.JA_NEIN_WERTE), value: init?.gegenmassnahme.wirksam ?? '' },
            { name: 'nArt', label: 'Nachweis (synthetisch)', kind: 'select', options: withBlank(plan_ts_1.NACHWEIS_ARTEN), value: nw?.art ?? '' },
            { name: 'nBez', label: 'Nachweis: Bezeichnung (Text, kein Dateibezug)', kind: 'text', value: nw?.bezeichnung ?? '' },
        ];
        return fs.map(f => ({ ...f, group: ASSESS_GROUP }));
    }
    const readAssessment = (v) => ({
        wirkung: v('wirkung'),
        ausweichmoeglichkeit: { vorhanden: v('vorh'), beschreibung: v('aBesch'), genutzt: v('genutzt') },
        gegenmassnahme: { moeglich: v('moeglich'), beschreibung: v('gBesch'), durchgefuehrt: v('durch'), wirksam: v('wirksam') },
        nachweise: v('nArt') || v('nBez').trim() ? [{ art: (v('nArt') || plan_ts_1.NACHWEIS_ARTEN[plan_ts_1.NACHWEIS_ARTEN.length - 1]), bezeichnung: v('nBez') }] : [],
    });
    function eventCreateSpec(taskId) {
        const pick = taskId === undefined;
        const t = state.tasks.find(x => x.id === (taskId ?? state.tasks[0]?.id));
        return {
            kind: 'event-create', draftKey: pick ? 'event:new' : `event:${t.id}`, title: pick ? 'Ereignis anlegen' : `Ereignis aus ${t.planKey} · ${t.title}`, submitLabel: 'Ereignis anlegen', opener: pick ? '#open-event' : `.taskbtn[data-task="${t.id}"]`,
            intro: (pick ? 'Ein Ereignis gehört zu einem Planvorgang. Dessen Soll-Daten und die zugeordneten Ressourcen werden als Momentaufnahme übernommen.' : `Die Soll-Daten werden als Momentaufnahme übernommen: ${t.level}, ${t.area}, ${t.lvRef}, ${fmt(t.sollStart)} – ${fmt(t.sollEnd)} und die zugeordneten Ressourcen.`) + ' Die Ereignis-ID wird automatisch vergeben (EV-Kostenstelle-Beginn als JJJJMMTT-laufende Nummer) und nie von Hand eingetragen oder geändert.',
            fields: [
                ...(pick ? [{ name: 'task', label: 'Planvorgang', kind: 'select', options: state.tasks.map(x => [x.id, `${x.planKey} · ${x.title}`]), value: t.id }] : []),
                { name: 'title', label: 'Titel', kind: 'text', placeholder: 'z. B. Vorleistung fehlt (fiktiv)', required: true },
                { name: 'from', label: 'Beginn', kind: 'date', value: TODAY, required: true },
                { name: 'ist', label: 'Ist-Zustand', kind: 'textarea' },
                { name: 'ursache', label: 'Ursache', kind: 'textarea' },
                ...assessmentFields(),
            ],
            submit: v => { state = (0, plan_ts_1.createEventFromTask)(state, pick ? v('task') : t.id, { title: v('title'), from: v('from'), istZustand: v('ist'), ursache: v('ursache'), ...readAssessment(v) }, TODAY).state; },
        };
    }
    function assessSpec(eventId) {
        const e = state.events.find(x => x.id === eventId);
        return {
            kind: 'event-assess', draftKey: `assess:${e.id}`, title: `Einschätzung zu: ${e.title}`, submitLabel: 'Einschätzung speichern', opener: `button[data-assess="${e.id}"]`,
            intro: 'Es werden nur die Einschätzungsfelder geändert. Soll-Momentaufnahme, Termine und Abhängigkeiten bleiben unverändert; kein Termin wird verschoben.',
            fields: assessmentFields(e),
            submit: v => { state = (0, plan_ts_1.assessEvent)(state, e.id, readAssessment(v)); },
        };
    }
    function letterSpec(eventId) {
        return {
            kind: 'letter-view', draftKey: `letter:${eventId}`, title: 'Behinderungsanzeige-Entwurf (nur Ansicht)', submitLabel: '', fields: [],
            opener: `button[data-letter="${eventId}"]`, closeLabel: 'Entwurf schließen', submit: () => undefined,
            view: () => drawLetter(eventId),
        };
    }
    function drawLetter(eventId) {
        const box = el('section', 'pl-letter');
        box.id = 'letter-panel';
        const draft = (0, from_plan_event_ts_1.createDraftFromPlanEvent)(state, eventId, '');
        if (!draft) {
            box.append(el('p', 'empty', 'Zu diesem Ereignis ist kein Entwurf möglich.'));
            return box;
        }
        const l = (0, behinderungsanzeige_ts_1.buildBehinderungsanzeige)(draft);
        box.append(el('p', 'snap', 'Aus dem Ereignis übernommen werden nur erfasste Tatsachen. Fristen, Datum, Empfänger und Bestätigungsfrist werden nicht berechnet und bleiben offen. Die Einschätzung (Wirkung, Ausweichmöglichkeit, Gegenmaßnahme) steht nicht im Schreiben. Nichts wird gespeichert oder versendet.'));
        box.append(el('strong', '', l.title), el('p', '', l.intro));
        const reasons = el('ul', 'list');
        for (const r of l.reasons)
            reasons.append(el('li', '', r));
        if (l.reasons.length)
            box.append(reasons);
        const det = el('p', 'letter-details', l.details);
        det.style.whiteSpace = 'pre-line';
        box.append(det);
        box.append(el('p', 'muted', l.periods.map(([label, value, unit]) => `${label}: ${value || '…'} ${unit}`).join(' · ')));
        if (l.hints.length)
            box.append(el('p', 'muted', `Noch offen: ${l.hints.join(' · ')}`));
        for (const n of l.notes)
            box.append(el('p', 'muted', n));
        return box;
    }
    function drawChain(e) {
        const ol = el('ol', 'chain');
        ol.setAttribute('aria-label', `Fallkette zu: ${e.title}`);
        for (const st of (0, event_chain_ts_1.eventChain)(state, e.id)) {
            const li = el('li', 'chain-step');
            li.dataset.stage = st.id;
            li.dataset.state = st.state;
            const label = el('span', 'chain-label', st.label);
            label.append(el('span', 'sr-only', ` – ${event_chain_ts_1.stateText[st.state]}`));
            li.append(label);
            if (st.action === 'task') {
                const b = el('button', 'chain-link chain-value', st.value);
                b.type = 'button';
                b.dataset.chainTask = e.taskId;
                b.setAttribute('aria-label', `Planvorgang ${st.value} öffnen`);
                b.onclick = () => openPanel(taskEditSpec(e.taskId));
                li.append(b);
            }
            else
                li.append(el('span', 'chain-value', st.value));
            if (st.detail)
                li.append(el('span', 'chain-detail', st.detail));
            ol.append(li);
        }
        return ol;
    }
    function drawEvents() {
        if (!state.events.length)
            return el('p', 'empty', 'Noch keine Ereignisse.');
        const ul = el('ul', 'evt-list');
        ul.id = 'events';
        for (const e of state.events) {
            const li = el('li', 'evt-card');
            li.dataset.event = e.id;
            const head = el('div', 'evt-card-head');
            head.append(el('strong', '', e.title), el('span', 'muted', `${e.snapshot.planKey} · ab ${fmt(e.from)}${e.to ? ` bis ${fmt(e.to)}` : ' · dauert an'}`));
            li.append(head);
            li.append(drawChain(e));
            const after = (0, plan_ts_1.downstreamTasks)(state, e.taskId);
            if (after.length)
                li.append(el('p', 'evt-note', `Nachfolger im Plan (zu prüfen): ${after.map(x => x.planKey).join(', ')}`));
            const acts = el('div', 'pl-card-actions evt-card-actions');
            const ab = withIcon(el('button', '', 'Einschätzung bearbeiten'), 'clipboard');
            ab.type = 'button';
            ab.dataset.assess = e.id;
            ab.setAttribute('aria-label', `Einschätzung bearbeiten: ${e.title}`);
            ab.onclick = () => openPanel(assessSpec(e.id));
            acts.append(ab);
            const lb = withIcon(el('button', '', 'Behinderungsanzeige-Entwurf'), 'file');
            lb.type = 'button';
            lb.dataset.letter = e.id;
            lb.setAttribute('aria-label', `Behinderungsanzeige-Entwurf: ${e.title}`);
            lb.onclick = () => openPanel(letterSpec(e.id));
            acts.append(lb);
            if (!e.to) {
                const rb = withIcon(el('button', '', 'Wiederaufnahme heute'), 'play');
                rb.type = 'button';
                rb.setAttribute('aria-label', `Wiederaufnahme heute: ${e.title}`);
                rb.onclick = () => { state = (0, plan_ts_1.endEvent)(state, e.id, TODAY); render(); };
                acts.append(rb);
            }
            li.append(acts);
            ul.append(li);
        }
        return ul;
    }
    function drawEventActions() {
        const bar = el('div', 'pl-card-actions');
        const b = withIcon(el('button', '', 'Ereignis anlegen'), 'plus');
        b.type = 'button';
        b.id = 'open-event';
        if (!state.tasks.length) {
            b.disabled = true;
            b.title = 'Zuerst einen Planvorgang anlegen';
        }
        b.onclick = () => openPanel(eventCreateSpec());
        bar.append(b);
        return bar;
    }
    const dayWidthOf = (grid) => grid.querySelector('.pl-dd')?.getBoundingClientRect().width || 30;
    function axisPosition(clientX, grid) {
        const box = grid.parentElement.getBoundingClientRect();
        const lab = grid.querySelector('.pl-corner')?.getBoundingClientRect().width ?? 0;
        const visible = grid.parentElement.clientWidth - lab;
        return visible > 0 ? Math.min(1, Math.max(0, (clientX - box.left - lab) / visible)) : 0.5;
    }
    function dayUnder(clientX, grid) {
        const first = grid.querySelector('.pl-dd')?.getBoundingClientRect();
        const days = period.weeks * 7;
        const i = first && first.width > 0 ? Math.floor((clientX - first.left) / first.width) : Math.floor(days / 2);
        return (0, plan_ts_1.addDays)((0, period_ts_1.rangeOf)(period).from, Math.min(days - 1, Math.max(0, i)));
    }
    function setPeriod(next, say = true) {
        if (next.start === period.start && next.weeks === period.weeks)
            return;
        if (document.activeElement?.id === 'plan-scroll')
            returnFocus = '#plan-scroll';
        period = next;
        render();
        if (say)
            announce(`Zeitraum ${(0, period_ts_1.periodLabel)(period)}`);
    }
    function drawPeriod() {
        const bar = el('div', 'pl-period');
        bar.setAttribute('role', 'group');
        bar.setAttribute('aria-label', 'Zeitraum');
        const go = (next, focus) => { period = next; returnFocus = focus; render(); };
        const prev = withIcon(el('button', '', 'Zurück'), 'chevron-left');
        prev.type = 'button';
        prev.id = 'period-prev';
        prev.setAttribute('aria-label', 'Vorheriger Zeitraum');
        prev.onclick = () => go((0, period_ts_1.shiftPeriod)(period, -1), '#period-prev');
        const next = el('button', 'ico-btn', 'Weiter');
        next.append(icon('chevron-right'));
        next.type = 'button';
        next.id = 'period-next';
        next.setAttribute('aria-label', 'Nächster Zeitraum');
        next.onclick = () => go((0, period_ts_1.shiftPeriod)(period, 1), '#period-next');
        const today = withIcon(el('button', '', 'Heute'), 'calendar');
        today.type = 'button';
        today.id = 'period-today';
        today.onclick = () => go((0, period_ts_1.periodAt)(period, TODAY), '#period-today');
        const label = el('strong', 'pl-period-label', (0, period_ts_1.periodLabel)(period));
        label.id = 'period-label';
        const zoom = el('div', 'seg zoomseg');
        zoom.setAttribute('role', 'group');
        zoom.setAttribute('aria-label', 'Maßstab der Zeitachse');
        const zoomBtn = (dir, id, name, aria, hint) => {
            const b = el('button', 'segbtn');
            b.type = 'button';
            b.id = id;
            b.append(icon(name));
            b.setAttribute('aria-label', aria);
            b.title = hint;
            b.disabled = !(0, period_ts_1.canZoom)(period, dir);
            b.onclick = () => {
                if (b.disabled)
                    return;
                period = (0, period_ts_1.zoomPeriod)(period, dir);
                returnFocus = (0, period_ts_1.canZoom)(period, dir) ? `#${id}` : dir === 'in' ? '#zoom-out' : '#zoom-in';
                render();
            };
            return b;
        };
        zoom.append(zoomBtn('out', 'zoom-out', 'minus', 'Maßstab verkleinern, mehr Wochen sichtbar', 'Verkleinern (Strg oder Cmd + Mausrad nach unten, Taste −)'), zoomBtn('in', 'zoom-in', 'plus', 'Maßstab vergrößern, weniger Wochen sichtbar', 'Vergrößern (Strg oder Cmd + Mausrad nach oben, Taste +)'));
        const seg = el('div', 'seg');
        seg.setAttribute('role', 'group');
        seg.setAttribute('aria-label', 'Länge des Zeitraums');
        for (const w of period_ts_1.ZOOM_WEEKS) {
            const b = el('button', 'segbtn');
            b.type = 'button';
            b.dataset.weeks = String(w);
            b.setAttribute('aria-pressed', String(period.weeks === w));
            b.append(el('span', 'n', String(w)), el('span', 'u', ' Wochen'));
            b.onclick = () => go((0, period_ts_1.resizePeriod)(period, w), `.segbtn[data-weeks="${w}"]`);
            seg.append(b);
        }
        const scale = el('div', 'pl-scale');
        scale.append(zoom, seg);
        bar.append(prev, label, next, today, scale);
        return bar;
    }
    function onChartWheel(ev, grid) {
        if (panel || pan)
            return;
        const k = ev.deltaMode === 1 ? 16 : ev.deltaMode === 2 ? 400 : 1;
        if (ev.ctrlKey || ev.metaKey) {
            ev.preventDefault();
            wheelZoom += ev.deltaY * k;
            const now = performance.now();
            if (Math.abs(wheelZoom) < 40 || now - lastZoomAt < 150)
                return;
            const direction = wheelZoom < 0 ? 'in' : 'out';
            wheelZoom = 0;
            lastZoomAt = now;
            setPeriod((0, period_ts_1.zoomPeriod)(period, direction, dayUnder(ev.clientX, grid), axisPosition(ev.clientX, grid)), false);
            return;
        }
        const dx = Math.abs(ev.deltaX) > Math.abs(ev.deltaY) ? ev.deltaX : ev.shiftKey ? ev.deltaY : 0;
        if (!dx)
            return;
        ev.preventDefault();
        wheelPan += dx * k;
        const w = dayWidthOf(grid);
        const days = Math.trunc(wheelPan / w);
        if (days) {
            wheelPan -= days * w;
            setPeriod((0, period_ts_1.panPeriod)(period, days), false);
        }
    }
    function onChartKey(ev, region) {
        if (ev.target !== region || ev.altKey || ev.ctrlKey || ev.metaKey || panel)
            return;
        const step = ev.shiftKey ? 7 : 1;
        if (ev.key === 'ArrowLeft') {
            ev.preventDefault();
            setPeriod((0, period_ts_1.panPeriod)(period, -step));
        }
        else if (ev.key === 'ArrowRight') {
            ev.preventDefault();
            setPeriod((0, period_ts_1.panPeriod)(period, step));
        }
        else if (ev.key === '+' || ev.key === '=') {
            ev.preventDefault();
            setPeriod((0, period_ts_1.zoomPeriod)(period, 'in'));
        }
        else if (ev.key === '-' || ev.key === '_') {
            ev.preventDefault();
            setPeriod((0, period_ts_1.zoomPeriod)(period, 'out'));
        }
        else if (ev.key === 'Home') {
            ev.preventDefault();
            setPeriod((0, period_ts_1.periodAt)(period, TODAY));
        }
    }
    function onChartPointerDown(ev, grid) {
        if (ev.button !== 0 || ev.pointerType === 'touch' || panel || drag || pan)
            return;
        const t = ev.target;
        if (!t.closest('.pl-cell, .pl-kw, .pl-dd') || t.closest('.bar, button, .pl-lab'))
            return;
        pan = { pointerId: ev.pointerId, startX: ev.clientX, dayW: dayWidthOf(grid), base: period, shown: 0, moved: false };
        root.setPointerCapture(ev.pointerId);
        ev.preventDefault();
    }
    function onPanMove(ev) {
        if (!pan || ev.pointerId !== pan.pointerId)
            return;
        const dx = ev.clientX - pan.startX;
        if (!pan.moved && Math.abs(dx) < 4)
            return;
        if (!pan.moved) {
            pan.moved = true;
            root.classList.add('pl-panning');
        }
        const days = Math.round(-dx / pan.dayW);
        if (days !== pan.shown) {
            pan.shown = days;
            setPeriod((0, period_ts_1.panPeriod)(pan.base, days), false);
        }
    }
    function endPan(ev) {
        if (!pan || ev.pointerId !== pan.pointerId)
            return;
        const moved = pan.moved;
        pan = null;
        root.classList.remove('pl-panning');
        try {
            root.releasePointerCapture(ev.pointerId);
        }
        catch { }
        if (moved)
            announce(`Zeitraum ${(0, period_ts_1.periodLabel)(period)}`);
    }
    function applyDensity(grid) { grid.dataset.density = (0, period_ts_1.densityOf)(dayWidthOf(grid)); }
    function fillSync(box, info) {
        box.className = `pl-sync ${info.status}`;
        box.setAttribute('role', info.status === 'conflict' || info.status === 'error' ? 'alert' : 'status');
        box.dataset.sync = info.status;
        box.replaceChildren(el('span', '', info.message));
        if (info.status === 'conflict' || info.status === 'error') {
            const b = withIcon(el('button', '', 'Neu laden'), 'refresh');
            b.type = 'button';
            b.id = 'sync-reload';
            b.onclick = () => { void reloadFromRepository(); };
            box.append(b);
        }
    }
    async function reloadFromRepository() {
        state = await session.reload();
        panel = null;
        confirmDiscard = false;
        planError = '';
        moveNote = null;
        render();
    }
    function render() {
        observer?.disconnect();
        const range = (0, period_ts_1.rangeOf)(period);
        const axis = (0, plan_ts_1.buildAxis)(range.from, range.to, TODAY);
        if (toast && (panel || toast.after !== state))
            dismissToast();
        for (const c of Array.from(root.children))
            if (c !== live && c !== toastHost)
                c.remove();
        if (live.parentElement !== root)
            root.prepend(live);
        if (options.heading) {
            root.append(el('h1', '', 'Termin- und Ressourcenplaner'), el('p', 'pl-note', 'Prototyp mit erfundenen Daten. Änderungen bleiben nur im Arbeitsspeicher und gehen beim Neuladen verloren. Ein Ereignis begründet keinen Anspruch auf Nachtrag oder Rechnung.'));
        }
        const syncBox = el('div');
        fillSync(syncBox, session.info);
        const plan = card('Plan', 'card-plan', { foot: drawPlanActions() });
        plan.body.append(syncBox, drawPeriod());
        const mv = drawMoveNote();
        if (mv)
            plan.body.append(mv);
        const scroll = el('div', 'pl-scroll');
        const grid = drawGrid(axis);
        scroll.append(grid, drawLegend());
        scroll.id = 'plan-scroll';
        scroll.tabIndex = 0;
        scroll.setAttribute('role', 'region');
        scroll.setAttribute('aria-label', 'Zeitachse');
        scroll.setAttribute('aria-description', TIME_HELP);
        scroll.addEventListener('wheel', ev => onChartWheel(ev, grid), { passive: false });
        scroll.addEventListener('pointerdown', ev => onChartPointerDown(ev, grid));
        scroll.addEventListener('keydown', ev => onChartKey(ev, scroll));
        plan.body.append(scroll);
        const check = card('Prüfung', 'card-check', { foot: drawCheckActions() });
        const sub = (t) => el('h3', '', t);
        check.body.append(sub('Auffälligkeiten'), drawFindings(), sub('Abhängigkeiten'), drawDependencies());
        const events = card('Ereignisse', 'card-events', { foot: drawEventActions() });
        events.body.append(drawEvents());
        const load = drawLoad();
        const dispo = card('Wochenübersicht Personal und Objekte', 'card-load', { head: load.tabs });
        dispo.body.append(load.table);
        const cols1 = el('div', 'pl-cols');
        cols1.append(check.sec, events.sec);
        const cols2 = el('div', 'pl-cols');
        cols2.append(drawAssignmentsCard(), dispo.sec);
        root.append(plan.sec, cols1, cols2);
        if (root.lastElementChild !== toastHost)
            root.append(toastHost);
        applyDensity(grid);
        drawArrows(grid);
        observer = new ResizeObserver(() => { applyDensity(grid); drawArrows(grid); });
        observer.observe(grid);
        const pnl = drawPanel();
        if (pnl) {
            for (const c of Array.from(root.children))
                if (c !== live && c !== toastHost)
                    c.inert = true;
            root.append(pnl);
            const p = pnl.querySelector('#edit-panel');
            if (focusTarget === 'panel')
                (p?.querySelector('#edit-form input, #edit-form select, #edit-form textarea') ?? p?.querySelector('.pl-panel-head button'))?.focus();
            else if (focusTarget === 'confirm')
                p?.querySelector('#discard-no')?.focus();
            else if (focusTarget === 'error')
                p?.querySelector('.err')?.focus();
            focusTarget = '';
        }
        else if (returnFocus) {
            root.querySelector(returnFocus)?.focus();
            returnFocus = '';
        }
        if (opened)
            void session.submit(state);
    }
    const onKey = (e) => {
        if (toast && !panel && !drag && !e.defaultPrevented) {
            const typing = e.target?.closest?.('input, textarea, select, [contenteditable="true"]');
            if (e.key === 'Escape') {
                dismissToast();
                return;
            }
            if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === 'z' && !typing) {
                const u = toast.actions.find(a => a.id === 'undo');
                if (u) {
                    e.preventDefault();
                    dismissToast();
                    u.run();
                    return;
                }
            }
        }
        if (e.key === 'Escape' && drag) {
            e.stopPropagation();
            cancelDrag();
            return;
        }
        if (e.key === 'Escape' && panel) {
            e.stopPropagation();
            if (confirmDiscard) {
                confirmDiscard = false;
                focusTarget = 'panel';
                render();
            }
            else
                requestClose();
        }
    };
    root.addEventListener('keydown', onKey);
    root.addEventListener('pointermove', onPanMove);
    root.addEventListener('pointerup', endPan);
    root.addEventListener('pointercancel', endPan);
    const offSync = session.onChange(info => { for (const box of Array.from(root.querySelectorAll('.pl-sync')))
        fillSync(box, info); });
    root.replaceChildren(live, el('p', 'pl-note', 'Plan wird geladen …'));
    void session.open().then(loaded => { if (destroyed)
        return; state = loaded; opened = true; render(); })
        .catch(e => { if (!destroyed)
        root.replaceChildren(el('p', 'err', `Plan konnte nicht geladen werden: ${e instanceof Error ? e.message : String(e)}`)); });
    return { destroy: () => { destroyed = true; dismissToast(); offSync(); root.removeEventListener('keydown', onKey); root.removeEventListener('pointermove', onPanMove); root.removeEventListener('pointerup', endPan); root.removeEventListener('pointercancel', endPan); observer?.disconnect(); if (arrowFrame)
            cancelAnimationFrame(arrowFrame); root.replaceChildren(); } };
}

},
"src/planner/plan.js": function (require, exports, module) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.downstreamTasks = exports.checkDependency = exports.removeDependency = exports.addDependency = exports.wouldCreateCycle = exports.endEvent = exports.assessEvent = exports.createEventFromTask = exports.withEventNumbers = exports.eventNumber = exports.EVENT_NUMBER = exports.dispositionByObjekt = exports.weeklyDisposition = exports.occupancyOn = exports.findConflicts = exports.assign = exports.addResource = exports.suggestPlanKey = exports.removeAssignment = exports.findUnderstaffing = exports.moveSoll = exports.sollAfterDrag = exports.updateTask = exports.addTask = exports.addObjekt = exports.taskProblems = exports.emptyPlan = exports.barOnAxis = exports.buildAxis = exports.mondayOf = exports.isoWeek = exports.weekdayOf = exports.diffDays = exports.addDays = exports.isIsoDay = exports.NACHWEIS_ARTEN = exports.JA_NEIN_WERTE = exports.GENUTZT_WERTE = exports.VORHANDEN_WERTE = exports.WIRKUNGEN = exports.OBJEKT_NAME = void 0;
const ids_ts_1 = require("../core/ids.js");
exports.OBJEKT_NAME = /^(\d{4}) (\S.*)$/;
exports.WIRKUNGEN = ['Hemmung', 'Unterbrechung', 'Anfangsverschiebung', 'Leistungserweiterung', 'Kombination', 'noch nicht beurteilt'];
exports.VORHANDEN_WERTE = ['Ja', 'Nein', 'Teilweise', 'Unklar'];
exports.GENUTZT_WERTE = ['Ja', 'Nein', 'Teilweise'];
exports.JA_NEIN_WERTE = ['Ja', 'Nein', 'Unklar'];
exports.NACHWEIS_ARTEN = ['Foto', 'Plan', 'E-Mail', 'Bautagesbericht', 'sonstiges Dokument'];
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
const emptyPlan = () => ({ objekte: [], tasks: [], resources: [], assignments: [], events: [], dependencies: [] });
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
    if (t.requiredHeads !== undefined && !(Number.isInteger(t.requiredHeads) && t.requiredHeads >= 0))
        p.push('Soll-Besetzung: ganze Zahl ab 0');
    return p;
};
exports.taskProblems = taskProblems;
const addObjekt = (s, name) => {
    const n = name.trim();
    if (!n)
        throw new RangeError('Objekt ohne Bezeichnung');
    const m = exports.OBJEKT_NAME.exec(n);
    if (!m)
        throw new RangeError('Objekt-Name: vierstellige Kostenstelle, Leerzeichen, Kurzname (z. B. "1015 Kurzname")');
    if (s.objekte.some(o => o.kostenstelle === m[1]))
        throw new RangeError(`Objekt exists: Kostenstelle ${m[1]}`);
    if (s.objekte.some(o => o.name.toLowerCase() === n.toLowerCase()))
        throw new RangeError(`Objekt exists: ${n}`);
    return { ...s, objekte: [...s.objekte, { id: (0, ids_ts_1.nextId)('po'), name: n, kostenstelle: m[1] }] };
};
exports.addObjekt = addObjekt;
const addTask = (s, input) => {
    if (input.objektId && !s.objekte.some(o => o.id === input.objektId))
        throw new RangeError('unknown objekt');
    const task = {
        id: (0, ids_ts_1.nextId)('pt'), planKey: input.planKey, objektId: input.objektId ?? '', title: input.title, area: input.area ?? '', level: input.level ?? '', lvRef: input.lvRef ?? '',
        sollStart: input.sollStart, sollEnd: input.sollEnd, istStart: input.istStart ?? '', istEnd: input.istEnd ?? '',
        progress: input.progress ?? 0, status: input.status ?? 'geplant', rowOrder: s.tasks.length + 1, requiredHeads: input.requiredHeads ?? 0
    };
    const problems = (0, exports.taskProblems)(task);
    if (problems.length)
        throw new RangeError(problems.join('; '));
    if (s.tasks.some(t => t.planKey === task.planKey))
        throw new RangeError(`planKey exists: ${task.planKey}`);
    return { ...s, tasks: [...s.tasks, task] };
};
exports.addTask = addTask;
const updateTask = (s, taskId, patch) => {
    const t = s.tasks.find(x => x.id === taskId);
    if (!t)
        throw new RangeError('unknown task');
    if (patch.objektId && !s.objekte.some(o => o.id === patch.objektId))
        throw new RangeError('unknown objekt');
    const next = { ...t, ...patch };
    const problems = (0, exports.taskProblems)(next);
    if (problems.length)
        throw new RangeError(problems.join('; '));
    return { ...s, tasks: s.tasks.map(x => x.id === taskId ? next : x) };
};
exports.updateTask = updateTask;
const sollAfterDrag = (t, mode, days) => {
    if (!Number.isInteger(days))
        throw new RangeError('whole days only');
    if (mode === 'move')
        return { sollStart: (0, exports.addDays)(t.sollStart, days), sollEnd: (0, exports.addDays)(t.sollEnd, days) };
    if (mode === 'start') {
        const s = (0, exports.addDays)(t.sollStart, days);
        return { sollStart: (0, exports.diffDays)(s, t.sollEnd) < 0 ? t.sollEnd : s, sollEnd: t.sollEnd };
    }
    const e = (0, exports.addDays)(t.sollEnd, days);
    return { sollStart: t.sollStart, sollEnd: (0, exports.diffDays)(t.sollStart, e) < 0 ? t.sollStart : e };
};
exports.sollAfterDrag = sollAfterDrag;
const moveSoll = (s, taskId, mode, days) => {
    const t = s.tasks.find(x => x.id === taskId);
    if (!t)
        throw new RangeError('unknown task');
    if (days === 0)
        return s;
    return (0, exports.updateTask)(s, taskId, (0, exports.sollAfterDrag)(t, mode, days));
};
exports.moveSoll = moveSoll;
const findUnderstaffing = (s) => {
    const out = [];
    for (const t of s.tasks) {
        if (!(t.requiredHeads > 0) || t.status === 'ausgeführt')
            continue;
        const mine = s.assignments.filter(a => a.taskId === t.id);
        let cur = null;
        for (let d = t.sollStart; (0, exports.diffDays)(d, t.sollEnd) >= 0; d = (0, exports.addDays)(d, 1)) {
            if ((0, exports.weekdayOf)(d) >= 5)
                continue;
            const heads = mine.reduce((n, a) => {
                if ((0, exports.diffDays)(a.from, d) < 0 || (0, exports.diffDays)(d, a.to) < 0)
                    return n;
                const r = s.resources.find(x => x.id === a.resourceId);
                return r && r.type !== 'geraet' ? n + r.headcount : n;
            }, 0);
            if (heads < t.requiredHeads) {
                if (cur) {
                    cur.to = d;
                    cur.days += 1;
                    cur.minAssigned = Math.min(cur.minAssigned, heads);
                }
                else
                    cur = { taskId: t.id, planKey: t.planKey, from: d, to: d, days: 1, required: t.requiredHeads, minAssigned: heads };
            }
            else if (cur) {
                out.push(cur);
                cur = null;
            }
        }
        if (cur)
            out.push(cur);
    }
    return out;
};
exports.findUnderstaffing = findUnderstaffing;
const removeAssignment = (s, assignmentId) => {
    if (!s.assignments.some(a => a.id === assignmentId))
        throw new RangeError('unknown assignment');
    return { ...s, assignments: s.assignments.filter(a => a.id !== assignmentId) };
};
exports.removeAssignment = removeAssignment;
const suggestPlanKey = (s) => {
    const max = s.tasks.reduce((m, t) => { const n = /^PV-(\d+)$/.exec(t.planKey); return n ? Math.max(m, Number(n[1])) : m; }, 0);
    return `PV-${String(max + 1).padStart(3, '0')}`;
};
exports.suggestPlanKey = suggestPlanKey;
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
const weeklyDisposition = (s, weekStarts) => s.resources.map(r => ({
    resourceId: r.id,
    weeks: weekStarts.map(w => {
        const days = Array.from({ length: 7 }, (_, i) => (0, exports.addDays)(w, i));
        const occ = days.map(d => (0, exports.occupancyOn)(s, r.id, d));
        const taskIds = s.tasks
            .filter(t => s.assignments.some(a => a.resourceId === r.id && a.taskId === t.id && days.some(d => (0, exports.diffDays)(a.from, d) >= 0 && (0, exports.diffDays)(d, a.to) >= 0)))
            .map(t => t.id);
        const status = occ.includes('doppelt') ? 'doppelt' : occ.every(x => x === 'frei') ? 'frei' : 'verplant';
        return { weekStart: w, status, taskIds, freeDays: occ.slice(0, 5).filter(x => x === 'frei').length };
    })
}));
exports.weeklyDisposition = weeklyDisposition;
const dispositionByObjekt = (s, weekStarts) => {
    const personal = (0, exports.weeklyDisposition)(s, weekStarts);
    const groups = s.objekte.map(o => ({ objektId: o.id, name: o.name }));
    if (s.tasks.some(t => !t.objektId || !s.objekte.some(o => o.id === t.objektId)))
        groups.push({ objektId: '', name: 'ohne Objekt' });
    return groups.map(g => {
        const mine = new Set(s.tasks.filter(t => (g.objektId ? t.objektId === g.objektId : !s.objekte.some(o => o.id === t.objektId))).map(t => t.id));
        return {
            ...g,
            weeks: weekStarts.map((w, i) => ({
                weekStart: w,
                entries: personal.flatMap(r => {
                    const wk = r.weeks[i];
                    const taskIds = wk.taskIds.filter(id => mine.has(id));
                    return taskIds.length ? [{ resourceId: r.resourceId, taskIds, status: wk.status }] : [];
                })
            }))
        };
    });
};
exports.dispositionByObjekt = dispositionByObjekt;
exports.EVENT_NUMBER = /^EV-\d{4}-\d{8}-\d{3,}$/;
const eventNumber = (s, objektId, day) => {
    const kom = s.objekte.find(o => o.id === objektId)?.kostenstelle ?? '0000';
    const prefix = `EV-${kom}-${day.replace(/-/g, '')}-`;
    let max = 0;
    for (const e of s.events)
        if (typeof e.nummer === 'string' && e.nummer.startsWith(prefix))
            max = Math.max(max, Number.parseInt(e.nummer.slice(prefix.length), 10) || 0);
    return `${prefix}${String(max + 1).padStart(3, '0')}`;
};
exports.eventNumber = eventNumber;
const withEventNumbers = (s) => {
    if (s.events.every(e => typeof e.nummer === 'string' && e.nummer !== ''))
        return s;
    let working = { ...s, events: s.events.map(e => (typeof e.nummer === 'string' ? e : { ...e, nummer: '' })) };
    for (const e of s.events) {
        if (typeof e.nummer === 'string' && e.nummer !== '')
            continue;
        const objektId = s.tasks.find(t => t.id === e.taskId)?.objektId;
        const nummer = (0, exports.eventNumber)(working, objektId, e.from);
        working = { ...working, events: working.events.map(x => (x.id === e.id ? { ...x, nummer } : x)) };
    }
    return working;
};
exports.withEventNumbers = withEventNumbers;
const oneOf = (v, list) => list.includes(v);
const assessmentProblem = (a) => {
    if (a.wirkung !== undefined && !oneOf(a.wirkung, exports.WIRKUNGEN))
        return 'Wirkung ungültig';
    const w = a.ausweichmoeglichkeit;
    if (w && (!oneOf(w.vorhanden, exports.VORHANDEN_WERTE) || (w.genutzt !== '' && !oneOf(w.genutzt, exports.GENUTZT_WERTE))))
        return 'Ausweichmöglichkeit ungültig';
    const g = a.gegenmassnahme;
    if (g && [g.moeglich, g.durchgefuehrt, g.wirksam].some(v => v !== '' && !oneOf(v, exports.JA_NEIN_WERTE)))
        return 'Gegenmaßnahme ungültig';
    if (a.nachweise?.some(n => !oneOf(n.art, exports.NACHWEIS_ARTEN) || !n.bezeichnung.trim()))
        return 'Nachweis ungültig (Art aus der Liste, Bezeichnung nötig)';
    return null;
};
const EMPTY_AUSWEICH = { vorhanden: 'Unklar', beschreibung: '', genutzt: '' };
const EMPTY_GEGEN = { moeglich: '', beschreibung: '', durchgefuehrt: '', wirksam: '' };
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
    const problem = assessmentProblem(input);
    if (problem)
        throw new RangeError(problem);
    const resources = s.assignments.filter(a => a.taskId === taskId).map(a => {
        const r = s.resources.find(x => x.id === a.resourceId);
        return { type: r.type, label: r.label, from: a.from, to: a.to };
    });
    const snapshot = {
        taskId, planKey: t.planKey, title: t.title, area: t.area, level: t.level, lvRef: t.lvRef,
        sollStart: t.sollStart, sollEnd: t.sollEnd, resources, takenOn
    };
    const event = {
        id: (0, ids_ts_1.nextId)('pe'), nummer: (0, exports.eventNumber)(s, t.objektId, input.from), taskId, snapshot, title: input.title, from: input.from, to: input.to ?? '', istZustand: input.istZustand ?? '', ursache: input.ursache ?? '',
        wirkung: input.wirkung ?? 'noch nicht beurteilt', ausweichmoeglichkeit: { ...(input.ausweichmoeglichkeit ?? EMPTY_AUSWEICH) },
        gegenmassnahme: { ...(input.gegenmassnahme ?? EMPTY_GEGEN) }, nachweise: (input.nachweise ?? []).map(n => ({ ...n }))
    };
    return { state: { ...s, events: [...s.events, event] }, event };
};
exports.createEventFromTask = createEventFromTask;
const assessEvent = (s, eventId, a) => {
    const e = s.events.find(x => x.id === eventId);
    if (!e)
        throw new RangeError('unknown event');
    const problem = assessmentProblem(a);
    if (problem)
        throw new RangeError(problem);
    return {
        ...s,
        events: s.events.map(x => x.id !== eventId ? x : {
            ...x,
            wirkung: a.wirkung ?? x.wirkung,
            ausweichmoeglichkeit: a.ausweichmoeglichkeit ? { ...a.ausweichmoeglichkeit } : x.ausweichmoeglichkeit,
            gegenmassnahme: a.gegenmassnahme ? { ...a.gegenmassnahme } : x.gegenmassnahme,
            nachweise: a.nachweise ? a.nachweise.map(n => ({ ...n })) : x.nachweise
        })
    };
};
exports.assessEvent = assessEvent;
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
    s = (0, plan_ts_1.addObjekt)(s, '7001 Muster A (fiktiv)');
    s = (0, plan_ts_1.addObjekt)(s, '7002 Muster B (fiktiv)');
    const [oa, ob] = s.objekte.map(o => o.id);
    s = (0, plan_ts_1.addTask)(s, { planKey: 'PV-001', objektId: oa, title: 'Trockenbauwände 1. OG', area: 'Baufeld 2', level: '1. OG', lvRef: 'OZ 03.02.010', sollStart: '2026-11-17', sollEnd: '2026-11-28', istStart: '2026-11-17', istEnd: '', progress: 45, status: 'in Arbeit' });
    s = (0, plan_ts_1.addTask)(s, { planKey: 'PV-002', objektId: ob, title: 'Decke Foyer', area: 'Foyer', level: 'EG', lvRef: 'OZ 03.02.020', sollStart: '2026-11-24', sollEnd: '2026-12-12', requiredHeads: 5 });
    s = (0, plan_ts_1.addTask)(s, { planKey: 'PV-003', objektId: oa, title: 'Spachtelung', area: 'Baufeld 2', level: '1. OG', lvRef: 'OZ 03.03.010', sollStart: '2026-12-08', sollEnd: '2026-12-19' });
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
"src/planner/in-memory-plan-repository.js": function (require, exports, module) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryPlanRepository = void 0;
const plan_ts_1 = require("./plan.js");
const plan_integrity_ts_1 = require("./plan-integrity.js");
const plan_repository_ts_1 = require("./plan-repository.js");
class InMemoryPlanRepository {
    #items = new Map();
    constructor(initial = (0, plan_ts_1.emptyPlan)()) {
        for (const r of (0, plan_repository_ts_1.recordsOf)(initial))
            this.#items.set(r.record.id, { kind: r.kind, record: structuredClone(r.record), version: 1, archived: false });
    }
    async load() {
        const state = (0, plan_ts_1.emptyPlan)();
        const versions = {};
        for (const it of this.#items.values()) {
            if (it.archived)
                continue;
            state[plan_repository_ts_1.KIND_STATE_KEY[it.kind]].push(structuredClone(it.record));
            versions[it.record.id] = String(it.version);
        }
        const plan = state;
        return { state: plan, versions, issues: (0, plan_integrity_ts_1.checkPlanIntegrity)(plan) };
    }
    async put(kind, record, expectedVersion) {
        const current = this.#items.get(record.id);
        if (expectedVersion === null) {
            if (current)
                throw new plan_repository_ts_1.VersionConflictError(kind, record.id, 'existiert bereits');
            this.#items.set(record.id, { kind, record: structuredClone(record), version: 1, archived: false });
            return '1';
        }
        if (!current || current.archived)
            throw new plan_repository_ts_1.VersionConflictError(kind, record.id, 'unbekannt oder archiviert');
        if (String(current.version) !== expectedVersion)
            throw new plan_repository_ts_1.VersionConflictError(kind, record.id, `erwartet ${expectedVersion}, aktuell ${current.version}`);
        if (kind === 'event' && JSON.stringify(current.record.snapshot) !== JSON.stringify(record.snapshot)) {
            throw new RangeError('Der Soll-Snapshot eines Ereignisses wird nur einmal geschrieben (snapshot).');
        }
        if (kind === 'event' && current.record.nummer !== record.nummer) {
            throw new RangeError('Die Ereignis-ID wird nur einmal vergeben und ändert sich nicht (nummer).');
        }
        current.record = structuredClone(record);
        current.version += 1;
        return String(current.version);
    }
    async archive(kind, id, expectedVersion) {
        const current = this.#items.get(id);
        if (!current || current.archived)
            throw new plan_repository_ts_1.VersionConflictError(kind, id, 'unbekannt oder archiviert');
        if (String(current.version) !== expectedVersion)
            throw new plan_repository_ts_1.VersionConflictError(kind, id, `erwartet ${expectedVersion}, aktuell ${current.version}`);
        current.archived = true;
        current.version += 1;
    }
}
exports.InMemoryPlanRepository = InMemoryPlanRepository;

},
"src/planner/plan-session.js": function (require, exports, module) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanSession = void 0;
const plan_repository_ts_1 = require("./plan-repository.js");
const plan_sync_ts_1 = require("./plan-sync.js");
const messagesFor = (where) => ({
    idle: `Änderungen werden automatisch gesichert (${where}).`,
    saving: 'Sichert …',
    saved: `Gesichert (${where}).`,
});
class PlanSession {
    #repo;
    #loaded = null;
    #wanted = null;
    #busy = false;
    #current = Promise.resolve();
    #info;
    #listeners = new Set();
    #messages;
    constructor(repo, where = 'Arbeitsspeicher, Prototyp') { this.#repo = repo; this.#messages = messagesFor(where); this.#info = { status: 'idle', message: this.#messages.idle }; }
    get info() { return this.#info; }
    get integrityIssues() { return this.#loaded?.issues ?? []; }
    get hasUnsaved() { return Boolean(this.#loaded && this.#wanted && this.#differs(this.#loaded.state, this.#wanted)); }
    onChange(listener) { this.#listeners.add(listener); return () => { this.#listeners.delete(listener); }; }
    async open() {
        const loaded = await this.#repo.load();
        this.#loaded = loaded;
        this.#wanted = loaded.state;
        this.#set('idle', this.#messages.idle);
        return loaded.state;
    }
    reload() { return this.open(); }
    submit(state) {
        if (!this.#loaded)
            throw new Error('PlanSession.open() muss zuerst aufgerufen werden.');
        this.#wanted = state;
        const blocked = this.#info.status === 'conflict' || this.#info.status === 'error';
        if (this.#busy || blocked)
            return this.#current;
        this.#busy = true;
        this.#current = this.#drain();
        return this.#current;
    }
    whenIdle() { return this.#current; }
    #differs(a, b) {
        if (a === b)
            return false;
        const d = (0, plan_sync_ts_1.planDiff)(a, b);
        return d.created.length + d.updated.length + d.removed.length > 0;
    }
    async #drain() {
        try {
            for (;;) {
                const base = this.#loaded, want = this.#wanted;
                if (!base || !want)
                    return;
                if (!this.#differs(base.state, want)) {
                    if (this.#info.status === 'saving')
                        this.#set('saved', this.#messages.saved);
                    return;
                }
                this.#set('saving', this.#messages.saving);
                try {
                    this.#loaded = await (0, plan_sync_ts_1.savePlanChanges)(this.#repo, base, want);
                }
                catch (e) {
                    if (e instanceof plan_repository_ts_1.VersionConflictError) {
                        this.#set('conflict', `Konflikt: ${e.message}. Ihre letzten Änderungen sind nicht gesichert. „Neu laden“ übernimmt den Stand des Speichers und verwirft sie.`);
                    }
                    else {
                        this.#set('error', `Sichern fehlgeschlagen: ${e instanceof Error ? e.message : String(e)}. „Neu laden“ übernimmt den Stand des Speichers und verwirft ungesicherte Änderungen.`);
                    }
                    return;
                }
                if (this.#wanted === want) {
                    this.#set('saved', this.#messages.saved);
                    return;
                }
            }
        }
        finally {
            this.#busy = false;
        }
    }
    #set(status, message) {
        if (this.#info.status === status && this.#info.message === message)
            return;
        this.#info = { status, message };
        for (const l of this.#listeners)
            l(this.#info);
    }
}
exports.PlanSession = PlanSession;

},
"src/planner/period.js": function (require, exports, module) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.periodLabel = exports.containsDay = exports.periodAt = exports.resizePeriod = exports.shiftPeriod = exports.densityOf = exports.minDayWidth = exports.zoomPeriod = exports.dayAtFraction = exports.canZoom = exports.panPeriod = exports.rangeOf = exports.makePeriod = exports.PERIOD_WEEKS = exports.ZOOM_WEEKS = void 0;
const plan_ts_1 = require("./plan.js");
exports.ZOOM_WEEKS = [2, 5, 8, 13, 26];
exports.PERIOD_WEEKS = [2, 5, 8];
const makePeriod = (anyDay, weeks) => ({ start: (0, plan_ts_1.mondayOf)(anyDay), weeks });
exports.makePeriod = makePeriod;
const rangeOf = (p) => {
    const to = (0, plan_ts_1.addDays)(p.start, p.weeks * 7 - 1);
    const weekStarts = [];
    for (let w = (0, plan_ts_1.mondayOf)(p.start); w <= to; w = (0, plan_ts_1.addDays)(w, 7))
        weekStarts.push(w);
    return { from: p.start, to, weekStarts };
};
exports.rangeOf = rangeOf;
const panPeriod = (p, days) => (days === 0 ? p : { ...p, start: (0, plan_ts_1.addDays)(p.start, days) });
exports.panPeriod = panPeriod;
const canZoom = (p, direction) => {
    const i = exports.ZOOM_WEEKS.indexOf(p.weeks);
    return direction === 'in' ? i > 0 : i < exports.ZOOM_WEEKS.length - 1;
};
exports.canZoom = canZoom;
const dayAtFraction = (p, fraction) => {
    const days = p.weeks * 7;
    const f = Math.min(1, Math.max(0, fraction));
    return (0, plan_ts_1.addDays)(p.start, Math.min(days - 1, Math.floor(f * days)));
};
exports.dayAtFraction = dayAtFraction;
const zoomPeriod = (p, direction, anchor, position) => {
    if (!(0, exports.canZoom)(p, direction))
        return p;
    const weeks = exports.ZOOM_WEEKS[exports.ZOOM_WEEKS.indexOf(p.weeks) + (direction === 'in' ? -1 : 1)];
    const oldDays = p.weeks * 7, newDays = weeks * 7;
    const index = anchor === undefined ? Math.floor(oldDays / 2) : Math.min(oldDays - 1, Math.max(0, (0, plan_ts_1.diffDays)(p.start, anchor)));
    const at = position === undefined ? index / oldDays : Math.min(1, Math.max(0, position));
    const start = (0, plan_ts_1.addDays)((0, plan_ts_1.addDays)(p.start, index), -Math.round(at * newDays));
    return { start, weeks };
};
exports.zoomPeriod = zoomPeriod;
const minDayWidth = (weeks) => (weeks <= 5 ? 30 : weeks <= 8 ? 14 : weeks <= 13 ? 9 : 4);
exports.minDayWidth = minDayWidth;
const densityOf = (pxPerDay) => (pxPerDay >= 24 ? 'voll' : pxPerDay >= 14 ? 'kompakt' : 'dicht');
exports.densityOf = densityOf;
const shiftPeriod = (p, direction) => ({ ...p, start: (0, plan_ts_1.addDays)(p.start, direction * p.weeks * 7) });
exports.shiftPeriod = shiftPeriod;
const resizePeriod = (p, weeks) => ({ ...p, weeks });
exports.resizePeriod = resizePeriod;
const periodAt = (p, today) => ({ ...p, start: (0, plan_ts_1.mondayOf)(today) });
exports.periodAt = periodAt;
const containsDay = (p, day) => { const r = (0, exports.rangeOf)(p); return day >= r.from && day <= r.to; };
exports.containsDay = containsDay;
const fmt = (d) => `${d.slice(8)}.${d.slice(5, 7)}.`;
const periodLabel = (p) => {
    const r = (0, exports.rangeOf)(p);
    const kw = (0, plan_ts_1.isoWeek)(r.from) === (0, plan_ts_1.isoWeek)(r.to) ? `KW ${(0, plan_ts_1.isoWeek)(r.from)}` : `KW ${(0, plan_ts_1.isoWeek)(r.from)}–${(0, plan_ts_1.isoWeek)(r.to)}`;
    return `${fmt(r.from)}–${fmt(r.to)}${r.to.slice(0, 4)} · ${kw}`;
};
exports.periodLabel = periodLabel;

},
"src/planner/plan-cases.js": function (require, exports, module) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.planCase = exports.PLAN_CASES = void 0;
const demo_plan_ts_1 = require("./demo-plan.js");
const stoerungsfall_demo_ts_1 = require("./stoerungsfall-demo.js");
const FALL_FROM = '2027-07-26';
exports.PLAN_CASES = [
    {
        key: 'demo', label: 'Demo-Plan',
        note: 'Erfundener Plan mit einer Doppelbelegung und einer verletzten Abhängigkeit. Probieren: Planvorgang anklicken, Soll-Balken ziehen, Zeitachse verschieben und skalieren.',
        today: demo_plan_ts_1.DEMO_TODAY, build: demo_plan_ts_1.buildDemoPlan,
    },
    {
        key: 'erfasst', label: 'Störungsfall: erfasst',
        note: 'Erfundener Fall, Tag 2 der Störung: Ereignis erfasst, Soll-Snapshot kopiert, Einschätzung noch „noch nicht beurteilt“. Probieren: Einschätzung ausfüllen, Nachweise eintragen.',
        today: '2027-08-03', periodFrom: FALL_FROM, periodWeeks: 8, build: () => (0, stoerungsfall_demo_ts_1.buildStoerungsfall)().recorded.state,
    },
    {
        key: 'fortdauer', label: 'Störungsfall: Fortdauer',
        note: 'Dieselbe Störung nach zwei Wochen: Einschätzung ausgefüllt, die Störung besteht fort. Probieren: Entwurf der Behinderungsanzeige öffnen, „Wiederaufnahme heute“ setzen.',
        today: '2027-08-18', periodFrom: FALL_FROM, periodWeeks: 8, build: () => (0, stoerungsfall_demo_ts_1.buildStoerungsfall)().continuing,
    },
    {
        key: 'wiederaufnahme', label: 'Störungsfall: Wiederaufnahme',
        note: 'Die Arbeit wurde am 26.08.2027 wieder aufgenommen. Plan und Soll-Snapshot sind unverändert; Folgevorgänge wurden nicht automatisch verschoben.',
        today: '2027-08-27', periodFrom: FALL_FROM, periodWeeks: 8, build: () => (0, stoerungsfall_demo_ts_1.buildStoerungsfall)().resumed,
    },
];
const planCase = (key) => exports.PLAN_CASES.find(c => c.key === key) ?? exports.PLAN_CASES[0];
exports.planCase = planCase;

},
"src/planner/stored-plan-repository.js": function (require, exports, module) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoredPlanRepository = exports.STORAGE_PREFIX = exports.APP_PREFIX = void 0;
exports.browserStore = browserStore;
exports.resetStoredPlan = resetStoredPlan;
exports.clearStoredPlans = clearStoredPlans;
const plan_integrity_ts_1 = require("./plan-integrity.js");
const in_memory_plan_repository_ts_1 = require("./in-memory-plan-repository.js");
const plan_ts_1 = require("./plan.js");
exports.APP_PREFIX = 'intrend-mc-demo:';
exports.STORAGE_PREFIX = `${exports.APP_PREFIX}plan:v1:`;
const FORMAT = 1;
function browserStore() {
    try {
        const s = globalThis.localStorage;
        if (!s)
            return null;
        const probe = `${exports.APP_PREFIX}probe`;
        s.setItem(probe, '1');
        s.removeItem(probe);
        return s;
    }
    catch {
        return null;
    }
}
const ARRAYS = ['objekte', 'tasks', 'resources', 'assignments', 'events', 'dependencies'];
function restore(store, key) {
    const raw = store.getItem(exports.STORAGE_PREFIX + key);
    if (raw === null)
        return null;
    try {
        const o = JSON.parse(raw);
        const plan = o && typeof o === 'object' ? o.plan : undefined;
        if (!plan || o.v !== FORMAT || !ARRAYS.every(k => Array.isArray(plan[k])))
            throw new Error('shape');
        const state = (0, plan_ts_1.withEventNumbers)({ ...(0, plan_ts_1.emptyPlan)(), ...plan });
        if ((0, plan_integrity_ts_1.checkPlanIntegrity)(state).length > 0)
            throw new Error('integrity');
        return state;
    }
    catch {
        try {
            store.removeItem(exports.STORAGE_PREFIX + key);
        }
        catch { }
        return null;
    }
}
class StoredPlanRepository {
    #inner;
    #store;
    #key;
    constructor(initial, key, store) {
        this.#store = store;
        this.#key = key;
        this.#inner = new in_memory_plan_repository_ts_1.InMemoryPlanRepository((store ? restore(store, key) : null) ?? initial());
    }
    get persistent() { return this.#store !== null; }
    load() { return this.#inner.load(); }
    async put(kind, record, expectedVersion) {
        const version = await this.#inner.put(kind, record, expectedVersion);
        await this.#persist();
        return version;
    }
    async archive(kind, id, expectedVersion) {
        await this.#inner.archive(kind, id, expectedVersion);
        await this.#persist();
    }
    async #persist() {
        if (!this.#store)
            return;
        try {
            const { state } = await this.#inner.load();
            this.#store.setItem(exports.STORAGE_PREFIX + this.#key, JSON.stringify({ v: FORMAT, plan: state }));
        }
        catch {
            throw new Error('Speichern im Browser nicht möglich (Speicher voll oder gesperrt)');
        }
    }
}
exports.StoredPlanRepository = StoredPlanRepository;
function resetStoredPlan(key, store) {
    try {
        store?.removeItem(exports.STORAGE_PREFIX + key);
    }
    catch { }
}
function clearStoredPlans(store) {
    if (!store)
        return 0;
    try {
        const keys = [];
        for (let i = 0; i < store.length; i++) {
            const k = store.key(i);
            if (k !== null && k.startsWith(exports.APP_PREFIX))
                keys.push(k);
        }
        for (const k of keys)
            store.removeItem(k);
        return keys.length;
    }
    catch {
        return 0;
    }
}

},
"src/behinderung/from-plan-event.js": function (require, exports, module) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDraftFromPlanEvent = createDraftFromPlanEvent;
const dateDe = (iso) => (/^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso.split('-').reverse().join('.') : iso);
function createDraftFromPlanEvent(s, eventId, today = '') {
    const e = s.events.find(x => x.id === eventId);
    if (!e)
        return null;
    const task = s.tasks.find(x => x.id === e.taskId);
    const objekt = task ? s.objekte.find(o => o.id === task.objektId) : undefined;
    const snap = e.snapshot;
    const place = [snap.area, snap.level].map(v => v.trim()).filter(Boolean).join(', ');
    const lines = [
        e.nummer && `Ereignis-ID: ${e.nummer}`,
        place && `Ort / Bauteil: ${place}`,
        snap.title.trim() && `Planvorgang: ${snap.planKey} ${snap.title.trim()}`,
        snap.lvRef.trim() && `LV-Bezug: ${snap.lvRef.trim()}`,
        `Soll laut Plan (Stand der Erfassung): ${dateDe(snap.sollStart)} bis ${dateDe(snap.sollEnd)}`,
        e.istZustand.trim() && `Sachverhalt: ${e.istZustand.trim()}`,
        `Im Planer erfasst am: ${dateDe(snap.takenOn)}`,
        `Beginn: ${dateDe(e.from)}`,
        e.to ? `Wiederaufnahme: ${dateDe(e.to)}` : 'Fortdauer: Wiederaufnahme noch nicht erfasst',
        e.nachweise.length > 0 && `Nachweise: ${e.nachweise.map(n => n.bezeichnung.trim()).join('; ')}`,
    ];
    return {
        variant: 'formal',
        source: { projectId: objekt?.id ?? '', date: e.from, eventId },
        date: today.trim(),
        project: objekt?.name ?? '',
        projectNo: objekt?.kostenstelle ?? '',
        recipient: '',
        reasons: e.ursache.trim(),
        details: lines.filter(Boolean).join('\n'),
        durationDays: '', restartDays: '', relocationDays: '', newCompletion: '', confirmBy: '',
    };
}

},
"src/behinderung/behinderungsanzeige.js": function (require, exports, module) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LETTER_VARIANTS = exports.PERSONAL_TEXT = exports.PERIOD_LABELS = exports.FIXED_TEXT = void 0;
exports.letterText = letterText;
exports.proposeDetails = proposeDetails;
exports.proposeReasons = proposeReasons;
exports.createBehinderungsanzeigeDraft = createBehinderungsanzeigeDraft;
exports.buildBehinderungsanzeige = buildBehinderungsanzeige;
const disruption_ts_1 = require("../core/disruption.js");
const wording_ts_1 = require("./wording.js");
Object.defineProperty(exports, "FIXED_TEXT", { enumerable: true, get: function () { return wording_ts_1.FIXED_TEXT; } });
Object.defineProperty(exports, "PERIOD_LABELS", { enumerable: true, get: function () { return wording_ts_1.PERIOD_LABELS; } });
Object.defineProperty(exports, "PERSONAL_TEXT", { enumerable: true, get: function () { return wording_ts_1.PERSONAL_TEXT; } });
exports.LETTER_VARIANTS = [
    { id: 'formal', label: 'Formell', hint: 'Sachlich und trocken, nach der Vorlage.' },
    { id: 'persoenlich', label: 'Persönlich', hint: 'Für Auftraggeber, die wir kennen; weniger trocken (Platzhaltertext).' },
];
function letterText(variant) {
    return variant === 'persoenlich' ? { variant: 'persoenlich', text: wording_ts_1.PERSONAL_TEXT } : { variant: 'formal', text: wording_ts_1.FIXED_TEXT };
}
const dateDe = (iso) => (/^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso.split('-').reverse().join('.') : iso);
function proposeDetails(report, eventId) {
    const event = report.events.find(item => item.id === eventId);
    if (!event)
        return '';
    const lines = [
        event.location.trim() && `Ort / Bauteil: ${event.location.trim()}`,
        event.description.trim() && `Sachverhalt: ${event.description.trim()}`,
        `Festgestellt am: ${dateDe(report.date)}`,
    ];
    return lines.filter(Boolean).join('\n');
}
function proposeReasons(report, eventId, catalog) {
    const event = report.events.find(item => item.id === eventId);
    if (!event)
        return '';
    return (0, disruption_ts_1.splitReasons)(event.reasons).disruptionIds.map(id => (0, disruption_ts_1.disruptionLabel)(catalog, id)).join('\n');
}
function createBehinderungsanzeigeDraft(report, eventId, project, catalog, today = '') {
    if (!report.events.some(item => item.id === eventId))
        return null;
    return {
        variant: 'formal',
        source: { projectId: report.projectId, date: report.date, eventId },
        date: today.trim(),
        project: project.name.trim(),
        projectNo: (project.projectNo ?? '').trim(),
        recipient: (project.client ?? '').trim(),
        reasons: proposeReasons(report, eventId, catalog),
        details: proposeDetails(report, eventId),
        durationDays: '', restartDays: '', relocationDays: '', newCompletion: '', confirmBy: '',
    };
}
function buildBehinderungsanzeige(draft) {
    const hints = [];
    const need = (value, text) => { if (!value.trim())
        hints.push(text); };
    need(draft.date, 'Datum fehlt');
    need(draft.project, 'Bauvorhaben fehlt');
    need(draft.recipient, 'Empfänger / Adresse fehlt');
    const reasons = draft.reasons.split('\n').map(line => line.trim()).filter(Boolean);
    if (!reasons.length)
        hints.push('Kein Grund angegeben');
    need(draft.details, 'Einzelbegründung fehlt');
    need(draft.durationDays, 'Voraussichtliche Dauer fehlt');
    need(draft.newCompletion, 'Voraussichtlicher neuer Fertigstellungstermin fehlt');
    need(draft.confirmBy, 'Bestätigungsfrist fehlt');
    const { variant, text } = letterText(draft.variant);
    return {
        variant,
        text,
        title: text.title,
        date: draft.date,
        recipient: draft.recipient,
        intro: text.intro(draft.project),
        reasons,
        details: draft.details,
        periods: wording_ts_1.PERIOD_LABELS.map(([label, unit], index) => [label, [draft.durationDays, draft.restartDays, draft.relocationDays, draft.newCompletion][index], unit]),
        confirmBy: draft.confirmBy,
        hints,
        notes: [
            'ENTWURF: nicht rechtlich geprüft, nicht versendet, keine freigegebene Vorlage. Eine dokumentierte Behinderung begründet für sich keinen Anspruch.',
            'Fristen werden nicht berechnet; sie sind frei einzutragen.',
            ...(variant === 'persoenlich' ? ['Die Formulierung der persönlichen Variante ist ein Platzhaltertext, keine geprüfte oder freigegebene Vorlage.'] : []),
        ],
    };
}

},
"src/planner/event-chain.js": function (require, exports, module) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stateText = exports.STAGE_ORDER = void 0;
exports.eventChain = eventChain;
const from_plan_event_ts_1 = require("../behinderung/from-plan-event.js");
exports.STAGE_ORDER = ['planvorgang', 'snapshot', 'ereignis', 'wirkung', 'ausweichmoeglichkeit', 'gegenmassnahme', 'nachweise', 'entwurf', 'fortdauer'];
exports.stateText = {
    recorded: 'erfasst', notStated: 'noch nicht angegeben', available: 'möglich', unavailable: 'nicht verfügbar', ongoing: 'dauert an'
};
const LABELS = {
    planvorgang: 'Planvorgang', snapshot: 'Soll-Snapshot', ereignis: 'Ereignis', wirkung: 'Wirkung', ausweichmoeglichkeit: 'Ausweichmöglichkeit',
    gegenmassnahme: 'Gegenmaßnahme', nachweise: 'Nachweise', entwurf: 'Behinderungsanzeige-Entwurf', fortdauer: 'Fortdauer / Wiederaufnahme'
};
const de = (iso) => (/^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso.split('-').reverse().join('.') : iso);
const stage = (id, state, value, detail = '', action = null) => ({ id, label: LABELS[id], state, value, detail, action });
function eventChain(s, eventId) {
    const e = s.events.find(x => x.id === eventId);
    if (!e)
        return [];
    const task = s.tasks.find(t => t.id === e.taskId);
    const a = e.ausweichmoeglichkeit, g = e.gegenmassnahme;
    const aStated = a.vorhanden !== 'Unklar' || Boolean(a.beschreibung.trim()) || a.genutzt !== '';
    const gParts = [['möglich', g.moeglich], ['durchgeführt', g.durchgefuehrt], ['wirksam', g.wirksam]].filter(([, v]) => v !== '').map(([k, v]) => `${k}: ${v}`);
    const gStated = gParts.length > 0 || Boolean(g.beschreibung.trim());
    const n = e.nachweise.length;
    const draft = (0, from_plan_event_ts_1.createDraftFromPlanEvent)(s, e.id, '');
    return [
        task ? stage('planvorgang', 'recorded', task.planKey, task.title, 'task') : stage('planvorgang', 'unavailable', e.snapshot.planKey, 'nicht mehr im Plan'),
        stage('snapshot', 'recorded', `Soll ${de(e.snapshot.sollStart)} – ${de(e.snapshot.sollEnd)}`, `erfasst am ${de(e.snapshot.takenOn)}`),
        stage('ereignis', 'recorded', e.nummer, `ab ${de(e.from)}`),
        e.wirkung !== 'noch nicht beurteilt' ? stage('wirkung', 'recorded', e.wirkung, '', 'assess') : stage('wirkung', 'notStated', e.wirkung, '', 'assess'),
        stage('ausweichmoeglichkeit', aStated ? 'recorded' : 'notStated', `${a.vorhanden}${a.genutzt ? `, genutzt: ${a.genutzt}` : ''}`, a.beschreibung.trim(), 'assess'),
        stage('gegenmassnahme', gStated ? 'recorded' : 'notStated', gParts.length ? gParts.join(' · ') : '–', g.beschreibung.trim(), 'assess'),
        n ? stage('nachweise', 'recorded', `${n} ${n === 1 ? 'Nachweis' : 'Nachweise'}`, e.nachweise.map(x => `${x.art} (${x.bezeichnung})`).join(', '), 'assess') : stage('nachweise', 'notStated', '–', '', 'assess'),
        draft ? stage('entwurf', 'available', 'möglich', 'nur Entwurf, nichts wird gesendet', 'letter') : stage('entwurf', 'unavailable', 'nicht möglich'),
        e.to ? stage('fortdauer', 'recorded', `Wiederaufnahme ${de(e.to)}`) : stage('fortdauer', 'ongoing', 'dauert an', 'Wiederaufnahme noch nicht erfasst', 'resume')
    ];
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
"src/planner/plan-integrity.js": function (require, exports, module) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPlanIntegrity = checkPlanIntegrity;
const plan_ts_1 = require("./plan.js");
function checkPlanIntegrity(s) {
    const out = [];
    const add = (code, severity, recordId, message) => out.push({ code, severity, recordId, message });
    const objekte = new Set(s.objekte.map(o => o.id)), tasks = new Set(s.tasks.map(t => t.id)), resources = new Set(s.resources.map(r => r.id));
    const keys = new Map();
    for (const t of s.tasks) {
        const first = keys.get(t.planKey);
        if (first !== undefined)
            add('duplicate-plankey', 'error', t.id, `Planschlüssel ${t.planKey} mehrfach vergeben (auch ${first})`);
        else
            keys.set(t.planKey, t.id);
        if (t.objektId && !objekte.has(t.objektId))
            add('dangling-objekt', 'error', t.id, `Planvorgang ${t.planKey}: unbekanntes Objekt`);
    }
    const ks = new Map();
    for (const o of s.objekte) {
        const first = ks.get(o.kostenstelle);
        if (first !== undefined)
            add('duplicate-kostenstelle', 'warning', o.id, `Kostenstelle ${o.kostenstelle} bei mehreren Objekten (auch ${first})`);
        else
            ks.set(o.kostenstelle, o.id);
    }
    for (const a of s.assignments) {
        if (!tasks.has(a.taskId))
            add('dangling-task', 'error', a.id, 'Zuordnung verweist auf einen unbekannten Planvorgang');
        if (!resources.has(a.resourceId))
            add('dangling-resource', 'error', a.id, 'Zuordnung verweist auf eine unbekannte Ressource');
    }
    for (const e of s.events)
        if (!tasks.has(e.taskId))
            add('dangling-task', 'error', e.id, 'Ereignis verweist auf einen unbekannten Planvorgang');
    const numbers = new Map();
    for (const e of s.events) {
        if (typeof e.nummer !== 'string' || !plan_ts_1.EVENT_NUMBER.test(e.nummer)) {
            add('invalid-event-number', 'error', e.id, 'Ereignis-ID fehlt oder hat nicht das Format EV-KOM-JJJJMMTT-Nr');
            continue;
        }
        const first = numbers.get(e.nummer);
        if (first !== undefined)
            add('duplicate-event-number', 'error', e.id, `Ereignis-ID ${e.nummer} mehrfach vergeben (auch ${first})`);
        else
            numbers.set(e.nummer, e.id);
    }
    const edges = new Map();
    for (const d of s.dependencies) {
        if (d.predecessorId === d.successorId) {
            add('self-dependency', 'error', d.id, 'Abhängigkeit zeigt auf sich selbst');
            continue;
        }
        if (!tasks.has(d.predecessorId) || !tasks.has(d.successorId)) {
            add('dangling-dependency', 'error', d.id, 'Abhängigkeit verweist auf einen unbekannten Planvorgang');
            continue;
        }
        edges.set(d.predecessorId, [...(edges.get(d.predecessorId) ?? []), d.successorId]);
    }
    const color = new Map();
    const visit = (n) => {
        color.set(n, 1);
        for (const m of edges.get(n) ?? []) {
            if (color.get(m) === 1)
                return true;
            if (!color.has(m) && visit(m))
                return true;
        }
        color.set(n, 2);
        return false;
    };
    for (const n of edges.keys())
        if (!color.has(n) && visit(n))
            add('dependency-cycle', 'error', n, 'Abhängigkeiten bilden einen Zyklus');
    return out;
}

},
"src/planner/plan-repository.js": function (require, exports, module) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KIND_STATE_KEY = exports.VersionConflictError = void 0;
exports.recordsOf = recordsOf;
class VersionConflictError extends Error {
    kind;
    id;
    constructor(kind, id, detail) {
        super(`Versionskonflikt ${kind} ${id}: ${detail}`);
        this.name = 'VersionConflictError';
        this.kind = kind;
        this.id = id;
    }
}
exports.VersionConflictError = VersionConflictError;
exports.KIND_STATE_KEY = {
    objekt: 'objekte', task: 'tasks', resource: 'resources', assignment: 'assignments', dependency: 'dependencies', event: 'events',
};
function recordsOf(s) {
    return [
        ...s.objekte.map(record => ({ kind: 'objekt', record })),
        ...s.tasks.map(record => ({ kind: 'task', record })),
        ...s.resources.map(record => ({ kind: 'resource', record })),
        ...s.assignments.map(record => ({ kind: 'assignment', record })),
        ...s.dependencies.map(record => ({ kind: 'dependency', record })),
        ...s.events.map(record => ({ kind: 'event', record })),
    ];
}

},
"src/planner/plan-sync.js": function (require, exports, module) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.planDiff = planDiff;
exports.savePlanChanges = savePlanChanges;
const plan_repository_ts_1 = require("./plan-repository.js");
function planDiff(before, after) {
    const old = new Map((0, plan_repository_ts_1.recordsOf)(before).map(r => [r.record.id, r]));
    const next = new Map((0, plan_repository_ts_1.recordsOf)(after).map(r => [r.record.id, r]));
    const created = [], updated = [], removed = [];
    for (const [id, r] of next) {
        const was = old.get(id);
        if (!was)
            created.push(r);
        else if (JSON.stringify(was.record) !== JSON.stringify(r.record))
            updated.push(r);
    }
    for (const [id, r] of old)
        if (!next.has(id))
            removed.push(r);
    return { created, updated, removed };
}
async function savePlanChanges(repo, loaded, edited) {
    const diff = planDiff(loaded.state, edited);
    for (const c of diff.created)
        await repo.put(c.kind, c.record, null);
    for (const u of diff.updated)
        await repo.put(u.kind, u.record, loaded.versions[u.record.id]);
    for (const r of diff.removed)
        await repo.archive(r.kind, r.record.id, loaded.versions[r.record.id]);
    return repo.load();
}

},
"src/planner/stoerungsfall-demo.js": function (require, exports, module) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildStoerungsfall = exports.FALL_WIEDERAUFNAHME = exports.FALL_STOERUNG_VON = void 0;
const plan_ts_1 = require("./plan.js");
exports.FALL_STOERUNG_VON = '2027-08-02';
exports.FALL_WIEDERAUFNAHME = '2027-08-26';
const buildStoerungsfall = () => {
    let s = (0, plan_ts_1.emptyPlan)();
    s = (0, plan_ts_1.addObjekt)(s, '7003 Muster C (fiktiv)');
    const objekt = s.objekte[0].id;
    s = (0, plan_ts_1.addTask)(s, {
        planKey: 'PV-101', objektId: objekt, title: 'Fassadenunterkonstruktion Halle (fiktiv)', area: 'Baufeld Nord', level: 'EG',
        lvRef: 'OZ 05.01.010', sollStart: '2027-07-26', sollEnd: '2027-09-10', istStart: '2027-07-26', istEnd: '', progress: 30,
        status: 'in Arbeit', requiredHeads: 4
    });
    s = (0, plan_ts_1.addTask)(s, {
        planKey: 'PV-102', objektId: objekt, title: 'Verkleidung Halle (fiktiv)', area: 'Baufeld Nord', level: 'EG',
        lvRef: 'OZ 05.02.010', sollStart: '2027-09-20', sollEnd: '2027-10-15'
    });
    s = (0, plan_ts_1.addResource)(s, 'kolonne', 'Kolonne C (Muster)', 4);
    s = (0, plan_ts_1.addResource)(s, 'geraet', 'Hubsteiger C (Muster)', 1);
    const [t1, t2] = s.tasks.map(t => t.id);
    const [kc, hub] = s.resources.map(r => r.id);
    s = (0, plan_ts_1.assign)(s, t1, kc, '2027-07-26', '2027-09-10', 320);
    s = (0, plan_ts_1.assign)(s, t1, hub, '2027-07-26', '2027-09-10', 0);
    s = (0, plan_ts_1.addDependency)(s, t1, t2, 'EA', 6);
    const base = s;
    const recorded = (0, plan_ts_1.createEventFromTask)(base, t1, {
        title: 'Zugang zum Baufeld gesperrt (fiktiv)', from: exports.FALL_STOERUNG_VON,
        istZustand: 'Baufeld Nord nicht zugänglich, Arbeiten nicht möglich', ursache: 'Zugang durch Fremdgewerk belegt'
    }, exports.FALL_STOERUNG_VON);
    const continuing = (0, plan_ts_1.assessEvent)(recorded.state, recorded.event.id, {
        wirkung: 'Unterbrechung',
        ausweichmoeglichkeit: { vorhanden: 'Teilweise', beschreibung: 'Vorarbeiten im Lager möglich, keine Montage am Baufeld', genutzt: 'Teilweise' },
        gegenmassnahme: { moeglich: 'Ja', beschreibung: 'Abstimmung mit der Bauleitung über eine Freigabe des Zugangs', durchgefuehrt: 'Ja', wirksam: 'Unklar' },
        nachweise: [
            { art: 'Foto', bezeichnung: 'Foto Zugang Baufeld Nord (fiktiv)' },
            { art: 'E-Mail', bezeichnung: 'Mitteilung an Bauleitung vom Folgetag (fiktiv)' },
            { art: 'Bautagesbericht', bezeichnung: 'Tagesbericht Störungsbeginn (fiktiv)' },
            { art: 'Plan', bezeichnung: 'Planmarkierung gesperrter Bereich (fiktiv)' }
        ]
    });
    const resumed = (0, plan_ts_1.endEvent)(continuing, recorded.event.id, exports.FALL_WIEDERAUFNAHME);
    return { base, recorded, continuing, resumed };
};
exports.buildStoerungsfall = buildStoerungsfall;

},
"src/core/disruption.js": function (require, exports, module) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disruptionLabel = exports.isDisruptionId = void 0;
exports.splitReasons = splitReasons;
exports.toggleDisruptionId = toggleDisruptionId;
const CODE = /^ST-\d{3}$/;
const isDisruptionId = (value) => CODE.test(value);
exports.isDisruptionId = isDisruptionId;
function splitReasons(reasons = []) {
    return { kinds: reasons.filter(reason => !(0, exports.isDisruptionId)(reason)), disruptionIds: reasons.filter(exports.isDisruptionId) };
}
function toggleDisruptionId(reasons, id, on) {
    if (!(0, exports.isDisruptionId)(id))
        return [...reasons];
    const { kinds, disruptionIds } = splitReasons(reasons);
    const next = new Set(disruptionIds);
    if (on)
        next.add(id);
    else
        next.delete(id);
    return [...kinds, ...[...next].sort()];
}
const disruptionLabel = (catalog, id) => catalog.find(entry => entry.id === id)?.label ?? id;
exports.disruptionLabel = disruptionLabel;

},
"src/behinderung/wording.js": function (require, exports, module) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PERIOD_LABELS = exports.PERSONAL_TEXT = exports.FIXED_TEXT = void 0;
exports.FIXED_TEXT = {
    title: 'Anzeige einer Behinderung (Beispieltext)',
    salutation: 'Sehr geehrte Damen und Herren,',
    intro: (project) => `zum Bauvorhaben ${project || '________'} teilen wir mit, dass die vereinbarte Leistungsausführung derzeit behindert ist oder behindert werden kann. Als Gründe nennen wir:`,
    detailsHead: 'Nähere Erläuterung:',
    periodsIntro: 'Die genannten Gründe liegen nicht in unserem Einflussbereich. Wir gehen daher davon aus, dass sich die Ausführungsfristen um die Dauer der Behinderung verlängern. Voraussichtliche Angaben:',
    claims: 'Aus der Behinderung können sich weitere vertragliche Folgen ergeben; diese werden gesondert geprüft.',
    confirmBy: (date) => `Wir bitten um Ihre Bestätigung bis ${date || '________'}.`,
    closing: 'Mit freundlichen Grüßen',
    signature: '(Unterschrift Auftragnehmer)',
    confirmation: '(Bestätigung des Auftraggebers)',
};
exports.PERSONAL_TEXT = {
    title: 'Behinderungsanzeige',
    salutation: 'Guten Tag,',
    intro: (project) => `zum Bauvorhaben ${project || '________'} möchten wir Sie darüber informieren, dass wir bei der Ausführung unserer Leistungen behindert sind. Die Gründe im Überblick:`,
    detailsHead: 'Dazu im Einzelnen:',
    periodsIntro: 'Die Gründe liegen nicht in unserem Einflussbereich. Wir rechnen deshalb damit, dass sich die Ausführung um die Dauer der Behinderung verschiebt. Unsere bisherige Einschätzung:',
    claims: 'Welche weiteren Folgen sich daraus ergeben, besprechen wir gern gesondert mit Ihnen.',
    confirmBy: (date) => `Wir freuen uns über Ihre kurze Bestätigung bis zum ${date || '________'}.`,
    closing: 'Freundliche Grüße',
    signature: '(Unterschrift Auftragnehmer)',
    confirmation: '(Bestätigung des Auftraggebers)',
};
exports.PERIOD_LABELS = [
    ['Voraussichtliche Dauer der Behinderung', 'Arbeitstage'],
    ['Zeit bis zur Wiederaufnahme der Arbeiten', 'Arbeitstage'],
    ['Zusätzlicher Zeitbedarf durch verschobene Ausführung', 'Arbeitstage'],
    ['Voraussichtlicher neuer Fertigstellungstermin', ''],
];

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
  globalThis.PlannerApp = Object.freeze(Object.assign({}, load("preview/planner-app.js"), { css: ":root, :host, .pl-app {\n  color-scheme: light;\n  --ink: #14252c; --muted: #40594e; --line: #b4c5ba; --line-soft: #e3ebe5; --line-strong: #6f8478;\n  --paper: #f5f7f4; --panel: #fff; --band: #eef3ef;\n  --teal: #0a665e; --teal-d: #084f47; --lime: #d5f28a; --focus: #0a665e; --on-teal: #fff; --on-stoer: #fff;\n  --soll: #5b8db0; --soll-soft: #dbe8f0; --soll-line: #5f8aa8; --ist: #0a665e;\n  --stoer: #a8321f; --stoer-soft: #f6d9d2; --gear: #e8e6df; --gear-line: #8b8573;\n  --weekend: #f4efe6; --note-bg: #fff6e8; --note-ink: #63380d; --note-line: #a86a1c; --ok-bg: #e5f3e9; --ok-ink: #1c573a;\n  --s1: 4px; --s2: 8px; --s3: 12px; --s4: 16px; --s5: 24px; --s6: 32px;\n  --day: 30px; --label: 268px; --row: 64px;\n  font-family: \"Segoe UI Variable Text\", \"Segoe UI\", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;\n}\n@media (prefers-color-scheme: dark) {\n  .pl-app[data-scheme=\"auto\"] {\n    color-scheme: dark;\n    --ink: #e6efe9; --muted: #a9bdb1; --line: #43584d; --line-soft: #2a3832; --line-strong: #7e9488;\n    --paper: #11191a; --panel: #172123; --band: #1d2a2c;\n    --teal: #4fb8a8; --teal-d: #3a9a8b; --lime: #b5d96a; --focus: #73b99b; --on-teal: #0b1d1a; --on-stoer: #2a0d07;\n    --soll: #6c9fc2; --soll-soft: #223846; --soll-line: #5d8aa8; --ist: #4fb8a8;\n    --stoer: #ec8b78; --stoer-soft: #4a2520; --gear: #2d2f2a; --gear-line: #85856f;\n    --weekend: #1f2321; --note-bg: #2b2418; --note-ink: #f1d8b0; --note-line: #a8742f; --ok-bg: #1f3a2c; --ok-ink: #bfe8cf;\n  }\n}\n* { box-sizing: border-box; }\n.pl-app { background: var(--paper); color: var(--ink); font-size: 14px; line-height: 1.45; font-variant-numeric: tabular-nums; padding-bottom: var(--s6); }\n.pl-app.standalone { min-height: 100vh; padding: var(--s5) var(--s6) var(--s6); }\n::selection { background: var(--lime); color: #14252c; }\n* { scrollbar-color: var(--line-strong) transparent; }\ninput, select, button, textarea { accent-color: var(--teal); }\n:is(input, select, textarea, button, summary):focus-visible { outline: 3px solid var(--focus); outline-offset: 2px; }\nh1 { font-size: 22px; letter-spacing: -.01em; margin: 0 0 var(--s1); text-wrap: balance; }\nh2 { font-size: 15px; margin: var(--s6) 0 var(--s2); }\n.pl-sync { display: flex; align-items: center; gap: var(--s3); flex-wrap: wrap; min-height: 32px; margin: 0 0 var(--s2); padding: var(--s1) 0; color: var(--muted); font-size: 13px; }\n.pl-panel .pl-sync { padding: var(--s2) var(--s4); margin: 0; }\n.pl-period { display: flex; align-items: center; flex-wrap: wrap; gap: var(--s2) var(--s3); margin: 0 0 var(--s3); }\n.pl-period .seg { margin: 0; }\n.pl-scale { display: flex; flex-wrap: wrap; align-items: center; gap: var(--s2) var(--s3); margin-left: auto; }\n.pl-period-label { font-size: 14px; min-width: 15ch; text-align: center; }\n@media (max-width: 640px) { .pl-scale { margin-left: 0; } .pl-period-label { flex: 1 1 100%; text-align: left; } }\n.pl-sync.saved { color: var(--ok-ink); }\n.pl-sync.conflict, .pl-sync.error { color: var(--stoer); font-weight: 600; background: var(--stoer-soft); padding-inline: var(--s3); border-radius: 6px; }\n.pl-sync button { font: inherit; font-weight: 600; padding: var(--s1) var(--s3); border: 1px solid var(--teal); border-radius: 6px; cursor: pointer; }\n.pl-note { margin: 0; color: var(--muted); max-width: 72ch; }\n.pl-scroll { overflow-x: auto; background: var(--panel); border: 1px solid var(--line); border-radius: 10px; }\n.pl-grid { display: grid; grid-template-columns: var(--label) repeat(var(--n), minmax(var(--day), 1fr)); min-width: calc(var(--label) + var(--n) * var(--day)); position: relative; }\n.pl-lab { position: sticky; left: 0; z-index: 4; background: var(--panel); padding: var(--s2) var(--s3); border-right: 1px solid var(--line); border-bottom: 1px solid var(--line-soft); display: flex; flex-direction: column; justify-content: center; gap: 1px; min-height: 36px; }\n.pl-lab.task { min-height: var(--row); }\n.pl-lab.sec { background: var(--band); min-height: 30px; color: var(--muted); font-size: 12px; font-weight: 600; letter-spacing: .01em; }\n.pl-lab small { color: var(--muted); font-size: 12px; line-height: 1.3; }\n.pl-lab .nm { font-weight: 600; display: flex; align-items: baseline; gap: var(--s2); }\n.pl-lab .nm .taskbtn { flex: 1 1 auto; min-width: 0; text-align: left; }\n.pl-lab .nm button.quiet { flex: none; min-height: 24px; font-size: 12px; }\n.pl-corner { position: sticky; left: 0; z-index: 4; background: var(--panel); border-right: 1px solid var(--line); border-bottom: 1px solid var(--line); padding: var(--s3); color: var(--muted); font-size: 12px; display: flex; align-items: flex-end; }\n.pl-kw, .pl-dd { text-align: center; border-left: 1px solid var(--line-soft); background: var(--panel); }\n.pl-kw { font-size: 12px; font-weight: 600; padding: var(--s2) 0 var(--s1); }\n.pl-kw .rng { font-weight: 400; color: var(--muted); margin-left: var(--s1); }\n.pl-dd { font-size: 11px; line-height: 1.25; padding: 0 0 var(--s2); border-bottom: 1px solid var(--line); color: var(--muted); }\n.pl-dd span { display: block; }\n.pl-dd.we { background: var(--weekend); }\n.pl-dd.today { background: var(--lime); color: #14252c; font-weight: 700; }\n.pl-cell { border-left: 1px solid var(--line-soft); border-bottom: 1px solid var(--line-soft); }\n.pl-cell.we { background: var(--weekend); }\n.pl-cell.today { position: relative; }\n.pl-cell.today::before { content: ''; position: absolute; inset-block: 0; inset-inline-start: 0; width: 2px; background: var(--teal); }\n.pl-cell.secbg { background: var(--band); }\n.bar { z-index: 2; margin-inline: 1px; border-radius: 4px; min-width: 0; }\n.bar.soll { align-self: center; transform: translateY(-8px); height: 12px; background: var(--soll); }\n.bar.soll { position: relative; cursor: grab; touch-action: pan-y; }\n.bar.soll:focus-visible { outline: 3px solid var(--focus); outline-offset: 2px; }\n.bar.soll.dragging { cursor: grabbing; z-index: 5; opacity: .92; }\n.grip { position: absolute; top: -4px; bottom: -1px; width: 10px; cursor: ew-resize; touch-action: pan-y; }\n.grip[data-edge=\"s\"] { inset-inline-start: -3px; } .grip[data-edge=\"e\"] { inset-inline-end: -3px; }\n.grip::after { content: ''; position: absolute; top: 5px; bottom: 2px; inset-inline-start: 3px; width: 3px; border-radius: 2px; background: var(--panel); opacity: 0; transition: opacity .12s; }\n.bar.soll:hover .grip::after, .bar.soll:focus-visible .grip::after, .bar.soll.dragging .grip::after { opacity: 1; }\n@media (prefers-reduced-motion: reduce) { .grip::after { transition: none; } }\n@media (max-width: 640px), (hover: none), (pointer: coarse) {\n  .grip { width: 16px; top: -9px; bottom: -3px; }\n  .grip::after { opacity: 1; top: 8px; bottom: 5px; }\n  .bar.soll::before { content: ''; position: absolute; inset: -9px 0 -3px; }\n}\n.pl-live { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }\n.pl-dragtip { position: fixed; z-index: 1200; pointer-events: none; padding: 4px 8px; border-radius: 6px; background: var(--ink); color: var(--paper); font-size: 12px; white-space: nowrap; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); }\n.pl-move { display: flex; align-items: center; flex-wrap: wrap; gap: var(--s2) var(--s3); margin: 0 0 var(--s3); padding: var(--s2) var(--s3); border-radius: 6px; background: var(--ok-bg); color: var(--ok-ink); }\n.pl-move.err { background: var(--stoer-soft); color: var(--stoer); font-weight: 600; }\n.bar.ist { align-self: center; transform: translateY(8px); height: 12px; background: var(--ist); }\n.bar.res { align-self: center; height: 22px; background: var(--soll-soft); border: 1px solid var(--soll-line); color: var(--ink); font-size: 11px; line-height: 20px; padding-inline: 6px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }\n.bar.res.geraet { background: var(--gear); border-color: var(--gear-line); }\n.bar.res.doppelt { z-index: 3; display: flex; align-items: center; justify-content: flex-end; padding-inline: 2px; background: repeating-linear-gradient(135deg, transparent 0 6px, color-mix(in srgb, var(--stoer) 30%, transparent) 6px 7px); border: 1.5px solid var(--stoer); }\n.dbl-chip { padding: 0 6px; border-radius: 3px; background: var(--stoer-soft); color: var(--stoer); font-weight: 600; line-height: 16px; }\n.bar.event { align-self: center; height: 22px; background: var(--stoer); color: var(--on-stoer); font-size: 11px; line-height: 22px; padding-inline: 8px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }\n.bar.event.open { border-radius: 4px 0 0 4px; }\n.bar.clip-s { border-top-left-radius: 0; border-bottom-left-radius: 0; margin-left: 0; }\n.bar.clip-e { border-top-right-radius: 0; border-bottom-right-radius: 0; margin-right: 0; }\n.dep-layer { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; overflow: visible; }\n.dep-arrow { fill: none; stroke: var(--muted); stroke-width: 1.5; stroke-linejoin: round; stroke-linecap: round; }\n.dep-arrow.broken { stroke: var(--stoer); stroke-dasharray: 4 3; }\n.dep-head { fill: var(--muted); } .dep-head.broken { fill: var(--stoer); }\n.taskbtn { all: unset; cursor: pointer; font-weight: 600; border-radius: 3px; }\n.taskbtn:hover { text-decoration: underline; text-underline-offset: 3px; text-decoration-color: var(--teal); }\n.taskbtn:focus-visible { outline: 3px solid var(--focus); outline-offset: 2px; }\n.pl-legend { display: flex; flex-wrap: wrap; gap: var(--s2) var(--s4); padding: var(--s3) var(--s4); border-top: 1px solid var(--line-soft); color: var(--muted); font-size: 12px; align-items: center; }\n.pl-legend .it { display: inline-flex; align-items: center; gap: 6px; }\n.pl-legend .hint { flex-basis: 100%; }\n.pl-legend svg { display: block; }\n.sw { width: 18px; height: 8px; border-radius: 2px; display: inline-block; }\n.list { list-style: none; margin: 0; padding: 0; }\n.list li { display: flex; flex-wrap: wrap; align-items: baseline; gap: var(--s1) var(--s3); padding: var(--s2) 0; border-bottom: 1px solid var(--line-soft); max-width: 900px; }\n.list li:last-child { border-bottom: 0; }\n.list.events li { flex-direction: column; align-items: flex-start; padding: var(--s3) 0; }\n.evt-head { display: flex; flex-wrap: wrap; align-items: baseline; gap: var(--s1) var(--s3); }\n.list.events .row { margin-top: var(--s2); }\n.tag { display: inline-block; padding: 1px 8px; border-radius: 10px; font-size: 12px; font-weight: 600; background: var(--ok-bg); color: var(--ok-ink); }\n.tag.warn { background: var(--note-bg); color: var(--note-ink); box-shadow: inset 0 0 0 1px var(--note-line); }\n.tag.stoer { background: var(--stoer-soft); color: var(--stoer); }\n.muted { color: var(--muted); }\n.empty { color: var(--muted); margin: 0; }\ndetails.add { margin-top: var(--s3); }\ndetails.add > summary { cursor: pointer; color: var(--teal); font-weight: 600; width: fit-content; border-radius: 3px; }\nform.frm { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: var(--s3); align-items: end; margin-top: var(--s3); max-width: 900px; }\nform.evt { display: grid; gap: var(--s3); margin: var(--s4) 0; max-width: 640px; padding: var(--s4) 0 0; border-top: 1px solid var(--line); }\nform label { display: grid; gap: var(--s1); font-size: 12px; color: var(--muted); }\nform .row { display: flex; gap: var(--s2); flex-wrap: wrap; }\n.pl-app .row { display: flex; gap: var(--s2); flex-wrap: wrap; margin-top: var(--s3); }\nform.frm :is(select, input, textarea) { width: 100%; min-width: 0; }\ninput, select, textarea { font: inherit; color: var(--ink); background: var(--panel); padding: 7px 10px; border: 1px solid var(--line-strong); border-radius: 6px; min-height: 36px; }\nbutton { font: inherit; cursor: pointer; padding: 7px 14px; border-radius: 6px; border: 1px solid var(--teal); background: transparent; color: var(--teal); min-height: 36px; font-weight: 600; }\nbutton:hover { background: var(--ok-bg); }\nbutton:not(.segbtn, .taskbtn, .chain-link) { background: var(--teal); color: var(--on-teal); }\nbutton:not(.segbtn, .taskbtn, .chain-link):hover { background: var(--teal-d); }\nbutton.primary { background: var(--teal); color: var(--on-teal); } button.primary:hover { background: var(--teal-d); }\nbutton.ico-btn { display: inline-flex; align-items: center; gap: var(--s2); }\n.ico { flex: none; width: 16px; height: 16px; }\nbutton.quiet .ico { width: 14px; height: 14px; }\n.pl-lab .nm button.quiet .ico { width: 14px; height: 14px; }\nbutton.icon-only { padding-inline: var(--s2); min-width: 28px; justify-content: center; }\nbutton.quiet { padding-inline: var(--s2); min-height: 28px; font-weight: 600; }\n.snap { color: var(--muted); font-size: 12px; margin: 0; max-width: 70ch; }\n.err { color: var(--stoer); margin: 0; font-weight: 600; }\ntable { border-collapse: collapse; width: 100%; max-width: 900px; min-width: 560px; }\n.tw { overflow-x: auto; max-width: 900px; }\n.tw table { max-width: none; }\n.tw.wide { max-width: none; }\n.tw.wide table { width: 100%; table-layout: fixed; min-width: calc(180px + var(--n, 5) * 120px); }\n.tw.wide th:first-child { width: 180px; }\n.tw.wide td, .tw.wide th { white-space: normal; overflow-wrap: break-word; vertical-align: top; }\n@media (max-width: 640px) { .tw.wide th:first-child { width: 130px; } .tw.wide table { min-width: calc(130px + var(--n, 5) * 120px); } }\ntd, th { white-space: nowrap; }\nth { text-align: left; font-size: 12px; font-weight: 600; color: var(--muted); padding: var(--s2) var(--s3) var(--s2) 0; border-bottom: 1px solid var(--line); }\ntd { padding: var(--s2) var(--s3) var(--s2) 0; border-bottom: 1px solid var(--line-soft); }\ntd.cell { padding: var(--s2) var(--s3); }\n.cell-tasks { display: block; font-size: 12px; font-weight: 400; }\ntd.frei { color: var(--muted); } td.verplant { background: var(--ok-bg); color: var(--ok-ink); } td.doppelt { background: var(--stoer-soft); color: var(--stoer); font-weight: 600; }\n@media (max-width: 640px), (pointer: coarse) {\n  button, .segbtn, input, select { min-height: 44px; }\n  button.quiet { min-height: 44px; }\n  .pl-lab .nm button.quiet, .pl-lab .nm .taskbtn { position: relative; min-height: 24px; }\n  .pl-lab .nm button.quiet::after, .pl-lab .nm .taskbtn::after { content: ''; position: absolute; inset: -10px -4px; }\n}\n@media (max-width: 640px) {\n  :root { --label: 150px; --day: 26px; }\n  .pl-app.standalone { padding-inline: var(--s3); }\n}\nfieldset.assess { display: grid; gap: var(--s3); margin: 0; padding: var(--s3) var(--s4); border: 1px solid var(--line-strong); border-radius: 6px; }\nfieldset.assess legend { font-size: 12px; font-weight: 600; color: var(--muted); padding: 0 var(--s2); }\nfieldset.assess label { display: grid; gap: var(--s1); }\n.seg { display: inline-flex; border: 1px solid var(--line-strong); border-radius: 6px; overflow: hidden; margin: 0 0 var(--s3); }\n.segbtn { border: 0; border-right: 1px solid var(--line-strong); background: transparent; padding: var(--s2) var(--s4); font: inherit; font-size: 13px; cursor: pointer; color: var(--muted); }\n.segbtn:last-child { border-right: 0; }\n.segbtn[aria-pressed=\"true\"] { background: var(--band); color: inherit; font-weight: 600; }\n.segbtn:focus-visible { outline: 2px solid var(--teal); outline-offset: -2px; }\n.cell-tasks.dbl { font-weight: 600; }\n.pl-panel-wrap { position: fixed; inset: 0; z-index: 1000; }\n.pl-scrim { position: absolute; inset: 0; background: rgba(20, 37, 44, 0.38); }\n.pl-panel { position: absolute; top: 0; right: 0; bottom: 0; width: min(440px, 100vw); display: flex; flex-direction: column; background: var(--panel); color: var(--ink); border-left: 1px solid var(--line-strong); box-shadow: -12px 0 28px rgba(0, 0, 0, 0.18); }\n.pl-panel.enter { animation: pl-slide-in 0.2s ease-out; }\n@keyframes pl-slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }\n.pl-panel-head { display: flex; align-items: center; justify-content: space-between; gap: var(--s3); padding: var(--s4); border-bottom: 1px solid var(--line); }\n.pl-panel-head h2 { margin: 0; font-size: 16px; }\n.pl-panel .pl-letter { display: grid; gap: var(--s3); align-content: start; padding: var(--s4); overflow-y: auto; flex: 1 1 auto; }\n.pl-panel .pl-letter p, .pl-panel .pl-letter ul { margin: 0; }\n.pl-panel form.panel-form { display: grid; grid-template-columns: 1fr; gap: var(--s3); align-items: start; margin: 0; max-width: none; padding: var(--s4); overflow-y: auto; flex: 1 1 auto; align-content: start; }\n.pl-panel form.panel-form .row { position: sticky; bottom: calc(-1 * var(--s4)); display: flex; gap: var(--s3); margin: var(--s2) calc(-1 * var(--s4)) calc(-1 * var(--s4)); padding: var(--s3) var(--s4); background: var(--panel); border-top: 1px solid var(--line); }\n.pl-confirm { display: flex; align-items: center; gap: var(--s3); flex-wrap: wrap; padding: var(--s3) var(--s4); background: var(--note-bg); color: var(--note-ink); border-bottom: 1px solid var(--note-line); font-weight: 600; }\n.pl-confirm span { flex: 1 1 100%; }\n@media (prefers-reduced-motion: reduce) { .pl-panel.enter { animation: none; } }\n.pl-card { background: var(--panel); border: 1px solid var(--line); border-radius: 10px; margin: 0 0 var(--s4); min-width: 0; }\n.pl-card-head { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--s2) var(--s3); padding: var(--s3) var(--s4); border-bottom: 1px solid var(--line-soft); }\n.pl-card-head h2 { margin: 0; font-size: 16px; }\n.pl-card-actions { display: flex; flex-wrap: wrap; gap: var(--s2); }\n.pl-card-head .seg { margin: 0; }\n.pl-card-body { padding: var(--s4); min-width: 0; }\n.pl-card-body h3 { font-size: 13px; font-weight: 600; color: var(--muted); margin: var(--s5) 0 var(--s2); }\n.pl-card-body > h3:first-child { margin-top: 0; }\n.pl-card .pl-scroll { border: 0; border-radius: 0; margin-inline: calc(-1 * var(--s4)); border-top: 1px solid var(--line-soft); }\n.pl-card .pl-scroll:last-child { margin-bottom: calc(-1 * var(--s4)); border-radius: 0 0 10px 10px; }\n.pl-card .pl-period { margin-bottom: var(--s3); }\n.pl-card .pl-sync { margin: 0 0 var(--s1); }\n.pl-card .list li { max-width: none; }\n.pl-card .tw, .pl-card .tw.wide { max-width: none; }\n.pl-card table { max-width: none; min-width: 0; }\n.pl-card .tw:not(.wide) table { min-width: 480px; }\n.pl-card .pl-card-body > .row { margin-top: var(--s3); }\n.pl-cols { display: grid; grid-template-columns: minmax(0, 1fr); gap: 0 var(--s4); align-items: start; }\n.pl-card .list.events { display: grid; gap: var(--s3); }\n.pl-card .list.events li { padding: var(--s3); border: 1px solid var(--line-soft); border-radius: 8px; background: var(--band); gap: var(--s1); }\n.pl-card .list.events .row { margin-top: var(--s2); }\n@media (max-width: 640px) { .pl-card-head, .pl-card-body { padding-inline: var(--s3); } .pl-card .pl-scroll { margin-inline: calc(-1 * var(--s3)); } }\n.pl-card .tw:not(.wide) table { min-width: 0; }\n.pl-card .tw:not(.wide) :is(td, th) { white-space: normal; }\n.pl-card .tw:not(.wide) td:last-child { white-space: nowrap; }\n.pl-toasts { position: fixed; z-index: 1100; inset-inline: var(--s3); bottom: var(--s4); display: flex; justify-content: center; pointer-events: none; }\n.pl-toast { pointer-events: auto; display: flex; align-items: center; flex-wrap: wrap; gap: var(--s2) var(--s3); max-width: min(760px, 100%); padding: var(--s2) var(--s3) var(--s2) var(--s4); border-radius: 10px; background: var(--ink); color: var(--paper); font-size: 14px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28); animation: pl-toast-in 0.18s ease-out; }\n.pl-toast-text { font-weight: 600; margin-right: var(--s2); }\n.pl-toast button { color: var(--paper); border: 1px solid color-mix(in srgb, var(--paper) 55%, transparent); background: transparent; min-height: 32px; font-weight: 600; }\n.pl-toast button:hover { background: color-mix(in srgb, var(--paper) 16%, transparent); }\n.pl-toast button.icon-only { border-color: transparent; }\n.pl-toast :is(button):focus-visible { outline: 3px solid var(--lime); outline-offset: 2px; }\n@keyframes pl-toast-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }\n@media (prefers-reduced-motion: reduce) { .pl-toast { animation: none; } }\n@media (max-width: 640px), (pointer: coarse) { .pl-toast button { min-height: 44px; } }\n.pl-card-foot { display: flex; align-items: center; justify-content: flex-end; flex-wrap: wrap; gap: var(--s2) var(--s4); padding: var(--s3) var(--s4); border-top: 1px solid var(--line-soft); background: var(--band); border-radius: 0 0 10px 10px; }\n.pl-card .pl-scroll:last-child { margin-bottom: calc(-1 * var(--s4)); border-radius: 0; }\n@media (max-width: 640px) { .pl-card-foot { padding-inline: var(--s3); } .pl-card-foot .pl-card-actions { width: 100%; } }\n.evt-list { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--s3); }\n.evt-card { border: 1px solid var(--line); border-radius: 8px; background: var(--panel); overflow: hidden; }\n.evt-card-head { display: flex; flex-wrap: wrap; align-items: baseline; gap: var(--s1) var(--s3); padding: var(--s3) var(--s4); background: var(--band); border-bottom: 1px solid var(--line-soft); }\n.evt-card-head strong { font-size: 15px; }\n.evt-card-actions { padding: var(--s3) var(--s4); border-top: 1px solid var(--line-soft); }\n.evt-note { margin: 0; padding: 0 var(--s4) var(--s3); color: var(--muted); font-size: 13px; }\n@media (max-width: 640px) { .evt-card-head, .evt-card-actions, .evt-note { padding-inline: var(--s3); } }\n.evt-card { container-type: inline-size; }\n.chain { list-style: none; margin: 0; padding: var(--s4) var(--s4) var(--s3); display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--s4) var(--s3); }\n@container (min-width: 520px) { .chain { grid-template-columns: repeat(3, minmax(0, 1fr)); } }\n@container (min-width: 720px) { .chain { grid-template-columns: repeat(5, minmax(0, 1fr)); } }\n.chain-step { position: relative; min-width: 0; display: flex; flex-direction: column; gap: 2px; padding-top: var(--s3); border-top: 2px solid var(--line); }\n.chain-step::before { content: \"\"; position: absolute; top: -6px; left: 0; width: 10px; height: 10px; box-sizing: border-box; border-radius: 50%; background: var(--panel); border: 2px solid var(--line-strong); }\n.chain-step[data-state=\"recorded\"] { border-top-color: var(--teal); }\n.chain-step[data-state=\"recorded\"]::before { background: var(--teal); border-color: var(--teal); }\n.chain-step[data-state=\"available\"] { border-top-color: var(--teal); }\n.chain-step[data-state=\"available\"]::before { border-color: var(--teal); }\n.chain-step[data-state=\"unavailable\"] { border-top-style: dashed; }\n.chain-step[data-state=\"ongoing\"] { border-top-color: var(--stoer); }\n.chain-step[data-state=\"ongoing\"]::before { background: var(--stoer); border-color: var(--stoer); }\n.chain-label { color: var(--muted); font-size: 12px; font-weight: 600; }\n.chain-value { font-weight: 700; overflow-wrap: anywhere; }\n.chain-step[data-state=\"notStated\"] .chain-value { color: var(--muted); font-weight: 400; }\n.chain-detail { color: var(--muted); font-size: 12px; overflow-wrap: anywhere; }\n.chain-link { align-self: flex-start; padding: 0; border: 0; background: none; font: inherit; font-weight: 700; color: var(--teal); text-align: left; text-decoration: underline; text-underline-offset: 3px; cursor: pointer; min-height: 24px; }\n.chain .sr-only { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }\n@media (pointer: coarse) { .chain-link { min-height: 44px; display: inline-flex; align-items: center; } }\n.pl-kbd { margin-left: var(--s2); padding: 0 6px; border: 1px solid color-mix(in srgb, var(--paper) 55%, transparent); border-radius: 4px; font: inherit; font-size: 12px; font-weight: 500; }\n.pl-scroll { cursor: grab; }\n.pl-scroll:focus-visible { outline: 3px solid var(--focus); outline-offset: -3px; }\n.pl-lab { cursor: default; }\n.pl-panning, .pl-panning * { cursor: grabbing !important; user-select: none; }\n.pl-grid[data-density=\"kompakt\"] .pl-dd .wd, .pl-grid[data-density=\"dicht\"] .pl-dd .wd { display: none; }\n.pl-grid[data-density=\"kompakt\"] .pl-kw .rng, .pl-grid[data-density=\"dicht\"] .pl-kw .rng { display: none; }\n.pl-grid[data-density=\"kompakt\"] .pl-dd { font-size: 10px; padding-top: var(--s1); }\n.pl-grid[data-density=\"dicht\"] .pl-dd { font-size: 10px; padding-top: var(--s1); border-left-color: transparent; }\n.pl-grid[data-density=\"dicht\"] .pl-dd .dn { visibility: hidden; }\n.pl-grid[data-density=\"dicht\"] .pl-dd.mon { position: relative; z-index: 1; border-left-color: var(--line-soft); }\n.pl-grid[data-density=\"dicht\"] .pl-dd.mon .dn { visibility: visible; position: absolute; inset-inline-start: 2px; white-space: nowrap; }\n.pl-grid[data-density=\"dicht\"] .pl-cell:not(.mon) { border-left-color: transparent; }\n.pl-grid[data-weeks=\"26\"] .pl-kw .kwp { display: none; }\n.pl-grid[data-density=\"dicht\"] { overflow: hidden; }       \n.zoomseg .segbtn { display: inline-flex; align-items: center; justify-content: center; min-width: 44px; }\n.segbtn:disabled { opacity: .45; cursor: not-allowed; }\n.zoomseg .ico { width: 16px; height: 16px; }\n@media (max-width: 640px) { .segbtn .u { display: none; } .segbtn[data-weeks] { padding-inline: var(--s3); } }" }, { build: "sha256:2ca4f80b1d8c3d76" }));
})();
