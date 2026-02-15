import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainErrorCode } from 'src/shared/domain/constants/domain-error-codes';
import { DomainException } from 'src/shared/domain/exceptions/domain.exception';

const CODE_TO_STATUS: Record<DomainErrorCode, HttpStatus> = {
    [DomainErrorCode.NOT_FOUND]: HttpStatus.NOT_FOUND,
    [DomainErrorCode.INVALID_OPERATION]: HttpStatus.BAD_REQUEST,
};

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
    catch(exception: DomainException, host: ArgumentsHost) {
        const response = host.switchToHttp().getResponse<Response>();
        const statusCode =
            CODE_TO_STATUS[exception.code] ?? HttpStatus.INTERNAL_SERVER_ERROR;

        response.status(statusCode).json({
            statusCode,
            message: exception.message,
            error: exception.code,
        });
    }
}
