let sequence = 1;
export const nextId = (prefix) => `${prefix}${sequence++}`;
