import { Job } from 'src/job/entities/job.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Printer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  ipAddress: string;

  @OneToMany(() => Job, (job) => job.printer, {
    cascade: false,
    nullable: true,
  })
  jobs?: Job[];

  @Column('json', { nullable: true })
  job_totals?: {
    total_jobs: number;
    total_time: number;
    total_print_time: number;
    total_filament_used: number;
    longest_job: number;
    longest_print: number;
  };
}