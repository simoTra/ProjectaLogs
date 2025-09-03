import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreatePrinterDto } from './create-printer.dto';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { Job } from 'src/job/entities/job.entity';

export class UpdatePrinterDto extends PartialType(CreatePrinterDto) {
  @IsOptional()
  @IsString()
  @ApiProperty({ type: "string", required: false })
  name?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ type: "string", required: false })
  ipAddress: string;

  @IsOptional()
  @IsArray()
  @ApiProperty({ type: [Job], required: false })
  jobs: Job[];
}
