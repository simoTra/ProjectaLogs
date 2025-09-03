import asyncio
import logging
from typing import Dict, Any, Optional, List
from tornado.httpclient import HTTPError

from ..common import RequestType

DB_NAMESPACE = "moonraker"
ACTIVE_PROJECT_KEY = "projectalogs.project_id"

class ProjectaLogs:
    def __init__(self, config):
        self.server = config.get_server()
        self.eventloop = self.server.get_event_loop()

        backend_url = config.get("backend_endpoint", "http://localhost:3000")
        self.backend_url = backend_url.rstrip("/") + "/api"
        self.jobs_endpoint = f"{self.backend_url}/job"
        self.projects_endpoint = f"{self.backend_url}/project/projectsforprinter"
        self.printer_id = config.get("printer_id", "default_printer")

        self.current_project_id: Optional[str] = None
        self.projects_cache: List[Dict[str, Any]] = []
        self.cache_time: float = 0
        self.cache_duration: int = 300

        self.http_client = self.server.lookup_component("http_client")
        self.database = self.server.lookup_component("database")

        self._register_endpoints()
        self._register_event_handlers()
        self._register_remote_methods()

    def _register_endpoints(self):
        self.server.register_endpoint(
            "/server/projectalogs/project_id",
            RequestType.GET | RequestType.POST,
            self._handle_project_id_request
        )
        self.server.register_endpoint(
            "/server/projectalogs/projects",
            RequestType.GET,
            self._handle_projects_request
        )

    def _register_event_handlers(self):
        self.server.register_event_handler(
            "job_queue:job_complete", lambda e: self._report_job(e, "completed")
        )
        self.server.register_event_handler(
            "job_queue:job_cancelled", lambda e: self._report_job(e, "cancelled")
        )
        self.server.register_event_handler(
            "job_queue:job_error", lambda e: self._report_job(e, "error")
        )
        self.server.register_event_handler(
            "server:klippy_ready", self._handle_klippy_ready
        )

    def _register_remote_methods(self):
        self.server.register_remote_method(
            "projectalogs_set_active_project", self.set_active_project
        )
        self.server.register_remote_method(
            "projectalogs_get_active_project", self.get_active_project
        )

    async def component_init(self):
        self.current_project_id = await self.database.get_item(DB_NAMESPACE, ACTIVE_PROJECT_KEY, None)
        try:
            await self._refresh_projects_cache()
        except Exception as e:
            logging.warning(f"ProjectaLogs: Failed to load projects on startup: {e}")

    async def _handle_klippy_ready(self):
        self.server.send_event("projectalogs:active_project_set", {
            "project_id": self.current_project_id
        })

    def set_active_project(self, project_id: Optional[str]) -> None:
        if project_id != self.current_project_id:
            self.current_project_id = project_id
            self.database.insert_item(DB_NAMESPACE, ACTIVE_PROJECT_KEY, project_id)
            self.server.send_event("projectalogs:active_project_set", {"project_id": project_id})
            logging.info(f"ProjectaLogs: Set active project to {project_id}")

    def get_active_project(self) -> Optional[str]:
        return self.current_project_id

    async def _handle_project_id_request(self, web_request):
        if web_request.get_request_type() == RequestType.POST:
            project_id = web_request.get("project_id")
            if project_id is None:
                raise self.server.error("Missing project_id", 400)
            self.set_active_project(str(project_id))
        return {"project_id": self.current_project_id}

    async def _handle_projects_request(self, web_request):
        try:
            current_time = self.eventloop.get_loop_time()
            if (current_time - self.cache_time) > self.cache_duration:
                await self._refresh_projects_cache()
            return {"projects": self.projects_cache}
        except Exception as e:
            logging.warning(f"ProjectaLogs: Failed to fetch projects: {e}")
            if self.projects_cache:
                return {"projects": self.projects_cache}
            raise self.server.error("Unable to retrieve projects", 500)

    async def _refresh_projects_cache(self):
        response = await self.http_client.get(self.projects_endpoint)
        response.raise_for_status()
        projects_data = response.json()
        
        logging.info(f"ProjectaLogs: Projects response: {projects_data}")
        
        self.server.send_event("projectalogs:debug", {
            "type": "projects_response",
            "data": projects_data
        })
        
        if isinstance(projects_data, list):
            self.projects_cache = projects_data
        else:
            self.projects_cache = projects_data.get("projects", [])
        
        self.cache_time = self.eventloop.get_loop_time()

    async def _report_job(self, job_data: Dict[str, Any], status: str):
        try:
            payload = {
                "printer_id": self.printer_id,
                "project_id": self.current_project_id,
                "status": status,
                "job_id": job_data.get("job_id"),
                "filename": job_data.get("filename"),
                "start_time": job_data.get("start_time"),
                "end_time": job_data.get("end_time"),
                "print_duration": job_data.get("print_duration"),
                "filament_used": job_data.get("filament_used"),
                "metadata": job_data.get("metadata", {}),
                "total_duration": job_data.get("total_duration")
            }
            
            logging.info(f"ProjectaLogs: Sending job payload: {payload}")
            self.server.send_event("projectalogs:debug", {
                "type": "job_payload",
                "data": payload
            })
            
            response = await self.http_client.post(self.jobs_endpoint, json=payload)
            response.raise_for_status()
            response_data = response.json() if response.body else {}
            
            logging.info(f"ProjectaLogs: Job report response: {response_data}")
            self.server.send_event("projectalogs:debug", {
                "type": "job_response", 
                "data": response_data
            })
            
            logging.info(f"ProjectaLogs: Sent {status} job report for {payload['filename']}")
        except HTTPError as e:
            logging.error(f"ProjectaLogs: HTTP error reporting job: {e}")
            self.server.send_event("projectalogs:debug", {
                "type": "error",
                "data": {"error": str(e), "type": "http_error"}
            })
        except Exception as e:
            logging.error(f"ProjectaLogs: Failed to report job: {e}")
            self.server.send_event("projectalogs:debug", {
                "type": "error", 
                "data": {"error": str(e), "type": "general_error"}
            })

    async def close(self):
        pass

def load_component(config):
    return ProjectaLogs(config)