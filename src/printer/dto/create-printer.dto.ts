import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Job } from 'src/job/entities/job.entity';

export class CreatePrinterDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  ipAddress: string;

  @IsOptional()
  @IsArray()
  jobs: Job[];
}
