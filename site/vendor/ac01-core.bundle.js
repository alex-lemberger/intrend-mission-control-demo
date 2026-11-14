/* GENERATED FILE - do not edit. Source: mission-control-spfx, content sha256:63cd4e1088e8b940, src/compat/ac01-classic.js, src/core/index.js, src/compat/ac01-demo-api.js, src/demo/demo-data.js, src/core/types.js, src/core/ids.js, src/core/time.js, src/core/factories.js, src/core/recognizer.js, src/core/summarize.js, src/core/prefill.js, src/core/bulk.js.
 * Rebuild: node mission-control-spfx/scripts/build-classic-bundle.mjs --entry ac01-core <this file>
 * Synthetic prototype. Templates, hours and checks are drafts, not approved rules. */
(function () {
  'use strict';
  const defs = {
"src/compat/ac01-classic.js": function (require, exports, module) {
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDemoData = exports.createAC01Demo = void 0;
__exportStar(require("../core/index.js"), exports);
var ac01_demo_api_ts_1 = require("./ac01-demo-api.js");
Object.defineProperty(exports, "createAC01Demo", { enumerable: true, get: function () { return ac01_demo_api_ts_1.createAC01Demo; } });
var demo_data_ts_1 = require("../demo/demo-data.js");
Object.defineProperty(exports, "createDemoData", { enumerable: true, get: function () { return demo_data_ts_1.createDemoData; } });

},
"src/core/index.js": function (require, exports, module) {
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyBulk = exports.prefillEmployees = exports.isPristine = exports.summarize = exports.parseDemonstrationText = exports.newEvent = exports.newEmployee = exports.newAssignment = exports.employeeLabel = exports.normalizeName = exports.fromMinutes = exports.toMinutes = exports.nextId = void 0;
__exportStar(require("./types.js"), exports);
var ids_ts_1 = require("./ids.js");
Object.defineProperty(exports, "nextId", { enumerable: true, get: function () { return ids_ts_1.nextId; } });
var time_ts_1 = require("./time.js");
Object.defineProperty(exports, "toMinutes", { enumerable: true, get: function () { return time_ts_1.toMinutes; } });
Object.defineProperty(exports, "fromMinutes", { enumerable: true, get: function () { return time_ts_1.fromMinutes; } });
Object.defineProperty(exports, "normalizeName", { enumerable: true, get: function () { return time_ts_1.normalizeName; } });
Object.defineProperty(exports, "employeeLabel", { enumerable: true, get: function () { return time_ts_1.employeeLabel; } });
var factories_ts_1 = require("./factories.js");
Object.defineProperty(exports, "newAssignment", { enumerable: true, get: function () { return factories_ts_1.newAssignment; } });
Object.defineProperty(exports, "newEmployee", { enumerable: true, get: function () { return factories_ts_1.newEmployee; } });
Object.defineProperty(exports, "newEvent", { enumerable: true, get: function () { return factories_ts_1.newEvent; } });
var recognizer_ts_1 = require("./recognizer.js");
Object.defineProperty(exports, "parseDemonstrationText", { enumerable: true, get: function () { return recognizer_ts_1.parseDemonstrationText; } });
var summarize_ts_1 = require("./summarize.js");
Object.defineProperty(exports, "summarize", { enumerable: true, get: function () { return summarize_ts_1.summarize; } });
var prefill_ts_1 = require("./prefill.js");
Object.defineProperty(exports, "isPristine", { enumerable: true, get: function () { return prefill_ts_1.isPristine; } });
Object.defineProperty(exports, "prefillEmployees", { enumerable: true, get: function () { return prefill_ts_1.prefillEmployees; } });
var bulk_ts_1 = require("./bulk.js");
Object.defineProperty(exports, "applyBulk", { enumerable: true, get: function () { return bulk_ts_1.applyBulk; } });

},
"src/compat/ac01-demo-api.js": function (require, exports, module) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAC01Demo = createAC01Demo;
const index_ts_1 = require("../core/index.js");
function createAC01Demo(data) {
    const { directory, demoPeople, yesterdayEntries, eventReasons } = data;
    const listStaff = (includeOffice) => directory.filter(entry => includeOffice || entry.group !== 'office');
    return {
        parse: index_ts_1.parseDemonstrationText, eventReasons, summarize: index_ts_1.summarize, toMinutes: index_ts_1.toMinutes, newEmployee: index_ts_1.newEmployee, newAssignment: index_ts_1.newAssignment, newEvent: index_ts_1.newEvent,
        applyBulk: index_ts_1.applyBulk, prefillEmployees: index_ts_1.prefillEmployees, isPristine: index_ts_1.isPristine, demoPeople, directory, listStaff, yesterdayEntries,
    };
}

},
"src/demo/demo-data.js": function (require, exports, module) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDemoData = createDemoData;
const pad2 = (number) => String(number).padStart(2, '0');
function createDemoData() {
    const directory = [
        ...Array.from({ length: 25 }, (_, i) => ({ id: `own-${pad2(i + 1)}`, group: 'own', label: `Demo-Person ${pad2(i + 1)}`, role: i < 3 ? 'Vorarbeiter' : 'Monteur' })),
        ...[1, 2].map((i) => ({ id: `office-${pad2(i)}`, group: 'office', label: `Demo-Büro ${pad2(i)}`, role: 'Büro' })),
        ...[['Alpha', 5], ['Bravo', 4], ['Charlie', 3]].flatMap(([firm, count]) => Array.from({ length: count }, (_, i) => ({ id: `sub-${firm.toLowerCase()}-${pad2(i + 1)}`, group: 'sub', firm, label: `${firm} Monteur-${i + 1}`, role: 'Monteur' }))),
    ];
    return {
        directory,
        demoPeople: directory.filter(entry => entry.group === 'own').map(entry => entry.label),
        yesterdayEntries: directory.filter(entry => entry.group === 'own').slice(0, 22),
        eventReasons: ['Baubehinderung', 'Stundenzettel', 'Bedenken', 'Nachtrag / Nachtragsposition', 'Sonstiges'],
        categoryOptions: ['Wände', 'Decken', 'Spachteln', 'Deckenunterkonstruktion'],
        locationOptions: ['Erdgeschoss', 'Zweites Obergeschoss', 'Drittes Obergeschoss', 'Treppenhaus', 'Flur'],
    };
}

},
"src/core/types.js": function (require, exports, module) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

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
"src/core/time.js": function (require, exports, module) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeeLabel = exports.normalizeName = exports.fromMinutes = exports.toMinutes = void 0;
const toMinutes = (value) => {
    const match = /^(\d{2}):(\d{2})$/.exec(value || '');
    if (!match)
        return null;
    const hours = Number(match[1]), minutes = Number(match[2]);
    return hours < 24 && minutes < 60 ? hours * 60 + minutes : null;
};
exports.toMinutes = toMinutes;
const fromMinutes = (total) => `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
exports.fromMinutes = fromMinutes;
const normalizeName = (name) => String(name || '').trim().replace(/\s+/g, ' ').toLowerCase();
exports.normalizeName = normalizeName;
const employeeLabel = (employee, index) => employee.name.trim() || `Mitarbeiter ${index + 1} (ohne Namen)`;
exports.employeeLabel = employeeLabel;

},
"src/core/factories.js": function (require, exports, module) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newEvent = exports.newEmployee = exports.newAssignment = void 0;
const ids_ts_1 = require("./ids.js");
const newAssignment = (data = {}) => ({
    id: (0, ids_ts_1.nextId)('a'), start: '', end: '', breakMin: '', work: '', lv: '', locations: [], locationDraft: '', photos: [], ...data
});
exports.newAssignment = newAssignment;
const newEmployee = (data = {}) => ({
    id: (0, ids_ts_1.nextId)('e'), name: '', collapsed: false, selected: false, prefill: '', personRef: '', pseudonym: false,
    assignments: [(0, exports.newAssignment)()], ...data
});
exports.newEmployee = newEmployee;
const newEvent = (reasons = [], data = {}) => ({
    id: (0, ids_ts_1.nextId)('v'), reasons: [].concat(reasons).filter(Boolean), location: '', description: '', people: [], ...data
});
exports.newEvent = newEvent;

},
"src/core/recognizer.js": function (require, exports, module) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDemonstrationText = parseDemonstrationText;
const numberWords = { eins: 1, eine: 1, einer: 1, zwei: 2, drei: 3, vier: 4, fünf: 5, sechs: 6 };
function parseDemonstrationText(input) {
    const sentences = String(input).trim().replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/).filter(Boolean);
    const countPattern = '(?<count>drei|3)';
    const first = new RegExp(`^(?:Heute )?haben ${countPattern} Mitarbeiter an den Wänden im zweiten Obergeschoss gearbeitet[.!?]?$`, 'i');
    const second = new RegExp(`^${countPattern} weitere Mitarbeiter haben die Decken im dritten Obergeschoss bearbeitet[.!?]?$`, 'i');
    if (sentences.length !== 2)
        return null;
    const firstMatch = sentences[0].match(first);
    const secondMatch = sentences[1].match(second);
    if (!firstMatch || !secondMatch)
        return null;
    const count = (word) => numberWords[word.toLowerCase()] || Number(word);
    return [
        { count: count(firstMatch.groups.count), work: 'Wände', location: 'Zweites Obergeschoss' },
        { count: count(secondMatch.groups.count), work: 'Decken', location: 'Drittes Obergeschoss' }
    ];
}

},
"src/core/summarize.js": function (require, exports, module) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.summarize = summarize;
const time_ts_1 = require("./time.js");
function summarize({ employees, events }) {
    const nameCounts = new Map();
    const issues = {};
    const missing = [];
    const starts = [], ends = [];
    let unnamed = 0, assignmentCount = 0;
    employees.forEach((employee, employeeIndex) => {
        const label = (0, time_ts_1.employeeLabel)(employee, employeeIndex);
        const key = (0, time_ts_1.normalizeName)(employee.name);
        if (key)
            nameCounts.set(key, (nameCounts.get(key) || 0) + 1);
        else {
            unnamed += 1;
            missing.push(`${label}: Name fehlt`);
        }
        if (!employee.assignments.length)
            missing.push(`${label}: keine Arbeit erfasst`);
        const spans = [];
        employee.assignments.forEach((assignment, assignmentIndex) => {
            assignmentCount += 1;
            const where = `${label}, Arbeit ${assignmentIndex + 1}`;
            const notes = [];
            issues[assignment.id] = notes;
            const start = (0, time_ts_1.toMinutes)(assignment.start), end = (0, time_ts_1.toMinutes)(assignment.end);
            if (start === null)
                missing.push(`${where}: Beginn fehlt`);
            else
                starts.push(start);
            if (end === null)
                missing.push(`${where}: Ende fehlt`);
            else
                ends.push(end);
            if (start !== null && end !== null) {
                if (end <= start) {
                    notes.push('Das Ende liegt nicht nach dem Beginn.');
                    missing.push(`${where}: Ende liegt nicht nach dem Beginn`);
                }
                else
                    spans.push({ id: assignment.id, start, end });
            }
            if (assignment.breakMin !== '') {
                const pause = Number(assignment.breakMin);
                if (!Number.isFinite(pause) || pause < 0 || pause > 480) {
                    notes.push('Die Pause muss zwischen 0 und 480 Minuten liegen.');
                    missing.push(`${where}: Pause ungültig`);
                }
                else if (start !== null && end !== null && end > start && pause > end - start) {
                    notes.push('Die Pause ist länger als die Zeitspanne.');
                    missing.push(`${where}: Pause länger als Zeitspanne`);
                }
            }
            if (!assignment.work.trim() && !assignment.lv.trim())
                missing.push(`${where}: Tätigkeit fehlt`);
            if (!assignment.locations.length && !assignment.locationDraft.trim())
                missing.push(`${where}: Ort fehlt`);
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
                [span.id, next.id].forEach(id => { if (!issues[id].includes(warning))
                    issues[id].push(warning); });
                missing.push(`${label}: sich überschneidende Arbeitszeiten`);
            }
        });
    });
    const duplicates = [...nameCounts].filter(([, count]) => count > 1).map(([name]) => name);
    duplicates.forEach(name => missing.push(`${name} ist mehrfach erfasst und zählt einmal; bitte zusammenführen`));
    const reasonCounts = {};
    events.forEach((event, index) => {
        const label = `Ereignis ${index + 1}`;
        if (!String(event.location || '').trim())
            missing.push(`${label}: Ort / Bauteil fehlt`);
        if (!String(event.description || '').trim())
            missing.push(`${label}: Beschreibung fehlt`);
        if (!(event.reasons || []).length)
            missing.push(`${label}: Ereignisgrund fehlt`);
        (event.reasons || []).forEach(reason => { reasonCounts[reason] = (reasonCounts[reason] || 0) + 1; });
    });
    return {
        eventCount: events.length,
        reasonCounts,
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

},
"src/core/prefill.js": function (require, exports, module) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPristine = void 0;
exports.prefillEmployees = prefillEmployees;
const factories_ts_1 = require("./factories.js");
const time_ts_1 = require("./time.js");
const isPristine = (employee) => !employee.name.trim() && employee.assignments.length === 1
    && ['start', 'end', 'breakMin', 'work', 'lv', 'locationDraft'].every(key => !employee.assignments[0][key])
    && !employee.assignments[0].locations.length && !employee.assignments[0].photos.length;
exports.isPristine = isPristine;
function prefillEmployees(employees, entries, source) {
    const kept = employees.filter(employee => !(0, exports.isPristine)(employee));
    const knownNames = new Set(kept.map(employee => (0, time_ts_1.normalizeName)(employee.name)).filter(Boolean));
    const knownRefs = new Set(kept.map(employee => employee.personRef).filter(Boolean));
    let added = 0, skipped = 0;
    entries.forEach(entry => {
        if (typeof entry === 'string') {
            const key = (0, time_ts_1.normalizeName)(entry);
            if (knownNames.has(key)) {
                skipped += 1;
                return;
            }
            knownNames.add(key);
            kept.push((0, factories_ts_1.newEmployee)({ name: entry, collapsed: true, prefill: source }));
        }
        else {
            if (knownRefs.has(entry.id)) {
                skipped += 1;
                return;
            }
            knownRefs.add(entry.id);
            kept.push((0, factories_ts_1.newEmployee)({ name: entry.label, personRef: entry.id, pseudonym: entry.group === 'sub', collapsed: true, prefill: source }));
        }
        added += 1;
    });
    return { employees: kept, added, skipped };
}

},
"src/core/bulk.js": function (require, exports, module) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyBulk = applyBulk;
const factories_ts_1 = require("./factories.js");
function applyBulk(employees, ids, patch, mode = 'fill') {
    const result = { set: 0, skipped: 0, added: 0, people: 0 };
    const fields = ['start', 'end', 'breakMin', 'work'].filter(field => String(patch[field] ?? '').trim() !== '');
    const locations = String(patch.location ?? '').split(',').map(item => item.trim()).filter(Boolean);
    if (!ids.length || (!fields.length && !locations.length))
        return result;
    employees.filter(employee => ids.includes(employee.id)).forEach(employee => {
        result.people += 1;
        if (mode === 'add') {
            const created = (0, factories_ts_1.newAssignment)({ locations: [...locations] });
            fields.forEach(field => { created[field] = String(patch[field]).trim(); });
            employee.assignments.push(created);
            result.added += 1;
            result.set += fields.length + (locations.length ? 1 : 0);
            return;
        }
        if (!employee.assignments.length)
            employee.assignments.push((0, factories_ts_1.newAssignment)());
        const target = employee.assignments[0];
        fields.forEach(field => {
            const value = String(patch[field]).trim();
            if (mode === 'overwrite' || target[field] === '') {
                if (target[field] !== value)
                    result.set += 1;
                target[field] = value;
            }
            else if (target[field] !== value)
                result.skipped += 1;
        });
        if (locations.length) {
            if (mode === 'overwrite' || (!target.locations.length && !target.locationDraft.trim())) {
                target.locations = [...locations];
                result.set += 1;
            }
            else if (target.locations.join('|') !== locations.join('|'))
                result.skipped += 1;
        }
    });
    return result;
}

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
  globalThis.AC01Core = Object.freeze(Object.assign({}, load("src/compat/ac01-classic.js"), { build: "sha256:63cd4e1088e8b940" }));
})();
