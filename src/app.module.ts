import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { register_user } from './entities/user.entity';
import { User } from './entities/verified-user.entity';
import { OTPUser } from './entities/otpuser.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from './config/config';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true, load: [config] }),
    JwtModule.registerAsync({ imports: [ConfigModule], useFactory: async (config) => ({ secret: config.get('jwt.secret'), }), global: true, inject: [ConfigService] }),
    UsersModule, TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? +process.env.DB_PORT : 3306,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [register_user, User, OTPUser],
      synchronize: true,
      autoLoadEntities: true,
    }),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'abhisheksingh.appworks@gmail.com',
          pass: 'dyzxohugzqjwqkun', // Gmail ke liye App Password use karein
        },
      },
      defaults: {
        from: '"This message send by Abhishek Singh" from AppWorks Technologies Pvt. Ltd.',
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
