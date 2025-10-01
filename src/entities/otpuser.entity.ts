import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ForeignKey } from 'typeorm';

@Entity('otp_logs')
export class OTPUser {
  @PrimaryGeneratedColumn()
  otp_id: number;

  @Column()
  user_id: number;
  
  @Column()
  user_email:string;

  @Column()
  user_contact:string;

  @Column()
  otp: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  verified_at: Date;
}
