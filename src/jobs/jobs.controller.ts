import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  Res,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Job } from './entities/job.entity';
import axios from 'axios';
import { Response } from 'express';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) { }
  @Get('thumbnail/:id')
  async proxyThumbnail(
    @Param('id') id: number,
    @Query('path') relativePath: string,
    @Res() res: Response,
  ) {
    try {
      const job = await this.jobsService.findOne(id);

      if (!job || !job.printer?.ipAddress) {
        return res.status(404).send('Job or printer not found');
      }

      const thumbnailUrl = `${job.printer.ipAddress}/server/files/gcodes/${relativePath}`;
      const response = await axios.get(thumbnailUrl, { responseType: 'stream' });

      res.setHeader('Content-Type', response.headers['content-type'] || 'image/png');
      res.setHeader('Content-Disposition', 'inline');

      response.data.pipe(res);
    } catch (error) {
      res.status(404).send('Thumbnail not found');
    }
  }

  @Get('stats/job-per-month')
  getProjectsPerMonth() {
    return this.jobsService.getJobsPerMonth();
  }

  @Get('stats/performance-analysis')
  getJobPerformanceAnalysis() {
    return this.jobsService.getJobPerformanceAnalysis();
  }

  @Get('stats/success-rates')
  getJobSuccessRates() {
    return this.jobsService.getJobSuccessRates();
  }

  @Get('stats/peak-usage')
  getPeakUsageAnalysis() {
    return this.jobsService.getPeakUsageAnalysis();
  }

  @Get('stats/efficiency-metrics')
  getEfficiencyMetrics() {
    return this.jobsService.getEfficiencyMetrics();
  }

  @Post()
  create(@Body() jobData: CreateJobDto): Promise<Job> {
    return this.jobsService.create(jobData);
  }

  @Get()
  findAll(@Query('status') status?: string): Promise<Job[]> {
    return this.jobsService.findAll(status);
  }

  @Get('/:id')
  findOne(@Param('id') id: number): Promise<Job> {
    return this.jobsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateData: UpdateJobDto,
  ): Promise<Job> {
    return this.jobsService.update(id, updateData);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.jobsService.remove(id);
  }
}
