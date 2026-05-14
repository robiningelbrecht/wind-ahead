import { openDB } from 'idb';

const DATABASE_NAME = 'WindAhead';
const STORE_NAME = 'KeyValue';
const DATABASE_VERSION = 1;

class KeyValueRepository {
    constructor() {
        this.databasePromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
            upgrade(database) {
                if (!database.objectStoreNames.contains(STORE_NAME)) {
                    database.createObjectStore(STORE_NAME, { keyPath: 'key' });
                }
            },
        });
    }

    async get(key) {
        const database = await this.databasePromise;
        const entry = await database.get(STORE_NAME, key);
        return entry ? entry.value : null;
    }

    async set(key, value) {
        const database = await this.databasePromise;
        await database.put(STORE_NAME, { key, value });
    }

    async delete(key) {
        const database = await this.databasePromise;
        await database.delete(STORE_NAME, key);
    }
}

export const keyValueRepository = new KeyValueRepository();
