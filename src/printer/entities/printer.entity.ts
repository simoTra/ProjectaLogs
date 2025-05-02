import { ApiProperty } from '@nestjs/swagger';
import { Job } from 'src/job/entities/job.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';


export class JobTotals {
  @ApiProperty({required: false})
  total_jobs: number;

  @ApiProperty({required: false})
  total_time: number;

  @ApiProperty({required: false})
  total_print_time: number;

  @ApiProperty({required: false})
  total_filament_used: number;

  @ApiProperty({required: false})
  longest_job: number;

  @ApiProperty({required: false})
  longest_print: number;
}

@Entity()
export class Printer {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column()
  @ApiProperty({ type: "string" })
  name: string;

  @Column({ nullable: true })
  @ApiProperty({ type: "string", required: false })
  ipAddress: string;

  @OneToMany(() => Job, (job) => job.printer, {
    cascade: false,
    nullable: true,
  })
  @ApiProperty({ type: () => [Job], required: false })
  jobs?: Job[];

  @Column('json', { nullable: true })
  @ApiProperty({
    type: JobTotals,
    required: false,
  })
  job_totals?: JobTotals;
}