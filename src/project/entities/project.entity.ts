import { Client } from 'src/client/entities/client.entity';
import { Job } from 'src/job/entities/job.entity';
import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => Client, (client) => client.projects, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  client: Client;

  @OneToMany(() => Job, (job) => job.project, { nullable: true })
  jobs: Job[];
}
