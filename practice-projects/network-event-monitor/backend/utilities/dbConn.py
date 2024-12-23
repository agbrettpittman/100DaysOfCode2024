import sqlite3,os, logging
from fastapi import Depends
from dotenv import load_dotenv
from contextlib import contextmanager

logger = logging.getLogger("uvicorn")

load_dotenv()

if (not os.getenv("DB_PATH")):
    raise Exception("DB_PATH environment variable not set")
DATABASE_URL = os.getenv("DB_PATH")

def db_dep():
    conn = sqlite3.connect(DATABASE_URL, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    try:
        yield cursor, conn
    finally:
        conn.close()

@contextmanager
def get_db():
    conn = sqlite3.connect(DATABASE_URL, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    try:
        yield cursor, conn
    finally:
        conn.close()

def initialize_database():
    with get_db() as (cursor, conn):
        conn.execute('PRAGMA journal_mode=WAL')
        conn.commit()
        try:
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

            cursor.execute('''
                CREATE TABLE IF NOT EXISTS widgetMappings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    widgetName TEXT NOT NULL,
                    event_id INTEGER NOT NULL,
                    widget_id INTEGER NOT NULL,
                    FOREIGN KEY (event_id) REFERENCES events (id)
                )
            ''')

            conn.commit()
            logger.info("Initialized database")
        except Exception as e:
            conn.rollback()
            logger.error("Failed to initialize database")
            logger.error(e)