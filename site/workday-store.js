/*
 * One authoritative in-memory store for recorded working days (synthetic demo, no persistence).
 *
 * It mirrors the contract of the TypeScript core (output/mission-control-spfx/src/repository/day-report-repository.ts):
 *   - a DayReport is { projectId, date, employees: EmployeeData[], events: EventRow[], extras } and holds business data only;
 *     UI-only row state (collapsed, selected, prefill) is never stored (see src/state/day-report.ts, splitEmployees);
 *   - the key is project + date; save() replaces the whole report stored for that key; load() returns null when unknown;
 *   - callers and the store never share mutable state: save() and load() copy.
 * list() is an addition the contract deliberately leaves undefined; Mission Control needs it to show the saved days.
 * Not a domain model, a storage schema or an approved business rule.
 *
 * Two flavours with the same contract:
 *   createWorkdayStore()        in memory only; everything is lost when the page reloads (used by the contract tests);
 *   createStoredWorkdayStore()  keeps the days in this browser's localStorage on this device (nothing is sent anywhere),
 *                               key 'intrend-mc-demo:workdays:v1'; without usable storage it silently stays in memory and
 *                               isPersistent() says so. Local convenience for the private prototype with synthetic data:
 *                               NOT a database, no sharing between devices or users, no backup, no conflict handling.
 *                               Also used by the public demo (owner's decision of 2026-11-21): the public workflow allows browser
 *                               storage only in this file and in the planner bundle, only under this demo's own key (see
 *                               STORAGE_KEY below),
 *                               and only with the warning to enter invented data only.
 */
(function (root) {
  'use strict';

  // JSON-encoded tuple: no separator character can make two different keys collide.
  const keyOf = ({ projectId, date }) => JSON.stringify([projectId, date]);

  // Strips UI-only row state (same split as the TypeScript splitEmployees) and copies everything.
  function toDayReport({ projectId, date, employees, events, extras }) {
    return structuredClone({
      projectId,
      date,
      employees: employees.map(({ collapsed, selected, prefill, ...data }) => data),
      events,
      extras: { equipment: extras.equipment, material: extras.material, contacts: extras.contacts }
    });
  }

  function createWorkdayStore() {
    const reports = new Map();
    return {
      async load(key) {
        const stored = reports.get(keyOf(key));
        return stored ? structuredClone(stored) : null;
      },
      async save(report) {
        reports.set(keyOf(report), structuredClone(report));
      },
      // Newest date first; equal dates keep the order in which their project was first saved.
      async list() {
        return [...reports.values()].map(report => structuredClone(report)).sort((a, b) => b.date.localeCompare(a.date));
      },
      async clear() { reports.clear(); },
      isPersistent() { return false; }
    };
  }

  const STORAGE_KEY = 'intrend-mc-demo:workdays:v1';
  const isText = value => typeof value === 'string';
  // Minimal shape check for what comes back from the browser: anything that would break the screens is dropped, not repaired.
  const isIsoDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T12:00:00`));   // a broken date would crash every screen that formats it
  const isStoredReport = (day, validDate) => Boolean(day) && isText(day.projectId) && isText(day.date) && validDate(day.date)
    && Array.isArray(day.employees) && day.employees.every(employee => employee && isText(employee.name) && Array.isArray(employee.assignments))
    && Array.isArray(day.events) && day.events.every(event => event && Array.isArray(event.reasons))
    && Boolean(day.extras) && ['equipment', 'material', 'contacts'].every(key => isText(day.extras[key]));

  // options.isValidDate: only the shared repository contract tests pass a looser rule (they use arbitrary key strings).
  function createStoredWorkdayStore(getStorage = () => globalThis.localStorage, { isValidDate = isIsoDate } = {}) {
    const memory = createWorkdayStore();
    let inMemory = false;               // sticky: once storage fails, this page view works from memory (stored days were copied over)
    const storage = () => { try { const s = getStorage(); return s && typeof s.getItem === 'function' ? s : null; } catch { return null; } };
    // null = storage unusable; [] = nothing stored (or unreadable content, treated as empty)
    const readDays = () => {
      const s = storage(); if (!s) return null;
      try {
        const raw = s.getItem(STORAGE_KEY); if (raw === null) return [];
        const data = JSON.parse(raw);
        return data && data.version === 1 && Array.isArray(data.days) ? data.days.filter(day => isStoredReport(day, isValidDate)) : [];
      } catch (error) { return error instanceof SyntaxError ? [] : null; }
    };
    const writeDays = days => { const s = storage(); if (!s) return false; try { s.setItem(STORAGE_KEY, JSON.stringify({ version: 1, days })); return true; } catch { return false; } };
    const toMemory = async days => { for (const day of days || []) await memory.save(day); inMemory = true; };
    // Same order rules as the in-memory Map: a replaced day keeps its place, a new day goes last.
    const withReport = (days, report) => { const at = days.findIndex(day => keyOf(day) === keyOf(report)); const copy = days.slice(); if (at >= 0) copy[at] = report; else copy.push(report); return copy; };
    return {
      async load(key) {
        if (!inMemory) { const days = readDays(); if (days) { const hit = days.find(day => keyOf(day) === keyOf(key)); return hit ? structuredClone(hit) : null; } await toMemory(null); }
        return memory.load(key);
      },
      async save(report) {
        const copy = structuredClone(report);
        if (!inMemory) {
          const days = readDays();
          if (days && writeDays(withReport(days, copy))) return;
          await toMemory(days);                              // storage unusable or full: keep what was stored, continue in memory
        }
        await memory.save(copy);
      },
      async list() {
        if (!inMemory) { const days = readDays(); if (days) return days.map(day => structuredClone(day)).sort((a, b) => b.date.localeCompare(a.date)); await toMemory(null); }
        return memory.list();
      },
      async clear() { await memory.clear(); const s = storage(); if (s) { try { s.removeItem(STORAGE_KEY); } catch { /* nothing to do */ } } },
      isPersistent() { return !inMemory && readDays() !== null; }
    };
  }

  root.WorkdayStore = { toDayReport, createWorkdayStore, createStoredWorkdayStore, STORAGE_KEY, store: createStoredWorkdayStore() };
})(globalThis);
