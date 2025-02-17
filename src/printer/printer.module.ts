import { Module } from '@nestjs/common';
import { PrinterService } from './printer.service';
import { PrinterController } from './printer.controller';
import { Job } from 'src/job/entities/job.entity';
import { Printer } from './entities/printer.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Printer, Job])],
  controllers: [PrinterController],
  providers: [PrinterService],
  exports: [TypeOrmModule],
})
export class PrinterModule {}
