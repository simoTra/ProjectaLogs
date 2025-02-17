import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Job } from './entities/job.entity';
import axios from 'axios';

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

  findAll(): Promise<Job[]> {
    return this.jobRepository.find({ relations: ['project'] });
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

  async fetchAndSaveJobsFromPrinter(url: string): Promise<void> {
    try {
      const response = await axios.get(url);
      const jobs = response.data.result.jobs;
      for (const jobData of jobs) {
        const existingJob = await this.jobRepository.findOne({
          where: { jobId: jobData.job_id },
        });

        if (!existingJob) {
          const newJob = this.jobRepository.create(jobData);
          await this.jobRepository.save(newJob);
          console.log(`Job with jobId ${jobData.job_id} has been imported.`);
        } else {
          console.log(
            `Job with jobId ${jobData.job_id} already exists. Skipping.`,
          );
        }
      }
    } catch (error) {
      console.error('Error fetching jobs from printer:', error);
    }
  }
}
