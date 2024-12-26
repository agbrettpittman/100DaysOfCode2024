import threading, time, aioping, asyncio
from utilities.dbConn import get_db

running_plotters = {}

class Plotter:

    sleep_seconds = 15

    def __init__(self, id: int):
        self.id = id
        self.hosts = []


        with get_db() as (cursor, conn):
            cursor.execute('''
                SELECT * FROM widgets_PingPlotter_hosts 
                WHERE plotter_id = :plotter_id
            ''', {"plotter_id": self.id})
            hosts = cursor.fetchall()
            for host in hosts:
                self.hosts.append(dict(host))

        asyncio.get_event_loop().create_task(self.ping_hosts())

        print(f"Plotter {self.id} created. Hosts: {self.hosts}")

    async def ping_host(self, host):
        try:
            delay = await aioping.ping(host['host'])  # Returns delay in seconds
            print(f"Pong from {host['host']} for plotter {self.id}: {delay*1000:.2f} ms")
        except TimeoutError:
            print(f"Ping to {host['host']} for plotter {self.id} timed out.")
        except Exception as e:
            print(f"Error pinging {host['host']} for plotter {self.id}: {e}")

    async def ping_hosts(self):
        while True:
            tasks = [self.ping_host(host) for host in self.hosts]
            await asyncio.gather(*tasks)
            await asyncio.sleep(self.sleep_seconds)