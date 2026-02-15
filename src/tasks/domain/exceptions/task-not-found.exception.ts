import { DomainErrorCode } from 'src/shared/domain/constants/domain-error-codes';
import { DomainException } from 'src/shared/domain/exceptions/domain.exception';

export class TaskNotFoundException extends DomainException {
    readonly code = DomainErrorCode.NOT_FOUND;

    constructor(id: string) {
        super(`Task with id ${id} not found`);
        this.name = 'TaskNotFoundException';
    }
}
