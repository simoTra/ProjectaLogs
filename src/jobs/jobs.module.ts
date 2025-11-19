import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from './entities/job.entity';
import { Project } from 'src/projects/entities/project.entity';
import { Printer } from 'src/printers/entities/printer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Job, Project, Printer])],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
