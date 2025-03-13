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
export class JobService {
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
      relations: ['project'],
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
}
