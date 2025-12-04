import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exceptionWrapper } from './exception-wrapper';
import { logger } from '@/apps/shared/logger/logger';

vi.mock('@/apps/shared/logger/logger', () => ({
  logger: {
    error: vi.fn((body) => body),
  },
}));

vi.mock('@/apps/main/background-processes/issues', () => ({
  addGeneralIssue: vi.fn(),
}));

describe('exceptionWrapper', () => {
  const loggerBody = { msg: 'Test request' };
  const retry = 1;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should detect JSON parse errors with "Unexpected token" message', () => {
    // Given
    const jsonParseError = new SyntaxError("Unexpected token '<', \"<!doctype\" is not valid JSON");

    // When
    const result = exceptionWrapper({ loggerBody, exc: jsonParseError, retry });

    // Then
    expect(result.code).toBe('UNKNOWN');
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        msg: 'Test request was not successful',
        retry: 1,
        exc: expect.objectContaining({
          error: 'JSON Parse Error',
          message: "Unexpected token '<', \"<!doctype\" is not valid JSON",
          hint: 'The server may have returned HTML or another non-JSON response. Check the logs above for response details.',
        }),
      }),
    );
  });

  it('should detect JSON parse errors with "JSON" in message', () => {
    // Given
    const jsonParseError = new SyntaxError('Unexpected end of JSON input');

    // When
    const result = exceptionWrapper({ loggerBody, exc: jsonParseError, retry });

    // Then
    expect(result.code).toBe('UNKNOWN');
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        exc: expect.objectContaining({
          error: 'JSON Parse Error',
        }),
      }),
    );
  });

  it('should handle non-JSON parse SyntaxErrors as unknown errors', () => {
    // Given
    const syntaxError = new SyntaxError('Some other syntax error');

    // When
    const result = exceptionWrapper({ loggerBody, exc: syntaxError, retry });

    // Then
    expect(result.code).toBe('UNKNOWN');
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        exc: syntaxError,
      }),
    );
  });

  it('should handle abort errors', () => {
    // Given
    const abortError = new DOMException('The operation was aborted', 'AbortError');

    // When
    const result = exceptionWrapper({ loggerBody, exc: abortError, retry });

    // Then
    expect(result.code).toBe('ABORTED');
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        exc: 'Aborted',
      }),
    );
  });
});
