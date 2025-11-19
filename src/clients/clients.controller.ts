import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client } from './entities/client.entity';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get('stats/top')
  getTopClients() {
    return this.clientsService.getTopClients();
  }

  @Get('stats/top-by-print-time')
  getTopClientsByPrintTime() {
    return this.clientsService.getTopClientsByPrintTime();
  }

  @Get('stats/top-by-filament')
  getTopClientsByFilament() {
    return this.clientsService.getTopClientsByFilament();
  }

  @Get('stats/most-active')
  getMostActiveClients(@Query('days') days?: string) {
    const numDays = days ? parseInt(days, 10) : 30;
    return this.clientsService.getMostActiveClients(numDays);
  }

  @Get('stats/success-rates')
  getClientSuccessRates() {
    return this.clientsService.getClientSuccessRates();
  }

  @Post()
  create(@Body() createClientDto: CreateClientDto): Promise<Client> {
    return this.clientsService.create(createClientDto);
  }

  @Get()
  findAll(): Promise<Client[]> {
    return this.clientsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Client> {
    return this.clientsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClientDto: UpdateClientDto,
  ): Promise<Client> {
    return this.clientsService.update(+id, updateClientDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.clientsService.remove(id);
  }
}
