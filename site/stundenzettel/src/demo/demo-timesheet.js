import { newAssignment, newEmployee } from "../core/factories.js";
import { emptyDayReport } from "../state/day-report.js";
export const DEMO_PROJECT_ID = 'demo-projekt-alpha';
export const DEMO_DATE = '2026-11-12';
export const DEMO_META = {
    project: 'Demo-Bauvorhaben Alpha',
    projectNo: 'DEMO-00',
    client: 'Demo-Auftraggeber GmbH',
    number: 'DEMO-STD-01',
    createdOn: DEMO_DATE,
    materialAmount: '',
    description: 'Demonstrationstext: Zusätzliche Abdeck- und Anpassarbeiten (synthetisch, kein realer Vorgang).',
};
export function createDemoDayReport() {
    const report = emptyDayReport({ projectId: DEMO_PROJECT_ID, date: DEMO_DATE });
    const person = (name, personRef, pseudonym = false) => ({ ...newEmployee({ name, personRef, pseudonym }) });
    const rows = [
        { ...person('Demo-Person 01', 'own-01'), assignments: [
                newAssignment({ start: '07:00', end: '12:00', breakMin: '30', work: 'Wände', locations: ['Flur'] }),
                newAssignment({ start: '12:30', end: '16:00', breakMin: '', work: 'Spachteln', locations: ['Flur'] }),
            ] },
        { ...person('Demo-Person 02', 'own-02'), assignments: [
                newAssignment({ start: '07:00', end: '16:00', breakMin: '60', work: 'Wände', locations: ['Treppenhaus'] }),
            ] },
        { ...person('Demo-Person 03', 'own-03'), assignments: [
                newAssignment({ start: '07:30', end: '15:30', breakMin: '45', work: 'Deckenunterkonstruktion', locations: ['Erdgeschoss'] }),
            ] },
        { ...person('Demo-Person 04', 'own-04'), assignments: [
                newAssignment({ start: '08:00', end: '', breakMin: '15', work: 'Decken', locations: [] }),
            ] },
        { ...person('Alpha Monteur-1', 'sub-alpha-01', true), assignments: [
                newAssignment({ start: '07:00', end: '15:00', breakMin: '30', work: 'Wände', locations: ['Zweites Obergeschoss'] }),
            ] },
        { ...person('Demo-Person 05', 'own-05'), assignments: [
                newAssignment({ start: '09:00', end: '11:00', breakMin: '0', work: 'Schutzfolie anbringen', locations: ['Erdgeschoss'] }),
            ] },
    ];
    report.employees = rows.map(({ collapsed, selected, prefill, ...data }) => data);
    return report;
}
const svgUri = (svg) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
export function demoPhoto(index) {
    const hue = 24 + (index * 17) % 40, shift = (index * 23) % 60;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
<rect width="400" height="300" fill="hsl(${hue},8%,38%)"/>
<polygon points="0,0 400,0 300,90 100,90" fill="hsl(${hue},8%,52%)"/>
<polygon points="0,0 100,90 100,230 0,300" fill="hsl(${hue},10%,30%)"/>
<polygon points="400,0 300,90 300,230 400,300" fill="hsl(${hue},10%,44%)"/>
<rect x="150" y="${110 + shift / 4}" width="100" height="120" fill="hsl(${hue},20%,70%)"/>
<rect x="100" y="230" width="200" height="70" fill="hsl(${hue},6%,26%)"/>
<text x="200" y="285" font-family="Helvetica,Arial,sans-serif" font-size="15" fill="#fff" text-anchor="middle">SYNTHETISCHES DEMOFOTO ${index}</text></svg>`;
    return { id: `demo-photo-${index}`, kind: 'photo', name: `demo-foto-${index}.svg`, ref: svgUri(svg), caption: `Demo-Foto ${index} (synthetisch)` };
}
export function demoPlan(index) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260">
<rect width="400" height="260" fill="#fff"/><rect x="20" y="20" width="360" height="200" fill="none" stroke="#333" stroke-width="3"/>
<path d="M20 110H150M150 20V220M150 140H380M270 140V220" stroke="#333" stroke-width="2" fill="none"/>
<rect x="160" y="150" width="100" height="62" fill="rgba(220,40,40,.15)" stroke="#d22" stroke-width="4"/>
<text x="210" y="186" font-family="Helvetica,Arial,sans-serif" font-size="13" fill="#d22" text-anchor="middle">Markierung ${index}</text>
<text x="200" y="245" font-family="Helvetica,Arial,sans-serif" font-size="13" fill="#555" text-anchor="middle">SYNTHETISCHER DEMO-PLANAUSSCHNITT</text></svg>`;
    return { id: `demo-plan-${index}`, kind: 'plan', name: `demo-plan-${index}.svg`, ref: svgUri(svg), caption: `Demo-Planausschnitt ${index}, Markierung (synthetisch)` };
}
