import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TaskModule } from './tasks/task.module';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
    imports: [
        TaskModule,
        ThrottlerModule.forRoot({
            throttlers: [
                {
                    name: 'short',
                    ttl: 100,
                    limit: 3,
                },
                {
                    name: 'long',
                    ttl: 60000,
                    limit: 100,
                },
            ],
        }),
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule {}
