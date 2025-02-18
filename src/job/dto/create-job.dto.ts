import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateJobDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  total_duration?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  filament?: number;
  
  @IsOptional()
  @IsString()
  filament_type?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  projectId?: number;
}
