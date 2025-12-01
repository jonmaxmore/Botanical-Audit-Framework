/* eslint-disable no-console */
export type Logger = {
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
};

const formatPrefix = (scope: string) => `[${scope}]`;

export const createLogger = (scope = 'frontend'): Logger => {
  const prefix = formatPrefix(scope);

  return {
    debug: (...args) => console.debug(prefix, ...args),
    info: (...args) => console.info(prefix, ...args),
    warn: (...args) => console.warn(prefix, ...args),
    error: (...args) => console.error(prefix, ...args)
  };
};

export const logger = createLogger('frontend');
