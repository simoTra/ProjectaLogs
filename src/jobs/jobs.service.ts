import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Job } from './entities/job.entity';
import axios from 'axios';
import { SearchJob } from './dto/search-job';
import { endOfMonth, startOfMonth, subMonths } from 'date-fns';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
  ) {}

  create(jobData: CreateJobDto): Promise<Job> {
    const job = this.jobRepository.create(jobData);
    return this.jobRepository.save(job);
  }

  findAll(status?: string): Promise<Job[]> {
    const whereCondition: SearchJob = {};

    if (status) {
      whereCondition.status = status;
    }

    return this.jobRepository.find({
      where: whereCondition,
      relations: ['project', 'printer'],
    });
  }

  async findOne(id: number): Promise<Job> {
    const job = await this.jobRepository.findOne({
      where: { id },
      relations: ['project', 'printer'],
    });
    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    return job;
  }

  async update(id: number, updateData: UpdateJobDto): Promise<Job> {
    await this.jobRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.jobRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
  }

  async getJobsPerMonth(): Promise<{ month: string; jobCount: number }[]> {
    const rawData = await this.jobRepository.query(`
      SELECT
        strftime('%Y-%m', datetime(CAST(start_time AS INTEGER), 'unixepoch')) AS month,
        COUNT(id) AS jobCount
      FROM job
      WHERE start_time IS NOT NULL
      GROUP BY month
      ORDER BY month ASC;
    `);
    return rawData;
  }

  async getJobPerformanceAnalysis(): Promise<{ filename: string; estimatedTime: number; actualTime: number; variance: number; variancePercent: number }[]> {
    return this.jobRepository
      .createQueryBuilder('job')
      .select('job.filename', 'filename')
      .addSelect('JSON_EXTRACT(job.metadata, "$.estimated_time")', 'estimatedTime')
      .addSelect('job.print_duration', 'actualTime')
      .addSelect('(job.print_duration - JSON_EXTRACT(job.metadata, "$.estimated_time"))', 'variance')
      .addSelect('ROUND((job.print_duration - JSON_EXTRACT(job.metadata, "$.estimated_time")) * 100.0 / JSON_EXTRACT(job.metadata, "$.estimated_time"), 2)', 'variancePercent')
      .where('job.metadata IS NOT NULL')
      .andWhere('JSON_EXTRACT(job.metadata, "$.estimated_time") > 0')
      .andWhere('job.print_duration > 0')
      .orderBy('variancePercent', 'DESC')
      .limit(10)
      .getRawMany();
  }

  async getJobSuccessRates(): Promise<{
    overall: { total: number; completed: number; failed: number; successRate: number };
    byPrinter: { printerName: string; total: number; successRate: number }[];
    byStatus: { status: string; count: number; percentage: number }[];
  }> {
    const overall = await this.jobRepository.query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'error' OR status = 'cancelled' THEN 1 ELSE 0 END) as failed,
        ROUND(SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as successRate
      FROM job
      WHERE status IS NOT NULL
    `);

    const byPrinter = await this.jobRepository.query(`
      SELECT
        COALESCE(printer.name, 'Unknown') as printerName,
        COUNT(job.id) as total,
        ROUND(SUM(CASE WHEN job.status = 'completed' THEN 1 ELSE 0 END) * 100.0 / COUNT(job.id), 2) as successRate
      FROM job
      LEFT JOIN printer ON printer.id = job.printer_id
      WHERE job.status IS NOT NULL
      GROUP BY printer.name
      ORDER BY successRate DESC
    `);

    const byStatus = await this.jobRepository.query(`
      SELECT
        status,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM job WHERE status IS NOT NULL), 2) as percentage
      FROM job
      WHERE status IS NOT NULL
      GROUP BY status
      ORDER BY count DESC
    `);

    return {
      overall: overall[0],
      byPrinter,
      byStatus
    };
  }

  async getPeakUsageAnalysis(): Promise<{
    byHour: { hour: number; jobCount: number }[];
    byDayOfWeek: { dayOfWeek: string; jobCount: number }[];
    byMonth: { month: string; jobCount: number }[];
  }> {
    const byHour = await this.jobRepository.query(`
      SELECT
        CAST(strftime('%H', datetime(CAST(start_time AS INTEGER), 'unixepoch')) AS INTEGER) as hour,
        COUNT(*) as jobCount
      FROM job
      WHERE start_time IS NOT NULL
      GROUP BY hour
      ORDER BY hour
    `);

    const byDayOfWeek = await this.jobRepository.query(`
      SELECT
        CASE CAST(strftime('%w', datetime(CAST(start_time AS INTEGER), 'unixepoch')) AS INTEGER)
          WHEN 0 THEN 'Sunday'
          WHEN 1 THEN 'Monday'
          WHEN 2 THEN 'Tuesday'
          WHEN 3 THEN 'Wednesday'
          WHEN 4 THEN 'Thursday'
          WHEN 5 THEN 'Friday'
          WHEN 6 THEN 'Saturday'
        END as dayOfWeek,
        COUNT(*) as jobCount
      FROM job
      WHERE start_time IS NOT NULL
      GROUP BY strftime('%w', datetime(CAST(start_time AS INTEGER), 'unixepoch'))
      ORDER BY CAST(strftime('%w', datetime(CAST(start_time AS INTEGER), 'unixepoch')) AS INTEGER)
    `);

    const byMonth = await this.jobRepository.query(`
      SELECT
        strftime('%Y-%m', datetime(CAST(start_time AS INTEGER), 'unixepoch')) as month,
        COUNT(*) as jobCount
      FROM job
      WHERE start_time IS NOT NULL
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `);

    return { byHour, byDayOfWeek, byMonth };
  }

  async getEfficiencyMetrics(): Promise<{
    filamentEfficiency: { avgFilamentPerHour: number; topEfficientJobs: any[] };
    timeEfficiency: { avgJobDuration: number; medianJobDuration: number };
    slicerComparison: { slicer: string; avgTime: number; avgFilament: number; jobCount: number }[];
  }> {
    const filamentStats = await this.jobRepository.query(`
      SELECT
        AVG(filament_used / (print_duration / 3600.0)) as avgFilamentPerHour
      FROM job
      WHERE filament_used > 0 AND print_duration > 0
    `);

    const topEfficientJobs = await this.jobRepository.query(`
      SELECT
        filename,
        filament_used,
        print_duration,
        ROUND(filament_used / (print_duration / 3600.0), 2) as efficiency
      FROM job
      WHERE filament_used > 0 AND print_duration > 0
      ORDER BY efficiency DESC
      LIMIT 5
    `);

    const timeStats = await this.jobRepository.query(`
      SELECT
        AVG(print_duration) as avgJobDuration,
        (SELECT print_duration FROM job WHERE print_duration > 0 ORDER BY print_duration LIMIT 1 OFFSET (SELECT COUNT(*) FROM job WHERE print_duration > 0) / 2) as medianJobDuration
      FROM job
      WHERE print_duration > 0
    `);

    const slicerComparison = await this.jobRepository.query(`
      SELECT
        JSON_EXTRACT(metadata, '$.slicer') as slicer,
        AVG(print_duration) as avgTime,
        AVG(filament_used) as avgFilament,
        COUNT(*) as jobCount
      FROM job
      WHERE metadata IS NOT NULL
        AND JSON_EXTRACT(metadata, '$.slicer') IS NOT NULL
        AND print_duration > 0
      GROUP BY JSON_EXTRACT(metadata, '$.slicer')
      HAVING jobCount >= 3
      ORDER BY avgTime ASC
    `);

    return {
      filamentEfficiency: {
        avgFilamentPerHour: filamentStats[0]?.avgFilamentPerHour || 0,
        topEfficientJobs
      },
      timeEfficiency: {
        avgJobDuration: timeStats[0]?.avgJobDuration || 0,
        medianJobDuration: timeStats[0]?.medianJobDuration || 0
      },
      slicerComparison
    };
  }
}
