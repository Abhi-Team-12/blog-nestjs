import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from 'src/entities/verified-user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post('signup')
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
  // Signup verify OTP Code
  @Post('verify-otp')
  async verifyOtp(@Body() body: { token: string; otp: string }): Promise<string> {
    return this.usersService.verifyOtp(body.token, body.otp);
  }
  // Signup resebd OTP Code
  @Post('resend-otp')
  async resendOtp(@Body() body: { email: string }): Promise<string> {
    return this.usersService.resendOtp(body.email);
  }
  // User Login Code
  @Post('login')
  async login(@Body() credential: LoginUserDto): Promise<{ message: string }> {
    return this.usersService.login(credential);
  }
  //  User login otp verify code
  @Post('Login-verify-otp')
  async LoginverifyOtp(@Body() body: { token: string; otp: string }) {
    const { token, otp } = body;
    return this.usersService.LoginverifyOtp(token, otp);
  }
  //  show all Users Data or details (All Users) 
  @Get('all')
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }
  // Get One User data or details (One Users)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }
  // Update User data and Details
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }
  // Delete User Data 
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
