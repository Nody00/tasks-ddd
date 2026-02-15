export const DomainErrorCode = {
    NOT_FOUND: 'NOT_FOUND',
    INVALID_OPERATION: 'INVALID_OPERATION',
} as const;

export type DomainErrorCode =
    (typeof DomainErrorCode)[keyof typeof DomainErrorCode];
