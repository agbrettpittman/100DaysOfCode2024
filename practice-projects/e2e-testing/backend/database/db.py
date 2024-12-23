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
    db.row_factory = sqlite3.Row
    try:
        cursor = db.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS characters (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                creationDate TEXT DEFAULT CURRENT_TIMESTAMP,
                creator TEXT NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                heightFeet INTEGER,
                heightInches INTEGER,
                weight INTEGER,
                age INTEGER,
                primaryWeapon TEXT,
                secondaryWeapon TEXT
            )
        ''')
        db.commit()
    except Exception as e:
        print(e)
    finally:
        db.close()