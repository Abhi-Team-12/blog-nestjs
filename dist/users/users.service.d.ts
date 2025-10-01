import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { register_user } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from 'src/entities/verified-user.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { OTPUser } from 'src/entities/otpuser.entity';
import { JwtService } from '@nestjs/jwt';
export declare class UsersService {
    private usersRepository;
    private verifiedUserRepository;
    private OTPUserRepository;
    private jwtServices;
    private readonly mailerService;
    private otpStore;
    constructor(usersRepository: Repository<register_user>, verifiedUserRepository: Repository<User>, OTPUserRepository: Repository<OTPUser>, jwtServices: JwtService, mailerService: MailerService);
    private hashPassword;
    create(createUserDto: CreateUserDto): Promise<{
        message: string;
        token: string;
    }>;
    verifyOtp(token: string, otp: string): Promise<string>;
    resendOtp(email: string): Promise<string>;
    login(credential: LoginUserDto): Promise<{
        message: string;
        token: string;
    }>;
    LoginverifyOtp(token: string, otp: string): Promise<string>;
    ganerateTokens(id: any): Promise<{
        token: string;
    }>;
    findAll(): Promise<User[]>;
    findOne(id: number): Promise<register_user | null>;
    update(id: number, updateUserDto: UpdateUserDto): Promise<register_user | null>;
    remove(id: number): Promise<void>;
}
