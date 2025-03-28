import { ValidationError } from 'class-validator';

export function flattenValidationErrors(
  error: ValidationError,
  parentPath = '',
): string[] {
  const propertyPath = parentPath
    ? `${parentPath}.${error.property}`
    : error.property;

  if (error.children && error.children.length) {
    return error.children.flatMap((child) =>
      flattenValidationErrors(child, propertyPath),
    );
  }

  return error.constraints ? Object.values(error.constraints) : [];
}
