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
}
