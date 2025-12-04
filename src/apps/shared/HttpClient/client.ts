import createClient, { Middleware } from 'openapi-fetch';
import { paths } from './schema';
import { getConfig } from '../../sync-engine/config';
import { ipcRendererSyncEngine } from '../../sync-engine/ipcRendererSyncEngine';
import eventBus from '@/apps/main/event-bus';
import { getAuthHeaders } from '@/apps/main/auth/headers';
import { scheduleFetch } from './schedule-fetch';
import { logger } from '../logger/logger';

const MAX_RESPONSE_BODY_LOG_LENGTH = 500;

export const getHeaders = async () => {
  if (process.type === 'renderer') return await ipcRendererSyncEngine.invoke('GET_HEADERS');
  return getAuthHeaders();
};

export const getWorkspaceHeader = ({ workspaceToken }: { workspaceToken: string }) => {
  return { 'x-internxt-workspace': workspaceToken };
};

const handleOnUserUnauthorized = () => {
  if (process.type === 'renderer') {
    ipcRendererSyncEngine.emit('USER_LOGGED_OUT');
  } else {
    eventBus.emit('USER_LOGGED_OUT');
  }
};

const middleware: Middleware = {
  async onRequest({ request }) {
    const headers = await getHeaders();

    const workspaceToken = getConfig().workspaceToken;
    if (workspaceToken) {
      headers['x-internxt-workspace'] = workspaceToken;
    }

    Object.entries(headers).forEach(([key, value]) => {
      request.headers.set(key, value);
    });

    return request;
  },
  async onResponse({ response, schemaPath }) {
    if (response.status === 401) {
      handleOnUserUnauthorized();
    }

    // Check for non-JSON responses that might cause parsing errors
    const contentType = response.headers.get('content-type');
    const isJsonContentType = contentType?.includes('application/json');
    const isEmptyResponse = response.status === 204 || response.headers.get('Content-Length') === '0';

    // Log detailed response information for non-JSON responses that will be parsed as JSON
    // This catches both error responses and successful responses with wrong content-type
    const shouldLogResponse = !isEmptyResponse && !isJsonContentType;

    if (shouldLogResponse) {
      // Clone the response so we can read the body without consuming it
      const clonedResponse = response.clone();

      try {
        const responseBody = await clonedResponse.text();

        // Log the response headers
        const responseHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });

        logger.error({
          msg: 'Unexpected response content type',
          endpoint: schemaPath,
          status: response.status,
          statusText: response.statusText,
          contentType,
          responseHeaders,
          responseBody: responseBody.substring(0, MAX_RESPONSE_BODY_LOG_LENGTH),
        });
      } catch (error) {
        logger.error({
          msg: 'Failed to read response body for logging',
          endpoint: schemaPath,
          error,
        });
      }
    }

    return undefined;
  },
};

export const client = createClient<paths>({
  baseUrl: process.env.DRIVE_URL,
  fetch: scheduleFetch,
});

client.use(middleware);
