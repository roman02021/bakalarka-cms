import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Attribute } from '../types/attribute';

@Entity('routes')
@Unique(['name', 'pluralName'])
export class Route {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'plural_name' })
  pluralName: string;

  @Column({ name: 'created_by' })
  createdBy: number;

  @Column({ name: 'number' })
  changedBy: number;

  @CreateDateColumn({
    type: 'timestamptz',
    precision: 3,
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    precision: 3,
    name: 'updated_at',
  })
  updatedAt: Date;

  @Column({ type: 'json' })
  attributes: Attribute[];
}
