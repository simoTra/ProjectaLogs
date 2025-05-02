import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';
import { Client } from 'src/client/entities/client.entity';

export class CreateProjectDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: "string"})
  name: string;
  
  @IsString()  
  @IsOptional()
  @ApiProperty({ type: "string", required: false})
  description: string;

  @IsOptional()
  @ApiProperty({ type: [Client], required: false})
  client: Client;
}
