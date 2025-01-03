import { PartialType } from '@nestjs/swagger';
import { CreateProjectDto } from './create-project.dto';
import { IsOptional, IsString, IsNumber, IsArray } from 'class-validator';
import { Client } from 'src/client/entities/client.entity';
import { Job } from 'src/job/entities/job.entity';


export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  client?: Client; 

  @IsOptional()
  @IsArray()
  jobs?: Job[];
}
