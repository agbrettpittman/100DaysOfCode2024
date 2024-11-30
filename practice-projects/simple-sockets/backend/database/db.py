import sqlite3, contextlib
from fastapi import Depends

DATABASE_URL = "./database/main.db"  # Change this to :memory: for in-memory DB

def get_db():
    with contextlib.closing(sqlite3.connect(DATABASE_URL, check_same_thread=False)) as db:
        db.row_factory = sqlite3.Row
        cursor = db.cursor()
        try:
            yield cursor, db
        finally:
            db.close()

def initialize_database():
    db = sqlite3.connect(DATABASE_URL, check_same_thread=False)
    db.execute('PRAGMA journal_mode=WAL')
    db.commit()
    db.row_factory = sqlite3.Row
    try:
        cursor = db.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS rooms (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                creationDate TEXT DEFAULT CURRENT_TIMESTAMP,
                name TEXT NOT NULL,
                description TEXT
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS candidates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                creationDate TEXT DEFAULT CURRENT_TIMESTAMP,
                name TEXT NOT NULL,
                title TEXT NOT NULL
            )
        ''')  
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS room_candidates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                room_id INTEGER NOT NULL,
                candidate_id INTEGER NOT NULL,
                votes INTEGER DEFAULT 0,
                FOREIGN KEY (room_id) REFERENCES rooms(id),
                FOREIGN KEY (candidate_id) REFERENCES candidates(id)
            )
        ''') 
        db.commit()
    except Exception as e:
        print(e)
    finally:
        db.close()