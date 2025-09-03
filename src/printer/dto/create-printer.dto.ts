import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Job } from 'src/job/entities/job.entity';

export class CreatePrinterDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: "string" })
  name: string;
  
  @IsOptional()
  @IsString()
  @ApiProperty({ type: "string", required: false })
  ipAddress: string;

  @IsOptional()
  @IsArray()
  @ApiProperty({ type: [Job], required: false })
  jobs: Job[];
}
