import sqlite3, contextlib, os, importlib.util
from fastapi import Depends
from dotenv import load_dotenv

title = "Ping Plotter"
def main(cursor):

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS widgets_PingPlotter_plotter (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS widgets_PingPlotter_hosts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            plotter_id INTEGER NOT NULL,
            host TEXT NOT NULL,
            FOREIGN KEY (plotter_id) REFERENCES widgets_PingPlotter_plotter (id)
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS widgets_PingPlotter_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sendTime TEXT DEFAULT CURRENT_TIMESTAMP,
            success INTEGER NOT NULL,
            latency REAL NOT NULL,
            hosts_id INTEGER NOT NULL,
            FOREIGN KEY (hosts_id) REFERENCES widgets_PingPlotter_hosts (id)
        )
    ''')
