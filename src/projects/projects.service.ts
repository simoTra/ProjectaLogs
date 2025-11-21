import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';
import { Client } from 'src/clients/entities/client.entity';
import { Job } from 'src/jobs/entities/job.entity';
import { ProjectForPrinter } from './dto/project-for-printer';

@Injectable()
export class ProjectsService {

  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,

    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) { }

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const { ...projectData } = createProjectDto;
    if (createProjectDto.client) {
      if (Object.keys(createProjectDto.client).length === 0) {
        projectData.client = null;
      }
    }
    const project = this.projectRepository.create({ ...projectData });
    return this.projectRepository.save(project);
  }

  findAll(): Promise<Project[]> {
    return this.projectRepository.find({ relations: ['jobs', 'client'] });
  }
  async findOne(id: number): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['jobs', 'client'],
    });
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  async update(
    id: number,
    updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['client', 'jobs'],
    });
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    if (updateProjectDto.client) {
      if (Object.keys(updateProjectDto.client).length === 0) {
        project.client = null;
      } else {
        const client = await this.clientRepository.findOne({
          where: { id: updateProjectDto.client.id },
        });
        if (!client) {
          throw new NotFoundException(
            `Client with ID ${updateProjectDto.client.id} not found`,
          );
        }
        project.client = client;
      }
    }

    if (updateProjectDto.jobs) {
      const jobIds = updateProjectDto.jobs.map((job) => job.id);
      const jobs = await this.jobRepository.findBy({ id: In(jobIds) });
      if (jobs.length !== jobIds.length) {
        throw new NotFoundException(`Some jobs not found`);
      }
      project.jobs = jobs;
    }

    const { client, jobs, ...updateData } = updateProjectDto;
    Object.assign(project, updateData);

    console.log(project);
    return this.projectRepository.save(project);
  }

  async remove(id: number): Promise<void> {
    const result = await this.projectRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
  }

  async getTopProjects(): Promise<{ name: string; jobs: number }[]> {
    return this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.jobs', 'job')
      .select('project.name', 'name')
      .addSelect('COUNT(job.id)', 'jobs')
      .groupBy('project.id')
      .orderBy('jobs', 'DESC')
      .limit(5)
      .getRawMany();
  }

  async getProjectsByDuration(): Promise<{ name: string; duration: number; firstJob: number; lastJob: number }[]> {
    return this.projectRepository
      .createQueryBuilder('project')
      .leftJoin('project.jobs', 'job')
      .select('project.name', 'name')
      .addSelect('MIN(job.start_time)', 'firstJob')
      .addSelect('MAX(job.end_time)', 'lastJob')
      .addSelect('(MAX(job.end_time) - MIN(job.start_time))', 'duration')
      .where('job.start_time IS NOT NULL AND job.end_time IS NOT NULL')
      .groupBy('project.id')
      .having('COUNT(job.id) > 1')
      .orderBy('duration', 'DESC')
      .limit(5)
      .getRawMany();
  }

  async getProjectsByPrintTime(): Promise<{ name: string; totalPrintTime: number; jobCount: number }[]> {
    return this.projectRepository
      .createQueryBuilder('project')
      .leftJoin('project.jobs', 'job')
      .select('project.name', 'name')
      .addSelect('COALESCE(SUM(job.print_duration), 0)', 'totalPrintTime')
      .addSelect('COUNT(job.id)', 'jobCount')
      .groupBy('project.id')
      .orderBy('totalPrintTime', 'DESC')
      .limit(5)
      .getRawMany();
  }

  async getMostComplexProjects(): Promise<{ name: string; totalFilament: number; totalLayers: number; avgLayerHeight: number; iterations: number }[]> {
    return this.projectRepository
      .createQueryBuilder('project')
      .leftJoin('project.jobs', 'job')
      .select('project.name', 'name')
      .addSelect('COALESCE(SUM(job.filament_used), 0)', 'totalFilament')
      .addSelect('COALESCE(SUM(JSON_EXTRACT(job.metadata, "$.layer_count")), 0)', 'totalLayers')
      .addSelect('COALESCE(AVG(JSON_EXTRACT(job.metadata, "$.layer_height")), 0)', 'avgLayerHeight')
      .addSelect('COUNT(job.id)', 'iterations')
      .where('job.metadata IS NOT NULL')
      .groupBy('project.id')
      .orderBy('totalFilament', 'DESC')
      .limit(5)
      .getRawMany();
  }

  async getProjectCompletionTrends(): Promise<{ month: string; totalProjects: number; completedProjects: number; completionRate: number }[]> {
    const rawData = await this.projectRepository.query(`
      SELECT
        strftime('%Y-%m', datetime(CAST(MIN(job.start_time) AS INTEGER), 'unixepoch')) AS month,
        COUNT(DISTINCT project.id) AS totalProjects,
        SUM(CASE WHEN project_status.completed = 1 THEN 1 ELSE 0 END) AS completedProjects,
        ROUND(SUM(CASE WHEN project_status.completed = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(DISTINCT project.id), 2) AS completionRate
      FROM project
      LEFT JOIN job ON job.project_id = project.id
      LEFT JOIN (
        SELECT
          project_id,
          CASE WHEN SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) > 0 THEN 1 ELSE 0 END AS completed
        FROM job
        WHERE status IS NOT NULL
        GROUP BY project_id
      ) project_status ON project_status.project_id = project.id
      WHERE job.start_time IS NOT NULL
      GROUP BY month
      ORDER BY month ASC;
    `);
    return rawData;
  }

  async getProjectsForPrinter(): Promise<ProjectForPrinter[]> {
    var projects = await this.projectRepository.find({ relations: ['jobs', 'client'] });
    var projectsForPrinter = projects.map((project, idx) => {
      console.log(idx);
      console.log(project);
      return {
        id: project.id,
        name: project.name,
        description: project.description,
        clientName: project.client?.name ?? 'No Client',
        jobsCount: project.jobs?.length ?? 0,
      }
    });
    return projectsForPrinter;

  }
}
