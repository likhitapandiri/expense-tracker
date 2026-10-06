import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly prisma: PrismaService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), //Find the JWT in the Authorization header as a Bearer token.
            secretOrKey: process.env.JWT_SECRET!,
        });
    }

    async validate(payload: { sub: number; email: string }) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: payload.sub,
            },
            select: {
                id: true,
                name: true,
                email: true,
            },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return user;
    }
}


