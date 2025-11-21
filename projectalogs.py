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
        self.health_endpoint = f"{self.backend_url}/health"
        self.jobs_endpoint = f"{self.backend_url}/job"
        self.projects_endpoint = f"{self.backend_url}/projects/projectsforprinter"
        self.printer_endpoint = f"{self.backend_url}/printers"
        self.printer_id = config.get("printer_id", "default_printer")
        self.printer_validate_endpoint = f"{self.printer_endpoint}/{self.printer_id}/validate"

        self.current_project_id: Optional[str] = None
        self.current_job_id: Optional[int] = None
        self.projects_cache: List[Dict[str, Any]] = []

        self.backend_healthy: bool = False
        self.printer_validated: bool = False

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
        self.server.register_endpoint(
            "/server/projectalogs/status",
            RequestType.GET,
            self._handle_status_request
        )
        self.server.register_endpoint(
            "/server/projectalogs/refresh",
            RequestType.POST,
            self._handle_refresh_request
        )

    def _register_event_handlers(self):
        self.server.register_event_handler(
            "job_queue:job_started", self._create_job
        )
        self.server.register_event_handler(
            "job_queue:job_complete", lambda e: self._update_job(e, "completed")
        )
        self.server.register_event_handler(
            "job_queue:job_cancelled", lambda e: self._update_job(e, "cancelled")
        )
        self.server.register_event_handler(
            "job_queue:job_error", lambda e: self._update_job(e, "error")
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
        self.current_project_id = await self.database.get_item(
            DB_NAMESPACE, ACTIVE_PROJECT_KEY, None
        )

        try:
            response = await self.http_client.get(self.printer_validate_endpoint)
            response.raise_for_status()
            self.printer_validated = True
            logging.info(f"ProjectaLogs: Validated printer {self.printer_id}")
        except HTTPError as e:
            if e.code == 404:
                logging.error(f"ProjectaLogs: Printer {self.printer_id} not found in backend")
                self.server.add_warning("ProjectaLogs: Printer not registered. Job tracking disabled.")
            else:
                logging.warning(f"ProjectaLogs: Could not validate printer (HTTP {e.code})")
        except Exception as e:
            logging.warning(f"ProjectaLogs: Could not validate printer: {e}")

        await self._check_backend_health()
        await self._fetch_projects()

    async def _handle_klippy_ready(self):
        self.server.send_event("projectalogs:active_project_set", {
            "project_id": self.current_project_id
        })

    def set_active_project(self, project_id: Optional[str]) -> None:
        if project_id != self.current_project_id:
            self.current_project_id = project_id
            self.database.insert_item(DB_NAMESPACE, ACTIVE_PROJECT_KEY, project_id)
            self.server.send_event("projectalogs:active_project_set", {
                "project_id": project_id
            })
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
        await self._fetch_projects()
        return {"projects": self.projects_cache}

    async def _fetch_projects(self):
        try:
            response = await self.http_client.get(self.projects_endpoint)
            response.raise_for_status()
            projects_data = response.json()
            if isinstance(projects_data, list):
                self.projects_cache = projects_data
            else:
                self.projects_cache = projects_data.get("projects", [])
            logging.info(f"ProjectaLogs: Loaded {len(self.projects_cache)} projects")
        except Exception as e:
            logging.warning(f"ProjectaLogs: Failed to fetch projects: {e}")

    async def _create_job(self, job_data: Dict[str, Any]):
        if not self.printer_validated:
            logging.warning("ProjectaLogs: Printer not validated, skipping job creation")
            return

        try:
            payload = {
                "printer_id": self.printer_id,
                "projectId": self.current_project_id,
                "job_id": job_data.get("job_id"),
                "filename": job_data.get("filename"),
                "status": "in_progress",
                "start_time": job_data.get("start_time"),
                "metadata": job_data.get("metadata", {})
            }

            response = await self.http_client.post(self.jobs_endpoint, json=payload)
            response.raise_for_status()
            response_data = response.json() if response.body else {}
            self.current_job_id = response_data.get("id")
            logging.info(f"ProjectaLogs: Created job {self.current_job_id}")

        except Exception as e:
            logging.error(f"ProjectaLogs: Failed to create job: {e}")

    async def _update_job(self, job_data: Dict[str, Any], status: str):
        if not self.current_job_id:
            logging.warning("ProjectaLogs: No current job ID to update")
            return

        try:
            payload = {
                "status": status,
                "end_time": job_data.get("end_time"),
                "print_duration": job_data.get("print_duration"),
                "total_duration": job_data.get("total_duration"),
                "filament_used": job_data.get("filament_used")
            }

            update_url = f"{self.jobs_endpoint}/{self.current_job_id}"
            response = await self.http_client.patch(update_url, json=payload)
            response.raise_for_status()
            logging.info(f"ProjectaLogs: Updated job {self.current_job_id} -> {status}")
            self.current_job_id = None

        except Exception as e:
            logging.error(f"ProjectaLogs: Failed to update job: {e}")

    async def _check_backend_health(self) -> bool:
        try:
            response = await self.http_client.get(self.health_endpoint)
            response.raise_for_status()
            self.backend_healthy = True
            logging.info("ProjectaLogs: Backend is healthy")
            return True
        except Exception as e:
            self.backend_healthy = False
            logging.warning(f"ProjectaLogs: Backend health check failed: {e}")
            return False

    async def _handle_refresh_request(self, web_request):
        await self._check_backend_health()

        try:
            response = await self.http_client.get(self.printer_validate_endpoint)
            response.raise_for_status()
            self.printer_validated = True
        except Exception:
            self.printer_validated = False

        await self._fetch_projects()

        return {
            "backend_healthy": self.backend_healthy,
            "printer_validated": self.printer_validated,
            "projects_cached": len(self.projects_cache)
        }

    async def _handle_status_request(self, web_request):
        return {
            "backend_url": self.backend_url,
            "printer_id": self.printer_id,
            "printer_validated": self.printer_validated,
            "backend_healthy": self.backend_healthy,
            "current_project_id": self.current_project_id,
            "current_job_id": self.current_job_id,
            "projects_cached": len(self.projects_cache)
        }


def load_component(config):
    return ProjectaLogs(config)