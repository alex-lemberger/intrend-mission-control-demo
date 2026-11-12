import { newEmployee } from "./factories.js";
import { normalizeName } from "./time.js";
export const isPristine = (employee) => !employee.name.trim() && employee.assignments.length === 1
    && ['start', 'end', 'breakMin', 'work', 'lv', 'locationDraft'].every(key => !employee.assignments[0][key])
    && !employee.assignments[0].locations.length && !employee.assignments[0].photos.length;
export function prefillEmployees(employees, entries, source) {
    const kept = employees.filter(employee => !isPristine(employee));
    const knownNames = new Set(kept.map(employee => normalizeName(employee.name)).filter(Boolean));
    const knownRefs = new Set(kept.map(employee => employee.personRef).filter(Boolean));
    let added = 0, skipped = 0;
    entries.forEach(entry => {
        if (typeof entry === 'string') {
            const key = normalizeName(entry);
            if (knownNames.has(key)) {
                skipped += 1;
                return;
            }
            knownNames.add(key);
            kept.push(newEmployee({ name: entry, collapsed: true, prefill: source }));
        }
        else {
            if (knownRefs.has(entry.id)) {
                skipped += 1;
                return;
            }
            knownRefs.add(entry.id);
            kept.push(newEmployee({ name: entry.label, personRef: entry.id, pseudonym: entry.group === 'sub', collapsed: true, prefill: source }));
        }
        added += 1;
    });
    return { employees: kept, added, skipped };
}
