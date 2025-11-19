import { Module } from '@nestjs/common';
import { PrintersService } from './printers.service';
import { PrintersController } from './printers.controller';
import { Job } from 'src/jobs/entities/job.entity';
import { Printer } from './entities/printer.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Printer, Job])],
  controllers: [PrintersController],
  providers: [PrintersService],
  exports: [TypeOrmModule, PrintersService],
})
export class PrintersModule {}
