import aioping, asyncio, aiodns, logging, json
from utilities.dbConn import get_db
from utilities.eventSocketHandler import event_sockets
from .queries import get_plotter_summary
from typing import List, Dict
from datetime import datetime

logger = logging.getLogger("uvicorn")

class Plotter:

    sleep_seconds = 15

    def __init__(self, id: int, event_id: int, mapping_id: int):
        self.id = id
        self.event_id = event_id
        self.mapping_id = mapping_id
        self.hosts: List[Dict] = []
        self.ping_task = None
        self.resolver = aiodns.DNSResolver()
        self.host_resolutions: Dict[str, str] = {}
        self.paused = False

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
        logger.info(f"Stopping plotter {self.id}")
        self.ping_task.cancel()
        try:
            await self.ping_task
        except asyncio.CancelledError:
            logger.info(f"Plotter {self.id} stopped")
            pass

    async def broadcast_update(self, data):
        await event_sockets.broadcast_update(
            event_id=self.event_id, 
            widget_name="PingPlotter", 
            widget_id=self.id, 
            mapping_id=self.mapping_id,
            data=data
        )

    async def change_name(self, name):
        await self.broadcast_update({
            "plotter_id": self.id,
            "type": "plotter change",
            "name": name
        })

    def get_hosts(self):
        with get_db() as (cursor, conn):
            cursor.execute('''
                SELECT * FROM widgets_PingPlotter_hosts 
                WHERE plotter_id = :plotter_id
            ''', {"plotter_id": self.id})
            hosts = cursor.fetchall()
            new_hosts = []
            for host in hosts:
                new_hosts.append(dict(host))
            self.hosts = new_hosts

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
    
    async def _resolve_host(self, host):
        try:
            result = await self.resolver.query(host, 'A')
            return {"host": host, "resolved_ip": result[0].host, "status": "success"}
        except Exception as e:
            return {"host": host, "resolved_ip": None, "status": "error", "details": str(e)}
    
    async def summarize_results(self):
        summary = {}
        with get_db() as (cursor, conn):
            try:
                results = get_plotter_summary(self.id, cursor)
                for single_summary in results:
                    summary_value = dict(single_summary)
                    summary_key = int(single_summary['id'])
                    del summary_value['id']
                    if single_summary['latestLatency']:
                        summary_value['latestLatency'] = f"{single_summary['latestLatency']} ms"
                    if single_summary['latencyAvg']:
                        summary_value['latencyAvg'] = f"{single_summary['latencyAvg']} ms"
                    summary[summary_key] = summary_value
            except Exception as e:
                logger.error(f"Failed to summarize results for plotter {self.id}")
                logger.error(e)
        return summary

    async def _add_ping_to_db(self, data):
        with get_db() as (cursor, conn):
            try:
                cursor.execute('''
                    INSERT INTO widgets_PingPlotter_results (sendTime, success, latency, hosts_id)
                    VALUES (:sendTime, :success, :latency, :hosts_id)
                ''', data)
                conn.commit()
            except Exception as e:
                conn.rollback()
                logger.error(f"Failed to insert ping into database for plotter {self.id}, host {data['hosts_id']}")
                logger.error(e)

    async def _host_ping_loop(self):
        try:
            while True:
                if not self.paused:
                    host_resolution_task = asyncio.create_task(self.resolve_hosts())
                    self.host_resolutions = await host_resolution_task
                    tasks = [self._ping_host(host) for host in self.hosts]
                    await asyncio.gather(*tasks)
                await asyncio.sleep(self.sleep_seconds)
        except asyncio.CancelledError:
            raise
        
    async def _ping_host(self, host):
        results = {
            "latency": None,
            "status": None,
            "details": None,
            "sendTime": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "receivedTime": None
        }
        try:
            if host['host'] in self.host_resolutions["errored"] or host['host'] not in self.host_resolutions["resolutions"]:
                raise Exception("DNS resolution failed")
            resolved_ip = self.host_resolutions["resolutions"][host['host']]
            latency = await aioping.ping(resolved_ip)  # Returns delay in seconds
            results["latency"] = f"{latency*1000:.2f}"
            results["status"] = "success"
        except TimeoutError:
            results["status"] = "error"
            results["details"] = "Timeout"
        except Exception as e:
            results["status"] = "error"
            if host['host'] in self.host_resolutions["errored"]:
                results["details"] = "DNS resolution failed"
            else:
                results["details"] = str(e)
        
        results["receivedTime"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        await self._add_ping_to_db({
            "sendTime": results["sendTime"],
            "success": 1 if results["status"] == "success" else 0,
            "latency": results["latency"],
            "hosts_id": host['id']
        })
        summary = await self.summarize_results()

        try:
            await self.broadcast_update({
                "plotter_id": self.id,
                "host_id": host['id'],
                "host": host['host'],
                "type": "summary",
                "summary": summary,
            })
        except Exception as e:
            logger.error(f"Failed to broadcast update for plotter {self.id}")
            logger.error(e)