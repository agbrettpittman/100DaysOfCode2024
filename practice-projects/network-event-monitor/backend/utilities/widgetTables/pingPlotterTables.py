import sqlite3, contextlib, os, importlib.util
from fastapi import Depends
from dotenv import load_dotenv

title = "Ping Plotter"
def main(cursor):
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS widgets_pingPlotter (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sendTime TEXT DEFAULT CURRENT_TIMESTAMP,
            success INTEGER NOT NULL,
            latency REAL NOT NULL,
            event_id INTEGER NOT NULL,
            FOREIGN KEY (event_id) REFERENCES events (id)
        )
    ''')
