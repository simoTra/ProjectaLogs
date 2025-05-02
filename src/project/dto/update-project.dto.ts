import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateProjectDto } from './create-project.dto';
import { IsOptional, IsString, IsNumber, IsArray } from 'class-validator';
import { Client } from 'src/client/entities/client.entity';
import { Job } from 'src/job/entities/job.entity';


export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @IsOptional()
  @IsString()
  @ApiProperty({ type: "string", required: false })
  name?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ type: "string", required: false })

  description?: string;
  @IsOptional()
  @ApiProperty({ type: [Client], required: false })
  client?: Client;

  @IsOptional()
  @IsArray()
  @ApiProperty({ type: [Job], required: false })
  jobs?: Job[];
}
