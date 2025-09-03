import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty()
  id: number;

  @Column()
  @ApiProperty({ type: "string" })
  name: string;

  @Column({ nullable: true })
  @ApiProperty({ type: "string", required: false })
  description: string;

  @ManyToOne(() => Client, (client) => client.projects, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @ApiProperty({ type: () => Client, required: false })
  client: Client;

  @OneToMany(() => Job, (job) => job.project, { nullable: true })
  @ApiProperty({ type: () => [Job], required: false })
  jobs: Job[];
}
