import { Printer } from 'src/printer/entities/printer.entity';
import { Project } from 'src/project/entities/project.entity';
import { PrimaryGeneratedColumn, Column, Entity, ManyToOne } from 'typeorm';
@Entity()
export class Job {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  jobId: string;
  @Column({ nullable: true }) user: string;
  @Column({ nullable: true }) filename: string;
  @Column({ nullable: true }) status: string;
  @Column({ type: 'float', nullable: true }) start_time: number;
  @Column({ type: 'float', nullable: true }) end_time: number;
  @Column({ type: 'float', nullable: true }) print_duration: number;
  @Column({ type: 'float', nullable: true }) total_duration: number;
  @Column({ type: 'float', nullable: true }) filament_used: number;
  @Column('simple-json', { nullable: true }) metadata: {
    size: number;
    modified: number;
    uuid: string;
    slicer: string;
    slicerVersion: string;
    gcodeStartByte: number;
    gcodeEndByte: number;
    layerCount: number;
    objectHeight: number;
    estimatedTime: number;
    nozzleDiameter: number;
    layerHeight: number;
    firstLayerHeight: number;
    firstLayerExtrTemp: number;
    firstLayerBedTemp: number;
    chamberTemp: number;
    filamentName: string;
    filamentType: string;
    filamentTotal: number;
    filamentWeightTotal: number;
    thumbnails: {
      width: number;
      height: number;
      size: number;
      relativePath: string;
    }[];
  };

  @Column('simple-json', { nullable: true }) auxiliaryData: {
    provider: string;
    name: string;
    value: number[];
    description: string;
    units: string | null;
  }[];

  @Column({ nullable: true }) exists: boolean;
  @ManyToOne(() => Project, (project) => project.jobs, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  project: Project;

  @ManyToOne(() => Printer, (printer) => printer.jobs, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  printer: Printer;
}
