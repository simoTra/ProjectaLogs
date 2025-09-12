import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientService } from './client/client.service';
import { ProjectService } from './project/project.service';
import { JobService } from './job/job.service';
import { PrinterService } from './printer/printer.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly clientService: ClientService,
    private readonly projectService: ProjectService,
    private readonly jobService: JobService,
    private readonly printerService: PrinterService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('stats/overview')
  async getSystemOverview() {
    const [
      topClients,
      topProjects,
      recentJobStats,
      printerUtilization,
      systemMetrics
    ] = await Promise.all([
      this.clientService.getTopClients(),
      this.projectService.getTopProjects(),
      this.jobService.getJobsPerMonth(),
      this.printerService.getPrinterUtilizationRates(),
      this.getSystemMetrics()
    ]);

    return {
      summary: systemMetrics,
      topClients: topClients.slice(0, 3),
      topProjects: topProjects.slice(0, 3),
      recentActivity: recentJobStats.slice(-6), // Last 6 months
      printerStatus: printerUtilization.slice(0, 3),
      timestamp: new Date().toISOString()
    };
  }

  private async getSystemMetrics() {
    const successRates = await this.jobService.getJobSuccessRates();
    const efficiencyMetrics = await this.jobService.getEfficiencyMetrics();
    
    return {
      totalSuccess: successRates.overall.successRate || 0,
      avgJobDuration: Math.round(efficiencyMetrics.timeEfficiency.avgJobDuration || 0),
      avgFilamentPerHour: Math.round(efficiencyMetrics.filamentEfficiency.avgFilamentPerHour || 0),
      totalJobs: successRates.overall.total || 0
    };
  }
}
