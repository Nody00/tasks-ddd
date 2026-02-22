import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TaskModule } from './tasks/task.module';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerBehindProxyGuard } from './shared/infrastructure/guards/throttler-behind-proxy.guard';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { PrismaModule } from './shared/infrastructure/database/prisma.module';
import { OutboxModule } from './shared/infrastructure/outbox/outbox.module';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        PrismaModule,
        TaskModule,
        OutboxModule,
        ThrottlerModule.forRoot({
            throttlers: [
                {
                    name: 'short',
                    ttl: 1000,
                    limit: 10,
                },
                {
                    name: 'long',
                    ttl: 60000,
                    limit: 100,
                },
            ],
            storage: new ThrottlerStorageRedisService(),
        }),
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: ThrottlerBehindProxyGuard,
        },
    ],
})
export class AppModule {}
