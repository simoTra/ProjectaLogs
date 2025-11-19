import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { CreatePrinterDto } from './dto/create-printer.dto';
import { UpdatePrinterDto } from './dto/update-printer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, DataSource } from 'typeorm';
import { Printer } from './entities/printer.entity';
import { Job } from 'src/jobs/entities/job.entity';
import axios from 'axios';
import { JobSyncResult } from './dto/job-sync-result.dto';

@Injectable()
export class PrintersService {
  private readonly logger = new Logger(PrintersService.name);

  constructor(
    @InjectRepository(Printer)
    private readonly printerRepository: Repository<Printer>,
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    private readonly dataSource: DataSource,
  ) {}

  create(createPrinterDto: CreatePrinterDto): Promise<Printer> {
    const { ...printerData } = createPrinterDto;

    if (createPrinterDto.jobs) {
      if (Object.keys(createPrinterDto.jobs).length === 0) {
        printerData.jobs = null;
      }
    }

    const printer = this.printerRepository.create({ ...printerData });
    return this.printerRepository.save(printer);
  }

  findAll(): Promise<Printer[]> {
    return this.printerRepository.find({ relations: ['jobs'] });
  }

  async findOne(id: number): Promise<Printer> {
    const printer = await this.printerRepository.findOne({
      where: { id },
      relations: ['jobs'],
    });

    if (!printer) {
      throw new Error(`Printer with ID ${id} not found`);
    }

    return printer;
  }

  async update(id: number, updatePrinterDto: UpdatePrinterDto) {
    const printer = await this.printerRepository.findOne({
      where: { id },
      relations: ['jobs'],
    });

    if (!printer) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    if (updatePrinterDto.name) {
      printer.name = updatePrinterDto.name;
    }
    if (updatePrinterDto.ipAddress) {
      printer.ipAddress = updatePrinterDto.ipAddress;
    }

    if (updatePrinterDto.jobs) {
      if (updatePrinterDto.jobs.length === 0) {
        printer.jobs = null;
      } else {
        const jobIds = updatePrinterDto.jobs.map((p) => p.id);
        const jobs = await this.jobRepository.findBy({
          id: In(jobIds),
        });

        if (jobs.length !== jobIds.length) {
          throw new NotFoundException('Some jobs not found');
        }

        printer.jobs = jobs;
      }
    }

    return this.printerRepository.save(printer);
  }

  async updatePrinterJobs(printerId: number, jobIds: number[]): Promise<Printer> {
    const printer = await this.printerRepository.findOne({
      where: { id: printerId },
      relations: ['jobs'],
    });

    if (!printer) {
      throw new NotFoundException(`Printer with ID ${printerId} not found`);
    }

    const jobs = await this.jobRepository.findBy({ id: In(jobIds) });

    if (jobs.length !== jobIds.length) {
      throw new NotFoundException('Some jobs not found');
    }

    printer.jobs = jobs;

    return this.printerRepository.save(printer);
  }


  async remove(id: number): Promise<void> {
    const result = await this.printerRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
  }

  async fetchAndSaveJobsFromPrinter(id: number): Promise<JobSyncResult> {
    const result: JobSyncResult = {
      success: false,
      jobsAdded: 0,
      jobsUpdated: 0,
      jobsSkipped: 0,
      jobsFailed: 0,
      errors: [],
      totalProcessed: 0,
    };

    try {
      // Sync stats first to get accurate job totals
      await this.syncStats(id);

      // Fetch printer with validation
      const printer = await this.printerRepository.findOne({
        where: { id },
      });

      if (!printer) {
        throw new NotFoundException(`Printer with ID ${id} not found`);
      }

      // Safely determine the limit for API request
      const limit = printer.job_totals?.total_jobs
        ? printer.job_totals.total_jobs + 100
        : 1000; // Default fallback if job_totals is not available

      this.logger.log(`Fetching jobs from printer ${printer.name} (ID: ${id}) with limit: ${limit}`);

      // Fetch jobs from Moonraker API
      const response = await axios.get(`${printer.ipAddress}/server/history/list`, {
        params: { limit },
        timeout: 30000, // 30 second timeout
      });

      const jobs = response.data?.result?.jobs;

      if (!Array.isArray(jobs)) {
        throw new Error('Invalid API response: jobs array not found');
      }

      this.logger.log(`Received ${jobs.length} jobs from printer ${printer.name}`);

      // Process jobs in a transaction for atomicity
      await this.dataSource.transaction(async (manager) => {
        // Fetch all existing jobs for this printer in bulk
        const existingJobs = await manager.find(Job, {
          where: { printer: { id } },
          select: ['id', 'job_id', 'status'],
        });

        // Create a map for quick lookups
        const existingJobsMap = new Map(
          existingJobs.map(job => [job.job_id, job])
        );

        const jobsToInsert: Partial<Job>[] = [];
        const jobsToUpdate: Array<{ id: number; data: Partial<Job> }> = [];

        for (const jobData of jobs) {
          result.totalProcessed++;

          try {
            // Validate required fields
            if (!jobData.job_id) {
              result.jobsFailed++;
              result.errors.push({
                job_id: 'unknown',
                error: 'Missing job_id in API response',
              });
              continue;
            }

            const existingJob = existingJobsMap.get(jobData.job_id);

            if (!existingJob) {
              // New job - prepare for bulk insert
              jobsToInsert.push({
                job_id: jobData.job_id,
                printer_id: jobData.printer_id,
                user: jobData.user,
                filename: jobData.filename,
                status: jobData.status,
                start_time: jobData.start_time,
                end_time: jobData.end_time,
                print_duration: jobData.print_duration,
                total_duration: jobData.total_duration,
                filament_used: jobData.filament_used,
                metadata: jobData.metadata,
                auxiliaryData: jobData.auxiliary_data,
                exists: jobData.exists,
                printer: printer,
              });
              result.jobsAdded++;
            } else if (this.hasJobChanged(existingJob, jobData)) {
              // Existing job with changes - prepare for bulk update
              jobsToUpdate.push({
                id: existingJob.id,
                data: {
                  printer_id: jobData.printer_id,
                  user: jobData.user,
                  filename: jobData.filename,
                  status: jobData.status,
                  start_time: jobData.start_time,
                  end_time: jobData.end_time,
                  print_duration: jobData.print_duration,
                  total_duration: jobData.total_duration,
                  filament_used: jobData.filament_used,
                  metadata: jobData.metadata,
                  auxiliaryData: jobData.auxiliary_data,
                  exists: jobData.exists,
                },
              });
              result.jobsUpdated++;
              this.logger.debug(
                `Job ${jobData.job_id} will be updated (status: ${existingJob.status} → ${jobData.status})`
              );
            } else {
              // No changes needed
              result.jobsSkipped++;
            }
          } catch (jobError) {
            result.jobsFailed++;
            result.errors.push({
              job_id: jobData.job_id || 'unknown',
              error: jobError.message,
            });
            this.logger.error(`Error processing job ${jobData.job_id}:`, jobError);
          }
        }

        // Bulk insert new jobs
        if (jobsToInsert.length > 0) {
          try {
            await manager.save(Job, jobsToInsert);
            this.logger.log(`Successfully inserted ${jobsToInsert.length} new jobs`);
          } catch (insertError) {
            this.logger.error('Error during bulk insert:', insertError);

            // If bulk insert fails (e.g., due to unique constraint), try individual inserts
            this.logger.warn('Attempting individual inserts as fallback...');
            for (const job of jobsToInsert) {
              try {
                await manager.save(Job, job);
              } catch (individualError) {
                result.jobsAdded--;
                result.jobsFailed++;
                result.errors.push({
                  job_id: job.job_id || 'unknown',
                  error: `Insert failed: ${individualError.message}`,
                });
              }
            }
          }
        }

        // Bulk update existing jobs
        if (jobsToUpdate.length > 0) {
          for (const { id, data } of jobsToUpdate) {
            try {
              await manager.update(Job, id, data);
            } catch (updateError) {
              result.jobsUpdated--;
              result.jobsFailed++;
              result.errors.push({
                job_id: data.job_id || 'unknown',
                error: `Update failed: ${updateError.message}`,
              });
              this.logger.error(`Error updating job ID ${id}:`, updateError);
            }
          }
          this.logger.log(`Successfully updated ${jobsToUpdate.length} jobs`);
        }
      });

      result.success = result.jobsFailed === 0;

      this.logger.log(
        `Job sync completed for printer ${printer.name}: ` +
        `${result.jobsAdded} added, ${result.jobsUpdated} updated, ` +
        `${result.jobsSkipped} skipped, ${result.jobsFailed} failed`
      );

      return result;
    } catch (error) {
      this.logger.error(`Error fetching jobs from printer ID ${id}:`, error);
      result.success = false;
      result.errors.push({
        job_id: 'N/A',
        error: `Critical error: ${error.message}`,
      });
      return result;
    }
  }

  /**
   * Helper method to determine if a job has changed and needs updating
   */
  private hasJobChanged(existingJob: Partial<Job>, newJobData: any): boolean {
    return (
      existingJob.status !== newJobData.status ||
      existingJob.end_time !== newJobData.end_time ||
      existingJob.print_duration !== newJobData.print_duration ||
      existingJob.filament_used !== newJobData.filament_used
    );
  }


  async syncStats(id: number) {
    const printer = await this.printerRepository.findOne({
      where: { id: id },
    });

    if (!printer) {
      console.error(`Printer with ID ${id} not found.`);
      return;
    }

    try {
      const response = await axios.get(
        `${printer.ipAddress}/server/history/totals`,
      );

      const { job_totals } = response.data.result;
      printer.job_totals = job_totals;
      await this.printerRepository.save(printer);
    } catch (error) {
      console.error('Error fetching stats from printer:', error);
    }
  }

  async getPrinterUtilizationRates(): Promise<{
    printerName: string;
    totalJobs: number;
    totalPrintTime: number;
    avgJobsPerDay: number;
    utilizationScore: number;
  }[]> {
    return this.printerRepository
      .createQueryBuilder('printer')
      .leftJoin('printer.jobs', 'job')
      .select('printer.name', 'printerName')
      .addSelect('COUNT(job.id)', 'totalJobs')
      .addSelect('COALESCE(SUM(job.print_duration), 0)', 'totalPrintTime')
      .addSelect('COALESCE(COUNT(job.id) / 30.0, 0)', 'avgJobsPerDay') // Assuming 30-day period
      .addSelect('COALESCE(SUM(job.print_duration) / 86400.0, 0)', 'utilizationScore') // Hours per day equivalent
      .groupBy('printer.id')
      .orderBy('utilizationScore', 'DESC')
      .getRawMany();
  }

  async getPrinterReliabilityComparison(): Promise<{
    printerName: string;
    totalJobs: number;
    completedJobs: number;
    failedJobs: number;
    successRate: number;
    avgJobDuration: number;
  }[]> {
    return this.printerRepository
      .createQueryBuilder('printer')
      .leftJoin('printer.jobs', 'job')
      .select('printer.name', 'printerName')
      .addSelect('COUNT(job.id)', 'totalJobs')
      .addSelect('SUM(CASE WHEN job.status = "completed" THEN 1 ELSE 0 END)', 'completedJobs')
      .addSelect('SUM(CASE WHEN job.status = "error" OR job.status = "cancelled" THEN 1 ELSE 0 END)', 'failedJobs')
      .addSelect('ROUND(SUM(CASE WHEN job.status = "completed" THEN 1 ELSE 0 END) * 100.0 / COUNT(job.id), 2)', 'successRate')
      .addSelect('AVG(job.print_duration)', 'avgJobDuration')
      .where('job.status IS NOT NULL')
      .groupBy('printer.id')
      .having('COUNT(job.id) > 0')
      .orderBy('successRate', 'DESC')
      .getRawMany();
  }

  async getPrinterPerformanceMetrics(): Promise<{
    printerName: string;
    avgJobTime: number;
    medianJobTime: number;
    totalFilament: number;
    avgFilamentPerJob: number;
    jobCount: number;
    longestJob: number;
  }[]> {
    return this.printerRepository
      .createQueryBuilder('printer')
      .leftJoin('printer.jobs', 'job')
      .select('printer.name', 'printerName')
      .addSelect('AVG(job.print_duration)', 'avgJobTime')
      .addSelect('COUNT(job.id)', 'jobCount')
      .addSelect('COALESCE(SUM(job.filament_used), 0)', 'totalFilament')
      .addSelect('COALESCE(AVG(job.filament_used), 0)', 'avgFilamentPerJob')
      .addSelect('MAX(job.print_duration)', 'longestJob')
      .addSelect('0', 'medianJobTime') // Simplified - calculating median in SQL is complex
      .where('job.print_duration > 0')
      .groupBy('printer.id')
      .having('COUNT(job.id) > 0')
      .orderBy('avgJobTime', 'ASC')
      .getRawMany();
  }

  async getPrinterWorkloadDistribution(): Promise<{
    printerName: string;
    jobCount: number;
    percentage: number;
    totalPrintTime: number;
    timePercentage: number;
  }[]> {
    return this.printerRepository
      .createQueryBuilder('printer')
      .leftJoin('printer.jobs', 'job')
      .select('printer.name', 'printerName')
      .addSelect('COUNT(job.id)', 'jobCount')
      .addSelect('COALESCE(SUM(job.print_duration), 0)', 'totalPrintTime')
      .addSelect(
        'ROUND(COUNT(job.id) * 100.0 / (SELECT COUNT(*) FROM job), 2)',
        'percentage'
      )
      .addSelect(
        'ROUND(COALESCE(SUM(job.print_duration), 0) * 100.0 / (SELECT SUM(print_duration) FROM job WHERE print_duration > 0), 2)',
        'timePercentage'
      )
      .groupBy('printer.id')
      .orderBy('jobCount', 'DESC')
      .getRawMany();
  }
}
