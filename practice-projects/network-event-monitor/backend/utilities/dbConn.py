import sqlite3, contextlib, os
from fastapi import Depends
from dotenv import load_dotenv

load_dotenv()

if (not os.getenv("DB_PATH")):
    raise Exception("DB_PATH environment variable not set")
DATABASE_URL = os.getenv("DB_PATH")

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
            CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                start TEXT DEFAULT CURRENT_TIMESTAMP,
                end TEXT NOT NULL,
                eventName TEXT NOT NULL,
                description TEXT,
                referenceID TEXT NOT NULL UNIQUE
            )
        ''')
        db.commit()
    except Exception as e:
        print(e)
    finally:
        db.close()