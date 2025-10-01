"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const users_module_1 = require("./users/users.module");
const user_entity_1 = require("./entities/user.entity");
const verified_user_entity_1 = require("./entities/verified-user.entity");
const otpuser_entity_1 = require("./entities/otpuser.entity");
const typeorm_1 = require("@nestjs/typeorm");
const mailer_1 = require("@nestjs-modules/mailer");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const config_2 = __importDefault(require("./config/config"));
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true, cache: true, load: [config_2.default] }),
            jwt_1.JwtModule.registerAsync({ imports: [config_1.ConfigModule], useFactory: async (config) => ({ secret: config.get('jwt.secret'), }), global: true, inject: [config_1.ConfigService] }),
            users_module_1.UsersModule, typeorm_1.TypeOrmModule.forRoot({
                type: 'mysql',
                host: process.env.DB_HOST,
                port: process.env.DB_PORT ? +process.env.DB_PORT : 23093,
                username: process.env.DB_USER,
                password: process.env.DB_PASS,
                database: process.env.DB_NAME,
                entities: [user_entity_1.register_user, verified_user_entity_1.User, otpuser_entity_1.OTPUser],
                synchronize: true,
                autoLoadEntities: true,
                ssl: {
                    rejectUnauthorized: false,
                },
            }),
            mailer_1.MailerModule.forRoot({
                transport: {
                    host: 'smtp.gmail.com',
                    port: 587,
                    secure: false,
                    auth: {
                        user: 'abhisheksingh.appworks@gmail.com',
                        pass: 'dyzxohugzqjwqkun',
                    },
                },
                defaults: {
                    from: '"This message send by Abhishek Singh" from AppWorks Technologies Pvt. Ltd.',
                },
            }),
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map