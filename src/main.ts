import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ 
    origin: [ 
      'https://maeum-reader.xyz',
      'http://localhost:3000',
    ], 
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE'
  });
  await app.listen(80); 
} 
bootstrap();
