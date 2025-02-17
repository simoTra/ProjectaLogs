import { Project } from 'src/project/entities/project.entity';
import { PrimaryGeneratedColumn, Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Project, (project) => project.client, {
    cascade: false,
    nullable: true,
  })
  projects?: Project[];
}
