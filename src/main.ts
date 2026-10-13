import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, //automatically strips away any properties sent in the request payload that do not have validation decorators in the target DTO
      transform: true, //transforms the network payload into an actual typed instance of the DTO class.
      forbidNonWhitelisted: true, //this option tells the application to throw an HTTP 400 Bad Request error if any unauthorized fields are detected
    }),
  );

  await app.listen(process.env.PORT ?? 3004);

  console.log(`Application running on port ${process.env.PORT ?? 3004}`);
}
bootstrap();
console.log("ENV:", process.env.DATABASE_URL);

// NestFactory.create(AppModule) 
//  Creates application context
// Scans all modules
// Resolves dependencies(DI container)
// Builds a dependency graph
// Starts HTTP server(Express / Fastify


//main.ts = entry point that bootstraps the entire app
