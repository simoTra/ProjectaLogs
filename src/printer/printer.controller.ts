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
import { PrinterService } from './printer.service';
import { CreatePrinterDto } from './dto/create-printer.dto';
import { UpdatePrinterDto } from './dto/update-printer.dto';
import { Printer } from './entities/printer.entity';

@Controller('printer')
export class PrinterController {
  constructor(private readonly printerService: PrinterService) {}

  @Get('/syncJobs/:id')
  async syncJobs(@Param('id', ParseIntPipe) id: number): Promise<string> {
    await this.printerService.fetchAndSaveJobsFromPrinter(id);
    return 'Jobs fetched and saved successfully';
  }
  @Get('/syncStats/:id')
  async syncStats(@Param('id', ParseIntPipe) id: number): Promise<string> {
    await this.printerService.syncStats(id);
    return 'Stats fetched and saved successfully';
  }

  @Post()
  create(@Body() createPrinterDto: CreatePrinterDto): Promise<Printer> {
    return this.printerService.create(createPrinterDto);
  }

  @Get()
  findAll(): Promise<Printer[]> {
    return this.printerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Printer> {
    return this.printerService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePrinterDto: UpdatePrinterDto,
  ): Promise<Printer> {
    return this.printerService.update(+id, updatePrinterDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.printerService.remove(id);
  }
}
