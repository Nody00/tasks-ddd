import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
    protected getTracker(req: Record<string, any>): Promise<string> {
        const request = req as Request;
        return Promise.resolve(
            request.ips.length > 0 ? request.ips[0] : (request.ip ?? ''),
        );
    }
}
