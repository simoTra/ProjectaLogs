import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';
import { Client } from 'src/client/entities/client.entity';
import { Job } from 'src/job/entities/job.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,

    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

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
}
