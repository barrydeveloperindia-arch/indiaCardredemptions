import { validatePdfPayload } from '../utils/pdfSanitizer';

describe('PDF Sandbox & Security Sanitization', () => {
  it('should validate a clean PDF under 2MB with correct PDF signature', () => {
    const fileInput = {
      name: 'statement.pdf',
      size: 1.5 * 1024 * 1024, // 1.5 MB
      contentBase64: 'JVBERi0xLjQKJSDi48VMDFg...',
    };

    const result = validatePdfPayload(fileInput);
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should reject files exceeding the 2MB size limit', () => {
    const fileInput = {
      name: 'huge_statement.pdf',
      size: 2.1 * 1024 * 1024, // 2.1 MB
      contentBase64: 'JVBERi0xLjQKJSDi48VMDFg...',
    };

    const result = validatePdfPayload(fileInput);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('size exceeds 2MB');
  });

  it('should reject files with invalid magic bytes (e.g. executables or images)', () => {
    const fileInput = {
      name: 'malicious.pdf',
      size: 500 * 1024, // 500 KB
      contentBase64: 'UEsDBBQAAAAIAAAAAAD...', // ZIP file signature (PK...)
    };

    const result = validatePdfPayload(fileInput);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('magic bytes');
  });

  it('should reject inputs with missing content or metadata parameters', () => {
    expect(validatePdfPayload({ name: 'empty.pdf', size: 0 }).isValid).toBe(false);
    expect(validatePdfPayload({ name: '', size: 100, contentBase64: 'JVBERiA=' }).isValid).toBe(false);
  });

  it('should reject inputs where contentBase64 is whitespace only', () => {
    const fileInput = {
      name: 'whitespace.pdf',
      size: 100,
      contentBase64: '   ',
    };
    const result = validatePdfPayload(fileInput);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('content is empty');
  });
});
