import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Project } from 'src/project/entities/project.entity';

export class CreateClientDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: "string" })
  name: string;
  
  @IsOptional()
  @IsArray()
  @ApiProperty({ type: [Project], required: false })
  projects: Project[];
}
