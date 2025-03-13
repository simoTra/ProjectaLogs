import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { JobService } from './job.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Job } from './entities/job.entity';

@Controller('job')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Get('stats/job-per-month')
  getProjectsPerMonth() {
    return this.jobService.getJobsPerMonth();
  }

  @Post()
  create(@Body() jobData: CreateJobDto): Promise<Job> {
    return this.jobService.create(jobData);
  }

  @Get()
  findAll(@Query('status') status?: string): Promise<Job[]> {
    return this.jobService.findAll(status);
  }

  @Get('/:id')
  findOne(@Param('id') id: number): Promise<Job> {
    return this.jobService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateData: UpdateJobDto,
  ): Promise<Job> {
    return this.jobService.update(id, updateData);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.jobService.remove(id);
  }
}
