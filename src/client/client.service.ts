import { Injectable } from '@nestjs/common';
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
    const client = new Client();
    client.name = createClientDto.name;

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
      throw new Error(`Client with ID ${id} not found`);
    }

    if (updateClientDto.name) {
      client.name = updateClientDto.name;
    }

    if (updateClientDto.projects) {
      const projects = await this.projectRepository.findBy({
        id: In(updateClientDto.projects.map((p) => p.id)),
      });
      console.log(projects);
      client.projects = projects;
    }

    return this.clientRepository.save(client);
  }

  async remove(id: number): Promise<void> {
    const client = await this.clientRepository.findOne({
      where: { id },
      relations: ['projects'],
    });

    if (!client) {
      throw new Error(`Client with ID ${id} not found`);
    }

    if (client.projects && client.projects.length > 0) {
      await this.projectRepository.delete(client.projects.map((p) => p.id));
    }

    await this.clientRepository.delete(id);
  }
}
