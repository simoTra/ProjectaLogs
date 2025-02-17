import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProjectModule } from './project/project.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './project/entities/project.entity';
import { DataSource } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientModule } from './client/client.module';
import { Client } from './client/entities/client.entity';
import { JobModule } from './job/job.module';
import { Job } from './job/entities/job.entity';
import { PrinterModule } from './printer/printer.module';
import { Printer } from './printer/entities/printer.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database: 'projectalogs-db.sqlite',
        entities: [Project, Client, Job, Printer],
        synchronize: true,
      }),
    }),
    ProjectModule,
    ClientModule,
    JobModule,
    PrinterModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
