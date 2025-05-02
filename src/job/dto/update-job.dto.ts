import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateJobDto } from './create-job.dto';
import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class UpdateJobDto extends PartialType(CreateJobDto) {
    @IsOptional()
    @IsString()
    @ApiProperty({ type: "string", required: false })
    name?: string;

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
