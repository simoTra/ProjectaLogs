import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateJobDto {
  @IsString()
  @ApiProperty({ type: "string" })
  name: string;
  
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @ApiProperty({ type: "number", required: false })
  total_duration?: number;
  
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
}
