/*
 * One authoritative in-memory store for recorded working days (synthetic demo, no persistence).
 *
 * It mirrors the contract of the TypeScript core (output/mission-control-spfx/src/repository/day-report-repository.ts):
 *   - a DayReport is { projectId, date, employees: EmployeeData[], events: EventRow[], extras } and holds business data only;
 *     UI-only row state (collapsed, selected, prefill) is never stored (see src/state/day-report.ts, splitEmployees);
 *   - the key is project + date; save() replaces the whole report stored for that key; load() returns null when unknown;
 *   - callers and the store never share mutable state: save() and load() copy.
 * list() is an addition the contract deliberately leaves undefined; Mission Control needs it to show the saved days.
 * Not a domain model, a SharePoint schema or an approved business rule. Everything is lost when the page reloads.
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
      }
    };
  }

  root.WorkdayStore = { toDayReport, createWorkdayStore, store: createWorkdayStore() };
})(globalThis);
