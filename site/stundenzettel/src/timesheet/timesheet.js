import { employeeLabel, toMinutes } from "../core/time.js";
export const emptyMeta = () => ({ project: '', projectNo: '', client: '', number: '', createdOn: '', materialAmount: '', description: '' });
export function createTimesheetDraft(report, selection, meta = {}) {
    const keyOf = (employeeId, assignmentId) => JSON.stringify([employeeId, assignmentId]);
    const wanted = new Map(selection.map(item => [keyOf(item.employeeId, item.assignmentId), item]));
    const lines = [];
    for (const employee of report.employees) {
        for (const assignment of employee.assignments) {
            if (!wanted.delete(keyOf(employee.id, assignment.id)))
                continue;
            lines.push({
                source: { projectId: report.projectId, date: report.date, employeeId: employee.id, assignmentId: assignment.id, personRef: employee.personRef },
                workDate: report.date,
                name: employee.name,
                start: assignment.start,
                end: assignment.end,
                breakMin: assignment.breakMin,
                location: assignment.locations.join(', '),
                work: assignment.work.trim() || assignment.lv.trim(),
            });
        }
    }
    const draft = {
        sourceKey: { projectId: report.projectId, date: report.date },
        meta: { ...emptyMeta(), ...meta },
        lines,
        attachments: [],
    };
    const unresolved = [...wanted.values()].map(({ employeeId, assignmentId }) => ({ employeeId, assignmentId }));
    return { draft, unresolved };
}
export function reselectDraft(report, draft, selection) {
    const { draft: fresh, unresolved } = createTimesheetDraft(report, selection, draft.meta);
    const edited = new Map(draft.lines.map(line => [JSON.stringify([line.source.employeeId, line.source.assignmentId]), line]));
    fresh.lines = fresh.lines.map(line => {
        const kept = edited.get(JSON.stringify([line.source.employeeId, line.source.assignmentId]));
        return kept ? { ...kept, source: { ...kept.source } } : line;
    });
    fresh.attachments = draft.attachments.map(attachment => ({ ...attachment }));
    return { draft: fresh, unresolved };
}
export function lineMinutes(line) {
    const issues = [], assumed = [];
    const start = toMinutes(line.start), end = toMinutes(line.end);
    if (!line.start.trim())
        issues.push('Beginn fehlt');
    else if (start === null)
        issues.push('Beginn ungültig');
    if (!line.end.trim())
        issues.push('Ende fehlt');
    else if (end === null)
        issues.push('Ende ungültig');
    if (start !== null && end !== null && end <= start)
        issues.push('Ende liegt nicht nach dem Beginn');
    const rawBreak = line.breakMin.trim();
    let pause = 0;
    if (!rawBreak)
        assumed.push('Pause nicht angegeben, als 0 Min. angenommen');
    else if (!/^\d+$/.test(rawBreak))
        issues.push('Pause ungültig');
    else
        pause = Number(rawBreak);
    if (!issues.length && start !== null && end !== null && pause > end - start)
        issues.push('Pause ist länger als die Zeitspanne');
    if (issues.length || start === null || end === null)
        return { minutes: null, issues, assumed };
    return { minutes: end - start - pause, issues, assumed };
}
export function parseEuroCents(text) {
    const value = text.trim();
    let match = /^(\d{1,3}(?:\.\d{3})+)(?:,(\d{1,2}))?$/.exec(value);
    let whole, fraction;
    if (match) {
        whole = match[1].replaceAll('.', '');
        fraction = match[2];
    }
    else if ((match = /^(\d+)(?:[.,](\d{1,2}))?$/.exec(value))) {
        whole = match[1];
        fraction = match[2];
    }
    else
        return null;
    return Number(whole) * 100 + Number((fraction ?? '').padEnd(2, '0') || '0');
}
const formatEuro = (cents) => {
    const whole = String(Math.floor(cents / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${whole},${String(cents % 100).padStart(2, '0')} €`;
};
const formatHours = (minutes) => `${(minutes / 60).toFixed(2).replace('.', ',')} h`;
const KINDS = ['photo', 'plan'];
export function addAttachment(draft, attachment) {
    if (!KINDS.includes(attachment.kind))
        throw new Error(`Unknown attachment kind: ${String(attachment.kind)}`);
    if (!attachment.id || !attachment.ref)
        throw new Error('Attachment needs an id and a reference');
    if (draft.attachments.some(existing => existing.id === attachment.id))
        throw new Error(`Duplicate attachment id: ${attachment.id}`);
    draft.attachments.push({ ...attachment });
}
export function removeAttachment(draft, id) {
    const index = draft.attachments.findIndex(attachment => attachment.id === id);
    if (index < 0)
        return false;
    draft.attachments.splice(index, 1);
    return true;
}
export const PROVISIONAL_NOTES = [
    'Vorläufige Stunden: Ende − Beginn − Pause. Eine Rundungsregel ist nicht freigegeben; die Dezimalanzeige ist nur gerundet dargestellt.',
    'Pausenbehandlung, Validierung und Abrechnungsregeln sind nicht freigegeben. Keine Aussage über Vergütung oder Ansprüche.',
    'Struktur angelehnt an die Vorlage V11; V11 ist keine freigegebene Vorlage.',
];
export function buildPreview(draft) {
    const hints = [];
    const { meta } = draft;
    const need = (value, text) => { if (!value.trim())
        hints.push(text); };
    need(meta.project, 'Bauvorhaben / Projekt fehlt');
    need(meta.projectNo, 'Projekt-Nr. fehlt');
    need(meta.client, 'Auftraggeber fehlt');
    need(meta.number, 'Stundenzettel-Nr. fehlt');
    need(meta.createdOn, 'Erstellungsdatum fehlt');
    if (!draft.lines.length)
        hints.push('Kein Eintrag ausgewählt');
    const rows = draft.lines.map((line, index) => {
        const label = employeeLabel({ name: line.name }, index);
        const result = lineMinutes(line);
        if (!line.name.trim())
            hints.push(`${label}: Name fehlt`);
        if (!line.workDate.trim())
            hints.push(`${label}: Arbeitsdatum fehlt`);
        result.issues.forEach(issue => hints.push(`${label}: ${issue}`));
        if (!line.location.trim())
            hints.push(`${label}: Ort fehlt`);
        if (!line.work.trim())
            hints.push(`${label}: Tätigkeit fehlt`);
        return {
            index, label, source: { ...line.source }, workDate: line.workDate, name: line.name, start: line.start, end: line.end,
            breakMin: line.breakMin, location: line.location, work: line.work,
            minutes: result.minutes, hoursText: result.minutes === null ? '–' : formatHours(result.minutes),
            issues: result.issues, assumed: result.assumed,
        };
    });
    const totalMinutes = rows.reduce((sum, row) => sum + (row.minutes ?? 0), 0);
    const totalComplete = rows.length > 0 && rows.every(row => row.minutes !== null);
    const rawMaterial = meta.materialAmount.trim();
    const cents = rawMaterial ? parseEuroCents(rawMaterial) : null;
    const material = !rawMaterial
        ? { state: 'none', cents: null, text: 'nicht angegeben' }
        : cents === null
            ? { state: 'invalid', cents: null, text: rawMaterial }
            : { state: 'ok', cents, text: formatEuro(cents) };
    if (material.state === 'invalid')
        hints.push('Materialkosten: ungültiger Betrag');
    const assumptions = rows.flatMap(row => row.assumed.map(text => `${row.label}: ${text}`));
    return {
        header: { project: meta.project, projectNo: meta.projectNo, client: meta.client, number: meta.number, createdOn: meta.createdOn, description: meta.description },
        rows,
        totalMinutes,
        totalComplete,
        totalHoursText: formatHours(totalMinutes),
        material,
        attachments: {
            photos: draft.attachments.filter(a => a.kind === 'photo'),
            plans: draft.attachments.filter(a => a.kind === 'plan'),
        },
        hints,
        assumptions,
        provisionalNotes: [...PROVISIONAL_NOTES],
        sources: rows.map(row => ({ ...row.source })),
    };
}
