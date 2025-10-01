import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  contact: string;

  @Column()
  password: string;

 @CreateDateColumn({ type: 'timestamp' })  // remove (6)
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })  // remove (6)
  updated_at: Date;
}