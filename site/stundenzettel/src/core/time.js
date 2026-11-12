export const toMinutes = (value) => {
    const match = /^(\d{2}):(\d{2})$/.exec(value || '');
    if (!match)
        return null;
    const hours = Number(match[1]), minutes = Number(match[2]);
    return hours < 24 && minutes < 60 ? hours * 60 + minutes : null;
};
export const fromMinutes = (total) => `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
export const normalizeName = (name) => String(name || '').trim().replace(/\s+/g, ' ').toLowerCase();
export const employeeLabel = (employee, index) => employee.name.trim() || `Mitarbeiter ${index + 1} (ohne Namen)`;
