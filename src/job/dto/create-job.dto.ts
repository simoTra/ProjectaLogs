import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateJobDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  totalDuration?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  filament?: number;
  
  @IsOptional()
  @IsString()
  filamentType?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  projectId?: number;
}
