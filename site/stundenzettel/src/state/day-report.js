import { prefillEmployees } from "../core/prefill.js";
export const defaultEmployeeView = () => ({ collapsed: false, selected: false, prefill: '' });
export const emptyExtras = () => ({ equipment: '', material: '', contacts: '' });
export const emptyDayReport = (key) => ({ ...key, employees: [], events: [], extras: emptyExtras() });
export function splitEmployees(employees) {
    const view = { employees: {} };
    const data = employees.map(({ collapsed, selected, prefill, ...rest }) => {
        view.employees[rest.id] = { collapsed, selected, prefill };
        return rest;
    });
    return { data, view };
}
export function joinEmployees(data, view) {
    return data.map(employee => ({ ...employee, ...defaultEmployeeView(), ...view.employees[employee.id] }));
}
export function applyPrefill(report, view, entries, source) {
    const result = prefillEmployees(joinEmployees(report.employees, view), entries, source);
    const { data, view: nextView } = splitEmployees(result.employees);
    return { report: { ...report, employees: data }, view: nextView, added: result.added, skipped: result.skipped };
}
