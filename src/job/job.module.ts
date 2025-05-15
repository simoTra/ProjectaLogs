import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from './entities/job.entity';
import { Project } from 'src/project/entities/project.entity';
import { Printer } from 'src/printer/entities/printer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Job, Project, Printer])],
  controllers: [JobController],
  providers: [JobService],
})
export class JobModule {}
