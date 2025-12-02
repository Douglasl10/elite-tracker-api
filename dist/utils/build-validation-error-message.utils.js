"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildValidationErrorMessages = buildValidationErrorMessages;
function buildValidationErrorMessages(issues) {
    const errors = issues.map((issue) => `${issue.path}: ${issue.message}`);
    return errors;
}
