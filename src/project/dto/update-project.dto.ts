import { PartialType } from '@nestjs/swagger';
import { CreateProjectDto } from './create-project.dto';
import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Client } from 'src/client/entities/client.entity';


export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  client?: Client; 
}
