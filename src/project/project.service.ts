import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    const { clientId, ...projectData } = createProjectDto;

    const client = await this.clientRepository.findOne({ where: { id: clientId } });
    if (!client) {
      throw new NotFoundException(`Client with ID ${clientId} not found`);
    }

    const project = this.projectRepository.create({ ...projectData, client });
    return this.projectRepository.save(project);
  }

  findAll(): Promise<Project[]> {
    return this.projectRepository.find({ relations: ['jobs', 'client'] });
  }

  async findOne(id: number): Promise<Project> {
    const project = await this.projectRepository.findOne({ where: { id }, relations: ['jobs', 'client'] });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async update(id: number, updateProjectDto: UpdateProjectDto): Promise<Project> {
    const { clientId, ...updateData } = updateProjectDto;

    const project = await this.projectRepository.findOne({ where: { id } });
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    if (clientId) {
      const client = await this.clientRepository.findOne({ where: { id: clientId } });
      if (!client) {
        throw new NotFoundException(`Client with ID ${clientId} not found`);
      }
      project.client = client;
    }

    Object.assign(project, updateData);
    return this.projectRepository.save(project);
  }

  async remove(id: number): Promise<void> {
    const result = await this.projectRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
  }
}
