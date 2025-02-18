import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePrinterDto } from './dto/create-printer.dto';
import { UpdatePrinterDto } from './dto/update-printer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Printer } from './entities/printer.entity';
import { Job } from 'src/job/entities/job.entity';
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

  async remove(id: number): Promise<void> {
    const result = await this.printerRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Project with ID ${id} not found`);
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
