import { ApiProperty } from '@nestjs/swagger';
import { Printer } from 'src/printer/entities/printer.entity';
import { Project } from 'src/project/entities/project.entity';
import { PrimaryGeneratedColumn, Column, Entity, ManyToOne } from 'typeorm';

export class Thumbnail {
  @ApiProperty({required: false}) width: number;
  @ApiProperty({required: false}) height: number;
  @ApiProperty({required: false}) size: number;
  @ApiProperty({required: false}) relativePath: string;
}

export class Metadata {
  @ApiProperty({required: false}) size: number;
  @ApiProperty({required: false}) modified: number;
  @ApiProperty({required: false}) uuid: string;
  @ApiProperty({required: false}) slicer: string;
  @ApiProperty({required: false}) slicer_version: string;
  @ApiProperty({required: false}) gcode_start_byte: number;
  @ApiProperty({required: false}) gcode_end_byte: number;
  @ApiProperty({required: false}) layer_count: number;
  @ApiProperty({required: false}) object_height: number;
  @ApiProperty({required: false}) estimated_time: number;
  @ApiProperty({required: false}) nozzle_diameter: number;
  @ApiProperty({required: false}) layer_height: number;
  @ApiProperty({required: false}) first_layer_height: number;
  @ApiProperty({required: false}) first_layer_extr_temp: number;
  @ApiProperty({required: false}) first_layer_bed_temp: number;
  @ApiProperty({required: false}) chamber_temp: number;
  @ApiProperty({required: false}) filament_name: string;
  @ApiProperty({required: false}) filament_type: string;
  @ApiProperty({required: false}) filament_total: number;
  @ApiProperty({required: false}) filament_weight_total: number;
  @ApiProperty({ type: () => [Thumbnail], required: false }) thumbnails: Thumbnail[];
}

export class AuxiliaryData {
  @ApiProperty({required: false}) provider: string;
  @ApiProperty({required: false}) name: string;
  @ApiProperty({ type: () => [Number], required: false }) value: number[];
  @ApiProperty({required: false}) description: string;
  @ApiProperty({ type: String, required: false }) units: string | null;
}

@Entity()
export class Job {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ nullable: true })
  @ApiProperty({ type: 'string', required: false })
  job_id: string;

  @Column({ nullable: true })
  @ApiProperty({ type: 'string', required: false })
  user: string;

  @Column({ nullable: true })
  @ApiProperty({ type: 'string', required: false })
  filename: string;

  @Column({ nullable: true })
  @ApiProperty({ type: 'string', required: false })
  status: string;

  @Column({ type: 'float', nullable: true })
  @ApiProperty({ type: 'number', required: false })

  start_time: number;

  @Column({ type: 'float', nullable: true })
  @ApiProperty({ type: 'number', required: false })

  end_time: number;

  @Column({ type: 'float', nullable: true })
  @ApiProperty({ type: 'number', required: false })

  print_duration: number;

  @Column({ type: 'float', nullable: true })
  @ApiProperty({ type: 'number', required: false })

  total_duration: number;

  @Column({ type: 'float', nullable: true })
  @ApiProperty({ type: 'number', required: false })

  filament_used: number;

  @Column('simple-json', { nullable: true })
  @ApiProperty({ type: () => Metadata, required: false })
  metadata: Metadata;


  @Column('simple-json', { nullable: true })
  @ApiProperty({ type: () => [AuxiliaryData], required: false })
  auxiliaryData: AuxiliaryData[];


  @Column({ nullable: true })
  @ApiProperty({ type: 'boolean', required: false })
  exists: boolean;

  @ManyToOne(() => Project, (project) => project.jobs, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @ApiProperty({ type: () => Project, required: false })
  project: Project;


  @ManyToOne(() => Printer, (printer) => printer.jobs, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @ApiProperty({ type: () => Printer, required: false })
  printer: Printer;

}
