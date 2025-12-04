import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logger } from '../logger/logger';

// Mock dependencies
vi.mock('../logger/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

vi.mock('../../sync-engine/config', () => ({
  getConfig: vi.fn(() => ({ workspaceToken: undefined })),
}));

vi.mock('@/apps/main/auth/headers', () => ({
  getAuthHeaders: vi.fn(() => ({})),
}));

vi.mock('@/apps/main/event-bus', () => ({
  default: {
    emit: vi.fn(),
  },
}));

describe('HttpClient middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('onResponse middleware', () => {
    it('should log non-JSON error responses', async () => {
      // Given
      const response = new Response('<!doctype html><html>Error page</html>', {
        status: 500,
        statusText: 'Internal Server Error',
        headers: {
          'content-type': 'text/html',
          'x-custom-header': 'test-value',
        },
      });

      const schemaPath = '/users/refresh';

      // Import the client to get the middleware
      const { client } = await import('./client');
      const middleware = (client as any).middlewares?.[0];

      // When
      if (middleware?.onResponse) {
        await middleware.onResponse({ response, schemaPath, options: {}, id: 'test' });
      }

      // Then
      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: 'Unexpected response content type',
          endpoint: schemaPath,
          status: 500,
          statusText: 'Internal Server Error',
          contentType: 'text/html',
          responseHeaders: expect.objectContaining({
            'content-type': 'text/html',
            'x-custom-header': 'test-value',
          }),
          responseBody: expect.stringContaining('<!doctype html>'),
        }),
      );
    });

    it('should log non-JSON successful responses', async () => {
      // Given
      const response = new Response('Some text response', {
        status: 200,
        statusText: 'OK',
        headers: {
          'content-type': 'text/plain',
        },
      });

      const schemaPath = '/some/endpoint';

      // Import the client to get the middleware
      const { client } = await import('./client');
      const middleware = (client as any).middlewares?.[0];

      // When
      if (middleware?.onResponse) {
        await middleware.onResponse({ response, schemaPath, options: {}, id: 'test' });
      }

      // Then
      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: 'Unexpected response content type',
          contentType: 'text/plain',
          status: 200,
        }),
      );
    });

    it('should not log JSON responses', async () => {
      // Given
      const response = new Response('{"data": "test"}', {
        status: 200,
        statusText: 'OK',
        headers: {
          'content-type': 'application/json',
        },
      });

      const schemaPath = '/users/refresh';

      // Import the client to get the middleware
      const { client } = await import('./client');
      const middleware = (client as any).middlewares?.[0];

      // When
      if (middleware?.onResponse) {
        await middleware.onResponse({ response, schemaPath, options: {}, id: 'test' });
      }

      // Then
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('should not log empty responses (204)', async () => {
      // Given
      const response = new Response(null, {
        status: 204,
        statusText: 'No Content',
        headers: {
          'content-type': 'text/plain',
        },
      });

      const schemaPath = '/users/refresh';

      // Import the client to get the middleware
      const { client } = await import('./client');
      const middleware = (client as any).middlewares?.[0];

      // When
      if (middleware?.onResponse) {
        await middleware.onResponse({ response, schemaPath, options: {}, id: 'test' });
      }

      // Then
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('should not log responses with Content-Length: 0', async () => {
      // Given
      const response = new Response(null, {
        status: 200,
        statusText: 'OK',
        headers: {
          'content-type': 'text/plain',
          'content-length': '0',
        },
      });

      const schemaPath = '/users/refresh';

      // Import the client to get the middleware
      const { client } = await import('./client');
      const middleware = (client as any).middlewares?.[0];

      // When
      if (middleware?.onResponse) {
        await middleware.onResponse({ response, schemaPath, options: {}, id: 'test' });
      }

      // Then
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('should handle errors when reading response body', async () => {
      // Given
      const mockResponse = {
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Headers({ 'content-type': 'text/html' }),
        clone: vi.fn(() => ({
          text: vi.fn().mockRejectedValue(new Error('Failed to read body')),
        })),
      } as any;

      const schemaPath = '/users/refresh';

      // Import the client to get the middleware
      const { client } = await import('./client');
      const middleware = (client as any).middlewares?.[0];

      // When
      if (middleware?.onResponse) {
        await middleware.onResponse({ response: mockResponse, schemaPath, options: {}, id: 'test' });
      }

      // Then
      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: 'Failed to read response body for logging',
          endpoint: schemaPath,
          error: expect.any(Error),
        }),
      );
    });
  });
});
