import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateClientDto } from './create-client.dto';
import {
  IsArray,
  IsOptional,
  IsString,
} from 'class-validator';
import { Project } from 'src/project/entities/project.entity';

export class UpdateClientDto extends PartialType(CreateClientDto) {
  @IsOptional()
  @IsString()
  @ApiProperty({ type: "string", required: false })
  name?: string;

  @IsOptional()
  @IsArray()
  @ApiProperty({ type: [Project], required: false })
  projects?: Project[];
}
