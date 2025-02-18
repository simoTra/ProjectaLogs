import { PartialType } from '@nestjs/swagger';
import { CreateJobDto } from './create-job.dto';
import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class UpdateJobDto extends PartialType(CreateJobDto) {
    @IsOptional()
    @IsString()
    name?: string;
  
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
