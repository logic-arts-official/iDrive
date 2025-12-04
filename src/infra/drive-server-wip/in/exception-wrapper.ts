import { addGeneralIssue } from '@/apps/main/background-processes/issues';
import { DriveServerWipError } from '../out/error.types';
import { fetchExceptionSchema, isAbortError, isNetworkConnectivityError, networkErrorIssue } from './helpers/error-helpers';
import { logger, TLoggerBody } from '@/apps/shared/logger/logger';
import { ipcRendererSyncEngine } from '@/apps/sync-engine/ipcRendererSyncEngine';

type TProps = {
  loggerBody: TLoggerBody;
  exc: unknown;
  retry: number;
};

export function exceptionWrapper({ loggerBody, exc, retry }: TProps) {
  const { excMessage, isAbort, isNetwork } = parseException({ exc });

  const loggedError = logger.error({
    ...loggerBody,
    msg: `${loggerBody.msg} was not successful`,
    retry,
    exc: excMessage,
  });

  switch (true) {
    case isNetwork:
      if (process.type === 'renderer') {
        ipcRendererSyncEngine.send('ADD_GENERAL_ISSUE', networkErrorIssue);
      } else {
        addGeneralIssue(networkErrorIssue);
      }

      return new DriveServerWipError('NETWORK', loggedError);
    case isAbort:
      return new DriveServerWipError('ABORTED', loggedError);
    default:
      return new DriveServerWipError('UNKNOWN', loggedError);
  }
}

function parseException({ exc }: { exc: unknown }) {
  const isAbort = isAbortError({ exc });
  const isNetwork = isNetworkConnectivityError({ exc });
  const isJsonParseError = isJsonParseException({ exc });
  const res = { isAbort, isNetwork, isJsonParseError };

  switch (true) {
    case isNetwork:
      return { ...res, excMessage: fetchExceptionSchema.safeParse(exc).data };
    case isAbort:
      return { ...res, excMessage: 'Aborted' };
    case isJsonParseError:
      // For JSON parse errors, provide more context
      return {
        ...res,
        excMessage: {
          error: 'JSON Parse Error',
          message: exc instanceof Error ? exc.message : String(exc),
          hint: 'The server may have returned HTML or another non-JSON response. Check the logs above for response details.',
        },
      };
    default:
      return { ...res, excMessage: exc };
  }
}

function isJsonParseException({ exc }: { exc: unknown }): boolean {
  if (exc instanceof SyntaxError) {
    const message = exc.message;
    // Common JSON parse error messages
    return (
      message.includes('Unexpected token') ||
      message.includes('JSON') ||
      message.includes('Unexpected end of JSON') ||
      message.includes('Unexpected string in JSON')
    );
  }
  return false;
}
