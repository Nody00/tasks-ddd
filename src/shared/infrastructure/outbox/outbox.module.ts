import { Module } from '@nestjs/common';
import { KafkaModule } from '../kafka/kafka.module';
import { OutboxRelayService } from './outbox-relay.service';

@Module({
    imports: [KafkaModule],
    providers: [OutboxRelayService],
})
export class OutboxModule {}
