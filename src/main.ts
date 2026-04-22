import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();


// NestFactory.create(AppModule) 
//  Creates application context
// Scans all modules
// Resolves dependencies(DI container)
// Builds a dependency graph
// Starts HTTP server(Express / Fastify


//main.ts = entry point that bootstraps the entire app
