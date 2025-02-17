import { PartialType } from '@nestjs/swagger';
import { CreatePrinterDto } from './create-printer.dto';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { Job } from 'src/job/entities/job.entity';

export class UpdatePrinterDto extends PartialType(CreatePrinterDto) {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  ipAddress: string;

  @IsOptional()
  @IsArray()
  jobs: Job[];
}
