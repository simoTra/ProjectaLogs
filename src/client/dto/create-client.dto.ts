import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Project } from 'src/project/entities/project.entity';

export class CreateClientDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsArray()
  projects: Project[];
}
