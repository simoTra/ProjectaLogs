import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePrinterDto } from './dto/create-printer.dto';
import { UpdatePrinterDto } from './dto/update-printer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Printer } from './entities/printer.entity';
import { Job } from 'src/jobs/entities/job.entity';
import axios from 'axios';

@Injectable()
export class PrinterService {
  constructor(
    @InjectRepository(Printer)
    private readonly printerRepository: Repository<Printer>,
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
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

  async fetchAndSaveJobsFromPrinter(id: number): Promise<void> {
    await this.syncStats(id);
    const printer = await this.printerRepository.findOne({
      where: { id },
      relations: ['jobs'],
    });

    try {
      const response = await axios.get(`${printer.ipAddress}/server/history/list`, {
        params: { limit: printer.job_totals.total_jobs + 100 },
      });

      const { jobs } = response.data.result;

      for (const jobData of jobs) {
        const existingJob = await this.jobRepository.findOne({
          where: { job_id: jobData.job_id, printer: { id } },
        });

        if (!existingJob) {
          jobData.printer = printer;
          const newJob = this.jobRepository.create(jobData);
          await this.jobRepository.save(newJob);
        } else if (existingJob.status !== jobData.status) {
          console.log(`Updating job ${jobData.job_id} status from ${existingJob.status} to ${jobData.status}`);
          await this.jobRepository.update(existingJob.id, {
            ...existingJob,
            ...jobData,
          });
        } else {
          console.log(`Job with jobId ${jobData.job_id} already exists with same status. Skipping.`);
        }
      }
    } catch (error) {
      console.error('Error fetching jobs from printer:', error);
    }
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
