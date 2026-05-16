import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { CommitteesModule } from './modules/committees/committees.module';
import { UsersModule } from './modules/users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RecruitmentModule } from './modules/recruitment/recruitment.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { AiModule } from './integrations/ai-service/ai.module';
import { QuizModule } from './modules/quiz/quiz.module';
import { DirectorModule } from './modules/director/director.module';
import { ExecutiveModule } from './modules/executive/executive.module';
import { RoadmapModule } from './modules/roadmap/roadmap.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { AttendaceModule } from './modules/attendace/attendace.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: true, // disable in production
      }),
    }),
    AuthModule,
    UsersModule,
    CommitteesModule,
    RecruitmentModule,
    ApplicationsModule,
    AiModule,
    QuizModule,
    DirectorModule,
    ExecutiveModule,
    RoadmapModule,
    SessionsModule,
    AttendaceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
