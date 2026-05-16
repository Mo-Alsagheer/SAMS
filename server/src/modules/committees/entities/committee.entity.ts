import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CommitteeType } from '../enums/committee-type.enum';

@Entity('committees')
export class Committee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'enum', enum: CommitteeType })
  type: CommitteeType;

  @Column({ type: 'text', nullable: true })
  planID: string | null;

  @Column({ type: 'int', array: true, default: '{}' })
  directorIDs: number[];

  @Column({ type: 'int', default: 0 })
  membersCount: number;

  @Column({ type: 'text', nullable: true })
  whatsappGroupLink: string | null;

  @Column({ type: 'text', nullable: true })
  imageUrl: string | null;

  @Column({ type: 'int' })
  createdBy: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
