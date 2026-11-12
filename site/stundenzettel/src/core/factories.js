import { nextId } from "./ids.js";
export const newAssignment = (data = {}) => ({
    id: nextId('a'), start: '', end: '', breakMin: '', work: '', lv: '', locations: [], locationDraft: '', photos: [], ...data
});
export const newEmployee = (data = {}) => ({
    id: nextId('e'), name: '', collapsed: false, selected: false, prefill: '', personRef: '', pseudonym: false,
    assignments: [newAssignment()], ...data
});
export const newEvent = (reasons = [], data = {}) => ({
    id: nextId('v'), reasons: [].concat(reasons).filter(Boolean), location: '', description: '', people: [], ...data
});
