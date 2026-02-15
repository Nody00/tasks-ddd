import { DomainErrorCode } from 'src/shared/domain/constants/domain-error-codes';
import { DomainException } from 'src/shared/domain/exceptions/domain.exception';

export class InvalidStatusTransitionException extends DomainException {
    readonly code = DomainErrorCode.INVALID_OPERATION;

    constructor(fromStatus: string, toStatus: string) {
        super(`Invalid status transition from ${fromStatus} to ${toStatus}`);
        this.name = 'InvalidStatusTransitionException';
    }
}
