import { BadRequestException, HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { register_user } from 'src/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from 'src/entities/verified-user.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { OTPUser } from 'src/entities/otpuser.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  // Temporary OTP Store in Memory
  private otpStore: Record<string, { otp: string, expires: Date }> = {};
  constructor(
    // Registered User Repository
    @InjectRepository(register_user)
    private usersRepository: Repository<register_user>,
    // verifies User Repository
    @InjectRepository(User)
    private verifiedUserRepository: Repository<User>,
    // OTP Repository
    @InjectRepository(OTPUser)
    private OTPUserRepository: Repository<OTPUser>,
    // Use JWT Service for Tokenx 
    private jwtServices: JwtService,
    // Use MailerService for send mail
    private readonly mailerService: MailerService,
  ) { }
  // password hashing 
  private async hashPassword(password: string) {
    const saltOrRounds = 10;
    return await bcrypt.hash(password, saltOrRounds);
  }
  // Register User and Check alredy exist verified User
  async create(createUserDto: CreateUserDto) {
    // console.log(createUserDto);
    const hashedPassword = await this.hashPassword(String(createUserDto.password));
    const existingUser = await this.verifiedUserRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingUser) throw new UnauthorizedException('Email already in use.');
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 5); // OTP valid for 5 minutes
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
  async verifyOtp(token: string, otp: string): Promise<string> {
    if (!token) throw new UnauthorizedException("Tokennot Found");
    const decode_token = this.jwtServices.verify(token);
    // console.log(decode_token);
    const otp_id = decode_token.id;
    const findotp = await this.OTPUserRepository.findOne({ where: { otp_id } });
    const email = findotp?.user_email;
    // console.log({ otp_id, email });
    const user = await this.usersRepository.findOne({ where: { email } })
    if (!user) throw new UnauthorizedException('User not found.');
    if (user.isVerified) return 'User already verified.';
    if (user.otp !== otp) throw new UnauthorizedException('Invalid OTP.');
    if (user.otpExpiresAt && user.otpExpiresAt < new Date())
      throw new UnauthorizedException('OTP expired.');
    // User verified
    user.isVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;
    await this.usersRepository.save(user);
    // Save in VerifiedUser table
    await this.verifiedUserRepository.save({
      name: user.name,
      email: user.email,
      contact: user.contact,
      password: user.password,
    });
    return 'Email verified successfully!';
  }
  // ---------------- Resend OTP ----------------
  async resendOtp(email: string): Promise<string> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('User not found.');
    if (user.isVerified) return 'User already verified. Cannot resend OTP.';
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
  // ---------------- Login ----------------
  async login(credential: LoginUserDto) {
    const { email, password } = credential;
    const user = await this.verifiedUserRepository.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('Wrong Email');
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Wrong Password');
    const { token } = await this.ganerateTokens(user.id);
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 5 * 60 * 1000); // OTP Exprire Time => 5 Minutes
    this.otpStore[token] = { otp, expires };
    // call sent email otp function
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

  // Login Email OTP Verify Code
  async LoginverifyOtp(token: string, otp: string) {
    if (!token) throw new UnauthorizedException("Tokennot Found");
    const decode_token = this.jwtServices.verify(token);
    const userid = decode_token.id;
    const findotp = await this.verifiedUserRepository.findOne({ where: { id: userid } });
    const email = findotp?.email;
    const record = this.otpStore[token];
    const user = await this.verifiedUserRepository.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException("User not found.");
    if (!record) throw new BadRequestException("OTP not found. Request login again.");
    // check otp expire
    if (record.expires < new Date()) {
      delete this.otpStore[token];
      throw new BadRequestException("OTP expired. Request login again.");
    }
    // check otp vailied and in vailied
    if (record.otp !== otp) throw new BadRequestException("Invalid OTP.");
    // delete email otp
    delete this.otpStore[token];
    // Login successfully message
    return "User Login Successfully.";
  }

  async ganerateTokens(id) {
    const token = this.jwtServices.sign({ id }, { expiresIn: '10m' })
    return {
      token,
    }
  }
  // show all users code
  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }
  // show one user Code
  async findOne(id: number) {
    return await this.usersRepository.findOneBy({ id });
  }
  // update user details or data
  async update(id: number, updateUserDto: UpdateUserDto) {
    const hashedPassword = await this.hashPassword(updateUserDto.password);
    updateUserDto.password = hashedPassword;
    await this.usersRepository.update(id, updateUserDto);
    return this.findOne(id);
  }
  // delete user data or details
  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
