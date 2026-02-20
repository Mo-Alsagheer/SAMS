import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CommitteesModule } from './committees/committees.module';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [AuthModule, UsersModule, CommitteesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
