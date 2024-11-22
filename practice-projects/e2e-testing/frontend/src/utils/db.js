// db.js
import Dexie from 'dexie';

export const db = new Dexie('MiniLotA');
db.version(1).stores({
    characters: '++id, name, creationDate' // Primary key and indexed props
});

db.version(2).stores({
    characters: '++id, name, creationDate, creator' // Primary key and indexed props
}).upgrade(async tx => {
    await tx.table('characters').toCollection().modify(character => {
        character.creator = '__replace__';
    })
});