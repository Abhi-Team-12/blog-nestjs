import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from 'src/entities/verified-user.entity';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<{
        message: string;
        token: string;
    }>;
    verifyOtp(body: {
        token: string;
        otp: string;
    }): Promise<string>;
    resendOtp(body: {
        email: string;
    }): Promise<string>;
    login(credential: LoginUserDto): Promise<{
        message: string;
    }>;
    LoginverifyOtp(body: {
        token: string;
        otp: string;
    }): Promise<string>;
    findAll(): Promise<User[]>;
    findOne(id: string): Promise<import("../entities/user.entity").register_user | null>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<import("../entities/user.entity").register_user | null>;
    remove(id: string): Promise<void>;
}
