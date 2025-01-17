def initialize_database(cursor):

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
            FOREIGN KEY (plotter_id) REFERENCES widgets_PingPlotter_plotter (id) ON DELETE CASCADE
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS widgets_PingPlotter_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sendTime TEXT DEFAULT CURRENT_TIMESTAMP,
            success INTEGER NOT NULL DEFAULT 0,
            latency REAL,
            hosts_id INTEGER NOT NULL,
            FOREIGN KEY (hosts_id) REFERENCES widgets_PingPlotter_hosts (id) ON DELETE CASCADE
        )
    ''')