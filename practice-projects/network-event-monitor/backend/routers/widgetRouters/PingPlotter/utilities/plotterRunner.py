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

    async def remove_plotter(self, id:int = None):
        await self.running_plotters[id].stop()
        del self.running_plotters[id]
        print(f"Ping Plotter router {id} stopped")

class Plotter:

    sleep_seconds = 15

    def __init__(self, id: int, event_id: int):
        self.id = id
        self.event_id = event_id
        self.hosts = []
        self.ping_task = None

        with get_db() as (cursor, conn):
            cursor.execute('''
                SELECT * FROM widgets_PingPlotter_hosts 
                WHERE plotter_id = :plotter_id
            ''', {"plotter_id": self.id})
            hosts = cursor.fetchall()
            for host in hosts:
                self.hosts.append(dict(host))

        self.ping_task = asyncio.create_task(self.get_host_ping_loop())

        print(f"Plotter {self.id} created. Hosts: {self.hosts}")

    async def get_host_ping_loop(self):
        try:
            while True:
                tasks = [self.ping_host(host) for host in self.hosts]
                await asyncio.gather(*tasks)
                await asyncio.sleep(self.sleep_seconds)
        except asyncio.CancelledError:
            print(f"Ping task for plotter {self.id} cancelled")
            raise
                  
    
    async def stop(self):
        if not self.ping_task: return
        print(f"Stopping plotter {self.id}")
        self.ping_task.cancel()
        try:
            await self.ping_task
        except asyncio.CancelledError:
            raise

    async def ping_host(self, host):
        data={
            "plotter_id": self.id,
            "host_id": host['id'],
            "host": host['host'],
            "delay": None,
            "status": None,
            "details": None
        }
        try:
            delay = await aioping.ping(host['host'])  # Returns delay in seconds
            data["delay"] = f"{delay*1000:.2f} ms"
            data["status"] = "success"
        except TimeoutError:
            data["status"] = "error"
            data["details"] = "Timeout"
        except Exception as e:
            data["status"] = "error"
            data["details"] = str(e)

        await event_sockets.broadcast_update(
            event_id=self.event_id, 
            widget_name="PingPlotter", 
            widget_id=self.id, 
            data=data
        )

    

plotter_runner = NewPlotterRunner()