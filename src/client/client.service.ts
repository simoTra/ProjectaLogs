import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { In, Repository } from 'typeorm';
import { Project } from 'src/project/entities/project.entity';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async create(createClientDto: CreateClientDto): Promise<Client> {
    const { ...clientData } = createClientDto;

    if (createClientDto.projects) {
      if (Object.keys(createClientDto.projects).length === 0) {
        clientData.projects = null;
      }
    }

    const client = this.clientRepository.create({ ...clientData });
    return this.clientRepository.save(client);
  }

  findAll(): Promise<Client[]> {
    return this.clientRepository.find({ relations: ['projects'] });
  }

  async findOne(id: number): Promise<Client> {
    const client = await this.clientRepository.findOne({
      where: { id },
      relations: ['projects'],
    });

    if (!client) {
      throw new Error(`Client with ID ${id} not found`);
    }

    return client;
  }

  async update(id: number, updateClientDto: UpdateClientDto): Promise<Client> {
    const client = await this.clientRepository.findOne({
      where: { id },
      relations: ['projects'],
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    if (updateClientDto.name) {
      client.name = updateClientDto.name;
    }

    if (updateClientDto.projects) {
      if (updateClientDto.projects.length === 0) {
        client.projects = null;
      } else {
        const projectIds = updateClientDto.projects.map((p) => p.id);
        const projects = await this.projectRepository.findBy({
          id: In(projectIds),
        });

        if (projects.length !== projectIds.length) {
          throw new NotFoundException('Some projects not found');
        }

        client.projects = projects;
      }
    }

    return this.clientRepository.save(client);
  }

  async remove(id: number): Promise<void> {
    const result = await this.clientRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
  }

  async getTopClients(): Promise<{ name: string; projects: number }[]> {
    return this.clientRepository
      .createQueryBuilder('client')
      .leftJoinAndSelect('client.projects', 'project')
      .select('client.name', 'name')
      .addSelect('COUNT(project.id)', 'projects')
      .groupBy('client.id')
      .orderBy('projects', 'DESC')
      .limit(3)
      .getRawMany();
  }
}
