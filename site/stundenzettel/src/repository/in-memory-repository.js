export class InMemoryRepository {
    #store = new Map();
    static #keyOf = ({ projectId, date }) => JSON.stringify([projectId, date]);
    async load(key) {
        const stored = this.#store.get(InMemoryRepository.#keyOf(key));
        return stored ? structuredClone(stored) : null;
    }
    async save(report) {
        this.#store.set(InMemoryRepository.#keyOf(report), structuredClone(report));
    }
}
