import {
    ConflictException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

    async register(dto: RegisterDto) {
        const email = dto.email.trim().toLowerCase();

        const existingUser = await this.prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (existingUser) {
            throw new ConflictException('Email is already registered');
        }

        const passwordHash = await bcrypt.hash(dto.password, 12);

        const user = await this.prisma.user.create({
            data: {
                name: dto.name.trim(),
                email,
                passwordHash,
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            },
        });

        const accessToken = await this.generateAccessToken(user.id, user.email);

        return {
            user,
            accessToken,
        };
    }

    async login(dto: LoginDto) {
        const email = dto.email.trim().toLowerCase();

        const user = await this.prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const passwordValid = await bcrypt.compare(
            dto.password,
            user.passwordHash,
        );

        if (!passwordValid) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const accessToken = await this.generateAccessToken(
            user.id,
            user.email,
        );

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
            accessToken,
        };
    }

    private async generateAccessToken(userId: number, email: string) {
        return this.jwtService.signAsync({
            sub: userId,
            email,
        });
    }
}