import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { PrintersService } from './printers.service';
import { CreatePrinterDto } from './dto/create-printer.dto';
import { UpdatePrinterDto } from './dto/update-printer.dto';
import { Printer } from './entities/printer.entity';
import { JobSyncResult } from './dto/job-sync-result.dto';

@Controller('printers')
export class PrintersController {
  constructor(private readonly printersService: PrintersService) {}

  @Get('/syncJobs/:id')
  async syncJobs(@Param('id', ParseIntPipe) id: number): Promise<JobSyncResult> {
    return this.printersService.fetchAndSaveJobsFromPrinter(id);
  }
  @Get('/syncStats/:id')
  async syncStats(@Param('id', ParseIntPipe) id: number): Promise<string> {
    await this.printersService.syncStats(id);
    return 'Stats fetched and saved successfully';
  }

  @Get('stats/utilization-rates')
  getPrinterUtilizationRates() {
    return this.printersService.getPrinterUtilizationRates();
  }

  @Get('stats/reliability-comparison')
  getPrinterReliabilityComparison() {
    return this.printersService.getPrinterReliabilityComparison();
  }

  @Get('stats/performance-metrics')
  getPrinterPerformanceMetrics() {
    return this.printersService.getPrinterPerformanceMetrics();
  }

  @Get('stats/workload-distribution')
  getPrinterWorkloadDistribution() {
    return this.printersService.getPrinterWorkloadDistribution();
  }

  @Post()
  create(@Body() createPrinterDto: CreatePrinterDto): Promise<Printer> {
    return this.printersService.create(createPrinterDto);
  }

  @Get()
  findAll(): Promise<Printer[]> {
    return this.printersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Printer> {
    return this.printersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePrinterDto: UpdatePrinterDto,
  ): Promise<Printer> {
    return this.printersService.update(+id, updatePrinterDto);
  }

  @Patch(':id/jobs')
  async updatePrinterJobs(
    @Param('id', ParseIntPipe) id: number,
    @Body() jobIds: number[],
  ) {
    return this.printersService.updatePrinterJobs(id, jobIds);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.printersService.remove(id);
  }
}
