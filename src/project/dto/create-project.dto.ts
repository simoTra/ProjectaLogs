import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';
import { Client } from 'src/client/entities/client.entity';

export class CreateProjectDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()  
  @IsOptional()
  description: string;

  @IsOptional()
  client: Client;
}
