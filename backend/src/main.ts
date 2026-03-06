import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 启用全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 自动剔除 DTO 中未定义的属性
      forbidNonWhitelisted: true, // 如果有未定义的属性，抛出错误
      transform: true, // 自动转换类型
    }),
  );

  // 配置静态文件服务
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // 启用跨域（开发环境允许 localhost，生产环境需要配置具体域名）
  app.enableCors({
    origin: process.env.NODE_ENV === 'production'
      ? ['https://your-frontend.com'] // 生产环境：只允许特定域名
      : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'], // 开发环境：允许前端开发服务器
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // 允许携带 cookie
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: http://localhost:${process.env.PORT ?? 3000}`);
  console.log(`Admin panel: http://localhost:${process.env.PORT ?? 3000}/login.html`);
}
bootstrap();
