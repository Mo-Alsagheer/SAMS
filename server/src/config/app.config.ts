import { INestApplication, ValidationPipe } from '@nestjs/common';

export function setupApp(app: INestApplication): void {
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      // Convert empty strings to undefined so @IsOptional() skips them.
      // This is essential for multipart/form-data where omitted fields
      // arrive as empty strings instead of undefined.
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
}
