import threading, time, aioping, asyncio
from utilities.dbConn import get_db
from utilities.eventSocketHandler import event_sockets

class NewPlotterRunner:

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        self._instance = self
        self.running_plotters = {}

    def add_plotter(self, id:int = None, event_id:int = None):
        self.running_plotters[id] = Plotter(id, event_id)
        print(f"Ping Plotter router {id} started")

class Plotter:

    sleep_seconds = 15

    def __init__(self, id: int, event_id: int):
        self.id = id
        self.event_id = event_id
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
        message = ""
        result = ""
        try:
            delay = await aioping.ping(host['host'])  # Returns delay in seconds
            message = f"Pong from {host['host']} for plotter {self.id}: {delay*1000:.2f} ms"
            result="success"
        except TimeoutError:
            message = f"Ping to {host['host']} for plotter {self.id} timed out"
            result="timeout"
        except Exception as e:
            message = f"Error pinging {host['host']} for plotter {self.id}: {e}"
            result="error"

        await event_sockets.broadcast_update(
            event_id=self.event_id, 
            widget_name="PingPlotter", 
            widget_id=self.id, 
            data={"message": message, "result": result}
        )

    async def ping_hosts(self):
        while True:
            tasks = [self.ping_host(host) for host in self.hosts]
            await asyncio.gather(*tasks)
            await asyncio.sleep(self.sleep_seconds)

plotter_runner = NewPlotterRunner()