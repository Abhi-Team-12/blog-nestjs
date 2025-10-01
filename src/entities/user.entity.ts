// user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('register_user')
export class register_user {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  contact: string;

  @Column()
  password: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  otp: string | null;

  @Column({ type: 'datetime', nullable: true })
  otpExpiresAt: Date | null;

  @Column({ default: false })
  isVerified: boolean;

  @CreateDateColumn({ type: 'timestamp' })  // remove (6)
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })  // remove (6)
  updated_at: Date;
}
