import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { Client } from 'src/clients/entities/client.entity';
import { Job } from 'src/jobs/entities/job.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Project, Client, Job])],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [TypeOrmModule, ProjectsService]
})
export class ProjectsModule {}
