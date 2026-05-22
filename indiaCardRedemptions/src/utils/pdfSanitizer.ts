export interface FileInput {
  name: string;
  size: number;
  contentBase64?: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates a PDF statement upload for size and magic-byte signature rules.
 * Enforces sandboxing security checks before passing the file data to the parser.
 * 
 * @param file The file metadata and contents payload
 * @returns The validation result (isValid status and optional error explanation)
 */
export function validatePdfPayload(file: FileInput): ValidationResult {
  if (!file.name) {
    return { isValid: false, error: 'File name is missing' };
  }

  if (file.size <= 0) {
    return { isValid: false, error: 'File size is empty or invalid' };
  }

  if (file.size > 2 * 1024 * 1024) {
    return { isValid: false, error: 'File size exceeds 2MB limit' };
  }

  if (!file.contentBase64 || file.contentBase64.trim() === '') {
    return { isValid: false, error: 'File content is empty' };
  }

  // PDF files must start with the %PDF header (base64 representation starts with JVBER)
  if (!file.contentBase64.startsWith('JVBER')) {
    return { isValid: false, error: 'Invalid file signature (magic bytes mismatch)' };
  }

  return { isValid: true };
}
