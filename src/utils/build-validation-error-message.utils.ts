import { ZodIssue } from "zod";

export function buildValidationErrorMessages(issues: ZodIssue[]): string[] {
    const errors = issues.map((issue) => `${issue.path}: ${issue.message}`);
    return errors;
}
