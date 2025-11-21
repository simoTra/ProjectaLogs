import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientsService } from './clients/clients.service';
import { ProjectsService } from './projects/projects.service';
import { JobsService } from './jobs/jobs.service';
import { PrintersService } from './printers/printers.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly clientsService: ClientsService,
    private readonly projectsService: ProjectsService,
    private readonly jobsService: JobsService,
    private readonly printersService: PrintersService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return { status: 'ok', timestamp: new Date().toISOString() };
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
      this.clientsService.getTopClients(),
      this.projectsService.getTopProjects(),
      this.jobsService.getJobsPerMonth(),
      this.printersService.getPrinterUtilizationRates(),
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
    const successRates = await this.jobsService.getJobSuccessRates();
    const efficiencyMetrics = await this.jobsService.getEfficiencyMetrics();
    
    return {
      totalSuccess: successRates.overall.successRate || 0,
      avgJobDuration: Math.round(efficiencyMetrics.timeEfficiency.avgJobDuration || 0),
      avgFilamentPerHour: Math.round(efficiencyMetrics.filamentEfficiency.avgFilamentPerHour || 0),
      totalJobs: successRates.overall.total || 0
    };
  }
}
