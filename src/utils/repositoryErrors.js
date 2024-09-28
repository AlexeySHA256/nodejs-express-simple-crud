export class RepositoryError extends Error {}

export class UniqueViolationError extends RepositoryError {}

export class NotFoundError extends RepositoryError {}