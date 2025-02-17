import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { JobService } from './job.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Job } from './entities/job.entity';

@Controller('job')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Post()
  create(@Body() jobData: CreateJobDto): Promise<Job> {
    return this.jobService.create(jobData);
  }

  @Get()
  findAll(): Promise<Job[]> {
    return this.jobService.findAll();
  }

  @Get('/get/:id')
  findOne(@Param('id') id: number): Promise<Job> {
    return this.jobService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateData: UpdateJobDto): Promise<Job> {
    return this.jobService.update(id, updateData);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.jobService.remove(id);
  }


  @Get('/sync')
  async syncJobs(): Promise<string> {
    const url = 'http://100.113.166.1/printers/1557981001/fluidd/server/history/list';
    await this.jobService.fetchAndSaveJobsFromPrinter(url);
    return 'Jobs fetched and saved successfully';
  }
}
