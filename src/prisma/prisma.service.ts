import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client/extension';

@Injectable()
export class PrismaService extends PrismaClient{}
//“Create a NestJS service that internally is a PrismaClient”
// NestJS starts
//    ↓
// Creates PrismaService
//    ↓
// PrismaService extends PrismaClient
//    ↓
// PrismaClient constructor runs
//    ↓
// DB connection is created