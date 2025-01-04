import aioping, asyncio, aiodns, logging
from utilities.dbConn import get_db
from utilities.eventSocketHandler import event_sockets
from typing import List, Dict
from datetime import datetime

logger = logging.getLogger("uvicorn")

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

    async def remove_plotter(self, id:int = None):
        await self.running_plotters[id].stop()
        del self.running_plotters[id]

class Plotter:

    sleep_seconds = 15

    def __init__(self, id: int, event_id: int):
        self.id = id
        self.event_id = event_id
        self.hosts: List[Dict] = []
        self.ping_task = None
        self.resolver = aiodns.DNSResolver()
        self.host_resolutions: Dict[str, str] = {}

        # Get hosts from database
        try:
            self.get_hosts()
            self.ping_task = asyncio.create_task(self._host_ping_loop())
            logger.info(f"Plotter {self.id} created")
        except Exception as e:
            print(f"Error creating plotter {self.id}: {e}")
            raise


    async def stop(self):
        if not self.ping_task: return
        print(f"Stopping plotter {self.id}")
        self.ping_task.cancel()
        try:
            await self.ping_task
        except asyncio.CancelledError:
            raise

    def get_hosts(self):
        with get_db() as (cursor, conn):
            cursor.execute('''
                SELECT * FROM widgets_PingPlotter_hosts 
                WHERE plotter_id = :plotter_id
            ''', {"plotter_id": self.id})
            hosts = cursor.fetchall()
            for host in hosts:
                self.hosts.append(dict(host))

    async def resolve_hosts(self):
        results = {"errored": [], "resolutions": {}}
        tasks = [self._resolve_host(host['host']) for host in self.hosts]
        resolved_hosts = await asyncio.gather(*tasks, return_exceptions=True)

        for host in resolved_hosts:
            if host["status"] == "success":
                results["resolutions"][host["host"]] = host["resolved_ip"]
            else:
                results["errored"].append(host)

        return results

    async def _host_ping_loop(self):
        try:
            while True:
                host_resolution_task = asyncio.create_task(self.resolve_hosts())
                self.host_resolutions = await host_resolution_task
                tasks = [self._ping_host(host) for host in self.hosts]
                await asyncio.gather(*tasks)
                await asyncio.sleep(self.sleep_seconds)
        except asyncio.CancelledError:
            print(f"Ping task for plotter {self.id} cancelled")
            raise

    async def _resolve_host(self, host):
        try:
            result = await self.resolver.query(host, 'A')
            return {"host": host, "resolved_ip": result[0].host, "status": "success"}
        except Exception as e:
            return {"host": host, "resolved_ip": None, "status": "error", "details": str(e)}
        
    async def _ping_host(self, host):
        data={
            "plotter_id": self.id,
            "host_id": host['id'],
            "host": host['host'],
            "delay": None,
            "status": None,
            "details": None,
            "datetime": None
        }
        try:
            if host['host'] in self.host_resolutions["errored"] or host['host'] not in self.host_resolutions["resolutions"]:
                raise Exception("DNS resolution failed")
            resolved_ip = self.host_resolutions["resolutions"][host['host']]
            delay = await aioping.ping(resolved_ip)  # Returns delay in seconds
            data["delay"] = f"{delay*1000:.2f} ms"
            data["status"] = "success"
        except TimeoutError:
            data["status"] = "error"
            data["details"] = "Timeout"
        except Exception as e:
            data["status"] = "error"
            if host['host'] in self.host_resolutions["errored"]:
                data["details"] = "DNS resolution failed"
            else:
                data["details"] = str(e)
        
        data["datetime"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        await event_sockets.broadcast_update(
            event_id=self.event_id, 
            widget_name="PingPlotter", 
            widget_id=self.id, 
            data=data
        )

    

plotter_runner = NewPlotterRunner()