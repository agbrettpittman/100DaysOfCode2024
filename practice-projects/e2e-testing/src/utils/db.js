// db.js
import Dexie from 'dexie';

export const db = new Dexie('MiniLotA');
db.version(1).stores({
    characters: '++id, name, creationDate' // Primary key and indexed props
});