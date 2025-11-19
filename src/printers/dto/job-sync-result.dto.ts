export interface JobSyncResult {
  success: boolean;
  jobsAdded: number;
  jobsUpdated: number;
  jobsSkipped: number;
  jobsFailed: number;
  errors: Array<{ job_id: string; error: string }>;
  totalProcessed: number;
}
