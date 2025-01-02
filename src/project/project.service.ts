import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';
import { Client } from 'src/client/entities/client.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const { name, description, clientId } = createProjectDto;

    const client = await this.clientRepository.findOneBy({ id: clientId });
    if (!client) {
      throw new Error(`Client with ID ${clientId} not found`);
    }

    const project = this.projectRepository.create({
      name,
      description,
      client,
    });

    return this.projectRepository.save(project);
  }

  findAll(): Promise<Project[]> {
    return this.projectRepository.find({ relations: ['client'] });
  }

  async findOne(id: number): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['client'],
    });

    if (!project) {
      throw new Error(`Project with ID ${id} not found`);
    }

    return project;
  }

  async update(
    id: number,
    updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    const { name, description, clientId } = updateProjectDto;

    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['client'],
    });

    if (!project) {
      throw new Error(`Project with ID ${id} not found`);
    }

    if (clientId) {
      const client = await this.clientRepository.findOneBy({ id: clientId });
      if (!client) {
        throw new Error(`Client with ID ${clientId} not found`);
      }
      project.client = client;
    }

    if (name) project.name = name;
    if (description) project.description = description;

    return this.projectRepository.save(project);
  }

  async remove(id: number): Promise<void> {
    const project = await this.projectRepository.findOneBy({ id });
    if (!project) {
      throw new Error(`Project with ID ${id} not found`);
    }

    await this.projectRepository.delete(id);
  }
}
