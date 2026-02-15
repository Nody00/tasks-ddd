import { DomainErrorCode } from '../constants/domain-error-codes';

export abstract class DomainException extends Error {
    abstract readonly code: DomainErrorCode;

    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
    }
}
