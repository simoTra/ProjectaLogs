import { PartialType } from '@nestjs/swagger';
import { CreateClientDto } from './create-client.dto';
import { ArrayNotEmpty, IsArray, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { Project } from 'src/project/entities/project.entity';

export class UpdateClientDto extends PartialType(CreateClientDto) {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsArray()
  projects?: Project[];
}
