import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive, IsString, IsObject } from 'class-validator';

export class CreateJobDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ type: "string", required: false })
  name?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ type: "string", required: false })
  printer_id?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ type: "string", required: false })
  job_id?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ type: "string", required: false })
  filename?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ type: "string", required: false })
  status?: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ type: "number", required: false })
  start_time?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ type: "number", required: false })
  end_time?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ type: "number", required: false })
  print_duration?: number;
  
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @ApiProperty({ type: "number", required: false })
  total_duration?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ type: "number", required: false })
  filament_used?: number;
  
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @ApiProperty({ type: "number", required: false })
  filament?: number;
  
  @IsOptional()
  @IsString()
  @ApiProperty({ type: "string", required: false })
  filament_type?: string;
  
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @ApiProperty({ type: "number", required: false })
  projectId?: number;

  @IsOptional()
  @IsObject()
  @ApiProperty({ required: false })
  metadata?: any;
}
