import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';
import { setupApp } from './config/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  // Register the global exception filter to catch and log all failures
  const { AllExceptionsFilter } =
    await import('./common/filters/all-exceptions.filter');
  app.useGlobalFilters(new AllExceptionsFilter());

  setupApp(app);
  setupSwagger(app);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
