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
