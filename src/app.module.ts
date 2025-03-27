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
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({ rootPath: join(__dirname, '..', 'public') }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => ({
        type: 'sqlite',
        database: "./data/projectalogs-db.sqlite",
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
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
