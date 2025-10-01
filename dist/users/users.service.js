"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const user_entity_1 = require("../entities/user.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const mailer_1 = require("@nestjs-modules/mailer");
const verified_user_entity_1 = require("../entities/verified-user.entity");
const otpuser_entity_1 = require("../entities/otpuser.entity");
const jwt_1 = require("@nestjs/jwt");
let UsersService = class UsersService {
    usersRepository;
    verifiedUserRepository;
    OTPUserRepository;
    jwtServices;
    mailerService;
    otpStore = {};
    constructor(usersRepository, verifiedUserRepository, OTPUserRepository, jwtServices, mailerService) {
        this.usersRepository = usersRepository;
        this.verifiedUserRepository = verifiedUserRepository;
        this.OTPUserRepository = OTPUserRepository;
        this.jwtServices = jwtServices;
        this.mailerService = mailerService;
    }
    async hashPassword(password) {
        const saltOrRounds = 10;
        return await bcrypt.hash(password, saltOrRounds);
    }
    async create(createUserDto) {
        const hashedPassword = await this.hashPassword(String(createUserDto.password));
        const existingUser = await this.verifiedUserRepository.findOne({
            where: { email: createUserDto.email },
        });
        if (existingUser)
            throw new common_1.UnauthorizedException('Email already in use.');
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date();
        otpExpiry.setMinutes(otpExpiry.getMinutes() + 5);
        const user = await this.usersRepository.save({
            ...createUserDto,
            password: hashedPassword,
            otp,
            otpExpiresAt: otpExpiry,
            isVerified: false,
        });
        const otp_logs = await this.OTPUserRepository.save({
            user_id: user.id,
            user_email: user.email,
            user_contact: user.contact,
            otp,
        });
        await this.mailerService.sendMail({
            from: '"This message send by Abhishek Singh" from AppWorks Technologies Pvt. Ltd.',
            to: user.email,
            subject: 'Your Account Verification OTP',
            text: `Your Account Verifaction OTP is ${otp}. It is valid for 5 minutes only for account verification.`,
        });
        const { token } = await this.ganerateTokens(otp_logs.otp_id);
        return {
            message: "Your Account Verifaction OTP Send Successfully. You have received an OTP from abhisheksingh.appworks@gmail.com",
            token: token
        };
    }
    async verifyOtp(token, otp) {
        if (!token)
            throw new common_1.UnauthorizedException("Tokennot Found");
        const decode_token = this.jwtServices.verify(token);
        const otp_id = decode_token.id;
        const findotp = await this.OTPUserRepository.findOne({ where: { otp_id } });
        const email = findotp?.user_email;
        const user = await this.usersRepository.findOne({ where: { email } });
        if (!user)
            throw new common_1.UnauthorizedException('User not found.');
        if (user.isVerified)
            return 'User already verified.';
        if (user.otp !== otp)
            throw new common_1.UnauthorizedException('Invalid OTP.');
        if (user.otpExpiresAt && user.otpExpiresAt < new Date())
            throw new common_1.UnauthorizedException('OTP expired.');
        user.isVerified = true;
        user.otp = null;
        user.otpExpiresAt = null;
        await this.usersRepository.save(user);
        await this.verifiedUserRepository.save({
            name: user.name,
            email: user.email,
            contact: user.contact,
            password: user.password,
        });
        return 'Email verified successfully!';
    }
    async resendOtp(email) {
        const user = await this.usersRepository.findOne({ where: { email } });
        if (!user)
            throw new common_1.UnauthorizedException('User not found.');
        if (user.isVerified)
            return 'User already verified. Cannot resend OTP.';
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const newExpiry = new Date();
        newExpiry.setMinutes(newExpiry.getMinutes() + 5);
        user.otp = newOtp;
        user.otpExpiresAt = newExpiry;
        await this.usersRepository.save(user);
        await this.OTPUserRepository.save({ user_id: user.id, otp: user.otp });
        await this.mailerService.sendMail({
            from: '"This message send by Abhishek Singh" from AppWorks Technologies Pvt. Ltd.',
            to: user.email,
            subject: 'Resend Your Account Verification OTP',
            text: `Resend Your Account Verifaction OTP is ${newOtp}. It is valid for 5 minutes only for account verification.`,
        });
        return 'A new OTP has been sent to your email.';
    }
    async login(credential) {
        const { email, password } = credential;
        const user = await this.verifiedUserRepository.findOne({ where: { email } });
        if (!user)
            throw new common_1.UnauthorizedException('Wrong Email');
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch)
            throw new common_1.UnauthorizedException('Wrong Password');
        const { token } = await this.ganerateTokens(user.id);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 5 * 60 * 1000);
        this.otpStore[token] = { otp, expires };
        await this.mailerService.sendMail({
            from: '"This message send by Abhishek Singh" from AppWorks Technologies Pvt. Ltd.',
            to: user.email,
            subject: 'Your Account Login OTP',
            text: `Your Account LOgin OTP is ${otp}. It is valid for 5 minutes only for Account Login.`,
        });
        return {
            message: "Your Account Login OTP Send Successfully. You have received an OTP from abhisheksingh.appworks@gmail.com",
            token: token
        };
    }
    async LoginverifyOtp(token, otp) {
        if (!token)
            throw new common_1.UnauthorizedException("Tokennot Found");
        const decode_token = this.jwtServices.verify(token);
        const userid = decode_token.id;
        const findotp = await this.verifiedUserRepository.findOne({ where: { id: userid } });
        const email = findotp?.email;
        const record = this.otpStore[token];
        const user = await this.verifiedUserRepository.findOne({ where: { email } });
        if (!user)
            throw new common_1.UnauthorizedException("User not found.");
        if (!record)
            throw new common_1.BadRequestException("OTP not found. Request login again.");
        if (record.expires < new Date()) {
            delete this.otpStore[token];
            throw new common_1.BadRequestException("OTP expired. Request login again.");
        }
        if (record.otp !== otp)
            throw new common_1.BadRequestException("Invalid OTP.");
        delete this.otpStore[token];
        return "User Login Successfully.";
    }
    async ganerateTokens(id) {
        const token = this.jwtServices.sign({ id }, { expiresIn: '10m' });
        return {
            token,
        };
    }
    async findAll() {
        return await this.usersRepository.find();
    }
    async findOne(id) {
        return await this.usersRepository.findOneBy({ id });
    }
    async update(id, updateUserDto) {
        const hashedPassword = await this.hashPassword(updateUserDto.password);
        updateUserDto.password = hashedPassword;
        await this.usersRepository.update(id, updateUserDto);
        return this.findOne(id);
    }
    async remove(id) {
        await this.usersRepository.delete(id);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.register_user)),
    __param(1, (0, typeorm_1.InjectRepository)(verified_user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(otpuser_entity_1.OTPUser)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService,
        mailer_1.MailerService])
], UsersService);
//# sourceMappingURL=users.service.js.map