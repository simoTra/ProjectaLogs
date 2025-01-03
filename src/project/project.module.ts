import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { Client } from 'src/client/entities/client.entity';
import { Job } from 'src/job/entities/job.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Project, Client, Job])],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [TypeOrmModule]
})
export class ProjectModule {}
