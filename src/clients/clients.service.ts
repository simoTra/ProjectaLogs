import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { In, Repository } from 'typeorm';
import { Project } from 'src/projects/entities/project.entity';

@Injectable()
export class ClientsService {
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

  async getTopClientsByPrintTime(): Promise<{ name: string; totalPrintTime: number }[]> {
    return this.clientRepository
      .createQueryBuilder('client')
      .leftJoin('client.projects', 'project')
      .leftJoin('project.jobs', 'job')
      .select('client.name', 'name')
      .addSelect('COALESCE(SUM(job.print_duration), 0)', 'totalPrintTime')
      .groupBy('client.id')
      .orderBy('totalPrintTime', 'DESC')
      .limit(5)
      .getRawMany();
  }

  async getTopClientsByFilament(): Promise<{ name: string; totalFilament: number }[]> {
    return this.clientRepository
      .createQueryBuilder('client')
      .leftJoin('client.projects', 'project')
      .leftJoin('project.jobs', 'job')
      .select('client.name', 'name')
      .addSelect('COALESCE(SUM(job.filament_used), 0)', 'totalFilament')
      .groupBy('client.id')
      .orderBy('totalFilament', 'DESC')
      .limit(5)
      .getRawMany();
  }

  async getMostActiveClients(days: number = 30): Promise<{ name: string; recentJobs: number }[]> {
    const cutoffDate = Date.now() / 1000 - (days * 24 * 60 * 60); // Convert to Unix timestamp

    return this.clientRepository
      .createQueryBuilder('client')
      .leftJoin('client.projects', 'project')
      .leftJoin('project.jobs', 'job')
      .select('client.name', 'name')
      .addSelect('COUNT(job.id)', 'recentJobs')
      .where('job.start_time > :cutoffDate', { cutoffDate })
      .groupBy('client.id')
      .orderBy('recentJobs', 'DESC')
      .limit(5)
      .getRawMany();
  }

  async getClientSuccessRates(): Promise<{ name: string; successRate: number; totalJobs: number }[]> {
    return this.clientRepository
      .createQueryBuilder('client')
      .leftJoin('client.projects', 'project')
      .leftJoin('project.jobs', 'job')
      .select('client.name', 'name')
      .addSelect('COUNT(job.id)', 'totalJobs')
      .addSelect(
        'ROUND(COUNT(CASE WHEN job.status = "completed" THEN 1 END) * 100.0 / COUNT(job.id), 2)',
        'successRate'
      )
      .where('job.status IS NOT NULL')
      .groupBy('client.id')
      .having('COUNT(job.id) > 0')
      .orderBy('successRate', 'DESC')
      .getRawMany();
  }
}
