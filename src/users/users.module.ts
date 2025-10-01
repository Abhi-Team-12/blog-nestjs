import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { register_user } from 'src/entities/user.entity';
import { User} from 'src/entities/verified-user.entity';
import { OTPUser } from 'src/entities/otpuser.entity';


@Module({
  imports: [TypeOrmModule.forFeature([register_user, User, OTPUser])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
