import { Project } from 'src/project/entities/project.entity';
import { PrimaryGeneratedColumn, Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class Job {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'float', nullable: true })
  totalDuration: number;

  @Column({ type: 'float', nullable: true })
  filament: number;
  
  @Column({ nullable: true })
  filamentType: string;

  @ManyToOne(() => Project, (project) => project.jobs, { onDelete: 'CASCADE' })
  project: Project;
}
