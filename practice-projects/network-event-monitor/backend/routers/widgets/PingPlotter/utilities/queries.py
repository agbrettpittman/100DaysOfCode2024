import sqlite3
from sqlite3 import Cursor

def get_plotter_summary(plotter_id: int, cursor: Cursor):
    cursor.execute('''
        SELECT
            widgets_PingPlotter_hosts.*,
            COUNT(CASE WHEN widgets_PingPlotter_results.success = 0 THEN 1 END) AS failures,
            COUNT(CASE WHEN widgets_PingPlotter_results.success = 1 THEN 1 END) AS successes,
            ROUND(
                AVG(
                CASE WHEN widgets_PingPlotter_results.success = 1 THEN widgets_PingPlotter_results.latency END
                )
            , 2) AS latencyAvg,
            latest.sendTime AS latestSendTime,
            latest.latency AS latestLatency,
            latest.success AS latestSuccess
        FROM widgets_PingPlotter_hosts
        LEFT JOIN widgets_PingPlotter_results 
            ON widgets_PingPlotter_hosts.id = widgets_PingPlotter_results.hosts_id
        LEFT JOIN (
            SELECT
                hosts_id, 
                sendTime,
                latency,
                success
            FROM widgets_PingPlotter_results
            WHERE (hosts_id, id) IN (
                SELECT hosts_id, MAX(id) AS id
                FROM widgets_PingPlotter_results
                GROUP BY hosts_id
            )
        ) AS latest
            ON widgets_PingPlotter_hosts.id = latest.hosts_id
        WHERE widgets_PingPlotter_hosts.plotter_id = :plotter_id
        GROUP BY widgets_PingPlotter_hosts.id;
    ''', {"plotter_id": plotter_id})
    return cursor.fetchall()