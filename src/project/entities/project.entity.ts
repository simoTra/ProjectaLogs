import { Client } from 'src/client/entities/client.entity';
import { PrimaryGeneratedColumn, Column, Entity, ManyToOne } from 'typeorm';

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
}
