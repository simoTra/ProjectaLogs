import { Client } from 'src/client/entities/client.entity';
import { Job } from 'src/job/entities/job.entity';
import { PrimaryGeneratedColumn, Column, Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @ManyToOne(() => Client, (client) => client.projects, { onDelete: 'CASCADE' })
  client: Client;

  @OneToMany(() => Job, (job) => job.project)
  jobs: Job[];
}
