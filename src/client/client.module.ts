import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { Project } from 'src/project/entities/project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Client, Project])],
  controllers: [ClientController],
  providers: [ClientService],
  exports: [TypeOrmModule],
})
export class ClientModule {}
